import { ArrowLeftRight } from "lucide-react";
import { detailText } from "./labels";

function CardIcon({ color }) {
  return <span className={`inline-block h-3.5 w-2.5 shrink-0 rounded-[2px] ${color}`} />;
}

function EventContent({ event, t, align }) {
  const alignClass = align === "home" ? "items-end text-end" : "items-start text-start";

  if (event.kind === "goal") {
    return (
      <div className={`flex flex-col ${alignClass}`}>
        <span className="inline-flex items-center gap-1 text-[11.5px] font-bold text-[#111827] dark:text-[#F8FAFC]">
          <span aria-hidden>⚽</span>
          <span dir="auto" className="truncate">{event.player}</span>
        </span>
        <span className="text-[9px] font-semibold text-[#6B7280] dark:text-[#A8A6C4]">
          {event.own_goal ? t.ownGoal : event.penalty ? t.penalty : event.assist ? `${t.assist}: ${event.assist}` : ""}
        </span>
      </div>
    );
  }

  if (event.kind === "yellow" || event.kind === "red") {
    return (
      <div className={`flex flex-col ${alignClass}`}>
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#111827] dark:text-[#F8FAFC]">
          <CardIcon color={event.kind === "red" ? "bg-[#EF4444]" : "bg-[#FBBF24]"} />
          <span dir="auto" className="truncate">{event.player}</span>
        </span>
        {event.reason && <span className="text-[9px] text-[#6B7280] dark:text-[#A8A6C4]">{event.reason}</span>}
      </div>
    );
  }

  if (event.kind === "sub") {
    return (
      <div className={`flex flex-col ${alignClass}`}>
        <span className="inline-flex items-center gap-1 text-[10.5px] font-semibold text-[#059669] dark:text-[#6EE7B7]">
          <ArrowLeftRight className="h-3 w-3 shrink-0" />
          <span dir="auto" className="truncate">{event.player_in}</span>
        </span>
        <span dir="auto" className="text-[9.5px] font-medium text-[#9CA3AF] line-through dark:text-[#8B8AB0]">
          {event.player_out}
        </span>
      </div>
    );
  }

  return null;
}

export default function MatchTimeline({ events, lang }) {
  const t = detailText(lang);
  const rows = (events || []).filter((e) => e.kind !== "postponed");

  if (rows.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-[#EDE9FE] px-4 py-6 text-center text-[11px] text-[#9CA3AF] dark:border-[#4B3F8A]">
        {t.noEvents}
      </p>
    );
  }

  return (
    <div className="space-y-0.5">
      {rows.map((event, index) =>
        event.kind === "half" ? (
          <div key={index} className="flex items-center gap-2 py-2">
            <span className="h-px flex-1 bg-[#EDE9FE] dark:bg-[#4B3F8A]" />
            <span className="rounded-full bg-[#F5F3FF] px-2 py-0.5 text-[9px] font-bold text-[#6D28D9] dark:bg-[#3B3670] dark:text-[#C4B5FD]">
              {event.label} · {event.minute}
            </span>
            <span className="h-px flex-1 bg-[#EDE9FE] dark:bg-[#4B3F8A]" />
          </div>
        ) : (
          <div key={index} className="grid grid-cols-[1fr_40px_1fr] items-center gap-1 py-1.5">
            <div className="min-w-0">{event.side === "home" && <EventContent event={event} t={t} align="home" />}</div>
            <div className="text-center">
              <span className="text-[10px] font-bold tabular-nums text-[#6B7280] dark:text-[#A8A6C4]">{event.minute}</span>
            </div>
            <div className="min-w-0">{event.side === "away" && <EventContent event={event} t={t} align="away" />}</div>
          </div>
        )
      )}
    </div>
  );
}