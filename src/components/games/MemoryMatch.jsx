import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { RotateCcw, Trophy } from "lucide-react";

const SYMBOLS = ["🚀", "⚡", "🎯", "💎", "🔥", "🌟", "🛡", "✦"];

function deal() {
  const pairs = [...SYMBOLS, ...SYMBOLS];
  for (let i = pairs.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [pairs[i], pairs[j]] = [pairs[j], pairs[i]]; }
  return pairs.map((s, i) => ({ id: i, sym: s }));
}

export default function MemoryMatch() {
  const { t } = useI18n();
  const [cards, setCards] = useState(deal);
  const [faceUp, setFaceUp] = useState([]);
  const [matched, setMatched] = useState([]);
  const [moves, setMoves] = useState(0);
  const [busy, setBusy] = useState(false);
  const won = matched.length === cards.length;

  const flip = (idx) => {
    if (busy || matched.includes(idx) || faceUp.includes(idx) || faceUp.length >= 2) return;
    const nf = [...faceUp, idx];
    setFaceUp(nf);
    if (nf.length === 2) {
      setMoves((m) => m + 1);
      const [a, b] = nf;
      if (cards[a].sym === cards[b].sym) {
        setTimeout(() => { setMatched((m) => [...m, a, b]); setFaceUp([]); }, 320);
      } else {
        setBusy(true);
        setTimeout(() => { setFaceUp([]); setBusy(false); }, 800);
      }
    }
  };

  const restart = () => { setCards(deal()); setFaceUp([]); setMatched([]); setMoves(0); setBusy(false); };

  return (
    <div className="select-none">
      <div className="flex items-center justify-between mb-4 gap-3">
        <div className="flex gap-3">
          <div className="rounded-2xl bg-card border border-border px-4 py-2 text-center min-w-[72px]">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{t("Moves")}</div>
            <div className="text-xl font-extrabold text-foreground tabular-nums">{moves}</div>
          </div>
          <div className="rounded-2xl bg-card border border-border px-4 py-2 text-center min-w-[72px]">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{t("Pairs")}</div>
            <div className="text-xl font-extrabold text-primary tabular-nums">{matched.length / 2}/{SYMBOLS.length}</div>
          </div>
        </div>
        <Button onClick={restart} variant="outline" className="rounded-2xl px-4 py-4"><RotateCcw className="w-4 h-4 mr-2" />{t("New Game")}</Button>
      </div>

      <div className="relative mx-auto w-fit">
        <div className="grid grid-cols-4 gap-2.5" style={{ width: "min(80vw, 340px)" }}>
          {cards.map((card, i) => {
            const up = faceUp.includes(i) || matched.includes(i);
            const done = matched.includes(i);
            return (
              <button key={card.id} onClick={() => flip(i)}
                className={`aspect-square rounded-xl flex items-center justify-center text-3xl transition-all duration-200 border ${done ? "bg-primary/10 border-primary opacity-70" : up ? "bg-card border-primary scale-105" : "bg-secondary border-border hover:border-primary/40"}`}>
                {up ? card.sym : <span className="text-muted-foreground/40 text-2xl">?</span>}
              </button>
            );
          })}
        </div>

        {won && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-background/80 backdrop-blur-sm rounded-2xl animate-[fadeIn_0.3s_ease-out]">
            <div className="flex items-center gap-2 text-2xl font-extrabold text-foreground"><Trophy className="w-6 h-6 text-accent" /> {t("You win!")}</div>
            <div className="text-sm text-muted-foreground">{t("Moves")}: <span className="font-bold text-foreground">{moves}</span></div>
            <Button onClick={restart} className="bg-primary text-primary-foreground rounded-2xl px-6 py-5">{t("Play again")}</Button>
          </div>
        )}
      </div>

      <p className="mt-5 text-center text-xs text-muted-foreground">{t("Flip two cards at a time and find every matching pair.")}</p>
    </div>
  );
}