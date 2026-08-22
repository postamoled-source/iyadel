import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Crown, Leaf, Heart, Gem, Play, RotateCcw, Trophy, AlertTriangle } from "lucide-react";
import { playStart, playWin, playGameOver, playBubblePop, resumeAudio } from "@/lib/game-sounds";

// Danger scene canvas size.
const CW = 320, CH = 240;
// Match-3 board.
const COLS = 7, ROWS = 7, TS = 40;
const BW = COLS * TS, BH = ROWS * TS;
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

// ---- capsule (rounded limb) ----
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

// ---- procedural anime king: full articulated body, feet planted on ground ----
function drawKing(ctx, cx, groundY, t, urgency) {
  const panic = urgency;
  const breath = 1 + Math.sin(t * 0.003) * 0.04;
  const sway = Math.sin(t * 0.002) * (1 + panic * 2.5);
  const tremble = panic > 0.55 ? (Math.random() - 0.5) * panic * 2.4 : 0;
  const x = cx + sway + tremble;
  const hipY = groundY - 26;
  const shoulderY = hipY - 28;
  const headY = shoulderY - 12;

  const skin = "#f6c89a", skinSh = "#e0a877";
  const tunic = "#3b82f6", tunicSh = "#1e40af";
  const cape = "#dc2626", capeSh = "#7f1d1d";
  const boot = "#3b2a1a";
  const hair = "#2b1810";
  const gold = "#fbbf24", goldSh = "#b45309";

  // cape (behind body)
  ctx.fillStyle = cape;
  ctx.beginPath();
  ctx.moveTo(x - 10, shoulderY + 2);
  ctx.quadraticCurveTo(x - 22 + sway * 0.4, hipY + 8, x - 16, groundY - 4);
  ctx.lineTo(x + 16, groundY - 4);
  ctx.quadraticCurveTo(x + 22 - sway * 0.4, hipY + 8, x + 10, shoulderY + 2);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = capeSh;
  ctx.beginPath();
  ctx.moveTo(x - 9, shoulderY + 3);
  ctx.quadraticCurveTo(x - 17, hipY + 12, x - 13, groundY - 4);
  ctx.lineTo(x - 6, groundY - 4);
  ctx.quadraticCurveTo(x - 10, hipY + 8, x - 5, shoulderY + 3);
  ctx.fill();

  // legs (feet planted)
  const spread = L(3, 6, panic);
  const lb = panic > 0.6 ? tremble * 0.4 : 0;
  ctx.fillStyle = boot;
  capsule(ctx, x - spread, hipY, x - spread - 1 + lb, groundY - 5, 5);
  capsule(ctx, x - spread - 1 + lb, groundY - 5, x - spread + 3 + lb, groundY, 6);
  capsule(ctx, x + spread, hipY, x + spread + 1 - lb, groundY - 5, 5);
  capsule(ctx, x + spread + 1 - lb, groundY - 5, x + spread + 5 - lb, groundY, 6);
  // thigh pants
  ctx.fillStyle = "#1e3a8a";
  capsule(ctx, x - spread, hipY - 2, x - spread - 1, hipY + 12, 7);
  capsule(ctx, x + spread, hipY - 2, x + spread + 1, hipY + 12, 7);

  // torso (breathing)
  ctx.save();
  ctx.translate(x, shoulderY + 14);
  ctx.scale(breath, 1);
  const tg = ctx.createLinearGradient(0, -14, 0, 16);
  tg.addColorStop(0, tunic); tg.addColorStop(1, tunicSh);
  ctx.fillStyle = tg;
  ctx.beginPath();
  ctx.moveTo(-11, -14);
  ctx.quadraticCurveTo(-13, 0, -10, 16);
  ctx.lineTo(10, 16);
  ctx.quadraticCurveTo(13, 0, 11, -14);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = gold;
  ctx.fillRect(-11, -14, 22, 3);
  ctx.fillRect(-10, 12, 20, 4);
  ctx.fillStyle = "#ef4444";
  ctx.beginPath(); ctx.arc(0, 13, 2.5, 0, Math.PI * 2); ctx.fill();
  ctx.restore();

  // right arm
  const rSh = { x: x + 10, y: shoulderY - 2 };
  const rElb = { x: L(x + 12, x + 15, panic) + tremble * 0.3, y: L(shoulderY + 13, shoulderY - 4, panic) };
  const rHand = { x: L(x + 10, x + 19, panic) + tremble * 0.4, y: L(shoulderY + 26, shoulderY - 18, panic) };
  ctx.fillStyle = tunicSh; capsule(ctx, rSh.x, rSh.y, rElb.x, rElb.y, 5);
  ctx.fillStyle = tunicSh; capsule(ctx, rElb.x, rElb.y, rHand.x, rHand.y, 4.5);
  ctx.fillStyle = skin; ctx.beginPath(); ctx.arc(rHand.x, rHand.y, 3.6, 0, Math.PI * 2); ctx.fill();
  // left arm
  const lSh = { x: x - 10, y: shoulderY - 2 };
  const lElb = { x: L(x - 12, x - 15, panic) - tremble * 0.3, y: L(shoulderY + 13, shoulderY - 4, panic) };
  const lHand = { x: L(x - 10, x - 19, panic) - tremble * 0.4, y: L(shoulderY + 26, shoulderY - 18, panic) };
  ctx.fillStyle = tunicSh; capsule(ctx, lSh.x, lSh.y, lElb.x, lElb.y, 5);
  ctx.fillStyle = tunicSh; capsule(ctx, lElb.x, lElb.y, lHand.x, lHand.y, 4.5);
  ctx.fillStyle = skin; ctx.beginPath(); ctx.arc(lHand.x, lHand.y, 3.6, 0, Math.PI * 2); ctx.fill();

  // head
  ctx.save();
  ctx.translate(x, headY);
  ctx.rotate(sway * 0.01 + tremble * 0.006);
  ctx.fillStyle = skinSh; ctx.fillRect(-3, 8, 6, 6); // neck
  ctx.fillStyle = hair; ctx.beginPath(); ctx.ellipse(0, -2, 13, 14, 0, 0, Math.PI * 2); ctx.fill(); // hair back
  ctx.fillStyle = skin; ctx.beginPath(); ctx.ellipse(0, 2, 10.5, 12, 0, 0, Math.PI * 2); ctx.fill(); // face
  // hair spikes
  ctx.fillStyle = hair;
  ctx.beginPath();
  ctx.moveTo(-12, -4);
  ctx.lineTo(-14, -14); ctx.lineTo(-8, -8);
  ctx.lineTo(-6, -16); ctx.lineTo(-2, -9);
  ctx.lineTo(2, -16); ctx.lineTo(6, -9);
  ctx.lineTo(8, -15); ctx.lineTo(12, -7);
  ctx.lineTo(12, -2);
  ctx.quadraticCurveTo(0, -6, -12, -4);
  ctx.closePath(); ctx.fill();
  // eyes
  const eo = L(1, 1.4, panic);
  ctx.fillStyle = "#1e293b";
  ctx.beginPath(); ctx.ellipse(-4, 2, 1.8 * eo, 3.2, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(4, 2, 1.8 * eo, 3.2, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.beginPath(); ctx.arc(-3.4, 1, 0.7, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(4.6, 1, 0.7, 0, Math.PI * 2); ctx.fill();
  // brows (worry with panic)
  ctx.strokeStyle = "#3a2410"; ctx.lineWidth = 1.6; ctx.lineCap = "round";
  const browA = L(-0.4, -2.4, panic);
  ctx.beginPath(); ctx.moveTo(-7, -2); ctx.lineTo(-1.5, -2 + browA); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(7, -2); ctx.lineTo(1.5, -2 + browA); ctx.stroke();
  // mouth
  if (panic > 0.6) { ctx.fillStyle = "#7f1d1d"; ctx.beginPath(); ctx.ellipse(0, 8, 2.5, 3, 0, 0, Math.PI * 2); ctx.fill(); }
  else { ctx.strokeStyle = "#7f1d1d"; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(-2, 7); ctx.quadraticCurveTo(0, 9, 2, 7); ctx.stroke(); }
  // sweat drop when panic
  if (panic > 0.5) {
    ctx.fillStyle = "#7dd3fc";
    const sy = -2 + Math.abs(Math.sin(t * 0.01)) * 3;
    ctx.beginPath(); ctx.moveTo(10, sy);
    ctx.quadraticCurveTo(12, sy + 4, 10, sy + 5);
    ctx.quadraticCurveTo(8, sy + 4, 10, sy); ctx.fill();
  }
  // crown
  ctx.fillStyle = gold;
  ctx.beginPath();
  ctx.moveTo(-11, -10); ctx.lineTo(-8, -18); ctx.lineTo(-4, -12);
  ctx.lineTo(0, -20); ctx.lineTo(4, -12); ctx.lineTo(8, -18); ctx.lineTo(11, -10);
  ctx.lineTo(11, -7); ctx.lineTo(-11, -7); ctx.closePath(); ctx.fill();
  ctx.fillStyle = goldSh; ctx.fillRect(-11, -9, 22, 2);
  ctx.fillStyle = "#ef4444";
  ctx.beginPath(); ctx.arc(0, -13, 1.8, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(-7, -13, 1.2, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(7, -13, 1.2, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

export default function SaveTheKing() {
  const { t } = useI18n();
  const canvasRef = useRef(null);

  const [tiles, setTiles] = useState(() => makeBoard());
  const [selected, setSelected] = useState(null);
  const [busy, setBusy] = useState(false);
  const [phase, setPhase] = useState("idle"); // idle | playing | won | lost
  const [progress, setProgress] = useState(0);
  const [score, setScore] = useState(0);
  const [lavaLevel, setLavaLevel] = useState(LAVA_START);

  const phaseRef = useRef("idle");
  const lavaRef = useRef(LAVA_START);
  const progressRef = useRef(0);
  const scoreRef = useRef(0);
  const rafRef = useRef(null);
  const lastRef = useRef(0);
  const embersRef = useRef([]);
  const mountedRef = useRef(true);

  const stopLoop = () => { if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; } };

  // ---- danger scene render loop (always running so the king breathes) ----
  const drawScene = useCallback(() => {
    const cv = canvasRef.current;
    if (!cv || !mountedRef.current) return;
    const ctx = cv.getContext("2d");
    const now = performance.now();
    const dt = lastRef.current ? (now - lastRef.current) / 1000 : 0;
    lastRef.current = now;

    // advance lava only while playing
    if (phaseRef.current === "playing") {
      lavaRef.current = Math.min(LAVA_MAX + 0.0001, lavaRef.current + LAVA_RISE * dt);
      setLavaLevel(lavaRef.current);
      if (lavaRef.current >= LAVA_MAX) finish("lost");
    }
    const urgency = lavaRef.current / LAVA_MAX;

    // stone pit background
    const bg = ctx.createLinearGradient(0, 0, 0, CH);
    bg.addColorStop(0, "#2c3e50"); bg.addColorStop(1, "#14110f");
    ctx.fillStyle = bg; ctx.fillRect(0, 0, CW, CH);
    ctx.strokeStyle = "rgba(0,0,0,0.25)"; ctx.lineWidth = 1;
    for (let y = 14; y < CH; y += 22) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(CW, y); ctx.stroke(); }
    for (let y = 14; y < CH; y += 22) {
      const off = (Math.floor(y / 22) % 2) * 22;
      for (let x = off; x < CW; x += 44) { ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + 22); ctx.stroke(); }
    }

    // pipes pouring lava
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

    // lava pool
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

    // embers
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
    ctx.beginPath(); ctx.ellipse(CW / 2, platY + 16, 50, 10, 0, 0, Math.PI * 2); ctx.fill();
    const pg = ctx.createLinearGradient(0, platY - 14, 0, platY + 14);
    pg.addColorStop(0, "#9a8b7a"); pg.addColorStop(1, "#5b4d40");
    ctx.fillStyle = pg;
    ctx.beginPath(); ctx.ellipse(CW / 2, platY, 48, 15, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.18)";
    ctx.beginPath(); ctx.ellipse(CW / 2, platY - 4, 36, 6, 0, 0, Math.PI * 2); ctx.fill();

    // king — feet planted on platform top
    const groundY = platY - 6;
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

  const onTile = useCallback(async (tile) => {
    if (phaseRef.current !== "playing" || busy) return;
    if (!selected) { setSelected(tile.id); return; }
    if (selected === tile.id) { setSelected(null); return; }
    const a = tiles.find((x) => x.id === selected);
    const b = tile;
    if (!a) { setSelected(tile.id); return; }
    const adj = Math.abs(a.col - b.col) + Math.abs(a.row - b.row) === 1;
    if (!adj) { setSelected(b.id); return; }
    setBusy(true); setSelected(null);
    const board = tiles.map((x) => x.id === a.id ? { ...x, col: b.col, row: b.row } : x.id === b.id ? { ...x, col: a.col, row: a.row } : x);
    setTiles([...board]);
    await sleep(160);
    if (findMatches(board).size) {
      await resolve(board);
    } else {
      const reverted = board.map((x) => x.id === a.id ? { ...x, col: a.col, row: a.row } : x.id === b.id ? { ...x, col: b.col, row: b.row } : x);
      setTiles(reverted);
    }
    setBusy(false);
  }, [selected, busy, tiles, resolve]);

  const playing = phase === "playing";
  const pct = Math.round((progress / GOAL) * 100);
  const lavaPct = Math.round((lavaLevel / LAVA_MAX) * 100);

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
      <div className="mx-auto" style={{ width: "min(86vw, 320px)" }}>
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

          {/* control board — the buttons, fused under the screen as one unit */}
          <div className="bg-gradient-to-b from-stone-800 to-stone-900 border-t-2 border-stone-700/60 px-2 py-2">
            <div className="relative mx-auto" style={{ width: BW, height: BH }}>
              <AnimatePresence>
                {tiles.map((tile) => (
                  <motion.div
                    key={tile.id}
                    initial={tile.fresh ? { y: -TS * 2, opacity: 0, scale: 0.6 } : { opacity: 0, scale: 0.6 }}
                    animate={{ x: tile.col * TS, y: tile.row * TS, opacity: tile.removing ? 0 : 1, scale: tile.removing ? 0.2 : (selected === tile.id ? 1.12 : 1) }}
                    exit={{ opacity: 0, scale: 0.2 }}
                    transition={{ type: "spring", stiffness: 520, damping: 32 }}
                    onClick={() => onTile(tile)}
                    className={`absolute flex items-center justify-center rounded-xl cursor-pointer ${selected === tile.id ? "ring-2 ring-white z-10" : ""}`}
                    style={{ width: TS - 4, height: TS - 4, margin: 2, background: `radial-gradient(circle at 35% 30%, ${TILE_META[tile.type].color}, ${TILE_META[tile.type].edge})`, boxShadow: "inset 0 -2px 4px rgba(0,0,0,0.3), 0 2px 4px rgba(0,0,0,0.25)" }}
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