import { useState, useEffect, useRef } from "react";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { RotateCcw, Trophy, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { playMove, playMerge, playWin, playGameOver, playStart, resumeAudio } from "@/lib/game-sounds";

const SIZE = 4;
const emptyBoard = () => Array.from({ length: SIZE }, () => Array(SIZE).fill(0));

function spawnTile(b) {
  const cells = [];
  for (let r = 0; r < SIZE; r++) for (let c = 0; c < SIZE; c++) if (b[r][c] === 0) cells.push([r, c]);
  if (!cells.length) return b;
  const [r, c] = cells[Math.floor(Math.random() * cells.length)];
  b[r][c] = Math.random() < 0.9 ? 2 : 4;
  return b;
}

function compressLine(line) {
  const vals = line.filter((v) => v);
  const out = [];
  let gained = 0;
  for (let i = 0; i < vals.length; i++) {
    if (i + 1 < vals.length && vals[i] === vals[i + 1]) { out.push(vals[i] * 2); gained += vals[i] * 2; i++; }
    else out.push(vals[i]);
  }
  while (out.length < SIZE) out.push(0);
  return { line: out, gained };
}

function moveBoard(b, dir) {
  const nb = b.map((row) => row.slice());
  let gained = 0, changed = false;
  const apply = (get, set) => {
    for (let i = 0; i < SIZE; i++) {
      const line = get(i);
      const res = compressLine(line);
      gained += res.gained;
      set(i, res.line);
      if (line.some((v, k) => v !== res.line[k])) changed = true;
    }
  };
  if (dir === 0) apply((i) => nb[i], (i, l) => { nb[i] = l; });
  else if (dir === 2) apply((i) => nb[i].slice().reverse(), (i, l) => { nb[i] = l.reverse(); });
  else if (dir === 1) apply((i) => nb.map((row) => row[i]), (i, l) => { for (let r = 0; r < SIZE; r++) nb[r][i] = l[r]; });
  else apply((i) => nb.map((row) => row[i]).reverse(), (i, l) => { const back = l.reverse(); for (let r = 0; r < SIZE; r++) nb[r][i] = back[r]; });
  return { board: nb, gained, changed };
}

function isGameOver(b) {
  for (let r = 0; r < SIZE; r++) for (let c = 0; c < SIZE; c++) {
    if (b[r][c] === 0) return false;
    if (c + 1 < SIZE && b[r][c] === b[r][c + 1]) return false;
    if (r + 1 < SIZE && b[r][c] === b[r + 1][c]) return false;
  }
  return true;
}

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

export default function Game2048() {
  const { t } = useI18n();
  const [board, setBoard] = useState(() => { const b = emptyBoard(); spawnTile(b); spawnTile(b); return b; });
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(() => { try { return Number(localStorage.getItem("tp_2048_best") || 0); } catch { return 0; } });
  const [over, setOver] = useState(false);
  const [won, setWon] = useState(false);
  const [pop, setPop] = useState(0); // bump to trigger merge-pulse on merged tiles
  const touch = useRef(null);
  const mergedRef = useRef(null);

  const doMove = (dir) => {
    if (over) return;
    const prev = board;
    const { board: nb, gained, changed } = moveBoard(prev, dir);
    if (!changed) return;
    // detect which cells merged (value grew) for a pulse
    const merged = new Set();
    for (let r = 0; r < SIZE; r++) for (let c = 0; c < SIZE; c++) {
      if (prev[r][c] !== 0 && nb[r][c] > prev[r][c]) merged.add(r * SIZE + c);
    }
    mergedRef.current = merged;
    spawnTile(nb);
    setBoard(nb);
    setPop((p) => p + 1);
    if (gained > 0) playMerge(); else playMove();
    const ns = score + gained;
    setScore(ns);
    if (ns > best) { setBest(ns); try { localStorage.setItem("tp_2048_best", String(ns)); } catch {} }
    if (!won && nb.some((row) => row.some((v) => v >= 2048))) { setWon(true); playWin(); }
    if (isGameOver(nb)) { setOver(true); playGameOver(); }
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
    const b = emptyBoard(); spawnTile(b); spawnTile(b);
    setBoard(b); setScore(0); setOver(false); setWon(false); setPop((p) => p + 1);
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
        <Button onClick={restart} variant="outline" className="rounded-2xl px-4 py-4"><RotateCcw className="w-4 h-4 mr-2" />{t("New Game")}</Button>
      </div>

      <div
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        style={{ touchAction: "none" }}
        className="relative mx-auto rounded-3xl p-3 shadow-lg w-fit overflow-hidden
          bg-gradient-to-br from-violet-500/15 via-sky-400/10 to-amber-300/20 border border-primary/20"
      >
        {/* soft decorative glows */}
        <div className="pointer-events-none absolute -top-10 -left-10 w-32 h-32 rounded-full bg-primary/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-10 -right-10 w-32 h-32 rounded-full bg-accent/20 blur-3xl" />

        <div className="relative grid grid-cols-4 gap-2.5" style={{ width: "min(80vw, 340px)", height: "min(80vw, 340px)" }}>
          {board.flat().map((v, i) => {
            const isMerged = mergedRef.current && mergedRef.current.has(i);
            return (
              <div key={i} className="rounded-xl">
                <AnimatePresence>
                  {v !== 0 && (
                    <motion.div
                      key={`${i}-${v}-${isMerged ? pop : 0}`}
                      initial={{ scale: 0.3, opacity: 0 }}
                      animate={{ scale: isMerged ? [1, 1.18, 1] : 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ type: "spring", stiffness: 420, damping: 26, duration: isMerged ? 0.28 : 0.22 }}
                      className={`w-full h-full rounded-xl bg-gradient-to-br ${TILE[v] || "from-primary to-accent text-primary-foreground"} flex items-center justify-center font-extrabold tabular-nums shadow-md ${v >= 1024 ? "text-lg" : v >= 128 ? "text-2xl" : "text-3xl"}`}
                    >
                      {v}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
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