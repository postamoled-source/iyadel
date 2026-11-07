const DAYS_BACK = 3;
const DAYS_AHEAD = 7;

export function dayKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function buildDays() {
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  const days = [];
  for (let i = -DAYS_BACK; i <= DAYS_AHEAD; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    days.push({ key: dayKey(d), date: d, offset: i });
  }
  return days;
}

export default function DateStrip({ value, onChange, lang }) {
  const days = buildDays();
  const locale = lang === "ar" ? "ar-MA" : "en-GB";

  const shortLabel = (day) => {
    if (day.offset === 0) return lang === "ar" ? "اليوم" : "Today";
    if (day.offset === 1) return lang === "ar" ? "غداً" : "Tmrw";
    if (day.offset === -1) return lang === "ar" ? "أمس" : "Yest.";
    return day.date.toLocaleDateString(locale, { weekday: "short" });
  };

  return (
    <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {days.map((day) => {
        const active = day.key === value;
        return (
          <button
            key={day.key}
            type="button"
            onClick={() => onChange(day.key)}
            className={`flex w-14 shrink-0 flex-col items-center gap-0.5 rounded-xl border px-1 py-1.5 transition-all ${
              active
                ? "border-[#6D28D9] bg-[#6D28D9] text-white shadow-md"
                : "border-[#F3F4F6] bg-white text-[#6B7280] hover:border-[#6D28D9]/40 dark:border-[#4B3F8A] dark:bg-[#2D2A5A] dark:text-[#A8A6C4]"
            }`}
          >
            <span className="text-[9px] font-bold uppercase tracking-wide">{shortLabel(day)}</span>
            <span className={`text-sm font-black ${active ? "text-white" : "text-[#111827] dark:text-[#F8FAFC]"}`}>
              {day.date.getDate()}
            </span>
            <span className={`text-[9px] font-medium ${active ? "text-white/80" : "text-[#9CA3AF] dark:text-[#8B8AB0]"}`}>
              {day.date.toLocaleDateString(locale, { month: "short" })}
            </span>
          </button>
        );
      })}
    </div>
  );
}