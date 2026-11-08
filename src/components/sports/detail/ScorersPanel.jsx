import { detailText } from "./labels";

export default function ScorersPanel({ match, lang }) {
  const t = detailText(lang);
  const goals = (match.events || []).filter((e) => e.kind === "goal");

  if (goals.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-[#EDE9FE] px-4 py-6 text-center text-[11px] text-[#9CA3AF] dark:border-[#4B3F8A]">
        {t.noScorers}
      </p>
    );
  }

  const sides = [
    { key: "home", name: match.home.name },
    { key: "away", name: match.away.name },
  ];

  return (
    <div className="grid grid-cols-2 gap-2">
      {sides.map((side) => {
        const list = goals.filter((g) => g.side === side.key);
        return (
          <div key={side.key} className="rounded-2xl border border-[#F3F4F6] bg-white p-2.5 dark:border-[#4B3F8A] dark:bg-[#2D2A5A]">
            <h4 dir="auto" className="mb-1 truncate text-[11px] font-bold text-[#111827] dark:text-[#FEF3C7]">
              {side.name}
            </h4>
            {list.length === 0 ? (
              <p className="py-1 text-[10px] text-[#9CA3AF]">—</p>
            ) : (
              <ul className="space-y-1">
                {list.map((goal, index) => (
                  <li key={index} className="flex items-start gap-1.5">
                    <span aria-hidden className="text-[10px] leading-4">⚽</span>
                    <span className="min-w-0 flex-1">
                      <span dir="auto" className="block truncate text-[10.5px] font-semibold text-[#374151] dark:text-[#E5E7EB]">
                        {goal.player}
                      </span>
                      <span className="block text-[9px] text-[#9CA3AF]">
                        {goal.minute}
                        {goal.penalty ? ` · ${t.penalty}` : ""}
                        {goal.own_goal ? ` · ${t.ownGoal}` : ""}
                        {goal.assist ? ` · ${t.assist}: ${goal.assist}` : ""}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      })}
    </div>
  );
}