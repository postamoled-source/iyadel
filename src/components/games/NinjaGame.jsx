import { useRef, useEffect, useState, useCallback } from "react";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Heart, Flame, Swords, ChevronLeft, ChevronRight, Play, RotateCcw, Trophy } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const VW = 400, VH = 560;
const GROUND = 500;
const GRAVITY = 0.7;

// ---------- Audio (synthesized ninja music + SFX) ----------
let actx;
const ctx = () => { if (!actx) actx = new (window.AudioContext || window.webkitAudioContext)(); return actx; };
const resumeAudio = () => { const c = ctx(); if (c.state === "suspended") c.resume(); };

const beep = (freq, dur, type = "sine", vol = 0.18, slide) => {
  const c = ctx(); const o = c.createOscillator(); const g = c.createGain();
  o.type = type; o.frequency.value = freq;
  if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(slide, 40), c.currentTime + dur);
  g.gain.setValueAtTime(vol, c.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + dur);
  o.connect(g).connect(c.destination); o.start(); o.stop(c.currentTime + dur);
};
const noise = (dur, vol = 0.2) => {
  const c = ctx(); const len = Math.floor(c.sampleRate * dur);
  const buf = c.createBuffer(1, len, c.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
  const src = c.createBufferSource(); src.buffer = buf;
  const g = c.createGain(); g.gain.value = vol;
  const f = c.createBiquadFilter(); f.type = "highpass"; f.frequency.value = 800;
  src.connect(f).connect(g).connect(c.destination); src.start();
};
const SFX = {
  jump: () => beep(420, 0.16, "square", 0.16, 720),
  swing: () => noise(0.16, 0.22),
  hit: () => beep(180, 0.12, "sawtooth", 0.2, 90),
  fire: () => { beep(120, 0.22, "sawtooth", 0.18, 520); noise(0.18, 0.12); },
  collect: () => { beep(660, 0.08, "triangle", 0.18); setTimeout(() => beep(990, 0.12, "triangle", 0.18), 80); },
  hurt: () => beep(300, 0.22, "sawtooth", 0.2, 120),
  levelUp: () => { [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => beep(f, 0.18, "triangle", 0.2), i * 110)); },
  over: () => { [392, 330, 262].forEach((f, i) => setTimeout(() => beep(f, 0.3, "sawtooth", 0.2), i * 200)); },
  win: () => { [523, 659, 784, 1047, 1319].forEach((f, i) => setTimeout(() => beep(f, 0.22, "triangle", 0.2), i * 130)); },
};

// Simple pentatonic oriental-flavored loop.
const SCALE = [440, 523.25, 587.33, 659.25, 783.99, 880];
let musicTimer = null, musicOn = false;
const startMusic = () => {
  if (musicOn) return; musicOn = true;
  let step = 0;
  const tick = () => {
    if (!musicOn) return;
    const c = ctx();
    // melody
    const f = SCALE[Math.floor(Math.random() * SCALE.length)];
    const o = c.createOscillator(); const g = c.createGain();
    o.type = "triangle"; o.frequency.value = f;
    g.gain.setValueAtTime(0.05, c.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.5);
    o.connect(g).connect(c.destination); o.start(); o.stop(c.currentTime + 0.5);
    // drone every 2 steps
    if (step % 2 === 0) {
      const d = c.createOscillator(); const dg = c.createGain();
      d.type = "sine"; d.frequency.value = 110;
      dg.gain.setValueAtTime(0.04, c.currentTime);
      dg.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.8);
      d.connect(dg).connect(c.destination); d.start(); d.stop(c.currentTime + 0.8);
    }
    step++;
    musicTimer = setTimeout(tick, 360);
  };
  tick();
};
const stopMusic = () => { musicOn = false; if (musicTimer) { clearTimeout(musicTimer); musicTimer = null; } };

// ---------- Levels ----------
const LEVELS = [
  { name: "Bamboo Forest", enemies: [
      { type: "soldier", x: 240, y: 470, bound: [200, 330] },
      { type: "soldier", x: 100, y: 470, bound: [60, 160] },
      { type: "monster", x: 320, y: 470, bound: [280, 380] },
    ], treasure: { x: 360, y: 430 }, theme: "forest" },
  { name: "Cursed Cave", enemies: [
      { type: "soldier", x: 120, y: 470, bound: [60, 200] },
      { type: "monster", x: 280, y: 470, bound: [220, 360] },
      { type: "monster", x: 200, y: 470, bound: [160, 260] },
      { type: "soldier", x: 340, y: 470, bound: [300, 380] },
    ], treasure: { x: 50, y: 430 }, theme: "cave" },
  { name: "Castle at Night", enemies: [
      { type: "monster", x: 120, y: 470, bound: [60, 200] },
      { type: "monster", x: 280, y: 470, bound: [220, 360] },
      { type: "soldier", x: 200, y: 470, bound: [120, 300], hp: 3, big: true },
      { type: "monster", x: 340, y: 470, bound: [300, 380] },
    ], treasure: { x: 360, y: 430 }, theme: "castle" },
];

// ---------- Background painters ----------
function drawBackground(ctx2, theme, t) {
  if (theme === "forest") {
    const g = ctx2.createLinearGradient(0, 0, 0, VH);
    g.addColorStop(0, "#aef0c8"); g.addColorStop(1, "#5fb583");
    ctx2.fillStyle = g; ctx2.fillRect(0, 0, VW, VH);
    // sun
    ctx2.fillStyle = "rgba(255,255,200,0.7)"; ctx2.beginPath(); ctx2.arc(330, 70, 30, 0, 7); ctx2.fill();
    // bamboo
    for (let i = 0; i < 6; i++) {
      const x = 30 + i * 70 + Math.sin(i) * 10;
      ctx2.fillStyle = "#3f8a5a"; ctx2.fillRect(x, 60, 16, VH - 60);
      ctx2.fillStyle = "#2f6e45"; for (let s = 90; s < VH; s += 70) ctx2.fillRect(x - 2, s, 20, 4);
    }
    ctx2.fillStyle = "#2f7a3f"; ctx2.fillRect(0, GROUND, VW, VH - GROUND);
    ctx2.fillStyle = "#266030"; ctx2.fillRect(0, GROUND, VW, 6);
  } else if (theme === "cave") {
    const g = ctx2.createLinearGradient(0, 0, 0, VH);
    g.addColorStop(0, "#2a2030"); g.addColorStop(1, "#15101a");
    ctx2.fillStyle = g; ctx2.fillRect(0, 0, VW, VH);
    // stalactites
    ctx2.fillStyle = "#3a2a3f";
    for (let i = 0; i < 8; i++) { const x = i * 52 + 10; ctx2.beginPath(); ctx2.moveTo(x, 0); ctx2.lineTo(x + 16, 0); ctx2.lineTo(x + 8, 40 + (i % 3) * 20); ctx2.fill(); }
    // torches with flicker
    [80, 320].forEach((tx) => {
      const fl = 0.6 + Math.random() * 0.4;
      ctx2.fillStyle = "#7a5a3a"; ctx2.fillRect(tx, 120, 6, 40);
      const fg = ctx2.createRadialGradient(tx + 3, 120, 4, tx + 3, 120, 40 * fl);
      fg.addColorStop(0, "rgba(255,180,60,0.9)"); fg.addColorStop(1, "rgba(255,80,0,0)");
      ctx2.fillStyle = fg; ctx2.beginPath(); ctx2.arc(tx + 3, 120, 40 * fl, 0, 7); ctx2.fill();
    });
    ctx2.fillStyle = "#241b22"; ctx2.fillRect(0, GROUND, VW, VH - GROUND);
    ctx2.fillStyle = "#1a1218"; ctx2.fillRect(0, GROUND, VW, 6);
  } else {
    const g = ctx2.createLinearGradient(0, 0, 0, VH);
    g.addColorStop(0, "#2a2050"); g.addColorStop(1, "#0d0a1e");
    ctx2.fillStyle = g; ctx2.fillRect(0, 0, VW, VH);
    // moon
    ctx2.fillStyle = "rgba(240,240,210,0.9)"; ctx2.beginPath(); ctx2.arc(60, 70, 28, 0, 7); ctx2.fill();
    ctx2.fillStyle = "rgba(20,16,40,0.9)"; ctx2.beginPath(); ctx2.arc(72, 64, 24, 0, 7); ctx2.fill();
    // stars
    ctx2.fillStyle = "rgba(255,255,255,0.7)";
    for (let i = 0; i < 30; i++) ctx2.fillRect((i * 37) % VW, (i * 53) % 180, 2, 2);
    // castle silhouette
    ctx2.fillStyle = "#1a1538";
    ctx2.fillRect(150, 280, 100, 220);
    [160, 200, 240].forEach((bx) => { ctx2.fillRect(bx, 260, 18, 30); });
    ctx2.fillStyle = "#241b48"; ctx2.fillRect(0, GROUND, VW, VH - GROUND);
    ctx2.fillStyle = "#1a1338"; ctx2.fillRect(0, GROUND, VW, 6);
  }
}

// ---------- Ninja & enemy drawing ----------
function drawNinja(ctx2, p, swing) {
  const x = p.x, y = p.y, w = p.w, h = p.h;
  const dir = p.facing;
  // body
  ctx2.fillStyle = "#1b1b2a";
  ctx2.fillRect(x, y + h - 30, w, 24); // torso
  ctx2.fillStyle = "#2a2a3e"; ctx2.fillRect(x, y + h - 14, w, 12); // legs
  // head + mask
  ctx2.fillStyle = "#222230"; ctx2.fillRect(x + 2, y + h - 42, w - 4, 16);
  // eyes (red)
  ctx2.fillStyle = "#e33"; ctx2.fillRect(dir > 0 ? x + 10 : x + 4, y + h - 38, 6, 3);
  // belt
  ctx2.fillStyle = "#d4af37"; ctx2.fillRect(x, y + h - 18, w, 4);
  // sword swing arc
  if (swing > 0) {
    const a = (1 - swing / 0.22) * Math.PI * 0.9;
    const cx = dir > 0 ? x + w : x; const cy = y + h - 20;
    ctx2.strokeStyle = "#e8e8f0"; ctx2.lineWidth = 4; ctx2.lineCap = "round";
    ctx2.beginPath();
    ctx2.arc(cx, cy, 26, dir > 0 ? -a : Math.PI + a, dir > 0 ? a : Math.PI - a, dir < 0);
    ctx2.stroke();
    ctx2.strokeStyle = "rgba(220,180,60,0.7)"; ctx2.lineWidth = 2;
    ctx2.beginPath(); ctx2.arc(cx, cy, 30, dir > 0 ? -a : Math.PI + a, dir > 0 ? a : Math.PI - a, dir < 0); ctx2.stroke();
  }
}
function drawSoldier(ctx2, e) {
  const x = e.x, y = e.y, w = e.w, h = e.h, dir = e.dir;
  ctx2.fillStyle = e.big ? "#6a3a3a" : "#7a5a3a"; ctx2.fillRect(x, y + h - 28, w, 22);
  ctx2.fillStyle = "#9a7a5a"; ctx2.fillRect(x + 2, y + h - 42, w - 4, 16);
  ctx2.fillStyle = "#3a2a1a"; ctx2.fillRect(x + 2, y + h - 12, w - 4, 10);
  ctx2.fillStyle = "#333"; ctx2.fillRect(dir > 0 ? x + w : x - 14, y + h - 26, 16, 4); // spear
  ctx2.fillStyle = "#ccc"; ctx2.fillRect(dir > 0 ? x + w + 12 : x - 18, y + h - 30, 4, 10);
  // hp pips
  if (e.hp > 1) { ctx2.fillStyle = "#e44"; for (let i = 0; i < e.hp; i++) ctx2.fillRect(x + i * 8, y + h - 48, 6, 4); }
}
function drawMonster(ctx2, e) {
  const x = e.x, y = e.y, w = e.w, h = e.h;
  const cx = x + w / 2, cy = y + h - 22;
  ctx2.fillStyle = "#5a2a6a"; ctx2.beginPath(); ctx2.arc(cx, cy, 18, 0, 7); ctx2.fill();
  ctx2.fillStyle = "#3a1a4a"; ctx2.fillRect(x + 2, y + h - 8, w - 4, 8);
  // eyes
  ctx2.fillStyle = "#ff4"; ctx2.fillRect(cx - 8, cy - 6, 5, 5); ctx2.fillRect(cx + 3, cy - 6, 5, 5);
  // mouth
  ctx2.strokeStyle = "#220"; ctx2.lineWidth = 2; ctx2.beginPath(); ctx2.arc(cx, cy + 2, 8, 0, Math.PI); ctx2.stroke();
}

// ---------- Component ----------
export default function NinjaGame() {
  const { t } = useI18n();
  const canvasRef = useRef(null);
  const stateRef = useRef(null);
  const keys = useRef({ left: false, right: false });
  const [hud, setHud] = useState({ hp: 5, score: 0, fire: 0, level: 1, total: LEVELS.length });
  const [phase, setPhase] = useState("ready"); // ready | playing | over | won
  const [running, setRunning] = useState(false);

  const newGame = useCallback(() => {
    resumeAudio();
    const lvl = 0;
    const enemies = LEVELS[lvl].enemies.map((e) => ({
      ...e, w: e.big ? 34 : 28, h: 44, dir: 1, hp: e.hp || (e.big ? 3 : 2), vy: 0, hurt: 0, dead: false, jumpT: 0,
    }));
    stateRef.current = {
      level: lvl,
      player: { x: 30, y: GROUND - 50, w: 26, h: 50, vx: 0, vy: 0, facing: 1, onGround: true, hp: 5, fire: 0, swing: 0, hurt: 0, atkCd: 0 },
      enemies, projectiles: [], particles: [], treasure: { ...LEVELS[lvl].treasure, taken: false, bob: 0 },
      score: 0, cleared: false, time: 0,
    };
    setHud((p) => ({ ...p, hp: 5, score: 0, fire: 0, level: 1, total: LEVELS.length }));
    setPhase("playing"); setRunning(true);
    startMusic();
  }, []);

  const nextLevel = useCallback(() => {
    const s = stateRef.current;
    if (!s) return;
    const nl = s.level + 1;
    if (nl >= LEVELS.length) { setPhase("won"); setRunning(false); stopMusic(); SFX.win(); return; }
    const enemies = LEVELS[nl].enemies.map((e) => ({ ...e, w: e.big ? 34 : 28, h: 44, dir: 1, hp: e.hp || (e.big ? 3 : 2), vy: 0, hurt: 0, dead: false, jumpT: 0 }));
    s.level = nl; s.enemies = enemies; s.projectiles = []; s.particles = [];
    s.treasure = { ...LEVELS[nl].treasure, taken: false, bob: 0 };
    s.player.x = 30; s.player.y = GROUND - 50; s.player.vx = 0; s.player.vy = 0;
    s.player.fire = 0; s.player.swing = 0; s.player.hurt = 0; s.player.atkCd = 0;
    s.cleared = false;
    setHud((p) => ({ ...p, level: nl + 1 }));
    SFX.levelUp();
  }, []);

  const doAttack = useCallback(() => {
    const s = stateRef.current; if (!s || phase !== "playing") return;
    const p = s.player;
    if (p.atkCd > 0) return;
    p.swing = 0.22; p.atkCd = 0.32; SFX.swing();
    // hit enemies in front
    const hb = { x: p.facing > 0 ? p.x + p.w : p.x - 32, y: p.y, w: 32, h: p.h };
    s.enemies.forEach((e) => {
      if (e.dead) return;
      if (hb.x < e.x + e.w && hb.x + hb.w > e.x && hb.y < e.y + e.h && hb.y + hb.h > e.y) {
        e.hp -= 1; e.hurt = 0.15; SFX.hit(); e.x += p.facing * 6;
        if (e.hp <= 0) { e.dead = true; s.score += e.big ? 200 : 100; setHud((h) => ({ ...h, score: s.score })); burst(s, e.x + e.w / 2, e.y + e.h / 2, "#a33"); }
      }
    });
  }, [phase]);

  const doFire = useCallback(() => {
    const s = stateRef.current; if (!s || phase !== "playing") return;
    const p = s.player;
    if (p.fire <= 0) return;
    p.fire -= 1; setHud((h) => ({ ...h, fire: p.fire }));
    SFX.fire();
    s.projectiles.push({ x: p.x + p.w / 2, y: p.y + 14, vx: p.facing * 7, vy: 0, r: 6, life: 1.2 });
  }, [phase]);

  const doJump = useCallback(() => {
    const s = stateRef.current; if (!s || phase !== "playing") return;
    const p = s.player;
    if (p.onGround) { p.vy = -13; p.onGround = false; SFX.jump(); }
  }, [phase]);

  // keyboard
  useEffect(() => {
    const down = (e) => {
      if (["ArrowLeft", "a", "A"].includes(e.key)) keys.current.left = true;
      if (["ArrowRight", "d", "D"].includes(e.key)) keys.current.right = true;
      if (["ArrowUp", "w", "W", " "].includes(e.key)) { doJump(); e.preventDefault(); }
      if (["j", "J", "k", "K"].includes(e.key)) { /* handled on key mapping */ }
    };
    const up = (e) => {
      if (["ArrowLeft", "a", "A"].includes(e.key)) keys.current.left = false;
      if (["ArrowRight", "d", "D"].includes(e.key)) keys.current.right = false;
    };
    const kd = (e) => {
      if (e.key === "j" || e.key === "J") doAttack();
      if (e.key === "k" || e.key === "K") doFire();
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("keydown", kd);
    return () => { window.removeEventListener("keydown", down); window.removeEventListener("keyup", up); window.removeEventListener("keydown", kd); };
  }, [doJump, doAttack, doFire]);

  // cleanup on unmount: stop music so it doesn't leak to other tools
  useEffect(() => () => { stopMusic(); setRunning(false); }, []);

  // game loop
  useEffect(() => {
    if (!running) return;
    let raf, last = performance.now();
    const canvas = canvasRef.current; const ctx2 = canvas.getContext("2d");
    const loop = (now) => {
      const dt = Math.min((now - last) / 1000, 0.05); last = now;
      step(dt); render(ctx2);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [running]);

  const burst = (s, x, y, color) => {
    for (let i = 0; i < 12; i++) s.particles.push({ x, y, vx: (Math.random() - 0.5) * 6, vy: (Math.random() - 0.5) * 6 - 2, life: 0.5, color });
  };

  const step = (dt) => {
    const s = stateRef.current; if (!s) return;
    const p = s.player;
    s.time += dt;
    // input
    p.vx = 0;
    if (keys.current.left) { p.vx = -3.4; p.facing = -1; }
    if (keys.current.right) { p.vx = 3.4; p.facing = 1; }
    // physics
    p.vy += GRAVITY;
    p.x += p.vx; p.y += p.vy;
    if (p.y + p.h >= GROUND) { p.y = GROUND - p.h; p.vy = 0; p.onGround = true; } else p.onGround = false;
    if (p.x < 0) p.x = 0; if (p.x + p.w > VW) p.x = VW - p.w;
    if (p.swing > 0) p.swing -= dt;
    if (p.atkCd > 0) p.atkCd -= dt;
    if (p.hurt > 0) p.hurt -= dt;
    // treasure
    if (!s.treasure.taken) {
      s.treasure.bob = Math.sin(s.time * 4) * 4;
      const tr = { x: s.treasure.x - 12, y: s.treasure.y - 12 + s.treasure.bob, w: 24, h: 24 };
      if (p.x < tr.x + tr.w && p.x + p.w > tr.x && p.y < tr.y + tr.h && p.y + p.h > tr.y) {
        s.treasure.taken = true; p.fire += 4; s.score += 50;
        setHud((h) => ({ ...h, fire: p.fire, score: s.score })); SFX.collect();
        burst(s, tr.x + 12, tr.y + 12, "#fc4");
      }
    }
    // enemies
    s.enemies.forEach((e) => {
      if (e.dead) return;
      if (e.hurt > 0) e.hurt -= dt;
      if (e.type === "soldier") {
        e.x += e.dir * 1.4;
        if (e.x < e.bound[0]) e.dir = 1;
        if (e.x + e.w > e.bound[1]) e.dir = -1;
      } else {
        // monster: slowly chase + periodic hop
        e.jumpT -= dt;
        const dx = p.x - e.x;
        e.x += Math.sign(dx) * 0.9;
        if (e.x < e.bound[0]) e.x = e.bound[0];
        if (e.x + e.w > e.bound[1]) e.x = e.bound[1] - e.w;
        if (e.jumpT <= 0 && Math.abs(dx) < 120) { e.vy = -8; e.jumpT = 1.6; }
        e.vy += GRAVITY; e.y += e.vy;
        if (e.y + e.h >= GROUND) { e.y = GROUND - e.h; e.vy = 0; }
        e.dir = dx >= 0 ? 1 : -1;
      }
      // contact damage
      if (p.hurt <= 0 && p.x < e.x + e.w && p.x + p.w > e.x && p.y < e.y + e.h && p.y + p.h > e.y) {
        p.hp -= 1; p.hurt = 1; SFX.hurt(); setHud((h) => ({ ...h, hp: p.hp }));
        p.vx = -p.facing * 4; p.vy = -6;
        if (p.hp <= 0) { setPhase("over"); setRunning(false); stopMusic(); SFX.over(); }
      }
    });
    // projectiles (fire)
    s.projectiles = s.projectiles.filter((pr) => {
      pr.x += pr.vx; pr.life -= dt;
      if (pr.life <= 0 || pr.x < -10 || pr.x > VW + 10) return false;
      for (const e of s.enemies) {
        if (e.dead) continue;
        if (pr.x < e.x + e.w && pr.x + pr.r > e.x && pr.y < e.y + e.h && pr.y + pr.r > e.y) {
          e.hp -= 1; e.hurt = 0.15; SFX.hit();
          if (e.hp <= 0) { e.dead = true; s.score += e.big ? 200 : 100; setHud((h) => ({ ...h, score: s.score })); burst(s, e.x + e.w / 2, e.y + e.h / 2, "#f74"); }
          burst(s, pr.x, pr.y, "#f80");
          return false;
        }
      }
      return true;
    });
    // particles
    s.particles = s.particles.filter((pt) => {
      pt.vy += 0.3; pt.x += pt.vx; pt.y += pt.vy; pt.life -= dt; return pt.life > 0;
    });
    // level clear
    if (!s.cleared && s.enemies.every((e) => e.dead)) {
      s.cleared = true; setTimeout(() => nextLevel(), 600);
    }
  };

  const render = (ctx2) => {
    const s = stateRef.current; if (!s) return;
    const theme = LEVELS[s.level].theme;
    drawBackground(ctx2, theme, s.time);
    // treasure
    if (!s.treasure.taken) {
      const ty = s.treasure.y - 12 + s.treasure.bob;
      ctx2.fillStyle = "rgba(255,200,60,0.4)"; ctx2.beginPath(); ctx2.arc(s.treasure.x, ty + 12, 16, 0, 7); ctx2.fill();
      ctx2.fillStyle = "#f4c430"; ctx2.beginPath(); ctx2.moveTo(s.treasure.x - 10, ty + 4); ctx2.lineTo(s.treasure.x + 10, ty + 4); ctx2.lineTo(s.treasure.x + 8, ty + 20); ctx2.lineTo(s.treasure.x - 8, ty + 20); ctx2.fill();
      ctx2.fillStyle = "#d4a020"; ctx2.fillRect(s.treasure.x - 2, ty + 4, 4, 16);
    }
    // enemies
    s.enemies.forEach((e) => { if (e.dead) return; if (e.hurt > 0) ctx2.globalAlpha = 0.6; e.type === "soldier" ? drawSoldier(ctx2, e) : drawMonster(ctx2, e); ctx2.globalAlpha = 1; });
    // player
    if (s.player.hurt > 0 && Math.floor(s.time * 20) % 2 === 0) ctx2.globalAlpha = 0.5;
    drawNinja(ctx2, s.player, s.player.swing); ctx2.globalAlpha = 1;
    // projectiles
    s.projectiles.forEach((pr) => {
      const g = ctx2.createRadialGradient(pr.x, pr.y, 1, pr.x, pr.y, pr.r + 4);
      g.addColorStop(0, "#fff"); g.addColorStop(0.4, "#fb4"); g.addColorStop(1, "rgba(255,80,0,0)");
      ctx2.fillStyle = g; ctx2.beginPath(); ctx2.arc(pr.x, pr.y, pr.r + 4, 0, 7); ctx2.fill();
    });
    // particles
    s.particles.forEach((pt) => { ctx2.globalAlpha = Math.max(pt.life * 2, 0); ctx2.fillStyle = pt.color; ctx2.fillRect(pt.x - 2, pt.y - 2, 4, 4); });
    ctx2.globalAlpha = 1;
    // ground line
  };

  // touch controls
  const hold = (k, v) => () => { keys.current[k] = v; };

  return (
    <div className="select-none flex flex-col items-center">
      {/* HUD */}
      <div className="flex items-center justify-between w-full max-w-[400px] mb-3 px-1">
        <div className="flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Heart key={i} className={`w-5 h-5 ${i < hud.hp ? "text-rose-500 fill-rose-500" : "text-muted-foreground/40"}`} />
          ))}
        </div>
        <div className="text-xs font-bold text-muted-foreground">{t("Level")} {hud.level}/{hud.total}</div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-extrabold text-primary tabular-nums">{hud.score}</span>
          <span className="flex items-center gap-0.5 text-amber-500 font-bold">{hud.fire}<Flame className="w-4 h-4" /></span>
        </div>
      </div>

      {/* Canvas */}
      <div className="relative rounded-2xl overflow-hidden border border-primary/30 shadow-xl" style={{ width: "min(92vw, 400px)" }}>
        <canvas ref={canvasRef} width={VW} height={VH} className="block w-full h-auto" />
        {/* level name */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 text-[11px] font-bold text-white/90 bg-black/40 px-3 py-1 rounded-full backdrop-blur-sm">
          {LEVELS[hud.level - 1]?.name}
        </div>

        <AnimatePresence>
          {phase === "ready" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-background/85 backdrop-blur-sm flex flex-col items-center justify-center gap-4 p-6 text-center">
              <div className="flex items-center gap-2 text-2xl font-extrabold text-foreground"><Swords className="w-7 h-7 text-primary" /> {t("Ninja Quest")}</div>
              <p className="text-sm text-muted-foreground max-w-[300px]">{t("Slash soldiers and monsters with your sword, grab the glowing treasure to charge fire, and clear all enemies across 3 levels.")}</p>
              <div className="text-[11px] text-muted-foreground/80 leading-relaxed">
                {t("Move")}: ← → / A D &nbsp;·&nbsp; {t("Jump")}: ↑ / W<br />
                {t("Sword")}: J &nbsp;·&nbsp; {t("Fire")}: K
              </div>
              <Button onClick={newGame} className="bg-primary text-primary-foreground rounded-2xl px-8 py-5 text-base font-bold"><Play className="w-5 h-5 mr-2" />{t("Start")}</Button>
            </motion.div>
          )}
          {phase === "over" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-background/85 backdrop-blur-sm flex flex-col items-center justify-center gap-4 text-center">
              <div className="text-2xl font-extrabold text-destructive">{t("Game Over")}</div>
              <div className="text-sm text-muted-foreground">{t("Score")}: <span className="font-bold text-foreground">{hud.score}</span></div>
              <Button onClick={newGame} className="bg-primary text-primary-foreground rounded-2xl px-6 py-4"><RotateCcw className="w-4 h-4 mr-2" />{t("Try again")}</Button>
            </motion.div>
          )}
          {phase === "won" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-background/85 backdrop-blur-sm flex flex-col items-center justify-center gap-4 text-center">
              <Trophy className="w-10 h-10 text-amber-400" />
              <div className="text-2xl font-extrabold text-foreground">{t("Victory!")}</div>
              <div className="text-sm text-muted-foreground">{t("You cleared all levels")}. {t("Score")}: <span className="font-bold text-foreground">{hud.score}</span></div>
              <Button onClick={newGame} className="bg-primary text-primary-foreground rounded-2xl px-6 py-4"><RotateCcw className="w-4 h-4 mr-2" />{t("Play again")}</Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Touch controls */}
      <div className="mt-4 w-full max-w-[400px] flex items-center justify-between gap-3">
        <div className="flex gap-2">
          <button onTouchStart={hold("left", true)} onTouchEnd={hold("left", false)} onMouseDown={hold("left", true)} onMouseUp={hold("left", false)} onMouseLeave={hold("left", false)}
            className="w-14 h-14 rounded-2xl bg-card border border-border flex items-center justify-center text-foreground active:bg-primary/20 transition-colors"><ChevronLeft className="w-7 h-7" /></button>
          <button onTouchStart={hold("right", true)} onTouchEnd={hold("right", false)} onMouseDown={hold("right", true)} onMouseUp={hold("right", false)} onMouseLeave={hold("right", false)}
            className="w-14 h-14 rounded-2xl bg-card border border-border flex items-center justify-center text-foreground active:bg-primary/20 transition-colors"><ChevronRight className="w-7 h-7" /></button>
        </div>
        <div className="flex gap-2">
          <button onClick={doAttack} className="w-14 h-14 rounded-2xl bg-primary/15 border border-primary/40 flex items-center justify-center text-primary active:scale-95 transition-transform"><Swords className="w-6 h-6" /></button>
          <button onClick={doFire} disabled={hud.fire <= 0} className="w-14 h-14 rounded-2xl bg-amber-400/20 border border-amber-400/50 flex items-center justify-center text-amber-500 active:scale-95 transition-transform disabled:opacity-40"><Flame className="w-6 h-6" /></button>
          <button onClick={doJump} className="w-14 h-14 rounded-2xl bg-card border border-border flex items-center justify-center text-foreground active:scale-95 transition-transform text-xl font-bold">↑</button>
        </div>
      </div>
    </div>
  );
}