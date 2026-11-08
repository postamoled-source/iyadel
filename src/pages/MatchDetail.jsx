import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useI18n } from "@/lib/i18n";
import { ArrowLeft, Loader2, RefreshCw } from "lucide-react";
import MatchScoreboard from "@/components/sports/detail/MatchScoreboard";
import MatchTimeline from "@/components/sports/detail/MatchTimeline";
import Lineups from "@/components/sports/detail/Lineups";
import CardsPanel from "@/components/sports/detail/CardsPanel";
import ScorersPanel from "@/components/sports/detail/ScorersPanel";
import { detailText } from "@/components/sports/detail/labels";

const TABS = ["events", "lineups", "cards", "scorers"];

export default function MatchDetail() {
  const { id } = useParams();
  const { lang, isRTL } = useI18n();
  const t = detailText(lang);
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [tab, setTab] = useState("events");

  const load = useCallback(
    async (silent) => {
      if (!silent) {
        setLoading(true);
        setFailed(false);
      }
      try {
        const res = await base44.functions.invoke("sportsCalendar", { action: "match", matchId: id });
        if (res.data?.error) throw new Error(res.data.error);
        setMatch(res.data);
        setFailed(false);
      } catch {
        if (!silent) {
          setMatch(null);
          setFailed(true);
        }
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [id]
  );

  useEffect(() => {
    load(false);
  }, [load]);

  const isLive = match?.status?.type === "live";
  useEffect(() => {
    if (!isLive) return;
    const interval = setInterval(() => load(true), 45_000);
    return () => clearInterval(interval);
  }, [isLive, load]);

  useEffect(() => {
    if (!match) return;
    document.title = `${match.home.name} × ${match.away.name} | iyadel - Explore All Free Tools`;
  }, [match]);

  useEffect(() => {
    if (!failed) return;
    const meta = document.createElement("meta");
    meta.setAttribute("name", "prerender-status-code");
    meta.setAttribute("content", "404");
    document.head.appendChild(meta);
    return () => meta.remove();
  }, [failed]);

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-5 pb-28">
      <Link
        to="/sports"
        className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#6D28D9] dark:text-[#C4B5FD]"
      >
        <ArrowLeft className={`h-3.5 w-3.5 ${isRTL ? "rotate-180" : ""}`} />
        {t.back}
      </Link>

      {loading ? (
        <div className="mt-4 flex items-center justify-center gap-2 rounded-2xl border border-[#F3F4F6] bg-white py-16 text-[11px] text-[#9CA3AF] dark:border-[#4B3F8A] dark:bg-[#2D2A5A]">
          <Loader2 className="h-4 w-4 animate-spin" />
        </div>
      ) : failed || !match ? (
        <div className="mt-4 rounded-2xl border border-dashed border-[#E9D5FF] bg-white px-5 py-10 text-center dark:border-[#4B3F8A] dark:bg-[#2D2A5A]">
          <p className="text-sm font-semibold text-[#111827] dark:text-[#FEF3C7]">
            {id ? t.loadFailed : t.notFound}
          </p>
          <button
            type="button"
            onClick={() => load(false)}
            className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-[#6D28D9] px-3 py-1.5 text-[11px] font-bold text-white"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            {t.retry}
          </button>
        </div>
      ) : (
        <div className="mt-3 space-y-3">
          <MatchScoreboard match={match} lang={lang} />

          <div className="grid grid-cols-4 gap-1 rounded-xl bg-[#F5F3FF] p-1 dark:bg-[#252153]">
            {TABS.map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setTab(key)}
                className={`rounded-lg px-1 py-1.5 text-[10.5px] font-bold transition-all ${
                  tab === key
                    ? "bg-white text-[#6D28D9] shadow-sm dark:bg-[#3B3670] dark:text-[#C4B5FD]"
                    : "text-[#6B7280] dark:text-[#A8A6C4]"
                }`}
              >
                {t.tabs[key]}
              </button>
            ))}
          </div>

          <div className="rounded-2xl border border-[#F3F4F6] bg-white p-3 dark:border-[#4B3F8A] dark:bg-[#2D2A5A]">
            {tab === "events" && <MatchTimeline events={match.events} lang={lang} />}
            {tab === "lineups" && <Lineups match={match} lang={lang} />}
            {tab === "cards" && <CardsPanel match={match} lang={lang} />}
            {tab === "scorers" && <ScorersPanel match={match} lang={lang} />}
          </div>
        </div>
      )}
    </div>
  );
}