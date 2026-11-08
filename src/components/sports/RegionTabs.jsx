export default function RegionTabs({ regions, value, onChange, lang }) {
  if (!regions || regions.length < 2) return null;

  const allLabel = lang === "ar" ? "الكل" : "All";
  const tabs = [{ key: "all", label: allLabel }, ...regions.map((r) => ({
    key: r.key,
    label: lang === "ar" ? r.name_ar : r.name,
  }))];

  return (
    <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {tabs.map((tab) => {
        const active = tab.key === value;
        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => onChange(tab.key)}
            className={`shrink-0 rounded-full border px-3 py-1.5 text-[11px] font-bold transition-all ${
              active
                ? "border-transparent bg-[#6D28D9] text-white shadow-sm"
                : "border-[#EDE9FE] bg-white text-[#6B7280] hover:border-[#6D28D9]/40 dark:border-[#4B3F8A] dark:bg-[#2D2A5A] dark:text-[#A8A6C4]"
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}