import { useCallback, useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import MobileSelect from "@/components/MobileSelect";
import StandingsTable from "./StandingsTable";
import MatchRow from "./MatchRow";
import { Loader2, RefreshCw, Table2, Trophy } from "lucide-react";

const TEXT = {
  en: {
    pick: "Choose a competition",
    loading: "Loading the table...",
    error: "We couldn't load this table right now.",
    retry: "Try again",
    knockout: "This competition is played as a knockout, so it has no league table.",
    knockoutHint: "Pick a league competition to see its standings.",
    legend: "Key",
    season: "Season",
    fixtures: "Fixtures & results",
    knockoutNote: "This competition is played as a knockout — here are its next matches and latest results.",
  },
  ar: {
    pick: "اختر البطولة",
    loading: "جارٍ تحميل الترتيب...",
    error: "تعذّر تحميل جدول الترتيب حالياً.",
    retry: "إعادة المحاولة",
    knockout: "هذه البطولة بنظام خروج المغلوب، ولا يوجد لها جدول ترتيب.",
    knockoutHint: "اختر بطولة دوري لعرض ترتيبها.",
    legend: "الدلالات",
    season: "الموسم",
    fixtures: "المباريات والنتائج",
    knockoutNote: "هذه البطولة بنظام خروج المغلوب — إليك أقرب مبارياتها وأحدث نتائجها.",
  },
};

const LEGEND_AR = {
  "Qualification next stage": "تأهل للدور التالي",
  "Possible qualification next stage": "تأهل محتمل للدور التالي",
  "Qualification to 1/8 finals": "تأهل لدور الـ16",
  "Qualification to 1/8 Finals": "تأهل لدور الـ16",
  "Qualification to 1/16 finals": "تأهل للملحق",
  "Qualification to 1/16 Finals": "تأهل للملحق",
  Relegation: "هبوط",
  "Relegation qualification": "ملحق الهبوط",
  "Relegation play-offs": "ملحق الهبوط",
  "Champions League": "دوري الأبطال",
  "Europa League": "الدوري الأوروبي",
  "Conference League": "دوري المؤتمرات",
  "CAF Champions League qualification": "تأهل دوري أبطال أفريقيا",
  "CAF Confederation Cup qualification": "تأهل كأس الكونفدرالية",
  "Copa Sudamericana": "كأس سودأمريكانا",
};

export default function StandingsView({ lang }) {
  const t = TEXT[lang] || TEXT.en;
  const [regions, setRegions] = useState([]);
  const [leagueId, setLeagueId] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await base44.functions.invoke("sportsCalendar", { action: "competitions" });
        if (!alive) return;
        const list = res.data?.regions || [];
        setRegions(list);
        const first = list[0]?.items?.[0]?.id;
        if (first) setLeagueId(String(first));
        else {
          setLoading(false);
          setError(true);
        }
      } catch {
        if (alive) {
          setLoading(false);
          setError(true);
        }
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const load = useCallback(async (id) => {
    if (!id) return;
    setLoading(true);
    setError(false);
    try {
      const res = await base44.functions.invoke("sportsCalendar", { action: "standings", leagueId: id });
      if (res.data?.error) throw new Error(res.data.error);
      setData(res.data);
    } catch {
      setData(null);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (leagueId) load(leagueId);
  }, [leagueId, load]);

  const options = useMemo(
    () =>
      regions.flatMap((region) =>
        region.items.map((item) => ({
          value: String(item.id),
          label: lang === "ar" ? item.name_ar : item.name,
        }))
      ),
    [regions, lang]
  );

  const groups = data?.groups || [];
  const legend = data?.legend || [];
  const matches = data?.matches || [];

  return (
    <div className="space-y-3">
      <MobileSelect
        value={leagueId}
        onChange={setLeagueId}
        options={options}
        placeholder={t.pick}
        leading={<Trophy className="h-4 w-4 shrink-0 text-[#6D28D9] dark:text-[#C4B5FD]" />}
        triggerClassName="flex w-full items-center gap-2 rounded-2xl border border-[#F3F4F6] bg-white px-3 py-3 text-start text-[12px] font-bold text-[#111827] shadow-[0_4px_12px_rgba(109,40,217,0.08)] dark:border-[#4B3F8A] dark:bg-[#2D2A5A] dark:text-[#FEF3C7]"
      />

      {loading ? (
        <div className="space-y-3">
          {[0, 1].map((i) => (
            <div
              key={i}
              className="h-40 animate-pulse rounded-2xl border border-[#F3F4F6] bg-white dark:border-[#4B3F8A] dark:bg-[#2D2A5A]"
            />
          ))}
          <div className="flex items-center justify-center gap-2 pt-1 text-[11px] text-[#9CA3AF]">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            {t.loading}
          </div>
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-dashed border-[#E9D5FF] bg-white px-5 py-8 text-center dark:border-[#4B3F8A] dark:bg-[#2D2A5A]">
          <Table2 className="mx-auto mb-2 h-7 w-7 text-[#9CA3AF]" />
          <p className="text-sm font-semibold text-[#111827] dark:text-[#FEF3C7]">{t.error}</p>
          <button
            type="button"
            onClick={() => load(leagueId)}
            className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-[#6D28D9] px-3 py-1.5 text-[11px] font-bold text-white"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            {t.retry}
          </button>
        </div>
      ) : groups.length === 0 ? (
        matches.length > 0 ? (
          <section className="overflow-hidden rounded-2xl border border-[#F3F4F6] bg-white shadow-[0_4px_12px_rgba(109,40,217,0.08)] dark:border-[#4B3F8A] dark:bg-[#2D2A5A]">
            <header className="border-b border-[#F3F4F6] bg-[#FAFAFF] px-3 py-2 dark:border-[#4B3F8A] dark:bg-[#252153]">
              <h3 className="text-[12px] font-bold text-[#111827] dark:text-[#FEF3C7]">{t.fixtures}</h3>
              <p className="mt-0.5 text-[10px] leading-relaxed text-[#6B7280] dark:text-[#A8A6C4]">{t.knockoutNote}</p>
            </header>
            <div className="divide-y divide-[#F3F4F6] dark:divide-[#4B3F8A]">
              {matches.map((match) => (
                <MatchRow key={match.id} match={match} lang={lang} />
              ))}
            </div>
          </section>
        ) : (
          <div className="rounded-2xl border border-dashed border-[#E9D5FF] bg-white px-5 py-8 text-center dark:border-[#4B3F8A] dark:bg-[#2D2A5A]">
            <Table2 className="mx-auto mb-2 h-7 w-7 text-[#9CA3AF]" />
            <p className="text-sm font-semibold text-[#111827] dark:text-[#FEF3C7]">{t.knockout}</p>
            <p className="mt-1 text-[11px] text-[#6B7280] dark:text-[#A8A6C4]">{t.knockoutHint}</p>
          </div>
        )
      ) : (
        <>
          {data?.season && (
            <p className="text-[10px] font-semibold text-[#9CA3AF] dark:text-[#8B8AB0]">
              {t.season}: {data.season}
            </p>
          )}

          {groups.map((group) => (
            <StandingsTable key={group.key} group={group} lang={lang} />
          ))}

          {legend.length > 0 && (
            <div className="rounded-2xl border border-[#F3F4F6] bg-white px-3 py-2.5 dark:border-[#4B3F8A] dark:bg-[#2D2A5A]">
              <p className="mb-1.5 text-[9.5px] font-bold uppercase tracking-wide text-[#9CA3AF]">{t.legend}</p>
              <ul className="space-y-1">
                {legend.map((item) => (
                  <li key={`${item.title}-${item.color}`} className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: item.color }} />
                    <span dir="auto" className="text-[10.5px] font-semibold text-[#6B7280] dark:text-[#A8A6C4]">
                      {lang === "ar" ? LEGEND_AR[item.title] || item.title : item.title}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
}