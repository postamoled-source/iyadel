import { useState, useMemo } from "react";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Check, RefreshCw, Sparkles, Trophy } from "lucide-react";

const rand = (n) => Math.floor(Math.random() * n);

const WORDS = [
  "PLANET", "GARDEN", "BRIDGE", "PUZZLE", "LAPTOP", "GUITAR", "CASTLE", "BOTTLE",
  "FOREST", "ORANGE", "DRAGON", "ROCKET", "MIRROR", "SILVER", "JUNGLE", "PENCIL",
  "MOON LIGHT", "STAR FISH", "ICE CREAM", "SUN FLOWER", "RAIN BOW", "KEY BOARD",
  "DAY DREAM", "BOOK SHELF", "SAND WICH", "SNOW MAN", "FIRE WORK", "CUP CAKE",
];

function scrambleLetters(w) {
  if (w.length < 2) return w;
  let s = w;
  let guard = 0;
  while (s === w && guard++ < 20) {
    const arr = w.split("");
    for (let i = arr.length - 1; i > 0; i--) { const j = rand(i + 1); [arr[i], arr[j]] = [arr[j], arr[i]]; }
    s = arr.join("");
  }
  return s;
}

export default function WordScrambleGame() {
  const { t } = useI18n();
  const [word, setWord] = useState(() => WORDS[rand(WORDS.length)]);
  const [guess, setGuess] = useState("");
  const [result, setResult] = useState(null);
  const [score, setScore] = useState(0);

  const words = useMemo(() => word.split(" "), [word]);
  const scrambledWords = useMemo(() => words.map(scrambleLetters), [words]);
  const totalLetters = useMemo(() => word.replace(/\s/g, "").length, [word]);

  const next = () => {
    let w = WORDS[rand(WORDS.length)];
    if (w === word) w = WORDS[(WORDS.indexOf(word) + 1) % WORDS.length];
    setWord(w); setGuess(""); setResult(null);
  };

  const check = () => {
    const norm = (s) => s.trim().toUpperCase().replace(/\s+/g, " ");
    if (norm(guess) === norm(word)) { setScore((s) => s + 1); setResult({ ok: true, msg: t("Correct! 🎉") }); }
    else setResult({ ok: false, msg: `${t("Wrong. The word was")} "${word}"` });
  };

  return (
    <div className="select-none">
      <div className="flex items-center justify-between mb-4">
        <div className="rounded-2xl bg-card border border-border px-4 py-2 text-center min-w-[72px] shadow-sm">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{t("Score")}</div>
          <div className="text-xl font-extrabold text-primary tabular-nums">{score}</div>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="px-2.5 py-1 rounded-full bg-violet-500/15 border border-violet-400/30 text-violet-300 font-bold">{words.length} {t("words")}</span>
          <span className="px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-400/30 text-amber-300 font-bold">{totalLetters} {t("letters")}</span>
        </div>
      </div>

      <div className="rounded-3xl bg-gradient-to-br from-violet-500/10 to-sky-400/10 border border-primary/20 p-5 mb-5">
        <p className="text-xs text-muted-foreground mb-3 text-center">{t("Unscramble the letters:")}</p>
        <div dir="ltr" className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2">
          {scrambledWords.map((sw, wi) => (
            <div key={wi} className="flex items-center gap-1.5">
              {wi > 0 && <span className="w-2 h-2 rounded-full bg-primary/40 mx-1" />}
              {sw.split("").map((ch, ci) => (
                <motion.div
                  key={`${wi}-${ci}`}
                  initial={{ opacity: 0, scale: 0.6, rotate: -8 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  transition={{ delay: (wi * 0.05) + ci * 0.03, type: "spring", stiffness: 320, damping: 18 }}
                  className="w-10 h-12 rounded-xl bg-gradient-to-br from-primary to-violet-600 text-primary-foreground flex items-center justify-center text-xl font-extrabold shadow-md"
                >
                  {ch}
                </motion.div>
              ))}
            </div>
          ))}
        </div>
      </div>

      <input
        type="text"
        value={guess}
        onChange={(e) => setGuess(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter") check(); }}
        placeholder={words.length > 1 ? t("Type the phrase") : t("Type the word")}
        dir="ltr"
        className="w-full min-h-[52px] rounded-2xl bg-card border border-input px-4 py-3 text-center text-xl font-bold text-foreground uppercase tracking-wider outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
      />

      <div className="flex flex-wrap justify-center gap-3 mt-5">
        <Button onClick={check} className="rounded-2xl px-6 py-5"><Check className="w-4 h-4 mr-2" />{t("Check")}</Button>
        <Button onClick={next} variant="outline" className="rounded-2xl px-6 py-5"><RefreshCw className="w-4 h-4 mr-2" />{t("New Word")}</Button>
      </div>

      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className={`mt-5 rounded-2xl p-4 flex items-center gap-3 ${result.ok ? "bg-emerald-500/15 border border-emerald-500/30" : "bg-destructive/15 border border-destructive/30"}`}
          >
            {result.ok ? <Sparkles className="w-5 h-5 text-emerald-500" /> : <Trophy className="w-5 h-5 text-destructive" />}
            <div className="text-base font-semibold text-foreground">{result.msg}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}