/** Typed in this order, these letters walk up the keyboard one semitone at a time. */
export const LETTERS = "qwertyuiopasdfghjklzxcvbnm";

/** B2: the lowest key. 26 keys reach C5, so the bed starts and ends on a white key. */
const BASE_MIDI = 47;

const NAMES = ["C", "C♯", "D", "D♯", "E", "F", "F♯", "G", "G♯", "A", "A♯", "B"];
const BLACK = new Set([1, 3, 6, 8, 10]);

export type PianoKey = {
  index: number;
  letter: string;
  midi: number;
  pitchClass: number;
  isBlack: boolean;
  /** White keys before this one. A white key starts at `slot`; a black key is centered on it. */
  slot: number;
};

export const KEYS: PianoKey[] = (() => {
  let whites = 0;
  return [...LETTERS].map((letter, index) => {
    const midi = BASE_MIDI + index;
    const pitchClass = midi % 12;
    const isBlack = BLACK.has(pitchClass);
    const key = { index, letter, midi, pitchClass, isBlack, slot: whites };
    if (!isBlack) whites += 1;
    return key;
  });
})();

export const WHITE_COUNT = KEYS.filter((k) => !k.isBlack).length;

/** Black key width as a fraction of a white key. */
export const BLACK_WIDTH = 0.6;

/** Horizontal placement in percent of the key bed. */
export function keyBox(key: PianoKey): { left: number; width: number } {
  const w = 100 / WHITE_COUNT;
  if (!key.isBlack) return { left: key.slot * w, width: w };
  return { left: key.slot * w - (w * BLACK_WIDTH) / 2, width: w * BLACK_WIDTH };
}

export function noteName(midi: number): string {
  return `${NAMES[((midi % 12) + 12) % 12]}${Math.floor(midi / 12) - 1}`;
}

export function midiToFreq(midi: number): number {
  return 440 * 2 ** ((midi - 69) / 12);
}
