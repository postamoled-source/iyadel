import { useRef, useEffect, useState, useCallback } from "react";
import * as THREE from "three";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Heart, Flame, Swords, ChevronLeft, ChevronRight, Play, RotateCcw, Trophy } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const VW = 400, VH = 560, GROUND = 500, GRAVITY = 0.7;
const SX = (x) => x - VW / 2;
const SY = (y) => VH / 2 - y;

// ---------- Audio (synthesized ninja music + SFX) ----------
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
const noise = (dur, vol = 0.2) => {
  const c = ctx(); const len = Math.floor(c.sampleRate * dur);
  const buf = c.createBuffer(1, len, c.sampleRate); const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
  const src = c.createBufferSource(); src.buffer = buf; const g = c.createGain(); g.gain.value = vol;
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
const SCALE = [440, 523.25, 587.33, 659.25, 783.99, 880];
let musicTimer = null, musicOn = false;
const startMusic = () => {
  if (musicOn) return; musicOn = true; let step = 0;
  const tick = () => {
    if (!musicOn) return; const c = ctx();
    const f = SCALE[Math.floor(Math.random() * SCALE.length)];
    const o = c.createOscillator(); const g = c.createGain();
    o.type = "triangle"; o.frequency.value = f;
    g.gain.setValueAtTime(0.05, c.currentTime); g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.5);
    o.connect(g).connect(c.destination); o.start(); o.stop(c.currentTime + 0.5);
    if (step % 2 === 0) {
      const d = c.createOscillator(); const dg = c.createGain();
      d.type = "sine"; d.frequency.value = 110;
      dg.gain.setValueAtTime(0.04, c.currentTime); dg.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.8);
      d.connect(dg).connect(c.destination); d.start(); d.stop(c.currentTime + 0.8);
    }
    step++; musicTimer = setTimeout(tick, 360);
  };
  tick();
};
const stopMusic = () => { musicOn = false; if (musicTimer) { clearTimeout(musicTimer); musicTimer = null; } };

// ---------- Levels ----------
const LEVELS = [
  { name: "Bamboo Forest", theme: "forest",
    sky: ["#e0d4b8", "#5f8a6a"],
    enemies: [
      { type: "soldier", x: 240, y: 470, bound: [200, 330] },
      { type: "soldier", x: 100, y: 470, bound: [60, 160] },
      { type: "monster", x: 320, y: 470, bound: [280, 380] },
    ], treasure: { x: 360, y: 430 } },
  { name: "Cursed Cave", theme: "cave",
    sky: ["#3a2a3f", "#15101a"],
    enemies: [
      { type: "soldier", x: 120, y: 470, bound: [60, 200] },
      { type: "monster", x: 280, y: 470, bound: [220, 360] },
      { type: "monster", x: 200, y: 470, bound: [160, 260] },
      { type: "soldier", x: 340, y: 470, bound: [300, 380] },
    ], treasure: { x: 50, y: 430 } },
  { name: "Castle at Night", theme: "castle",
    sky: ["#2a2050", "#0d0a1e"],
    enemies: [
      { type: "monster", x: 120, y: 470, bound: [60, 200] },
      { type: "monster", x: 280, y: 470, bound: [220, 360] },
      { type: "soldier", x: 200, y: 470, bound: [120, 300], hp: 3, big: true },
      { type: "monster", x: 340, y: 470, bound: [300, 380] },
    ], treasure: { x: 360, y: 430 } },
];

// ---------- three.js helpers ----------
const BLACK = () => new THREE.MeshBasicMaterial({ color: 0x000000 });
const box = (w, h, d) => new THREE.Mesh(new THREE.BoxGeometry(w, h, d), BLACK());
// limb pivoting at its top (shoulder/hip)
const limb = (w, h) => { const g = new THREE.Group(); const m = box(w, h, 1); m.position.y = -h / 2; g.add(m); return g; };

function gradientTexture(top, bottom) {
  const c = document.createElement("canvas"); c.width = 4; c.height = 256;
  const x = c.getContext("2d"); const g = x.createLinearGradient(0, 0, 0, 256);
  g.addColorStop(0, top); g.addColorStop(1, bottom); x.fillStyle = g; x.fillRect(0, 0, 4, 256);
  const t = new THREE.CanvasTexture(c); t.needsUpdate = true; return t;
}
function radialTexture(inner, outer) {
  const c = document.createElement("canvas"); c.width = c.height = 64;
  const x = c.getContext("2d"); const g = x.createRadialGradient(32, 32, 2, 32, 32, 32);
  g.addColorStop(0, inner); g.addColorStop(1, outer); x.fillStyle = g; x.fillRect(0, 0, 64, 64);
  const t = new THREE.CanvasTexture(c); t.needsUpdate = true; return t;
}
function mountainTexture() {
  const c = document.createElement("canvas"); c.width = 400; c.height = 200;
  const x = c.getContext("2d"); x.clearRect(0, 0, 400, 200);
  x.fillStyle = "#000"; x.beginPath(); x.moveTo(0, 200);
  let px = 0;
  while (px < 400) { const h = 90 + Math.random() * 80; const w = 60 + Math.random() * 60; x.lineTo(px, 200 - h); x.lineTo(px + w, 200); px += w; }
  x.lineTo(400, 200); x.fill();
  const t = new THREE.CanvasTexture(c); t.needsUpdate = true; return t;
}

function makeNinja() {
  const g = new THREE.Group();
  const legL = limb(5, 18); legL.position.set(-6, 18, 0); g.add(legL);
  const legR = limb(5, 18); legR.position.set(6, 18, 0); g.add(legR);
  const body = box(18, 22, 9); body.position.set(0, 30, 0); g.add(body);
  const head = new THREE.Mesh(new THREE.SphereGeometry(8, 16, 16), BLACK()); head.position.set(0, 46, 0); g.add(head);
  const band = box(17, 2.5, 0.6); band.position.set(0, 48, 6); g.add(band);
  const armL = limb(4, 16); armL.position.set(-12, 38, 0); g.add(armL);
  const armR = limb(4, 16); armR.position.set(12, 38, 0); g.add(armR);
  const sword = box(1.5, 30, 1); sword.position.set(0, -28, 0); armR.add(sword);
  const hilt = box(3, 5, 2); hilt.position.set(0, -14, 0); armR.add(hilt);
  return { group: g, legL, legR, armL, armR, body };
}
function makeSoldier(big) {
  const g = new THREE.Group();
  const legL = limb(5, 18); legL.position.set(-6, 18, 0); g.add(legL);
  const legR = limb(5, 18); legR.position.set(6, 18, 0); g.add(legR);
  const body = box(big ? 22 : 18, big ? 26 : 22, 9); body.position.set(0, big ? 32 : 30, 0); g.add(body);
  const head = new THREE.Mesh(new THREE.SphereGeometry(big ? 10 : 8, 16, 16), BLACK()); head.position.set(0, big ? 50 : 46, 0); g.add(head);
  const hat = new THREE.Mesh(new THREE.ConeGeometry(big ? 11 : 9, big ? 14 : 11, 8), BLACK()); hat.position.set(0, big ? 60 : 54, 0); g.add(hat);
  const armL = limb(4, 15); armL.position.set(-11, big ? 42 : 38, 0); g.add(armL);
  const armR = limb(4, 15); armR.position.set(11, big ? 42 : 38, 0); g.add(armR);
  // spear held diagonally
  const spear = box(1.5, 50, 1); spear.position.set(0, -10, 6); spear.rotation.z = 0.4; armR.add(spear);
  return { group: g, legL, legR, armL, armR, body };
}
function makeMonster() {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.SphereGeometry(16, 18, 16), BLACK()); body.position.set(0, 18, 0); g.add(body);
  const base = box(30, 9, 10); base.position.set(0, 4, 0); g.add(base);
  // spikes
  for (let i = 0; i < 5; i++) { const sp = new THREE.Mesh(new THREE.ConeGeometry(3, 8, 6), BLACK()); sp.position.set(-12 + i * 6, 30, 0); g.add(sp); }
  const eyeMat = new THREE.MeshBasicMaterial({ color: 0xffff44 });
  const eL = new THREE.Mesh(new THREE.SphereGeometry(3, 8, 8), eyeMat); eL.position.set(-6, 22, 13); g.add(eL);
  const eR = new THREE.Mesh(new THREE.SphereGeometry(3, 8, 8), eyeMat); eR.position.set(6, 22, 13); g.add(eR);
  return { group: g };
}

export default function NinjaGame() {
  const { t } = useI18n();
  const mountRef = useRef(null);
  const stateRef = useRef(null);
  const keys = useRef({ left: false, right: false });
  const sceneRef = useRef(null);
  const entsRef = useRef(null); // { ninja, enemies:[], treasure, fire, particles, env }
  const [hud, setHud] = useState({ hp: 5, score: 0, fire: 0, level: 1, total: LEVELS.length });
  const [phase, setPhase] = useState("ready");
  const [running, setRunning] = useState(false);

  const burst = (s, x, y, color) => {
    for (let i = 0; i < 10; i++) s.particles.push({ x, y, vx: (Math.random() - 0.5) * 6, vy: (Math.random() - 0.5) * 6 - 2, life: 0.5, color });
  };

  const buildEnv = (scene, theme, sky) => {
    const env = new THREE.Group();
    // sky
    const skyMat = new THREE.MeshBasicMaterial({ map: gradientTexture(sky[0], sky[1]), depthWrite: false });
    const skyPlane = new THREE.Mesh(new THREE.PlaneGeometry(VW * 2, VH * 2), skyMat); skyPlane.position.set(0, 0, -500); env.add(skyPlane);
    // moon
    if (theme === "castle" || theme === "cave") {
      const moon = new THREE.Sprite(new THREE.SpriteMaterial({ map: radialTexture("rgba(255,255,240,1)", "rgba(255,255,240,0)"), depthWrite: false }));
      moon.scale.set(80, 80, 1); moon.position.set(-110, 150, -450); env.add(moon);
    } else {
      const sun = new THREE.Sprite(new THREE.SpriteMaterial({ map: radialTexture("rgba(255,250,220,0.9)", "rgba(255,240,180,0)"), depthWrite: false }));
      sun.scale.set(120, 120, 1); sun.position.set(110, 140, -450); env.add(sun);
    }
    // distant mountains
    const mtMat = new THREE.MeshBasicMaterial({ map: mountainTexture(), transparent: true, depthWrite: false });
    const mt = new THREE.Mesh(new THREE.PlaneGeometry(VW, 220), mtMat); mt.position.set(0, -40, -300); env.add(mt);
    const torches = [];
    // theme props
    if (theme === "forest") {
      for (let i = 0; i < 7; i++) { const x = -180 + i * 55 + (Math.sin(i) * 10); const bam = new THREE.Mesh(new THREE.CylinderGeometry(7, 8, 360, 8), BLACK()); bam.position.set(x, 40, -150 + (i % 2) * 20); env.add(bam); }
    } else if (theme === "castle") {
      const tower = new THREE.Mesh(new THREE.CylinderGeometry(28, 32, 240, 8), BLACK()); tower.position.set(0, -20, -160); env.add(tower);
      const wall = box(120, 140, 8); wall.position.set(80, -50, -170); env.add(wall);
    }
    // ground silhouette with jagged grass
    const groundMat = BLACK();
    const gh = VH - GROUND + 240;
    const ground = new THREE.Mesh(new THREE.BoxGeometry(VW + 4, gh, 20), groundMat);
    ground.position.set(0, SY(GROUND) - gh / 2, 0); env.add(ground);
    const grass = [];
    for (let i = 0; i < 60; i++) {
      const blade = new THREE.Mesh(new THREE.ConeGeometry(2, 8 + Math.random() * 6, 4), BLACK());
      const gx = -VW / 2 + 4 + (i / 60) * VW; blade.position.set(gx, SY(GROUND) + 4, 4); env.add(blade); grass.push(blade);
    }
    // torches
    const torchX = theme === "forest" ? [-140, 150] : theme === "cave" ? [60, 320] : [-150, 160];
    torchX.forEach((tx) => {
      const post = box(6, 70, 6); post.position.set(SX(tx), -185, 6); env.add(post);
      const flame = new THREE.Sprite(new THREE.SpriteMaterial({ map: radialTexture("rgba(255,220,120,1)", "rgba(255,80,0,0)"), blending: THREE.AdditiveBlending, depthWrite: false }));
      flame.scale.set(34, 34, 1); flame.position.set(SX(tx), -150, 12); env.add(flame);
      torches.push({ flame });
    });
    scene.add(env);
    return { env, torches };
  };

  const setupScene = useCallback(() => {
    const scene = new THREE.Scene();
    const cam = new THREE.OrthographicCamera(-VW / 2, VW / 2, VH / 2, -VH / 2, -1000, 1000);
    cam.position.set(0, 0, 600); cam.lookAt(0, 0, 0);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(VW, VH);
    renderer.setClearColor(0x000000, 1);
    sceneRef.current = { scene, cam, renderer };
    return { scene, cam, renderer };
  }, []);

  const loadLevel = useCallback((lvl) => {
    const ref = sceneRef.current; if (!ref) return;
    // clear dynamic groups
    const toRemove = []; ref.scene.children.forEach((c) => { if (c.userData.dynamic) toRemove.push(c); });
    toRemove.forEach((c) => ref.scene.remove(c));
    const L = LEVELS[lvl];
    // environment
    const { env, torches } = buildEnv(ref.scene, L.theme, L.sky);
    env.userData.dynamic = true;
    // ninja
    const ninja = makeNinja(); ninja.group.userData.dynamic = true; ref.scene.add(ninja.group);
    // enemies
    const enemies = L.enemies.map((e) => {
      const m = e.type === "soldier" ? makeSoldier(e.big) : makeMonster();
      m.group.userData.dynamic = true; ref.scene.add(m.group); return m;
    });
    // treasure
    const treasure = new THREE.Group(); treasure.userData.dynamic = true;
    const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: radialTexture("rgba(255,220,90,0.9)", "rgba(255,180,0,0)"), blending: THREE.AdditiveBlending, depthWrite: false }));
    glow.scale.set(50, 50, 1); glow.position.set(0, 0, 1); treasure.add(glow);
    const gem = new THREE.Mesh(new THREE.OctahedronGeometry(8), new THREE.MeshBasicMaterial({ color: 0xf4c430 }));
    gem.position.set(0, 0, 2); treasure.add(gem);
    ref.scene.add(treasure);
    // fire + particle pools
    const firePool = []; for (let i = 0; i < 8; i++) { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: radialTexture("rgba(255,240,180,1)", "rgba(255,80,0,0)"), blending: THREE.AdditiveBlending, depthWrite: false })); sp.scale.set(20, 20, 1); sp.visible = false; sp.userData.dynamic = true; ref.scene.add(sp); firePool.push(sp); }
    const partPool = []; for (let i = 0; i < 40; i++) { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: radialTexture("rgba(255,140,40,0.9)", "rgba(255,80,0,0)"), blending: THREE.AdditiveBlending, depthWrite: false })); sp.scale.set(10, 10, 1); sp.visible = false; sp.userData.dynamic = true; ref.scene.add(sp); partPool.push(sp); }
    entsRef.current = { ninja, enemies, treasure, firePool, partPool, torches };
  }, []);

  const newGame = useCallback(() => {
    resumeAudio();
    const lvl = 0;
    if (!sceneRef.current) setupScene();
    loadLevel(lvl);
    const enemies = LEVELS[lvl].enemies.map((e) => ({ ...e, w: e.big ? 34 : 28, h: 44, dir: 1, hp: e.hp || (e.big ? 3 : 2), vy: 0, hurt: 0, dead: false, jumpT: 0 }));
    stateRef.current = {
      level: lvl,
      player: { x: 30, y: GROUND - 50, w: 26, h: 50, vx: 0, vy: 0, facing: 1, onGround: true, hp: 5, fire: 0, swing: 0, hurt: 0, atkCd: 0 },
      enemies, projectiles: [], particles: [], treasure: { ...LEVELS[lvl].treasure, taken: false, bob: 0 }, score: 0, cleared: false, time: 0,
    };
    setHud({ hp: 5, score: 0, fire: 0, level: 1, total: LEVELS.length });
    setPhase("playing"); setRunning(true); startMusic();
  }, [setupScene, loadLevel]);

  const nextLevel = useCallback(() => {
    const s = stateRef.current; if (!s) return;
    const nl = s.level + 1;
    if (nl >= LEVELS.length) { setPhase("won"); setRunning(false); stopMusic(); SFX.win(); return; }
    loadLevel(nl);
    const enemies = LEVELS[nl].enemies.map((e) => ({ ...e, w: e.big ? 34 : 28, h: 44, dir: 1, hp: e.hp || (e.big ? 3 : 2), vy: 0, hurt: 0, dead: false, jumpT: 0 }));
    s.level = nl; s.enemies = enemies; s.projectiles = []; s.particles = [];
    s.treasure = { ...LEVELS[nl].treasure, taken: false, bob: 0 };
    Object.assign(s.player, { x: 30, y: GROUND - 50, vx: 0, vy: 0, fire: 0, swing: 0, hurt: 0, atkCd: 0 });
    s.cleared = false;
    setHud((h) => ({ ...h, level: nl + 1 }));
    SFX.levelUp();
  }, [loadLevel]);

  const doAttack = useCallback(() => {
    const s = stateRef.current; if (!s || phase !== "playing") return;
    const p = s.player; if (p.atkCd > 0) return;
    p.swing = 0.22; p.atkCd = 0.32; SFX.swing();
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
    const p = s.player; if (p.fire <= 0) return;
    p.fire -= 1; setHud((h) => ({ ...h, fire: p.fire })); SFX.fire();
    s.projectiles.push({ x: p.x + p.w / 2, y: p.y + 14, vx: p.facing * 7, r: 6, life: 1.2 });
  }, [phase]);
  const doJump = useCallback(() => {
    const s = stateRef.current; if (!s || phase !== "playing") return;
    const p = s.player; if (p.onGround) { p.vy = -13; p.onGround = false; SFX.jump(); }
  }, [phase]);

  // mount renderer
  useEffect(() => {
    const { renderer } = setupScene();
    const mount = mountRef.current; mount.appendChild(renderer.domElement);
    renderer.domElement.style.width = "100%"; renderer.domElement.style.height = "auto"; renderer.domElement.style.display = "block";
    return () => { stopMusic(); setRunning(false); renderer.dispose(); if (renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement); sceneRef.current = null; };
  }, [setupScene]);

  // keyboard
  useEffect(() => {
    const down = (e) => {
      if (["ArrowLeft", "a", "A"].includes(e.key)) keys.current.left = true;
      if (["ArrowRight", "d", "D"].includes(e.key)) keys.current.right = true;
      if (["ArrowUp", "w", "W", " "].includes(e.key)) { doJump(); e.preventDefault(); }
      if (e.key === "j" || e.key === "J") doAttack();
      if (e.key === "k" || e.key === "K") doFire();
    };
    const up = (e) => {
      if (["ArrowLeft", "a", "A"].includes(e.key)) keys.current.left = false;
      if (["ArrowRight", "d", "D"].includes(e.key)) keys.current.right = false;
    };
    window.addEventListener("keydown", down); window.addEventListener("keyup", up);
    return () => { window.removeEventListener("keydown", down); window.removeEventListener("keyup", up); };
  }, [doJump, doAttack, doFire]);

  const updateNinja = (n, p, time) => {
    n.group.position.set(SX(p.x + p.w / 2), SY(p.y + p.h), 0);
    n.group.scale.x = p.facing;
    const moving = Math.abs(p.vx) > 0.1;
    const sw = moving ? Math.sin(time * 9) * 0.6 : 0;
    n.legL.rotation.x = sw; n.legR.rotation.x = -sw;
    n.armL.rotation.x = -sw;
    if (p.swing > 0) { const k = 1 - p.swing / 0.22; n.armR.rotation.x = -Math.PI * 0.5 + k * Math.PI * 1.1; }
    else n.armR.rotation.x = moving ? sw * 0.5 : 0;
    if (!p.onGround) { n.legL.rotation.x = 0.5; n.legR.rotation.x = 0.3; }
    n.group.visible = !(p.hurt > 0 && Math.floor(time * 20) % 2 === 0);
  };

  const syncMeshes = (s) => {
    const E = entsRef.current; if (!E) return;
    updateNinja(E.ninja, s.player, s.time);
    s.enemies.forEach((e, i) => {
      const m = E.enemies[i]; if (!m) return;
      m.group.visible = !e.dead;
      if (e.dead) return;
      m.group.position.set(SX(e.x + e.w / 2), SY(e.y + e.h), 0);
      m.group.scale.x = e.dir;
      if (e.type === "soldier") {
        const sw = Math.sin(s.time * 7) * 0.5;
        if (m.legL) { m.legL.rotation.x = sw; m.legR.rotation.x = -sw; }
        m.group.position.y = SY(e.y + e.h) + Math.abs(Math.sin(s.time * 7)) * 1.5;
      } else {
        m.group.position.y = SY(e.y + e.h) + Math.sin(s.time * 5) * 2;
      }
      if (e.hurt > 0) m.group.visible = Math.floor(s.time * 20) % 2 === 0;
    });
    E.treasure.visible = !s.treasure.taken;
    if (!s.treasure.taken) { const sc = 1 + Math.sin(s.time * 4) * 0.12; E.treasure.position.set(SX(s.treasure.x), SY(s.treasure.y - 8 + (s.treasure.bob || 0)), 0); E.treasure.scale.set(sc, sc, 1); E.treasure.rotation.y = s.time * 2; }
    // fire projectiles
    E.firePool.forEach((sp, i) => { const pr = s.projectiles[i]; if (pr) { sp.visible = true; sp.position.set(SX(pr.x), SY(pr.y), 6); sp.scale.setScalar(20 + Math.sin(s.time * 20) * 4); } else sp.visible = false; });
    // particles
    E.partPool.forEach((sp, i) => { const pt = s.particles[i]; if (pt) { sp.visible = true; sp.position.set(SX(pt.x), SY(pt.y), 6); const sc = Math.max(pt.life * 2, 0) * 14; sp.scale.setScalar(sc); } else sp.visible = false; });
    // torch flicker
    E.torches.forEach((tr) => { tr.flame.scale.setScalar(30 + Math.random() * 10); });
  };

  // game loop
  useEffect(() => {
    if (!running) return;
    const ref = sceneRef.current; if (!ref) return;
    let raf, last = performance.now();
    const loop = (now) => {
      const dt = Math.min((now - last) / 1000, 0.05); last = now;
      const s = stateRef.current;
      if (s) { stepGame(dt, s); syncMeshes(s); }
      ref.renderer.render(ref.scene, ref.cam);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [running]);

  const stepGame = (dt, s) => {
    const p = s.player; s.time += dt;
    p.vx = 0;
    if (keys.current.left) { p.vx = -3.4; p.facing = -1; }
    if (keys.current.right) { p.vx = 3.4; p.facing = 1; }
    p.vy += GRAVITY; p.x += p.vx; p.y += p.vy;
    if (p.y + p.h >= GROUND) { p.y = GROUND - p.h; p.vy = 0; p.onGround = true; } else p.onGround = false;
    if (p.x < 0) p.x = 0; if (p.x + p.w > VW) p.x = VW - p.w;
    if (p.swing > 0) p.swing -= dt; if (p.atkCd > 0) p.atkCd -= dt; if (p.hurt > 0) p.hurt -= dt;
    if (!s.treasure.taken) {
      s.treasure.bob = Math.sin(s.time * 4) * 4;
      const tr = { x: s.treasure.x - 12, y: s.treasure.y - 12 + s.treasure.bob, w: 24, h: 24 };
      if (p.x < tr.x + tr.w && p.x + p.w > tr.x && p.y < tr.y + tr.h && p.y + p.h > tr.y) {
        s.treasure.taken = true; p.fire += 4; s.score += 50; setHud((h) => ({ ...h, fire: p.fire, score: s.score })); SFX.collect(); burst(s, tr.x + 12, tr.y + 12, "#fc4");
      }
    }
    s.enemies.forEach((e) => {
      if (e.dead) return; if (e.hurt > 0) e.hurt -= dt;
      if (e.type === "soldier") { e.x += e.dir * 1.4; if (e.x < e.bound[0]) e.dir = 1; if (e.x + e.w > e.bound[1]) e.dir = -1; }
      else {
        e.jumpT -= dt; const dx = p.x - e.x; e.x += Math.sign(dx) * 0.9;
        if (e.x < e.bound[0]) e.x = e.bound[0]; if (e.x + e.w > e.bound[1]) e.x = e.bound[1] - e.w;
        if (e.jumpT <= 0 && Math.abs(dx) < 120) { e.vy = -8; e.jumpT = 1.6; }
        e.vy += GRAVITY; e.y += e.vy; if (e.y + e.h >= GROUND) { e.y = GROUND - e.h; e.vy = 0; } e.dir = dx >= 0 ? 1 : -1;
      }
      if (p.hurt <= 0 && p.x < e.x + e.w && p.x + p.w > e.x && p.y < e.y + e.h && p.y + p.h > e.y) {
        p.hp -= 1; p.hurt = 1; SFX.hurt(); setHud((h) => ({ ...h, hp: p.hp })); p.vx = -p.facing * 4; p.vy = -6;
        if (p.hp <= 0) { setPhase("over"); setRunning(false); stopMusic(); SFX.over(); }
      }
    });
    s.projectiles = s.projectiles.filter((pr) => {
      pr.x += pr.vx; pr.life -= dt;
      if (pr.life <= 0 || pr.x < -10 || pr.x > VW + 10) return false;
      for (const e of s.enemies) {
        if (e.dead) continue;
        if (pr.x < e.x + e.w && pr.x + pr.r > e.x && pr.y < e.y + e.h && pr.y + pr.r > e.y) {
          e.hp -= 1; e.hurt = 0.15; SFX.hit();
          if (e.hp <= 0) { e.dead = true; s.score += e.big ? 200 : 100; setHud((h) => ({ ...h, score: s.score })); burst(s, e.x + e.w / 2, e.y + e.h / 2, "#f74"); }
          burst(s, pr.x, pr.y, "#f80"); return false;
        }
      }
      return true;
    });
    s.particles = s.particles.filter((pt) => { pt.vy += 0.3; pt.x += pt.vx; pt.y += pt.vy; pt.life -= dt; return pt.life > 0; });
    if (!s.cleared && s.enemies.every((e) => e.dead)) { s.cleared = true; setTimeout(() => nextLevel(), 600); }
  };

  const hold = (k, v) => () => { keys.current[k] = v; };

  return (
    <div className="select-none flex flex-col items-center">
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

      <div className="relative rounded-2xl overflow-hidden border border-primary/30 shadow-xl" style={{ width: "min(92vw, 400px)" }}>
        <div ref={mountRef} className="w-full" />
        <div className="absolute top-2 left-1/2 -translate-x-1/2 text-[11px] font-bold text-white/90 bg-black/40 px-3 py-1 rounded-full backdrop-blur-sm">
          {LEVELS[hud.level - 1]?.name}
        </div>

        <AnimatePresence>
          {phase === "ready" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-background/85 backdrop-blur-sm flex flex-col items-center justify-center gap-4 p-6 text-center">
              <div className="flex items-center gap-2 text-2xl font-extrabold text-foreground"><Swords className="w-7 h-7 text-primary" /> {t("Ninja Quest 3D")}</div>
              <p className="text-sm text-muted-foreground max-w-[300px]">{t("A 3D silhouette ninja. Slash soldiers and monsters with your sword, grab the glowing treasure to charge fire, and clear all enemies across 3 levels.")}</p>
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