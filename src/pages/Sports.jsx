import { useCallback, useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useI18n } from "@/lib/i18n";
import { CalendarDays, Loader2, Radio, RefreshCw, Trophy } from "lucide-react";
import DateStrip, { dayKey } from "@/components/sports/DateStrip";
import LeagueSection from "@/components/sports/LeagueSection";

const TEXT = {
  en: {
    title: "Sports Calendar",
    subtitle: "Football fixtures, live scores and results — all in one place.",
    live: "Live now",
    matches: "matches",
    empty: "No matches scheduled on this day.",
    emptyHint: "Pick another date from the strip above.",
    error: "We couldn't load the matches right now.",
    retry: "Try again",
    updating: "Updating...",
    local: "Kickoff times are shown in your local time.",
  },
  ar: {
    title: "أجندة الرياضة",
    subtitle: "مواعيد المباريات والنتائج الحية في مكان واحد.",
    live: "مباشر الآن",
    matches: "مباراة",
    empty: "لا توجد مباريات في هذا اليوم.",
    emptyHint: "اختر تاريخاً آخر من الأعلى.",
    error: "تعذّر تحميل المباريات حالياً.",
    retry: "إعادة المحاولة",
    updating: "جارٍ التحديث...",
    local: "أوقات المباريات معروضة حسب توقيتك المحلي.",
  },
};

export default function Sports() {
  const { lang } = useI18n();
  const t = TEXT[lang] || TEXT.en;
  const [date, setDate] = useState(() => dayKey(new Date()));
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(async (targetDate, silent) => {
    if (!silent) {
      setLoading(true);
      setError(false);
    }
    try {
      const res = await base44.functions.invoke("sportsCalendar", { date: targetDate });
      if (res.data?.error) throw new Error(res.data.error);
      setData(res.data);
      setError(false);
    } catch {
      if (!silent) {
        setData(null);
        setError(true);
      }
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(date, false);
  }, [date, load]);

  // Live scores refresh themselves while a match is in play.
  const liveCount = useMemo(() => data?.totals?.live || 0, [data]);
  useEffect(() => {
    if (liveCount === 0) return;
    const id = setInterval(() => load(date, true), 60_000);
    return () => clearInterval(id);
  }, [liveCount, date, load]);

  useEffect(() => {
    document.title = `${t.title} | iyadel - Explore All Free Tools`;
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "description");
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", t.subtitle);
    return () => {
      document.title = "iyadel - Explore All Free Tools";
    };
  }, [t.title, t.subtitle]);

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-6 pb-28 space-y-4">
      <div className="flex items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#6D28D9] to-[#F59E0B] shadow-lg">
          <Trophy className="h-5 w-5 text-white" />
        </span>
        <div className="min-w-0 flex-1">
          <h1 className="text-xl font-black text-[#111827] dark:text-[#F8FAFC]">{t.title}</h1>
          <p className="mt-0.5 text-[12px] leading-relaxed text-[#6B7280] dark:text-[#A8A6C4]">{t.subtitle}</p>
        </div>
      </div>

      {liveCount > 0 && (
        <div className="flex items-center gap-2 rounded-xl border border-[#EF4444]/30 bg-[#EF4444]/10 px-3 py-2">
          <Radio className="h-4 w-4 animate-pulse text-[#EF4444]" />
          <span className="text-[11px] font-bold text-[#EF4444]">
            {t.live}: {liveCount}
          </span>
        </div>
      )}

      <DateStrip value={date} onChange={setDate} lang={lang} />

      {loading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-28 animate-pulse rounded-2xl border border-[#F3F4F6] bg-white dark:border-[#4B3F8A] dark:bg-[#2D2A5A]"
            />
          ))}
          <div className="flex items-center justify-center gap-2 pt-2 text-[11px] text-[#9CA3AF]">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            {t.updating}
          </div>
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-dashed border-[#E9D5FF] bg-white px-5 py-8 text-center dark:border-[#4B3F8A] dark:bg-[#2D2A5A]">
          <CalendarDays className="mx-auto mb-2 h-7 w-7 text-[#9CA3AF]" />
          <p className="text-sm font-semibold text-[#111827] dark:text-[#FEF3C7]">{t.error}</p>
          <button
            type="button"
            onClick={() => load(date, false)}
            className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-[#6D28D9] px-3 py-1.5 text-[11px] font-bold text-white"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            {t.retry}
          </button>
        </div>
      ) : !data || data.sections.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#E9D5FF] bg-white px-5 py-8 text-center dark:border-[#4B3F8A] dark:bg-[#2D2A5A]">
          <CalendarDays className="mx-auto mb-2 h-7 w-7 text-[#9CA3AF]" />
          <p className="text-sm font-semibold text-[#111827] dark:text-[#FEF3C7]">{t.empty}</p>
          <p className="mt-1 text-[11px] text-[#6B7280] dark:text-[#A8A6C4]">{t.emptyHint}</p>
        </div>
      ) : (
        <>
          <p className="text-[11px] font-semibold text-[#6B7280] dark:text-[#A8A6C4]">
            {data.totals.matches} {t.matches}
          </p>
          <div className="space-y-3">
            {data.sections.map((section) => (
              <LeagueSection key={section.id} section={section} lang={lang} />
            ))}
          </div>
          <p className="pt-1 text-center text-[10px] text-[#9CA3AF] dark:text-[#8B8AB0]">{t.local}</p>
        </>
      )}
    </div>
  );
}