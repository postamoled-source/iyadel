// Lightweight Web Audio sound effects for the mini-games (tools).
let ctx = null;
let master = null;

function ensure() {
  if (ctx) return ctx;
  try {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    master = ctx.createGain();
    master.gain.value = 0.18;
    master.connect(ctx.destination);
  } catch (e) {
    ctx = null;
  }
  return ctx;
}

export function resumeAudio() {
  const c = ensure();
  if (c && c.state === 'suspended') c.resume().catch(() => {});
}

function tone(freq, dur = 0.12, type = 'sine', vol = 1, glide) {
  const c = ensure();
  if (!c) return;
  const t = c.currentTime;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  if (glide) osc.frequency.exponentialRampToValueAtTime(Math.max(40, glide), t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(Math.max(0.0001, vol), t + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(g);
  g.connect(master);
  osc.start(t);
  osc.stop(t + dur + 0.02);
}

function seq(notes, type = 'square', vol = 0.9) {
  notes.forEach((n, i) => setTimeout(() => tone(n.f, n.d || 0.12, type, vol, n.g), i * (n.s || 110)));
}

export const playStart = () => seq([{ f: 523, d: 0.1 }, { f: 659, d: 0.1 }, { f: 784, d: 0.16 }], 'triangle');
export const playGameOver = () => seq([{ f: 392, d: 0.14 }, { f: 330, d: 0.14 }, { f: 262, d: 0.22 }], 'sawtooth', 0.7);
export const playWin = () => seq([{ f: 523, d: 0.1 }, { f: 659, d: 0.1 }, { f: 784, d: 0.1 }, { f: 1047, d: 0.2 }], 'triangle');
export const playCorrect = () => seq([{ f: 659, d: 0.09 }, { f: 880, d: 0.12 }], 'triangle');
export const playWrong = () => tone(180, 0.22, 'sawtooth', 0.8, 90);
export const playShuffle = () => seq([{ f: 440, d: 0.06 }, { f: 380, d: 0.06 }, { f: 500, d: 0.06 }, { f: 420, d: 0.08 }], 'square', 0.6);
export const playMove = () => tone(330, 0.07, 'square', 0.6);
export const playMerge = () => seq([{ f: 440, d: 0.08 }, { f: 660, d: 0.1 }], 'triangle');
export const playLaunch = () => tone(220, 0.18, 'sawtooth', 0.8, 660);
export const playBounce = () => tone(440, 0.09, 'sine', 0.7, 320);
export const playPop = () => tone(660, 0.08, 'triangle', 0.8, 880);
export const playWhack = () => tone(520, 0.1, 'square', 0.9, 220);
// Balloon-style "pop": a short papery noise burst + a quick pitch-down thud.
export const playBubblePop = () => {
  const c = ensure();
  if (!c) return;
  const t = c.currentTime;
  const dur = 0.13;
  const n = Math.floor(c.sampleRate * dur);
  const buffer = c.createBuffer(1, n, c.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < n; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 3);
  const noise = c.createBufferSource(); noise.buffer = buffer;
  const bp = c.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 900; bp.Q.value = 0.7;
  const ng = c.createGain(); ng.gain.setValueAtTime(0.7, t); ng.gain.exponentialRampToValueAtTime(0.001, t + dur);
  noise.connect(bp); bp.connect(ng); ng.connect(master); noise.start(t); noise.stop(t + dur);
  const osc = c.createOscillator(); const og = c.createGain();
  osc.type = 'sine'; osc.frequency.setValueAtTime(440, t); osc.frequency.exponentialRampToValueAtTime(110, t + 0.11);
  og.gain.setValueAtTime(0.5, t); og.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
  osc.connect(og); og.connect(master); osc.start(t); osc.stop(t + 0.14);
};