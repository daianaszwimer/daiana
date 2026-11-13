import { KEYS } from "./keys";

/**
 * Song format: whitespace-separated `NOTES/beats` tokens.
 * - NOTES is a note (`C4`, `F#3`, `Bb3`), a chord (`G3+B3+D4`) or a rest (`-`).
 * - beats is the length in quarter-note beats (`1`, `0.5`, `0.75`).
 * - An optional `[label]` prefix names the step, e.g. `[D/F#]F#3+A3+D4/2`.
 * - `|` is a bar line for readability and is ignored.
 * `shift` moves every note by that many semitones, e.g. -12 for an octave down.
 */
export type RawSong = {
  id: string;
  title: string;
  artist: string;
  bpm: number;
  shift?: number;
  /** How faithful the lesson is, shown in the song list. */
  source: string;
  notes: string;
};

export type Step = {
  /** Start, in beats from the beginning of the song. */
  start: number;
  dur: number;
  /** Key indices on the 26-key bed (0 = B2 … 25 = C5). */
  keys: number[];
  midis: number[];
  label?: string;
};

export type Song = Omit<RawSong, "notes" | "shift"> & { steps: Step[]; beats: number };

const LOWEST = KEYS[0].midi;
const HIGHEST = KEYS[KEYS.length - 1].midi;
const PITCH: Record<string, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };

function toMidi(name: string): number | null {
  const m = /^([A-G])([#b♯♭]?)(\d)$/.exec(name);
  if (!m) return null;
  const accidental = m[2] === "#" || m[2] === "♯" ? 1 : m[2] === "b" || m[2] === "♭" ? -1 : 0;
  return (Number(m[3]) + 1) * 12 + PITCH[m[1]] + accidental;
}

export function parseSong(raw: RawSong): Song {
  const shift = raw.shift ?? 0;
  const steps: Step[] = [];
  let beat = 0;
  const tokens = raw.notes.split(/\s+/).filter((t) => t && t !== "|");

  tokens.forEach((token, i) => {
    const where = `${raw.title}, token ${i + 1} "${token}"`;
    const m = /^(?:\[([^\]]+)\])?([^/[\]]+)\/(\d+(?:\.\d+)?)$/.exec(token);
    if (!m) throw new Error(`${where}: expected NOTES/beats`);
    const [, label, notes, beatsText] = m;
    const dur = Number(beatsText);
    if (!(dur > 0)) throw new Error(`${where}: length must be more than 0`);
    if (notes !== "-") {
      const midis = notes.split("+").map((n) => {
        const midi = toMidi(n);
        if (midi === null) throw new Error(`${where}: "${n}" isn't a note like C4, F#3 or Bb3`);
        const played = midi + shift;
        if (played < LOWEST || played > HIGHEST) {
          throw new Error(`${where}: "${n}" is outside the keyboard (B2–C5)`);
        }
        return played;
      });
      steps.push({ start: beat, dur, midis, keys: midis.map((x) => x - LOWEST), label });
    }
    beat += dur;
  });

  if (steps.length === 0) throw new Error(`${raw.title}: no notes`);
  const { id, title, artist, bpm, source } = raw;
  return { id, title, artist, bpm, source, steps, beats: beat };
}

export const SONGS: RawSong[] = [
  {
    id: "twinkle",
    title: "Twinkle Twinkle Little Star",
    artist: "Traditional",
    bpm: 100,
    source: "Full melody",
    notes: `
      C4/1 C4/1 G4/1 G4/1 | A4/1 A4/1 G4/2 | F4/1 F4/1 E4/1 E4/1 | D4/1 D4/1 C4/2
      G4/1 G4/1 F4/1 F4/1 | E4/1 E4/1 D4/2 | G4/1 G4/1 F4/1 F4/1 | E4/1 E4/1 D4/2
      C4/1 C4/1 G4/1 G4/1 | A4/1 A4/1 G4/2 | F4/1 F4/1 E4/1 E4/1 | D4/1 D4/1 C4/2
    `,
  },
  {
    id: "let-it-be",
    title: "Let It Be",
    artist: "The Beatles",
    bpm: 74,
    shift: -12,
    source: "Verse and chorus melody, an octave down",
    notes: `
      D4/0.25 D4/0.25
      | D4/0.5 D4/0.5 E4/0.5 B3/0.5 D4/0.5 D4/0.5 G4/0.25 A4/0.75
      | A4/0.5 B4/0.5 B4/0.5 A4/0.5 A4/0.5 G4/0.5 G4/1
      | B4/0.25 B4/0.75 C5/0.5 B4/0.5 B4/0.5 A4/0.5 -/0.5 B4/0.25 A4/0.25
      | A4/0.25 G4/0.75 -/2.75 D4/0.25
      | D4/0.5 D4/0.5 E4/0.5 G4/0.5 D4/0.5 D4/0.5 G4/0.25 A4/0.75
      | A4/0.5 B4/0.5 B4/0.5 A4/0.5 A4/0.25 G4/0.25 G4/0.5 -/1
      | B4/0.25 B4/0.75 C5/0.5 B4/0.5 B4/0.5 A4/0.5 -/0.5 B4/0.25 A4/0.25
      | A4/0.25 G4/0.75 -/2 B4/0.25 A4/0.75
      | G4/1 B4/0.25 D5/0.75 E5/1 D5/0.25 D5/0.25 B4/0.25 A4/0.25
      | G4/1 E4/0.25 D4/0.75 B4/1 -/1
      | B4/0.25 B4/0.75 C5/0.5 B4/0.5 B4/0.5 A4/0.5 -/0.5 B4/0.25 A4/0.25
      | A4/0.25 G4/1.75 -/2
    `,
  },
  {
    id: "stand-by-me",
    title: "Stand by Me",
    artist: "Ben E. King",
    bpm: 118,
    shift: -12,
    source: "Verse and chorus melody, an octave down",
    notes: `
      A4/0.5 C5/0.5
      | D5/3 -/0.5 A4/0.5 | C5/4
      | -/1 A4/0.5 G4/0.5 A4/1 G4/1 | F4/3 F4/0.5 G4/0.5
      | A4/0.5 F4/2.5 F4/0.5 A4/0.5 | G4/0.5 F4/2.5 G4/0.5 F4/0.5
      | F4/7 A4/0.5 C5/0.5
      | D5/3 A4/0.5 C5/0.5 | D5/1.5 C5/0.5 Bb4/0.5 A4/0.5 G4/0.5 F4/0.25 G4/0.25
      | A4/3 F4/0.5 G4/0.5 | F4/3 F4/0.5 G4/0.5
      | A4/0.5 F4/2.5 F4/0.5 A4/0.5 | G4/0.5 F4/2.5 A4/0.5 G4/0.5
      | F4/3 -/0.5 C5/0.5 | D5/1 C5/1 E5/1 E5/1
      | D5/0.5 C5/0.5 D5/2 D5/1 | D5/2 C5/0.5 D5/1.5
      | A4/0.25 G4/0.25 F4/0.25 G4/0.25 A4/2 G4/1 | F4/3 A4/1
      | G4/0.5 F4/3.5 | -/1 A4/0.5 G4/0.5 F4/2 | -/1 A4/0.5 G4/0.5 F4/5
    `,
  },
  {
    id: "flaca",
    title: "Flaca",
    artist: "Andrés Calamaro",
    bpm: 100,
    source: "Intro solo, arranged from guitar tab",
    notes: `
      D4/0.75 B3/0.5 A3/0.5 G3/0.5 B3/0.5
      D4/0.5 D#4/1.25 B3/0.5 A3/0.5 G3/0.5 B3/0.5
      D#4/0.5 E4/1.25 B3/0.5 A3/0.5 G3/0.5 A3/0.5 B3/1
      D4/1 C4/0.5 C4/1.5 B3/0.5 D4/1 B3/0.5 A3/0.5 G3/0.5 A3/0.5 B3/0.75
      D4/1 B3/0.5 A3/0.75 G3/1.25
    `,
  },
  {
    id: "seminare",
    title: "Seminare",
    artist: "Serú Girán",
    bpm: 90,
    source: "Chords for the first part and chorus, rhythm approximated",
    notes: `
      [G]G3+B3+D4/2 [D/F#]F#3+A3+D4/2 [Em]E3+G3+B3/4
      [B7]D#3+A3+B3/2 [C9]C3+E3+D4/2 [D7]D3+F#3+C4/4
      [G]G3+B3+D4/2 [D/F#]F#3+A3+D4/2 [Em]E3+G3+B3/4
      [Bm]B2+D3+F#3/2 [C9]C3+E3+D4/2 [D7]D3+F#3+C4/4
      [Am]A3+C4+E4/2 [G/B]B2+D3+G3/1 [C]C3+E3+G3/1
      [D7]D3+F#3+C4/2 [Em]E3+G3+B3/2
      [Em7]E3+G3+D4/1 [Em6]E3+G3+C#4/1 [Cm]C3+Eb3+G3/1 [C2]C3+D3+G3/1
      [G]G3+B3+D4/2 [G7]G3+B3+F4/2
      [C]C3+E3+G3/1 [B7]D#3+A3+B3/1 [Em]E3+G3+B3/1 [A7]A3+C#4+G4/1
      [D]D3+F#3+A3/2 [D4]D3+G3+A3/1 [D]D3+F#3+A3/1
      [G]G3+B3+D4/4
    `,
  },
];
