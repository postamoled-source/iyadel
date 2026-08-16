import { useRef, useEffect, useState, useCallback } from "react";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Heart, Swords, ChevronLeft, ChevronRight, Play, RotateCcw, Trophy, Crosshair } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const VW = 400, VH = 560, GROUND = 488, GRAVITY = 0.62, MAX_JUMPS = 3;

// ---------- Audio: exciting 140 BPM action track + SFX ----------
let actx;
const ctx = () => { if (!actx) actx = new (window.AudioContext || window.webkitAudioContext)(); return actx; };
const resumeAudio = () => { const c = ctx(); if (c.state === "suspended") c.resume(); };
const beep = (freq, dur, type = "sine", vol = 0.18, slide) => {
  const c = ctx(); const o = c.createOscillator(); const g = c.createGain();
  o.type = type; o.frequency.value = freq;
  if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(slide, 40), c.currentTime + dur);
  g.gain.setValueAtTime(vol, c.currentTime); g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + dur);
  o.connect(g).connect(c.destination); o.start(); o.stop(c.currentTime + dur);
};
const noise = (dur, vol = 0.2, hp = 800) => {
  const c = ctx(); const len = Math.floor(c.sampleRate * dur);
  const buf = c.createBuffer(1, len, c.sampleRate); const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
  const src = c.createBufferSource(); src.buffer = buf; const g = c.createGain(); g.gain.value = vol;
  const f = c.createBiquadFilter(); f.type = "highpass"; f.frequency.value = hp;
  src.connect(f).connect(g).connect(c.destination); src.start();
};
const SFX = {
  jump: () => beep(440, 0.14, "square", 0.14, 760),
  swing: () => noise(0.14, 0.2, 1200),
  hit: () => { beep(200, 0.1, "sawtooth", 0.2, 90); noise(0.08, 0.1, 400); },
  shuriken: () => beep(900, 0.06, "triangle", 0.12, 1400),
  collect: () => { beep(660, 0.08, "triangle", 0.18); setTimeout(() => beep(990, 0.12, "triangle", 0.18), 80); },
  hurt: () => beep(300, 0.22, "sawtooth", 0.22, 110),
  levelUp: () => { [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => beep(f, 0.18, "triangle", 0.2), i * 110)); },
  over: () => { [392, 330, 262].forEach((f, i) => setTimeout(() => beep(f, 0.3, "sawtooth", 0.2), i * 200)); },
  win: () => { [523, 659, 784, 1047, 1319].forEach((f, i) => setTimeout(() => beep(f, 0.22, "triangle", 0.2), i * 130)); },
};
const STEP16 = 0.10714;
const KICK = [1,0,0,0, 1,0,0,1, 1,0,0,0, 1,0,1,0];
const SNARE = [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,1];
const HAT = [0,1,1,1, 0,1,1,1, 0,1,1,1, 0,1,1,1];
const BASS = [82.41,0,82.41,123.47,0,82.41,164.81,0, 98.00,0,98.00,146.83,0,98.00,196.00,0];
const LEAD = [0,0,659.25,0,783.99,0,659.25,587.33,0,659.25,0,880.00,783.99,0,659.25,0];
let musicOn = false, musicStep = 0, nextNoteTime = 0, schedulerTimer = null;
const mKick = (w) => { const c = ctx(); const o = c.createOscillator(); const g = c.createGain(); o.type = "sine"; o.frequency.setValueAtTime(150, w); o.frequency.exponentialRampToValueAtTime(45, w + 0.12); g.gain.setValueAtTime(0.2, w); g.gain.exponentialRampToValueAtTime(0.001, w + 0.16); o.connect(g).connect(c.destination); o.start(w); o.stop(w + 0.18); };
const mSnare = (w) => { const c = ctx(); const len = Math.floor(c.sampleRate * 0.12); const buf = c.createBuffer(1, len, c.sampleRate); const d = buf.getChannelData(0); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len); const s = c.createBufferSource(); s.buffer = buf; const f = c.createBiquadFilter(); f.type = "bandpass"; f.frequency.value = 1900; const g = c.createGain(); g.gain.value = 0.14; s.connect(f).connect(g).connect(c.destination); s.start(w); };
const mHat = (w) => { const c = ctx(); const len = Math.floor(c.sampleRate * 0.03); const buf = c.createBuffer(1, len, c.sampleRate); const d = buf.getChannelData(0); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1); const s = c.createBufferSource(); s.buffer = buf; const f = c.createBiquadFilter(); f.type = "highpass"; f.frequency.value = 7000; const g = c.createGain(); g.gain.setValueAtTime(0.04, w); g.gain.exponentialRampToValueAtTime(0.001, w + 0.03); s.connect(f).connect(g).connect(c.destination); s.start(w); };
const mBass = (w, f0) => { const c = ctx(); const o = c.createOscillator(); const g = c.createGain(); const f = c.createBiquadFilter(); o.type = "sawtooth"; o.frequency.value = f0; f.type = "lowpass"; f.frequency.value = 700; o.connect(f); f.connect(g); g.gain.setValueAtTime(0.12, w); g.gain.exponentialRampToValueAtTime(0.001, w + 0.18); g.connect(c.destination); o.start(w); o.stop(w + 0.2); };
const mLead = (w, f0) => { const c = ctx(); const o = c.createOscillator(); const g = c.createGain(); o.type = "square"; o.frequency.value = f0; o.connect(g); g.gain.setValueAtTime(0.06, w); g.gain.exponentialRampToValueAtTime(0.001, w + 0.22); g.connect(c.destination); o.start(w); o.stop(w + 0.24); };
const scheduleMusic = () => {
  if (!musicOn) return; const c = ctx();
  while (nextNoteTime < c.currentTime + 0.2) {
    const s = musicStep % 16;
    if (KICK[s]) mKick(nextNoteTime); if (SNARE[s]) mSnare(nextNoteTime); if (HAT[s]) mHat(nextNoteTime);
    if (BASS[s]) mBass(nextNoteTime, BASS[s]); if (LEAD[s]) mLead(nextNoteTime, LEAD[s]);
    nextNoteTime += STEP16; musicStep++;
  }
  schedulerTimer = setTimeout(scheduleMusic, 25);
};
const startMusic = () => { if (musicOn) return; musicOn = true; musicStep = 0; nextNoteTime = ctx().currentTime + 0.1; scheduleMusic(); };
const stopMusic = () => { musicOn = false; if (schedulerTimer) { clearTimeout(schedulerTimer); schedulerTimer = null; } };

// ---------- Themes (painted atmospheric palettes) ----------
const THEMES = [
  { name: "Dusk Forest", skyTop: "#d1b898", skyBot: "#b88b57", moon: "#eef2f5", haze: "rgba(190,170,150,0.28)", far: "#9c8a72", mid: "#3a3328", near: "#101010", grass: "#000" },
  { name: "Mist Bamboo", skyTop: "#6f8270", skyBot: "#46544a", moon: "#dfeae0", haze: "rgba(150,170,150,0.34)", far: "#5e6e60", mid: "#1f2a22", near: "#0c0f0c", grass: "#000" },
  { name: "Moonlit Hills", skyTop: "#243049", skyBot: "#0c0f1e", moon: "#d1e4ef", haze: "rgba(40,55,85,0.32)", far: "#33405e", mid: "#1a2238", near: "#06080f", grass: "#000" },
];

// deterministic PRNG for per-level decoration
function makeRng(seed) { let s = seed % 233280; return () => { s = (s * 9301 + 49297) % 233280; return s / 233280; }; }

const WW = 2800;
const buildLevel = (idx) => {
  const rnd = makeRng(idx * 1337 + 7);
  const platforms = [
    { x: 320, y: 372, w: 150 }, { x: 580, y: 300, w: 120 }, { x: 840, y: 380, w: 170 },
    { x: 1120, y: 320, w: 150 }, { x: 1400, y: 250, w: 130 }, { x: 1670, y: 360, w: 190 },
    { x: 1960, y: 300, w: 150 }, { x: 2230, y: 380, w: 170 }, { x: 2480, y: 320, w: 150 },
  ];
  const enemies = [
    { x: 470, y: GROUND - 44, range: [430, 560] },
    { x: 880, y: 380 - 44, range: [840, 1010], plat: true },
    { x: 1180, y: GROUND - 44, range: [1120, 1270] },
    { x: 1700, y: GROUND - 44, range: [1640, 1860] },
    { x: 1980, y: 300 - 44, range: [1960, 2110], plat: true },
    { x: 2280, y: GROUND - 44, range: [2230, 2400] },
  ].map((e) => ({ ...e, w: 26, h: 44, hp: 2, dir: 1, vy: 0, hurt: 0, dead: false }));
  const scrolls = [{ x: 380, y: 332 }, { x: 640, y: 260 }, { x: 1170, y: 280 }, { x: 1450, y: 210 }, { x: 2030, y: 260 }, { x: 2540, y: 280 }];
  const traps = [{ x: 760, w: 50 }, { x: 1560, w: 50 }, { x: 1900, w: 60 }];
  const torches = [200, 740, 1300, 1820, 2420];
  const bonfire = 2620;
  // decoration
  const trees = []; for (let i = 0; i < 26; i++) trees.push({ x: i * 120 + rnd() * 60, h: 120 + rnd() * 140, type: idx === 1 ? "bamboo" : "tree" });
  const mountains = []; for (let i = 0; i < 30; i++) mountains.push({ x: i * 110, h: 120 + rnd() * 120, w: 160 + rnd() * 100 });
  return { platforms, enemies, scrolls, traps, torches, bonfire, trees, mountains, gate: { x: WW - 90, y: GROUND - 120, w: 64, h: 120 }, rnd };
};

// ---------- drawing helpers ----------
const fillSilhouette = (ctx, color) => { ctx.fillStyle = color; };
function drawBackground(ctx, th, level, cx, t) {
  // sky
  const g = ctx.createLinearGradient(0, 0, 0, VH);
  g.addColorStop(0, th.skyTop); g.addColorStop(1, th.skyBot);
  ctx.fillStyle = g; ctx.fillRect(0, 0, VW, VH);
  // moon
  const mx = 300 - cx * 0.08, my = 110;
  const mg = ctx.createRadialGradient(mx, my, 10, mx, my, 90);
  mg.addColorStop(0, th.moon); mg.addColorStop(0.3, th.moon); mg.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = mg; ctx.beginPath(); ctx.arc(mx, my, 90, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = th.moon; ctx.beginPath(); ctx.arc(mx, my, 40, 0, Math.PI * 2); ctx.fill();
  // distant mountains (parallax 0.25)
  ctx.fillStyle = th.far;
  level.mountains.forEach((m) => {
    const x = m.x - cx * 0.25 - 100;
    if (x > -200 && x < VW + 100) { ctx.beginPath(); ctx.moveTo(x, 360); ctx.lineTo(x + m.w / 2, 360 - m.h); ctx.lineTo(x + m.w, 360); ctx.closePath(); ctx.fill(); }
  });
  // haze band
  ctx.fillStyle = th.haze; ctx.fillRect(0, 300, VW, 120);
  // mid trees (parallax 0.5)
  ctx.fillStyle = th.mid;
  level.trees.forEach((tr) => {
    const x = tr.x - cx * 0.5;
    if (x < -80 || x > VW + 80) return;
    if (tr.type === "bamboo") {
      ctx.fillRect(x, 360 - tr.h, 7, tr.h);
      for (let s = 0; s < tr.h; s += 28) ctx.fillRect(x - 4, 360 - tr.h + s, 15, 3);
    } else {
      ctx.fillRect(x - 3, 360 - tr.h, 6, tr.h);
      ctx.beginPath(); ctx.arc(x, 360 - tr.h, 26, 0, Math.PI * 2); ctx.arc(x - 14, 360 - tr.h + 14, 20, 0, Math.PI * 2); ctx.arc(x + 14, 360 - tr.h + 12, 20, 0, Math.PI * 2); ctx.fill();
    }
  });
}

function drawTerrain(ctx, th, cx) {
  // ground hill silhouette with jagged grass
  ctx.fillStyle = th.near;
  ctx.beginPath();
  ctx.moveTo(0, VH);
  ctx.lineTo(0, GROUND);
  for (let x = 0; x <= VW; x += 8) {
    const wx = x + cx;
    const y = GROUND + Math.sin(wx * 0.03) * 3 - Math.abs(Math.sin(wx * 0.07) * 2);
    ctx.lineTo(x, y);
  }
  ctx.lineTo(VW, VH); ctx.closePath(); ctx.fill();
  // grass blades on top
  ctx.fillStyle = "#000";
  for (let x = 0; x <= VW; x += 6) {
    const wx = x + cx;
    const y = GROUND + Math.sin(wx * 0.03) * 3 - Math.abs(Math.sin(wx * 0.07) * 2);
    const h = 5 + ((wx * 13) % 7);
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 2, y - h); ctx.lineTo(x + 4, y); ctx.closePath(); ctx.fill();
  }
}

function drawPlatform(ctx, pl, cx) {
  const x = pl.x - cx, y = pl.y;
  ctx.fillStyle = "#000";
  ctx.fillRect(x, y, pl.w, 16);
  // jagged grass top
  for (let i = 0; i < pl.w; i += 7) { const h = 4 + ((i * 11) % 6); ctx.beginPath(); ctx.moveTo(x + i, y); ctx.lineTo(x + i + 2, y - h); ctx.lineTo(x + i + 4, y); ctx.closePath(); ctx.fill(); }
  // hanging vines
  for (let i = 14; i < pl.w; i += 26) { ctx.fillRect(x + i, y + 16, 2, 18 + ((i * 7) % 10)); }
}

function drawTorch(ctx, tx, cx, t) {
  const x = tx - cx, baseY = GROUND;
  ctx.fillStyle = "#000"; ctx.fillRect(x - 2, baseY - 60, 5, 60);
  ctx.save(); ctx.globalCompositeOperation = "lighter";
  const fg = ctx.createRadialGradient(x, baseY - 64, 2, x, baseY - 64, 34);
  fg.addColorStop(0, "rgba(255,230,150,0.9)"); fg.addColorStop(0.4, "rgba(255,140,40,0.6)"); fg.addColorStop(1, "rgba(255,80,0,0)");
  ctx.fillStyle = fg; ctx.beginPath(); ctx.arc(x, baseY - 64, 34, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
  const fl = 10 + Math.sin(t * 18) * 3;
  ctx.fillStyle = "#ff9b33"; ctx.beginPath(); ctx.moveTo(x - 5, baseY - 60); ctx.quadraticCurveTo(x, baseY - 60 - fl * 2, x, baseY - 60 - fl * 2.6); ctx.quadraticCurveTo(x + 5, baseY - 60 - fl * 2, x + 5, baseY - 60); ctx.closePath(); ctx.fill();
  ctx.fillStyle = "#ffe066"; ctx.beginPath(); ctx.moveTo(x - 2.5, baseY - 60); ctx.quadraticCurveTo(x, baseY - 60 - fl, x, baseY - 60 - fl * 1.4); ctx.quadraticCurveTo(x + 2.5, baseY - 60 - fl, x + 2.5, baseY - 60); ctx.closePath(); ctx.fill();
}
function drawBonfire(ctx, bx, cx, t) {
  const x = bx - cx, baseY = GROUND;
  ctx.fillStyle = "#000"; for (let i = 0; i < 4; i++) ctx.fillRect(x - 18 + i * 10, baseY - 14, 7, 14);
  ctx.save(); ctx.globalCompositeOperation = "lighter";
  const fg = ctx.createRadialGradient(x, baseY - 20, 4, x, baseY - 20, 70);
  fg.addColorStop(0, "rgba(255,240,180,0.8)"); fg.addColorStop(0.4, "rgba(255,140,40,0.5)"); fg.addColorStop(1, "rgba(255,80,0,0)");
  ctx.fillStyle = fg; ctx.beginPath(); ctx.arc(x, baseY - 20, 70, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
  for (let i = 0; i < 3; i++) {
    const fl = 22 + Math.sin(t * 12 + i) * 6 + i * 6;
    const ox = (i - 1) * 6;
    ctx.fillStyle = i ? "#ff9b33" : "#ffe066";
    ctx.beginPath(); ctx.moveTo(x - 10 + ox, baseY - 14); ctx.quadraticCurveTo(x + ox, baseY - 14 - fl, x + ox, baseY - 14 - fl * 1.4); ctx.quadraticCurveTo(x + 10 + ox, baseY - 14 - fl, x + 10 + ox, baseY - 14); ctx.closePath(); ctx.fill();
  }
}

function drawNinja(ctx, p, cx, t) {
  const x = p.x - cx + p.w / 2, y = p.y, f = p.facing;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(f, 1);
  ctx.fillStyle = "#000";
  // flowing scarf behind
  const sl = 16 + Math.min(Math.abs(p.vx) * 4, 16) + Math.sin(t * 10) * 3;
  ctx.beginPath(); ctx.moveTo(-3, 14); ctx.quadraticCurveTo(-sl * 0.6, 9, -sl, 12 + Math.sin(t * 12) * 4); ctx.lineTo(-sl, 18 + Math.sin(t * 12) * 4); ctx.quadraticCurveTo(-sl * 0.6, 19, -3, 21); ctx.closePath(); ctx.fill();
  // legs
  const moving = Math.abs(p.vx) > 0.4 && p.onGround;
  const sw = moving ? Math.sin(t * 14) * 0.5 : 0;
  const legY = p.h - 20;
  const drawLeg = (ox, rot) => { ctx.save(); ctx.translate(ox, legY); ctx.rotate(rot); ctx.fillRect(-3, 0, 6, 20); ctx.restore(); };
  drawLeg(-5, sw); drawLeg(5, -sw);
  if (!p.onGround) { drawLeg(-5, 0.4); drawLeg(5, 0.15); }
  // torso
  ctx.fillRect(-7, 13, 14, p.h - 32);
  // back arm
  ctx.save(); ctx.translate(-6, 16); ctx.rotate(moving ? Math.sin(t * 14) * 0.4 : 0); ctx.fillRect(-3, 0, 5, 15); ctx.restore();
  // sword on back (diagonal)
  ctx.save(); ctx.translate(-2, 30); ctx.rotate(-0.5); ctx.fillStyle = "#1a1a1a"; ctx.fillRect(-1.5, -22, 3, 28); ctx.restore();
  // front arm + sword
  ctx.save(); ctx.translate(6, 17);
  if (p.swing > 0) { const k = 1 - p.swing / 0.22; ctx.rotate(-1.2 + k * 2.2); }
  else ctx.rotate(moving ? Math.sin(t * 14 + 0.5) * 0.35 : 0);
  ctx.fillStyle = "#000"; ctx.fillRect(-2, 0, 5, 14);
  ctx.fillStyle = "#cfe6ff"; ctx.fillRect(0, -22, 2, 24);
  ctx.restore();
  // head
  ctx.fillStyle = "#000"; ctx.beginPath(); ctx.arc(0, 8, 7, 0, Math.PI * 2); ctx.fill();
  // wide-brim ronin hat
  ctx.beginPath(); ctx.moveTo(-14, 4); ctx.lineTo(14, 4); ctx.lineTo(9, -2); ctx.lineTo(-9, -2); ctx.closePath(); ctx.fill();
  ctx.fillRect(-3, -7, 6, 6);
  // eye glow
  ctx.fillStyle = "#ffcc55"; ctx.fillRect(2, 6, 3, 2);
  ctx.restore();
  // slash glint
  if (p.swing > 0) {
    const k = 1 - p.swing / 0.22;
    const sx = x + f * (p.w / 2 + 4), sy = y + 24;
    ctx.save(); ctx.globalCompositeOperation = "lighter";
    ctx.strokeStyle = `rgba(200,235,255,${0.9 - k})`; ctx.lineWidth = 4; ctx.lineCap = "round";
    ctx.beginPath();
    if (f > 0) ctx.arc(sx, sy, 28, -1.3 - k * 1.5, 0.4); else ctx.arc(sx, sy, 28, Math.PI - 0.4, Math.PI + 1.3 + k * 1.5);
    ctx.stroke(); ctx.restore();
  }
}

function drawEnemy(ctx, e, cx, t) {
  const x = e.x - cx + e.w / 2, y = e.y;
  ctx.save(); ctx.translate(x, y); ctx.scale(e.dir, 1); ctx.fillStyle = "#000";
  const sw = Math.sin(t * 9) * 0.5;
  const legY = e.h - 18;
  ctx.save(); ctx.translate(-5, legY); ctx.rotate(sw); ctx.fillRect(-3, 0, 6, 18); ctx.restore();
  ctx.save(); ctx.translate(5, legY); ctx.rotate(-sw); ctx.fillRect(-3, 0, 6, 18); ctx.restore();
  ctx.fillRect(-7, 12, 14, e.h - 30);
  // arm + sword
  ctx.save(); ctx.translate(6, 16); ctx.rotate(0.2); ctx.fillRect(-2, 0, 5, 14); ctx.fillStyle = "#3a3a3a"; ctx.fillRect(0, -18, 2, 20); ctx.restore();
  // head + conical hat
  ctx.fillStyle = "#000"; ctx.beginPath(); ctx.arc(0, 8, 6, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.moveTo(-11, 3); ctx.lineTo(11, 3); ctx.lineTo(0, -10); ctx.closePath(); ctx.fill();
  // eyes
  ctx.fillStyle = e.hurt > 0 ? "#ff5555" : "#ff8844"; ctx.fillRect(-3, 6, 3, 2); ctx.fillRect(2, 6, 3, 2);
  ctx.restore();
}

function drawScroll(ctx, s, cx, t) {
  const x = s.x - cx, y = s.y + Math.sin(t * 4 + s.x) * 4;
  ctx.save(); ctx.globalCompositeOperation = "lighter";
  const gg = ctx.createRadialGradient(x + 9, y + 9, 2, x + 9, y + 9, 26);
  gg.addColorStop(0, "rgba(255,255,200,0.7)"); gg.addColorStop(1, "rgba(255,255,200,0)");
  ctx.fillStyle = gg; ctx.beginPath(); ctx.arc(x + 9, y + 9, 26, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
  ctx.fillStyle = "#000"; ctx.fillRect(x, y + 2, 3, 14); ctx.fillRect(x + 15, y + 2, 3, 14);
  ctx.fillStyle = "#ffe9a8"; ctx.fillRect(x + 3, y + 3, 12, 12);
  ctx.strokeStyle = "#b88b40"; ctx.lineWidth = 1; ctx.strokeRect(x + 5, y + 6, 8, 6);
}

function drawTrap(ctx, tr, cx) {
  const x = tr.x - cx;
  ctx.fillStyle = "#000";
  for (let i = 0; i < tr.w; i += 8) { ctx.beginPath(); ctx.moveTo(x + i, GROUND); ctx.lineTo(x + i + 4, GROUND - 16); ctx.lineTo(x + i + 8, GROUND); ctx.closePath(); ctx.fill(); }
}

function drawGate(ctx, g, cx, t) {
  const x = g.x - cx;
  ctx.fillStyle = "#000";
  ctx.fillRect(x, g.y, 8, g.h); ctx.fillRect(x + g.w - 8, g.y, 8, g.h); ctx.fillRect(x - 8, g.y, g.w + 16, 10);
  ctx.save(); ctx.globalCompositeOperation = "lighter";
  const gg = ctx.createRadialGradient(x + g.w / 2, g.y + g.h / 2, 4, x + g.w / 2, g.y + g.h / 2, 40 + Math.sin(t * 4) * 6);
  gg.addColorStop(0, "rgba(180,220,255,0.5)"); gg.addColorStop(1, "rgba(180,220,255,0)");
  ctx.fillStyle = gg; ctx.beginPath(); ctx.arc(x + g.w / 2, g.y + g.h / 2, 44, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

function drawShuriken(ctx, pr, cx, t) {
  const x = pr.x - cx, y = pr.y;
  ctx.save(); ctx.translate(x, y); ctx.rotate(t * 20); ctx.fillStyle = "#cfe6ff";
  for (let i = 0; i < 4; i++) { ctx.save(); ctx.rotate((i * Math.PI) / 2); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(6, -2); ctx.lineTo(9, 0); ctx.lineTo(6, 2); ctx.closePath(); ctx.fill(); ctx.restore(); }
  ctx.fillStyle = "#1a1a1a"; ctx.beginPath(); ctx.arc(0, 0, 1.6, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

export default function NinjaGame() {
  const { t } = useI18n();
  const canvasRef = useRef(null);
  const stateRef = useRef(null);
  const keys = useRef({ left: false, right: false });
  const [hud, setHud] = useState({ hp: 5, score: 0, shuriken: 6, level: 1, total: THEMES.length });
  const [phase, setPhase] = useState("ready");
  const [running, setRunning] = useState(false);
  const flashRef = useRef(null);
  const bannerRef = useRef(null);
  const aliveRef = useRef(true);
  const rafRef = useRef(0);
  const previewRef = useRef(null);
  if (!previewRef.current) previewRef.current = buildLevel(0);

  const burst = (s, x, y) => {
    for (let i = 0; i < 12; i++) s.particles.push({ x, y, vx: (Math.random() - 0.5) * 7, vy: (Math.random() - 0.5) * 7 - 2, life: 0.5 });
  };

  const newGame = useCallback(() => {
    resumeAudio();
    const idx = 0;
    const level = buildLevel(idx);
    stateRef.current = {
      idx, level,
      player: { x: 60, y: GROUND - 50, w: 24, h: 50, vx: 0, vy: 0, facing: 1, onGround: true, jumps: 0, swing: 0, shuriken: 6, hurt: 0, atkCd: 0, hp: 5 },
      enemies: level.enemies, scrolls: level.scrolls.map((s) => ({ ...s, taken: false })),
      shurikens: [], particles: [], score: 0, cleared: false, time: 0,
    };
    setHud({ hp: 5, score: 0, shuriken: 6, level: 1, total: THEMES.length });
    setPhase("playing"); setRunning(true); startMusic();
  }, []);

  const nextLevel = useCallback(() => {
    const s = stateRef.current; if (!s) return;
    const nl = s.idx + 1;
    if (nl >= THEMES.length) { setPhase("won"); setRunning(false); stopMusic(); SFX.win(); return; }
    const level = buildLevel(nl);
    s.idx = nl; s.level = level;
    s.player.hp = Math.min(5, s.player.hp + 1);
    Object.assign(s.player, { x: 60, y: GROUND - 50, vx: 0, vy: 0, facing: 1, onGround: true, jumps: 0, swing: 0, shuriken: Math.max(s.player.shuriken, 6), hurt: 0, atkCd: 0 });
    s.enemies = level.enemies; s.scrolls = level.scrolls.map((sc) => ({ ...sc, taken: false })); s.shurikens = []; s.particles = []; s.cleared = false;
    setHud((h) => ({ ...h, level: nl + 1, shuriken: s.player.shuriken, hp: s.player.hp }));
    SFX.levelUp();
  }, []);

  const doJump = useCallback(() => {
    const s = stateRef.current; if (!s || phase !== "playing") return;
    const p = s.player;
    if (p.onGround) { p.vy = -11.5; p.onGround = false; p.jumps = 1; SFX.jump(); }
    else if (p.jumps < MAX_JUMPS) { p.vy = -10; p.jumps++; SFX.jump(); }
  }, [phase]);
  const doAttack = useCallback(() => {
    const s = stateRef.current; if (!s || phase !== "playing") return;
    const p = s.player; if (p.atkCd > 0) return;
    p.swing = 0.22; p.atkCd = 0.32; SFX.swing();
    const hb = { x: p.facing > 0 ? p.x + p.w : p.x - 34, y: p.y, w: 34, h: p.h };
    s.enemies.forEach((e) => {
      if (e.dead) return;
      if (hb.x < e.x + e.w && hb.x + hb.w > e.x && hb.y < e.y + e.h && hb.y + hb.h > e.y) {
        e.hp -= 1; e.hurt = 0.15; e.x += p.facing * 8; SFX.hit();
        if (e.hp <= 0) { e.dead = true; s.score += 100; setHud((h) => ({ ...h, score: s.score })); burst(s, e.x + e.w / 2, e.y + e.h / 2); }
      }
    });
  }, [phase]);
  const doShuriken = useCallback(() => {
    const s = stateRef.current; if (!s || phase !== "playing") return;
    const p = s.player; if (p.shuriken <= 0) return;
    p.shuriken -= 1; setHud((h) => ({ ...h, shuriken: p.shuriken })); SFX.shuriken();
    s.shurikens.push({ x: p.x + p.w / 2, y: p.y + 18, vx: p.facing * 8, life: 1.5 });
  }, [phase]);

  // mount + game loop
  useEffect(() => {
    aliveRef.current = true;
    const canvas = canvasRef.current; if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = VW * dpr; canvas.height = VH * dpr;
    const ctx2 = canvas.getContext("2d"); ctx2.scale(dpr, dpr);
    ctx2.imageSmoothingEnabled = true;

    let last = performance.now();
    const loop = (now) => {
      const dt = Math.min((now - last) / 1000, 0.05); last = now;
      const s = stateRef.current;
      if (running && s && phase === "playing") stepGame(dt, s);
      render(ctx2, s);
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => { aliveRef.current = false; cancelAnimationFrame(rafRef.current); stopMusic(); setRunning(false); };
  }, [running, phase]);

  const stepGame = (dt, s) => {
    const p = s.player; s.time += dt;
    const speed = 3.2;
    p.vx = 0;
    if (keys.current.left) { p.vx = -speed; p.facing = -1; }
    if (keys.current.right) { p.vx = speed; p.facing = 1; }
    p.vy += GRAVITY;
    const oldY = p.y;
    p.x += p.vx; p.y += p.vy;
    p.onGround = false;
    if (p.y + p.h >= GROUND) { p.y = GROUND - p.h; p.vy = 0; p.onGround = true; p.jumps = 0; }
    for (const pl of s.level.platforms) {
      if (p.vy >= 0 && oldY + p.h <= pl.y + 10 && p.y + p.h >= pl.y && p.x + p.w > pl.x + 2 && p.x < pl.x + pl.w - 2) {
        p.y = pl.y - p.h; p.vy = 0; p.onGround = true; p.jumps = 0;
      }
    }
    p.x = Math.max(0, Math.min(WW - p.w, p.x));
    if (p.swing > 0) p.swing -= dt; if (p.atkCd > 0) p.atkCd -= dt; if (p.hurt > 0) p.hurt -= dt;
    // scrolls
    s.scrolls.forEach((sc) => {
      if (sc.taken) return;
      if (p.x < sc.x + 22 && p.x + p.w > sc.x && p.y < sc.y + 22 && p.y + p.h > sc.y) {
        sc.taken = true; p.shuriken += 3; s.score += 50; setHud((h) => ({ ...h, shuriken: p.shuriken, score: s.score })); SFX.collect(); burst(s, sc.x + 9, sc.y + 9);
      }
    });
    // enemies
    s.enemies.forEach((e) => {
      if (e.dead) return; if (e.hurt > 0) e.hurt -= dt;
      e.x += e.dir * 1.3; if (e.x < e.range[0]) e.dir = 1; if (e.x + e.w > e.range[1]) e.dir = -1;
      e.dir = p.x > e.x ? 1 : -1; // face player
      e.vy += GRAVITY; const eold = e.y; e.y += e.vy;
      if (e.y + e.h >= GROUND) { e.y = GROUND - e.h; e.vy = 0; }
      for (const pl of s.level.platforms) {
        if (e.vy >= 0 && eold + e.h <= pl.y + 10 && e.y + e.h >= pl.y && e.x + e.w > pl.x + 2 && e.x < pl.x + pl.w - 2) { e.y = pl.y - e.h; e.vy = 0; }
      }
      if (p.hurt <= 0 && p.x < e.x + e.w && p.x + p.w > e.x && p.y < e.y + e.h && p.y + p.h > e.y) {
        p.hp -= 1; p.hurt = 1; SFX.hurt(); setHud((h) => ({ ...h, hp: p.hp })); p.x = Math.max(0, Math.min(WW - p.w, p.x - p.facing * 14)); p.vy = -6;
        if (p.hp <= 0) { setPhase("over"); stopMusic(); SFX.over(); }
      }
    });
    // traps
    if (p.hurt <= 0) s.level.traps.forEach((tr) => {
      if (p.x + p.w > tr.x && p.x < tr.x + tr.w && p.y + p.h >= GROUND - 2) {
        p.hp -= 1; p.hurt = 1; SFX.hurt(); setHud((h) => ({ ...h, hp: p.hp })); p.vy = -8;
        if (p.hp <= 0) { setPhase("over"); stopMusic(); SFX.over(); }
      }
    });
    // shurikens
    s.shurikens = s.shurikens.filter((pr) => {
      pr.x += pr.vx; pr.life -= dt;
      if (pr.life <= 0 || pr.x < -10 || pr.x > WW + 10) return false;
      for (const e of s.enemies) {
        if (e.dead) continue;
        if (pr.x < e.x + e.w && pr.x > e.x && pr.y < e.y + e.h && pr.y > e.y) {
          e.hp -= 1; e.hurt = 0.15; SFX.hit();
          if (e.hp <= 0) { e.dead = true; s.score += 100; setHud((h) => ({ ...h, score: s.score })); burst(s, e.x + e.w / 2, e.y + e.h / 2); }
          burst(s, pr.x, pr.y); return false;
        }
      }
      return true;
    });
    s.particles = s.particles.filter((pt) => { pt.vy += 0.3; pt.x += pt.vx; pt.y += pt.vy; pt.life -= dt; return pt.life > 0; });
    // gate
    const g = s.level.gate;
    if (!s.cleared && p.x + p.w > g.x && p.x < g.x + g.w && p.y + p.h > g.y) {
      s.cleared = true; if (bannerRef.current) bannerRef.current.style.opacity = "1";
      setTimeout(() => { if (bannerRef.current) bannerRef.current.style.opacity = "0"; if (aliveRef.current) nextLevel(); }, 800);
    }
  };

  const render = (ctx2, s) => {
    if (flashRef.current) flashRef.current.style.opacity = (s && phase === "playing" && s.player.hurt > 0) ? String(Math.min(s.player.hurt * 0.7, 0.5)) : "0";
    const th = THEMES[s ? s.idx : 0];
    const cx = s ? Math.max(0, Math.min(WW - VW, s.player.x + s.player.w / 2 - VW / 2)) : 0;
    drawBackground(ctx2, th, s ? s.level : previewRef.current, cx, s ? s.time : 0);
    if (s) {
      const level = s.level;
      level.platforms.forEach((pl) => drawPlatform(ctx2, pl, cx));
      drawTerrain(ctx2, th, cx);
      level.torches.forEach((tx) => drawTorch(ctx2, tx, cx, s.time));
      drawBonfire(ctx2, level.bonfire, cx, s.time);
      level.traps.forEach((tr) => drawTrap(ctx2, tr, cx));
      drawGate(ctx2, level.gate, cx, s.time);
      s.scrolls.forEach((sc) => { if (!sc.taken) drawScroll(ctx2, sc, cx, s.time); });
      s.enemies.forEach((e) => { if (!e.dead) drawEnemy(ctx2, e, cx, s.time); });
      s.shurikens.forEach((pr) => drawShuriken(ctx2, pr, cx, s.time));
      drawNinja(ctx2, s.player, cx, s.time);
      // particles
      ctx2.save(); ctx2.globalCompositeOperation = "lighter";
      s.particles.forEach((pt) => { ctx2.fillStyle = `rgba(255,150,40,${Math.max(pt.life * 2, 0)})`; ctx2.beginPath(); ctx2.arc(pt.x - cx, pt.y, 3, 0, Math.PI * 2); ctx2.fill(); });
      ctx2.restore();
      // fog vignette
      const vg = ctx2.createRadialGradient(VW / 2, VH / 2, 120, VW / 2, VH / 2, 340);
      vg.addColorStop(0, "rgba(0,0,0,0)"); vg.addColorStop(1, "rgba(0,0,0,0.35)");
      ctx2.fillStyle = vg; ctx2.fillRect(0, 0, VW, VH);
    } else {
      drawTerrain(ctx2, th, cx);
    }
  };

  // keyboard
  useEffect(() => {
    const down = (e) => {
      if (["ArrowLeft", "a", "A"].includes(e.key)) keys.current.left = true;
      if (["ArrowRight", "d", "D"].includes(e.key)) keys.current.right = true;
      if (["ArrowUp", "w", "W", " "].includes(e.key)) { doJump(); e.preventDefault(); }
      if (e.key === "j" || e.key === "J") doAttack();
      if (e.key === "k" || e.key === "K") doShuriken();
    };
    const up = (e) => {
      if (["ArrowLeft", "a", "A"].includes(e.key)) keys.current.left = false;
      if (["ArrowRight", "d", "D"].includes(e.key)) keys.current.right = false;
    };
    window.addEventListener("keydown", down); window.addEventListener("keyup", up);
    return () => { window.removeEventListener("keydown", down); window.removeEventListener("keyup", up); };
  }, [doJump, doAttack, doShuriken]);

  const hold = (k, v) => () => { keys.current[k] = v; };

  return (
    <div className="select-none flex flex-col items-center">
      <div className="flex items-center justify-between w-full max-w-[400px] mb-3 px-1">
        <div className="flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Heart key={i} className={`w-5 h-5 ${i < hud.hp ? "text-rose-500 fill-rose-500" : "text-muted-foreground/40"}`} />
          ))}
        </div>
        <div className="text-xs font-bold text-muted-foreground">{THEMES[hud.level - 1]?.name}</div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-extrabold text-primary tabular-nums">{hud.score}</span>
          <span className="flex items-center gap-0.5 text-cyan-500 font-bold">{hud.shuriken}<Crosshair className="w-4 h-4" /></span>
        </div>
      </div>

      <div className="relative rounded-2xl overflow-hidden border border-primary/30 shadow-xl" style={{ width: "min(92vw, 400px)" }}>
        <canvas ref={canvasRef} style={{ width: "100%", height: "auto", display: "block" }} />
        <div ref={flashRef} className="pointer-events-none absolute inset-0 transition-opacity duration-100" style={{ opacity: 0, background: "radial-gradient(circle at center, transparent 35%, rgba(220,40,40,0.5) 100%)" }} />
        <div ref={bannerRef} className="pointer-events-none absolute inset-0 flex items-center justify-center transition-opacity duration-300" style={{ opacity: 0 }}>
          <div className="text-3xl font-extrabold text-amber-400 drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)]">{t("Level Cleared!")}</div>
        </div>

        <AnimatePresence>
          {phase === "ready" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-background/85 backdrop-blur-sm flex flex-col items-center justify-center gap-4 p-6 text-center">
              <div className="flex items-center gap-2 text-2xl font-extrabold text-foreground"><Swords className="w-7 h-7 text-primary" /> {t("Ninja Quest")}</div>
              <p className="text-sm text-muted-foreground max-w-[300px]">{t("A shadow ninja in a painted world. Run, double-jump, slash samurai, throw shurikens, collect scrolls, dodge spikes, and reach the gate across 3 maps.")}</p>
              <div className="text-[11px] text-muted-foreground/80 leading-relaxed">
                {t("Move")}: ← → · {t("Jump")}: ↑ (×3) · {t("Sword")}: J · {t("Shuriken")}: K
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
              <div className="text-sm text-muted-foreground">{t("You cleared all maps")}. {t("Score")}: <span className="font-bold text-foreground">{hud.score}</span></div>
              <Button onClick={newGame} className="bg-primary text-primary-foreground rounded-2xl px-6 py-4"><RotateCcw className="w-4 h-4 mr-2" />{t("Play again")}</Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-4 w-full max-w-[400px] flex items-center justify-between gap-3">
        <div className="flex gap-2">
          <button onTouchStart={hold("left", true)} onTouchEnd={hold("left", false)} onMouseDown={hold("left", true)} onMouseUp={hold("left", false)} onMouseLeave={hold("left", false)}
            className="w-14 h-14 rounded-2xl bg-card border border-border flex items-center justify-center text-foreground active:bg-primary/20 transition-colors"><ChevronLeft className="w-7 h-7" /></button>
          <button onTouchStart={hold("right", true)} onTouchEnd={hold("right", false)} onMouseDown={hold("right", true)} onMouseUp={hold("right", false)} onMouseLeave={hold("right", false)}
            className="w-14 h-14 rounded-2xl bg-card border border-border flex items-center justify-center text-foreground active:bg-primary/20 transition-colors"><ChevronRight className="w-7 h-7" /></button>
        </div>
        <div className="flex gap-2">
          <button onClick={doAttack} className="w-14 h-14 rounded-2xl bg-primary/15 border border-primary/40 flex items-center justify-center text-primary active:scale-95 transition-transform"><Swords className="w-6 h-6" /></button>
          <button onClick={doShuriken} disabled={hud.shuriken <= 0} className="w-14 h-14 rounded-2xl bg-cyan-400/15 border border-cyan-400/40 flex items-center justify-center text-cyan-500 active:scale-95 transition-transform disabled:opacity-40"><Crosshair className="w-6 h-6" /></button>
          <button onClick={doJump} className="w-14 h-14 rounded-2xl bg-card border border-border flex items-center justify-center text-foreground active:scale-95 transition-transform text-xl font-bold">↑</button>
        </div>
      </div>
    </div>
  );
}