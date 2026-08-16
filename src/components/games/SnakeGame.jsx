import { useRef, useEffect, useState, useCallback } from "react";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Play, RotateCcw, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Trophy, Gem } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const SIZE = 360, GRID = 15, CELL = SIZE / GRID;
const LEVEL_EVERY = 5;        // points needed to climb one level
const BASE_STEP = 205;        // ms per step at level 1 (slow, relaxed start)
const STEP_DECAY = 15;        // ms faster per level
const MIN_STEP = 78;
const TREASURE_TTL = 9000;    // ms a treasure stays on the board
const TREASURE_VALUE = 3;

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
  treasure: () => { [784, 1047, 1319].forEach((f, i) => setTimeout(() => beep(f, 0.12, "triangle", 0.2), i * 80)); },
  level: () => { [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => beep(f, 0.14, "triangle", 0.2), i * 90)); },
  start: () => { [523, 659, 784].forEach((f, i) => setTimeout(() => beep(f, 0.12, "triangle", 0.16), i * 90)); },
  over: () => { [392, 330, 247].forEach((f, i) => setTimeout(() => beep(f, 0.22, "sawtooth", 0.18), i * 150)); },
};

const lerp = (a, b, t) => a + (b - a) * t;
const levelFor = (score) => 1 + Math.floor(score / LEVEL_EVERY);
const stepFor = (level) => Math.max(MIN_STEP, BASE_STEP - (level - 1) * STEP_DECAY);
const emptyCell = (snake, food, treasure) => {
  let f;
  do {
    f = { x: Math.floor(Math.random() * GRID), y: Math.floor(Math.random() * GRID) };
  } while (
    snake.some((s) => s.x === f.x && s.y === f.y) ||
    (food && food.x === f.x && food.y === f.y) ||
    (treasure && treasure.x === f.x && treasure.y === f.y)
  );
  return f;
};

export default function SnakeGame() {
  const { t } = useI18n();
  const canvasRef = useRef(null);
  const st = useRef(null);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [best, setBest] = useState(() => { try { return parseInt(localStorage.getItem("snake_best") || "0", 10) || 0; } catch { return 0; } });
  const [phase, setPhase] = useState("ready");
  const [running, setRunning] = useState(false);
  const rafRef = useRef(0);
  const timeRef = useRef(0);
  const touch = useRef(null);

  const newGame = useCallback(() => {
    resumeAudio(); SFX.start();
    const snake = [{ x: 7, y: 7 }, { x: 6, y: 7 }, { x: 5, y: 7 }];
    const food = emptyCell(snake, null, null);
    st.current = {
      snake, prev: snake.map((s) => ({ ...s })), grew: false,
      dir: { x: 1, y: 0 }, nextDir: { x: 1, y: 0 },
      food, treasure: null, acc: 0, step: stepFor(1), score: 0, level: 1, dead: false,
    };
    setScore(0); setLevel(1); setPhase("playing"); setRunning(true);
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
    if (s.treasure && performance.now() > s.treasure.exp) s.treasure = null;
    s.dir = s.nextDir;
    const head = s.snake[0];
    const nh = { x: head.x + s.dir.x, y: head.y + s.dir.y };
    if (nh.x < 0 || nh.y < 0 || nh.x >= GRID || nh.y >= GRID) { s.dead = true; gameOver(); return; }
    for (let i = 0; i < s.snake.length - 1; i++) { if (s.snake[i].x === nh.x && s.snake[i].y === nh.y) { s.dead = true; gameOver(); return; } }
    s.prev = s.snake.map((p) => ({ ...p }));
    s.snake.unshift(nh);
    let ate = false;
    if (nh.x === s.food.x && nh.y === s.food.y) {
      ate = true; s.score += 1; SFX.eat();
      s.food = emptyCell(s.snake, s.food, s.treasure);
    } else if (s.treasure && nh.x === s.treasure.x && nh.y === s.treasure.y) {
      ate = true; s.score += TREASURE_VALUE; SFX.treasure(); s.treasure = null;
    }
    if (ate) {
      s.grew = true; setScore(s.score);
      const nl = levelFor(s.score);
      if (nl > s.level) {
        s.level = nl; setLevel(nl); SFX.level();
        if (!s.treasure) s.treasure = { ...emptyCell(s.snake, s.food, null), exp: performance.now() + TREASURE_TTL };
      }
      s.step = stepFor(s.level);
    } else {
      s.grew = false; s.snake.pop();
    }
  };

  // main loop
  useEffect(() => {
    let last = performance.now();
    const loop = (now) => {
      const dt = Math.min(now - last, 100); last = now; timeRef.current += dt / 1000;
      const s = st.current;
      if (running && s && phase === "playing") {
        s.acc += dt;
        let steps = 0;
        while (s.acc >= s.step && steps < 4) { s.acc -= s.step; tick(); steps++; if (s.dead) break; }
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
    // elegant indigo gradient
    const g = c.createLinearGradient(0, 0, 0, SIZE);
    g.addColorStop(0, "#1e1b4b"); g.addColorStop(0.5, "#312e81"); g.addColorStop(1, "#4c1d95");
    c.fillStyle = g; c.fillRect(0, 0, SIZE, SIZE);
    // soft radial glow
    const rg = c.createRadialGradient(SIZE / 2, SIZE * 0.42, 18, SIZE / 2, SIZE * 0.42, SIZE * 0.72);
    rg.addColorStop(0, "rgba(167,139,250,0.22)"); rg.addColorStop(1, "rgba(13,10,40,0)");
    c.fillStyle = rg; c.fillRect(0, 0, SIZE, SIZE);
    // faint grid
    c.strokeStyle = "rgba(255,255,255,0.05)"; c.lineWidth = 1;
    for (let i = 1; i < GRID; i++) {
      c.beginPath(); c.moveTo(i * CELL, 0); c.lineTo(i * CELL, SIZE); c.stroke();
      c.beginPath(); c.moveTo(0, i * CELL); c.lineTo(SIZE, i * CELL); c.stroke();
    }
    // drifting ambient particles
    const time = timeRef.current;
    for (let i = 0; i < 7; i++) {
      const px = SIZE * (((i * 0.37) + time * (0.04 + i * 0.01)) % 1);
      const py = SIZE * (((i * 0.53) + time * (0.03 + i * 0.012)) % 1);
      c.fillStyle = `rgba(196,181,253,${0.10 + (i % 3) * 0.04})`;
      c.beginPath(); c.arc(px, py, 2 + (i % 2), 0, Math.PI * 2); c.fill();
    }
    // food (apple)
    if (s) drawApple(c, s.food.x * CELL + CELL / 2, s.food.y * CELL + CELL / 2);
    // treasure (gem)
    if (s && s.treasure) {
      const pulse = 0.85 + Math.sin(time * 6) * 0.15;
      drawGem(c, s.treasure.x * CELL + CELL / 2, s.treasure.y * CELL + CELL / 2, pulse);
    }
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
    // elegant inner frame
    c.strokeStyle = "rgba(167,139,250,0.55)"; c.lineWidth = 3; c.strokeRect(1.5, 1.5, SIZE - 3, SIZE - 3);
  };

  function drawApple(c, x, y) {
    c.fillStyle = "#f43f5e"; c.beginPath(); c.arc(x, y, CELL * 0.32, 0, Math.PI * 2); c.fill();
    c.fillStyle = "rgba(255,255,255,0.5)"; c.beginPath(); c.arc(x - 3, y - 3, CELL * 0.1, 0, Math.PI * 2); c.fill();
    c.strokeStyle = "#a16207"; c.lineWidth = 2; c.beginPath(); c.moveTo(x, y - CELL * 0.3); c.lineTo(x, y - CELL * 0.42); c.stroke();
    c.fillStyle = "#34d399"; c.beginPath(); c.ellipse(x + 4, y - CELL * 0.38, 4, 2, -0.6, 0, Math.PI * 2); c.fill();
  }
  function drawGem(c, x, y, pulse = 1) {
    c.save(); c.translate(x, y); c.scale(pulse, pulse);
    const gl = c.createRadialGradient(0, 0, 2, 0, 0, CELL * 0.5);
    gl.addColorStop(0, "rgba(34,211,238,0.5)"); gl.addColorStop(1, "rgba(34,211,238,0)");
    c.fillStyle = gl; c.beginPath(); c.arc(0, 0, CELL * 0.5, 0, Math.PI * 2); c.fill();
    c.fillStyle = "#22d3ee"; c.beginPath();
    c.moveTo(0, -CELL * 0.34); c.lineTo(CELL * 0.27, 0); c.lineTo(0, CELL * 0.34); c.lineTo(-CELL * 0.27, 0); c.closePath(); c.fill();
    c.fillStyle = "rgba(255,255,255,0.4)"; c.beginPath();
    c.moveTo(0, -CELL * 0.34); c.lineTo(CELL * 0.27, 0); c.lineTo(0, 0); c.closePath(); c.fill();
    c.fillStyle = "rgba(255,255,255,0.22)"; c.beginPath();
    c.moveTo(0, -CELL * 0.34); c.lineTo(-CELL * 0.27, 0); c.lineTo(0, 0); c.closePath(); c.fill();
    c.strokeStyle = "rgba(255,255,255,0.7)"; c.lineWidth = 1.2; c.beginPath();
    c.moveTo(0, -CELL * 0.34); c.lineTo(CELL * 0.27, 0); c.lineTo(0, CELL * 0.34); c.lineTo(-CELL * 0.27, 0); c.closePath(); c.stroke();
    c.restore();
  }
  function drawSeg(c, x, y, isHead, dir, i, len) {
    const r = isHead ? CELL * 0.44 : CELL * 0.4;
    c.fillStyle = isHead ? "#34d399" : `hsl(${160 - (i / len) * 30}, ${65 - (i / len) * 12}%, ${52 - (i / len) * 14}%)`;
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
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-violet-500/15 border border-violet-400/30">
          <Gem className="w-3.5 h-3.5 text-cyan-300" />
          <span className="text-muted-foreground">{t("Level")}: </span><span className="font-extrabold text-violet-300 tabular-nums">{level}</span>
        </div>
        <div><span className="text-muted-foreground">{t("Best")}: </span><span className="font-extrabold text-amber-500 tabular-nums">{best}</span></div>
      </div>

      <div className="relative rounded-2xl overflow-hidden border border-violet-500/40 shadow-xl shadow-violet-900/40" style={{ width: "min(92vw, 360px)", height: "min(92vw, 360px)" }}>
        <canvas ref={canvasRef} onTouchStart={onTouchStart} onTouchMove={onTouchMove} style={{ width: "100%", height: "100%", display: "block", touchAction: "none" }} />
        <AnimatePresence>
          {phase === "ready" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-background/85 backdrop-blur-sm flex flex-col items-center justify-center gap-4 p-6 text-center">
              <div className="text-2xl font-extrabold text-foreground">{t("Snake")}</div>
              <p className="text-sm text-muted-foreground max-w-[280px]">{t("Swipe or arrows to steer. Eat the fruit and gems to grow — don't hit the walls or yourself!")}</p>
              <Button onClick={newGame} className="bg-primary text-primary-foreground rounded-2xl px-8 py-5 text-base font-bold"><Play className="w-5 h-5 mr-2" />{t("Start")}</Button>
            </motion.div>
          )}
          {phase === "over" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-background/85 backdrop-blur-sm flex flex-col items-center justify-center gap-4 text-center">
              <Trophy className="w-9 h-9 text-amber-400" />
              <div className="text-2xl font-extrabold text-destructive">{t("Game Over")}</div>
              <div className="text-sm text-muted-foreground">{t("Score")}: <span className="font-bold text-foreground">{score}</span> · {t("Level")}: <span className="font-bold text-violet-300">{level}</span> · {t("Best")}: <span className="font-bold text-amber-500">{best}</span></div>
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