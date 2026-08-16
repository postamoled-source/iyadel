import { useState, useEffect, useRef } from "react";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { RotateCcw, Trophy, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { playMove, playMerge, playWin, playGameOver, playStart, resumeAudio } from "@/lib/game-sounds";
import GameMusicButton from "@/components/games/GameMusicButton";

const SIZE = 4;
const GAP = 10;
let idCounter = 1;
const newId = () => idCounter++;
const rand = (n) => Math.floor(Math.random() * n);

const emptyBoard = () => Array.from({ length: SIZE }, () => Array(SIZE).fill(0));

const isGameOver = (b) => {
  for (let r = 0; r < SIZE; r++) for (let c = 0; c < SIZE; c++) {
    if (b[r][c] === 0) return false;
    if (c + 1 < SIZE && b[r][c] === b[r][c + 1]) return false;
    if (r + 1 < SIZE && b[r][c] === b[r + 1][c]) return false;
  }
  return true;
};

// Build the four lines of cell coordinates for a move, ordered from the edge
// tiles travel toward (so compression fills from that edge).
const buildLines = (dir) => {
  const lines = [];
  for (let i = 0; i < SIZE; i++) {
    const line = [];
    for (let j = 0; j < SIZE; j++) {
      let r, c;
      if (dir === 0) { r = i; c = j; }
      else if (dir === 2) { r = i; c = SIZE - 1 - j; }
      else if (dir === 1) { r = j; c = i; }
      else { r = SIZE - 1 - j; c = i; }
      line.push([r, c]);
    }
    lines.push(line);
  }
  return lines;
};

// Returns survivors (kept tiles with new positions), ghosts (merged-away
// tiles that slide to the merge cell then fade), score gained, and the
// resulting numeric board (for spawn + game-over checks).
const applyMove = (tiles, dir) => {
  const grid = Array.from({ length: SIZE }, () => Array(SIZE).fill(null));
  tiles.forEach((t) => { grid[t.r][t.c] = t; });
  const board = emptyBoard();
  const survivors = [];
  const ghosts = [];
  let gained = 0, changed = false;

  for (const line of buildLines(dir)) {
    const lineTiles = line.map(([r, c]) => grid[r][c]).filter(Boolean);
    let target = 0, k = 0;
    while (k < lineTiles.length) {
      const t = lineTiles[k];
      const [tr, tc] = line[target];
      if (k + 1 < lineTiles.length && lineTiles[k + 1].value === t.value) {
        const m = lineTiles[k + 1];
        if (t.r !== tr || t.c !== tc || m.r !== tr || m.c !== tc) changed = true;
        survivors.push({ id: t.id, value: t.value * 2, r: tr, c: tc, state: "merged" });
        ghosts.push({ id: m.id, value: m.value, r: tr, c: tc, state: "removing" });
        board[tr][tc] = t.value * 2;
        gained += t.value * 2;
        k += 2; target++;
        changed = true;
      } else {
        if (t.r !== tr || t.c !== tc) changed = true;
        survivors.push({ id: t.id, value: t.value, r: tr, c: tc, state: "normal" });
        board[tr][tc] = t.value;
        k++; target++;
      }
    }
  }
  return { survivors, ghosts, gained, changed, board };
};

const makeTile = (board) => {
  const cells = [];
  for (let r = 0; r < SIZE; r++) for (let c = 0; c < SIZE; c++) if (board[r][c] === 0) cells.push([r, c]);
  if (!cells.length) return null;
  const [r, c] = cells[rand(cells.length)];
  const value = Math.random() < 0.9 ? 2 : 4;
  return { id: newId(), value, r, c, state: "new" };
};

// Per-value gradient backgrounds for a richer, cohesive look.
const TILE = {
  2: "from-slate-100 to-slate-200 text-slate-700",
  4: "from-violet-100 to-violet-200 text-violet-700",
  8: "from-violet-300 to-violet-400 text-white",
  16: "from-violet-400 to-violet-500 text-white",
  32: "from-fuchsia-400 to-fuchsia-500 text-white",
  64: "from-fuchsia-500 to-rose-500 text-white",
  128: "from-amber-300 to-amber-400 text-amber-950",
  256: "from-amber-400 to-orange-400 text-amber-950",
  512: "from-orange-400 to-orange-500 text-white",
  1024: "from-emerald-400 to-teal-500 text-white",
  2048: "from-yellow-300 via-amber-400 to-orange-500 text-amber-950",
};

const initialTiles = () => {
  const b = emptyBoard();
  const tiles = [];
  for (let i = 0; i < 2; i++) {
    const t = makeTile(b);
    if (t) { tiles.push(t); b[t.r][t.c] = t.value; }
  }
  return tiles;
};

export default function Game2048() {
  const { t } = useI18n();
  const [tiles, setTiles] = useState(initialTiles);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(() => { try { return Number(localStorage.getItem("tp_2048_best") || 0); } catch { return 0; } });
  const [over, setOver] = useState(false);
  const [won, setWon] = useState(false);
  const [bw, setBw] = useState(320);
  const touch = useRef(null);
  const tilesRef = useRef(tiles);
  const boardRef = useRef(null);

  useEffect(() => {
    const el = boardRef.current;
    if (!el) return;
    const update = () => setBw(el.clientWidth);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const cell = (bw - GAP * (SIZE - 1)) / SIZE;
  const at = (i) => i * (cell + GAP);

  const doMove = (dir) => {
    if (over) return;
    const cur = tilesRef.current.filter((x) => x.state !== "removing");
    const { survivors, ghosts, gained, changed, board } = applyMove(cur, dir);
    if (!changed) return;
    const spawn = makeTile(board);
    const all = [...survivors, ...ghosts];
    if (spawn) { all.push(spawn); board[spawn.r][spawn.c] = spawn.value; }
    tilesRef.current = all;
    setTiles(all);
    if (gained > 0) playMerge(); else playMove();
    const ns = score + gained;
    setScore(ns);
    if (ns > best) { setBest(ns); try { localStorage.setItem("tp_2048_best", String(ns)); } catch {} }
    if (!won && survivors.some((x) => x.value >= 2048)) { setWon(true); playWin(); }
    if (isGameOver(board)) { setOver(true); playGameOver(); }
  };

  useEffect(() => {
    const onKey = (e) => {
      const map = { ArrowLeft: 0, ArrowUp: 1, ArrowRight: 2, ArrowDown: 3, a: 0, w: 1, d: 2, s: 3 };
      const dir = map[e.key];
      if (dir === undefined) return;
      e.preventDefault();
      resumeAudio();
      doMove(dir);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const onTouchStart = (e) => { const t0 = e.touches[0]; touch.current = { x: t0.clientX, y: t0.clientY }; };
  const onTouchEnd = (e) => {
    if (!touch.current) return;
    const t0 = e.changedTouches[0];
    const dx = t0.clientX - touch.current.x;
    const dy = t0.clientY - touch.current.y;
    touch.current = null;
    if (Math.abs(dx) < 24 && Math.abs(dy) < 24) return;
    resumeAudio();
    if (Math.abs(dx) > Math.abs(dy)) doMove(dx > 0 ? 2 : 0);
    else doMove(dy > 0 ? 3 : 1);
  };

  const restart = () => {
    resumeAudio(); playStart();
    const nt = initialTiles();
    tilesRef.current = nt;
    setTiles(nt); setScore(0); setOver(false); setWon(false);
  };

  return (
    <div className="select-none">
      <div className="flex items-center justify-between mb-4 gap-3">
        <div className="flex gap-3">
          <div className="rounded-2xl bg-card border border-border px-4 py-2 text-center min-w-[72px] shadow-sm">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{t("Score")}</div>
            <div className="text-xl font-extrabold text-foreground tabular-nums">{score}</div>
          </div>
          <div className="rounded-2xl bg-card border border-border px-4 py-2 text-center min-w-[72px] shadow-sm">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{t("Best")}</div>
            <div className="text-xl font-extrabold text-primary tabular-nums">{best}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={restart} variant="outline" className="rounded-2xl px-4 py-4"><RotateCcw className="w-4 h-4 mr-2" />{t("New Game")}</Button>
          <GameMusicButton theme="2048" />
        </div>
      </div>

      <div
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        style={{ touchAction: "none" }}
        className="relative mx-auto rounded-3xl p-3 shadow-lg w-fit overflow-hidden
          bg-gradient-to-br from-violet-500/15 via-sky-400/10 to-amber-300/20 border border-primary/20"
      >
        <div className="pointer-events-none absolute -top-10 -left-10 w-32 h-32 rounded-full bg-primary/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-10 -right-10 w-32 h-32 rounded-full bg-accent/20 blur-3xl" />

        <div ref={boardRef} className="relative" style={{ width: "min(80vw, 340px)", height: "min(80vw, 340px)" }}>
          {/* empty background cells */}
          <div className="absolute inset-0 grid grid-cols-4 gap-2.5">
            {Array.from({ length: 16 }).map((_, i) => (
              <div key={i} className="rounded-xl bg-background/50 border border-border/40" />
            ))}
          </div>

          {/* tiles */}
          <div className="absolute inset-0">
            {tiles.map((tile) => (
              <motion.div
                key={tile.id}
                initial={{
                  left: at(tile.c),
                  top: at(tile.r),
                  scale: tile.state === "new" ? 0 : 1,
                  opacity: tile.state === "new" ? 0 : tile.state === "removing" ? 1 : 1,
                }}
                animate={{
                  left: at(tile.c),
                  top: at(tile.r),
                  scale: tile.state === "merged" ? [1, 1.2, 1] : 1,
                  opacity: tile.state === "removing" ? 0 : 1,
                }}
                transition={{
                  left: { duration: 0.16, ease: "easeInOut" },
                  top: { duration: 0.16, ease: "easeInOut" },
                  scale: { duration: 0.22, ease: "easeOut" },
                  opacity: { duration: tile.state === "removing" ? 0.12 : 0.12 },
                }}
                style={{ position: "absolute", width: cell, height: cell }}
                className={`rounded-xl bg-gradient-to-br ${TILE[tile.value] || "from-primary to-accent text-primary-foreground"} flex items-center justify-center font-extrabold tabular-nums shadow-md ${tile.value >= 1024 ? "text-lg" : tile.value >= 128 ? "text-2xl" : "text-3xl"}`}
              >
                {tile.value}
              </motion.div>
            ))}
          </div>
        </div>

        <AnimatePresence>
          {(over || won) && (
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="absolute inset-0 rounded-3xl bg-background/80 backdrop-blur-md flex flex-col items-center justify-center gap-4"
            >
              <motion.div
                initial={{ y: -8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.08 }}
                className="flex items-center gap-2 text-2xl font-extrabold text-foreground"
              >
                {won ? <Sparkles className="w-6 h-6 text-accent" /> : <Trophy className="w-6 h-6 text-accent" />}
                {over ? t("Game Over") : t("You win!")}
              </motion.div>
              <div className="text-sm text-muted-foreground">{t("Score")}: <span className="font-bold text-foreground">{score}</span></div>
              <Button onClick={restart} className="bg-primary text-primary-foreground rounded-2xl px-6 py-5">{t("Play again")}</Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <p className="mt-5 text-center text-xs text-muted-foreground">{t("Swipe or use arrow keys to move. Merge equal tiles to reach 2048.")}</p>
    </div>
  );
}