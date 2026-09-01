import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Heart, Flame, Trophy, Play, RotateCcw, Check, X, Star, Volume2, Lock, ChevronRight, Globe, Pencil, ArrowLeftRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import GameMusicButton from "@/components/games/GameMusicButton";
import { resumeAudio, playStart, playCorrect, playWrong, playWin } from "@/lib/game-sounds";
import { Image } from "@/components/ui/image";
import { LANGS, levelsForLang, meaningPool, sayPool, PRAISE, WRONG } from "@/data/learn-languages";
import BeeMascot from "@/components/games/BeeMascot";
import AdvancedLevels from "@/components/games/AdvancedLevels";

const MAX_LIVES = 5;
const shuffle = (arr) => arr.map((v) => [Math.random(), v]).sort((a, b) => a[0] - b[0]).map((v) => v[1]);
const sample = (arr, n) => shuffle(arr).slice(0, n);
const norm = (s) => (s || "")
  .toString()
  .trim()
  .toLowerCase()
  .normalize("NFKC")
  // إزالة التشكيل وعلامات المد العربية
  .replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED]/g, "")
  // إزالة التطويل
  .replace(/\u0640/g, "")
  // توحيد ألف الهمزات والممدودة إلى ا
  .replace(/[\u0622\u0623\u0625\u0671]/g, "\u0627")
  // توحيد الألف المقصورة ى -> ي
  .replace(/\u0649/g, "\u064A")
  // توحيد التاء المربوطة ة -> ه (تسهيلاً للمستخدم)
  .replace(/\u0629/g, "\u0647")
  // إزالة علامات الترقيم العربية والإنجليزية
  .replace(/[.!،,؛؟?:"'()\[\]{}…\-\u060C\u061B\u061F]/g, "")
  .replace(/\s+/g, " ");
const langBy = (code) => LANGS.find((l) => l.code === code) || LANGS[0];

function speak(text, tts = "en-US") {
  try {
    if (!("speechSynthesis" in window)) return;
    const u = new SpeechSynthesisUtterance(text);
    u.lang = tts;
    const voices = window.speechSynthesis.getVoices();
    const base = tts.split("-")[0];
    const v = voices.find((vc) => vc.lang && vc.lang.startsWith(base));
    if (v) u.voice = v;
    u.rate = 0.9;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  } catch {}
}
if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.onvoiceschanged = () => {};

function PillRow({ value, onSelect }) {
  const { lang } = useI18n();
  return (
    <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
      {LANGS.map((l) => {
        const active = l.code === value;
        return (
          <button key={l.code} onClick={() => onSelect(l.code)} className={`shrink-0 flex items-center gap-1.5 rounded-full border-2 px-3 py-1.5 text-xs font-bold transition-all ${active ? "bg-primary text-primary-foreground border-primary shadow-md scale-105" : "bg-card border-border text-foreground hover:border-primary/50"}`}>
            <span className="text-base leading-none">{l.flag}</span><span>{lang === "ar" ? l.nameAr : l.name}</span>
          </button>
        );
      })}
    </div>
  );
}

export default function VocabQuizGame() {
  const { t, lang, isRTL } = useI18n();
  const [langCode, setLangCode] = useState(() => { try { return localStorage.getItem("learnLang") || "en"; } catch { return "en"; } });
  const [baseLangCode, setBaseLangCode] = useState(() => { try { return localStorage.getItem("learnBase") || "ar"; } catch { return "ar"; } });
  const targetLang = useMemo(() => langBy(langCode), [langCode]);
  const baseLang = useMemo(() => langBy(baseLangCode), [baseLangCode]);
  const pair = `${langCode}_${baseLangCode}`;
  const levels = useMemo(() => levelsForLang(langCode, baseLangCode), [langCode, baseLangCode]);
  const mPool = useMemo(() => meaningPool(baseLangCode), [baseLangCode]);
  const sPool = useMemo(() => sayPool(baseLangCode), [baseLangCode]);

  const [phase, setPhase] = useState("map");
  const [levelIdx, setLevelIdx] = useState(0);
  const [exIdx, setExIdx] = useState(0);
  const [lives, setLives] = useState(MAX_LIVES);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [best, setBest] = useState(0);
  const [maxUnlocked, setMaxUnlocked] = useState(0);
  const [picked, setPicked] = useState(null);
  const [lock, setLock] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [typed, setTyped] = useState("");
  const [arranged, setArranged] = useState([]);
  const [shuffledWords, setShuffledWords] = useState([]);
  const [arrangedT, setArrangedT] = useState([]);
  const [shuffledT, setShuffledT] = useState([]);
  const [arrangedB, setArrangedB] = useState([]);
  const [shuffledB, setShuffledB] = useState([]);
  const [exData, setExData] = useState(null);
  const [mood, setMood] = useState("idle");
  const [mascotLine, setMascotLine] = useState("");
  const [won, setWon] = useState(false);
  const [advMeta, setAdvMeta] = useState(null);
  const advanceRef = useRef(null);

  const level = levels[levelIdx];
  const exercise = exData;
  const isTargetRtl = langCode === "ar";
  const isBaseRtl = baseLangCode === "ar";

  // إعادة تحميل التقدّم عند تغيير الزوج (لغة الهدف + لغة الأساس)
  useEffect(() => {
    setBest(() => { try { return parseInt(localStorage.getItem(`vocabBest_${pair}`) || "0", 10) || 0; } catch { return 0; } });
    setMaxUnlocked(() => { try { return parseInt(localStorage.getItem(`vocabUnlocked_${pair}`) || "0", 10) || 0; } catch { return 0; } });
  }, [pair]);

  const resetToMap = useCallback(() => {
    if (advanceRef.current) { clearTimeout(advanceRef.current); advanceRef.current = null; }
    window.speechSynthesis?.cancel?.();
    setPhase("map"); setWon(false); setScore(0); setStreak(0); setLives(MAX_LIVES);
    setExData(null); setFeedback(null); setPicked(null); setLock(false);
  }, []);

  const selectTarget = useCallback((code) => {
    if (code === baseLangCode) { setBaseLangCode(langCode); try { localStorage.setItem("learnBase", langCode); } catch {} }
    setLangCode(code); try { localStorage.setItem("learnLang", code); } catch {}
    resetToMap();
  }, [baseLangCode, langCode, resetToMap]);

  const selectBase = useCallback((code) => {
    if (code === langCode) { setLangCode(baseLangCode); try { localStorage.setItem("learnLang", baseLangCode); } catch {} }
    setBaseLangCode(code); try { localStorage.setItem("learnBase", code); } catch {}
    resetToMap();
  }, [langCode, baseLangCode, resetToMap]);

  const swapLangs = useCallback(() => {
    setLangCode(baseLangCode); setBaseLangCode(langCode);
    try { localStorage.setItem("learnLang", baseLangCode); localStorage.setItem("learnBase", langCode); } catch {}
    resetToMap();
  }, [langCode, baseLangCode, resetToMap]);

  const buildExercise = useCallback((ex) => {
    let data = { ...ex };
    if (ex.type === "vocab" || ex.type === "listen") {
      const correct = ex.ar;
      const pool = (ex.pool === "say" ? sPool : mPool).filter((m) => m !== correct);
      const distractors = sample(pool, 2);
      data.options = shuffle([correct, ...distractors]);
    } else if (ex.type === "say") {
      const correct = ex.ar;
      const distractors = sample(sPool.filter((m) => m !== correct), 3);
      data.options = shuffle([correct, ...distractors]);
    } else if (ex.type === "fill" || ex.type === "cloze") {
      data.options = shuffle(ex.options);
    } else if (ex.type === "arrange") {
      setShuffledWords(shuffle(ex.words));
      setArranged([]);
    } else if (ex.type === "pair") {
      setShuffledT(shuffle(ex.targetWords)); setArrangedT([]);
      setShuffledB(shuffle(ex.baseWords)); setArrangedB([]);
    } else if (ex.type === "type") {
      setTyped("");
    }
    setExData(data);
    setPicked(null); setLock(false); setFeedback(null);
    if (ex.type === "listen" || ex.type === "say") setTimeout(() => speak(ex.speak || ex.word, targetLang.tts), 350);
  }, [mPool, sPool, targetLang]);

  const startLevel = useCallback((idx) => {
    const lv = levels[idx];
    if (lv.advanced) {
      resumeAudio(); playStart();
      setLevelIdx(idx);
      setAdvMeta({ n: lv.advN, title: lv.title, titleAr: lv.titleAr, image: lv.image });
      setPhase("advanced");
      return;
    }
    resumeAudio(); playStart();
    setLevelIdx(idx); setExIdx(0); setLives(MAX_LIVES); setScore(0); setStreak(0); setWon(false);
    setPhase("playing");
    setMood("idle"); setMascotLine(lang === "ar" ? "هيا نبدأ!" : "Let's begin!");
    speak("Let's begin!", targetLang.tts);
    buildExercise(levels[idx].exercises[0]);
  }, [buildExercise, lang, targetLang, levels]);

  const goMap = useCallback(() => {
    if (advanceRef.current) { clearTimeout(advanceRef.current); advanceRef.current = null; }
    setPhase("map"); window.speechSynthesis?.cancel?.();
  }, []);

  const nextExercise = useCallback(() => {
    const exs = levels[levelIdx].exercises;
    const ni = exIdx + 1;
    if (ni < exs.length) { setExIdx(ni); buildExercise(exs[ni]); return; }
    playWin();
    const nu = Math.max(maxUnlocked, levelIdx + 1);
    setMaxUnlocked(nu);
    try { localStorage.setItem(`vocabUnlocked_${pair}`, String(Math.min(nu, levels.length - 1))); } catch {}
    setMood("happy");
    setMascotLine(lang === "ar" ? `أحسنت! أكملت المستوى ${levelIdx + 1}` : `Great! Level ${levelIdx + 1} complete!`);
    if (nu >= levels.length) {
      setWon(true);
      setBest((b) => { const nb = Math.max(b, score); try { localStorage.setItem(`vocabBest_${pair}`, String(nb)); } catch {}; return nb; });
      setTimeout(() => setPhase("over"), 1400);
    } else {
      const nextLv = levels[levelIdx + 1];
      if (nextLv.advanced) {
        setPhase("map");
      } else {
        advanceRef.current = setTimeout(() => {
          setExIdx(0); buildExercise(nextLv.exercises[0]); setLevelIdx(levelIdx + 1); setMood("idle"); setMascotLine("");
        }, 1300);
      }
    }
  }, [levelIdx, exIdx, buildExercise, maxUnlocked, score, lang, targetLang, levels, pair]);

  const fail = useCallback(() => {
    setLives((l) => Math.max(0, l - 1));
    setStreak(0); setMood("sad"); playWrong();
    advanceRef.current = setTimeout(() => buildExercise(levels[levelIdx].exercises[exIdx]), 1400);
  }, [levelIdx, exIdx, buildExercise, levels, targetLang]);

  const succeed = useCallback(() => {
    const gained = 10 + streak;
    setScore((s) => s + gained); setStreak((s) => s + 1); setMood("happy");
    setMascotLine(PRAISE[Math.floor(Math.random() * PRAISE.length)]);
    playCorrect();
    advanceRef.current = setTimeout(nextExercise, 1100);
  }, [streak, nextExercise, targetLang]);

  const checkAnswer = useCallback((chosen) => {
    if (lock || !exercise) return;
    resumeAudio(); setLock(true); setPicked(chosen);
    const ok = chosen === (exercise.ar || exercise.answer);
    setFeedback({ ok, correct: exercise.ar || exercise.answer });
    if (ok) succeed(); else fail();
  }, [lock, exercise, succeed, fail]);

  const submitType = useCallback(() => {
    if (lock || !exercise) return;
    resumeAudio(); setLock(true);
    const ok = norm(typed) === norm(exercise.word);
    setFeedback({ ok, correct: exercise.word });
    if (ok) succeed(); else fail();
  }, [lock, exercise, typed, succeed, fail]);

  const submitArrange = useCallback(() => {
    if (lock || !exercise) return;
    resumeAudio(); setLock(true);
    const ok = arranged.join(" ") === exercise.words.join(" ");
    setFeedback({ ok, correct: exercise.words.join(" ") });
    if (ok) succeed(); else fail();
  }, [lock, exercise, arranged, succeed, fail]);

  const tapWord = (w, i) => { if (lock) return; setShuffledWords((p) => p.filter((_, idx) => idx !== i)); setArranged((p) => [...p, w]); };
  const untapWord = (w, i) => { if (lock) return; setArranged((p) => p.filter((_, idx) => idx !== i)); setShuffledWords((p) => [...p, w]); };

  const tapPairT = (w, i) => { if (lock) return; setShuffledT((p) => p.filter((_, idx) => idx !== i)); setArrangedT((p) => [...p, w]); };
  const untapPairT = (w, i) => { if (lock) return; setArrangedT((p) => p.filter((_, idx) => idx !== i)); setShuffledT((p) => [...p, w]); };
  const tapPairB = (w, i) => { if (lock) return; setShuffledB((p) => p.filter((_, idx) => idx !== i)); setArrangedB((p) => [...p, w]); };
  const untapPairB = (w, i) => { if (lock) return; setArrangedB((p) => p.filter((_, idx) => idx !== i)); setShuffledB((p) => [...p, w]); };
  const submitPair = useCallback(() => {
    if (lock || !exercise) return;
    resumeAudio(); setLock(true);
    const ok = arrangedT.join(" ") === exercise.targetWords.join(" ") && arrangedB.join(" ") === exercise.baseWords.join(" ");
    setFeedback({ ok, correct: exercise.targetWords.join(" ") });
    if (ok) succeed(); else fail();
  }, [lock, exercise, arrangedT, arrangedB, succeed, fail]);

  useEffect(() => () => { if (advanceRef.current) clearTimeout(advanceRef.current); window.speechSynthesis?.cancel?.(); }, []);

  const tr = lang === "ar" ? {
    title: "تعلّم اللغات", what: "ما معنى هذه الكلمة؟", score: "النقاط", lives: "القلوب",
    streak: "سلسلة", best: "الأفضل", start: "ابدأ المستوى", again: "العب مجدداً", locked: "مغلق",
    over: "انتهت اللعبة", listenQ: "استمع ثم اختر المعنى", sayQ: "ماذا قالت الشخصية؟",
    typeQ: "اكتب الكلمة بلغة الهدف", arrangeQ: "رتّب الكلمات لتكوّن جملة", fillQ: "أكمل الفراغ الصحيح",
    clozeQ: "اختر الكلمة التي تكمل جميع الجمل", pairQ: "رتّب الجملة بلغة التعلم وبلغتك",
    mapTitle: "اختر مستوى", level: "المستوى", intro: "اختر لغة الهدف ولغتك، ثم ابدأ التعلّم مع شخصيتنا الناطقة.",
    correctWas: "الصحيح:", playAudio: "استمع", resetArr: "إعادة", typePlaceholder: "اكتب هنا...",
    completed: "أكملت كل المستويات!", reached: "وصلت للمستوى", finished: "أتقنت المستوى", submit: "تحقّق",
    iLearn: "أتعلّم", iSpeak: "بلغتي", swap: "تبديل", questions: "سؤال",
  } : {
    title: "Learn Languages", what: "What does this word mean?", score: "Score", lives: "Lives",
    streak: "Streak", best: "Best", start: "Start Level", again: "Play again", locked: "Locked",
    over: "Game Over", listenQ: "Listen, then choose", sayQ: "What did the character say?",
    typeQ: "Type the word in the target language", arrangeQ: "Arrange the words to make a sentence", fillQ: "Choose the correct word",
    clozeQ: "Choose the word that fits all sentences", pairQ: "Arrange the sentence in both languages",
    mapTitle: "Choose a level", level: "Level", intro: "Pick the language you learn and your own language, then start.",
    correctWas: "Correct:", playAudio: "Play", resetArr: "Reset", typePlaceholder: "Type here...",
    completed: "You finished all levels!", reached: "You reached level", finished: "You mastered the level", submit: "Check",
    iLearn: "I learn", iSpeak: "I speak", swap: "Swap", questions: "questions",
  };

  const PairBadge = ({ onClick }) => (
    <button onClick={onClick} className="inline-flex items-center gap-2 rounded-full bg-card border border-border px-3 py-1.5 text-xs font-bold text-foreground hover:border-primary/50 transition-colors">
      <span className="text-base leading-none">{targetLang.flag}</span>
      <span>{lang === "ar" ? targetLang.nameAr : targetLang.name}</span>
      <ArrowLeftRight className="w-3.5 h-3.5 text-primary" />
      <span className="text-base leading-none">{baseLang.flag}</span>
      <span>{lang === "ar" ? baseLang.nameAr : baseLang.name}</span>
    </button>
  );

  // ---------- Level map ----------
  if (phase === "map") {
    return (
      <div dir={isRTL ? "rtl" : "ltr"} className="select-none max-w-[420px] mx-auto">
        <div className="flex items-center justify-center gap-3 mb-3">
          <BeeMascot mood="idle" size={60} />
          <div className="text-center">
            <h2 className="text-2xl font-extrabold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">{tr.title}</h2>
            <p className="text-xs text-muted-foreground">{tr.intro}</p>
          </div>
        </div>

        <div className="flex items-center justify-center gap-3 mb-4 text-sm">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent/15 border border-accent/30">
            <Trophy className="w-4 h-4 text-accent" /><span className="font-extrabold text-accent">{best}</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/15 border border-primary/30">
            <Star className="w-4 h-4 text-primary" /><span className="font-extrabold text-primary">{levels.length} {tr.level}</span>
          </div>
          <GameMusicButton theme="snake" />
        </div>

        {/* المبادل: لغة الهدف + لغة الأساس */}
        <div className="rounded-2xl border border-border bg-card p-3 mb-4 shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-wider text-primary mb-1.5">{tr.iLearn}</p>
          <PillRow value={langCode} onSelect={selectTarget} />
          <div className="flex justify-center my-2">
            <button onClick={swapLangs} className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/30 text-primary px-4 py-1.5 text-xs font-bold hover:bg-primary/20 transition-colors">
              <ArrowLeftRight className="w-3.5 h-3.5" /> {tr.swap}
            </button>
          </div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-accent mb-1.5">{tr.iSpeak}</p>
          <PillRow value={baseLangCode} onSelect={selectBase} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          {levels.map((lv, i) => {
            const locked = i > maxUnlocked;
            const done = i < maxUnlocked;
            return (
              <button key={i} onClick={() => !locked && startLevel(i)} disabled={locked}
                className={`relative rounded-2xl border-2 p-4 text-right transition-all ${locked ? "border-border bg-muted/40 opacity-60 cursor-not-allowed" : done ? "border-emerald-400/50 bg-emerald-500/10 hover:-translate-y-0.5" : lv.special ? "border-accent/60 bg-accent/5 hover:-translate-y-0.5 hover:border-accent shadow-[0_8px_20px_-10px_hsl(var(--accent)/0.5)]" : "border-primary/40 bg-card hover:-translate-y-0.5 hover:border-primary shadow-[0_8px_20px_-10px_hsl(var(--primary)/0.5)]"}`}>
                <div className="relative h-14 -mx-4 -mt-4 mb-2 overflow-hidden rounded-t-2xl bg-muted">
                  <Image src={lv.image} alt={lang === "ar" ? lv.titleAr : lv.title} fittingType="fill" className="w-full h-full" />
                  <div className="absolute inset-0 bg-gradient-to-t from-card via-card/20 to-transparent" />
                </div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-muted-foreground">#{i + 1}</span>
                  {locked ? <Lock className="w-4 h-4 text-muted-foreground" /> : done ? <Check className="w-4 h-4 text-emerald-500" /> : <ChevronRight className="w-4 h-4 text-primary" />}
                </div>
                <div className="font-bold text-sm text-foreground">{lang === "ar" ? lv.titleAr : lv.title}</div>
                <div className="text-[10px] text-muted-foreground mt-0.5">{lv.advanced ? (lang === "ar" ? lv.qLabelAr : lv.qLabel) : `${lv.exercises.length} ${tr.questions}`}</div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // ---------- Game over ----------
  if (phase === "over") {
    return (
      <div dir={isRTL ? "rtl" : "ltr"} className="select-none max-w-[420px] mx-auto text-center">
        <BeeMascot mood={won ? "happy" : "sad"} size={96} />
        <div className="mt-2 flex justify-center"><PairBadge onClick={goMap} /></div>
        <h2 className="mt-3 text-2xl font-extrabold text-foreground">{won ? tr.completed : `${tr.reached} ${levelIdx + 1}`}</h2>
        <p className="text-sm text-muted-foreground mt-1">{won ? tr.finished : tr.over}</p>
        <div className="mt-5 flex items-center justify-center gap-4">
          <div className="rounded-2xl bg-card border border-border px-4 py-2">
            <div className="text-[10px] uppercase text-muted-foreground">{tr.score}</div>
            <div className="text-xl font-extrabold text-emerald-500">{score}</div>
          </div>
          <div className="rounded-2xl bg-card border border-border px-4 py-2">
            <div className="text-[10px] uppercase text-muted-foreground">{tr.best}</div>
            <div className="text-xl font-extrabold text-accent">{best}</div>
          </div>
        </div>
        {won && <p className="mt-3 text-sm font-bold text-emerald-500">🎉 {tr.completed}</p>}
        <div className="mt-6 flex justify-center gap-3">
          <Button onClick={() => startLevel(0)} className="bg-primary text-primary-foreground rounded-2xl px-6 py-4"><RotateCcw className="w-4 h-4 mr-2" />{tr.again}</Button>
          <Button onClick={goMap} variant="outline" className="rounded-2xl px-6 py-4 border-border">{tr.mapTitle}</Button>
        </div>
      </div>
    );
  }

  // ---------- Advanced levels (21-24) ----------
  if (phase === "advanced" && advMeta) {
    return (
      <AdvancedLevels
        n={advMeta.n}
        langCode={langCode}
        baseLangCode={baseLangCode}
        title={lang === "ar" ? advMeta.titleAr : advMeta.title}
        image={advMeta.image}
        onExit={goMap}
        onComplete={() => {
          const nu = Math.max(maxUnlocked, levelIdx + 1);
          setMaxUnlocked(nu);
          try { localStorage.setItem(`vocabUnlocked_${pair}`, String(Math.min(nu, levels.length - 1))); } catch {}
        }}
      />
    );
  }

  // ---------- Playing ----------
  const total = level.exercises.length;
  const exMeta = level.exercises[exIdx];

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="select-none max-w-[420px] mx-auto">
      <div className="flex items-center justify-between mb-2 gap-2">
        <button onClick={goMap} className="text-xs font-semibold text-primary hover:underline shrink-0">‹ {tr.mapTitle}</button>
        <div className="flex items-center gap-1">
          {Array.from({ length: MAX_LIVES }).map((_, i) => (
            <Heart key={i} className={`w-4 h-4 ${i < lives ? "text-rose-500 fill-rose-500" : "text-muted-foreground/30"}`} />
          ))}
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-500/15 border border-orange-400/30">
            <Flame className="w-3.5 h-3.5 text-orange-500" /><span className="text-xs font-bold text-orange-500">{streak}</span>
          </div>
          <GameMusicButton theme="snake" />
        </div>
      </div>
      <div className="mb-3 flex justify-center"><PairBadge onClick={swapLangs} /></div>

      <div className="mb-3 rounded-2xl overflow-hidden border border-border h-16 relative">
        <Image src={level.image} alt={lang === "ar" ? level.titleAr : level.title} fittingType="fill" className="w-full h-full" />
      </div>
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-bold text-primary">{lang === "ar" ? level.titleAr : level.title}</span>
          <span className="text-xs text-muted-foreground">{exIdx + 1}/{total} · {tr.score}: <span className="font-bold text-emerald-500">{score}</span></span>
        </div>
        <div className="h-2.5 rounded-full bg-muted overflow-hidden">
          <motion.div className="h-full rounded-full bg-gradient-to-r from-primary to-accent" animate={{ width: `${(exIdx / total) * 100}%` }} transition={{ type: "spring", stiffness: 120, damping: 18 }} />
        </div>
      </div>

      <div className="rounded-3xl border border-border bg-card p-5 shadow-xl shadow-primary/10">
        <div className="flex items-center gap-3 mb-4">
          <BeeMascot mood={mood} size={56} />
          <div className="min-w-0">
            <div className="text-[11px] font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5" /> {lang === "ar" ? targetLang.nameAr : targetLang.name}
            </div>
            <div className="text-sm font-semibold text-foreground">
              {exMeta.type === "vocab" ? tr.what : exMeta.type === "listen" ? tr.listenQ : exMeta.type === "say" ? tr.sayQ : exMeta.type === "type" ? tr.typeQ : exMeta.type === "fill" ? tr.fillQ : exMeta.type === "cloze" ? tr.clozeQ : exMeta.type === "pair" ? tr.pairQ : tr.arrangeQ}
            </div>
          </div>
          {exercise.thumb && <span className="ms-auto text-3xl shrink-0">{exercise.thumb}</span>}
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={`${levelIdx}-${exIdx}`} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.22 }}>
            {(exercise.type === "vocab" || exercise.type === "listen" || exercise.type === "say" || exercise.type === "fill" || exercise.type === "cloze") && (
              <>
                <div className="flex flex-col items-center mb-4 gap-2">
                  {(exercise.type === "listen" || exercise.type === "say") && (
                    <button onClick={() => speak(exercise.speak || exercise.word, targetLang.tts)} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary/10 border border-primary/30 text-primary font-bold text-sm hover:bg-primary/20 transition-colors">
                      <Volume2 className="w-4 h-4" /> {tr.playAudio}
                    </button>
                  )}
                  {exercise.type === "vocab" && (
                    <div className="text-4xl font-black bg-gradient-to-r from-primary via-violet-400 to-accent bg-clip-text text-transparent" dir={isTargetRtl ? "rtl" : "ltr"}>{exercise.word}</div>
                  )}
                  {exercise.type === "fill" && (
                    <div className="text-lg font-bold text-foreground text-center px-2" dir={isTargetRtl ? "rtl" : "ltr"}>{exercise.sentence}</div>
                  )}
                  {exercise.type === "say" && <div className="text-sm text-muted-foreground italic text-center">"</div>}
                  {exercise.type === "cloze" && (
                    <div className="w-full flex flex-col gap-1.5">
                      {exercise.sentences.map((sen, i) => (
                        <div key={i} dir={isTargetRtl ? "rtl" : "ltr"} className="text-sm sm:text-[15px] font-semibold text-foreground text-center px-3 py-2 rounded-xl bg-primary/8 border border-primary/15 leading-relaxed">{sen}</div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="grid gap-2.5">
                  {exercise.options.map((opt, idx) => {
                    const isCorrect = opt === (exercise.ar || exercise.answer);
                    const isPicked = picked === idx;
                    let cls = "border-primary/25 bg-primary/8 hover:bg-primary/15 text-foreground";
                    if (lock) {
                      if (isCorrect) cls = "border-emerald-400 bg-emerald-500/20 text-emerald-50";
                      else if (isPicked) cls = "border-rose-400 bg-rose-500/20 text-rose-50";
                      else cls = "border-border bg-muted/30 text-muted-foreground/60";
                    }
                    return (
                      <button key={idx} onClick={() => checkAnswer(opt)} disabled={lock} dir={isBaseRtl ? "rtl" : "ltr"}
                        className={`relative flex items-center justify-center gap-2 h-14 rounded-2xl border-2 font-bold text-lg transition-all active:scale-[0.98] ${cls}`}>
                        {opt}
                        {lock && isCorrect && <Check className="w-5 h-5" />}
                        {lock && isPicked && !isCorrect && <X className="w-5 h-5" />}
                      </button>
                    );
                  })}
                </div>
              </>
            )}

            {exercise.type === "type" && (
              <div className="flex flex-col items-center gap-4">
                <div className="text-3xl font-black text-foreground" dir={isBaseRtl ? "rtl" : "ltr"}>{exercise.ar}</div>
                <div className="relative w-full max-w-[280px]">
                  <input autoFocus value={typed} disabled={lock} dir={isTargetRtl ? "rtl" : "ltr"}
                    onChange={(e) => setTyped(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter" && !lock) submitType(); }}
                    placeholder={tr.typePlaceholder}
                    className={`w-full h-14 rounded-2xl border-2 px-4 text-center text-lg font-bold outline-none transition-colors ${lock && norm(typed) === norm(exercise.word) ? "border-emerald-400 bg-emerald-500/15 text-emerald-50" : lock ? "border-rose-400 bg-rose-500/15 text-rose-50" : "border-primary/30 bg-background text-foreground focus:border-primary"}`}
                  />
                  <Pencil className="absolute top-1/2 -translate-y-1/2 ltr:right-3 rtl:left-3 w-4 h-4 text-muted-foreground/50" />
                </div>
                <Button onClick={submitType} disabled={lock} className="bg-primary text-primary-foreground rounded-2xl px-8 py-4 font-bold">{tr.submit}</Button>
              </div>
            )}

            {exercise.type === "arrange" && (
              <div className="flex flex-col gap-4">
                <div className="min-h-[64px] rounded-2xl border-2 border-dashed border-primary/30 bg-primary/5 p-3 flex flex-wrap gap-2 justify-center items-center" dir={isTargetRtl ? "rtl" : "ltr"}>
                  {arranged.length === 0 && <span className="text-sm text-muted-foreground">{tr.arrangeQ}</span>}
                  {arranged.map((w, i) => (
                    <button key={i} onClick={() => untapWord(w, i)} disabled={lock} className="px-3.5 py-2 rounded-xl bg-primary text-primary-foreground font-bold text-sm active:scale-95 transition-transform">{w}</button>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2 justify-center" dir={isTargetRtl ? "rtl" : "ltr"}>
                  {shuffledWords.map((w, i) => (
                    <button key={i} onClick={() => tapWord(w, i)} disabled={lock} className="px-3.5 py-2 rounded-xl bg-muted border border-border text-foreground font-bold text-sm hover:border-primary/40 active:scale-95 transition-all">{w}</button>
                  ))}
                </div>
                <div className="flex justify-center gap-3">
                  <Button onClick={() => { setShuffledWords(shuffle(exercise.words)); setArranged([]); }} disabled={lock} variant="outline" className="rounded-2xl px-5 py-3 border-border">{tr.resetArr}</Button>
                  <Button onClick={submitArrange} disabled={lock || arranged.length !== exercise.words.length} className="bg-primary text-primary-foreground rounded-2xl px-6 py-3 font-bold">{tr.submit}</Button>
                </div>
              </div>
            )}

            {exercise.type === "pair" && (
              <div className="flex flex-col gap-4">
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-primary mb-1.5">{tr.iLearn}</div>
                  <div className="min-h-[56px] rounded-2xl border-2 border-dashed border-primary/30 bg-primary/5 p-3 flex flex-wrap gap-2 justify-center items-center" dir={isTargetRtl ? "rtl" : "ltr"}>
                    {arrangedT.length === 0 && <span className="text-xs text-muted-foreground">{tr.arrangeQ}</span>}
                    {arrangedT.map((w, i) => (<button key={i} onClick={() => untapPairT(w, i)} disabled={lock} className="px-3 py-2 rounded-xl bg-primary text-primary-foreground font-bold text-sm active:scale-95 transition-transform">{w}</button>))}
                  </div>
                  <div className="flex flex-wrap gap-2 justify-center mt-2" dir={isTargetRtl ? "rtl" : "ltr"}>
                    {shuffledT.map((w, i) => (<button key={i} onClick={() => tapPairT(w, i)} disabled={lock} className="px-3.5 py-2 rounded-xl bg-muted border border-border text-foreground font-bold text-sm hover:border-primary/40 active:scale-95 transition-all">{w}</button>))}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-accent mb-1.5">{tr.iSpeak}</div>
                  <div className="min-h-[56px] rounded-2xl border-2 border-dashed border-accent/40 bg-accent/5 p-3 flex flex-wrap gap-2 justify-center items-center" dir={isBaseRtl ? "rtl" : "ltr"}>
                    {arrangedB.length === 0 && <span className="text-xs text-muted-foreground">{tr.arrangeQ}</span>}
                    {arrangedB.map((w, i) => (<button key={i} onClick={() => untapPairB(w, i)} disabled={lock} className="px-3 py-2 rounded-xl bg-accent text-accent-foreground font-bold text-sm active:scale-95 transition-transform">{w}</button>))}
                  </div>
                  <div className="flex flex-wrap gap-2 justify-center mt-2" dir={isBaseRtl ? "rtl" : "ltr"}>
                    {shuffledB.map((w, i) => (<button key={i} onClick={() => tapPairB(w, i)} disabled={lock} className="px-3.5 py-2 rounded-xl bg-muted border border-border text-foreground font-bold text-sm hover:border-accent/40 active:scale-95 transition-all">{w}</button>))}
                  </div>
                </div>
                <div className="flex justify-center gap-3">
                  <Button onClick={() => { setShuffledT(shuffle(exercise.targetWords)); setArrangedT([]); setShuffledB(shuffle(exercise.baseWords)); setArrangedB([]); }} disabled={lock} variant="outline" className="rounded-2xl px-5 py-3 border-border">{tr.resetArr}</Button>
                  <Button onClick={submitPair} disabled={lock || arrangedT.length !== exercise.targetWords.length || arrangedB.length !== exercise.baseWords.length} className="bg-primary text-primary-foreground rounded-2xl px-6 py-3 font-bold">{tr.submit}</Button>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {feedback && (
        <div className="mt-3 text-center text-sm">
          {feedback.ok ? <span className="font-bold text-emerald-500">✓ {mascotLine}</span> : <span className="font-bold text-rose-500">✗ {tr.correctWas} {feedback.correct}</span>}
        </div>
      )}
    </div>
  );
}