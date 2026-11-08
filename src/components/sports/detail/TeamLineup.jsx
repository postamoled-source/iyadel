import { detailText } from "./labels";

function Pitch({ lineup }) {
  return (
    <div className="relative w-full overflow-hidden rounded-xl bg-gradient-to-b from-[#12884a] to-[#0a5c30]" style={{ aspectRatio: "4 / 3" }}>
      <span className="pointer-events-none absolute inset-2 rounded-lg border border-white/25" />
      <span className="pointer-events-none absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/25" />
      <span className="pointer-events-none absolute inset-x-2 top-1/2 h-px bg-white/25" />
      {lineup.starters.map((player, index) => (
        <div
          key={index}
          className="absolute flex w-14 -translate-x-1/2 -translate-y-1/2 flex-col items-center"
          style={{
            left: `${Math.min(96, Math.max(4, (player.x ?? 0.5) * 100))}%`,
            top: `${Math.min(96, Math.max(4, (player.y ?? 0.5) * 100))}%`,
          }}
        >
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-[9px] font-black text-[#0a5c30] shadow">
            {player.number || "–"}
          </span>
          <span dir="auto" className="mt-0.5 max-w-[56px] truncate text-[7.5px] font-semibold text-white/90">
            {player.name.split(" ").slice(-1)[0]}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function TeamLineup({ lineup, team, lang, accent }) {
  const t = detailText(lang);
  if (!lineup || lineup.starters.length === 0) return null;

  return (
    <div className="rounded-2xl border border-[#F3F4F6] bg-white p-3 dark:border-[#4B3F8A] dark:bg-[#2D2A5A]">
      <div className="mb-2 flex items-center gap-2">
        <span className={`h-2 w-2 rounded-full ${accent}`} />
        <h4 dir="auto" className="flex-1 truncate text-[12px] font-bold text-[#111827] dark:text-[#FEF3C7]">
          {team}
        </h4>
        {lineup.formation && (
          <span className="rounded-md bg-[#F5F3FF] px-1.5 py-0.5 text-[9px] font-bold text-[#6D28D9] dark:bg-[#3B3670] dark:text-[#C4B5FD]">
            {lineup.formation}
          </span>
        )}
      </div>

      <Pitch lineup={lineup} />

      <p className="mt-2 text-[9px] font-bold uppercase tracking-wide text-[#9CA3AF]">{t.starters}</p>
      <ul className="mt-1 grid grid-cols-2 gap-x-2 gap-y-0.5">
        {lineup.starters.map((player, index) => (
          <li key={index} className="flex min-w-0 items-center gap-1.5">
            <span className="w-3.5 shrink-0 text-[9px] font-black tabular-nums text-[#6D28D9] dark:text-[#C4B5FD]">
              {player.number}
            </span>
            <span dir="auto" className="truncate text-[10px] font-medium text-[#374151] dark:text-[#E5E7EB]">
              {player.name}
            </span>
          </li>
        ))}
      </ul>

      {lineup.subs.length > 0 && (
        <>
          <p className="mt-2 text-[9px] font-bold uppercase tracking-wide text-[#9CA3AF]">{t.subs}</p>
          <ul className="mt-1 flex flex-wrap gap-x-2 gap-y-0.5">
            {lineup.subs.map((player, index) => (
              <li key={index} dir="auto" className="text-[10px] text-[#6B7280] dark:text-[#A8A6C4]">
                {player.number ? `${player.number} ` : ""}
                {player.name}
              </li>
            ))}
          </ul>
        </>
      )}

      {lineup.coach && (
        <p dir="auto" className="mt-2 border-t border-[#F3F4F6] pt-1.5 text-[10px] text-[#6B7280] dark:border-[#4B3F8A] dark:text-[#A8A6C4]">
          <span className="font-bold">{t.coach}: </span>
          {lineup.coach}
        </p>
      )}
    </div>
  );
}