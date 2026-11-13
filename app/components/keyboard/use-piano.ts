"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { MouseEvent as ReactMouseEvent, PointerEvent as ReactPointerEvent } from "react";
import { KEYS, LETTERS } from "./keys";
import { listOutputs, midiMessage, midiSupported, requestMidi, type MidiPort } from "./midi";
import { getSynth, type Timbre } from "./synth";

export type Settings = {
  octave: number;
  transpose: number;
  velocity: number;
  volume: number;
  sustain: boolean;
  timbre: Timbre;
  labels: boolean;
  midiOutputId: string | null;
  midiChannel: number;
};

export const RANGES = {
  octave: [-2, 2],
  transpose: [-12, 12],
  velocity: [1, 127],
  volume: [0, 100],
  midiChannel: [1, 16],
} as const satisfies Partial<Record<keyof Settings, readonly [number, number]>>;

export const DEFAULT_SETTINGS: Settings = {
  octave: 0,
  transpose: 0,
  velocity: 100,
  volume: 70,
  sustain: false,
  timbre: "soft",
  labels: true,
  midiOutputId: null,
  midiChannel: 1,
};

export type PianoEvent = {
  id: number;
  /** performance.now() when it happened. */
  time: number;
  /** Key index for on/off, -1 for sustain. */
  key: number;
  kind: "on" | "off" | "sustain";
  /** MIDI note for on/off, 127 or 0 for sustain. */
  value: number;
  velocity: number;
  channel: number;
};

export type MidiStatus = "idle" | "pending" | "ready" | "denied";

export const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

const noSubscribe = () => () => {};

function isEditable(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  if (target instanceof HTMLInputElement) return !/^(range|checkbox|radio|button)$/.test(target.type);
  return /^(TEXTAREA|SELECT)$/.test(target.tagName) || target.isContentEditable;
}

export function usePiano() {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [pressed, setPressed] = useState<ReadonlySet<number>>(() => new Set());
  const [sustainOn, setSustainOn] = useState(false);
  const [events, setEvents] = useState<PianoEvent[]>([]);
  const [lastNote, setLastNote] = useState<number | null>(null);
  const [midiStatus, setMidiStatus] = useState<MidiStatus>("idle");
  const [outputs, setOutputs] = useState<MidiPort[]>([]);
  const supported = useSyncExternalStore(noSubscribe, midiSupported, () => true);

  // Handlers read these instead of state, so they stay stable across renders.
  const settingsRef = useRef(DEFAULT_SETTINGS);
  const accessRef = useRef<MIDIAccess | null>(null);
  const holders = useRef(new Map<number, number>());
  const sounding = useRef(new Map<number, number>());
  const typed = useRef(new Set<string>());
  const pointers = useRef(new Map<number, number>());
  const spaceRef = useRef(false);
  const sustainRef = useRef(false);
  const eventId = useRef(0);

  const send = useCallback((bytes: number[], outputId = settingsRef.current.midiOutputId) => {
    if (outputId) accessRef.current?.outputs.get(outputId)?.send(bytes);
  }, []);

  const log = useCallback((kind: PianoEvent["kind"], key: number, value: number, velocity = 0) => {
    const channel = settingsRef.current.midiChannel;
    const id = ++eventId.current;
    const time = performance.now();
    setEvents((prev) => [{ id, time, key, kind, value, velocity, channel }, ...prev].slice(0, 80));
  }, []);

  const syncSustain = useCallback(() => {
    const on = settingsRef.current.sustain || spaceRef.current;
    if (on === sustainRef.current) return;
    sustainRef.current = on;
    getSynth().setSustain(on);
    send(midiMessage.sustain(settingsRef.current.midiChannel, on));
    setSustainOn(on);
    log("sustain", -1, on ? 127 : 0);
  }, [send, log]);

  const update = useCallback(
    <K extends keyof Settings>(key: K, value: Settings[K]) => {
      const prev = settingsRef.current;
      if (prev[key] === value) return;
      settingsRef.current = { ...prev, [key]: value };
      setSettings(settingsRef.current);
      if (key === "volume") getSynth().setVolume((value as number) / 100);
      if (key === "sustain") syncSustain();
      if (key === "midiOutputId" || key === "midiChannel") {
        send(midiMessage.allNotesOff(prev.midiChannel), prev.midiOutputId);
      }
    },
    [send, syncSustain],
  );

  const press = useCallback(
    (index: number) => {
      const count = holders.current.get(index) ?? 0;
      holders.current.set(index, count + 1);
      if (count > 0) return;
      const s = settingsRef.current;
      const note = clamp(KEYS[index].midi + s.octave * 12 + s.transpose, 0, 127);
      sounding.current.set(index, note);
      getSynth().noteOn(index, note, s.velocity / 127, s.timbre);
      send(midiMessage.noteOn(s.midiChannel, note, s.velocity));
      setPressed((p) => new Set(p).add(index));
      setLastNote(note);
      log("on", index, note, s.velocity);
    },
    [send, log],
  );

  const release = useCallback(
    (index: number) => {
      const count = holders.current.get(index) ?? 0;
      if (count === 0) return;
      if (count > 1) {
        holders.current.set(index, count - 1);
        return;
      }
      holders.current.delete(index);
      const note = sounding.current.get(index) ?? KEYS[index].midi;
      getSynth().noteOff(index);
      send(midiMessage.noteOff(settingsRef.current.midiChannel, note));
      setPressed((p) => {
        const next = new Set(p);
        next.delete(index);
        return next;
      });
      log("off", index, note);
    },
    [send, log],
  );

  const releaseAll = useCallback(() => {
    typed.current.clear();
    pointers.current.clear();
    for (const index of [...holders.current.keys()]) {
      holders.current.set(index, 1);
      release(index);
    }
    spaceRef.current = false;
    syncSustain();
  }, [release, syncSustain]);

  useEffect(() => {
    const onDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey || isEditable(e.target)) return;
      if (e.code === "Space") {
        e.preventDefault();
        if (!spaceRef.current) {
          spaceRef.current = true;
          syncSustain();
        }
        return;
      }
      if (e.key === "[" || e.key === "]") {
        const [min, max] = RANGES.octave;
        update("octave", clamp(settingsRef.current.octave + (e.key === "]" ? 1 : -1), min, max));
        return;
      }
      const letter = e.key.toLowerCase();
      const index = letter.length === 1 ? LETTERS.indexOf(letter) : -1;
      if (index < 0) return;
      e.preventDefault();
      if (e.repeat || typed.current.has(letter)) return;
      typed.current.add(letter);
      press(index);
    };
    const onUp = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        spaceRef.current = false;
        syncSustain();
        return;
      }
      const letter = e.key.toLowerCase();
      if (typed.current.delete(letter)) release(LETTERS.indexOf(letter));
    };
    const onHidden = () => {
      if (document.visibilityState === "hidden") releaseAll();
    };
    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup", onUp);
    window.addEventListener("blur", releaseAll);
    document.addEventListener("visibilitychange", onHidden);
    return () => {
      window.removeEventListener("keydown", onDown);
      window.removeEventListener("keyup", onUp);
      window.removeEventListener("blur", releaseAll);
      document.removeEventListener("visibilitychange", onHidden);
    };
  }, [press, release, releaseAll, syncSustain, update]);

  // Settings reset with each mount, so the shared synth goes back to defaults too.
  useEffect(() => {
    const synth = getSynth();
    synth.setVolume(DEFAULT_SETTINGS.volume / 100);
    return () => {
      synth.setSustain(false);
      synth.allOff();
      const s = settingsRef.current;
      send(midiMessage.allNotesOff(s.midiChannel));
      if (accessRef.current) accessRef.current.onstatechange = null;
    };
  }, [send]);

  const connectMidi = useCallback(async () => {
    if (!midiSupported()) return;
    setMidiStatus("pending");
    try {
      const access = await requestMidi();
      accessRef.current = access;
      const refresh = () => {
        const list = listOutputs(access);
        setOutputs(list);
        const current = settingsRef.current.midiOutputId;
        if (!current || !list.some((o) => o.id === current)) update("midiOutputId", list[0]?.id ?? null);
      };
      access.onstatechange = refresh;
      refresh();
      setMidiStatus("ready");
    } catch {
      setMidiStatus("denied");
    }
  }, [update]);

  // Hit-testing by point (not by event target) lets a finger or mouse glide
  // across keys, and still works when the stage is rotated for portrait phones.
  const keyAt = (e: ReactPointerEvent<HTMLElement>) => {
    const el = document.elementFromPoint(e.clientX, e.clientY)?.closest<HTMLElement>("[data-key]");
    return el && e.currentTarget.contains(el) ? Number(el.dataset.key) : -1;
  };

  const endPointer = (e: ReactPointerEvent<HTMLElement>) => {
    const prev = pointers.current.get(e.pointerId);
    if (prev === undefined) return;
    pointers.current.delete(e.pointerId);
    if (prev >= 0) release(prev);
  };

  const keyBedProps = {
    onPointerDown: (e: ReactPointerEvent<HTMLElement>) => {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      const index = keyAt(e);
      if (index < 0) return;
      e.preventDefault();
      e.currentTarget.setPointerCapture(e.pointerId);
      pointers.current.set(e.pointerId, index);
      press(index);
    },
    onPointerMove: (e: ReactPointerEvent<HTMLElement>) => {
      const prev = pointers.current.get(e.pointerId);
      if (prev === undefined) return;
      const index = keyAt(e);
      if (index === prev) return;
      if (prev >= 0) release(prev);
      pointers.current.set(e.pointerId, index);
      if (index >= 0) press(index);
    },
    onPointerUp: endPointer,
    onPointerCancel: endPointer,
    onLostPointerCapture: endPointer,
    onContextMenu: (e: ReactMouseEvent) => e.preventDefault(),
  };

  return {
    settings,
    update,
    pressed,
    sustainOn,
    events,
    lastNote,
    keyBedProps,
    midi: { supported, status: midiStatus, outputs, connect: connectMidi },
  };
}

export type Piano = ReturnType<typeof usePiano>;
