"use client";

import { useEffect, useRef } from "react";
import type { CSSProperties } from "react";
import { KEYS, keyBox } from "./keys";
import { LESSONS, type Lesson } from "./use-lesson";
import styles from "./learn.module.css";

/** Beats of music visible above the keys. */
const LOOKAHEAD = 5;

const duration = (beats: number, bpm: number) => {
  const sec = Math.round((beats * 60) / bpm);
  return `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, "0")}`;
};

/** The settings strip's opening button. */
export function LearnButton({ lesson }: { lesson: Lesson }) {
  return (
    <button type="button" className={styles.cta} onClick={lesson.openList}>
      Learn
    </button>
  );
}

/** Replaces the settings strip while a lesson runs. */
export function LessonBar({ lesson }: { lesson: Lesson }) {
  const { song, steps, stepIndex, status } = lesson;
  if (!song) return null;
  const progress = steps.length ? stepIndex / steps.length : 0;
  return (
    <div className={styles.bar}>
      <div className={styles.title}>
        <b>{song.title}</b>
        <span className={styles.dim}>{song.artist}</span>
      </div>
      <span className={styles.count}>{Math.min(stepIndex + 1, steps.length)}/{steps.length}</span>
      <button type="button" role="switch" aria-checked={lesson.mode === "wait"} className={styles.wait}
        onClick={() => lesson.setMode(lesson.mode === "wait" ? "free" : "wait")}>
        <span className={styles.track}><span className={styles.thumb} /></span>
        Wait for me
      </button>
      <div className={styles.controls}>
        <button type="button" className={styles.btn} onClick={lesson.togglePause} disabled={status === "done"}
          aria-keyshortcuts="Space">
          {status === "paused" ? "Resume" : "Pause"} <kbd>Space</kbd>
        </button>
        <button type="button" className={styles.btn} onClick={lesson.restart}>Restart</button>
        <button type="button" className={styles.btn} onClick={lesson.exit} aria-keyshortcuts="Escape">
          Exit learning mode <kbd>Esc</kbd>
        </button>
      </div>
      <span className={styles.progress} style={{ "--p": progress } as CSSProperties} aria-hidden="true" />
    </div>
  );
}

/** Paused veil and end-of-song card, over the falling notes. */
export function LessonOverlay({ lesson }: { lesson: Lesson }) {
  const { status, stats, mode } = lesson;
  if (status === "paused") {
    return (
      <div className={styles.veil}>
        <b>Paused</b>
        <span className={styles.dim}>Space to resume</span>
      </div>
    );
  }
  if (status !== "done") return null;
  return (
    <div className={styles.veil} role="status">
      <b>Song complete</b>
      <span>
        {mode === "free" && stats.accuracy !== null
          ? `${stats.accuracy}% accuracy · ${stats.hit} on time · ${stats.early + stats.late} off beat · ${stats.miss} missed`
          : `${lesson.steps.length} steps played`}
      </span>
      <div className={styles.controls}>
        <button type="button" className={styles.btn} onClick={lesson.restart}>Play again</button>
        <button type="button" className={styles.btn} onClick={lesson.openList}>Pick another song</button>
        <button type="button" className={styles.btn} onClick={lesson.exit}>Exit</button>
      </div>
    </div>
  );
}

export function SongList({ lesson }: { lesson: Lesson }) {
  return (
    <div className={styles.listVeil} data-open={lesson.listOpen ? "" : undefined} inert={!lesson.listOpen}
      onPointerDown={(e) => { if (e.target === e.currentTarget) lesson.closeList(); }}>
      <div className={styles.list} role="dialog" aria-label="Pick a song to learn">
        <header className={styles.listHead}>
          <span>Learn</span>
          <button type="button" className={styles.btn} onClick={lesson.closeList}>Close <kbd>Esc</kbd></button>
        </header>
        <ol className={styles.songs}>
          {LESSONS.map((s) => (
            <li key={s.id}>
              <button type="button" className={styles.song} onClick={() => lesson.start(s.id)}>
                <span className={styles.songTitle}>{s.title}</span>
                <span className={styles.dim}>{s.artist}</span>
                <span className={styles.meta}>
                  {s.steps.length} {s.steps.some((x) => x.keys.length > 1) ? "chords" : "notes"} · {duration(s.beats, s.bpm)} · {s.bpm} bpm
                </span>
                <span className={styles.meta}>{s.source}</span>
              </button>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

/** Tints the keys to play. White keys tint below the black keys, so the two never overlap. */
export function KeyHints({ lesson }: { lesson: Lesson }) {
  const current = lesson.steps[lesson.stepIndex];
  const { wrong } = lesson;
  return (
    <div className={styles.hints} aria-hidden="true">
      {current?.keys.map((k) => {
        const { left, width } = keyBox(KEYS[k]);
        return (
          <span key={k} data-hint={k} className={KEYS[k].isBlack ? styles.hintBlack : styles.hintWhite}
            style={{ left: `${left}%`, width: `${width}%` }} />
        );
      })}
      {wrong && (
        <span key={wrong.id} className={KEYS[wrong.key].isBlack ? styles.wrongBlack : styles.wrongWhite}
          style={{ left: `${keyBox(KEYS[wrong.key]).left}%`, width: `${keyBox(KEYS[wrong.key]).width}%` }} />
      )}
    </div>
  );
}

/** Notes fall down each key's lane and land on the keys on the beat. */
export function Falls({ lesson }: { lesson: Lesson }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  // The draw loop reads the latest lesson through a ref instead of restarting on every render.
  const latest = useRef(lesson);
  useEffect(() => {
    latest.current = lesson;
  });

  useEffect(() => {
    const el = canvas.current;
    const ctx = el?.getContext("2d");
    if (!el || !ctx) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let raf = 0;
    let width = 0;
    let height = 0;
    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      width = el.clientWidth;
      height = el.clientHeight;
      el.width = Math.round(width * dpr);
      el.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const observer = new ResizeObserver(resize);
    observer.observe(el);
    resize();

    const draw = () => {
      raf = requestAnimationFrame(draw);
      const { steps, stepIndex, results, beatRef } = latest.current;
      // Reduced motion: notes don't fall; the current one waits just above the keys.
      const beat = reduced.matches ? (steps[stepIndex]?.start ?? 0) : beatRef.current;
      const ppb = height / LOOKAHEAD;
      ctx.clearRect(0, 0, width, height);

      for (const k of KEYS) {
        const { left, width: w } = keyBox(k);
        const x = (left / 100) * width;
        if (k.isBlack) {
          ctx.fillStyle = "rgb(255 255 255 / 0.025)";
          ctx.fillRect(x, 0, (w / 100) * width, height);
        } else {
          ctx.fillStyle = "rgb(255 255 255 / 0.05)";
          ctx.fillRect(Math.round(x), 0, 1, height);
        }
      }

      ctx.font = "600 11px ui-monospace, monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "bottom";

      for (let i = 0; i < steps.length; i++) {
        const step = steps[i];
        if (step.start - beat > LOOKAHEAD) break;
        if (step.start + step.dur < beat - 0.5) continue;
        if (reduced.matches && i !== stepIndex) continue;
        const bottom = height - (step.start - beat) * ppb;
        const top = bottom - step.dur * ppb;
        const result = results[i];
        let leftmost = Infinity;

        for (const k of step.keys) {
          const key = KEYS[k];
          const { left, width: w } = keyBox(key);
          const x = (left / 100) * width + 2;
          const bw = (w / 100) * width - 4;
          leftmost = Math.min(leftmost, x);
          ctx.fillStyle =
            result === "miss" ? "rgb(248 113 113 / 0.6)"
            : result ? "rgb(255 255 255 / 0.18)"
            : i === stepIndex ? "#4ade80"
            : key.isBlack ? "#15803d" : "#22a355";
          ctx.beginPath();
          ctx.roundRect(x, top + 1, bw, Math.max(bottom - top - 2, 3), 4);
          ctx.fill();
          if (bottom - top > 16 && !result) {
            ctx.fillStyle = "#052e14";
            ctx.fillText(key.letter.toUpperCase(), x + bw / 2, bottom - 4);
          }
        }

        if (step.label && !result) {
          ctx.textAlign = "right";
          ctx.fillStyle = i === stepIndex ? "#ffffff" : "rgb(255 255 255 / 0.55)";
          ctx.fillText(step.label, leftmost - 6, bottom - 4);
          ctx.textAlign = "center";
        }
      }
    };
    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
    };
  }, []);

  return <canvas ref={canvas} className={styles.canvas} aria-hidden="true" />;
}
