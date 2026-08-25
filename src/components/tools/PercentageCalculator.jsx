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

  const inputStyle = {
    background: "#FFFBEB",
    border: "2px solid #FDE68A",
    borderRadius: 16,
    height: 52,
    [isRTL ? "paddingRight" : "paddingLeft"]: 44,
    [isRTL ? "paddingLeft" : "paddingRight"]: 14,
    color: "#1E1B4B",
    fontWeight: 600,
    fontSize: 16,
    width: "100%",
  };

  return (
    <div
      dir={isRTL ? "rtl" : "ltr"}
      style={{ maxWidth: 480, margin: "0 auto", width: "100%", boxSizing: "border-box", overflowX: "hidden" }}
    >
      <div
        className="relative bg-white overflow-hidden"
        style={{ borderRadius: 20, padding: 24, boxShadow: "0 20px 50px -18px rgba(109,40,217,0.3)" }}
      >
        {/* Labels */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <span className="inline-block rounded-full shrink-0" style={{ width: 6, height: 6, background: "#F59E0B" }} />
            <span className="font-semibold uppercase tracking-widest truncate" style={{ fontSize: 11, color: "#92400E" }}>
              {tr.percentLabel}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block rounded-full shrink-0" style={{ width: 6, height: 6, background: "#F59E0B" }} />
            <span className="font-semibold uppercase tracking-widest truncate" style={{ fontSize: 11, color: "#92400E" }}>
              {tr.valueLabel}
            </span>
          </div>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-2 gap-4 mt-3">
          <div className="relative">
            <span
              className="absolute top-1/2 -translate-y-1/2 flex items-center justify-center"
              style={{ width: 26, height: 26, borderRadius: 999, background: "#FEF3C7", [isRTL ? "right" : "left"]: 10 }}
            >
              <Percent className="w-3 h-3" style={{ color: "#F59E0B" }} />
            </span>
            <input
              type="number"
              inputMode="decimal"
              value={pct}
              onChange={(e) => setPct(e.target.value)}
              placeholder={tr.placeholderPct}
              className="outline-none transition-all"
              style={inputStyle}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "#F59E0B";
                e.currentTarget.style.boxShadow = "0 0 0 4px rgba(245,158,11,0.15)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "#FDE68A";
                e.currentTarget.style.boxShadow = "none";
              }}
            />
          </div>
          <div className="relative">
            <span
              className="absolute top-1/2 -translate-y-1/2 flex items-center justify-center"
              style={{ width: 26, height: 26, borderRadius: 999, background: "#FEF3C7", [isRTL ? "right" : "left"]: 10 }}
            >
              <Hash className="w-3 h-3" style={{ color: "#F59E0B" }} />
            </span>
            <input
              type="number"
              inputMode="decimal"
              value={val}
              onChange={(e) => setVal(e.target.value)}
              placeholder={tr.placeholderVal}
              className="outline-none transition-all"
              style={inputStyle}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "#F59E0B";
                e.currentTarget.style.boxShadow = "0 0 0 4px rgba(245,158,11,0.15)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "#FDE68A";
                e.currentTarget.style.boxShadow = "none";
              }}
            />
          </div>
        </div>

        {/* Button */}
        <div className="mt-5 flex justify-center">
          <button
            type="button"
            className="relative overflow-hidden transition-transform duration-200 hover:-translate-y-0.5 active:translate-y-0"
            style={{
              height: 52,
              width: "100%",
              maxWidth: 320,
              borderRadius: 9999,
              padding: 2,
              background: "linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)",
              boxShadow: "0 12px 24px -8px rgba(109,40,217,0.5)",
            }}
          >
            <span
              className="flex items-center justify-center gap-2 w-full h-full rounded-full text-white font-bold"
              style={{ background: "linear-gradient(135deg, #6D28D9 0%, #8B5CF6 100%)", fontSize: 16 }}
            >
              <Calculator className="w-4 h-4" />
              <span>{tr.calculate}</span>
              <span className="flex items-center justify-center" style={{ width: 26, height: 26, borderRadius: 999, background: "#fff" }}>
                <ArrowRight className="w-3.5 h-3.5" style={{ color: "#F59E0B", transform: isRTL ? "scaleX(-1)" : "none" }} />
              </span>
            </span>
          </button>
        </div>

        {/* Result */}
        {(pct !== "" || val !== "") && (
          <div
            className="mt-6"
            style={{
              background: "#FFFBEB",
              backgroundImage: "radial-gradient(circle, rgba(245,158,11,0.08) 1px, transparent 1px)",
              backgroundSize: "14px 14px",
              borderRadius: 18,
              padding: 18,
            }}
          >
            <div className={`flex items-center gap-4 ${isRTL ? "flex-row-reverse" : ""}`}>
              {/* Number */}
              <div className="min-w-0 flex-1">
                <span className="font-semibold uppercase tracking-widest" style={{ fontSize: 11, color: "#92400E" }}>
                  {tr.result}
                </span>
                <div className="mt-1 inline-block">
                  <span className="font-extrabold leading-none tabular-nums block" style={{ color: "#1E1B4B", fontSize: 42 }}>
                    {Number.isFinite(result) && !isNaN(result) ? +result.toFixed(2) : 0}
                  </span>
                  <span className="block" style={{ height: 5, background: "#F59E0B", borderRadius: 999, marginTop: 6, width: "55%" }} />
                </div>
                <p className="mt-2 text-xs" style={{ color: "#6B7280" }}>
                  {pctNum} {tr.ofLabel} {valNum}
                </p>
              </div>

              {/* Circular indicator */}
              <div
                className="relative shrink-0 flex items-center justify-center"
                style={{ width: 96, height: 96, borderRadius: 999, border: "4px solid #F59E0B", background: "#fff" }}
              >
                <div
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: `conic-gradient(#6D28D9 0%, #F59E0B ${activePct}%, transparent ${activePct}% 100%)`,
                    mask: "radial-gradient(transparent 56%, #000 58%)",
                    WebkitMask: "radial-gradient(transparent 56%, #000 58%)",
                  }}
                />
                <div
                  className="relative flex flex-col items-center justify-center rounded-full bg-white"
                  style={{ width: 60, height: 60, boxShadow: "inset 0 2px 6px rgba(109,40,217,0.08)" }}
                >
                  <span className="font-extrabold tabular-nums" style={{ color: "#1E1B4B", fontSize: 18 }}>
                    {+activePct.toFixed(0)}
                  </span>
                  <span className="text-[10px] font-bold" style={{ color: "#F59E0B" }}>%</span>
                </div>
              </div>
            </div>

            <div className={`mt-3 pt-3 border-t border-amber-200 text-xs ${isRTL ? "text-right" : ""}`} style={{ color: "#6B7280" }}>
              <span className="font-bold" style={{ color: "#92400E" }}>{tr.breakdown}: </span>
              {tr.formula} → <strong style={{ color: "#1E1B4B" }}>{+result.toFixed(2)}</strong>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}