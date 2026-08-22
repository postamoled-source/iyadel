import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Crown, Leaf, Heart, Gem, Play, RotateCcw, Trophy, AlertTriangle } from "lucide-react";
import { playStart, playWin, playGameOver, playBubblePop, resumeAudio } from "@/lib/game-sounds";

// Anime king sprite (generated on green screen — chroma-keyed at runtime for transparency).
const KING_URL = "https://media.base44.com/images/public/6a7e76e3396b41955b675542/560563c60_generated_image.png";

// Danger scene canvas size.
const CW = 320, CH = 240;
// Match-3 board.
const COLS = 7, ROWS = 7, TS = 38;
const BW = COLS * TS, BH = ROWS * TS;
const TILE_TYPES = 4;
// Level-1 tuning.
const GOAL = 6;
const LAVA_START = 0.12;
const LAVA_MAX = 0.6;      // lava reaches the platform → king falls
const LAVA_RISE = 0.018;   // per second
const LAVA_DRAIN = 0.09;    // per matched tile group

const TILE_META = [
  { Icon: Crown, color: "#ffd740", edge: "#b8860b" },
  { Icon: Leaf, color: "#69f0ae", edge: "#2e8b57" },
  { Icon: Heart, color: "#ff5252", edge: "#b71c1c" },
  { Icon: Gem, color: "#4fc3f7", edge: "#0277bd" },
];

let _id = 0;
const uid = () => ++_id;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

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
function applyGravity(board, removedIds) {
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

// ---- Chroma-key the green-screen king into a transparent sprite (once) ----
function prepareSprite(img) {
  const c = document.createElement("canvas");
  c.width = img.width; c.height = img.height;
  const cx = c.getContext("2d");
  cx.drawImage(img, 0, 0);
  try {
    const id = cx.getImageData(0, 0, c.width, c.height);
    const d = id.data;
    for (let i = 0; i < d.length; i += 4) {
      const r = d[i], g = d[i + 1], b = d[i + 2];
      // green screen key
      if (g > 80 && g > r * 1.2 && g > b * 1.2) {
        d[i + 3] = 0;
      } else if (g > r * 1.05 && g > b * 1.05) {
        // partial green fringe → soft alpha
        const k = Math.min(1, (g - Math.max(r, b)) / 60);
        d[i + 3] = Math.round((1 - k) * d[i + 3]);
        d[i] = Math.min(255, r + 30); d[i + 1] = Math.min(255, g * 0.6); d[i + 2] = Math.min(255, b + 20);
      }
    }
    cx.putImageData(id, 0, 0);
    return c;
  } catch {
    // canvas tainted (no CORS) — fall back to a soft elliptical clip so no green rectangle shows
    const clip = document.createElement("canvas");
    clip.width = img.width; clip.height = img.height;
    const cc = clip.getContext("2d");
    cc.save();
    cc.beginPath();
    cc.ellipse(img.width / 2, img.height * 0.52, img.width * 0.42, img.height * 0.46, 0, 0, Math.PI * 2);
    cc.clip();
    cc.drawImage(img, 0, 0);
    cc.restore();
    // feather the clip edge
    cc.globalCompositeOperation = "destination-in";
    const fg = cc.createRadialGradient(img.width / 2, img.height * 0.52, img.width * 0.2, img.width / 2, img.height * 0.52, img.width * 0.5);
    fg.addColorStop(0, "rgba(0,0,0,1)"); fg.addColorStop(0.85, "rgba(0,0,0,1)"); fg.addColorStop(1, "rgba(0,0,0,0)");
    cc.fillStyle = fg; cc.fillRect(0, 0, img.width, img.height);
    return clip;
  }
}

export default function SaveTheKing() {
  const { t } = useI18n();
  const canvasRef = useRef(null);
  const spriteRef = useRef(null);
  const [spriteReady, setSpriteReady] = useState(false);

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

  // Load + key the king sprite once.
  useEffect(() => {
    const img = new Image();
    img.onload = () => { spriteRef.current = prepareSprite(img); setSpriteReady(true); };
    img.src = KING_URL;
  }, []);

  const stopLoop = () => { if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; } };

  // ---- Danger scene render loop (lava, platform, king, embers) ----
  const drawScene = useCallback(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    const now = performance.now();
    const dt = lastRef.current ? (now - lastRef.current) / 1000 : 0;
    lastRef.current = now;

    // advance lava while playing
    if (phaseRef.current === "playing") {
      lavaRef.current = Math.min(LAVA_MAX + 0.0001, lavaRef.current + LAVA_RISE * dt);
      setLavaLevel(lavaRef.current);
      if (lavaRef.current >= LAVA_MAX) finish("lost");
    }

    // background stone pit
    const bg = ctx.createLinearGradient(0, 0, 0, CH);
    bg.addColorStop(0, "#2c3e50"); bg.addColorStop(1, "#14110f");
    ctx.fillStyle = bg; ctx.fillRect(0, 0, CW, CH);
    // brick texture lines
    ctx.strokeStyle = "rgba(0,0,0,0.25)"; ctx.lineWidth = 1;
    for (let y = 14; y < CH; y += 22) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(CW, y); ctx.stroke(); }
    for (let y = 14; y < CH; y += 22) {
      const off = (Math.floor(y / 22) % 2) * 22;
      for (let x = off; x < CW; x += 44) { ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + 22); ctx.stroke(); }
    }

    // pipes (upper sides) pouring lava
    const pourY = 18;
    const lavaTopY = CH - lavaRef.current * CH;
    const drawPipe = (px, dir) => {
      ctx.fillStyle = "#7a3b3b";
      ctx.fillRect(px - 12, 0, 24, 26);
      ctx.fillStyle = "#5a2a2a";
      ctx.fillRect(px - 12, 22, 24, 6);
      // stream
      const sg = ctx.createLinearGradient(0, pourY, 0, lavaTopY);
      sg.addColorStop(0, "#ff8c00"); sg.addColorStop(1, "#ff4500");
      ctx.fillStyle = sg;
      ctx.beginPath();
      ctx.moveTo(px - 5, pourY); ctx.lineTo(px + 5, pourY);
      ctx.lineTo(px + 3 + dir * 4, lavaTopY); ctx.lineTo(px - 3 + dir * 4, lavaTopY);
      ctx.closePath(); ctx.fill();
    };
    drawPipe(34, 1);
    drawPipe(CW - 34, -1);

    // lava pool
    const lh = CH - lavaTopY;
    if (lh > 1) {
      const lg = ctx.createLinearGradient(0, lavaTopY, 0, CH);
      lg.addColorStop(0, "#ffd700"); lg.addColorStop(0.25, "#ff8c00"); lg.addColorStop(1, "#cc3300");
      ctx.fillStyle = lg;
      ctx.beginPath();
      ctx.moveTo(0, lavaTopY);
      for (let x = 0; x <= CW; x += 8) {
        const w = Math.sin((x + now * 0.004) * 0.08) * 3 + Math.sin((x - now * 0.006) * 0.05) * 2;
        ctx.lineTo(x, lavaTopY + w);
      }
      ctx.lineTo(CW, CH); ctx.lineTo(0, CH); ctx.closePath(); ctx.fill();
      // bright crust
      ctx.strokeStyle = "rgba(255,255,200,0.7)"; ctx.lineWidth = 2;
      ctx.beginPath();
      for (let x = 0; x <= CW; x += 8) {
        const w = Math.sin((x + now * 0.004) * 0.08) * 3 + Math.sin((x - now * 0.006) * 0.05) * 2;
        if (x === 0) ctx.moveTo(x, lavaTopY + w); else ctx.lineTo(x, lavaTopY + w);
      }
      ctx.stroke();
      // glow above lava
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

    // stone platform
    const platY = CH * 0.62;
    ctx.fillStyle = "rgba(0,0,0,0.4)";
    ctx.beginPath(); ctx.ellipse(CW / 2, platY + 16, 46, 10, 0, 0, Math.PI * 2); ctx.fill();
    const pg = ctx.createLinearGradient(0, platY - 14, 0, platY + 14);
    pg.addColorStop(0, "#9a8b7a"); pg.addColorStop(1, "#5b4d40");
    ctx.fillStyle = pg;
    ctx.beginPath(); ctx.ellipse(CW / 2, platY, 44, 14, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.18)";
    ctx.beginPath(); ctx.ellipse(CW / 2, platY - 4, 34, 6, 0, 0, Math.PI * 2); ctx.fill();

    // king sprite — smooth bob + distress tilt, rises with lava urgency
    const urgency = lavaRef.current / LAVA_MAX;
    const bob = Math.sin(now * 0.004) * (2 + urgency * 3);
    const tilt = Math.sin(now * 0.006) * (0.04 + urgency * 0.12);
    const shake = urgency > 0.75 ? (Math.random() - 0.5) * urgency * 3 : 0;
    const spr = spriteRef.current;
    if (spr) {
      const sh = 78;
      const sw = spr.width * (sh / spr.height);
      ctx.save();
      ctx.translate(CW / 2 + shake, platY - sh * 0.78 + bob);
      ctx.rotate(tilt);
      // soft contact shadow
      ctx.save(); ctx.globalAlpha = 0.25; ctx.scale(1, 0.3);
      ctx.beginPath(); ctx.arc(0, sh * 0.9, sw * 0.4, 0, Math.PI * 2);
      ctx.fillStyle = "#000"; ctx.fill(); ctx.restore();
      ctx.drawImage(spr, -sw / 2, -sh / 2, sw, sh);
      ctx.restore();
    } else {
      // placeholder glow before sprite loads
      ctx.fillStyle = "rgba(255,255,255,0.15)";
      ctx.beginPath(); ctx.arc(CW / 2, platY - 40, 26, 0, Math.PI * 2); ctx.fill();
    }

    if (phaseRef.current === "playing") rafRef.current = requestAnimationFrame(drawScene);
  }, []);

  const startLoop = () => { stopLoop(); lastRef.current = 0; rafRef.current = requestAnimationFrame(drawScene); };

  const finish = useCallback((res) => {
    if (phaseRef.current !== "playing") return;
    phaseRef.current = res; setPhase(res);
    stopLoop();
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
    startLoop();
  }, [drawScene]);

  useEffect(() => () => stopLoop(), []);

  // ---- match-3 resolution ----
  const resolve = useCallback(async (board) => {
    let m = findMatches(board);
    while (m.size) {
      const removeIds = new Set(m);
      setTiles(board.map((x) => (removeIds.has(x.id) ? { ...x, removing: true } : x)));
      playBubblePop();
      await sleep(150);
      board = applyGravity(board, removeIds);
      // clear fresh flag after mount
      setTiles([...board]);
      await sleep(170);
      // drain lava + score
      lavaRef.current = Math.max(0, lavaRef.current - LAVA_DRAIN);
      setLavaLevel(lavaRef.current);
      const gained = m.size * 10;
      scoreRef.current += gained; setScore(scoreRef.current);
      progressRef.current = Math.min(GOAL, progressRef.current + 1);
      setProgress(progressRef.current);
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
    // swap
    const board = tiles.map((x) => x.id === a.id ? { ...x, col: b.col, row: b.row } : x.id === b.id ? { ...x, col: a.col, row: a.row } : x);
    setTiles([...board]);
    await sleep(160);
    if (findMatches(board).size) {
      await resolve(board);
    } else {
      // revert
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

      {/* Danger scene */}
      <div className="relative mx-auto w-fit rounded-3xl overflow-hidden border border-border shadow-[0_18px_40px_-18px_rgba(255,80,0,0.5)]">
        <canvas ref={canvasRef} width={CW} height={CH}
          className="block touch-none"
          style={{ width: "min(86vw, 320px)", height: "auto", aspectRatio: `${CW}/${CH}` }} />
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
                <Trophy className="w-9 h-9 text-accent" />
                <div className="text-lg font-extrabold text-white">{t("Save the King")}</div>
                <p className="text-xs text-white/80 max-w-[230px]">{t("Match 3+ blocks to drain the lava and save the anime king before it reaches him!")}</p>
                <Button onClick={start} className="bg-primary text-primary-foreground rounded-2xl px-8 py-5 text-base font-bold" disabled={!spriteReady}>
                  <Play className="w-4 h-4 mr-2" />{spriteReady ? t("Start") : t("Loading...")}
                </Button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Match-3 board */}
      <div className="mx-auto w-fit mt-4 p-2 rounded-2xl bg-gradient-to-b from-stone-800 to-stone-900 border border-stone-700 shadow-inner">
        <div className="relative" style={{ width: BW, height: BH }}>
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

      <p className="mt-3 text-center text-xs text-muted-foreground">
        {t("Tap two adjacent blocks to swap and match 3 or more.")}
      </p>
    </div>
  );
}

function rand(a, b) { return a + Math.random() * (b - a); }