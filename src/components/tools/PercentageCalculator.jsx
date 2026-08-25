import { useState, useEffect, useMemo } from "react";
import { Percent, Hash, ArrowRight, Calculator } from "lucide-react";
import { useI18n } from "@/lib/i18n";

const translations = {
  en: {
    percentLabel: "What is %",
    valueLabel: "Value",
    result: "Result",
    calculate: "Calculate",
    breakdown: "Breakdown",
    ofLabel: "of",
    formula: "Result = (Percentage × Value) ÷ 100",
    placeholderPct: "25",
    placeholderVal: "1800",
  },
  ar: {
    percentLabel: "ما هي %",
    valueLabel: "القيمة",
    result: "النتيجة",
    calculate: "احسب",
    breakdown: "التفصيل",
    ofLabel: "من",
    formula: "النتيجة = (النسبة × القيمة) ÷ 100",
    placeholderPct: "25",
    placeholderVal: "1800",
  },
};

export default function PercentageCalculator() {
  const { lang, isRTL } = useI18n();
  const tr = translations[lang];
  const [pct, setPct] = useState("");
  const [val, setVal] = useState("");
  const [animatedPct, setAnimatedPct] = useState(0);

  const pctNum = parseFloat(pct) || 0;
  const valNum = parseFloat(val) || 0;
  const result = useMemo(() => (pctNum * valNum) / 100, [pctNum, valNum]);

  useEffect(() => {
    const target = Math.min(Math.max(pctNum, 0), 100);
    let raf;
    const step = () => {
      setAnimatedPct((prev) => {
        const diff = target - prev;
        if (Math.abs(diff) < 0.3) return target;
        const next = prev + diff * 0.18;
        raf = requestAnimationFrame(step);
        return next;
      });
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [pctNum]);

  const activePct = Math.min(Math.max(animatedPct, 0), 100);

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="max-w-[480px] mx-auto w-full box-border overflow-x-hidden">
      <div className="relative bg-white dark:bg-[#1E1B4B] transition-colors duration-300 overflow-hidden rounded-[20px] p-6 shadow-[0_20px_50px_-18px_rgba(109,40,217,0.3)]">
        {/* Labels */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <span className="inline-block rounded-full shrink-0 w-1.5 h-1.5 bg-[#F59E0B]" />
            <span className="font-semibold uppercase tracking-widest truncate text-[11px] text-[#92400E] dark:text-[#FBBF24]">
              {tr.percentLabel}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block rounded-full shrink-0 w-1.5 h-1.5 bg-[#F59E0B]" />
            <span className="font-semibold uppercase tracking-widest truncate text-[11px] text-[#92400E] dark:text-[#FBBF24]">
              {tr.valueLabel}
            </span>
          </div>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-2 gap-4 mt-3">
          <div className="relative">
            <span className="absolute top-1/2 -translate-y-1/2 start-2.5 flex items-center justify-center w-[26px] h-[26px] rounded-full bg-[#FEF3C7]">
              <Percent className="w-3 h-3 text-[#F59E0B]" />
            </span>
            <input
              type="number"
              inputMode="decimal"
              value={pct}
              onChange={(e) => setPct(e.target.value)}
              placeholder={tr.placeholderPct}
              className="outline-none transition-all w-full rounded-2xl border-2 border-[#FDE68A] dark:border-[#4B3F8A] bg-[#FFFBEB] dark:bg-[#2D2A5A] text-[#1E1B4B] dark:text-[#FEF3C7] placeholder:text-gray-400 dark:placeholder:text-[#6B6B8A] font-semibold text-base h-[52px] ps-11 pe-3.5 focus:border-[#F59E0B] focus:shadow-[0_0_0_4px_rgba(245,158,11,0.15)]"
            />
          </div>
          <div className="relative">
            <span className="absolute top-1/2 -translate-y-1/2 start-2.5 flex items-center justify-center w-[26px] h-[26px] rounded-full bg-[#FEF3C7]">
              <Hash className="w-3 h-3 text-[#F59E0B]" />
            </span>
            <input
              type="number"
              inputMode="decimal"
              value={val}
              onChange={(e) => setVal(e.target.value)}
              placeholder={tr.placeholderVal}
              className="outline-none transition-all w-full rounded-2xl border-2 border-[#FDE68A] dark:border-[#4B3F8A] bg-[#FFFBEB] dark:bg-[#2D2A5A] text-[#1E1B4B] dark:text-[#FEF3C7] placeholder:text-gray-400 dark:placeholder:text-[#6B6B8A] font-semibold text-base h-[52px] ps-11 pe-3.5 focus:border-[#F59E0B] focus:shadow-[0_0_0_4px_rgba(245,158,11,0.15)]"
            />
          </div>
        </div>

        {/* Button */}
        <div className="mt-5 flex justify-center">
          <button
            type="button"
            className="relative overflow-hidden transition-transform duration-200 hover:-translate-y-0.5 active:translate-y-0 h-[52px] w-full max-w-[320px] rounded-full p-0.5"
            style={{ background: "linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)", boxShadow: "0 12px 24px -8px rgba(109,40,217,0.5)" }}
          >
            <span
              className="flex items-center justify-center gap-2 w-full h-full rounded-full text-white font-bold text-base"
              style={{ background: "linear-gradient(135deg, #6D28D9 0%, #8B5CF6 100%)" }}
            >
              <Calculator className="w-4 h-4" />
              <span>{tr.calculate}</span>
              <span className="flex items-center justify-center w-[26px] h-[26px] rounded-full bg-white">
                <ArrowRight className="w-3.5 h-3.5 text-[#F59E0B]" style={{ transform: isRTL ? "scaleX(-1)" : "none" }} />
              </span>
            </span>
          </button>
        </div>

        {/* Result */}
        {(pct !== "" || val !== "") && (
          <div
            className="mt-6 bg-[#FFFBEB] dark:bg-[#2D2A5A] border-2 border-[#FDE68A] dark:border-[#4B3F8A] transition-colors duration-300 rounded-[18px] p-[18px]"
            style={{ backgroundImage: "radial-gradient(circle, rgba(245,158,11,0.08) 1px, transparent 1px)", backgroundSize: "14px 14px" }}
          >
            <div className={`flex items-center gap-4 ${isRTL ? "flex-row-reverse" : ""}`}>
              {/* Number */}
              <div className="min-w-0 flex-1">
                <span className="font-semibold uppercase tracking-widest text-[11px] text-[#92400E] dark:text-[#FBBF24]">
                  {tr.result}
                </span>
                <div className="mt-1 inline-block">
                  <span className="font-extrabold leading-none tabular-nums block text-[#1E1B4B] dark:text-[#FEF3C7] text-[42px]">
                    {Number.isFinite(result) && !isNaN(result) ? +result.toFixed(2) : 0}
                  </span>
                  <span className="block h-[5px] bg-[#F59E0B] rounded-full mt-1.5 w-[55%]" />
                </div>
                <p className="mt-2 text-xs text-gray-500 dark:text-[#A8A6C4]">
                  {pctNum} {tr.ofLabel} {valNum}
                </p>
              </div>

              {/* Circular indicator */}
              <div className="relative shrink-0 flex items-center justify-center w-24 h-24 rounded-full border-4 border-[#F59E0B] bg-white dark:bg-[#1E1B4B]">
                <div
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: `conic-gradient(#6D28D9 0%, #F59E0B ${activePct}%, transparent ${activePct}% 100%)`,
                    mask: "radial-gradient(transparent 56%, #000 58%)",
                    WebkitMask: "radial-gradient(transparent 56%, #000 58%)",
                  }}
                />
                <div className="relative flex flex-col items-center justify-center rounded-full bg-white dark:bg-[#1E1B4B] w-[60px] h-[60px] shadow-[inset_0_2px_6px_rgba(109,40,217,0.08)]">
                  <span className="font-extrabold tabular-nums text-[#1E1B4B] dark:text-[#FEF3C7] text-[18px]">
                    {+activePct.toFixed(0)}
                  </span>
                  <span className="text-[10px] font-bold text-[#F59E0B]">%</span>
                </div>
              </div>
            </div>

            <div className={`mt-3 pt-3 border-t border-[#FDE68A] dark:border-[#4B3F8A] text-xs text-gray-500 dark:text-[#A8A6C4] ${isRTL ? "text-right" : ""}`}>
              <span className="font-bold text-[#92400E] dark:text-[#FBBF24]">{tr.breakdown}: </span>
              {tr.formula} → <strong className="text-[#1E1B4B] dark:text-[#FEF3C7]">{+result.toFixed(2)}</strong>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}