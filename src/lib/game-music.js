// Procedural background music for mini-games. Each game gets its own unique
// theme (bass line + melody + pad) synthesized live via the Web Audio API.
// No audio files are loaded — stays private, zero payload, no tracking.

let ctx = null;
let master = null;
let timer = null;
let step = 0;
let current = null;

const getCtx = () => {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    try { ctx = new (window.AudioContext || window.webkitAudioContext)(); }
    catch { return null; }
  }
  if (ctx.state === "suspended") { try { ctx.resume(); } catch {} }
  return ctx;
};

// Convert a note name like "A4" / "C#5" to frequency (A4 = 440Hz).
const SEMI = { C: 0, "C#": 1, D: 2, "D#": 3, E: 4, F: 5, "F#": 6, G: 7, "G#": 8, A: 9, "A#": 10, B: 11 };
const noteFreq = (n) => {
  if (!n) return 0;
  const m = String(n).match(/^([A-G]#?)(-?\d)$/);
  if (!m) return 0;
  const semis = SEMI[m[1]] + (parseInt(m[2], 10) - 4) * 12 - 9;
  return 440 * Math.pow(2, semis / 12);
};

const voice = (freq, t, dur, type, vol) => {
  const ac = getCtx();
  if (!ac || !freq) return;
  const o = ac.createOscillator();
  const g = ac.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(vol, t + 0.015);
  g.gain.exponentialRampToValueAtTime(0.0006, t + dur);
  o.connect(g);
  g.connect(master || ac.destination);
  o.start(t);
  o.stop(t + dur + 0.05);
};

// One unique theme per game. bpm + bass progression + melody + pad chord.
const THEMES = {
  snake:        { bpm: 96,  bassType: "sawtooth", leadType: "triangle", leadVol: 0.07, bass: ["A2","A2","F2","G2","E2","E2","G2","A2"], lead: ["A4","C5","E5","A4","C5","E5","G5","E5"], pad: ["A3","C4","E4"] },
  "2048":       { bpm: 88,  bassType: "triangle", leadType: "sine",     leadVol: 0.08, bass: ["D3","A2","B2","F2"],                lead: ["D4","F4","A4","D5","A4","F4","E4","C4"], pad: ["D3","F4","A4"] },
  memory:       { bpm: 100, bassType: "sine",     leadType: "triangle", leadVol: 0.07, bass: ["C3","G2","A2","F2"],                lead: ["C4","E4","G4","C5","G4","E4","D4","C4"], pad: ["C3","E4","G4"] },
  whackamole:   { bpm: 132, bassType: "square",   leadType: "square",   leadVol: 0.055,bass: ["C3","C3","G2","G2","A2","A2","F2","G2"], lead: ["C5","G4","C5","G4","A4","E5","A4","G4"], pad: ["C3","E4","G4"] },
  balllauncher: { bpm: 128, bassType: "sawtooth", leadType: "square",   leadVol: 0.055,bass: ["E2","E2","B2","C3","A2","A2","D3","B2"], lead: ["E4","G4","B4","E5","D5","B4","G4","E4"], pad: ["E3","G4","B4"] },
  mathpuzzle:   { bpm: 92,  bassType: "triangle", leadType: "sine",     leadVol: 0.08, bass: ["D2","D2","A2","B2"],                lead: ["D4","F4","A4","D5","C5","A4","F4","D4"], pad: ["D3","F4","A4"] },
  wordscramble: { bpm: 110, bassType: "triangle", leadType: "triangle", leadVol: 0.07, bass: ["G2","D3","E3","C3"],                lead: ["G4","B4","D5","G5","D5","B4","A4","G4"], pad: ["G3","B4","D5"] },
  riddle:       { bpm: 76,  bassType: "sine",     leadType: "sine",     leadVol: 0.07, bass: ["D3","A2","F2","G2"],                lead: ["D4","F4","A4","D5","C5","A4","F4","D4"], pad: ["D3","F4","A4"] },
  iyadel:       { bpm: 108, bassType: "triangle", leadType: "triangle", leadVol: 0.04, bass: ["A2","A2","E2","G2","A2","A2","D2","E2"], lead: ["A4","E5","A4","C5","E5","A4","C5","E5"], pad: ["A3","E4","A4"] },
};

export function startMusic(theme) {
  const ac = getCtx();
  if (!ac) return;
  if (current === theme && timer) return;
  stopMusic();
  const th = THEMES[theme];
  if (!th) return;
  if (!master) {
    master = ac.createGain();
    master.gain.value = 0.22;
    master.connect(ac.destination);
  }
  current = theme;
  step = 0;
  const beat = 60 / th.bpm;
  const schedule = () => {
    const t = ac.currentTime + 0.06;
    const i = step;
    voice(noteFreq(th.bass[i % th.bass.length]), t, beat * 0.9, th.bassType, 0.1);
    voice(noteFreq(th.lead[i % th.lead.length]), t, beat * 0.8, th.leadType, th.leadVol);
    if (i % 4 === 0) {
      for (const p of th.pad) voice(noteFreq(p), t, beat * 3.6, "sine", 0.045);
    }
    step++;
  };
  schedule();
  timer = setInterval(schedule, beat * 1000);
}

export function stopMusic() {
  if (timer) { clearInterval(timer); timer = null; }
  current = null;
}

export function isPlaying(theme) {
  return current === theme;
}

export function resumeMusicAudio() {
  return getCtx();
}