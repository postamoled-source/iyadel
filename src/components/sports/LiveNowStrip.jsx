import { Link } from "react-router-dom";
import { Radio } from "lucide-react";
import { Image } from "@/components/ui/image";

function TeamLine({ team }) {
  return (
    <div className="flex min-w-0 items-center gap-1.5">
      {team.logo ? (
        <Image src={team.logo} alt={team.name} fittingType="fit" className="h-4 w-4 shrink-0 object-contain" />
      ) : (
        <span className="h-4 w-4 shrink-0 rounded-full bg-[#E5E7EB] dark:bg-[#3B3670]" />
      )}
      <span dir="auto" className="truncate text-[11px] font-semibold text-[#111827] dark:text-[#F8FAFC]">
        {team.name}
      </span>
      <span className="ms-auto shrink-0 text-[12px] font-black tabular-nums text-[#EF4444]">
        {team.score ?? 0}
      </span>
    </div>
  );
}

export default function LiveNowStrip({ matches, lang }) {
  if (!matches?.length) return null;

  return (
    <section className="space-y-2">
      <header className="flex items-center gap-2">
        <Radio className="h-3.5 w-3.5 animate-pulse text-[#EF4444]" />
        <h2 className="text-[12px] font-black uppercase tracking-wide text-[#EF4444]">
          {lang === "ar" ? "مباشر الآن" : "Live now"}
        </h2>
        <span className="text-[10px] font-bold text-[#9CA3AF]">{matches.length}</span>
        <span className="h-px flex-1 bg-[#F3F4F6] dark:bg-[#4B3F8A]" />
      </header>

      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {matches.map((match) => (
          <Link
            key={match.id}
            to={`/sports/match/${match.id}`}
            className="w-[210px] shrink-0 space-y-1.5 rounded-2xl border border-[#EF4444]/30 bg-white p-2.5 shadow-[0_4px_12px_rgba(239,68,68,0.08)] dark:border-[#EF4444]/40 dark:bg-[#2D2A5A]"
          >
            <div className="flex items-center gap-1.5">
              <span className="truncate text-[9.5px] font-bold uppercase tracking-wide text-[#6B7280] dark:text-[#A8A6C4]">
                {lang === "ar" ? match.competition_ar || match.competition : match.competition}
              </span>
              <span className="ms-auto shrink-0 rounded-full bg-[#EF4444] px-1.5 py-0.5 text-[9px] font-black text-white">
                {match.status.label || "LIVE"}
              </span>
            </div>
            <div className="space-y-1">
              <TeamLine team={match.home} />
              <TeamLine team={match.away} />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}