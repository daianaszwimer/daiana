export type MidiPort = { id: string; name: string };

type MidiNavigator = Navigator & { requestMIDIAccess?: () => Promise<MIDIAccess> };

export function midiSupported(): boolean {
  return typeof (navigator as MidiNavigator).requestMIDIAccess === "function";
}

export function requestMidi(): Promise<MIDIAccess> {
  return (navigator as MidiNavigator).requestMIDIAccess!();
}

export function listOutputs(access: MIDIAccess): MidiPort[] {
  return [...access.outputs.values()].map((o) => ({ id: o.id, name: o.name ?? "MIDI output" }));
}

/** `channel` is 1–16, as shown in the UI. */
export const midiMessage = {
  noteOn: (channel: number, note: number, velocity: number) => [0x90 | (channel - 1), note, velocity],
  noteOff: (channel: number, note: number) => [0x80 | (channel - 1), note, 0],
  sustain: (channel: number, on: boolean) => [0xb0 | (channel - 1), 64, on ? 127 : 0],
  allNotesOff: (channel: number) => [0xb0 | (channel - 1), 123, 0],
};
