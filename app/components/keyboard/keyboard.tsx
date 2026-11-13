"use client";

import { useEffect, useRef } from "react";
import { KEYS, keyBox, noteName } from "./keys";
import { Landscape } from "./landscape";
import { TIMBRES } from "./synth";
import { RANGES, clamp, usePiano } from "./use-piano";
import { KeyBed } from "./key-bed";
import { Falls, KeyHints, LearnButton, LessonBar, LessonOverlay, SongList } from "./learn";
import { useLesson } from "./use-lesson";
import styles from "./keyboard.module.css";

const signed = (n: number) => (n > 0 ? `+${n}` : String(n));
const pcName = (pc: number) => noteName(60 + pc).slice(0, -1);

/** Seconds of history visible above the keys. */
const WINDOW = 4;

type Bar = { key: number; start: number; end: number | null; velocity: number };

const CHORDS: [string, number[]][] = [
  ["maj7", [0, 4, 7, 11]], ["7", [0, 4, 7, 10]], ["m7", [0, 3, 7, 10]], ["m7♭5", [0, 3, 6, 10]],
  ["dim7", [0, 3, 6, 9]], ["mMaj7", [0, 3, 7, 11]], ["6", [0, 4, 7, 9]], ["m6", [0, 3, 7, 9]],
  ["add9", [0, 2, 4, 7]], ["", [0, 4, 7]], ["m", [0, 3, 7]], ["dim", [0, 3, 6]], ["aug", [0, 4, 8]],
  ["sus2", [0, 2, 7]], ["sus4", [0, 5, 7]], ["5", [0, 7]],
];
const INTERVALS = ["unison", "m2", "M2", "m3", "M3", "P4", "tritone", "P5", "m6", "M6", "m7", "M7"];

/** Names what's held: a chord when it matches one, otherwise the interval. Bass note decides inversions. */
function nameChord(notes: number[]): string | null {
  if (notes.length < 2) return null;
  const sorted = [...notes].sort((a, b) => a - b);
  const bass = sorted[0] % 12;
  const pcs = [...new Set(sorted.map((n) => n % 12))];
  const roots = [bass, ...pcs.filter((p) => p !== bass)];
  for (const [suffix, shape] of CHORDS) {
    if (shape.length !== pcs.length) continue;
    for (const root of roots) {
      const rel = pcs.map((p) => (p - root + 12) % 12).sort((a, b) => a - b);
      if (rel.every((r, i) => r === shape[i])) {
        return `${pcName(root)}${suffix}${root !== bass ? `/${pcName(bass)}` : ""}`;
      }
    }
  }
  if (sorted.length === 2) return INTERVALS[(sorted[1] - sorted[0]) % 12];
  return null;
}

export function Keyboard() {
  const piano = usePiano();
  const { settings: s, update, midi } = piano;
  const canvas = useRef<HTMLCanvasElement>(null);
  const bars = useRef<Bar[]>([]);
  const seen = useRef(0);

  // Turn new note events into bars. Events arrive newest first.
  useEffect(() => {
    const fresh = piano.events.filter((e) => e.id > seen.current).reverse();
    for (const e of fresh) {
      seen.current = e.id;
      if (e.kind === "on") bars.current.push({ key: e.key, start: e.time, end: null, velocity: e.velocity });
      if (e.kind === "off") {
        const open = bars.current.findLast((b) => b.key === e.key && b.end === null);
        if (open) open.end = e.time;
      }
    }
  }, [piano.events]);

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
      const now = performance.now();
      const pxPerMs = height / (WINDOW * 1000);
      ctx.clearRect(0, 0, width, height);

      // Lanes: darker under black keys, hairlines between white keys.
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

      if (!reduced.matches) {
        // A line per second, counting back from the keys.
        ctx.fillStyle = "rgb(255 255 255 / 0.06)";
        ctx.font = "10px ui-monospace, monospace";
        for (let sec = 1; sec < WINDOW; sec++) {
          const y = Math.round(height - sec * 1000 * pxPerMs);
          ctx.fillRect(0, y, width, 1);
          ctx.fillStyle = "rgb(255 255 255 / 0.25)";
          ctx.fillText(`-${sec}s`, width - 26, y - 4);
          ctx.fillStyle = "rgb(255 255 255 / 0.06)";
        }
      }

      const cutoff = now - WINDOW * 1000;
      bars.current = bars.current.filter((b) => b.end === null || b.end > cutoff);

      for (const b of bars.current) {
        const k = KEYS[b.key];
        const { left, width: w } = keyBox(k);
        const x = (left / 100) * width + 2;
        const bw = (w / 100) * width - 4;
        let top: number;
        let bottom: number;
        if (reduced.matches) {
          // No scrolling: held notes stand as full columns, released ones vanish.
          if (b.end !== null) continue;
          top = 0;
          bottom = height;
        } else {
          top = height - (now - b.start) * pxPerMs;
          bottom = b.end === null ? height : height - (now - b.end) * pxPerMs;
        }
        const light = 32 + (b.velocity / 127) * 36;
        ctx.fillStyle = `hsl(142 70% ${light}%)`;
        ctx.beginPath();
        ctx.roundRect(x, Math.max(top, -4), bw, Math.max(bottom - top, 2), 3);
        ctx.fill();
      }
    };
    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
    };
  }, []);

  const lesson = useLesson(piano, "wait");
  const learning = lesson.song !== null;

  const shift = s.octave * 12 + s.transpose;
  const held = [...piano.pressed].map((i) => clamp(KEYS[i].midi + shift, 0, 127)).sort((a, b) => a - b);
  const chord = nameChord(held);
  const outName = midi.outputs.find((o) => o.id === s.midiOutputId)?.name;

  return (
    <Landscape className={styles.root}>
      <LessonBar lesson={lesson} />
      <div className={styles.strip} aria-label="Settings" hidden={learning}>
        <LearnButton lesson={lesson} />
        <Step label="Oct" value={s.octave} range={RANGES.octave} format={signed} onChange={(v) => update("octave", v)} />
        <Step label="Trn" value={s.transpose} range={RANGES.transpose} format={signed} onChange={(v) => update("transpose", v)} />
        <Step label="Vel" value={s.velocity} range={RANGES.velocity} step={8} onChange={(v) => update("velocity", v)} />
        <Step label="Vol" value={s.volume} range={RANGES.volume} step={10} onChange={(v) => update("volume", v)} />
        <div className={styles.group} role="radiogroup" aria-label="Sound">
          {TIMBRES.map((t) => (
            <button key={t.id} type="button" role="radio" aria-checked={s.timbre === t.id}
              className={styles.btn} onClick={() => update("timbre", t.id)}>{t.label}</button>
          ))}
        </div>
        <button type="button" className={styles.btn} aria-pressed={s.sustain}
          data-lit={piano.sustainOn ? "" : undefined} onClick={() => update("sustain", !s.sustain)}>Sus</button>
        <button type="button" className={styles.btn} aria-pressed={s.labels}
          data-lit={s.labels ? "" : undefined} onClick={() => update("labels", !s.labels)}>Lbl</button>
        <div className={styles.group}>
          <span className={styles.label}>Out</span>
          {!midi.supported ? (
            <span className={styles.dim}>n/a</span>
          ) : midi.status === "ready" ? (
            <select className={styles.select} aria-label="MIDI output" value={s.midiOutputId ?? ""}
              onChange={(e) => update("midiOutputId", e.target.value || null)}>
              {midi.outputs.length === 0 && <option value="">none</option>}
              {midi.outputs.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
            </select>
          ) : (
            <button type="button" className={styles.btn} onClick={midi.connect} disabled={midi.status === "pending"}>
              {midi.status === "denied" ? "Retry" : "Connect"}
            </button>
          )}
        </div>
        <Step label="Ch" value={s.midiChannel} range={RANGES.midiChannel} onChange={(v) => update("midiChannel", v)} />
      </div>

      <div className={styles.roll}>
        {/* Hidden, not unmounted, during a lesson so its draw loop keeps its canvas. */}
        <canvas ref={canvas} className={styles.canvas} aria-hidden="true" hidden={learning} />
        {learning && <Falls lesson={lesson} />}
        {learning && <LessonOverlay lesson={lesson} />}
        <div className={styles.readout} aria-live="polite" hidden={learning}>
          <span className={styles.chord}>{chord ?? (held.length === 1 ? noteName(held[0]) : "—")}</span>
          <span className={styles.notes}>
            {held.length > 0 ? held.map(noteName).join(" ") : piano.lastNote === null ? "play something" : `last ${noteName(piano.lastNote)}`}
          </span>
          {outName && <span className={styles.dim}>→ {outName} ch{s.midiChannel}</span>}
        </div>
      </div>

      <div className={styles.keys}>
        <KeyBed piano={piano} />
        {learning && <KeyHints lesson={lesson} />}
      </div>
      <SongList lesson={lesson} />
    </Landscape>
  );
}

function Step({
  label, value, range, step = 1, format = String, onChange,
}: {
  label: string; value: number; range: readonly [number, number]; step?: number;
  format?: (n: number) => string; onChange: (n: number) => void;
}) {
  const [min, max] = range;
  return (
    <div className={styles.group}>
      <span className={styles.label}>{label}</span>
      <button type="button" className={styles.btn} aria-label={`Decrease ${label}`} disabled={value <= min}
        onClick={() => onChange(clamp(value - step, min, max))}>−</button>
      <output className={styles.value}>{format(value)}</output>
      <button type="button" className={styles.btn} aria-label={`Increase ${label}`} disabled={value >= max}
        onClick={() => onChange(clamp(value + step, min, max))}>+</button>
    </div>
  );
}
