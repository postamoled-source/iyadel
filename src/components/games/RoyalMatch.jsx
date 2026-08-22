import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Crown, Gem, Shield, Swords, Coins, Scroll, Play, RotateCcw, Trophy, AlertTriangle, Waves } from "lucide-react";
import { playStart, playWin, playGameOver, playBubblePop, resumeAudio } from "@/lib/game-sounds";

// Danger scene canvas size.
const CW = 320, CH = 300;
// Match-3 board.
const COLS = 6, ROWS = 6;
const TILE_TYPES = 6;

// Chest base + how high the flood must reach to drown it.
const CHEST_BASE_Y = 0.80; // chest Y (fraction of CH)

// Per-level tuning — gentle start, rising suspense, never ends too early.
const LVL = {
  1: { goal: 8, waterStart: 0.10, waterRise: 0.018, waterDrain: 0.11 },
  2: { goal: 12, waterStart: 0.12, waterRise: 0.022, waterDrain: 0.095 },
  3: { goal: 16, waterStart: 0.14, waterRise: 0.026, waterDrain: 0.085 },
};

const TILE_META = [
  { Icon: Crown, color: "#fde68a", edge: "#b45309" },
  { Icon: Gem, color: "#67e8f9", edge: "#0e7490" },
  { Icon: Shield, color: "#86efac", edge: "#15803d" },
  { Icon: Swords, color: "#fca5a5", edge: "#991b1b" },
  { Icon: Coins, color: "#fcd34d", edge: "#a16207" },
  { Icon: Scroll, color: "#d8b4fe", edge: "#6b21a8" },
];

let _id = 0;
const uid = () => ++_id;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const rand = (a, b) => a + Math.random() * (b - a);

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
  while (m.size && guard++ < 40) {
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

// procedural treasure chest — reacts to flood urgency (shakes, glows)
function drawChest(ctx, cx, baseY, t, urgency) {
  const tremble = urgency > 0.55 ? (Math.random() - 0.5) * urgency * 2.2 : 0;
  const x = cx + tremble;
  const lidOpen = 0.18 + urgency * 0.22; // lid lifts more as danger rises
  const glow = 0.35 + urgency * 0.5;
  const W = 76, H = 46;
  const top = baseY - H;

  // contact shadow
  ctx.fillStyle = "rgba(0,0,0,0.4)";
  ctx.beginPath(); ctx.ellipse(cx, baseY + 2, 46, 7, 0, 0, Math.PI * 2); ctx.fill();

  // gold glow spilling from inside
  ctx.save();
  ctx.globalAlpha = glow;
  const gg = ctx.createRadialGradient(cx, top + 8, 4, cx, top + 8, 40);
  gg.addColorStop(0, "#fff3c4"); gg.addColorStop(1, "rgba(255,210,80,0)");
  ctx.fillStyle = gg;
  ctx.beginPath(); ctx.ellipse(cx, top + 6, 34, 18, 0, 0, Math.PI * 2); ctx.fill();
  ctx.restore();

  // chest body (wood)
  const bg = ctx.createLinearGradient(0, top, 0, baseY);
  bg.addColorStop(0, "#8b5a2b"); bg.addColorStop(1, "#5c3317");
  ctx.fillStyle = bg;
  ctx.beginPath();
  ctx.moveTo(x - W / 2, top); ctx.lineTo(x + W / 2, top);
  ctx.lineTo(x + W / 2, baseY); ctx.lineTo(x - W / 2, baseY); ctx.closePath(); ctx.fill();

  // vertical plank seams
  ctx.strokeStyle = "rgba(0,0,0,0.25)"; ctx.lineWidth = 1.5;
  for (let i = 1; i < 3; i++) {
    const px = x - W / 2 + (W * i) / 3;
    ctx.beginPath(); ctx.moveTo(px, top + 4); ctx.lineTo(px, baseY - 2); ctx.stroke();
  }

  // gold trim bands
  ctx.fillStyle = "#fcd34d";
  ctx.fillRect(x - W / 2, top + 6, W, 4);
  ctx.fillRect(x - W / 2, baseY - 6, W, 4);
  ctx.fillStyle = "#b45309";
  ctx.fillRect(x - W / 2, top + 10, W, 1.5);
  ctx.fillRect(x - W / 2, baseY - 2, W, 1.5);

  // lid (arched) — pivots open with urgency
  ctx.save();
  ctx.translate(x, top);
  ctx.rotate(-lidOpen);
  const lg = ctx.createLinearGradient(0, -20, 0, 4);
  lg.addColorStop(0, "#a06a35"); lg.addColorStop(1, "#6b3f1d");
  ctx.fillStyle = lg;
  ctx.beginPath();
  ctx.moveTo(-W / 2, 0);
  ctx.quadraticCurveTo(0, -24, W / 2, 0);
  ctx.lineTo(W / 2, 4); ctx.lineTo(-W / 2, 4); ctx.closePath(); ctx.fill();
  ctx.fillStyle = "#fcd34d";
  ctx.beginPath();
  ctx.moveTo(-W / 2, 0);
  ctx.quadraticCurveTo(0, -20, W / 2, 0);
  ctx.quadraticCurveTo(0, -16, -W / 2, 0); ctx.closePath(); ctx.fill();
  ctx.fillStyle = "#b45309";
  ctx.beginPath();
  ctx.moveTo(-W / 2, 0);
  ctx.quadraticCurveTo(0, -22, W / 2, 0);
  ctx.quadraticCurveTo(0, -18, -W / 2, 0); ctx.closePath(); ctx.fill();
  ctx.restore();

  // lock
  ctx.fillStyle = "#fcd34d";
  ctx.fillRect(x - 7, top + 2, 14, 12);
  ctx.fillStyle = "#b45309";
  ctx.fillRect(x - 1.5, top + 6, 3, 5);
  // sparkles
  if (urgency > 0.3) {
    ctx.fillStyle = "#fff7d6";
    const sp = (t * 0.004) % (Math.PI * 2);
    for (let i = 0; i < 3; i++) {
      const a = sp + (i * Math.PI * 2) / 3;
      const sx = x + Math.cos(a) * 26, sy = top + 2 + Math.sin(a) * 10;
      ctx.globalAlpha = 0.6 + Math.sin(t * 0.01 + i) * 0.3;
      ctx.beginPath(); ctx.arc(sx, sy, 1.6, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;
  }
}

export default function RoyalMatch() {
  const { t } = useI18n();
  const canvasRef = useRef(null);

  const [tiles, setTiles] = useState(() => makeBoard());
  const [selected, setSelected] = useState(null);
  const [busy, setBusy] = useState(false);
  const [phase, setPhase] = useState("idle"); // idle | playing | levelComplete | won | lost
  const [level, setLevel] = useState(1);
  const [progress, setProgress] = useState(0);
  const [score, setScore] = useState(0);
  const [waterLevel, setWaterLevel] = useState(LVL[1].waterStart);
  const [ts, setTs] = useState(50);

  const phaseRef = useRef("idle");
  const levelRef = useRef(1);
  const waterRef = useRef(LVL[1].waterStart);
  const progressRef = useRef(0);
  const scoreRef = useRef(0);
  const rafRef = useRef(null);
  const lastRef = useRef(0);
  const bubblesRef = useRef([]);
  const mountedRef = useRef(true);
  const dragRef = useRef(null);
  const waterPctRef = useRef(-1);

  const stopLoop = () => { if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; } };

  useEffect(() => {
    const measure = () => {
      const avail = Math.min(window.innerWidth - 64, 288);
      setTs(Math.max(26, Math.floor(avail / COLS)));
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const drawScene = useCallback(() => {
    const cv = canvasRef.current;
    if (!cv || !mountedRef.current) return;
    const ctx = cv.getContext("2d");
    const now = performance.now();
    const dt = lastRef.current ? Math.min(0.05, (now - lastRef.current) / 1000) : 0;
    lastRef.current = now;

    const cfg = LVL[levelRef.current] || LVL[1];
    if (phaseRef.current === "playing") {
      waterRef.current = Math.min(1, waterRef.current + cfg.waterRise * dt);
      const wp = Math.round(waterRef.current * 100);
      if (wp !== waterPctRef.current) { waterPctRef.current = wp; setWaterLevel(waterRef.current); }
    }

    const chestBaseY = CH * CHEST_BASE_Y;
    const waterTopY = CH - waterRef.current * CH;
    const drownWater = (CH - (chestBaseY - 6)) / CH; // water fraction needed to reach the chest
    const urgency = Math.min(1, waterRef.current / Math.max(0.01, drownWater));

    if (phaseRef.current === "playing" && waterTopY <= chestBaseY - 6) finish("lost");

    // background (dungeon wall)
    const bg = ctx.createLinearGradient(0, 0, 0, CH);
    bg.addColorStop(0, "#1e293b"); bg.addColorStop(1, "#0f172a");
    ctx.fillStyle = bg; ctx.fillRect(0, 0, CW, CH);
    // brick texture
    ctx.strokeStyle = "rgba(0,0,0,0.3)"; ctx.lineWidth = 1;
    for (let y = 12; y < CH; y += 20) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(CW, y); ctx.stroke();
      const off = (Math.floor(y / 20) % 2) * 20;
      for (let x = off; x < CW; x += 40) { ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + 20); ctx.stroke(); }
    }
    // torch glow on walls
    ctx.fillStyle = "rgba(255,160,40,0.10)";
    ctx.beginPath(); ctx.ellipse(40, 60, 50, 70, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(CW - 40, 60, 50, 70, 0, 0, Math.PI * 2); ctx.fill();

    // stone platform under the chest
    ctx.fillStyle = "rgba(0,0,0,0.4)";
    ctx.beginPath(); ctx.ellipse(CW / 2, chestBaseY + 14, 54, 9, 0, 0, Math.PI * 2); ctx.fill();
    const pg = ctx.createLinearGradient(0, chestBaseY - 10, 0, chestBaseY + 14);
    pg.addColorStop(0, "#94a3b8"); pg.addColorStop(1, "#475569");
    ctx.fillStyle = pg;
    ctx.beginPath(); ctx.ellipse(CW / 2, chestBaseY + 6, 52, 13, 0, 0, Math.PI * 2); ctx.fill();

    // flood water (rising from bottom)
    const wh = CH - waterTopY;
    if (wh > 1) {
      const wg = ctx.createLinearGradient(0, waterTopY, 0, CH);
      wg.addColorStop(0, "#38bdf8"); wg.addColorStop(0.5, "#0ea5e9"); wg.addColorStop(1, "#075985");
      ctx.fillStyle = wg;
      ctx.beginPath(); ctx.moveTo(0, waterTopY);
      for (let x = 0; x <= CW; x += 8) {
        const w = Math.sin((x + now * 0.004) * 0.09) * 3 + Math.sin((x - now * 0.006) * 0.05) * 2;
        ctx.lineTo(x, waterTopY + w);
      }
      ctx.lineTo(CW, CH); ctx.lineTo(0, CH); ctx.closePath(); ctx.fill();
      // surface highlight
      ctx.strokeStyle = "rgba(186,230,253,0.7)"; ctx.lineWidth = 2; ctx.beginPath();
      for (let x = 0; x <= CW; x += 8) {
        const w = Math.sin((x + now * 0.004) * 0.09) * 3 + Math.sin((x - now * 0.006) * 0.05) * 2;
        if (x === 0) ctx.moveTo(x, waterTopY + w); else ctx.lineTo(x, waterTopY + w);
      }
      ctx.stroke();
      // depth glow
      const dg = ctx.createLinearGradient(0, waterTopY - 36, 0, waterTopY);
      dg.addColorStop(0, "rgba(56,189,248,0)"); dg.addColorStop(1, "rgba(56,189,248,0.3)");
      ctx.fillStyle = dg; ctx.fillRect(0, waterTopY - 36, CW, 36);
    }

    // rising bubbles
    if (phaseRef.current === "playing" && waterRef.current > 0.05 && Math.random() < 0.4) {
      bubblesRef.current.push({ x: Math.random() * CW, y: CH - Math.random() * 20, vy: -rand(15, 38), life: 1, r: rand(1.4, 3) });
    }
    const bb = bubblesRef.current;
    for (let i = bb.length - 1; i >= 0; i--) {
      const e = bb[i];
      e.y += e.vy * dt; e.life -= dt * 0.7;
      if (e.life <= 0 || e.y < waterTopY) { bb.splice(i, 1); continue; }
      ctx.globalAlpha = Math.max(0, e.life) * 0.7;
      ctx.fillStyle = "#bae6fd";
      ctx.beginPath(); ctx.arc(e.x, e.y, e.r, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;

    // the royal treasure chest
    drawChest(ctx, CW / 2, chestBaseY, now, urgency);

    if (mountedRef.current) rafRef.current = requestAnimationFrame(drawScene);
  }, []);

  const finish = useCallback((res) => {
    if (phaseRef.current !== "playing") return;
    if (res === "won") {
      if (levelRef.current < 3) { phaseRef.current = "levelComplete"; setPhase("levelComplete"); playWin(); return; }
      phaseRef.current = "won"; setPhase("won"); playWin(); return;
    }
    phaseRef.current = "lost"; setPhase("lost"); playGameOver();
  }, []);

  const start = useCallback((lvl = 1) => {
    resumeAudio();
    const cfg = LVL[lvl];
    setTiles(makeBoard()); setSelected(null); setBusy(false);
    levelRef.current = lvl; setLevel(lvl);
    progressRef.current = 0; setProgress(0);
    scoreRef.current = 0; setScore(0);
    waterRef.current = cfg.waterStart; setWaterLevel(cfg.waterStart); waterPctRef.current = Math.round(cfg.waterStart * 100);
    bubblesRef.current = [];
    phaseRef.current = "playing"; setPhase("playing");
    playStart();
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    lastRef.current = 0;
    rafRef.current = requestAnimationFrame(drawScene);
    return () => { mountedRef.current = false; stopLoop(); };
  }, [drawScene]);

  const resolve = useCallback(async (board) => {
    const cfg = LVL[levelRef.current] || LVL[1];
    let m = findMatches(board);
    while (m.size) {
      const removeIds = new Set(m);
      setTiles(board.map((x) => (removeIds.has(x.id) ? { ...x, removing: true } : x)));
      playBubblePop();
      await sleep(150);
      board = applyGravity(board);
      setTiles([...board]);
      await sleep(170);
      // each successful match drains the flood back
      waterRef.current = Math.max(0, waterRef.current - cfg.waterDrain);
      waterPctRef.current = Math.round(waterRef.current * 100);
      setWaterLevel(waterRef.current);
      scoreRef.current += m.size * 10; setScore(scoreRef.current);
      progressRef.current = Math.min(cfg.goal, progressRef.current + 1); setProgress(progressRef.current);
      if (progressRef.current >= cfg.goal) { finish("won"); return; }
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

  const cfg = LVL[level] || LVL[1];
  const playing = phase === "playing";
  const pct = Math.round((progress / cfg.goal) * 100);
  const drownWater = (CH - (CH * CHEST_BASE_Y - 6)) / CH;
  const waterPct = Math.min(100, Math.round((waterLevel / Math.max(0.01, drownWater)) * 100));
  const bw = ts * COLS, bh = ts * ROWS;

  return (
    <div className="select-none">
      {/* HUD */}
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex-1">
          <div className="flex items-center justify-between text-[11px] font-bold mb-1">
            <span className="text-primary flex items-center gap-1">
              <Trophy className="w-3 h-3" />{t("Treasure")} {progress}/{cfg.goal}
            </span>
            <span className="text-muted-foreground">{pct}%</span>
          </div>
          <div className="h-2.5 rounded-full bg-secondary overflow-hidden">
            <div className="h-full bg-gradient-to-r from-amber-400 to-yellow-500 transition-all duration-500" style={{ width: `${pct}%` }} />
          </div>
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between text-[11px] font-bold mb-1">
            <span className="text-sky-500 flex items-center gap-1"><Waves className="w-3 h-3" />{t("Flood")}</span>
            <span className="text-muted-foreground">{waterPct}%</span>
          </div>
          <div className="h-2.5 rounded-full bg-secondary overflow-hidden">
            <div className="h-full bg-gradient-to-r from-sky-400 to-blue-700 transition-all duration-300" style={{ width: `${waterPct}%` }} />
          </div>
        </div>
        <div className="text-center shrink-0">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{t("Level")} {level}</div>
          <div className="text-lg font-extrabold tabular-nums text-accent">{score}</div>
        </div>
      </div>

      {/* Unified game unit: flood scene on top, control board under it (one frame) */}
      <div className="mx-auto" style={{ width: bw }}>
        <div className="rounded-3xl overflow-hidden ring-2 ring-slate-700/60 shadow-[0_18px_40px_-18px_rgba(14,165,233,0.55)] bg-slate-900">
          {/* screen */}
          <div className="relative">
            <canvas ref={canvasRef} width={CW} height={CH}
              className="block w-full touch-none"
              style={{ aspectRatio: `${CW}/${CH}`, background: "#0f172a" }} />
            {!playing && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/60 backdrop-blur-sm text-center p-5 animate-[fadeIn_0.3s_ease-out]">
                {phase === "levelComplete" ? (
                  <>
                    <Trophy className="w-10 h-10 text-accent" />
                    <div className="text-xl font-extrabold text-white">{t("Level")} {level} {t("Complete!")}</div>
                    <div className="text-sm text-white/80">{t("The flood recedes. The treasure is safe — for now.")}</div>
                    <Button onClick={() => start(level + 1)} className="bg-primary text-primary-foreground rounded-2xl px-6 py-5 font-bold">
                      <Play className="w-4 h-4 mr-2" />{t("Next Level")}
                    </Button>
                  </>
                ) : phase === "won" ? (
                  <>
                    <Trophy className="w-10 h-10 text-accent" />
                    <div className="text-xl font-extrabold text-white">{t("Royal Treasure Secured!")}</div>
                    <div className="text-sm text-white/80">{t("Score")}: <span className="font-bold text-accent">{score}</span></div>
                    <Button onClick={() => start(1)} className="bg-primary text-primary-foreground rounded-2xl px-6 py-5"><RotateCcw className="w-4 h-4 mr-2" />{t("Play again")}</Button>
                  </>
                ) : phase === "lost" ? (
                  <>
                    <AlertTriangle className="w-10 h-10 text-sky-400" />
                    <div className="text-xl font-extrabold text-white">{t("The Chest Was Flooded!")}</div>
                    <div className="text-sm text-white/80">{t("The water reached the treasure.")}</div>
                    <Button onClick={() => start(level)} className="bg-primary text-primary-foreground rounded-2xl px-6 py-5"><RotateCcw className="w-4 h-4 mr-2" />{t("Try again")}</Button>
                  </>
                ) : (
                  <>
                    <Crown className="w-9 h-9 text-accent" />
                    <div className="text-lg font-extrabold text-white">{t("Royal Match")}</div>
                    <p className="text-xs text-white/80 max-w-[230px]">{t("Drag a gem up/down/left/right to match 3+ and drain the flood. Fill the treasury before the water reaches the chest!")}</p>
                    <Button onClick={() => start(1)} className="bg-primary text-primary-foreground rounded-2xl px-8 py-5 text-base font-bold">
                      <Play className="w-4 h-4 mr-2" />{t("Start")}
                    </Button>
                  </>
                )}
              </div>
            )}
          </div>

          {/* control board — the gem buttons, fused under the screen */}
          <div className="bg-gradient-to-b from-slate-800 to-slate-900 border-t-2 border-slate-700/60 py-2 touch-none select-none overflow-hidden" style={{ touchAction: "none" }}>
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
        {t("Drag any gem up, down, left or right to swap and match 3 or more.")}
      </p>
    </div>
  );
}