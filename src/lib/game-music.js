// Simple procedural background music for the mini-games (tools).
let ctx = null;
let master = null;
let timer = null;
let currentTheme = null;

function ensure() {
  if (ctx) return ctx;
  try {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    master = ctx.createGain();
    master.gain.value = 0.08;
    master.connect(ctx.destination);
  } catch (e) { ctx = null; }
  return ctx;
}

export function resumeMusicAudio() {
  const c = ensure();
  if (c && c.state === 'suspended') c.resume().catch(() => {});
}

const THEMES = {
  snake: [330, 392, 440, 494],
  game2048: [294, 370, 440, 587],
  whackamole: [392, 523, 659, 494],
  memory: [349, 440, 523, 392],
  ball: [262, 330, 392, 494],
  default: [330, 392, 440, 494],
};

function step() {
  const c = ensure();
  if (!c) return;
  const notes = THEMES[currentTheme] || THEMES.default;
  const f = notes[Math.floor(Math.random() * notes.length)];
  const t = c.currentTime;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(f, t);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.9, t + 0.03);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.34);
  osc.connect(g);
  g.connect(master);
  osc.start(t);
  osc.stop(t + 0.36);
}

export function startMusic(theme = 'default') {
  resumeMusicAudio();
  if (timer) { clearInterval(timer); timer = null; }
  currentTheme = theme;
  step();
  timer = setInterval(step, 360);
}

export function stopMusic() {
  if (timer) { clearInterval(timer); timer = null; }
  currentTheme = null;
}

export function isPlaying(theme) {
  return !!timer && (theme ? currentTheme === theme : true);
}