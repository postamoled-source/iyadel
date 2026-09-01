// المستويات المتقدمة 21–24 — واجهة لعب مستقلّة لا تمسّ دورة المستويات الكلاسيكية
import { useState, useEffect, useRef, useCallback } from "react";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Check, X, Clock, ArrowLeft, RotateCcw, Trophy, Volume2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import BeeMascot from "@/components/games/BeeMascot";
import { Image } from "@/components/ui/image";
import { LANGS } from "@/data/learn-languages";
import { getAdvQuestions, logAdvMistake, ADV_LEVELS_BY_N } from "@/data/learn-advanced";
import { resumeAudio, playStart, playCorrect, playWrong, playWin } from "@/lib/game-sounds";

const shuffle = (arr) => arr.map((v) => [Math.random(), v]).sort((a, b) => a[0] - b[0]).map((v) => v[1]);
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

export default function AdvancedLevels({ n, langCode, title, image, onExit, onComplete }) {
  const { lang, isRTL } = useI18n();
  const targetLang = langBy(langCode);
  const isRtl = langCode === "ar";
  const meta = ADV_LEVELS_BY_N[n];
  const buildQ = useCallback(() => getAdvQuestions(n, langCode), [n, langCode]);
  const [questions, setQuestions] = useState(buildQ);
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [lock, setLock] = useState(false);
  const [picked, setPicked] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [arranged, setArranged] = useState([]);
  const [shuffled, setShuffled] = useState(() => (questions[0] && questions[0].shuffled ? shuffle(questions[0].shuffled) : []));
  const [timeLeft, setTimeLeft] = useState(0);
  const [finished, setFinished] = useState(false);
  const timeLimitRef = useRef(n === 22 ? 6 : 5);
  const timerRef = useRef(null);

  const total = questions.length;
  const q = questions[idx];
  const hasTimer = n === 22 || n === 24;

  const tr = lang === "ar" ? {
    back: "‹ الخريطة", score: "النقاط", check: "تحقّق", reset: "إعادة", correctWas: "الصحيح:",
    arrangeHint: "رتّب الكلمات حسب الجملة", choose: "اختر الإجابة الصحيحة", timed: "اختر بسرعة!",
    finishedTitle: "أحسنت! أكملت المستوى", again: "العب مجدداً", map: "الخريطة", timeUp: "انتهى الوقت!",
    noData: "لا توجد أسئلة لهذا المستوى بعد", mirrorHint: "تحدَّ أخطاءك السابقة",
  } : {
    back: "‹ Map", score: "Score", check: "Check", reset: "Reset", correctWas: "Correct:",
    arrangeHint: "Arrange the words to match the sentence", choose: "Choose the correct answer", timed: "Answer quickly!",
    finishedTitle: "Well done! Level complete", again: "Play again", map: "Map", timeUp: "Time's up!",
    noData: "No questions for this level yet", mirrorHint: "Beat your past mistakes",
  };

  const clearTimer = useCallback(() => { if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; } }, []);

  const advance = useCallback(() => {
    setIdx((i) => {
      const ni = i + 1;
      if (ni >= questions.length) { setFinished(true); onComplete?.(); return i; }
      return ni;
    });
  }, [questions.length, onComplete]);

  const onTimeout = useCallback(() => {
    clearTimer();
    setLock(true);
    const cur = questions[idx];
    if (!cur) return;
    playWrong();
    if (n === 22) { logAdvMistake(langCode, cur.word, cur.options[cur.correct]); timeLimitRef.current = Math.min(8, +(timeLimitRef.current + 0.5).toFixed(1)); }
    else if (n === 24) { logAdvMistake(langCode, cur.word, cur.options[cur.correct]); }
    setFeedback({ ok: false, correct: cur.options[cur.correct], timeout: true });
    setTimeout(advance, 1300);
  }, [clearTimer, questions, idx, n, langCode, advance]);

  // إعادة ضبط الحالة عند تغيّر السؤال
  useEffect(() => {
    setLock(false); setPicked(null); setFeedback(null); setArranged([]);
    const cur = questions[idx];
    if (cur && cur.shuffled) setShuffled(shuffle(cur.shuffled));
  }, [idx, questions]);

  // مؤقّت لسباق الزمن (22) والمرآة (24)
  useEffect(() => {
    if (finished || !hasTimer) return;
    const cur = questions[idx];
    if (!cur) return;
    const limit = n === 22 ? timeLimitRef.current : 5;
    setTimeLeft(Math.round(limit));
    clearTimer();
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) { onTimeout(); return 0; }
        return t - 1;
      });
    }, 1000);
    return clearTimer;
  }, [idx, n, finished, hasTimer, questions, clearTimer, onTimeout]);

  useEffect(() => () => clearTimer(), [clearTimer]);

  if (!total) {
    return (
      <div dir={isRTL ? "rtl" : "ltr"} className="select-none max-w-[420px] mx-auto text-center py-10">
        <BeeMascot mood="sad" size={80} />
        <p className="mt-3 text-sm text-muted-foreground">{tr.noData}</p>
        <Button onClick={onExit} variant="outline" className="mt-5 rounded-2xl px-6 py-3">{tr.map}</Button>
      </div>
    );
  }

  if (finished) {
    playWin();
    return (
      <div dir={isRTL ? "rtl" : "ltr"} className="select-none max-w-[420px] mx-auto text-center">
        <BeeMascot mood="happy" size={96} />
        <h2 className="mt-3 text-2xl font-extrabold text-foreground">{tr.finishedTitle} {n}</h2>
        <div className="mt-5 flex items-center justify-center gap-4">
          <div className="rounded-2xl bg-card border border-border px-5 py-2">
            <div className="text-[10px] uppercase text-muted-foreground">{tr.score}</div>
            <div className="text-xl font-extrabold text-emerald-500">{score} / {total}</div>
          </div>
        </div>
        <div className="mt-6 flex justify-center gap-3">
          <Button onClick={() => { setQuestions(buildQ()); setIdx(0); setScore(0); setFinished(false); timeLimitRef.current = n === 22 ? 6 : 5; }} className="bg-primary text-primary-foreground rounded-2xl px-6 py-4">
            <RotateCcw className="w-4 h-4 mr-2" />{tr.again}
          </Button>
          <Button onClick={onExit} variant="outline" className="rounded-2xl px-6 py-4 border-border">{tr.map}</Button>
        </div>
      </div>
    );
  }

  const submitOrdering = () => {
    if (lock) return;
    resumeAudio(); clearTimer(); setLock(true);
    const ok = arranged.join(" ") === q.correct.join(" ");
    setFeedback({ ok, correct: q.correct.join(" ") });
    if (ok) { setScore((s) => s + 1); playCorrect(); } else { playWrong(); logAdvMistake(langCode, q.hint, q.correct.join(" ")); }
    setTimeout(advance, 1300);
  };

  const choose = (choice) => {
    if (lock) return;
    resumeAudio(); clearTimer(); setLock(true); setPicked(choice);
    let ok = false; let correctVal = "";
    if (n === 22) {
      ok = choice === q.correct; correctVal = q.options[q.correct];
      if (ok) { timeLimitRef.current = Math.max(3, +(timeLimitRef.current - 0.5).toFixed(1)); }
      else { timeLimitRef.current = Math.min(8, +(timeLimitRef.current + 0.5).toFixed(1)); logAdvMistake(langCode, q.word, correctVal); }
    } else if (n === 23) {
      ok = choice === q.correct; correctVal = q.correct;
      if (!ok) logAdvMistake(langCode, q.passage, correctVal);
    } else if (n === 24) {
      ok = choice === q.correct; correctVal = q.options[q.correct];
      if (!ok) logAdvMistake(langCode, q.word, correctVal);
    }
    setFeedback({ ok, correct: correctVal });
    if (ok) { setScore((s) => s + 1); playCorrect(); } else playWrong();
    setTimeout(advance, 1300);
  };

  const resetArr = () => { if (lock) return; setShuffled(shuffle(q.shuffled)); setArranged([]); };
  const tapW = (w, i) => { if (lock) return; setShuffled((p) => p.filter((_, k) => k !== i)); setArranged((p) => [...p, w]); };
  const untapW = (w, i) => { if (lock) return; setArranged((p) => p.filter((_, k) => k !== i)); setShuffled((p) => [...p, w]); };

  const promptText = n === 21 ? tr.arrangeHint : n === 24 ? tr.mirrorHint : n === 22 ? tr.timed : tr.choose;

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="select-none max-w-[420px] mx-auto">
      <div className="flex items-center justify-between mb-2 gap-2">
        <button onClick={onExit} className="text-xs font-semibold text-primary hover:underline shrink-0">{tr.back}</button>
        <span className="text-xs font-bold text-primary">{title}</span>
        <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-400/30">
          <Trophy className="w-3.5 h-3.5 text-emerald-500" /><span className="text-xs font-bold text-emerald-500">{score}</span>
        </div>
      </div>

      <div className="mb-3 rounded-2xl overflow-hidden border border-border h-16 relative">
        <Image src={image} alt={title} fittingType="fill" className="w-full h-full" />
      </div>

      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[11px] uppercase tracking-wider text-muted-foreground">{n === 24 ? "🪞" : ""} {promptText}</span>
          <span className="text-xs text-muted-foreground">{idx + 1}/{total}</span>
        </div>
        <div className="h-2.5 rounded-full bg-muted overflow-hidden">
          <motion.div className="h-full rounded-full bg-gradient-to-r from-primary to-accent" animate={{ width: `${(idx / total) * 100}%` }} transition={{ type: "spring", stiffness: 120, damping: 18 }} />
        </div>
      </div>

      <div className="rounded-3xl border border-border bg-card p-5 shadow-xl shadow-primary/10">
        <div className="flex items-center gap-3 mb-4">
          <BeeMascot mood={feedback ? (feedback.ok ? "happy" : "sad") : "idle"} size={52} />
          <div className="min-w-0 flex-1">
            <div className="text-[11px] font-bold uppercase tracking-wider text-primary">{lang === "ar" ? targetLang.nameAr : targetLang.name}</div>
          </div>
          {hasTimer && (
            <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full border text-xs font-bold ${timeLeft <= 2 ? "bg-rose-500/15 border-rose-400/40 text-rose-500" : "bg-orange-500/15 border-orange-400/30 text-orange-500"}`}>
              <Clock className="w-3.5 h-3.5" />{timeLeft}
            </div>
          )}
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={idx} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.22 }}>
            {n === 21 && (
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-center gap-2">
                  <div className="text-base font-bold text-foreground text-center" dir={isRtl ? "rtl" : "ltr"}>{q.hint}</div>
                  <button onClick={() => speak(q.hint, targetLang.tts)} className="text-primary hover:text-primary/80 shrink-0"><Volume2 className="w-4 h-4" /></button>
                </div>
                <div className="min-h-[64px] rounded-2xl border-2 border-dashed border-primary/30 bg-primary/5 p-3 flex flex-wrap gap-2 justify-center items-center" dir={isRtl ? "rtl" : "ltr"}>
                  {arranged.length === 0 && <span className="text-sm text-muted-foreground">{tr.arrangeHint}</span>}
                  {arranged.map((w, i) => (
                    <button key={i} onClick={() => untapW(w, i)} disabled={lock} className="px-3.5 py-2 rounded-xl bg-primary text-primary-foreground font-bold text-sm active:scale-95 transition-transform">{w}</button>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2 justify-center" dir={isRtl ? "rtl" : "ltr"}>
                  {shuffled.map((w, i) => (
                    <button key={i} onClick={() => tapW(w, i)} disabled={lock} className="px-3.5 py-2 rounded-xl bg-muted border border-border text-foreground font-bold text-sm hover:border-primary/40 active:scale-95 transition-all">{w}</button>
                  ))}
                </div>
                <div className="flex justify-center gap-3">
                  <Button onClick={resetArr} disabled={lock} variant="outline" className="rounded-2xl px-5 py-3 border-border">{tr.reset}</Button>
                  <Button onClick={submitOrdering} disabled={lock || arranged.length !== q.correct.length} className="bg-primary text-primary-foreground rounded-2xl px-6 py-3 font-bold">{tr.check}</Button>
                </div>
              </div>
            )}

            {(n === 22 || n === 24) && (
              <div className="flex flex-col items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="text-3xl font-black bg-gradient-to-r from-primary via-violet-400 to-accent bg-clip-text text-transparent" dir={isRtl ? "rtl" : "ltr"}>{q.word}</div>
                  <button onClick={() => speak(q.word, targetLang.tts)} className="text-primary hover:text-primary/80"><Volume2 className="w-4 h-4" /></button>
                </div>
                <div className="grid grid-cols-2 gap-2.5 w-full">
                  {q.options.map((opt, i) => {
                    const isCorrect = i === q.correct;
                    const isPicked = picked === i;
                    let cls = "border-primary/25 bg-primary/8 hover:bg-primary/15 text-foreground";
                    if (lock) {
                      if (isCorrect) cls = "border-emerald-400 bg-emerald-500/20 text-emerald-50";
                      else if (isPicked) cls = "border-rose-400 bg-rose-500/20 text-rose-50";
                      else cls = "border-border bg-muted/30 text-muted-foreground/60";
                    }
                    return (
                      <button key={i} onClick={() => choose(i)} disabled={lock} dir={isRtl ? "rtl" : "ltr"}
                        className={`relative flex items-center justify-center gap-2 h-14 rounded-2xl border-2 font-bold text-base transition-all active:scale-[0.98] ${cls}`}>
                        {opt}
                        {lock && isCorrect && <Check className="w-5 h-5" />}
                        {lock && isPicked && !isCorrect && <X className="w-5 h-5" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {n === 23 && (
              <div className="flex flex-col items-center gap-4">
                <div className="text-lg font-bold text-foreground text-center px-2" dir={isRtl ? "rtl" : "ltr"}>{q.passage.replace("___", "______")}</div>
                <div className="grid gap-2.5 w-full">
                  {q.options.map((opt, i) => {
                    const isCorrect = opt === q.correct;
                    const isPicked = picked === opt;
                    let cls = "border-primary/25 bg-primary/8 hover:bg-primary/15 text-foreground";
                    if (lock) {
                      if (isCorrect) cls = "border-emerald-400 bg-emerald-500/20 text-emerald-50";
                      else if (isPicked) cls = "border-rose-400 bg-rose-500/20 text-rose-50";
                      else cls = "border-border bg-muted/30 text-muted-foreground/60";
                    }
                    return (
                      <button key={i} onClick={() => choose(opt)} disabled={lock} dir={isRtl ? "rtl" : "ltr"}
                        className={`relative flex items-center justify-center gap-2 h-13 py-3 rounded-2xl border-2 font-bold text-base transition-all active:scale-[0.98] ${cls}`}>
                        {opt}
                        {lock && isCorrect && <Check className="w-5 h-5" />}
                        {lock && isPicked && !isCorrect && <X className="w-5 h-5" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {feedback && (
        <div className="mt-3 text-center text-sm">
          {feedback.ok ? <span className="font-bold text-emerald-500">✓</span> : <span className="font-bold text-rose-500">✗ {tr.correctWas} {feedback.correct}</span>}
        </div>
      )}
    </div>
  );
}