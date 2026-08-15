import { useState, useEffect, useRef, useCallback } from "react";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Hammer, RotateCcw, Trophy, Play } from "lucide-react";

const HOLES = 9;
const SECONDS = 30;

export default function WhackAMole() {
  const { t } = useI18n();
  const [phase, setPhase] = useState("idle"); // idle | running | over
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(SECONDS);
  const [moles, setMoles] = useState(() => Array(HOLES).fill(0));
  const [burst, setBurst] = useState({});
  const [best, setBest] = useState(() => {
    try { return parseInt(localStorage.getItem("whackBest") || "0", 10) || 0; } catch { return 0; }
  });

  const scoreRef = useRef(0);
  const timeRef = useRef(SECONDS);
  const loopRef = useRef(null);
  const hideTimers = useRef({});
  const molesRef = useRef(moles);

  useEffect(() => { molesRef.current = moles; }, [moles]);

  const clearHide = () => { Object.values(hideTimers.current).forEach(clearTimeout); hideTimers.current = {}; };

  const popMole = useCallback(() => {
    setMoles((prev) => {
      const empty = [];
      for (let i = 0; i < HOLES; i++) if (!prev[i]) empty.push(i);
      if (!empty.length) return prev;
      const idx = empty[Math.floor(Math.random() * empty.length)];
      const next = [...prev];
      next[idx] = 1;
      const ttl = 600 + Math.random() * 700;
      hideTimers.current[idx] = setTimeout(() => {
        setMoles((p) => { const n = [...p]; n[idx] = 0; return n; });
        delete hideTimers.current[idx];
      }, ttl);
      return next;
    });
  }, []);

  const finish = useCallback(() => {
    setPhase("over");
    setMoles(Array(HOLES).fill(0));
    clearHide();
    setBest((b) => {
      const nb = Math.max(b, scoreRef.current);
      try { localStorage.setItem("whackBest", String(nb)); } catch {}
      return nb;
    });
  }, []);

  const start = () => {
    clearHide();
    scoreRef.current = 0;
    timeRef.current = SECONDS;
    setScore(0);
    setTimeLeft(SECONDS);
    setMoles(Array(HOLES).fill(0));
    setBurst({});
    setPhase("running");
  };

  useEffect(() => {
    if (phase !== "running") return;
    const countdown = setInterval(() => {
      timeRef.current -= 1;
      setTimeLeft(timeRef.current);
      if (timeRef.current <= 0) {
        clearInterval(countdown);
        clearInterval(loopRef.current);
        loopRef.current = null;
        finish();
      }
    }, 1000);
    loopRef.current = setInterval(popMole, 720);
    return () => {
      clearInterval(countdown);
      if (loopRef.current) { clearInterval(loopRef.current); loopRef.current = null; }
      clearHide();
    };
  }, [phase, popMole, finish]);

  const whack = (i) => {
    if (phase !== "running" || !molesRef.current[i]) return;
    setMoles((prev) => { const n = [...prev]; n[i] = 0; return n; });
    if (hideTimers.current[i]) { clearTimeout(hideTimers.current[i]); delete hideTimers.current[i]; }
    setScore((s) => s + 1);
    scoreRef.current += 1;
    setBurst((b) => ({ ...b, [i]: i + "-" + Date.now() }));
    setTimeout(() => setBurst((b) => { const n = { ...b }; delete n[i]; return n; }), 350);
  };

  const running = phase === "running";
  const over = phase === "over";

  return (
    <div className="select-none">
      <div className="flex items-center justify-between mb-4 gap-3">
        <div className="flex gap-2.5">
          <div className="rounded-2xl bg-card border border-border px-3.5 py-2 text-center min-w-[64px]">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{t("Score")}</div>
            <div className="text-xl font-extrabold text-primary tabular-nums">{score}</div>
          </div>
          <div className="rounded-2xl bg-card border border-border px-3.5 py-2 text-center min-w-[64px]">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{t("Time")}</div>
            <div className="text-xl font-extrabold text-foreground tabular-nums">{timeLeft}s</div>
          </div>
          <div className="rounded-2xl bg-card border border-border px-3.5 py-2 text-center min-w-[64px]">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{t("Best")}</div>
            <div className="text-xl font-extrabold text-accent tabular-nums">{best}</div>
          </div>
        </div>
        {!running && (
          <Button onClick={start} className="rounded-2xl px-4 py-4 shrink-0">
            <Play className="w-4 h-4 mr-2" />{over ? t("Play again") : t("Start")}
          </Button>
        )}
      </div>

      <div className="relative mx-auto w-fit">
        <div
          className="grid grid-cols-3 gap-3 p-3 rounded-3xl bg-gradient-to-b from-primary/10 to-accent/10 border border-border"
          style={{ width: "min(86vw, 340px)" }}
        >
          {moles.map((up, i) => (
            <button
              key={i}
              onClick={() => whack(i)}
              aria-label={up ? t("Whack!") : ""}
              className="relative aspect-square rounded-2xl bg-secondary/80 border border-border overflow-hidden flex items-end justify-center active:scale-95 transition-transform"
            >
              <div className="absolute inset-x-3 bottom-3 h-1/4 rounded-[50%] bg-black/30" />
              <span
                className={`relative text-4xl pb-2 transition-all duration-150 ${
                  up ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-10 scale-50"
                }`}
              >
                🐹
              </span>
              {burst[i] && (
                <span
                  key={burst[i]}
                  className="absolute inset-0 flex items-center justify-center text-2xl pointer-events-none animate-[fadeIn_0.25s_ease-out]"
                >
                  ⭐
                </span>
              )}
            </button>
          ))}
        </div>

        {!running && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-background/80 backdrop-blur-sm rounded-3xl animate-[fadeIn_0.3s_ease-out] p-6 text-center">
            {over ? (
              <>
                <div className="flex items-center gap-2 text-2xl font-extrabold text-foreground">
                  <Trophy className="w-6 h-6 text-accent" /> {t("Time's up!")}
                </div>
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
                <Hammer className="w-10 h-10 text-primary" />
                <p className="text-sm text-muted-foreground max-w-[220px]">
                  {t("Tap the moles as fast as you can before they hide again — 30 seconds!")}
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
          {t("Tap the moles as fast as you can before they hide again — 30 seconds!")}
        </p>
      )}
    </div>
  );
}