// What the two synthesized-sound modules share (sound.ts: the marimba, drums.ts: the kit).

export const vary = (spread: number) => (Math.random() * 2 - 1) * spread;

// White noise, optionally decaying (time constant in seconds), per channel.
export const noise = (ctx: BaseAudioContext, seconds: number, decay = Infinity, channels = 1) => {
  const length = Math.round(ctx.sampleRate * seconds);
  const buffer = new AudioBuffer({ numberOfChannels: channels, length, sampleRate: ctx.sampleRate });
  [...Array(channels).keys()].forEach((channel) =>
    buffer.copyToChannel(Float32Array.from({ length }, (_, i) => vary(1) * Math.exp(-i / (ctx.sampleRate * decay))), channel),
  );
  return buffer;
};
