import { useState, useEffect, useCallback, useRef } from "react";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Heart, Flame, Trophy, Play, RotateCcw, Check, X, Star, Languages } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import GameMusicButton from "@/components/games/GameMusicButton";
import { resumeAudio, playStart, playCorrect, playWrong, playGameOver, playWin, playShuffle } from "@/lib/game-sounds";

// قاعدة بيانات المفردات: الإنجليزية ↔ العربية
const VOCAB = [
  { en: "Apple", ar: "تفاحة" },
  { en: "Book", ar: "كتاب" },
  { en: "Cat", ar: "قطة" },
  { en: "Water", ar: "ماء" },
  { en: "School", ar: "مدرسة" },
  { en: "Sun", ar: "شمس" },
  { en: "Moon", ar: "قمر" },
  { en: "House", ar: "منزل" },
  { en: "Tree", ar: "شجرة" },
  { en: "Car", ar: "سيارة" },
  { en: "Friend", ar: "صديق" },
  { en: "Teacher", ar: "معلّم" },
  { en: "City", ar: "مدينة" },
  { en: "River", ar: "نهر" },
  { en: "Star", ar: "نجم" },
  { en: "Bird", ar: "طائر" },
  { en: "Door", ar: "باب" },
  { en: "Pen", ar: "قلم" },
  { en: "Chair", ar: "كرسي" },
  { en: "Bread", ar: "خبز" },
  { en: "Milk", ar: "حليب" },
  { en: "Dog", ar: "كلب" },
  { en: "Flower", ar: "زهرة" },
  { en: "Mountain", ar: "جبل" },
  { en: "Clock", ar: "ساعة" },
];

const MAX_LIVES = 3;
const LEVEL_GOAL = 5; // عدد الإجابات الصحيحة لكل مستوى
const shuffle = (arr) => arr.map((v) => [Math.random(), v]).sort((a, b) => a[0] - b[0]).map((v) => v[1]);
const sample = (arr, n) => shuffle(arr).slice(0, n);

export default function VocabQuizGame() {
  const { t, lang, isRTL } = useI18n();
  const [phase, setPhase] = useState("ready"); // ready | playing | over
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [lives, setLives] = useState(MAX_LIVES);
  const [streak, setStreak] = useState(0);
  const [best, setBest] = useState(() => {
    try { return parseInt(localStorage.getItem("vocabQuizBest") || "0", 10) || 0; } catch { return 0; }
  });
  const [progress, setProgress] = useState(0); // correct answers in current level
  const [question, setQuestion] = useState(null); // { en, options[], correct }
  const [picked, setPicked] = useState(null); // index picked
  const [lock, setLock] = useState(false);
  const [showFlash, setShowFlash] = useState(false);
  const flashTimer = useRef(null);
  const advanceRef = useRef(null);

  const makeQuestion = useCallback(() => {
    const correct = VOCAB[Math.floor(Math.random() * VOCAB.length)];
    const wrong = sample(VOCAB.filter((v) => v.ar !== correct.ar), 2);
    const options = shuffle([correct, ...wrong]);
    setQuestion({ en: correct.en, options: options.map((o) => o.ar), correct: correct.ar });
    setPicked(null);
    setLock(false);
  }, []);

  const start = useCallback(() => {
    resumeAudio(); playStart();
    setScore(0); setLevel(1); setLives(MAX_LIVES); setStreak(0); setProgress(0);
    setPhase("playing");
    makeQuestion();
  }, [makeQuestion]);

  const next = useCallback(() => {
    if (advanceRef.current) { clearTimeout(advanceRef.current); advanceRef.current = null; }
    makeQuestion();
  }, [makeQuestion]);

  const gameOver = useCallback(() => {
    setPhase("over"); playGameOver();
    setBest((b) => { const nb = Math.max(b, score); try { localStorage.setItem("vocabQuizBest", String(nb)); } catch {} return nb; });
  }, [score]);

  const answer = useCallback((idx) => {
    if (lock || !question) return;
    resumeAudio();
    setPicked(idx); setLock(true);
    const chosen = question.options[idx];
    if (chosen === question.correct) {
      const gained = 10 + streak; // مكافأة السلسلة
      setScore((s) => s + gained);
      setStreak((s) => s + 1);
      setProgress((p) => {
        const np = p + 1;
        if (np >= LEVEL_GOAL) {
          setLevel((l) => l + 1);
          setShowFlash(true);
          if (flashTimer.current) clearTimeout(flashTimer.current);
          flashTimer.current = setTimeout(() => setShowFlash(false), 1100);
          playWin();
          return 0;
        } else {
          playCorrect();
          return np;
        }
      });
      advanceRef.current = setTimeout(next, 850);
    } else {
      playWrong();
      setLives((l) => {
        const nl = l - 1;
        if (nl <= 0) { setTimeout(gameOver, 900); }
        else { advanceRef.current = setTimeout(next, 1300); }
        return nl;
      });
    }
  }, [question, lock, streak, next, gameOver]);

  useEffect(() => () => {
    if (advanceRef.current) clearTimeout(advanceRef.current);
    if (flashTimer.current) clearTimeout(flashTimer.current);
  }, []);

  const tr = lang === "ar" ? {
    title: "تعلّم الإنجليزية", what: "ما معنى هذه الكلمة؟", score: "النقاط", level: "المستوى",
    lives: "القلوب", streak: "سلسلة", best: "الأفضل", start: "ابدأ", again: "العب مجدداً",
    over: "انتهت اللعبة", wrong: "إجابة خاطئة", correctWas: "الصحيح:", next: "التالي",
    intro: "اختر الترجمة العربية الصحيحة للكلمة الإنجليزية. كل إجابة صحيحة ترفع نقاطك وسلسلتك، والإجابة الخاطئة تكلّف قلباً!",
    lvlUp: "مستوى جديد!", wellDone: "أحسنت",
  } : {
    title: "Learn English", what: "What does this word mean?", score: "Score", level: "Level",
    lives: "Lives", streak: "Streak", best: "Best", start: "Start", again: "Play again",
    over: "Game Over", wrong: "Wrong", correctWas: "Correct:", next: "Next",
    intro: "Pick the correct Arabic meaning for the English word. Correct answers grow your score and streak; a wrong answer costs a heart!",
    lvlUp: "Level Up!", wellDone: "Nice",
  };

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="select-none flex flex-col items-center">
      {/* Top stats */}
      <div className="flex items-center justify-between w-full max-w-[360px] mb-3 px-1 text-sm gap-2">
        <div className="flex items-center gap-1.5">
          {Array.from({ length: MAX_LIVES }).map((_, i) => (
            <Heart key={i} className={`w-5 h-5 ${i < lives ? "text-rose-500 fill-rose-500" : "text-muted-foreground/30"}`} />
          ))}
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-500/15 border border-orange-400/30">
          <Flame className="w-4 h-4 text-orange-500" />
          <span className="font-extrabold text-orange-500 tabular-nums">{streak}</span>
          <span className="text-muted-foreground text-xs">{tr.streak}</span>
        </div>
        <div className="flex items-center gap-2">
          <GameMusicButton theme="snake" />
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-violet-500/15 border border-violet-400/30">
            <Trophy className="w-3.5 h-3.5 text-amber-500" />
            <span className="font-extrabold text-amber-500 tabular-nums">{best}</span>
          </div>
        </div>
      </div>

      {/* Score + level + progress */}
      <div className="w-full max-w-[360px] mb-3">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs text-muted-foreground">{tr.level} <span className="font-extrabold text-violet-400">{level}</span></span>
          <span className="text-xs text-muted-foreground">{tr.score}: <span className="font-extrabold text-emerald-500">{score}</span></span>
        </div>
        <div className="h-2.5 rounded-full bg-muted overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ background: "linear-gradient(90deg,#58cc02,#fbbf24,#6d28d9)" }}
            animate={{ width: `${(progress / LEVEL_GOAL) * 100}%` }}
            transition={{ type: "spring", stiffness: 120, damping: 18 }}
          />
        </div>
      </div>

      {/* Game card */}
      <div className="relative w-full max-w-[360px] rounded-3xl border border-violet-500/30 bg-[#1e1b4b] dark:bg-[#1e1b4b] shadow-xl shadow-violet-900/40 overflow-hidden">
        <div className="p-5">
          {/* Title + word */}
          <div className="text-center mb-4">
            <div className="inline-flex items-center gap-2 mb-2 text-xs font-bold uppercase tracking-widest text-violet-300/80">
              <Languages className="w-4 h-4" /> {tr.title}
            </div>
            <p className="text-sm text-muted-foreground mb-2">{tr.what}</p>
            <AnimatePresence mode="wait">
              <motion.div
                key={question ? question.en : "idle"}
                initial={{ opacity: 0, y: 14, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -14, scale: 0.9 }}
                transition={{ duration: 0.25 }}
                className="text-4xl font-black tracking-tight bg-gradient-to-r from-[#1cb0f6] via-violet-300 to-[#58cc02] bg-clip-text text-transparent"
              >
                {question ? question.en : "…"}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Options */}
          <div className="grid gap-2.5">
            {question && question.options.map((opt, idx) => {
              const isCorrect = opt === question.correct;
              const isPicked = picked === idx;
              let cls = "border-violet-400/30 bg-violet-500/10 hover:bg-violet-500/20 text-foreground";
              if (lock) {
                if (isCorrect) cls = "border-emerald-400 bg-emerald-500/25 text-emerald-50";
                else if (isPicked) cls = "border-rose-400 bg-rose-500/25 text-rose-50";
                else cls = "border-violet-400/15 bg-violet-500/5 text-muted-foreground/60";
              }
              return (
                <button
                  key={idx}
                  onClick={() => answer(idx)}
                  disabled={lock}
                  className={`relative flex items-center justify-center gap-2 h-14 rounded-2xl border-2 font-bold text-lg transition-all active:scale-[0.98] ${cls}`}
                >
                  {opt}
                  {lock && isCorrect && <Check className="w-5 h-5" />}
                  {lock && isPicked && !isCorrect && <X className="w-5 h-5" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Overlays */}
        <AnimatePresence>
          {phase === "ready" && (
            <motion.div key="ready" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-background/90 backdrop-blur-sm flex flex-col items-center justify-center gap-4 p-6 text-center">
              <Star className="w-10 h-10 text-amber-400" />
              <div className="text-2xl font-extrabold text-foreground">{tr.title}</div>
              <p className="text-sm text-muted-foreground max-w-[280px]">{tr.intro}</p>
              <Button onClick={start} className="bg-primary text-primary-foreground rounded-2xl px-8 py-5 text-base font-bold">
                <Play className="w-5 h-5 mr-2" /> {tr.start}
              </Button>
            </motion.div>
          )}
          {phase === "over" && (
            <motion.div key="over" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-background/90 backdrop-blur-sm flex flex-col items-center justify-center gap-3 text-center p-6">
              <Trophy className="w-9 h-9 text-amber-400" />
              <div className="text-2xl font-extrabold text-destructive">{tr.over}</div>
              <div className="text-sm text-muted-foreground">
                {tr.score}: <span className="font-bold text-emerald-500">{score}</span> · {tr.level}:{" "}
                <span className="font-bold text-violet-300">{level}</span> · {tr.best}:{" "}
                <span className="font-bold text-amber-500">{best}</span>
              </div>
              <Button onClick={start} className="bg-primary text-primary-foreground rounded-2xl px-6 py-4">
                <RotateCcw className="w-4 h-4 mr-2" /> {tr.again}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Level up flash */}
        <AnimatePresence>
          {showFlash && phase === "playing" && (
            <motion.div key="flash"
              initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.4 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <div className="text-4xl font-black tracking-tight bg-gradient-to-r from-emerald-300 via-amber-300 to-violet-300 bg-clip-text text-transparent drop-shadow-[0_2px_12px_rgba(167,139,250,0.6)]">
                  {tr.lvlUp}
                </div>
                <div className="mt-1 text-xs font-bold uppercase tracking-[0.3em] text-amber-200/90">{tr.level} {level - 1} → {level}</div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {phase === "playing" && lock && (
        <div className="mt-4 text-center text-sm">
          {picked !== null && question.options[picked] === question.correct ? (
            <span className="font-bold text-emerald-500">{tr.wellDone} 🎉</span>
          ) : (
            <span className="font-bold text-rose-500">{tr.wrong} — {tr.correctWas} {question ? question.correct : ""}</span>
          )}
        </div>
      )}
    </div>
  );
}