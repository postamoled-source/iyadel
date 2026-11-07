import { Image } from "@/components/ui/image";

const L = {
  en: { ft: "FT", vs: "vs", postponed: "Postponed", canceled: "Canceled", today: "Today" },
  ar: { ft: "انتهت", vs: "ضد", postponed: "مؤجلة", canceled: "ملغاة", today: "اليوم" },
};

function Team({ team, align }) {
  return (
    <div
      className={`flex min-w-0 flex-1 items-center gap-1.5 ${
        align === "end" ? "justify-end" : "justify-start"
      }`}
    >
      {align === "end" && (
        <span dir="auto" className="truncate text-[12px] font-semibold text-[#111827] dark:text-[#F8FAFC]">
          {team.name}
        </span>
      )}
      {team.logo ? (
        <Image
          src={team.logo}
          alt={team.name}
          fittingType="fit"
          className="h-6 w-6 shrink-0 object-contain"
        />
      ) : (
        <span className="h-6 w-6 shrink-0 rounded-full bg-[#E5E7EB] dark:bg-[#3B3670]" />
      )}
      {align !== "end" && (
        <span dir="auto" className="truncate text-[12px] font-semibold text-[#111827] dark:text-[#F8FAFC]">
          {team.name}
        </span>
      )}
    </div>
  );
}

export default function MatchRow({ match, lang }) {
  const labels = L[lang] || L.en;
  const { status } = match;
  const played = status.type === "finished" || status.type === "live";
  const time = match.kickoff
    ? new Date(match.kickoff).toLocaleTimeString(lang === "ar" ? "ar-MA" : "en-GB", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  return (
    <div className="flex items-center gap-2 px-3 py-2.5">
      <div className="w-11 shrink-0 text-center">
        {status.type === "live" ? (
          <span className="inline-flex flex-col items-center gap-0.5">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#EF4444]" />
            <span className="text-[10px] font-bold text-[#EF4444]">{status.label || "LIVE"}</span>
          </span>
        ) : status.type === "finished" ? (
          <span className="text-[10px] font-bold text-[#6B7280] dark:text-[#A8A6C4]">{labels.ft}</span>
        ) : status.type === "postponed" || status.type === "canceled" ? (
          <span className="text-[9px] font-bold leading-tight text-[#F59E0B]">
            {status.type === "postponed" ? labels.postponed : labels.canceled}
          </span>
        ) : (
          <span className="text-[11px] font-bold text-[#6D28D9] dark:text-[#C4B5FD]">{time}</span>
        )}
      </div>

      <Team team={match.home} align="end" />

      <div className="w-12 shrink-0 text-center">
        {played ? (
          <span className="text-sm font-black tabular-nums text-[#111827] dark:text-[#FEF3C7]">
            {status.home_score ?? 0} - {status.away_score ?? 0}
          </span>
        ) : (
          <span className="text-[10px] font-semibold text-[#9CA3AF] dark:text-[#8B8AB0]">{labels.vs}</span>
        )}
      </div>

      <Team team={match.away} align="start" />
    </div>
  );
}