import { signal } from "hooktml";
import { noise, vary } from "./audio";

// The 404's rock kit, synthesized with Web Audio: no samples. Each drum is a few layers the way
// a real one is (the head's pitch dropping on impact, the shell's boom, the snare wires, a
// stick's click) through a compressed bus and a small live room. No two hits are alike: level and
// pitch drift a little, and noise starts at a random point in a long take.

export const pieces = ["crash", "hihat", "hightom", "ride", "lowtom", "snare", "floor", "kick"] as const;
export type Piece = (typeof pieces)[number];
export const isPiece = (value: unknown): value is Piece => pieces.some((piece) => piece === value);

// ---------- Engine ----------

// Mix bus: a 35 Hz high-pass and glue compression, with a room on a send (0.9 s of decaying
// stereo noise, darkened). `air` is one long take of noise that every noisy part reads from.
const createEngine = () => {
  const ctx = new AudioContext({ latencyHint: "interactive" });
  const glue = new DynamicsCompressorNode(ctx, { threshold: -16, knee: 10, ratio: 5, attack: 0.004, release: 0.2 });
  const bus = new GainNode(ctx);
  bus
    .connect(new BiquadFilterNode(ctx, { type: "highpass", frequency: 35 }))
    .connect(glue)
    .connect(new GainNode(ctx, { gain: 0.8 }))
    .connect(ctx.destination);
  bus
    .connect(new GainNode(ctx, { gain: 0.22 }))
    .connect(new ConvolverNode(ctx, { buffer: noise(ctx, 0.9, 0.2, 2) }))
    .connect(new BiquadFilterNode(ctx, { type: "lowpass", frequency: 3200 }))
    .connect(glue);
  return { ctx, bus, air: noise(ctx, 3) };
};

type Engine = ReturnType<typeof createEngine>;

// Silent to a peak in 2 ms, then dying away over `decay` seconds (a t60: the time to fall 60 dB).
const envelope = (ctx: BaseAudioContext, at: number, peak: number, decay: number) => {
  const gain = new GainNode(ctx, { gain: 0 });
  gain.gain
    .setValueAtTime(0, at)
    .linearRampToValueAtTime(peak, at + 0.002)
    .setTargetAtTime(0, at + 0.002, decay / 6.9);
  return gain;
};

// ---------- Parts ----------

// A pitched part: a head or shell ringing, sweeping from `from` down to `to` over `sweep` seconds.
const tone = (
  { ctx, bus }: Engine,
  at: number,
  { shape = "sine", from, to = from, sweep = 0.05, peak, decay }: {
    shape?: OscillatorType;
    from: number;
    to?: number;
    sweep?: number;
    peak: number;
    decay: number;
  },
) => {
  const pitch = 2 ** (vary(18) / 1200);
  const osc = new OscillatorNode(ctx, { type: shape, frequency: from * pitch });
  osc.frequency.setValueAtTime(from * pitch, at).exponentialRampToValueAtTime(to * pitch, at + sweep);
  const env = envelope(ctx, at, peak, decay);
  osc.connect(env).connect(bus);
  osc.addEventListener("ended", () => env.disconnect());
  osc.start(at);
  osc.stop(at + decay + 0.05);
};

// A noisy part: wires, a click, a cymbal's wash, taken through one filter.
const hiss = (
  { ctx, bus, air }: Engine,
  at: number,
  { type, frequency, q = 0.7, peak, decay }: { type: BiquadFilterType; frequency: number; q?: number; peak: number; decay: number },
) => {
  const source = new AudioBufferSourceNode(ctx, { buffer: air });
  const env = envelope(ctx, at, peak, decay);
  source
    .connect(new BiquadFilterNode(ctx, { type, frequency: frequency * 2 ** (vary(40) / 1200), Q: q }))
    .connect(env)
    .connect(bus);
  source.addEventListener("ended", () => env.disconnect());
  source.start(at, Math.random() * (air.duration - decay - 0.1));
  source.stop(at + decay + 0.05);
};

// A cymbal's metal: square waves at the inharmonic ratios of struck bronze, high-passed.
const metal = (
  { ctx, bus }: Engine,
  at: number,
  { base, ratios, cutoff, peak, decay }: { base: number; ratios: readonly number[]; cutoff: number; peak: number; decay: number },
) => {
  const env = envelope(ctx, at, peak, decay);
  const filter = new BiquadFilterNode(ctx, { type: "highpass", frequency: cutoff });
  filter.connect(env).connect(bus);
  ratios.forEach((ratio, i) => {
    const osc = new OscillatorNode(ctx, { type: "square", frequency: base * ratio * 2 ** (vary(12) / 1200) });
    osc.connect(filter);
    if (i === 0) osc.addEventListener("ended", () => env.disconnect());
    osc.start(at);
    osc.stop(at + decay + 0.05);
  });
};

// ---------- The kit ----------

const bronze = [1, 1.4471, 1.617, 1.9265, 2.5028, 2.6637] as const;

// Birch toms with loose heads, tuned low. They differ only in pitch and ring: the slack head
// droops a long way onto its note (the sag is the sound), an octave partial keeps the note
// audible on small speakers, and the stick lands as a short click and a low, wooden "tock".
const tom = (e: Engine, at: number, g: number, pitch: number, ring: number) => {
  tone(e, at, { from: pitch * 1.7, to: pitch, sweep: 0.11, peak: 1 * g, decay: ring });
  tone(e, at, { from: pitch * 3, to: pitch * 2, sweep: 0.09, peak: 0.38 * g, decay: ring * 0.5 });
  hiss(e, at, { type: "bandpass", frequency: 2200, q: 0.9, peak: 0.5 * g, decay: 0.015 });
  hiss(e, at, { type: "bandpass", frequency: 520, q: 1.1, peak: 0.6 * g, decay: 0.045 });
  hiss(e, at, { type: "highpass", frequency: 5000, peak: 0.1 * g, decay: 0.008 });
};

// Every voice takes the engine, when to start and a level (the hit's loudness, about 1).
const voices = {
  // A big rock kick: the thump, the shell's boom, the knock of the head, and a hard beater: a
  // click and a mid slap on top.
  kick: (e, at, g) => {
    tone(e, at, { from: 190, to: 52, sweep: 0.06, peak: 1 * g, decay: 0.42 });
    tone(e, at, { from: 64, to: 44, sweep: 0.25, peak: 0.5 * g, decay: 0.55 });
    tone(e, at, { shape: "triangle", from: 260, to: 170, sweep: 0.05, peak: 0.22 * g, decay: 0.09 });
    hiss(e, at, { type: "bandpass", frequency: 3400, q: 1, peak: 0.6 * g, decay: 0.02 });
    hiss(e, at, { type: "bandpass", frequency: 1800, q: 0.8, peak: 0.35 * g, decay: 0.03 });
    hiss(e, at, { type: "highpass", frequency: 5000, peak: 0.25 * g, decay: 0.008 });
  },
  // A fat rock snare: two shell modes, the wires' buzz and sizzle, and the stick's crack.
  snare: (e, at, g) => {
    tone(e, at, { shape: "triangle", from: 190, to: 165, sweep: 0.03, peak: 0.9 * g, decay: 0.16 });
    tone(e, at, { from: 330, to: 300, sweep: 0.03, peak: 0.3 * g, decay: 0.09 });
    hiss(e, at, { type: "bandpass", frequency: 4500, q: 0.5, peak: 1 * g, decay: 0.22 });
    hiss(e, at, { type: "highpass", frequency: 8000, peak: 0.3 * g, decay: 0.12 });
    hiss(e, at, { type: "bandpass", frequency: 2200, q: 1.2, peak: 0.45 * g, decay: 0.012 });
  },
  // Toms: a head dropping in pitch, an overtone above it, a stick's click.
  hightom: (e, at, g) => tom(e, at, g, 112, 0.6),
  lowtom: (e, at, g) => tom(e, at, g, 90, 0.7),
  floor: (e, at, g) => tom(e, at, g, 66, 0.9),
  // Closed hats: a tight burst of metal and noise.
  hihat: (e, at, g) => {
    metal(e, at, { base: 320, ratios: bronze, cutoff: 7000, peak: 0.24 * g, decay: 0.07 });
    hiss(e, at, { type: "highpass", frequency: 8000, peak: 0.42 * g, decay: 0.05 });
  },
  // A crash: a stick's crack, then metal and a wash of noise that takes a couple of seconds to die.
  crash: (e, at, g) => {
    hiss(e, at, { type: "highpass", frequency: 3000, peak: 0.45 * g, decay: 0.08 });
    metal(e, at, { base: 380, ratios: [...bronze, 3.4], cutoff: 5000, peak: 0.1 * g, decay: 1.5 });
    hiss(e, at, { type: "bandpass", frequency: 5800, q: 0.5, peak: 0.45 * g, decay: 1.7 });
    hiss(e, at, { type: "highpass", frequency: 9000, peak: 0.26 * g, decay: 2.3 });
  },
  // A ride: a clear ping over a softer wash, with the bell's two high partials.
  ride: (e, at, g) => {
    hiss(e, at, { type: "bandpass", frequency: 5200, q: 1, peak: 0.35 * g, decay: 0.01 });
    metal(e, at, { base: 560, ratios: bronze, cutoff: 6000, peak: 0.09 * g, decay: 1.1 });
    hiss(e, at, { type: "bandpass", frequency: 7000, q: 1, peak: 0.2 * g, decay: 0.55 });
    tone(e, at, { from: 3100, peak: 0.09 * g, decay: 0.25 });
    tone(e, at, { from: 4650, peak: 0.05 * g, decay: 0.15 });
  },
} satisfies Record<Piece, (engine: Engine, at: number, level: number) => void>;

// ---------- Playing ----------

const engine = signal<Engine | undefined>(undefined);
const recent = signal<readonly number[]>([]);

// Creates or resumes the engine. Browsers allow it only inside a press or key; iOS only on the
// release of a touch, so the kit calls this on both.
export const unlock = () => {
  const audio = engine.value ?? createEngine();
  engine.value = audio;
  if (audio.ctx.state === "suspended") void audio.ctx.resume();
  return audio;
};

// Hit density: each hit in the last 1.5 seconds trims the next by 5%, down to 60%, so a roll
// stays a roll instead of stacking up; and no two hits land at quite the same level.
const governed = () => {
  const now = performance.now();
  recent.value = [...recent.value.filter((t) => now - t < 1500), now];
  return Math.max(0.6, 1 - 0.05 * (recent.value.length - 1)) * 10 ** (vary(2) / 20);
};

export const play = (piece: Piece) => {
  const audio = unlock();
  voices[piece](audio, audio.ctx.currentTime, governed());
};
