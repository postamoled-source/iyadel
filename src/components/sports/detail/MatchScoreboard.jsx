import { Image } from "@/components/ui/image";
import { MapPin, Trophy } from "lucide-react";
import { detailText } from "./labels";

function TeamColumn({ team, red }) {
  return (
    <div className="flex min-w-0 flex-col items-center gap-1">
      {team.logo ? (
        <Image src={team.logo} alt={team.name} fittingType="fit" className="h-12 w-12 object-contain" />
      ) : (
        <span className="h-12 w-12 rounded-full bg-[#E5E7EB] dark:bg-[#3B3670]" />
      )}
      <span dir="auto" className="line-clamp-2 text-center text-[11px] font-bold leading-tight text-[#111827] dark:text-[#FEF3C7]">
        {team.name}
      </span>
      {red > 0 && <span className="h-3 w-2 rounded-[2px] bg-[#EF4444]" />}
    </div>
  );
}

export default function MatchScoreboard({ match, lang }) {
  const t = detailText(lang);
  const status = match.status;
  const statusText =
    status.type === "finished"
      ? t.ft
      : status.type === "live"
      ? status.label || t.live
      : status.type === "postponed"
      ? t.postponed
      : status.type === "canceled"
      ? t.canceled
      : t.upcoming;

  const started = status.type === "finished" || status.type === "live";
  const dateText = match.kickoff
    ? new Date(match.kickoff).toLocaleString(lang === "ar" ? "ar-MA" : "en-GB", {
        weekday: "long",
        day: "numeric",
        month: "long",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";
  const competition = lang === "ar" ? match.competition_ar || match.competition : match.competition;

  return (
    <div className="rounded-2xl border border-[#F3F4F6] bg-white p-4 shadow-[0_4px_12px_rgba(109,40,217,0.08)] dark:border-[#4B3F8A] dark:bg-[#2D2A5A]">
      <div className="flex items-center justify-center gap-1.5 text-[11px] font-bold text-[#6D28D9] dark:text-[#C4B5FD]">
        <Trophy className="h-3.5 w-3.5" />
        <span dir="auto" className="truncate">
          {competition}
          {match.round ? ` · ${t.round} ${match.round}` : ""}
        </span>
      </div>

      <div className="mt-3 grid grid-cols-3 items-start gap-2">
        <TeamColumn team={match.home} red={status.home_red} />

        <div className="flex flex-col items-center gap-1.5 pt-2">
          <div
            dir="ltr"
            className="text-2xl font-black tabular-nums text-[#111827] dark:text-white"
          >
            {started ? `${status.home_score ?? 0} - ${status.away_score ?? 0}` : "VS"}
          </div>
          <span
            className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${
              status.type === "live"
                ? "animate-pulse bg-[#EF4444]/15 text-[#EF4444]"
                : status.type === "finished"
                ? "bg-[#059669]/12 text-[#059669] dark:bg-[#059669]/25 dark:text-[#6EE7B7]"
                : "bg-[#6D28D9]/10 text-[#6D28D9] dark:bg-[#6D28D9]/25 dark:text-[#C4B5FD]"
            }`}
          >
            {statusText}
          </span>
        </div>

        <TeamColumn team={match.away} red={status.away_red} />
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 border-t border-[#F3F4F6] pt-2.5 text-[10px] text-[#6B7280] dark:border-[#4B3F8A] dark:text-[#A8A6C4]">
        <span>{dateText}</span>
        {match.venue && (
          <span className="inline-flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            <span dir="auto">{match.venue}</span>
          </span>
        )}
      </div>
    </div>
  );
}