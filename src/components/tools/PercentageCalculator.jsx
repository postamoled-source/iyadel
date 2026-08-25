import { useState, useEffect, useMemo } from "react";
import { Percent, Hash, ArrowRight, Calculator } from "lucide-react";
import { useI18n } from "@/lib/i18n";

const translations = {
  en: {
    title: "Percentage Calculator",
    subtitle: "Quickly calculate percentages with professional accuracy",
    percentLabel: "What is",
    percentOf: "of",
    result: "Result",
    calculate: "Calculate",
    breakdown: "Breakdown",
    valueLabel: "Value",
    ofLabel: "of",
    equals: "equals",
    placeholderPct: "25",
    placeholderVal: "1800",
    formula: "Result = (Percentage × Value) ÷ 100",
  },
  ar: {
    title: "حاسبة النسبة المئوية",
    subtitle: "احسب النسب المئوية بدقة احترافية",
    percentLabel: "ما هي نسبة",
    percentOf: "من",
    result: "النتيجة",
    calculate: "احسب",
    breakdown: "التفصيل",
    valueLabel: "القيمة",
    ofLabel: "من",
    equals: "تساوي",
    placeholderPct: "25",
    placeholderVal: "1800",
    formula: "النتيجة = (النسبة × القيمة) ÷ 100",
  },
};

export default function PercentageCalculator() {
  const { lang, setLang, isRTL } = useI18n();
  const tr = translations[lang];
  const [pct, setPct] = useState("");
  const [val, setVal] = useState("");
  const [animatedPct, setAnimatedPct] = useState(0);

  const pctNum = parseFloat(pct) || 0;
  const valNum = parseFloat(val) || 0;
  const result = useMemo(() => (pctNum * valNum) / 100, [pctNum, valNum]);

  // Animate the circular indicator toward the live percentage.
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
    <div
      dir={isRTL ? "rtl" : "ltr"}
      className="relative w-full"
      style={{
        background: "linear-gradient(180deg, #FEF3C7 0%, #FDE68A 50%, #DDD6FE 100%)",
        borderRadius: 32,
        padding: 28,
        fontFamily: "inherit",
      }}
    >
      {/* Floating decorations */}
      <span className="pointer-events-none absolute rounded-full bg-amber-400 opacity-30" style={{ width: 8, height: 8, top: 18, [isRTL ? "left" : "right"]: 24 }} />
      <span className="pointer-events-none absolute rounded-full bg-amber-400 opacity-30" style={{ width: 12, height: 12, bottom: 30, [isRTL ? "right" : "left"]: 16 }} />
      <span className="pointer-events-none absolute rounded-full bg-amber-400 opacity-30" style={{ width: 6, height: 6, top: 120, [isRTL ? "left" : "right"]: 8 }} />

      {/* Language toggle */}
      <div className={`absolute top-4 ${isRTL ? "left-4" : "right-4"} z-20`}>
        <div className="flex items-center gap-1 rounded-full bg-white/80 border border-amber-200 p-1 shadow-sm">
          <button
            onClick={() => setLang("en")}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${
              lang === "en" ? "bg-[#6D28D9] text-white" : "text-gray-500 hover:text-[#6D28D9]"
            }`}
          >
            EN
          </button>
          <button
            onClick={() => setLang("ar")}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${
              lang === "ar" ? "bg-[#6D28D9] text-white" : "text-gray-500 hover:text-[#6D28D9]"
            }`}
          >
            عربي
          </button>
        </div>
      </div>

      {/* Card */}
      <div
        className="relative bg-white shadow-2xl overflow-hidden"
        style={{
          borderRadius: 32,
          boxShadow: "0 25px 80px -20px rgba(109,40,217,0.4)",
          borderTop: "2px solid #F59E0B",
        }}
      >
        {/* Header */}
        <div className={`flex items-center gap-4 p-6 ${isRTL ? "flex-row-reverse" : ""}`}>
          <div
            className="flex items-center justify-center shrink-0"
            style={{
              width: 48,
              height: 48,
              borderRadius: 14,
              background: "linear-gradient(135deg, #6D28D9 0%, #F59E0B 100%)",
              boxShadow: "0 8px 20px -4px rgba(109,40,217,0.5)",
            }}
          >
            <Percent className="w-6 h-6 text-white" />
          </div>
          <div className="min-w-0">
            <h2 className="font-extrabold tracking-tight leading-tight" style={{ color: "#1E1B4B", fontSize: 36 }}>
              {tr.title}
            </h2>
            <div className={`mt-1 ${isRTL ? "border-r-[3px] pr-3" : "border-l-[3px] pl-3"}`} style={{ borderColor: "#F59E0B" }}>
              <p className="text-sm" style={{ color: "#6B7280" }}>
                {tr.subtitle}
              </p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 pb-7">
          {/* Labels */}
          <div className={`grid grid-cols-2 gap-4 ${isRTL ? "text-right" : ""}`}>
            <div className="flex items-center gap-2">
              <span className="inline-block rounded-full" style={{ width: 6, height: 6, background: "#F59E0B" }} />
              <span className="font-semibold uppercase tracking-widest" style={{ fontSize: 11, color: "#92400E" }}>
                {tr.percentLabel} %
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-block rounded-full" style={{ width: 6, height: 6, background: "#F59E0B" }} />
              <span className="font-semibold uppercase tracking-widest" style={{ fontSize: 11, color: "#92400E" }}>
                {tr.valueLabel}
              </span>
            </div>
          </div>

          {/* Inputs */}
          <div className="grid grid-cols-2 gap-4 mt-3">
            <div className="relative">
              <span
                className="absolute top-1/2 -translate-y-1/2 flex items-center justify-center z-10"
                style={{ width: 28, height: 28, borderRadius: 999, background: "#FEF3C7", [isRTL ? "right" : "left"]: 12 }}
              >
                <Percent className="w-3.5 h-3.5" style={{ color: "#F59E0B" }} />
              </span>
              <input
                type="number"
                inputMode="decimal"
                value={pct}
                onChange={(e) => setPct(e.target.value)}
                placeholder={tr.placeholderPct}
                className="w-full outline-none transition-all"
                style={{
                  background: "#FFFBEB",
                  border: "2px solid #FDE68A",
                  borderRadius: 16,
                  height: 52,
                  [isRTL ? "paddingRight" : "paddingLeft"]: 48,
                  [isRTL ? "paddingLeft" : "paddingRight"]: 16,
                  color: "#1E1B4B",
                  fontWeight: 600,
                }}
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
                className="absolute top-1/2 -translate-y-1/2 flex items-center justify-center z-10"
                style={{ width: 28, height: 28, borderRadius: 999, background: "#FEF3C7", [isRTL ? "right" : "left"]: 12 }}
              >
                <Hash className="w-3.5 h-3.5" style={{ color: "#F59E0B" }} />
              </span>
              <input
                type="number"
                inputMode="decimal"
                value={val}
                onChange={(e) => setVal(e.target.value)}
                placeholder={tr.placeholderVal}
                className="w-full outline-none transition-all"
                style={{
                  background: "#FFFBEB",
                  border: "2px solid #FDE68A",
                  borderRadius: 16,
                  height: 52,
                  [isRTL ? "paddingRight" : "paddingLeft"]: 48,
                  [isRTL ? "paddingLeft" : "paddingRight"]: 16,
                  color: "#1E1B4B",
                  fontWeight: 600,
                }}
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
          <div className="mt-6 flex justify-center">
            <button
              type="button"
              className="group relative overflow-hidden transition-transform duration-200 hover:-translate-y-0.5 hover:scale-[1.02] active:translate-y-0 active:scale-100"
              style={{
                height: 56,
                width: "100%",
                borderRadius: 9999,
                padding: 2,
                background: "linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)",
                boxShadow: "0 12px 24px -6px rgba(109,40,217,0.5)",
              }}
            >
              <span
                className="flex items-center justify-center gap-3 w-full h-full rounded-full text-white font-bold"
                style={{ background: "linear-gradient(135deg, #6D28D9 0%, #8B5CF6 100%)", fontSize: 16 }}
              >
                <span
                  className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{
                    background: "linear-gradient(110deg, transparent 30%, rgba(255,255,255,0.25) 50%, transparent 70%)",
                    backgroundSize: "200% 100%",
                    animation: "shimmer 2s linear infinite",
                  }}
                />
                <Calculator className="w-5 h-5 relative z-10" />
                <span className="relative z-10">{tr.calculate}</span>
                <span
                  className="relative z-10 flex items-center justify-center"
                  style={{ width: 28, height: 28, borderRadius: 999, background: "#fff" }}
                >
                  <ArrowRight className="w-4 h-4" style={{ color: "#F59E0B", transform: isRTL ? "scaleX(-1)" : "none" }} />
                </span>
              </span>
            </button>
          </div>

          {/* Result area */}
          {(pct !== "" || val !== "") && (
            <div
              className="mt-7 relative overflow-hidden"
              style={{
                background: "#FFFBEB",
                backgroundImage: "radial-gradient(circle, rgba(245,158,11,0.08) 1px, transparent 1px)",
                backgroundSize: "14px 14px",
                borderRadius: 24,
                padding: 22,
              }}
            >
              <div className={`flex items-center justify-between gap-4 ${isRTL ? "flex-row-reverse" : ""}`}>
                {/* Left: huge number */}
                <div className="min-w-0 flex-1">
                  <span className="font-semibold uppercase tracking-widest" style={{ fontSize: 11, color: "#92400E" }}>
                    {tr.result}
                  </span>
                  <div className="mt-1 relative inline-block">
                    <span
                      className="font-extrabold leading-none tabular-nums"
                      style={{ color: "#1E1B4B", fontSize: 56 }}
                    >
                      {Number.isFinite(result) && !isNaN(result) ? +result.toFixed(2) : 0}
                    </span>
                    <span
                      className="block"
                      style={{ height: 6, background: "#F59E0B", borderRadius: 999, marginTop: 6, width: "60%" }}
                    />
                  </div>
                  <p className="mt-3 text-sm" style={{ color: "#6B7280" }}>
                    {pctNum} {tr.ofLabel} {valNum}
                  </p>
                </div>

                {/* Right: circular indicator */}
                <div
                  className="relative shrink-0 flex items-center justify-center"
                  style={{ width: 120, height: 120, borderRadius: 999, border: "4px solid #F59E0B", background: "#fff" }}
                >
                  <div
                    className="absolute inset-0 rounded-full"
                    style={{
                      background: `conic-gradient(#6D28D9 0%, #F59E0B ${activePct}%, transparent ${activePct}% 100%)`,
                      mask: "radial-gradient(transparent 58%, #000 60%)",
                      WebkitMask: "radial-gradient(transparent 58%, #000 60%)",
                    }}
                  />
                  <div
                    className="relative flex flex-col items-center justify-center rounded-full bg-white"
                    style={{ width: 78, height: 78, boxShadow: "inset 0 2px 6px rgba(109,40,217,0.08)" }}
                  >
                    <span className="font-extrabold tabular-nums" style={{ color: "#1E1B4B", fontSize: 22 }}>
                      {+activePct.toFixed(0)}
                    </span>
                    <span className="text-xs font-bold" style={{ color: "#F59E0B" }}>%</span>
                  </div>
                </div>
              </div>

              {/* Formula breakdown */}
              <div className={`mt-4 pt-4 border-t border-amber-200 text-xs ${isRTL ? "text-right" : ""}`} style={{ color: "#6B7280" }}>
                <span className="font-bold" style={{ color: "#92400E" }}>{tr.breakdown}: </span>
                {tr.formula} → <strong style={{ color: "#1E1B4B" }}>{+result.toFixed(2)}</strong>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }`}</style>
    </div>
  );
}