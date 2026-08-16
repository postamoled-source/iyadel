import { useState, useEffect, useRef, useCallback } from "react";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { RotateCcw, Play, Crosshair } from "lucide-react";
import { playLaunch, playBounce, playPop, playGameOver, playStart, resumeAudio } from "@/lib/game-sounds";

const LOGO_URL = "https://media.base44.com/images/public/6a7e76e3396b41955b675542/307ba8fe6_generated_image.png";
const W = 320, H = 440;
const GAME_SECONDS = 30;
const GRAVITY = 0.15;
const DRAG = 0.998;
const BALL_R = 7;
const MIN_SPEED = 6;
const MAX_SPEED = 13;
const CHARGE_MS = 700;
const TARGET_COUNT = 12;
const COLORS = ["#5b3aa8", "#f5a623", "#e0533a", "#2a9d8f", "#3a6ea5"];
const rand = (a, b) => a + Math.random() * (b - a);
// Canvas APIs can't parse CSS variables like "hsl(var(--card))", so resolve
// the token to its computed HSL channels at draw time.
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
  const [phase, setPhase] = useState("idle");
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_SECONDS);
  const [best, setBest] = useState(() => {
    try { return parseInt(localStorage.getItem("ballLauncherBest") || "0", 10) || 0; } catch { return 0; }
  });

  const phaseRef = useRef("idle");
  const scoreRef = useRef(0);
  const timeRef = useRef(GAME_SECONDS);
  const ballsRef = useRef([]);
  const targetsRef = useRef([]);
  const aimRef = useRef(-Math.PI / 2);
  const chargingRef = useRef(false);
  const chargeStartRef = useRef(0);
  const powerRef = useRef(0);
  const rafRef = useRef(null);
  const countdownRef = useRef(null);

  const spawnTarget = useCallback(() => {
    const r = rand(14, 20);
    targetsRef.current.push({
      x: rand(r + 8, W - r - 8), y: rand(42, 170), r,
      vx: rand(-1.1, 1.1) || 0.6,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
    });
  }, []);

  const resetTargets = useCallback(() => {
    targetsRef.current = [];
    for (let i = 0; i < TARGET_COUNT; i++) spawnTarget();
  }, [spawnTarget]);

  const stopLoop = () => {
    if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
    if (countdownRef.current) { clearInterval(countdownRef.current); countdownRef.current = null; }
  };

  const finish = useCallback(() => {
    phaseRef.current = "over"; setPhase("over");
    stopLoop(); ballsRef.current = []; chargingRef.current = false;
    playGameOver();
    setBest((b) => { const nb = Math.max(b, scoreRef.current); try { localStorage.setItem("ballLauncherBest", String(nb)); } catch {} return nb; });
  }, []);

  const drawBg = (ctx) => {
    // sky
    const sky = ctx.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0, "#bfe3ff");
    sky.addColorStop(0.6, "#e8f4ff");
    sky.addColorStop(1, "#f3ead3");
    ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H);
    // sun
    const sun = ctx.createRadialGradient(W - 56, 58, 5, W - 56, 58, 42);
    sun.addColorStop(0, "rgba(255,236,170,0.95)");
    sun.addColorStop(1, "rgba(255,236,170,0)");
    ctx.fillStyle = sun; ctx.beginPath(); ctx.arc(W - 56, 58, 42, 0, Math.PI * 2); ctx.fill();
    // clouds
    ctx.fillStyle = "rgba(255,255,255,0.9)";
    cloud(ctx, 64, 78, 22); cloud(ctx, 200, 46, 18); cloud(ctx, 250, 120, 14);
    // far hills
    ctx.fillStyle = "#a8d48a";
    ctx.beginPath(); ctx.moveTo(0, H - 26);
    ctx.quadraticCurveTo(W * 0.25, H - 130, W * 0.5, H - 64);
    ctx.quadraticCurveTo(W * 0.78, H - 8, W, H - 72); ctx.lineTo(W, H - 26); ctx.closePath(); ctx.fill();
    // near hills
    ctx.fillStyle = "#8cc46f";
    ctx.beginPath(); ctx.moveTo(0, H - 26);
    ctx.quadraticCurveTo(W * 0.35, H - 78, W * 0.7, H - 44);
    ctx.quadraticCurveTo(W * 0.88, H - 26, W, H - 34); ctx.lineTo(W, H - 26); ctx.closePath(); ctx.fill();
    // grass ground
    ctx.fillStyle = "#5fa04a"; ctx.fillRect(0, H - 26, W, 26);
    ctx.strokeStyle = "rgba(255,255,255,0.18)"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, H - 26); ctx.lineTo(W, H - 26); ctx.stroke();
    // grass blades
    ctx.strokeStyle = "rgba(255,255,255,0.25)"; ctx.lineWidth = 1;
    for (let i = 0; i < 14; i++) {
      const gx = i * (W / 14) + 6;
      ctx.beginPath(); ctx.moveTo(gx, H - 26); ctx.lineTo(gx + 1, H - 31); ctx.stroke();
    }
  };

  const drawBubble = (ctx, tg) => {
    ctx.beginPath(); ctx.arc(tg.x, tg.y, tg.r, 0, Math.PI * 2);
    ctx.fillStyle = tg.color; ctx.globalAlpha = 0.85; ctx.fill();
    ctx.globalAlpha = 1;
    ctx.beginPath(); ctx.arc(tg.x - tg.r * 0.3, tg.y - tg.r * 0.3, tg.r * 0.28, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,255,255,0.55)"; ctx.fill();
    ctx.lineWidth = 2; ctx.strokeStyle = "rgba(0,0,0,0.12)"; ctx.beginPath(); ctx.arc(tg.x, tg.y, tg.r, 0, Math.PI * 2); ctx.stroke();
  };

  const drawBall = (ctx, b) => {
    const g = ctx.createRadialGradient(b.x - 2, b.y - 2, 1, b.x, b.y, BALL_R);
    g.addColorStop(0, "#fde68a"); g.addColorStop(1, "#f5a623");
    ctx.beginPath(); ctx.arc(b.x, b.y, BALL_R, 0, Math.PI * 2);
    ctx.fillStyle = g; ctx.fill();
    ctx.strokeStyle = "rgba(0,0,0,0.2)"; ctx.lineWidth = 1; ctx.stroke();
  };

  const drawCannon = (ctx) => {
    const bx = W / 2, by = H - 40;
    const ang = aimRef.current;
    // barrel
    ctx.save(); ctx.translate(bx, by); ctx.rotate(ang);
    ctx.fillStyle = hsl("--primary");
    ctx.fillRect(0, -7, 26, 14);
    ctx.fillStyle = hsl("--accent"); ctx.fillRect(22, -9, 5, 18);
    ctx.restore();
    // base
    ctx.beginPath(); ctx.arc(bx, by, 16, 0, Math.PI * 2);
    ctx.fillStyle = hsl("--primary"); ctx.fill();
    ctx.strokeStyle = hsl("--accent"); ctx.lineWidth = 3; ctx.stroke();
    ctx.beginPath(); ctx.arc(bx, by, 6, 0, Math.PI * 2); ctx.fillStyle = hsl("--accent"); ctx.fill();
  };

  const drawAim = (ctx) => {
    if (!chargingRef.current || phaseRef.current !== "running") return;
    const bx = W / 2, by = H - 40; const ang = aimRef.current;
    const p = powerRef.current;
    // aim line length and color scale with charge power
    const len = 60 + p * 120;
    ctx.save(); ctx.strokeStyle = hslA(p > 0.7 ? "--accent" : "--primary", 0.35 + p * 0.5); ctx.lineWidth = 2 + p * 4;
    ctx.setLineDash([4, 6]); ctx.beginPath(); ctx.moveTo(bx, by);
    ctx.lineTo(bx + Math.cos(ang) * len, by + Math.sin(ang) * len); ctx.stroke(); ctx.restore();
    // power bar above the cannon base
    const bw = 54, bh = 6; const bx0 = bx - bw / 2, by0 = by + 20;
    ctx.fillStyle = hslA("--border", 0.6); ctx.fillRect(bx0, by0, bw, bh);
    ctx.fillStyle = p > 0.7 ? hsl("--accent") : hsl("--primary"); ctx.fillRect(bx0, by0, bw * p, bh);
  };

  const loop = useCallback(() => {
    const cv = canvasRef.current;
    if (!cv || phaseRef.current !== "running") return;
    const ctx = cv.getContext("2d");
    ctx.clearRect(0, 0, W, H);
    drawBg(ctx);
    const targets = targetsRef.current;
    for (const tg of targets) {
      tg.x += tg.vx;
      if (tg.x < tg.r + 6) { tg.x = tg.r + 6; tg.vx *= -1; }
      if (tg.x > W - tg.r - 6) { tg.x = W - tg.r - 6; tg.vx *= -1; }
      drawBubble(ctx, tg);
    }
    const balls = ballsRef.current;
    for (let i = balls.length - 1; i >= 0; i--) {
      const b = balls[i];
      b.vy += GRAVITY; b.vx *= DRAG; b.vy *= DRAG; b.x += b.vx; b.y += b.vy;
      if (b.x < BALL_R) { b.x = BALL_R; b.vx = Math.abs(b.vx) * 0.8; playBounce(); }
      if (b.x > W - BALL_R) { b.x = W - BALL_R; b.vx = -Math.abs(b.vx) * 0.8; playBounce(); }
      if (b.y < BALL_R) { b.y = BALL_R; b.vy = Math.abs(b.vy) * 0.8; playBounce(); }
      if (b.y > H + 30) { balls.splice(i, 1); continue; }
      let popped = false;
      for (let j = targets.length - 1; j >= 0; j--) {
        const tg = targets[j]; const dx = b.x - tg.x, dy = b.y - tg.y; const rr = BALL_R + tg.r;
        if (dx * dx + dy * dy < rr * rr) {
          targets.splice(j, 1); popped = true;
          scoreRef.current += 10; setScore(scoreRef.current);
          playPop(); spawnTarget(); break;
        }
      }
      if (popped) { balls.splice(i, 1); continue; }
      drawBall(ctx, b);
    }
    if (chargingRef.current) {
      powerRef.current = Math.min(1, (performance.now() - chargeStartRef.current) / CHARGE_MS);
    }
    drawCannon(ctx); drawAim(ctx);
    rafRef.current = requestAnimationFrame(loop);
  }, [spawnTarget]);

  const start = useCallback(() => {
    resumeAudio(); stopLoop();
    scoreRef.current = 0; timeRef.current = GAME_SECONDS;
    setScore(0); setTimeLeft(GAME_SECONDS);
    ballsRef.current = []; resetTargets();
    phaseRef.current = "running"; setPhase("running");
    playStart();
    countdownRef.current = setInterval(() => {
      timeRef.current -= 1; setTimeLeft(timeRef.current);
      if (timeRef.current <= 0) finish();
    }, 1000);
    rafRef.current = requestAnimationFrame(loop);
  }, [loop, resetTargets, finish]);

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
  const fire = () => {
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

  return (
    <div className="select-none">
      <div className="flex flex-col items-center mb-4">
        <img src={LOGO_URL} alt={t("Ball Launcher")} className="w-16 h-16 rounded-2xl object-contain drop-shadow-md" />
      </div>
      <div className="flex items-center justify-between mb-4 gap-3">
        <div className="flex gap-2.5">
          <Stat label={t("Score")} value={score} className="text-primary" />
          <Stat label={t("Time")} value={`${timeLeft}s`} className="text-foreground" />
          <Stat label={t("Best")} value={best} className="text-accent" />
        </div>
        {!running && (
          <Button onClick={start} className="rounded-2xl px-4 py-4 shrink-0">
            <Play className="w-4 h-4 mr-2" />{over ? t("Play again") : t("Start")}
          </Button>
        )}
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
          className="rounded-3xl border border-border touch-none"
          style={{ width: "min(86vw, 340px)", height: "auto", aspectRatio: `${W} / ${H}` }}
        />

        {!running && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-background/80 backdrop-blur-sm rounded-3xl animate-[fadeIn_0.3s_ease-out] p-6 text-center">
            {over ? (
              <>
                <Crosshair className="w-9 h-9 text-accent" />
                <div className="text-xl font-extrabold text-foreground">{t("Time's up!")}</div>
                <div className="text-sm text-muted-foreground">
                  {t("Score")}: <span className="font-bold text-primary">{score}</span> · {t("Best")}:{" "}
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
                  {t("Tap & aim to launch balls at the bubbles — 30 seconds!")}
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
          {t("Tap & aim to launch balls at the bubbles — 30 seconds!")}
        </p>
      )}
    </div>
  );
}

function Stat({ label, value, className }) {
  return (
    <div className="rounded-2xl bg-card border border-border px-3.5 py-2 text-center min-w-[64px]">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={`text-xl font-extrabold tabular-nums ${className || ""}`}>{value}</div>
    </div>
  );
}