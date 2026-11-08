import { Image } from "@/components/ui/image";

const LABELS = {
  en: { team: "Team", played: "P", wins: "W", draws: "D", losses: "L", diff: "GD", points: "Pts", group: "Group" },
  ar: { team: "الفريق", played: "ل", wins: "ف", draws: "ت", losses: "خ", diff: "فارق", points: "نقاط", group: "مجموعة" },
};

export default function StandingsTable({ group, lang }) {
  const L = LABELS[lang] || LABELS.en;
  const cols = "grid grid-cols-[18px_minmax(0,1fr)_22px_22px_22px_22px_28px_30px] items-center gap-1";

  return (
    <section className="overflow-hidden rounded-2xl border border-[#F3F4F6] bg-white shadow-[0_4px_12px_rgba(109,40,217,0.08)] dark:border-[#4B3F8A] dark:bg-[#2D2A5A]">
      {group.name && (
        <header className="border-b border-[#F3F4F6] bg-[#FAFAFF] px-3 py-1.5 text-[11px] font-bold text-[#6D28D9] dark:border-[#4B3F8A] dark:bg-[#252153] dark:text-[#C4B5FD]">
          {L.group} {group.name}
        </header>
      )}

      <div className={`${cols} border-b border-[#F3F4F6] bg-[#FAFAFF] px-2 py-1.5 text-[9px] font-bold uppercase text-[#9CA3AF] dark:border-[#4B3F8A] dark:bg-[#252153]`}>
        <span>#</span>
        <span>{L.team}</span>
        <span className="text-center">{L.played}</span>
        <span className="text-center">{L.wins}</span>
        <span className="text-center">{L.draws}</span>
        <span className="text-center">{L.losses}</span>
        <span className="text-center">{L.diff}</span>
        <span className="text-center">{L.points}</span>
      </div>

      <div className="divide-y divide-[#F3F4F6] dark:divide-[#4B3F8A]">
        {group.rows.map((row) => (
          <div key={`${row.id}-${row.position}`} className={`${cols} px-2 py-2`}>
            <div className="flex items-center gap-1">
              <span
                className="h-4 w-[3px] shrink-0 rounded-full"
                style={{ backgroundColor: row.color || "transparent" }}
              />
              <span className="text-[10px] font-bold tabular-nums text-[#6B7280] dark:text-[#A8A6C4]">
                {row.position}
              </span>
            </div>

            <div className="flex min-w-0 items-center gap-1.5">
              {row.logo ? (
                <Image src={row.logo} alt={row.name} fittingType="fit" className="h-4 w-4 shrink-0 object-contain" />
              ) : (
                <span className="h-4 w-4 shrink-0 rounded-full bg-[#E5E7EB] dark:bg-[#3B3670]" />
              )}
              <span dir="auto" className="truncate text-[11px] font-semibold text-[#111827] dark:text-[#F8FAFC]">
                {row.name}
              </span>
            </div>

            <span className="text-center text-[10px] tabular-nums text-[#6B7280] dark:text-[#A8A6C4]">{row.played}</span>
            <span className="text-center text-[10px] tabular-nums text-[#6B7280] dark:text-[#A8A6C4]">{row.wins}</span>
            <span className="text-center text-[10px] tabular-nums text-[#6B7280] dark:text-[#A8A6C4]">{row.draws}</span>
            <span className="text-center text-[10px] tabular-nums text-[#6B7280] dark:text-[#A8A6C4]">{row.losses}</span>
            <span className="text-center text-[10px] font-semibold tabular-nums text-[#111827] dark:text-[#F8FAFC]">
              {row.diff > 0 ? `+${row.diff}` : row.diff}
            </span>
            <span className="text-center text-[11px] font-black tabular-nums text-[#111827] dark:text-[#FEF3C7]">
              {row.points}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}