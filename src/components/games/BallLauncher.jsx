import { useState, useEffect, useRef, useCallback } from "react";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { RotateCcw, Play, Crosshair, Trophy, ChevronRight } from "lucide-react";
import { playLaunch, playBounce, playGameOver, playStart, playWin, resumeAudio, playBubblePop } from "@/lib/game-sounds";
import GameMusicButton from "@/components/games/GameMusicButton";

const LOGO_URL = "https://media.base44.com/images/public/6a7e76e3396b41955b675542/307ba8fe6_generated_image.png";
const W = 320, H = 440;
const GRAVITY = 0.17;
const DRAG = 0.997;
const BALL_R = 8;
const MIN_SPEED = 7;
const MAX_SPEED = 16;
const CHARGE_MS = 620;
const MAX_BALLS = 14;
// Per-level difficulty: required pops, time (s), balloon speed multiplier, balloon count.
const levelConfig = (lvl) => ({
  level: lvl,
  required: Math.min(6 + (lvl - 1) * 3, 24),
  time: Math.max(16, 30 - (lvl - 1) * 2),
  speed: 1 + (lvl - 1) * 0.16,
  count: Math.min(10 + (lvl - 1), 18),
});
// Glossy balloon palette: [base, light, dark] for 3D radial shading.
const BALLOONS = [
  ["#fca5a5", "#fecaca", "#b91c1c"],
  ["#fcd34d", "#fef3c7", "#b45309"],
  ["#93c5fd", "#dbeafe", "#1d4ed8"],
  ["#86efac", "#bbf7d0", "#15803d"],
  ["#d8b4fe", "#ede9fe", "#6d28d9"],
  ["#f9a8d4", "#fce7f3", "#be185d"],
];
const rand = (a, b) => a + Math.random() * (b - a);
const cssVar = (name) => window.getComputedStyle(document.documentElement).getPropertyValue(name).trim();
const hsl = (name) => `hsl(${cssVar(name)})`;
const hslA = (name, a) => `hsl(${cssVar(name)} / ${a})`;
const cloud = (ctx, x, y, r) => {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.arc(x + r * 0.9, y + r * 0.2, r * 0.8, 0, Math.PI * 2);
  ctx.arc(x - r * 0.9, y + r * 0.2, r * 0.75, 0, Math.PI * 2);
  ctx.arc(x + r * 0.3, y - r * 0.5, r * 0.7, 0, Math.PI * 2);
  ctx.fill();
};

export default function BallLauncher() {
  const { t } = useI18n();
  const canvasRef = useRef(null);
  const [phase, setPhase] = useState("idle"); // idle | running | levelComplete | over
  const [level, setLevel] = useState(1);
  const [pops, setPops] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [best, setBest] = useState(() => {
    try { return parseInt(localStorage.getItem("ballLauncherBest") || "0", 10) || 0; } catch { return 0; }
  });

  const phaseRef = useRef("idle");
  const levelRef = useRef(1);
  const popsRef = useRef(0);
  const scoreRef = useRef(0);
  const timeRef = useRef(0);
  const ballsRef = useRef([]);
  const targetsRef = useRef([]);
  const particlesRef = useRef([]);
  const aimRef = useRef(-Math.PI / 2);
  const chargingRef = useRef(false);
  const chargeStartRef = useRef(0);
  const powerRef = useRef(0);
  const rafRef = useRef(null);
  const countdownRef = useRef(null);

  const cfg = levelConfig(level);

  const spawnTarget = useCallback(() => {
    const r = rand(15, 22);
    const pal = BALLOONS[Math.floor(Math.random() * BALLOONS.length)];
    const sp = levelConfig(levelRef.current).speed;
    targetsRef.current.push({
      x: rand(r + 8, W - r - 8), y: rand(46, 176), r,
      vx: (rand(-1.4, 1.4) || 0.7) * sp,
      vy: (rand(-0.25, 0.25)) * sp,
      bob: rand(0, Math.PI * 2),
      pal, tilt: 0,
    });
  }, []);

  const resetTargets = useCallback(() => {
    const count = levelConfig(levelRef.current).count;
    targetsRef.current = [];
    for (let i = 0; i < count; i++) spawnTarget();
  }, [spawnTarget]);

  const stopLoop = () => {
    if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
    if (countdownRef.current) { clearInterval(countdownRef.current); countdownRef.current = null; }
  };

  // ---- Background with depth ----
  const drawBg = (ctx) => {
    const sky = ctx.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0, "#a8d8ff");
    sky.addColorStop(0.55, "#e8f4ff");
    sky.addColorStop(1, "#f3ead3");
    ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H);
    const sun = ctx.createRadialGradient(W - 56, 58, 5, W - 56, 58, 50);
    sun.addColorStop(0, "rgba(255,240,180,0.95)");
    sun.addColorStop(0.6, "rgba(255,236,170,0.35)");
    sun.addColorStop(1, "rgba(255,236,170,0)");
    ctx.fillStyle = sun; ctx.beginPath(); ctx.arc(W - 56, 58, 50, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.85)";
    cloud(ctx, 64, 78, 22); cloud(ctx, 200, 46, 18); cloud(ctx, 250, 120, 14);
    ctx.fillStyle = "rgba(168,212,138,0.85)";
    ctx.beginPath(); ctx.moveTo(0, H - 26);
    ctx.quadraticCurveTo(W * 0.25, H - 130, W * 0.5, H - 64);
    ctx.quadraticCurveTo(W * 0.78, H - 8, W, H - 72); ctx.lineTo(W, H - 26); ctx.closePath(); ctx.fill();
    const hg = ctx.createLinearGradient(0, H - 90, 0, H - 26);
    hg.addColorStop(0, "#9bd07a"); hg.addColorStop(1, "#6fae50");
    ctx.fillStyle = hg;
    ctx.beginPath(); ctx.moveTo(0, H - 26);
    ctx.quadraticCurveTo(W * 0.35, H - 78, W * 0.7, H - 44);
    ctx.quadraticCurveTo(W * 0.88, H - 26, W, H - 34); ctx.lineTo(W, H - 26); ctx.closePath(); ctx.fill();
    const gg = ctx.createLinearGradient(0, H - 26, 0, H);
    gg.addColorStop(0, "#6cb24a"); gg.addColorStop(1, "#3e7a2e");
    ctx.fillStyle = gg; ctx.fillRect(0, H - 26, W, 26);
    ctx.strokeStyle = "rgba(255,255,255,0.25)"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, H - 26); ctx.lineTo(W, H - 26); ctx.stroke();
    ctx.strokeStyle = "rgba(255,255,255,0.28)"; ctx.lineWidth = 1;
    for (let i = 0; i < 16; i++) {
      const gx = i * (W / 16) + 6;
      ctx.beginPath(); ctx.moveTo(gx, H - 26); ctx.lineTo(gx + 1, H - 32); ctx.stroke();
    }
    const vg = ctx.createRadialGradient(W / 2, H / 2, H * 0.35, W / 2, H / 2, H * 0.72);
    vg.addColorStop(0, "rgba(0,0,0,0)"); vg.addColorStop(1, "rgba(0,0,0,0.18)");
    ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
  };

  const drawBalloon = (ctx, tg) => {
    const { x, y, r, pal, tilt } = tg;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(tilt);
    ctx.save();
    ctx.translate(r * 0.12, r * 0.18);
    ctx.beginPath(); ctx.ellipse(0, 0, r * 0.96, r, 0, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(0,0,0,0.12)"; ctx.fill();
    ctx.restore();
    const g = ctx.createRadialGradient(-r * 0.35, -r * 0.4, r * 0.1, 0, 0, r);
    g.addColorStop(0, pal[1]); g.addColorStop(0.45, pal[0]); g.addColorStop(1, pal[2]);
    ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fillStyle = g; ctx.fill();
    ctx.beginPath(); ctx.arc(0, 0, r - 1, Math.PI * 0.1, Math.PI * 0.6);
    ctx.strokeStyle = "rgba(255,255,255,0.35)"; ctx.lineWidth = 1.6; ctx.stroke();
    ctx.beginPath(); ctx.ellipse(-r * 0.34, -r * 0.38, r * 0.26, r * 0.16, -0.6, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,255,255,0.7)"; ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-3, r - 1); ctx.lineTo(3, r - 1); ctx.lineTo(0, r + 4); ctx.closePath();
    ctx.fillStyle = pal[2]; ctx.fill();
    ctx.restore();
  };

  const drawBall = (ctx, b) => {
    const g = ctx.createRadialGradient(b.x - 3, b.y - 3, 1, b.x + 1, b.y + 1, BALL_R);
    g.addColorStop(0, "#fff7d6"); g.addColorStop(0.4, "#fbbf24"); g.addColorStop(1, "#9a3412");
    ctx.beginPath(); ctx.arc(b.x, b.y, BALL_R, 0, Math.PI * 2);
    ctx.fillStyle = g; ctx.fill();
    ctx.strokeStyle = "rgba(120,53,15,0.5)"; ctx.lineWidth = 1; ctx.stroke();
    ctx.beginPath(); ctx.arc(b.x - 2.6, b.y - 2.6, BALL_R * 0.28, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,255,255,0.85)"; ctx.fill();
  };

  const drawCannon = (ctx) => {
    const bx = W / 2, by = H - 40;
    const ang = aimRef.current;
    ctx.beginPath(); ctx.ellipse(bx, by + 14, 22, 6, 0, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(0,0,0,0.2)"; ctx.fill();
    ctx.save(); ctx.translate(bx, by); ctx.rotate(ang);
    const bg = ctx.createLinearGradient(0, -9, 0, 9);
    bg.addColorStop(0, hslA("--primary", 0.85));
    bg.addColorStop(0.5, hsl("--primary"));
    bg.addColorStop(1, hslA("--primary", 0.7));
    ctx.fillStyle = bg; ctx.fillRect(0, -9, 30, 18);
    ctx.fillStyle = "rgba(255,255,255,0.3)"; ctx.fillRect(0, -9, 30, 4);
    ctx.fillStyle = hsl("--accent"); ctx.fillRect(26, -10, 5, 20);
    ctx.fillStyle = "rgba(0,0,0,0.35)";
    ctx.beginPath(); ctx.ellipse(30, 0, 2.4, 9, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    const cg = ctx.createRadialGradient(bx - 5, by - 5, 2, bx, by, 17);
    cg.addColorStop(0, hslA("--primary", 0.9)); cg.addColorStop(0.7, hsl("--primary")); cg.addColorStop(1, hslA("--primary", 0.6));
    ctx.beginPath(); ctx.arc(bx, by, 16, 0, Math.PI * 2);
    ctx.fillStyle = cg; ctx.fill();
    ctx.strokeStyle = hsl("--accent"); ctx.lineWidth = 3; ctx.stroke();
    const hg = ctx.createRadialGradient(bx - 1, by - 1, 1, bx, by, 6);
    hg.addColorStop(0, hsl("--accent")); hg.addColorStop(1, "#92400e");
    ctx.beginPath(); ctx.arc(bx, by, 6, 0, Math.PI * 2); ctx.fillStyle = hg; ctx.fill();
    ctx.beginPath(); ctx.arc(bx - 1.5, by - 1.5, 1.8, 0, Math.PI * 2); ctx.fillStyle = "rgba(255,255,255,0.6)"; ctx.fill();
  };

  const drawAim = (ctx) => {
    if (!chargingRef.current || phaseRef.current !== "running") return;
    const bx = W / 2, by = H - 40; const ang = aimRef.current;
    const p = powerRef.current;
    const len = 60 + p * 130;
    ctx.save();
    ctx.strokeStyle = hslA(p > 0.7 ? "--accent" : "--primary", 0.35 + p * 0.5); ctx.lineWidth = 2 + p * 4;
    ctx.setLineDash([4, 6]); ctx.beginPath(); ctx.moveTo(bx, by);
    ctx.lineTo(bx + Math.cos(ang) * len, by + Math.sin(ang) * len); ctx.stroke(); ctx.restore();
    const bw = 54, bh = 6; const bx0 = bx - bw / 2, by0 = by + 20;
    ctx.fillStyle = hslA("--border", 0.6); ctx.fillRect(bx0, by0, bw, bh);
    ctx.fillStyle = p > 0.7 ? hsl("--accent") : hsl("--primary"); ctx.fillRect(bx0, by0, bw * p, bh);
  };

  const spawnParticles = (x, y, pal) => {
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2 + rand(-0.2, 0.2);
      const sp = rand(1.5, 4);
      particlesRef.current.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 1, r: rand(2, 4.5), life: 1, pal });
    }
  };
  const drawParticles = (ctx) => {
    const ps = particlesRef.current;
    for (let i = ps.length - 1; i >= 0; i--) {
      const p = ps[i];
      p.vy += 0.12; p.vx *= 0.98; p.x += p.vx; p.y += p.vy; p.life -= 0.04;
      if (p.life <= 0) { ps.splice(i, 1); continue; }
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.pal[0]; ctx.fill();
    }
    ctx.globalAlpha = 1;
  };

  const loop = useCallback(() => {
    const cv = canvasRef.current;
    if (!cv || phaseRef.current !== "running") return;
    const ctx = cv.getContext("2d");
    ctx.clearRect(0, 0, W, H);
    drawBg(ctx);
    const targets = targetsRef.current;
    for (const tg of targets) {
      tg.x += tg.vx; tg.bob += 0.05;
      tg.y += tg.vy + Math.sin(tg.bob) * 0.12;
      tg.tilt = Math.sin(tg.bob) * 0.08;
      if (tg.x < tg.r + 6) { tg.x = tg.r + 6; tg.vx *= -1; }
      if (tg.x > W - tg.r - 6) { tg.x = W - tg.r - 6; tg.vx *= -1; }
      if (tg.y < 40) { tg.y = 40; tg.vy = Math.abs(tg.vy); }
      if (tg.y > 188) { tg.y = 188; tg.vy = -Math.abs(tg.vy); }
      drawBalloon(ctx, tg);
    }
    const balls = ballsRef.current;
    for (let i = balls.length - 1; i >= 0; i--) {
      const b = balls[i];
      b.vy += GRAVITY; b.vx *= DRAG; b.vy *= DRAG; b.x += b.vx; b.y += b.vy;
      if (b.x < BALL_R) { b.x = BALL_R; b.vx = Math.abs(b.vx) * 0.82; playBounce(); }
      if (b.x > W - BALL_R) { b.x = W - BALL_R; b.vx = -Math.abs(b.vx) * 0.82; playBounce(); }
      if (b.y < BALL_R) { b.y = BALL_R; b.vy = Math.abs(b.vy) * 0.82; playBounce(); }
      if (b.y > H + 30) { balls.splice(i, 1); continue; }
      let popped = false;
      for (let j = targets.length - 1; j >= 0; j--) {
        const tg = targets[j]; const dx = b.x - tg.x, dy = b.y - tg.y; const rr = BALL_R + tg.r;
        if (dx * dx + dy * dy < rr * rr) {
          spawnParticles(tg.x, tg.y, tg.pal);
          targets.splice(j, 1); popped = true;
          scoreRef.current += 10; setScore(scoreRef.current);
          popsRef.current += 1; setPops(popsRef.current);
          playBubblePop();
          // keep balloon count stable within the level
          if (targets.length < levelConfig(levelRef.current).count) spawnTarget();
          if (popsRef.current >= levelConfig(levelRef.current).required) {
            levelComplete();
          }
          break;
        }
      }
      if (popped) { balls.splice(i, 1); continue; }
      drawBall(ctx, b);
    }
    drawParticles(ctx);
    if (chargingRef.current) {
      powerRef.current = Math.min(1, (performance.now() - chargeStartRef.current) / CHARGE_MS);
    }
    drawCannon(ctx); drawAim(ctx);
    rafRef.current = requestAnimationFrame(loop);
  }, [spawnTarget]);

  const levelComplete = useCallback(() => {
    phaseRef.current = "levelComplete"; setPhase("levelComplete");
    stopLoop(); ballsRef.current = []; particlesRef.current = []; chargingRef.current = false;
    playWin();
    setBest((b) => { const nb = Math.max(b, scoreRef.current); try { localStorage.setItem("ballLauncherBest", String(nb)); } catch {} return nb; });
  }, []);

  const finishGame = useCallback(() => {
    phaseRef.current = "over"; setPhase("over");
    stopLoop(); ballsRef.current = []; particlesRef.current = []; chargingRef.current = false;
    playGameOver();
    setBest((b) => { const nb = Math.max(b, scoreRef.current); try { localStorage.setItem("ballLauncherBest", String(nb)); } catch {} return nb; });
  }, []);

  const startLevel = useCallback((lvl, keepScore) => {
    resumeAudio(); stopLoop();
    const c = levelConfig(lvl);
    levelRef.current = lvl; setLevel(lvl);
    popsRef.current = 0; setPops(0);
    if (!keepScore) { scoreRef.current = 0; setScore(0); }
    timeRef.current = c.time; setTimeLeft(c.time);
    ballsRef.current = []; particlesRef.current = []; resetTargets();
    phaseRef.current = "running"; setPhase("running");
    playStart();
    countdownRef.current = setInterval(() => {
      timeRef.current -= 1; setTimeLeft(timeRef.current);
      if (timeRef.current <= 0) finishGame();
    }, 1000);
    rafRef.current = requestAnimationFrame(loop);
  }, [loop, resetTargets]);

  const nextLevel = useCallback(() => {
    startLevel(levelRef.current + 1, true);
  }, [startLevel]);

  const start = useCallback(() => startLevel(1, false), [startLevel]);

  useEffect(() => () => stopLoop(), []);

  const toCanvas = (e) => {
    const cv = canvasRef.current; const rect = cv.getBoundingClientRect();
    return { x: (e.clientX - rect.left) * (W / rect.width), y: (e.clientY - rect.top) * (H / rect.height) };
  };
  const updateAim = (px, py) => {
    const by = H - 40; let ang = Math.atan2(py - by, px - W / 2);
    if (ang >= 0) ang = px < W / 2 ? -Math.PI + 0.15 : -0.15;
    ang = Math.max(-Math.PI + 0.15, Math.min(-0.15, ang));
    aimRef.current = ang;
  };
  const onDown = (e) => {
    e.preventDefault(); resumeAudio();
    if (phaseRef.current !== "running") return;
    const { x, y } = toCanvas(e); updateAim(x, y);
    chargingRef.current = true; chargeStartRef.current = performance.now(); powerRef.current = 0;
  };
  const onMove = (e) => {
    if (!chargingRef.current || phaseRef.current !== "running") return;
    const { x, y } = toCanvas(e); updateAim(x, y);
  };
  const onUp = (e) => {
    if (!chargingRef.current || phaseRef.current !== "running") return;
    if (e && e.clientX != null) { const { x, y } = toCanvas(e); updateAim(x, y); }
    chargingRef.current = false;
    fire();
  };
  // Fire a single ball — one shot per release.
  const fire = () => {
    if (ballsRef.current.length >= MAX_BALLS) { powerRef.current = 0; return; }
    const ang = aimRef.current; const bx = W / 2, by = H - 40;
    const speed = MIN_SPEED + powerRef.current * (MAX_SPEED - MIN_SPEED);
    ballsRef.current.push({
      x: bx + Math.cos(ang) * 24, y: by + Math.sin(ang) * 24,
      vx: Math.cos(ang) * speed, vy: Math.sin(ang) * speed,
    });
    powerRef.current = 0;
    playLaunch();
  };

  const running = phase === "running";
  const over = phase === "over";
  const done = phase === "levelComplete";
  const req = cfg.required;

  return (
    <div className="select-none">
      <div className="flex flex-col items-center mb-4">
        <img src={LOGO_URL} alt={t("Ball Launcher")} className="w-16 h-16 rounded-2xl object-contain drop-shadow-md" />
      </div>
      <div className="flex items-center justify-between mb-4 gap-3">
        <div className="flex gap-2.5 flex-wrap">
          <Stat label={t("Level")} value={level} className="text-accent" />
          <Stat label={t("Balloons")} value={`${pops}/${req}`} className="text-primary" />
          <Stat label={t("Time")} value={`${timeLeft}s`} className="text-foreground" />
          <Stat label={t("Score")} value={score} className="text-primary" />
        </div>
        <div className="flex items-center gap-2">
          {!running && !done && (
            <Button onClick={start} className="rounded-2xl px-4 py-4 shrink-0">
              <Play className="w-4 h-4 mr-2" />{over ? t("Play again") : t("Start")}
            </Button>
          )}
          <GameMusicButton theme="balllauncher" />
        </div>
      </div>

      <div className="relative mx-auto w-fit">
        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerLeave={onUp}
          className="rounded-3xl border border-border touch-none shadow-[0_18px_40px_-18px_hsl(var(--primary)/0.5)]"
          style={{ width: "min(86vw, 340px)", height: "auto", aspectRatio: `${W} / ${H}` }}
        />

        {!running && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-background/80 backdrop-blur-sm rounded-3xl animate-[fadeIn_0.3s_ease-out] p-6 text-center">
            {done ? (
              <>
                <Trophy className="w-10 h-10 text-accent" />
                <div className="text-xl font-extrabold text-foreground">{t("Level")} {level} {t("Complete!")}</div>
                <div className="text-sm text-muted-foreground">
                  {t("Score")}: <span className="font-bold text-primary">{score}</span>
                </div>
                <Button onClick={nextLevel} className="bg-primary text-primary-foreground rounded-2xl px-6 py-5">
                  {t("Next Level")} <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </>
            ) : over ? (
              <>
                <Crosshair className="w-9 h-9 text-destructive" />
                <div className="text-xl font-extrabold text-foreground">{t("Time's up!")}</div>
                <div className="text-sm text-muted-foreground">
                  {t("Reached Level")} <span className="font-bold text-accent">{level}</span> · {t("Score")}:{" "}
                  <span className="font-bold text-primary">{score}</span> · {t("Best")}:{" "}
                  <span className="font-bold text-accent">{best}</span>
                </div>
                <Button onClick={start} className="bg-primary text-primary-foreground rounded-2xl px-6 py-5">
                  <RotateCcw className="w-4 h-4 mr-2" />{t("Play again")}
                </Button>
              </>
            ) : (
              <>
                <Crosshair className="w-10 h-10 text-primary" />
                <p className="text-sm text-muted-foreground max-w-[220px]">
                  {t("Pop the required balloons before time runs out to advance!")}
                </p>
                <Button onClick={start} className="bg-primary text-primary-foreground rounded-2xl px-8 py-5 text-base font-bold">
                  <Play className="w-4 h-4 mr-2" />{t("Start Game")}
                </Button>
              </>
            )}
          </div>
        )}
      </div>

      {running && (
        <p className="mt-5 text-center text-xs text-muted-foreground">
          {t("Pop")} {req} {t("balloons to pass the level")} · {t("Time left")}: {timeLeft}s
        </p>
      )}
    </div>
  );
}

function Stat({ label, value, className }) {
  return (
    <div className="rounded-2xl bg-card border border-border px-3 py-2 text-center min-w-[58px]">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={`text-lg font-extrabold tabular-nums ${className || ""}`}>{value}</div>
    </div>
  );
}