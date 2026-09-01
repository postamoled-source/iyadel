import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ChevronRight, Heart, Trophy, RotateCcw, Check, X, ArrowLeft, Globe } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { trackEvent } from "@/lib/analytics";

// Self-contained mini language quiz embedded on the home page.
// Compact but real: 4 target languages, 10 questions, multiple choice, lives & score.
const SETS = {
  en: { name: "English", flag: "🇬🇧", words: [
    { w: "Hello", ar: "مرحبا" }, { w: "Thank you", ar: "شكراً" }, { w: "Book", ar: "كتاب" },
    { w: "Water", ar: "ماء" }, { w: "Friend", ar: "صديق" }, { w: "School", ar: "مدرسة" },
    { w: "City", ar: "مدينة" }, { w: "Food", ar: "طعام" }, { w: "Sun", ar: "شمس" }, { w: "Night", ar: "ليل" },
  ] },
  fr: { name: "Français", flag: "🇫🇷", words: [
    { w: "Bonjour", ar: "مرحبا" }, { w: "Merci", ar: "شكراً" }, { w: "Livre", ar: "كتاب" },
    { w: "Eau", ar: "ماء" }, { w: "Ami", ar: "صديق" }, { w: "École", ar: "مدرسة" },
    { w: "Ville", ar: "مدينة" }, { w: "Nourriture", ar: "طعام" }, { w: "Soleil", ar: "شمس" }, { w: "Nuit", ar: "ليل" },
  ] },
  es: { name: "Español", flag: "🇪🇸", words: [
    { w: "Hola", ar: "مرحبا" }, { w: "Gracias", ar: "شكراً" }, { w: "Libro", ar: "كتاب" },
    { w: "Agua", ar: "ماء" }, { w: "Amigo", ar: "صديق" }, { w: "Escuela", ar: "مدرسة" },
    { w: "Ciudad", ar: "مدينة" }, { w: "Comida", ar: "طعام" }, { w: "Sol", ar: "شمس" }, { w: "Noche", ar: "ليل" },
  ] },
  de: { name: "Deutsch", flag: "🇩🇪", words: [
    { w: "Hallo", ar: "مرحبا" }, { w: "Danke", ar: "شكراً" }, { w: "Buch", ar: "كتاب" },
    { w: "Wasser", ar: "ماء" }, { w: "Freund", ar: "صديق" }, { w: "Schule", ar: "مدرسة" },
    { w: "Stadt", ar: "مدينة" }, { w: "Essen", ar: "طعام" }, { w: "Sonne", ar: "شمس" }, { w: "Nacht", ar: "ليل" },
  ] },
};

const shuffle = (a) => a.map((v) => [Math.random(), v]).sort((x, y) => x[0] - y[0]).map((p) => p[1]);
const sample = (a, n) => shuffle(a).slice(0, n);

function buildQuiz(code) {
  const pool = SETS[code].words;
  const picks = sample(pool, Math.min(10, pool.length));
  return picks.map((item) => {
    const distractors = sample(pool.filter((p) => p.ar !== item.ar), 3).map((p) => p.ar);
    const options = shuffle([item.ar, ...distractors]);
    return { word: item.w, answer: item.ar, options };
  });
}

const MAX_LIVES = 3;

export default function LanguageSection() {
  const { t, lang, isRTL } = useI18n();
  const ar = lang === "ar";
  const [code, setCode] = useState("en");
  const [open, setOpen] = useState(false);
  const [quiz, setQuiz] = useState(() => buildQuiz("en"));
  const [idx, setIdx] = useState(0);
  const [lives, setLives] = useState(MAX_LIVES);
  const [score, setScore] = useState(0);
  const [picked, setPicked] = useState(null);
  const [lock, setLock] = useState(false);
  const [over, setOver] = useState(false);

  const cur = quiz[idx];

  const start = useCallback((c) => {
    setCode(c);
    setQuiz(buildQuiz(c));
    setIdx(0); setLives(MAX_LIVES); setScore(0); setPicked(null); setLock(false); setOver(false);
    setOpen(true);
    trackEvent("language_quiz_start", { lang: c });
  }, []);

  const restart = () => start(code);

  const answer = (opt) => {
    if (lock) return;
    setPicked(opt); setLock(true);
    const ok = opt === cur.answer;
    if (ok) setScore((s) => s + 10);
    else setLives((l) => Math.max(0, l - 1));
    setTimeout(() => {
      const ni = idx + 1;
      if (!ok && lives - 1 <= 0) { setOver(true); return; }
      if (ni >= quiz.length) { setOver(true); return; }
      setIdx(ni); setPicked(null); setLock(false);
    }, 850);
  };

  const tr = ar ? {
    badge: "تعلّم اللغات", title: "تعلّم اللغات بطريقة ممتعة",
    sub: "٤ لغات، أسئلة تفاعلية، اختر اللغة وابدأ رحلتك مجاناً.",
    start: "ابدأ التعلّم", pick: "اختر لغة", q: "ما معنى هذه الكلمة؟", score: "النقاط",
    result: "النتيجة", again: "العب مجدداً", exit: "رجوع", done: "أحسنت! أكملت الاختبار",
    fail: "انتهت المحاولة", of: "من",
  } : {
    badge: "Learn Languages", title: "Learn languages, playfully",
    sub: "4 languages, interactive quiz — pick one and start your journey free.",
    start: "Start Learning", pick: "Choose a language", q: "What does this word mean?", score: "Score",
    result: "Result", again: "Play again", exit: "Back", done: "Great! You finished the quiz",
    fail: "Out of lives", of: "of",
  };

  return (
    <section className="bg-background pb-16" id="learn-languages">
      <div className="max-w-5xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "0px 0px 100px 0px" }}
          transition={{ duration: 0.6 }}
          className="rounded-[3rem] border border-border bg-card p-8 md:p-12 shadow-2xl relative overflow-hidden"
        >
          <div className="absolute -top-16 -right-10 w-72 h-72 bg-amber-300/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-10 w-72 h-72 bg-violet-500/20 rounded-full blur-3xl pointer-events-none" />

          <AnimatePresence mode="wait">
            {!open ? (
              <motion.div key="promo" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                <div className="shrink-0 w-28 h-28 rounded-full bg-gradient-to-br from-amber-300 to-violet-500 flex items-center justify-center text-5xl shadow-lg">
                  🐝
                </div>
                <div className="flex-1 text-center md:text-left">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-400/15 text-amber-600 dark:text-amber-400 px-3 py-1 text-xs font-bold uppercase tracking-wider mb-3">
                    <Sparkles className="w-3.5 h-3.5" /> {tr.badge}
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-card-foreground mb-2">{tr.title}</h2>
                  <p className="text-muted-foreground text-sm leading-relaxed max-w-md mx-auto md:mx-0 mb-5">{tr.sub}</p>
                  <div className="flex flex-wrap gap-2 justify-center md:justify-start mb-6">
                    {Object.entries(SETS).map(([c, s]) => (
                      <button key={c} onClick={() => start(c)}
                        className="flex items-center gap-2 rounded-full bg-background border border-border px-3.5 py-2 text-sm font-semibold text-card-foreground hover:border-primary/50 hover:-translate-y-0.5 transition-all">
                        <span className="text-lg leading-none">{s.flag}</span> {s.name}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            ) : over ? (
              <motion.div key="over" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
                className="relative z-10 text-center py-6">
                <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-amber-300 to-violet-500 flex items-center justify-center mb-4">
                  <Trophy className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-extrabold text-card-foreground mb-1">{score >= 70 ? tr.done : tr.fail}</h3>
                <p className="text-muted-foreground mb-5">{tr.score}: <span className="font-bold text-primary">{score}</span> / {quiz.length * 10}</p>
                <div className="flex justify-center gap-3">
                  <button onClick={restart} className="inline-flex items-center gap-2 rounded-2xl bg-primary text-primary-foreground px-6 py-3 font-bold hover:scale-[1.03] transition-transform">
                    <RotateCcw className="w-4 h-4" /> {tr.again}
                  </button>
                  <button onClick={() => setOpen(false)} className="inline-flex items-center gap-2 rounded-2xl bg-background border border-border px-6 py-3 font-semibold hover:bg-secondary transition-colors">
                    <ArrowLeft className="w-4 h-4" /> {tr.exit}
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div key="play" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                dir={isRTL ? "rtl" : "ltr"} className="relative z-10 max-w-md mx-auto">
                <div className="flex items-center justify-between mb-4">
                  <button onClick={() => setOpen(false)} className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors">
                    <ArrowLeft className="w-4 h-4" /> {tr.exit}
                  </button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: MAX_LIVES }).map((_, i) => (
                      <Heart key={i} className={`w-4 h-4 ${i < lives ? "text-rose-500 fill-rose-500" : "text-muted-foreground/30"}`} />
                    ))}
                  </div>
                  <div className="flex items-center gap-1.5 text-sm font-bold text-primary">
                    <Trophy className="w-4 h-4" /> {score}
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <Globe className="w-4 h-4 text-primary" />
                  <span className="text-xs font-bold uppercase tracking-wider text-primary">{SETS[code].flag} {SETS[code].name}</span>
                  <span className="ml-auto text-xs text-muted-foreground">{idx + 1} / {quiz.length}</span>
                </div>

                <div className="h-2 rounded-full bg-muted overflow-hidden mb-5">
                  <div className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-300" style={{ width: `${(idx / quiz.length) * 100}%` }} />
                </div>

                <div className="rounded-3xl border border-border bg-background p-6 text-center mb-4">
                  <p className="text-xs text-muted-foreground mb-2">{tr.q}</p>
                  <p className="text-3xl font-extrabold text-card-foreground" dir="ltr">{cur.word}</p>
                </div>

                <div className="grid gap-2.5">
                  {cur.options.map((opt, i) => {
                    const isCorrect = opt === cur.answer;
                    const isPicked = picked === opt;
                    let cls = "border-primary/25 bg-primary/5 hover:bg-primary/12 text-card-foreground";
                    if (lock) {
                      if (isCorrect) cls = "border-emerald-400 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400";
                      else if (isPicked) cls = "border-rose-400 bg-rose-500/15 text-rose-600 dark:text-rose-400";
                      else cls = "border-border bg-muted/40 text-muted-foreground/60";
                    }
                    return (
                      <button key={i} onClick={() => answer(opt)} disabled={lock} dir="rtl"
                        className={`flex items-center justify-center gap-2 h-14 rounded-2xl border-2 font-bold text-lg transition-all active:scale-[0.98] ${cls}`}>
                        {opt}
                        {lock && isCorrect && <Check className="w-5 h-5" />}
                        {lock && isPicked && !isCorrect && <X className="w-5 h-5" />}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}