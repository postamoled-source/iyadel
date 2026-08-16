import { useRef, useEffect, useState, useCallback } from "react";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Play, RotateCcw, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Trophy } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const SIZE = 360, GRID = 15, CELL = SIZE / GRID;

// ---------- Audio (Web Audio API) ----------
let actx;
const ctx = () => { if (!actx) actx = new (window.AudioContext || window.webkitAudioContext)(); return actx; };
const resumeAudio = () => { const c = ctx(); if (c.state === "suspended") c.resume(); };
const beep = (freq, dur, type = "sine", vol = 0.15, slide) => {
  const c = ctx(); const o = c.createOscillator(); const g = c.createGain();
  o.type = type; o.frequency.setValueAtTime(freq, c.currentTime);
  if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(slide, 40), c.currentTime + dur);
  g.gain.setValueAtTime(vol, c.currentTime); g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + dur);
  o.connect(g).connect(c.destination); o.start(); o.stop(c.currentTime + dur);
};
const SFX = {
  eat: () => { beep(660, 0.08, "triangle", 0.18); setTimeout(() => beep(990, 0.1, "triangle", 0.18), 70); },
  turn: () => beep(420, 0.03, "sine", 0.05),
  start: () => { [523, 659, 784].forEach((f, i) => setTimeout(() => beep(f, 0.12, "triangle", 0.16), i * 90)); },
  over: () => { [392, 330, 247].forEach((f, i) => setTimeout(() => beep(f, 0.22, "sawtooth", 0.18), i * 150)); },
};

// ---------- decorative flowers (fixed, deterministic) ----------
function makeRng(seed) { let s = seed % 233280; return () => { s = (s * 9301 + 49297) % 233280; return s / 233280; }; }
const FLOWERS = (() => {
  const r = makeRng(7); const arr = [];
  for (let i = 0; i < 14; i++) arr.push({ x: 0.5 + r() * (GRID - 1), y: 0.5 + r() * (GRID - 1), c: ["#ff6b9d", "#ffd166", "#ef476f", "#f78c6b", "#c77dff"][Math.floor(r() * 5)] });
  return arr;
})();
const lerp = (a, b, t) => a + (b - a) * t;

export default function SnakeGame() {
  const { t } = useI18n();
  const canvasRef = useRef(null);
  const st = useRef(null);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(() => { try { return parseInt(localStorage.getItem("snake_best") || "0", 10) || 0; } catch { return 0; } });
  const [phase, setPhase] = useState("ready");
  const [running, setRunning] = useState(false);
  const rafRef = useRef(0);
  const timeRef = useRef(0);
  const touch = useRef(null);

  const spawnFood = (snake) => {
    let f;
    do { f = { x: Math.floor(Math.random() * GRID), y: Math.floor(Math.random() * GRID) }; }
    while (snake.some((s) => s.x === f.x && s.y === f.y));
    return f;
  };

  const newGame = useCallback(() => {
    resumeAudio(); SFX.start();
    const snake = [{ x: 7, y: 7 }, { x: 6, y: 7 }, { x: 5, y: 7 }];
    st.current = { snake, prev: snake.map((s) => ({ ...s })), grew: false, dir: { x: 1, y: 0 }, nextDir: { x: 1, y: 0 }, food: spawnFood(snake), acc: 0, step: 150, score: 0, dead: false };
    setScore(0); setPhase("playing"); setRunning(true);
  }, []);

  const setDir = useCallback((d) => {
    const s = st.current; if (!s) return;
    if (d.x === -s.dir.x && d.y === -s.dir.y) return;
    if (d.x === s.nextDir.x && d.y === s.nextDir.y) return;
    s.nextDir = d; SFX.turn();
  }, []);

  const gameOver = () => {
    const s = st.current; if (!s) return;
    setPhase("over"); setRunning(false); SFX.over();
    setBest((prev) => { const nb = Math.max(prev, s.score); try { localStorage.setItem("snake_best", String(nb)); } catch {} return nb; });
  };

  const tick = () => {
    const s = st.current; if (!s || s.dead) return;
    s.dir = s.nextDir;
    const head = s.snake[0];
    const nh = { x: head.x + s.dir.x, y: head.y + s.dir.y };
    if (nh.x < 0 || nh.y < 0 || nh.x >= GRID || nh.y >= GRID) { s.dead = true; gameOver(); return; }
    for (let i = 0; i < s.snake.length - 1; i++) { if (s.snake[i].x === nh.x && s.snake[i].y === nh.y) { s.dead = true; gameOver(); return; } }
    s.prev = s.snake.map((p) => ({ ...p }));
    s.snake.unshift(nh);
    if (nh.x === s.food.x && nh.y === s.food.y) {
      s.grew = true; s.score += 1; setScore(s.score);
      s.step = Math.max(70, 150 - s.score * 4);
      s.food = spawnFood(s.snake); SFX.eat();
    } else { s.grew = false; s.snake.pop(); }
  };

  // main loop
  useEffect(() => {
    let last = performance.now();
    const loop = (now) => {
      const dt = Math.min(now - last, 100); last = now; timeRef.current += dt / 1000;
      const s = st.current;
      if (running && s && phase === "playing") {
        s.acc += dt;
        while (s.acc >= s.step) { s.acc -= s.step; tick(); if (s.dead) break; }
      }
      render();
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [running, phase]);

  const render = () => {
    const canvas = canvasRef.current; if (!canvas) return;
    const c = canvas.getContext("2d");
    const s = st.current;
    // grass background
    const g = c.createLinearGradient(0, 0, 0, SIZE);
    g.addColorStop(0, "#8bc34a"); g.addColorStop(1, "#558b2f");
    c.fillStyle = g; c.fillRect(0, 0, SIZE, SIZE);
    // faint grid
    c.strokeStyle = "rgba(255,255,255,0.07)"; c.lineWidth = 1;
    for (let i = 1; i < GRID; i++) { c.beginPath(); c.moveTo(i * CELL, 0); c.lineTo(i * CELL, SIZE); c.stroke(); c.beginPath(); c.moveTo(0, i * CELL); c.lineTo(SIZE, i * CELL); c.stroke(); }
    // flowers
    FLOWERS.forEach((f) => {
      const cx = f.x * CELL, cy = f.y * CELL;
      c.fillStyle = f.c; for (let k = 0; k < 5; k++) { const a = k / 5 * Math.PI * 2; c.beginPath(); c.arc(cx + Math.cos(a) * 4, cy + Math.sin(a) * 4, 2.2, 0, Math.PI * 2); c.fill(); }
      c.fillStyle = "#ffd166"; c.beginPath(); c.arc(cx, cy, 1.6, 0, Math.PI * 2); c.fill();
    });
    // butterflies
    const time = timeRef.current;
    for (let i = 0; i < 2; i++) { drawButterfly(c, SIZE * 0.3 + Math.sin(time * 0.6 + i * 2) * 60 + i * SIZE * 0.4, 50 + Math.sin(time * 1.3 + i) * 24 + i * 200, time + i); }
    // food (apple)
    if (s) drawApple(c, s.food.x * CELL + CELL / 2, s.food.y * CELL + CELL / 2);
    // snake
    if (s) {
      const n = s.prev.length; const tp = Math.max(0, Math.min(1, s.acc / s.step));
      for (let i = s.snake.length - 1; i >= 0; i--) {
        const cur = s.snake[i];
        const p = (s.grew && i === n) ? s.prev[n - 1] : (s.prev[i] || cur);
        const x = lerp(p.x, cur.x, tp) * CELL + CELL / 2;
        const y = lerp(p.y, cur.y, tp) * CELL + CELL / 2;
        drawSeg(c, x, y, i === 0, s.dir, i, s.snake.length);
      }
    }
    // wooden frame
    c.strokeStyle = "#6d4c41"; c.lineWidth = 4; c.strokeRect(2, 2, SIZE - 4, SIZE - 4);
  };

  function drawApple(c, x, y) {
    c.fillStyle = "#e53935"; c.beginPath(); c.arc(x, y, CELL * 0.32, 0, Math.PI * 2); c.fill();
    c.fillStyle = "rgba(255,255,255,0.5)"; c.beginPath(); c.arc(x - 3, y - 3, CELL * 0.1, 0, Math.PI * 2); c.fill();
    c.strokeStyle = "#6d4c41"; c.lineWidth = 2; c.beginPath(); c.moveTo(x, y - CELL * 0.3); c.lineTo(x, y - CELL * 0.42); c.stroke();
    c.fillStyle = "#7cb342"; c.beginPath(); c.ellipse(x + 4, y - CELL * 0.38, 4, 2, -0.6, 0, Math.PI * 2); c.fill();
  }
  function drawSeg(c, x, y, isHead, dir, i, len) {
    const r = isHead ? CELL * 0.44 : CELL * 0.4;
    c.fillStyle = isHead ? "#2e7d32" : `hsl(${120 - (i / len) * 30}, ${60 - (i / len) * 15}%, ${46 - (i / len) * 12}%)`;
    c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fill();
    if (isHead) {
      const ex = dir.x * 3, ey = dir.y * 3; const px = -dir.y, py = dir.x;
      c.fillStyle = "#fff";
      c.beginPath(); c.arc(x + ex + px * 4, y + ey + py * 4, 2.6, 0, Math.PI * 2); c.fill();
      c.beginPath(); c.arc(x + ex - px * 4, y + ey - py * 4, 2.6, 0, Math.PI * 2); c.fill();
      c.fillStyle = "#000";
      c.beginPath(); c.arc(x + ex + px * 4 + dir.x, y + ey + py * 4 + dir.y, 1.3, 0, Math.PI * 2); c.fill();
      c.beginPath(); c.arc(x + ex - px * 4 + dir.x, y + ey - py * 4 + dir.y, 1.3, 0, Math.PI * 2); c.fill();
    }
  }
  function drawButterfly(c, x, y, time) {
    const w = 4 + Math.abs(Math.sin(time * 8)) * 4;
    c.fillStyle = "rgba(199,125,255,0.9)";
    c.beginPath(); c.ellipse(x - 4, y, 4, w, 0, 0, Math.PI * 2); c.fill();
    c.beginPath(); c.ellipse(x + 4, y, 4, w, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = "#333"; c.fillRect(x - 0.5, y - 4, 1, 8);
  }

  // keyboard
  useEffect(() => {
    const onKey = (e) => {
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(e.key)) e.preventDefault();
      if (phase !== "playing") { if (e.key === " " || e.key === "Enter") newGame(); return; }
      if (e.key === "ArrowUp" || e.key === "w" || e.key === "W") setDir({ x: 0, y: -1 });
      else if (e.key === "ArrowDown" || e.key === "s" || e.key === "S") setDir({ x: 0, y: 1 });
      else if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") setDir({ x: -1, y: 0 });
      else if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") setDir({ x: 1, y: 0 });
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, setDir, newGame]);

  // canvas dpr
  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = SIZE * dpr; canvas.height = SIZE * dpr;
    canvas.getContext("2d").scale(dpr, dpr);
  }, []);

  const onTouchStart = (e) => { const tch = e.touches[0]; touch.current = { x: tch.clientX, y: tch.clientY }; };
  const onTouchMove = (e) => {
    if (!touch.current || phase !== "playing") return;
    const tch = e.touches[0]; const dx = tch.clientX - touch.current.x, dy = tch.clientY - touch.current.y;
    if (Math.abs(dx) < 18 && Math.abs(dy) < 18) return;
    if (Math.abs(dx) > Math.abs(dy)) setDir({ x: dx > 0 ? 1 : -1, y: 0 });
    else setDir({ x: 0, y: dy > 0 ? 1 : -1 });
    touch.current = { x: tch.clientX, y: tch.clientY };
  };
  const tap = (fn) => ({ onTouchStart: (e) => { e.preventDefault(); fn(); }, onClick: () => fn() });

  return (
    <div className="select-none flex flex-col items-center">
      <div className="flex items-center justify-between w-full max-w-[360px] mb-3 px-1 text-sm">
        <div><span className="text-muted-foreground">{t("Score")}: </span><span className="font-extrabold text-primary tabular-nums">{score}</span></div>
        <div className="font-bold text-foreground">{t("Snake")}</div>
        <div><span className="text-muted-foreground">{t("Best")}: </span><span className="font-extrabold text-amber-500 tabular-nums">{best}</span></div>
      </div>

      <div className="relative rounded-2xl overflow-hidden border border-primary/30 shadow-xl" style={{ width: "min(92vw, 360px)", height: "min(92vw, 360px)" }}>
        <canvas ref={canvasRef} onTouchStart={onTouchStart} onTouchMove={onTouchMove} style={{ width: "100%", height: "100%", display: "block", touchAction: "none" }} />
        <AnimatePresence>
          {phase === "ready" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-background/85 backdrop-blur-sm flex flex-col items-center justify-center gap-4 p-6 text-center">
              <div className="text-2xl font-extrabold text-foreground">{t("Snake")}</div>
              <p className="text-sm text-muted-foreground max-w-[280px]">{t("Swipe or arrows to steer. Eat the fruit to grow — don't hit the walls or yourself!")}</p>
              <Button onClick={newGame} className="bg-primary text-primary-foreground rounded-2xl px-8 py-5 text-base font-bold"><Play className="w-5 h-5 mr-2" />{t("Start")}</Button>
            </motion.div>
          )}
          {phase === "over" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-background/85 backdrop-blur-sm flex flex-col items-center justify-center gap-4 text-center">
              <Trophy className="w-9 h-9 text-amber-400" />
              <div className="text-2xl font-extrabold text-destructive">{t("Game Over")}</div>
              <div className="text-sm text-muted-foreground">{t("Score")}: <span className="font-bold text-foreground">{score}</span> · {t("Best")}: <span className="font-bold text-amber-500">{best}</span></div>
              <Button onClick={newGame} className="bg-primary text-primary-foreground rounded-2xl px-6 py-4"><RotateCcw className="w-4 h-4 mr-2" />{t("Play again")}</Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-1.5 touch-none select-none" style={{ width: 156 }}>
        <span />
        <button {...tap(() => setDir({ x: 0, y: -1 }))} className="w-12 h-12 rounded-2xl bg-card border border-border flex items-center justify-center text-foreground active:bg-primary/20 transition-colors"><ChevronUp className="w-6 h-6" /></button>
        <span />
        <button {...tap(() => setDir({ x: -1, y: 0 }))} className="w-12 h-12 rounded-2xl bg-card border border-border flex items-center justify-center text-foreground active:bg-primary/20 transition-colors"><ChevronLeft className="w-6 h-6" /></button>
        <button {...tap(() => setDir({ x: 0, y: 1 }))} className="w-12 h-12 rounded-2xl bg-card border border-border flex items-center justify-center text-foreground active:bg-primary/20 transition-colors"><ChevronDown className="w-6 h-6" /></button>
        <button {...tap(() => setDir({ x: 1, y: 0 }))} className="w-12 h-12 rounded-2xl bg-card border border-border flex items-center justify-center text-foreground active:bg-primary/20 transition-colors"><ChevronRight className="w-6 h-6" /></button>
      </div>
    </div>
  );
}