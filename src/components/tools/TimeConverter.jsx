import { useState, useMemo } from "react";
import { useI18n } from "@/lib/i18n";
import { ArrowLeftRight, RotateCcw, Clock, Timer } from "lucide-react";

const UNITS = [
  { key: "s", factor: 1 },
  { key: "min", factor: 60 },
  { key: "h", factor: 3600 },
  { key: "d", factor: 86400 },
  { key: "w", factor: 604800 },
  { key: "mo", factor: 2629800, approx: true },
  { key: "y", factor: 31557600, approx: true },
];

const T = {
  en: {
    instant: "Instant Conversion",
    allUnits: "Value in All Units",
    value: "Value",
    from: "From",
    to: "To",
    result: "Result",
    swap: "Swap units",
    reset: "Reset",
    decimalTitle: "Hours & Minutes → Decimal Hours",
    hours: "Hours",
    minutes: "Minutes",
    decimalHours: "decimal hours",
    unit: { s: "second", min: "minute", h: "hour", d: "day", w: "week", mo: "month", y: "year" },
    unitPl: { s: "seconds", min: "minutes", h: "hours", d: "days", w: "weeks", mo: "months", y: "years" },
    approx: "(approx.)",
    avg: "(average)",
    noteTitle: "Note",
    noteText:
      "Month and year are average values, not fixed. We use year = 365.25 days (accounting for leap years), and month = 365.25 ÷ 12 ≈ 30.44 days.",
    swapped: "Units swapped",
    resetDone: "Reset done",
    targetMark: "◄",
  },
  ar: {
    instant: "التحويل الفوري",
    allUnits: "القيمة بكل الوحدات",
    value: "القيمة",
    from: "من",
    to: "إلى",
    result: "النتيجة",
    swap: "تبديل الوحدات",
    reset: "إعادة تعيين",
    decimalTitle: "تحويل الساعات والدقائق إلى ساعات عشرية",
    hours: "ساعات",
    minutes: "دقائق",
    decimalHours: "ساعة عشرية (decimal hours)",
    unit: { s: "ثانية", min: "دقيقة", h: "ساعة", d: "يوم", w: "أسبوع", mo: "شهر", y: "سنة" },
    unitPl: { s: "ثانية", min: "دقيقة", h: "ساعة", d: "يوم", w: "أسبوع", mo: "شهر", y: "سنة" },
    approx: "(تقريبي)",
    avg: "(متوسط)",
    noteTitle: "ملاحظة",
    noteText:
      "الشهر والسنة قيمتان متوسطتان، وليستا ثابتتين. استخدمنا السنة = 365.25 يوماً (لمراعاة السنوات الكبيسة)، والشهر = 365.25 ÷ 12 ≈ 30.44 يوماً.",
    swapped: "تم تبديل الوحدات",
    resetDone: "تم إعادة التعيين",
    targetMark: "◄",
  },
};

function formatNumber(n) {
  if (!isFinite(n)) return "—";
  if (n === 0) return "0";
  const abs = Math.abs(n);
  if (abs >= 1e15 || (abs < 1e-6 && abs > 0)) return n.toExponential(4);
  if (Math.abs(n - Math.round(n)) < 1e-10) return String(Math.round(n));
  return String(Math.round(n * 1e6) / 1e6);
}

export default function TimeConverter() {
  const { lang, isRTL } = useI18n();
  const tr = T[lang];
  const dir = isRTL ? "rtl" : "ltr";

  const [inputValue, setInputValue] = useState("1");
  const [fromKey, setFromKey] = useState("h");
  const [toKey, setToKey] = useState("min");
  const [decHours, setDecHours] = useState("7");
  const [decMinutes, setDecMinutes] = useState("45");
  const [toast, setToast] = useState(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2000);
  };

  const fromFactor = UNITS.find((u) => u.key === fromKey)?.factor || 1;
  const toFactor = UNITS.find((u) => u.key === toKey)?.factor || 1;
  const toUnit = UNITS.find((u) => u.key === toKey);

  const result = useMemo(() => {
    const val = parseFloat(inputValue);
    if (isNaN(val)) return null;
    return val * (fromFactor / toFactor);
  }, [inputValue, fromFactor, toFactor]);

  const baseSeconds = useMemo(() => {
    const val = parseFloat(inputValue);
    if (isNaN(val)) return 0;
    return val * fromFactor;
  }, [inputValue, fromFactor]);

  const decimalResult = useMemo(() => {
    let h = parseInt(decHours, 10) || 0;
    let m = parseInt(decMinutes, 10) || 0;
    if (m > 59) { h += Math.floor(m / 60); m = m % 60; setDecHours(String(h)); setDecMinutes(String(m)); }
    if (m < 0) { m = 0; setDecMinutes("0"); }
    if (h < 0) { h = 0; setDecHours("0"); }
    return Math.round((h + m / 60) * 1000) / 1000;
  }, [decHours, decMinutes]);

  const swapUnits = () => {
    setFromKey(toKey);
    setToKey(fromKey);
    showToast(tr.swapped);
  };

  const resetAll = () => {
    setInputValue("1");
    setFromKey("h");
    setToKey("min");
    setDecHours("7");
    setDecMinutes("45");
    showToast(tr.resetDone);
  };

  const unitLabel = (u, count) => {
    const label = count === 1 ? tr.unit[u.key] : tr.unitPl[u.key];
    return u.approx ? `${label} ${tr.approx}` : label;
  };

  const inputClass =
    "w-full rounded-xl border-2 border-[#FDE68A] dark:border-[#4B3F8A] bg-[#FFFBEB] dark:bg-[#2D2A5A] text-[#1E1B4B] dark:text-[#FEF3C7] font-semibold text-base h-[46px] px-3.5 outline-none transition-all focus:border-[#F59E0B] focus:shadow-[0_0_0_4px_rgba(245,158,11,0.15)]";
  const selectClass = inputClass + " cursor-pointer";
  const labelClass = "block text-[11px] font-semibold uppercase tracking-wider text-[#92400E] dark:text-[#FBBF24] mb-1.5";

  return (
    <div dir={dir} className="grid lg:grid-cols-2 gap-4">
      {/* ── Main converter + decimal hours ── */}
      <div className="bg-white dark:bg-[#1E1B4B] rounded-[18px] border border-[#FDE68A] dark:border-[#4B3F8A] shadow-[0_4px_12px_rgba(109,40,217,0.08)] overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#F3F4F6] dark:border-[#4B3F8A]">
          <h3 className="flex items-center gap-2 text-sm font-bold text-[#111827] dark:text-[#FEF3C7]">
            <span className="w-2 h-2 rounded-full bg-[#6D28D9]" />
            {tr.instant}
          </h3>
          <button onClick={resetAll} title={tr.reset} className="w-7 h-7 rounded-lg border border-[#E9D5FF] dark:border-[#4B3F8A] text-[#6B7280] dark:text-[#A8A6C4] grid place-items-center hover:border-[#6D28D9] hover:text-[#6D28D9] transition-colors">
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="p-5">
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex-1 min-w-[80px]">
              <label className={labelClass}>{tr.value}</label>
              <input type="number" inputMode="decimal" value={inputValue} step="any" dir="ltr"
                onChange={(e) => setInputValue(e.target.value)} className={inputClass} />
            </div>

            <button onClick={swapUnits} title={tr.swap}
              className="shrink-0 w-[46px] h-[46px] rounded-full border-2 border-[#FDE68A] dark:border-[#4B3F8A] bg-white dark:bg-[#2D2A5A] text-[#6D28D9] grid place-items-center hover:bg-[#6D28D9] hover:text-white hover:rotate-180 transition-all mb-0">
              <ArrowLeftRight className="w-4 h-4" />
            </button>

            <div className="flex-1 min-w-[90px]">
              <label className={labelClass}>{tr.from}</label>
              <select value={fromKey} onChange={(e) => setFromKey(e.target.value)} className={selectClass}>
                {UNITS.map((u) => (
                  <option key={u.key} value={u.key}>{tr.unitPl[u.key]}</option>
                ))}
              </select>
            </div>

            <div className="flex-1 min-w-[90px]">
              <label className={labelClass}>{tr.to}</label>
              <select value={toKey} onChange={(e) => setToKey(e.target.value)} className={selectClass}>
                {UNITS.map((u) => (
                  <option key={u.key} value={u.key}>{tr.unitPl[u.key]}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Result */}
          <div className="mt-4 rounded-xl border-2 border-[#FDE68A] dark:border-[#4B3F8A] bg-gradient-to-br from-[#FFFBEB] to-[#FEF9C3] dark:from-[#2D2A5A] dark:to-[#1E1B4B] p-4 text-center">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-[#92400E] dark:text-[#FBBF24]">{tr.result}</div>
            <div className="text-[28px] font-extrabold tabular-nums text-[#6D28D9] dark:text-[#FEF3C7] leading-tight mt-0.5 break-all font-mono">
              {result === null ? "—" : formatNumber(result)}
            </div>
            <div className="text-sm text-[#6B7280] dark:text-[#A8A6C4] mt-0.5">
              {toUnit ? unitLabel(toUnit, Math.abs(result) === 1 ? 1 : 2) : ""}
            </div>
          </div>

          {/* Decimal hours section */}
          <div className="mt-5 pt-4 border-t border-[#F3F4F6] dark:border-[#4B3F8A]">
            <h4 className="flex items-center gap-1.5 text-sm font-bold text-[#111827] dark:text-[#FEF3C7] mb-3">
              <Clock className="w-4 h-4 text-[#F59E0B]" />
              {tr.decimalTitle}
            </h4>
            <div className="flex gap-3 items-end">
              <div className="flex-1 min-w-[70px]">
                <label className="block text-[11px] font-semibold text-[#92400E] dark:text-[#FBBF24] mb-1.5">{tr.hours}</label>
                <input type="number" inputMode="numeric" min="0" step="1" value={decHours} dir="ltr"
                  onChange={(e) => setDecHours(e.target.value)}
                  className={inputClass + " text-center"} />
              </div>
              <div className="flex-1 min-w-[70px]">
                <label className="block text-[11px] font-semibold text-[#92400E] dark:text-[#FBBF24] mb-1.5">{tr.minutes}</label>
                <input type="number" inputMode="numeric" min="0" max="59" step="1" value={decMinutes} dir="ltr"
                  onChange={(e) => setDecMinutes(e.target.value)}
                  className={inputClass + " text-center"} />
              </div>
            </div>
            <div className="mt-3 rounded-xl border-2 border-[#FDE68A] dark:border-[#4B3F8A] bg-[#FEF9C3] dark:bg-[#2D2A5A] p-3.5 text-center">
              <div className="text-[24px] font-extrabold tabular-nums text-[#b45309] dark:text-[#FBBF24] font-mono">{decimalResult}</div>
              <div className="text-xs text-[#92400E] dark:text-[#FBBF24] mt-0.5">{tr.decimalHours}</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── All units table ── */}
      <div className="bg-white dark:bg-[#1E1B4B] rounded-[18px] border border-[#FDE68A] dark:border-[#4B3F8A] shadow-[0_4px_12px_rgba(109,40,217,0.08)] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#F3F4F6] dark:border-[#4B3F8A]">
          <h3 className="flex items-center gap-2 text-sm font-bold text-[#111827] dark:text-[#FEF3C7]">
            <span className="w-2 h-2 rounded-full bg-[#F59E0B]" />
            {tr.allUnits}
          </h3>
        </div>
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#FFFBEB] dark:bg-[#2D2A5A]">
                <th className="px-4 py-2.5 text-start font-semibold text-[11px] uppercase tracking-wider text-[#92400E] dark:text-[#FBBF24]">{tr.from}</th>
                <th className="px-4 py-2.5 text-center font-semibold text-[11px] uppercase tracking-wider text-[#92400E] dark:text-[#FBBF24]">{tr.result}</th>
              </tr>
            </thead>
            <tbody>
              {UNITS.map((u) => {
                const converted = baseSeconds / u.factor;
                const isTarget = u.key === toKey;
                return (
                  <tr key={u.key} className="border-t border-[#F3F4F6] dark:border-[#4B3F8A]">
                    <td className="px-4 py-2.5 text-[#374151] dark:text-[#D6D2EE] font-medium">
                      {tr.unitPl[u.key]} {u.approx && <span className="text-[10px] text-[#9CA3AF] dark:text-[#8B8AB0]">{tr.avg}</span>}
                    </td>
                    <td className={`px-4 py-2.5 text-center font-mono font-semibold ${isTarget ? "text-[#6D28D9] dark:text-[#FBBF24]" : "text-[#111827] dark:text-[#FEF3C7]"}`}>
                      {formatNumber(converted)} {isTarget && <span className="text-[#F59E0B]">{tr.targetMark}</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-[#F3F4F6] dark:border-[#4B3F8A]">
          <div className="flex items-start gap-2 text-xs text-[#78350f] dark:text-[#FBBF24] bg-[#FEF9C3] dark:bg-[#2D2A5A] rounded-lg px-3 py-2.5 leading-relaxed">
            <Timer className="w-4 h-4 shrink-0 mt-0.5 text-[#F59E0B]" />
            <span><strong>{tr.noteTitle}:</strong> {tr.noteText}</span>
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 end-6 z-[1000] bg-[#1E1B4B] dark:bg-[#FEF3C7] text-white dark:text-[#1E1B4B] px-4 py-2.5 rounded-xl text-sm font-medium shadow-[0_10px_40px_rgba(109,40,217,0.3)] animate-[fadeIn_0.2s_ease-out]">
          {toast}
        </div>
      )}
    </div>
  );
}