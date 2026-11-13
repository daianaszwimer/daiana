"use client";

import { useCallback, useEffect, useEffectEvent, useRef, useState } from "react";
import type { Piano } from "./use-piano";
import { SONGS, parseSong, type Song } from "./songs";

/**
 * - wait: the song plays at tempo but holds at each note until it's played.
 * - free: the song never waits; notes are judged on timing, and unplayed ones are missed.
 */
export type Mode = "wait" | "free";
export type Result = "hit" | "early" | "late" | "miss";
export type Status = "playing" | "paused" | "done";

/** Beats of count-in before the first note, so falling notes have room to arrive. */
const LEAD_BEATS = 2;
const PERFECT_MS = 120;
const WINDOW_MS = 300;
/** In wait mode, how close (in beats) a note must be before pressing it counts. */
const ARRIVAL_BEATS = 0.5;

// Parsing at load means a bad transcription fails loudly, not mid-lesson.
export const LESSONS: Song[] = SONGS.map(parseSong);

function isEditable(target: EventTarget | null) {
  return target instanceof HTMLElement && (/^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName) || target.isContentEditable);
}

export function useLesson(piano: Piano, initialMode: Mode) {
  const [song, setSong] = useState<Song | null>(null);
  const [listOpen, setListOpen] = useState(false);
  const [mode, setModeState] = useState(initialMode);
  const [status, setStatus] = useState<Status>("playing");
  const [stepIndex, setStepIndex] = useState(0);
  const [results, setResults] = useState<(Result | undefined)[]>([]);
  const [wrong, setWrong] = useState<{ key: number; id: number } | null>(null);

  /** Current position in beats. Read every frame by canvases; not React state. */
  const beatRef = useRef(0);
  const songRef = useRef<Song | null>(null);
  const modeRef = useRef(initialMode);
  const eventsRef = useRef(piano.events);
  const st = useRef({
    stepIndex: 0,
    results: [] as (Result | undefined)[],
    partial: new Map<number, { keys: Set<number>; offsetMs: number }>(),
    seen: 0,
    last: 0,
    status: "playing" as Status,
    wrongId: 0,
  });

  useEffect(() => {
    eventsRef.current = piano.events;
  }, [piano.events]);

  const reset = useCallback(() => {
    const l = st.current;
    l.stepIndex = 0;
    l.results = [];
    l.partial = new Map();
    l.status = "playing";
    l.last = performance.now();
    l.seen = eventsRef.current[0]?.id ?? 0;
    beatRef.current = -LEAD_BEATS;
    setStatus("playing");
    setStepIndex(0);
    setResults([]);
    setWrong(null);
  }, []);

  const { update } = piano;
  const start = useCallback(
    (id: string) => {
      const s = LESSONS.find((x) => x.id === id);
      if (!s) return;
      update("octave", 0);
      update("transpose", 0);
      update("sustain", false);
      songRef.current = s;
      setSong(s);
      setListOpen(false);
      reset();
    },
    [reset, update],
  );

  const exit = useCallback(() => {
    songRef.current = null;
    setSong(null);
  }, []);

  const restart = useCallback(() => {
    if (songRef.current) reset();
  }, [reset]);

  const setPaused = useCallback((paused: boolean) => {
    const l = st.current;
    if (l.status === "done") return;
    l.status = paused ? "paused" : "playing";
    l.last = performance.now();
    setStatus(l.status);
  }, []);

  const togglePause = useCallback(() => setPaused(st.current.status === "playing"), [setPaused]);

  const setMode = useCallback((m: Mode) => {
    modeRef.current = m;
    setModeState(m);
    st.current.partial = new Map();
  }, []);

  useEffect(() => {
    let raf = 0;

    const judge = (i: number, r: Result) => {
      st.current.results[i] = r;
      setResults([...st.current.results]);
    };
    const advance = (s: Song) => {
      const l = st.current;
      while (l.stepIndex < s.steps.length && l.results[l.stepIndex]) l.stepIndex++;
      setStepIndex(l.stepIndex);
    };
    const flagWrong = (key: number) => {
      const l = st.current;
      setWrong({ key, id: ++l.wrongId });
    };

    const press = (s: Song, key: number, beat: number, msPerBeat: number) => {
      const l = st.current;
      const m = modeRef.current;
      if (m === "wait") {
        const i = l.stepIndex;
        const step = s.steps[i];
        if (!step) return;
        if (!step.keys.includes(key)) return flagWrong(key);
        // Waiting means the note has to reach the keys first; earlier presses don't count.
        if (step.start - beat > ARRIVAL_BEATS) return;
        const p = l.partial.get(i) ?? { keys: new Set<number>(), offsetMs: 0 };
        p.keys.add(key);
        l.partial.set(i, p);
        if (step.keys.every((k) => p.keys.has(k))) {
          judge(i, "hit");
          advance(s);
        }
        return;
      }
      // Free play: the earliest open note within the timing window that uses this key.
      const win = WINDOW_MS / msPerBeat;
      for (let i = l.stepIndex; i < s.steps.length && s.steps[i].start - beat <= win; i++) {
        const step = s.steps[i];
        if (l.results[i] || !step.keys.includes(key)) continue;
        const p = l.partial.get(i) ?? { keys: new Set<number>(), offsetMs: (beat - step.start) * msPerBeat };
        if (p.keys.has(key)) continue;
        p.keys.add(key);
        l.partial.set(i, p);
        if (step.keys.every((k) => p.keys.has(k))) {
          judge(i, Math.abs(p.offsetMs) <= PERFECT_MS ? "hit" : p.offsetMs < 0 ? "early" : "late");
          advance(s);
        }
        return;
      }
      flagWrong(key);
    };

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const s = songRef.current;
      const l = st.current;
      const dt = now - l.last;
      l.last = now;
      const newest = eventsRef.current[0]?.id ?? l.seen;
      if (!s || l.status !== "playing") {
        l.seen = newest;
        return;
      }
      const msPerBeat = 60000 / s.bpm;
      const m = modeRef.current;

      const fresh = eventsRef.current.filter((e) => e.id > l.seen && e.kind === "on").reverse();
      l.seen = newest;
      for (const e of fresh) {
        // Judge against when the key went down, not when this frame noticed it.
        const beatAtPress = beatRef.current - (now - e.time) / msPerBeat;
        press(s, e.key, beatAtPress, msPerBeat);
      }

      let beat = beatRef.current + dt / msPerBeat;
      const next = s.steps[l.stepIndex];
      if (m === "wait" && next) beat = Math.min(beat, next.start);
      beatRef.current = beat;

      if (m === "free") {
        const win = WINDOW_MS / msPerBeat;
        while (l.stepIndex < s.steps.length && beatRef.current > s.steps[l.stepIndex].start + win) {
          if (!l.results[l.stepIndex]) judge(l.stepIndex, "miss");
          advance(s);
        }
      }

      if (l.stepIndex >= s.steps.length && beatRef.current >= s.beats) {
        l.status = "done";
        setStatus("done");
      }
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  // Inside a lesson, Space pauses (instead of sustaining) and Esc exits.
  // Capture phase on window runs before the piano's own key listener.
  const onKey = useEffectEvent((e: KeyboardEvent) => {
    if (isEditable(e.target) || e.metaKey || e.ctrlKey || e.altKey) return;
    if (listOpen && e.key === "Escape") {
      setListOpen(false);
      return;
    }
    if (!song) return;
    if (e.code === "Space") {
      e.preventDefault();
      e.stopImmediatePropagation();
      if (!e.repeat) togglePause();
    } else if (e.key === "Escape") {
      exit();
    }
  });

  useEffect(() => {
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, []);

  const judged = results.filter(Boolean) as Result[];
  const count = (r: Result) => judged.filter((x) => x === r).length;
  const stats = {
    hit: count("hit"),
    early: count("early"),
    late: count("late"),
    miss: count("miss"),
    accuracy: judged.length
      ? Math.round(((count("hit") + 0.5 * (count("early") + count("late"))) / judged.length) * 100)
      : null,
  };

  return {
    song,
    steps: song?.steps ?? [],
    listOpen,
    openList: () => setListOpen(true),
    closeList: () => setListOpen(false),
    start,
    exit,
    restart,
    togglePause,
    status,
    mode,
    setMode,
    stepIndex,
    results,
    wrong,
    stats,
    beatRef,
  };
}

export type Lesson = ReturnType<typeof useLesson>;
