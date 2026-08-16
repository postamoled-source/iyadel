import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ArrowRight, Trophy, Sigma } from "lucide-react";

const rand = (n) => Math.floor(Math.random() * n);
const pick = (a) => a[rand(a.length)];

// Eight progressively harder levels: simple arithmetic → functions & roots.
const LEVELS = [
  // 1 — easy + / −
  () => { const a = rand(10) + 1, b = rand(10) + 1, op = pick(["+", "-"]); let x = a, y = b; if (op === "-" && y > x) [x, y] = [y, x]; return { text: `${x} ${op} ${y} = ?`, answer: op === "+" ? x + y : x - y }; },
  // 2 — + − ×
  () => { const a = rand(15) + 2, b = rand(15) + 2, op = pick(["+", "-", "×"]); let x = a, y = b; if (op === "-" && y > x) [x, y] = [y, x]; return { text: `${x} ${op} ${y} = ?`, answer: op === "+" ? x + y : op === "-" ? x - y : x * y }; },
  // 3 — exact division
  () => { const r = rand(8) + 2, b = rand(8) + 2, a = b * r; return { text: `${a} ÷ ${b} = ?`, answer: r }; },
  // 4 — × and ÷ larger
  () => { const op = pick(["×", "÷"]); if (op === "×") { const a = rand(20) + 5, b = rand(9) + 2; return { text: `${a} ${op} ${b} = ?`, answer: a * b }; } const r = rand(10) + 2, b = rand(9) + 2, a = b * r; return { text: `${a} ÷ ${b} = ?`, answer: r }; },
  // 5 — powers and modulo
  () => { const op = pick(["^", "mod"]); if (op === "^") { const a = rand(4) + 2, b = rand(3) + 2; return { text: `${a}^${b} = ?`, answer: Math.pow(a, b) }; } const a = rand(30) + 10, b = rand(9) + 2; return { text: `${a} mod ${b} = ?`, answer: a % b }; },
  // 6 — squares and square roots
  () => { const op = pick(["sq", "sqrt"]); if (op === "sq") { const a = rand(11) + 2; return { text: `${a}² = ?`, answer: a * a }; } const r = rand(12) + 2; return { text: `√${r * r} = ?`, answer: r }; },
  // 7 — factorial and multi-step
  () => { const op = pick(["!", "multi"]); if (op === "!") { const n = rand(4) + 3; let f = 1; for (let i = 2; i <= n; i++) f *= i; return { text: `${n}! = ?`, answer: f }; } const a = rand(9) + 2, b = rand(9) + 2, c = rand(4) + 2; return { text: `${a} × ${b} − ${c} = ?`, answer: a * b - c }; },
  // 8 — advanced: log, trig (clean), mixed
  () => { const k = rand(4); if (k === 0) { const p = rand(3) + 2; return { text: `log₁₀(10^${p}) = ?`, answer: p }; } if (k === 1) { const ang = pick([0, 30, 90, 180]); const fn = pick(["sin", "cos"]); const v = Math.round(Math[fn](ang * Math.PI / 180) * 100) / 100; return { text: `${fn}(${ang}°) = ?`, answer: v }; } if (k === 2) { const a = rand(5) + 2, b = rand(4) + 2; return { text: `${a}^${b} − ${b} = ?`, answer: Math.pow(a, b) - b }; } const r = rand(13) + 2; return { text: `√${r * r} + ${r} = ?`, answer: r * r + r }; },
];

const LEVEL_LABELS = ["L1", "L2", "L3", "L4", "L5", "L6", "L7", "L8"];

export default function MathPuzzleGame() {
  const { t } = useI18n();
  const [level, setLevel] = useState(1);
  const [q, setQ] = useState(() => LEVELS[0]());
  const [ans, setAns] = useState("");
  const [result, setResult] = useState(null);
  const [score, setScore] = useState(0);

  const choose = (lv) => { setLevel(lv); setQ(LEVELS[lv - 1]()); setAns(""); setResult(null); };
  const next = () => { setQ(LEVELS[level - 1]()); setAns(""); setResult(null); };

  const check = () => {
    const val = parseFloat(ans);
    if (isNaN(val)) { setResult({ ok: false, msg: `${t("Wrong. The answer was")} ${q.answer}` }); return; }
    if (Math.abs(val - q.answer) < 0.01) { setScore((s) => s + 1); setResult({ ok: true, msg: t("Correct! 🎉") }); }
    else setResult({ ok: false, msg: `${t("Wrong. The answer was")} ${q.answer}` });
  };

  return (
    <div className="select-none">
      <div className="flex items-center justify-between mb-4 gap-3">
        <div className="rounded-2xl bg-card border border-border px-4 py-2 text-center min-w-[72px] shadow-sm">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{t("Score")}</div>
          <div className="text-xl font-extrabold text-primary tabular-nums">{score}</div>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-violet-500/15 border border-violet-400/30">
          <Sigma className="w-4 h-4 text-violet-400" />
          <span className="text-sm font-bold text-violet-300">{t("Level")} {level}</span>
        </div>
      </div>

      <div className="rounded-2xl bg-gradient-to-br from-violet-500/10 to-amber-300/10 border border-primary/20 p-6 mb-5 text-center">
        <AnimatePresence mode="wait">
          <motion.p key={q.text} dir="ltr" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }} className="text-3xl font-extrabold text-foreground tracking-tight">
            {q.text}
          </motion.p>
        </AnimatePresence>
      </div>

      <input
        type="text"
        inputMode="decimal"
        value={ans}
        onChange={(e) => setAns(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter") check(); }}
        placeholder={t("Your Answer")}
        dir="ltr"
        className="w-full min-h-[52px] rounded-2xl bg-card border border-input px-4 py-3 text-center text-2xl font-bold text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
      />

      <div className="flex flex-wrap justify-center gap-3 mt-5">
        <Button onClick={check} className="rounded-2xl px-6 py-5"><Check className="w-4 h-4 mr-2" />{t("Check")}</Button>
        <Button onClick={next} variant="outline" className="rounded-2xl px-6 py-5"><ArrowRight className="w-4 h-4 mr-2" />{t("Next Puzzle")}</Button>
      </div>

      <div className="mt-6">
        <p className="text-xs text-muted-foreground mb-2 text-center">{t("Pick a level")}</p>
        <div className="grid grid-cols-4 gap-2">
          {LEVEL_LABELS.map((lbl, i) => {
            const lv = i + 1;
            const active = lv === level;
            return (
              <button
                key={lv}
                onClick={() => choose(lv)}
                className={`h-12 rounded-2xl border text-sm font-bold transition-all ${active ? "bg-primary text-primary-foreground border-primary shadow-md scale-105" : "bg-card border-border text-foreground hover:border-primary/60 hover:bg-primary/10"}`}
              >
                {lbl}
              </button>
            );
          })}
        </div>
      </div>

      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className={`mt-5 rounded-2xl p-4 flex items-center gap-3 ${result.ok ? "bg-emerald-500/15 border border-emerald-500/30" : "bg-destructive/15 border border-destructive/30"}`}
          >
            {result.ok ? <Trophy className="w-5 h-5 text-emerald-500" /> : <span className="w-5 h-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center text-xs font-bold">!</span>}
            <div className="text-base font-semibold text-foreground">{result.msg}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}