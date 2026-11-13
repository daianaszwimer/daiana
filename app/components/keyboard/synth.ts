import { midiToFreq } from "./keys";

export type Timbre = "soft" | "bright" | "organ";

export const TIMBRES: { id: Timbre; label: string }[] = [
  { id: "soft", label: "Soft" },
  { id: "bright", label: "Bright" },
  { id: "organ", label: "Organ" },
];

type Partial = { ratio: number; type: OscillatorType; level: number };

const PATCHES: Record<
  Timbre,
  { partials: Partial[]; attack: number; release: number; filter: boolean }
> = {
  soft: {
    partials: [
      { ratio: 1, type: "triangle", level: 1 },
      { ratio: 2, type: "sine", level: 0.22 },
      { ratio: 4, type: "sine", level: 0.05 },
    ],
    attack: 0.004,
    release: 0.12,
    filter: false,
  },
  bright: {
    partials: [
      { ratio: 1, type: "sawtooth", level: 0.6 },
      { ratio: 1.004, type: "sawtooth", level: 0.45 },
    ],
    attack: 0.006,
    release: 0.09,
    filter: true,
  },
  organ: {
    partials: [
      { ratio: 1, type: "sine", level: 1 },
      { ratio: 2, type: "sine", level: 0.55 },
      { ratio: 3, type: "sine", level: 0.3 },
      { ratio: 4, type: "sine", level: 0.15 },
    ],
    attack: 0.01,
    release: 0.04,
    filter: false,
  },
};

type Voice = {
  out: GainNode;
  oscs: OscillatorNode[];
  release: number;
  sustained: boolean;
};

function hold(param: AudioParam, t: number) {
  if (typeof param.cancelAndHoldAtTime === "function") param.cancelAndHoldAtTime(t);
  else {
    const v = param.value;
    param.cancelScheduledValues(t);
    param.setValueAtTime(v, t);
  }
}

class Synth {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private voices = new Map<number, Voice>();
  private sustain = false;
  private volume = 0.7;

  /** Must first run inside a user gesture so browsers let audio start. */
  private ensure(): { ctx: AudioContext; master: GainNode } {
    if (!this.ctx || !this.master) {
      // iOS mutes Web Audio under the silent switch unless the page asks to be treated as media playback.
      const session = (navigator as Navigator & { audioSession?: { type: string } }).audioSession;
      if (session) session.type = "playback";
      const ctx = new AudioContext({ latencyHint: "interactive" });
      // Hot reload re-runs this module but leaves the old context open; browsers cap how many
      // a page may hold, and past the cap new ones stay silent. Close the previous one.
      const shared = globalThis as { __keyboardAudio?: AudioContext };
      void shared.__keyboardAudio?.close().catch(() => {});
      shared.__keyboardAudio = ctx;
      const master = ctx.createGain();
      const limiter = ctx.createDynamicsCompressor();
      limiter.threshold.value = -10;
      limiter.ratio.value = 12;
      master.gain.value = this.volume ** 2;
      master.connect(limiter).connect(ctx.destination);
      this.ctx = ctx;
      this.master = master;
    }
    // Safari can also leave a context "interrupted" (calls, other tabs), not just "suspended".
    if (this.ctx.state !== "running") void this.ctx.resume();
    return { ctx: this.ctx, master: this.master };
  }

  noteOn(id: number, midi: number, velocity: number, timbre: Timbre) {
    const { ctx, master } = this.ensure();
    this.kill(id);
    const now = ctx.currentTime;
    const freq = midiToFreq(midi);
    const patch = PATCHES[timbre];
    const peak = 0.4 * (0.15 + 0.85 * velocity);

    const out = ctx.createGain();
    out.gain.setValueAtTime(0, now);
    out.gain.linearRampToValueAtTime(peak, now + patch.attack);
    if (timbre === "soft") out.gain.setTargetAtTime(0, now + patch.attack, 0.8);
    if (timbre === "bright") out.gain.setTargetAtTime(peak * 0.35, now + patch.attack, 0.3);
    out.connect(master);

    let into: AudioNode = out;
    if (patch.filter) {
      const lp = ctx.createBiquadFilter();
      lp.type = "lowpass";
      lp.Q.value = 3;
      const open = Math.min(freq * (4 + 8 * velocity), 14000);
      lp.frequency.setValueAtTime(open, now);
      lp.frequency.exponentialRampToValueAtTime(Math.max(freq * 1.5, 300), now + 1.4);
      lp.connect(out);
      into = lp;
    }

    const oscs = patch.partials.map((p) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = p.type;
      osc.frequency.value = freq * p.ratio;
      g.gain.value = p.level;
      osc.connect(g).connect(into);
      osc.start(now);
      return osc;
    });

    this.voices.set(id, { out, oscs, release: patch.release, sustained: false });
  }

  noteOff(id: number) {
    const voice = this.voices.get(id);
    if (!voice) return;
    if (this.sustain) {
      voice.sustained = true;
      return;
    }
    this.release(id, voice.release);
  }

  setSustain(on: boolean) {
    this.sustain = on;
    if (on) return;
    for (const [id, voice] of this.voices) if (voice.sustained) this.release(id, voice.release);
  }

  setVolume(volume: number) {
    this.volume = volume;
    if (this.ctx && this.master) this.master.gain.setTargetAtTime(volume ** 2, this.ctx.currentTime, 0.02);
  }

  allOff() {
    for (const id of [...this.voices.keys()]) this.release(id, 0.03);
  }

  private kill(id: number) {
    if (this.voices.has(id)) this.release(id, 0.008);
  }

  private release(id: number, tau: number) {
    const voice = this.voices.get(id);
    if (!voice || !this.ctx) return;
    this.voices.delete(id);
    const t = this.ctx.currentTime;
    hold(voice.out.gain, t);
    voice.out.gain.setTargetAtTime(0, t, tau);
    const end = t + tau * 8;
    for (const osc of voice.oscs) osc.stop(end);
    voice.oscs[0].onended = () => voice.out.disconnect();
  }
}

let synth: Synth | null = null;

/** One synth for the page, so a remount reuses its AudioContext instead of opening another. */
export function getSynth(): Synth {
  synth ??= new Synth();
  return synth;
}
