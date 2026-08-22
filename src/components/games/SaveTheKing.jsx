import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Crown, Leaf, Heart, Gem, Play, RotateCcw, Trophy, AlertTriangle } from "lucide-react";
import { playStart, playWin, playGameOver, playBubblePop, resumeAudio } from "@/lib/game-sounds";

// Danger scene canvas size.
const CW = 320, CH = 240;
// Match-3 board.
const COLS = 7, ROWS = 7;
const TILE_TYPES = 4;
// Level-1 tuning.
const GOAL = 6;
const LAVA_START = 0.12;
const LAVA_MAX = 0.6;      // lava reaches the platform → king falls
const LAVA_RISE = 0.018;  // per second
const LAVA_DRAIN = 0.09;   // per matched tile group

const TILE_META = [
  { Icon: Crown, color: "#ffd740", edge: "#b8860b" },
  { Icon: Leaf, color: "#69f0ae", edge: "#2e8b57" },
  { Icon: Heart, color: "#ff5252", edge: "#b71c1c" },
  { Icon: Gem, color: "#4fc3f7", edge: "#0277bd" },
];

let _id = 0;
const uid = () => ++_id;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const rand = (a, b) => a + Math.random() * (b - a);
const L = (a, b, k) => a + (b - a) * k;

function gridOf(board) {
  const g = Array.from({ length: ROWS }, () => Array(COLS).fill(null));
  for (const t of board) if (t.row >= 0 && t.row < ROWS) g[t.row][t.col] = t;
  return g;
}
function findMatches(board) {
  const g = gridOf(board);
  const set = new Set();
  for (let r = 0; r < ROWS; r++) {
    let run = 1;
    for (let c = 1; c <= COLS; c++) {
      const same = c < COLS && g[r][c] && g[r][c - 1] && g[r][c].type === g[r][c - 1].type;
      if (same) run++;
      else { if (run >= 3) for (let k = 0; k < run; k++) set.add(g[r][c - 1 - k].id); run = 1; }
    }
  }
  for (let c = 0; c < COLS; c++) {
    let run = 1;
    for (let r = 1; r <= ROWS; r++) {
      const same = r < ROWS && g[r][c] && g[r - 1][c] && g[r][c].type === g[r - 1][c].type;
      if (same) run++;
      else { if (run >= 3) for (let k = 0; k < run; k++) set.add(g[r - 1 - k][c].id); run = 1; }
    }
  }
  return set;
}
function makeBoard() {
  let b = [];
  for (let r = 0; r < ROWS; r++)
    for (let c = 0; c < COLS; c++) b.push({ id: uid(), type: Math.floor(Math.random() * TILE_TYPES), col: c, row: r });
  let m = findMatches(b), guard = 0;
  while (m.size && guard++ < 30) {
    for (const id of m) { const t = b.find((x) => x.id === id); if (t) t.type = (t.type + 1) % TILE_TYPES; }
    m = findMatches(b);
  }
  return b;
}
function applyGravity(board) {
  const g = gridOf(board);
  const out = [];
  for (let c = 0; c < COLS; c++) {
    const stack = [];
    for (let r = ROWS - 1; r >= 0; r--) if (g[r][c]) stack.push(g[r][c]);
    let rr = ROWS - 1;
    for (const t of stack) { t.row = rr; t.col = c; out.push(t); rr--; }
    while (rr >= 0) { out.push({ id: uid(), type: Math.floor(Math.random() * TILE_TYPES), col: c, row: rr, fresh: true }); rr--; }
  }
  return out;
}

// rounded limb
function capsule(ctx, x1, y1, x2, y2, w) {
  const a = Math.atan2(y2 - y1, x2 - x1);
  const nx = Math.cos(a + Math.PI / 2) * w, ny = Math.sin(a + Math.PI / 2) * w;
  ctx.beginPath();
  ctx.moveTo(x1 + nx, y1 + ny);
  ctx.lineTo(x2 + nx, y2 + ny);
  ctx.arc(x2, y2, w, a + Math.PI / 2, a + 3 * Math.PI / 2);
  ctx.lineTo(x1 - nx, y1 - ny);
  ctx.arc(x1, y1, w, a + 3 * Math.PI / 2, a + Math.PI / 2);
  ctx.closePath();
  ctx.fill();
}

// procedural anime king — articulated body, feet planted, reacts to lava urgency
function drawKing(ctx, cx, groundY, t, urgency) {
  const panic = urgency;
  const breath = 1 + Math.sin(t * 0.003) * 0.05;
  const sway = Math.sin(t * 0.0025) * (0.8 + panic * 3);
  const tremble = panic > 0.55 ? (Math.random() - 0.5) * panic * 3 : 0;
  const blink = (t % 4200) < 110 ? 1 : 0;
  const raise = Math.max(0, Math.min(1, (panic - 0.2) / 0.5)); // 0 calm → 1 panic
  const squat = panic > 0.6 ? (panic - 0.6) * 8 : 0;
  const lean = panic * 0.06;
  const x = cx + sway + tremble;

  const hipY = groundY - 30 + squat;
  const shoulderY = hipY - 26;
  const headR = 13;
  const headY = shoulderY - headR - 1;

  const skin = "#f7c9a3", skinSh = "#e3a877";
  const tunic = "#3b82f6", tunicSh = "#1e3a8a";
  const cape = "#dc2626", capeSh = "#7f1d1d";
  const boot = "#2a1a0e";
  const hair = "#1f1108", hairHi = "#4a2d18";
  const gold = "#fcd34d", goldSh = "#b45309";
  const iris = "#2563eb";

  // contact shadow on platform
  ctx.fillStyle = "rgba(0,0,0,0.38)";
  ctx.beginPath(); ctx.ellipse(x, groundY + 2, 22, 5, 0, 0, Math.PI * 2); ctx.fill();

  // cape behind
  ctx.save();
  ctx.translate(x, shoulderY);
  ctx.rotate(lean * 0.5);
  ctx.fillStyle = cape;
  ctx.beginPath();
  ctx.moveTo(-10, 0);
  ctx.quadraticCurveTo(-24 + sway * 0.4, hipY - shoulderY + 10, -18, groundY - shoulderY - 2);
  ctx.lineTo(18, groundY - shoulderY - 2);
  ctx.quadraticCurveTo(24 - sway * 0.4, hipY - shoulderY + 10, 10, 0);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = capeSh;
  ctx.beginPath();
  ctx.moveTo(-9, 2);
  ctx.quadraticCurveTo(-19, hipY - shoulderY + 12, -14, groundY - shoulderY - 2);
  ctx.lineTo(-6, groundY - shoulderY - 2);
  ctx.quadraticCurveTo(-10, hipY - shoulderY + 8, -5, 2);
  ctx.fill();
  ctx.restore();

  // legs — feet planted at groundY
  const spread = 4 + raise * 2;
  ctx.fillStyle = boot;
  capsule(ctx, x - spread, hipY, x - spread - 1, groundY - 6, 5.5);
  capsule(ctx, x - spread - 1, groundY - 6, x - spread + 4, groundY, 6.5);
  capsule(ctx, x + spread, hipY, x + spread + 1, groundY - 6, 5.5);
  capsule(ctx, x + spread + 1, groundY - 6, x + spread + 6, groundY, 6.5);
  ctx.fillStyle = "#1e3a8a";
  capsule(ctx, x - spread, hipY - 2, x - spread - 1, hipY + 13, 7.5);
  capsule(ctx, x + spread, hipY - 2, x + spread + 1, hipY + 13, 7.5);

  // torso (breathing + lean)
  ctx.save();
  ctx.translate(x, shoulderY + 13);
  ctx.rotate(lean);
  ctx.scale(breath, 1);
  const tg = ctx.createLinearGradient(0, -13, 0, 16);
  tg.addColorStop(0, tunic); tg.addColorStop(1, tunicSh);
  ctx.fillStyle = tg;
  ctx.beginPath();
  ctx.moveTo(-12, -13);
  ctx.quadraticCurveTo(-14, 0, -11, 16);
  ctx.lineTo(11, 16);
  ctx.quadraticCurveTo(14, 0, 12, -13);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = gold; ctx.fillRect(-12, -13, 24, 3); ctx.fillRect(-11, 12, 22, 4);
  ctx.fillStyle = "#ef4444"; ctx.beginPath(); ctx.arc(0, 13, 2.6, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#fbbf24"; ctx.beginPath(); ctx.moveTo(-6, -13); ctx.lineTo(0, -6); ctx.lineTo(6, -13); ctx.fill();
  ctx.restore();

  // arms — raise with panic, tremble
  const arm = (sx, dir) => {
    const sh = { x: x + sx, y: shoulderY - 1 };
    const elb = { x: x + sx + dir * (2 + raise * 4) + tremble * 0.3, y: shoulderY + 12 - raise * 16 };
    const hand = { x: x + sx + dir * (1 + raise * 12) + tremble * 0.4, y: shoulderY + 22 - raise * 40 };
    ctx.fillStyle = tunicSh; capsule(ctx, sh.x, sh.y, elb.x, elb.y, 5.5);
    ctx.fillStyle = tunicSh; capsule(ctx, elb.x, elb.y, hand.x, hand.y, 5);
    ctx.fillStyle = skin; ctx.beginPath(); ctx.arc(hand.x, hand.y, 3.8, 0, Math.PI * 2); ctx.fill();
  };
  arm(10, 1); arm(-10, -1);

  // head
  ctx.save();
  ctx.translate(x, headY);
  ctx.rotate(lean * 1.2 + sway * 0.008 + tremble * 0.006);
  ctx.fillStyle = skinSh; ctx.fillRect(-3.5, headR - 2, 7, 7); // neck
  ctx.fillStyle = hair; ctx.beginPath(); ctx.ellipse(0, -1, headR + 2, headR + 3, 0, 0, Math.PI * 2); ctx.fill(); // hair back
  ctx.fillStyle = skin; ctx.beginPath(); ctx.ellipse(0, 2, headR - 2, headR, 0, 0, Math.PI * 2); ctx.fill(); // face
  // spiky fringe
  ctx.fillStyle = hair;
  ctx.beginPath();
  ctx.moveTo(-headR - 1, -3);
  ctx.lineTo(-headR - 2, -headR + 2); ctx.lineTo(-headR + 4, -headR + 6);
  ctx.lineTo(-headR + 7, -headR - 2); ctx.lineTo(-headR + 12, -headR + 4);
  ctx.lineTo(-2, -headR - 3); ctx.lineTo(3, -headR + 3);
  ctx.lineTo(headR - 6, -headR - 1); ctx.lineTo(headR - 3, -headR + 5);
  ctx.lineTo(headR + 1, -headR + 1); ctx.lineTo(headR + 2, -3);
  ctx.quadraticCurveTo(0, -6, -headR - 1, -3);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = hairHi;
  ctx.beginPath(); ctx.moveTo(-headR + 2, -headR + 4); ctx.lineTo(-4, -headR + 2); ctx.lineTo(-2, -headR + 8); ctx.closePath(); ctx.fill();
  // eyes
  const ex = 4.5, ey = 1;
  if (blink) {
    ctx.strokeStyle = "#3a2410"; ctx.lineWidth = 1.6; ctx.lineCap = "round";
    ctx.beginPath(); ctx.moveTo(-ex - 3, ey); ctx.quadraticCurveTo(-ex, ey + 2, -ex + 3, ey); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(ex - 3, ey); ctx.quadraticCurveTo(ex, ey + 2, ex + 3, ey); ctx.stroke();
  } else {
    const eo = 1 + raise * 0.5;
    ctx.fillStyle = "#fff";
    ctx.beginPath(); ctx.ellipse(-ex, ey, 3.4 * eo, 4.4, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(ex, ey, 3.4 * eo, 4.4, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = iris;
    ctx.beginPath(); ctx.arc(-ex, ey + 0.6, 2.4, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(ex, ey + 0.6, 2.4, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#0b1e3f";
    ctx.beginPath(); ctx.arc(-ex, ey + 0.6, 1.1, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(ex, ey + 0.6, 1.1, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.beginPath(); ctx.arc(-ex + 0.8, ey - 0.4, 1, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(ex + 0.8, ey - 0.4, 1, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = "#1a1208"; ctx.lineWidth = 1.8; ctx.lineCap = "round";
    ctx.beginPath(); ctx.moveTo(-ex - 3.4, ey - 3); ctx.lineTo(-ex + 2, ey - 4.2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(ex - 2, ey - 4.2); ctx.lineTo(ex + 3.4, ey - 3); ctx.stroke();
  }
  // brows
  ctx.strokeStyle = "#3a2410"; ctx.lineWidth = 1.8; ctx.lineCap = "round";
  const bw = L(-0.3, -2.6, raise);
  ctx.beginPath(); ctx.moveTo(-ex - 3, ey - 4.5); ctx.lineTo(-ex + 2, ey - 4.5 + bw); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(ex - 2, ey - 4.5 + bw); ctx.lineTo(ex + 3, ey - 4.5); ctx.stroke();
  // mouth
  if (raise > 0.5) {
    ctx.fillStyle = "#7f1d1d"; ctx.beginPath(); ctx.ellipse(0, 7, 2.8, 3.4, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.ellipse(0, 8.6, 2, 1, 0, 0, Math.PI * 2); ctx.fill();
  } else {
    ctx.strokeStyle = "#7f1d1d"; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(-2.5, 6.5); ctx.quadraticCurveTo(0, 8.5, 2.5, 6.5); ctx.stroke();
  }
  // blush when calm
  if (raise < 0.3) {
    ctx.fillStyle = "rgba(255,150,150,0.4)";
    ctx.beginPath(); ctx.arc(-7, 4, 1.8, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(7, 4, 1.8, 0, Math.PI * 2); ctx.fill();
  }
  // sweat when worried
  if (raise > 0.4) {
    ctx.fillStyle = "#7dd3fc";
    const sy = -3 + Math.abs(Math.sin(t * 0.008)) * 4;
    ctx.beginPath(); ctx.moveTo(10, sy);
    ctx.quadraticCurveTo(12.5, sy + 4, 10, sy + 5.5);
    ctx.quadraticCurveTo(7.5, sy + 4, 10, sy); ctx.fill();
  }
  // crown
  ctx.fillStyle = gold;
  ctx.beginPath();
  ctx.moveTo(-headR, -headR + 4); ctx.lineTo(-headR + 3, -headR - 5); ctx.lineTo(-headR + 7, -headR + 1);
  ctx.lineTo(0, -headR - 7); ctx.lineTo(headR - 7, -headR + 1); ctx.lineTo(headR - 3, -headR - 5);
  ctx.lineTo(headR, -headR + 4); ctx.lineTo(headR, -headR + 8); ctx.lineTo(-headR, -headR + 8); ctx.closePath(); ctx.fill();
  ctx.fillStyle = goldSh; ctx.fillRect(-headR, -headR + 6, headR * 2, 2);
  ctx.fillStyle = "#ef4444";
  ctx.beginPath(); ctx.arc(0, -headR - 1, 2, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(-headR + 5, -headR + 1, 1.4, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(headR - 5, -headR + 1, 1.4, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

export default function SaveTheKing() {
  const { t } = useI18n();
  const canvasRef = useRef(null);
  const boardWrapRef = useRef(null);

  const [tiles, setTiles] = useState(() => makeBoard());
  const [selected, setSelected] = useState(null);
  const [busy, setBusy] = useState(false);
  const [phase, setPhase] = useState("idle"); // idle | playing | won | lost
  const [progress, setProgress] = useState(0);
  const [score, setScore] = useState(0);
  const [lavaLevel, setLavaLevel] = useState(LAVA_START);
  const [ts, setTs] = useState(34); // tile size, measured to fit container

  const phaseRef = useRef("idle");
  const lavaRef = useRef(LAVA_START);
  const progressRef = useRef(0);
  const scoreRef = useRef(0);
  const rafRef = useRef(null);
  const lastRef = useRef(0);
  const embersRef = useRef([]);
  const mountedRef = useRef(true);
  const dragRef = useRef(null);

  const stopLoop = () => { if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; } };

  // measure board wrapper → fit tile size so the grid never overflows
  useEffect(() => {
    const el = boardWrapRef.current;
    if (!el) return;
    const measure = () => setTs(Math.max(22, Math.floor((el.clientWidth - 16) / COLS)));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // ---- danger scene render loop (always running so the king breathes) ----
  const drawScene = useCallback(() => {
    const cv = canvasRef.current;
    if (!cv || !mountedRef.current) return;
    const ctx = cv.getContext("2d");
    const now = performance.now();
    const dt = lastRef.current ? (now - lastRef.current) / 1000 : 0;
    lastRef.current = now;

    if (phaseRef.current === "playing") {
      lavaRef.current = Math.min(LAVA_MAX + 0.0001, lavaRef.current + LAVA_RISE * dt);
      setLavaLevel(lavaRef.current);
      if (lavaRef.current >= LAVA_MAX) finish("lost");
    }
    const urgency = lavaRef.current / LAVA_MAX;

    const bg = ctx.createLinearGradient(0, 0, 0, CH);
    bg.addColorStop(0, "#2c3e50"); bg.addColorStop(1, "#14110f");
    ctx.fillStyle = bg; ctx.fillRect(0, 0, CW, CH);
    ctx.strokeStyle = "rgba(0,0,0,0.25)"; ctx.lineWidth = 1;
    for (let y = 14; y < CH; y += 22) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(CW, y); ctx.stroke(); }
    for (let y = 14; y < CH; y += 22) {
      const off = (Math.floor(y / 22) % 2) * 22;
      for (let x = off; x < CW; x += 44) { ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + 22); ctx.stroke(); }
    }

    const pourY = 18;
    const lavaTopY = CH - lavaRef.current * CH;
    const drawPipe = (px, dir) => {
      ctx.fillStyle = "#7a3b3b"; ctx.fillRect(px - 12, 0, 24, 26);
      ctx.fillStyle = "#5a2a2a"; ctx.fillRect(px - 12, 22, 24, 6);
      const sg = ctx.createLinearGradient(0, pourY, 0, lavaTopY);
      sg.addColorStop(0, "#ff8c00"); sg.addColorStop(1, "#ff4500");
      ctx.fillStyle = sg;
      ctx.beginPath();
      ctx.moveTo(px - 5, pourY); ctx.lineTo(px + 5, pourY);
      ctx.lineTo(px + 3 + dir * 4, lavaTopY); ctx.lineTo(px - 3 + dir * 4, lavaTopY);
      ctx.closePath(); ctx.fill();
    };
    drawPipe(34, 1); drawPipe(CW - 34, -1);

    const lh = CH - lavaTopY;
    if (lh > 1) {
      const lg = ctx.createLinearGradient(0, lavaTopY, 0, CH);
      lg.addColorStop(0, "#ffd700"); lg.addColorStop(0.25, "#ff8c00"); lg.addColorStop(1, "#cc3300");
      ctx.fillStyle = lg;
      ctx.beginPath(); ctx.moveTo(0, lavaTopY);
      for (let x = 0; x <= CW; x += 8) {
        const w = Math.sin((x + now * 0.004) * 0.08) * 3 + Math.sin((x - now * 0.006) * 0.05) * 2;
        ctx.lineTo(x, lavaTopY + w);
      }
      ctx.lineTo(CW, CH); ctx.lineTo(0, CH); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = "rgba(255,255,200,0.7)"; ctx.lineWidth = 2; ctx.beginPath();
      for (let x = 0; x <= CW; x += 8) {
        const w = Math.sin((x + now * 0.004) * 0.08) * 3 + Math.sin((x - now * 0.006) * 0.05) * 2;
        if (x === 0) ctx.moveTo(x, lavaTopY + w); else ctx.lineTo(x, lavaTopY + w);
      }
      ctx.stroke();
      const gg = ctx.createLinearGradient(0, lavaTopY - 40, 0, lavaTopY);
      gg.addColorStop(0, "rgba(255,140,0,0)"); gg.addColorStop(1, "rgba(255,140,0,0.35)");
      ctx.fillStyle = gg; ctx.fillRect(0, lavaTopY - 40, CW, 40);
    }

    if (phaseRef.current === "playing" && Math.random() < 0.5) {
      embersRef.current.push({ x: Math.random() * CW, y: CH - Math.random() * 20, vy: -rand(20, 45), life: 1, r: rand(1, 2.4) });
    }
    const em = embersRef.current;
    for (let i = em.length - 1; i >= 0; i--) {
      const e = em[i];
      e.y += e.vy * dt; e.life -= dt * 0.8;
      if (e.life <= 0) { em.splice(i, 1); continue; }
      ctx.globalAlpha = Math.max(0, e.life);
      ctx.fillStyle = "#ffcf66";
      ctx.beginPath(); ctx.arc(e.x, e.y, e.r, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;

    // stone platform (ground)
    const platY = CH * 0.62;
    ctx.fillStyle = "rgba(0,0,0,0.4)";
    ctx.beginPath(); ctx.ellipse(CW / 2, platY + 16, 52, 10, 0, 0, Math.PI * 2); ctx.fill();
    const pg = ctx.createLinearGradient(0, platY - 16, 0, platY + 16);
    pg.addColorStop(0, "#9a8b7a"); pg.addColorStop(1, "#5b4d40");
    ctx.fillStyle = pg;
    ctx.beginPath(); ctx.ellipse(CW / 2, platY, 50, 16, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.18)";
    ctx.beginPath(); ctx.ellipse(CW / 2, platY - 4, 38, 6, 0, 0, Math.PI * 2); ctx.fill();

    // king — feet planted on platform top
    const groundY = platY - 14;
    drawKing(ctx, CW / 2, groundY, now, urgency);

    if (mountedRef.current) rafRef.current = requestAnimationFrame(drawScene);
  }, []);

  const finish = useCallback((res) => {
    if (phaseRef.current !== "playing") return;
    phaseRef.current = res; setPhase(res);
    if (res === "won") playWin(); else playGameOver();
  }, []);

  const start = useCallback(() => {
    resumeAudio();
    setTiles(makeBoard()); setSelected(null); setBusy(false);
    progressRef.current = 0; setProgress(0);
    scoreRef.current = 0; setScore(0);
    lavaRef.current = LAVA_START; setLavaLevel(LAVA_START);
    embersRef.current = [];
    phaseRef.current = "playing"; setPhase("playing");
    playStart();
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    lastRef.current = 0;
    rafRef.current = requestAnimationFrame(drawScene);
    return () => { mountedRef.current = false; stopLoop(); };
  }, [drawScene]);

  // ---- match-3 resolution ----
  const resolve = useCallback(async (board) => {
    let m = findMatches(board);
    while (m.size) {
      const removeIds = new Set(m);
      setTiles(board.map((x) => (removeIds.has(x.id) ? { ...x, removing: true } : x)));
      playBubblePop();
      await sleep(150);
      board = applyGravity(board);
      setTiles([...board]);
      await sleep(170);
      lavaRef.current = Math.max(0, lavaRef.current - LAVA_DRAIN);
      setLavaLevel(lavaRef.current);
      scoreRef.current += m.size * 10; setScore(scoreRef.current);
      progressRef.current = Math.min(GOAL, progressRef.current + 1); setProgress(progressRef.current);
      if (progressRef.current >= GOAL) { finish("won"); return; }
      m = findMatches(board);
    }
    setTiles([...board]);
  }, [finish]);

  const attemptSwap = useCallback(async (a, b) => {
    setBusy(true); setSelected(null);
    const board = tiles.map((x) => x.id === a.id ? { ...x, col: b.col, row: b.row } : x.id === b.id ? { ...x, col: a.col, row: a.row } : x);
    setTiles([...board]);
    await sleep(160);
    if (findMatches(board).size) await resolve(board);
    else {
      const reverted = board.map((x) => x.id === a.id ? { ...x, col: a.col, row: a.row } : x.id === b.id ? { ...x, col: b.col, row: b.row } : x);
      setTiles(reverted);
    }
    setBusy(false);
  }, [tiles, resolve]);

  const handleSelect = useCallback((tile) => {
    setSelected((prev) => {
      if (!prev) return tile.id;
      if (prev === tile.id) return null;
      const a = tiles.find((x) => x.id === prev);
      if (!a) return tile.id;
      const adj = Math.abs(a.col - tile.col) + Math.abs(a.row - tile.row) === 1;
      if (!adj) return tile.id;
      attemptSwap(a, tile);
      return null;
    });
  }, [tiles, attemptSwap]);

  // drag a tile in any direction (up/down/left/right) to swap with that neighbor
  const onTileDown = useCallback((tile, e) => {
    if (phaseRef.current !== "playing" || busy) return;
    e.preventDefault();
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch {}
    dragRef.current = { id: tile.id, x: e.clientX, y: e.clientY, moved: false };
  }, [busy]);

  const onTileMove = useCallback((tile, e) => {
    const d = dragRef.current;
    if (!d || d.id !== tile.id) return;
    const dx = e.clientX - d.x, dy = e.clientY - d.y;
    const th = ts * 0.35;
    if (Math.abs(dx) < th && Math.abs(dy) < th) return;
    d.moved = true;
    let nc = tile.col, nr = tile.row;
    if (Math.abs(dx) > Math.abs(dy)) nc += dx > 0 ? 1 : -1;
    else nr += dy > 0 ? 1 : -1;
    const nb = tiles.find((x) => x.col === nc && x.row === nr);
    dragRef.current = null;
    if (nb) attemptSwap(tile, nb);
  }, [ts, tiles, attemptSwap]);

  const onTileUp = useCallback((tile) => {
    const d = dragRef.current;
    dragRef.current = null;
    if (d && d.id === tile.id && !d.moved) handleSelect(tile);
  }, [handleSelect]);

  const playing = phase === "playing";
  const pct = Math.round((progress / GOAL) * 100);
  const lavaPct = Math.round((lavaLevel / LAVA_MAX) * 100);
  const bw = ts * COLS, bh = ts * ROWS;

  return (
    <div className="select-none">
      {/* HUD */}
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex-1">
          <div className="flex items-center justify-between text-[11px] font-bold mb-1">
            <span className="text-primary">{t("Rescue")} {progress}/{GOAL}</span>
            <span className="text-muted-foreground">{pct}%</span>
          </div>
          <div className="h-2.5 rounded-full bg-secondary overflow-hidden">
            <div className="h-full bg-primary transition-all duration-500" style={{ width: `${pct}%` }} />
          </div>
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between text-[11px] font-bold mb-1">
            <span className="text-orange-500 flex items-center gap-1"><AlertTriangle className="w-3 h-3" />{t("Lava")}</span>
            <span className="text-muted-foreground">{lavaPct}%</span>
          </div>
          <div className="h-2.5 rounded-full bg-secondary overflow-hidden">
            <div className="h-full bg-gradient-to-r from-yellow-400 to-red-600 transition-all duration-300" style={{ width: `${Math.min(100, lavaPct)}%` }} />
          </div>
        </div>
        <div className="text-center shrink-0">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{t("Score")}</div>
          <div className="text-lg font-extrabold tabular-nums text-accent">{score}</div>
        </div>
      </div>

      {/* Unified game unit: danger scene on top, control board directly under it (one frame) */}
      <div className="mx-auto" style={{ width: "min(92vw, 320px)" }}>
        <div className="rounded-3xl overflow-hidden border-2 border-stone-700/60 shadow-[0_18px_40px_-18px_rgba(255,80,0,0.55)] bg-stone-900">
          {/* screen */}
          <div className="relative">
            <canvas ref={canvasRef} width={CW} height={CH}
              className="block w-full touch-none"
              style={{ aspectRatio: `${CW}/${CH}` }} />
            {!playing && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/55 backdrop-blur-sm text-center p-5 animate-[fadeIn_0.3s_ease-out]">
                {phase === "won" ? (
                  <>
                    <Trophy className="w-10 h-10 text-accent" />
                    <div className="text-xl font-extrabold text-white">{t("King Saved!")}</div>
                    <div className="text-sm text-white/80">{t("Score")}: <span className="font-bold text-accent">{score}</span></div>
                    <Button onClick={start} className="bg-primary text-primary-foreground rounded-2xl px-6 py-5"><RotateCcw className="w-4 h-4 mr-2" />{t("Play again")}</Button>
                  </>
                ) : phase === "lost" ? (
                  <>
                    <AlertTriangle className="w-10 h-10 text-red-400" />
                    <div className="text-xl font-extrabold text-white">{t("The King Fell!")}</div>
                    <div className="text-sm text-white/80">{t("The lava reached the king.")}</div>
                    <Button onClick={start} className="bg-primary text-primary-foreground rounded-2xl px-6 py-5"><RotateCcw className="w-4 h-4 mr-2" />{t("Try again")}</Button>
                  </>
                ) : (
                  <>
                    <Crown className="w-9 h-9 text-accent" />
                    <div className="text-lg font-extrabold text-white">{t("Save the King")}</div>
                    <p className="text-xs text-white/80 max-w-[230px]">{t("Match 3+ blocks to drain the lava and save the anime king before it reaches him!")}</p>
                    <Button onClick={start} className="bg-primary text-primary-foreground rounded-2xl px-8 py-5 text-base font-bold">
                      <Play className="w-4 h-4 mr-2" />{t("Start")}
                    </Button>
                  </>
                )}
              </div>
            )}
          </div>

          {/* control board — the buttons, fused under the screen as one unit, responsive */}
          <div ref={boardWrapRef} className="bg-gradient-to-b from-stone-800 to-stone-900 border-t-2 border-stone-700/60 px-2 py-2 touch-none select-none" style={{ touchAction: "none" }}>
            <div className="relative mx-auto" style={{ width: bw, height: bh }}>
              <AnimatePresence>
                {tiles.map((tile) => (
                  <motion.div
                    key={tile.id}
                    initial={tile.fresh ? { y: -ts * 2, opacity: 0, scale: 0.6 } : { opacity: 0, scale: 0.6 }}
                    animate={{ x: tile.col * ts, y: tile.row * ts, opacity: tile.removing ? 0 : 1, scale: tile.removing ? 0.2 : (selected === tile.id ? 1.12 : 1) }}
                    exit={{ opacity: 0, scale: 0.2 }}
                    transition={{ type: "spring", stiffness: 520, damping: 32 }}
                    onPointerDown={(e) => onTileDown(tile, e)}
                    onPointerMove={(e) => onTileMove(tile, e)}
                    onPointerUp={() => onTileUp(tile)}
                    className={`absolute flex items-center justify-center rounded-xl cursor-pointer touch-none select-none ${selected === tile.id ? "ring-2 ring-white z-10" : ""}`}
                    style={{ width: ts - 4, height: ts - 4, margin: 2, touchAction: "none", background: `radial-gradient(circle at 35% 30%, ${TILE_META[tile.type].color}, ${TILE_META[tile.type].edge})`, boxShadow: "inset 0 -2px 4px rgba(0,0,0,0.3), 0 2px 4px rgba(0,0,0,0.25)" }}
                  >
                    {(() => { const I = TILE_META[tile.type].Icon; return <I className="w-5 h-5 text-white/90 drop-shadow" strokeWidth={2.2} />; })()}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      <p className="mt-3 text-center text-xs text-muted-foreground">
        {t("Tap two adjacent blocks to swap and match 3 or more.")}
      </p>
    </div>
  );
}