// Lightweight Web Audio sound effects for mini-games. No audio files — sounds
// are synthesized on the fly so they stay private and add zero payload.
let ctx = null;

const getCtx = () => {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    try { ctx = new (window.AudioContext || window.webkitAudioContext)(); }
    catch { return null; }
  }
  if (ctx.state === "suspended") { try { ctx.resume(); } catch {} }
  return ctx;
};

const tone = (freq, duration, type = "sine", gain = 0.14, slideTo) => {
  const ac = getCtx();
  if (!ac) return;
  try {
    const osc = ac.createOscillator();
    const g = ac.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ac.currentTime);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(Math.max(slideTo, 1), ac.currentTime + duration);
    g.gain.setValueAtTime(gain, ac.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0008, ac.currentTime + duration);
    osc.connect(g);
    g.connect(ac.destination);
    osc.start();
    osc.stop(ac.currentTime + duration);
  } catch {}
};

// Ball Launcher
export const playLaunch = () => tone(180, 0.16, "sawtooth", 0.1, 520);
export const playBounce = () => tone(420, 0.04, "triangle", 0.06);
export const playPop = () => { tone(680, 0.07, "square", 0.13); setTimeout(() => tone(1020, 0.07, "square", 0.1), 50); };

// Whack-a-Mole
export const playWhack = () => { tone(200, 0.05, "square", 0.16, 110); };
export const playSqueak = () => tone(880, 0.06, "square", 0.08, 1320);

// 2048
export const playMove = () => tone(260, 0.05, "triangle", 0.05);
export const playMerge = () => { tone(520, 0.06, "sine", 0.12); setTimeout(() => tone(780, 0.08, "sine", 0.1), 40); };
export const playWin = () => {
  tone(523, 0.1, "sine", 0.12);
  setTimeout(() => tone(659, 0.1, "sine", 0.12), 100);
  setTimeout(() => tone(784, 0.16, "sine", 0.12), 200);
};

// Puzzle games (Math Puzzle, Word Scramble)
export const playCorrect = () => {
  tone(523, 0.08, "sine", 0.12);
  setTimeout(() => tone(784, 0.09, "sine", 0.12), 70);
  setTimeout(() => tone(1047, 0.12, "sine", 0.12), 140);
};
export const playWrong = () => tone(220, 0.2, "sawtooth", 0.1, 110);
export const playShuffle = () => { tone(400, 0.05, "triangle", 0.08, 700); };

// Shared
export const playGameOver = () => {
  tone(440, 0.18, "sine", 0.14, 220);
  setTimeout(() => tone(330, 0.22, "sine", 0.12, 160), 130);
};
export const playStart = () => { tone(523, 0.08, "sine", 0.1); setTimeout(() => tone(784, 0.1, "sine", 0.1), 80); };

export const resumeAudio = () => getCtx();