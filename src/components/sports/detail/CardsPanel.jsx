import { detailText } from "./labels";

function CardRow({ player, minute }) {
  return (
    <li className="flex items-center gap-1.5 py-1">
      <span className="h-3.5 w-2.5 shrink-0 rounded-[2px] bg-[#EF4444]" />
      <span dir="auto" className="min-w-0 flex-1 truncate text-[10.5px] font-medium text-[#374151] dark:text-[#E5E7EB]">
        {player}
      </span>
      <span className="shrink-0 text-[9px] font-bold tabular-nums text-[#9CA3AF]">{minute}</span>
    </li>
  );
}

function YellowRow({ player, minute }) {
  return (
    <li className="flex items-center gap-1.5 py-1">
      <span className="h-3.5 w-2.5 shrink-0 rounded-[2px] bg-[#FBBF24]" />
      <span dir="auto" className="min-w-0 flex-1 truncate text-[10.5px] font-medium text-[#374151] dark:text-[#E5E7EB]">
        {player}
      </span>
      <span className="shrink-0 text-[9px] font-bold tabular-nums text-[#9CA3AF]">{minute}</span>
    </li>
  );
}

export default function CardsPanel({ match, lang }) {
  const t = detailText(lang);
  const events = match.events || [];
  const forSide = (side, kind) => events.filter((e) => e.side === side && e.kind === kind);

  const hasCards = events.some((e) => e.kind === "yellow" || e.kind === "red");
  if (!hasCards) {
    return (
      <p className="rounded-xl border border-dashed border-[#EDE9FE] px-4 py-6 text-center text-[11px] text-[#9CA3AF] dark:border-[#4B3F8A]">
        {t.noCards}
      </p>
    );
  }

  const sides = [
    { key: "home", name: match.home.name },
    { key: "away", name: match.away.name },
  ];

  return (
    <div className="grid grid-cols-2 gap-2">
      {sides.map((side) => (
        <div key={side.key} className="rounded-2xl border border-[#F3F4F6] bg-white p-2.5 dark:border-[#4B3F8A] dark:bg-[#2D2A5A]">
          <h4 dir="auto" className="mb-1 truncate text-[11px] font-bold text-[#111827] dark:text-[#FEF3C7]">
            {side.name}
          </h4>
          {forSide(side.key, "yellow").length > 0 && (
            <>
              <p className="text-[9px] font-bold uppercase tracking-wide text-[#F59E0B]">{t.yellow}</p>
              <ul>
                {forSide(side.key, "yellow").map((e, i) => (
                  <YellowRow key={i} player={e.player} minute={e.minute} />
                ))}
              </ul>
            </>
          )}
          {forSide(side.key, "red").length > 0 && (
            <>
              <p className="mt-1 text-[9px] font-bold uppercase tracking-wide text-[#EF4444]">{t.red}</p>
              <ul>
                {forSide(side.key, "red").map((e, i) => (
                  <CardRow key={i} player={e.player} minute={e.minute} />
                ))}
              </ul>
            </>
          )}
          {forSide(side.key, "yellow").length === 0 && forSide(side.key, "red").length === 0 && (
            <p className="py-1 text-[10px] text-[#9CA3AF]">—</p>
          )}
        </div>
      ))}
    </div>
  );
}