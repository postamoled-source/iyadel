import { dayKey } from "./DateStrip";

const TEXT = {
  en: { yesterday: "Yesterday", today: "Today", tomorrow: "Tomorrow", results: "Results" },
  ar: { yesterday: "الأمس", today: "اليوم", tomorrow: "الغد", results: "النتائج" },
};

const OFFSETS = [
  { offset: -1, key: "yesterday" },
  { offset: 0, key: "today" },
  { offset: 1, key: "tomorrow" },
];

export default function DayTabs({ value, onChange, lang }) {
  const t = TEXT[lang] || TEXT.en;
  const base = new Date();
  base.setHours(12, 0, 0, 0);

  const tabs = OFFSETS.map(({ offset, key }) => {
    const d = new Date(base);
    d.setDate(base.getDate() + offset);
    return { key, label: t[key], date: d, value: dayKey(d) };
  });

  const locale = lang === "ar" ? "ar-MA" : "en-GB";

  return (
    <div className="grid grid-cols-3 gap-1 rounded-xl border border-[#F3F4F6] bg-white p-1 dark:border-[#4B3F8A] dark:bg-[#2D2A5A]">
      {tabs.map((tab) => {
        const active = tab.value === value;
        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => onChange(tab.value)}
            className={`rounded-lg px-2 py-1.5 text-center transition-colors ${
              active
                ? "bg-[#6D28D9] text-white shadow-sm"
                : "text-[#6B7280] hover:bg-[#F5F3FF] dark:text-[#A8A6C4] dark:hover:bg-[#332F63]"
            }`}
          >
            <span className="block text-[11px] font-bold leading-tight">{tab.label}</span>
            <span className={`block text-[9px] font-semibold ${active ? "text-white/80" : "text-[#9CA3AF]"}`}>
              {tab.date.toLocaleDateString(locale, { day: "numeric", month: "short" })}
            </span>
          </button>
        );
      })}
    </div>
  );
}