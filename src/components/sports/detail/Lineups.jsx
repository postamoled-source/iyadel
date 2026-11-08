import { detailText } from "./labels";
import TeamLineup from "./TeamLineup";

export default function Lineups({ match, lang }) {
  const t = detailText(lang);
  const { home, away } = match.lineups || {};

  if (!home && !away) {
    return (
      <p className="rounded-xl border border-dashed border-[#EDE9FE] px-4 py-6 text-center text-[11px] text-[#9CA3AF] dark:border-[#4B3F8A]">
        {t.noLineups}
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <TeamLineup lineup={home} team={match.home.name} lang={lang} accent="bg-[#6D28D9]" />
      <TeamLineup lineup={away} team={match.away.name} lang={lang} accent="bg-[#F59E0B]" />
    </div>
  );
}