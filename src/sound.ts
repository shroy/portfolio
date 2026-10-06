import { computed, signal, useAttributes, useEffect, useEvents, useText, type Children } from "hooktml";

// One synthesized marimba under the page, in D major: Web Audio only, no files, off by default
// and remembered. Work-index lanes and crumb names are tuned bars (a note on hover); project
// sections are chords on arrival (I–vi–IV–V: D, Bm, G, A), resolving home to D at Music; any
// press of a link or button is a soft rim click.

// ---------- What each key sounds like ----------

const sounds = {
  wistia: { note: 74, chord: [50, 57, 66], name: "D" }, // D5 · D3 A3 F#4
  unmute: { note: 78, chord: [47, 54, 62], name: "Bm" }, // F#5 · B2 F#3 D4
  provide: { note: 79, chord: [43, 50, 59], name: "G" }, // G5 · G2 D3 B3
  kickfirst: { note: 81, chord: [45, 52, 61], name: "A" }, // A5 · A2 E3 C#4
  "agentic-engineering": { note: 83 }, // B5
  "more-work": { note: 83 },
  hooktml: { note: 86 }, // D6
  roleprint: { note: 88 }, // E6
  music: { chord: [50, 57, 62, 66], name: "D" }, // D3 A3 D4 F#4: home
} as const satisfies Record<string, { note?: number; chord?: readonly number[]; name?: string }>;

type Key = keyof typeof sounds;
const isKey = (value: unknown): value is Key => typeof value === "string" && Object.hasOwn(sounds, value);

// ---------- Page-wide state ----------
// Like the one AudioContext it governs: whether sound is on (remembered), the engine once a
// press has created it, whether it's running, and the latest cue, which the toggle's meter shows.

type Cue = { level: number; seconds: number; ghost: boolean };

const on = signal(localStorage.getItem("sound") === "on");
const engine = signal<Engine | undefined>(undefined);
const running = signal(false);
const cue = signal<Cue | undefined>(undefined);
const chordName = signal("");
const recent = signal<readonly number[]>([]);
const lastNote = signal(0);
const desktop = matchMedia("(width >= 60rem)");
const still = matchMedia("(prefers-reduced-motion: reduce)");

// ---------- Engine ----------

const hz = (midi: number) => 440 * 2 ** ((midi - 69) / 12);
const vary = (spread: number) => (Math.random() * 2 - 1) * spread;

// White noise, optionally decaying (time constant in seconds), per channel.
const noise = (ctx: AudioContext, seconds: number, decay = Infinity, channels = 1) => {
  const length = Math.round(ctx.sampleRate * seconds);
  const buffer = new AudioBuffer({ numberOfChannels: channels, length, sampleRate: ctx.sampleRate });
  [...Array(channels).keys()].forEach((channel) =>
    buffer.copyToChannel(Float32Array.from({ length }, (_, i) => vary(1) * Math.exp(-i / (ctx.sampleRate * decay))), channel),
  );
  return buffer;
};

// Mix bus: a 90 Hz high-pass and gentle glue compression, with a small wooden room on a send
// (1.1 s of decaying noise, darkened).
const createEngine = () => {
  const ctx = new AudioContext({ latencyHint: "interactive" });
  const glue = new DynamicsCompressorNode(ctx, { threshold: -20, knee: 12, ratio: 3, attack: 0.003, release: 0.25 });
  const bus = new GainNode(ctx);
  bus
    .connect(new BiquadFilterNode(ctx, { type: "highpass", frequency: 90 }))
    .connect(glue)
    .connect(new GainNode(ctx, { gain: 0.8 }))
    .connect(ctx.destination);
  bus
    .connect(new GainNode(ctx, { gain: 0.14 }))
    .connect(new ConvolverNode(ctx, { buffer: noise(ctx, 1.1, 0.22, 2) }))
    .connect(new BiquadFilterNode(ctx, { type: "lowpass", frequency: 2500 }))
    .connect(glue);
  ctx.addEventListener("statechange", () => {
    running.value = ctx.state === "running";
  });
  return { ctx, bus, mallet: noise(ctx, 0.05) };
};

type Engine = ReturnType<typeof createEngine>;

// Creates or resumes the engine. Browsers allow it only inside a press or key.
const unlock = () => {
  if (!on.value) return undefined;
  const audio = engine.value ?? createEngine();
  engine.value = audio;
  if (audio.ctx.state === "suspended") void audio.ctx.resume();
  return audio;
};

// The engine, when sound may be heard right now.
const live = () => (on.value && running.value && desktop.matches && !document.hidden ? engine.value : undefined);

// One struck bar: partials at 1×, 4× and 9.9× (a tuned marimba bar), each decaying faster than
// the last, over a few milliseconds of band-passed mallet noise. ring is the fundamental's t60.
const bar = ({ ctx, bus, mallet }: Engine, at: number, midi: number, gain: number, ring: number, hardness: number) => {
  const freq = hz(midi) * 2 ** (vary(4) / 1200);
  const partials = [
    [1, 1, ring],
    [4, 0.24, ring * 0.22],
    [9.9, 0.06 * hardness, ring * 0.07],
  ] as const;
  partials
    .filter(([ratio]) => freq * ratio <= 12000)
    .forEach(([ratio, level, t60]) => {
      const env = new GainNode(ctx, { gain: 0 });
      env.gain
        .setValueAtTime(0, at)
        .linearRampToValueAtTime(gain * level, at + 0.003)
        .setTargetAtTime(0, at + 0.003, t60 / 6.9);
      const tone = new OscillatorNode(ctx, { frequency: freq * ratio });
      tone.connect(env).connect(bus);
      tone.addEventListener("ended", () => env.disconnect());
      tone.start(at);
      tone.stop(at + t60 + 0.05);
    });
  const strikeEnv = new GainNode(ctx, { gain: 0 });
  strikeEnv.gain.setValueAtTime(gain * 0.35 * hardness, at).setTargetAtTime(0, at, 0.004);
  const strike = new AudioBufferSourceNode(ctx, { buffer: mallet });
  strike
    .connect(new BiquadFilterNode(ctx, { type: "bandpass", frequency: Math.min(freq * 3, 6000), Q: 1.2 }))
    .connect(strikeEnv)
    .connect(bus);
  strike.start(at);
  strike.stop(at + 0.04);
};

// A wooden cross-stick: a 900 → 600 Hz knock under a short band-passed noise crack.
const rim = ({ ctx, bus, mallet }: Engine, gain: number) => {
  const at = ctx.currentTime;
  const crackEnv = new GainNode(ctx, { gain: 0 });
  crackEnv.gain.setValueAtTime(gain, at).setTargetAtTime(0, at + 0.001, 0.012);
  const crack = new AudioBufferSourceNode(ctx, { buffer: mallet });
  crack
    .connect(new BiquadFilterNode(ctx, { type: "bandpass", frequency: 1900 * (1 + vary(0.06)), Q: 2.5 }))
    .connect(crackEnv)
    .connect(bus);
  crack.start(at);
  crack.stop(at + 0.05);
  const knockEnv = new GainNode(ctx, { gain: 0 });
  knockEnv.gain.setValueAtTime(gain * 0.6, at).setTargetAtTime(0, at + 0.001, 0.015);
  const knock = new OscillatorNode(ctx, { type: "triangle" });
  knock.frequency.setValueAtTime(900, at).exponentialRampToValueAtTime(600, at + 0.025);
  knock.connect(knockEnv).connect(bus);
  knock.start(at);
  knock.stop(at + 0.08);
};

// Cue density: each cue in the last two seconds trims the next by 8%, down to 45%.
const governed = (gain: number) => {
  const now = performance.now();
  recent.value = [...recent.value.filter((t) => now - t < 2000), now];
  return gain * Math.max(0.45, 1 - 0.08 * (recent.value.length - 1)) * 10 ** (vary(1.5) / 20);
};

// Every cue lights the meter; with nothing to hear, it flickers faintly as a hint.
const flash = (level: number, seconds: number) => {
  cue.value = { level, seconds, ghost: !live() };
};

// ---------- Cues ----------

// A lane's hover rule is its string: struck full width, it settles in a damped wobble.
const pluck = (el: HTMLElement) =>
  el.animate(
    still.matches
      ? [{ scale: "1 1" }, { scale: "1 1" }]
      : [0, 1.6, -1.2, 0.8, -0.5, 0.25, 0].map((y) => ({ scale: "1 1", translate: `0 ${y}px` })),
    { duration: 420, easing: "ease-out", pseudoElement: "::before" },
  );

const note = (el: HTMLElement, key: Key) => {
  const sound = sounds[key];
  const now = performance.now();
  if (!("note" in sound) || now - lastNote.value < 40) return;
  lastNote.value = now;
  const audio = live();
  if (audio) {
    bar(audio, audio.ctx.currentTime, sound.note, governed(0.075), 0.42, 1);
    pluck(el);
  }
  flash(0.55, 0.4);
};

// A section's chord, strummed in the direction of travel; softer and shorter on a return.
const strum = (key: Key, falling: boolean, revisit: boolean) => {
  const sound = sounds[key];
  const audio = live();
  if (!("chord" in sound)) return;
  if (!audio) return flash(1, 1.2);
  const home = key === "music";
  const level = governed(revisit ? 0.028 : 0.055);
  const ring = (home ? 2.2 : 1.6) * (revisit ? 0.7 : 1);
  const start = audio.ctx.currentTime;
  const root = sound.chord[0];
  (falling ? sound.chord.toReversed() : sound.chord).forEach((midi, i) =>
    bar(audio, start + i * (home ? 0.04 : 0.024), midi, midi === root ? level * 1.2 : level, ring, 0.5),
  );
  chordName.value = sound.name;
  flash(revisit ? 0.7 : 1, ring * 0.8);
};

// Turning sound on: a rising fifth, D5 to A5.
const confirm = (audio: Engine) => {
  const at = audio.ctx.currentTime + 0.01;
  bar(audio, at, 74, 0.07, 0.5, 1);
  bar(audio, at + 0.09, 81, 0.07, 0.6, 1);
  flash(0.6, 0.5);
};

// ---------- use-sound="<key>" ----------
// On a link or button: its key's note on hover or keyboard focus. On anything else (a section):
// its key's chord as it crosses the middle of the viewport. The first report after a load is
// silent, and a short settle lets jumps and flings sound only where they land.

export const useSound = (el: HTMLElement, { value }: { value?: unknown }) => {
  if (!isKey(value)) return undefined;
  const key = value;
  const control = el instanceof HTMLAnchorElement || el instanceof HTMLButtonElement;
  const played = signal(0);
  const heard = signal(false);
  const primed = signal(false);
  const pending = signal(0);

  const play = () => {
    const now = performance.now();
    if (now - played.value < 250) return;
    played.value = now;
    note(el, key);
  };

  useEvents(control ? el : null, {
    pointerenter: (event) => {
      if (event instanceof PointerEvent && event.pointerType !== "touch") play();
    },
    focus: () => {
      if (el.matches(":focus-visible")) play();
    },
  });

  const arrival = control
    ? undefined
    : new IntersectionObserver(
        ([entry]) => {
          const first = !primed.value;
          primed.value = true;
          clearTimeout(pending.value);
          if (!entry?.isIntersecting) return;
          if (first) {
            heard.value = true;
            return;
          }
          const falling = entry.boundingClientRect.top < 0;
          pending.value = window.setTimeout(() => {
            strum(key, falling, heard.value);
            heard.value = true;
          }, 120);
        },
        { rootMargin: "-50% 0px -50% 0px" },
      );
  arrival?.observe(el);

  return () => {
    arrival?.disconnect();
    clearTimeout(pending.value);
  };
};

// ---------- The toggle ----------
// Its state is the DOM's: aria-pressed, and data-state for off, on, or on but waiting for the
// click browsers require before any sound (a reload, a return from another page).

const titles = { off: "Turn sound on", on: "Turn sound off", waiting: "Sound is on: click to start it" } as const;

export const SoundToggle = (el: HTMLElement, { children }: { children: Children<"chords" | "segments"> }) => {
  const { segments } = children;
  const state = computed(() => (!on.value ? "off" : running.value ? "on" : "waiting"));
  // A press on the toggle while it waits starts the sound rather than turning it off. Noted at
  // press time: by the time the click lands, the sound may already be running.
  const starting = signal(false);

  const press = (target: EventTarget | null, strike: boolean) => {
    const element = target instanceof Element ? target : null;
    starting.value = state.value === "waiting" && el.contains(element);
    unlock();
    const control = element?.closest("a, button");
    const audio = live();
    if (strike && audio && control && control !== el) {
      rim(audio, governed(0.07));
      flash(0.35, 0.18);
    }
  };

  const toggle = () => {
    if (!starting.value) {
      on.value = !on.value;
      localStorage.setItem("sound", on.value ? "on" : "off");
    }
    starting.value = false;
    const audio = on.value ? unlock() : engine.value;
    if (on.value && audio) confirm(audio);
    else void audio?.ctx.suspend();
  };

  useAttributes(
    el,
    {
      hidden: null,
      "aria-pressed": () => String(on.value),
      "data-state": () => state.value,
      title: () => titles[state.value],
    },
    [on, state],
  );
  useText(children.chords[0], () => (on.value ? chordName.value : ""), [on, chordName]);
  useEvents(el, { click: toggle });

  // The meter follows each cue's envelope: lit on the hit, a short hold, then the top segments
  // fall first, back to their resting opacity.
  useEffect(() => {
    const lit = cue.value;
    if (!lit) return;
    const peak = lit.ghost ? 0.5 : 1;
    segments.slice(0, Math.ceil(lit.level * segments.length * (lit.ghost ? 0.4 : 1))).forEach((segment, i) =>
      segment.animate([{ opacity: peak, offset: 0 }, { opacity: peak, offset: 0.15, easing: "ease-out" }], {
        duration: lit.seconds * 1000 * (1 - i / (segments.length + 1)),
      }),
    );
  }, [cue]);
  useEffect(() => {
    if (chordName.value) children.chords[0]?.animate([{ opacity: 1, offset: 0 }], { duration: 1600, easing: "ease-out" });
  }, [chordName]);

  return useEvents(document, {
    pointerdown: (event) => press(event.target, event instanceof PointerEvent && event.button === 0),
    keydown: (event) => press(event.target, event instanceof KeyboardEvent && event.key === "Enter"),
    visibilitychange: () => {
      const audio = engine.value;
      if (document.hidden) void audio?.ctx.suspend();
      else if (on.value) void audio?.ctx.resume();
    },
  });
};
