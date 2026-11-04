import { useEffect, useState } from "react";
import { tmdb } from "@/functions/tmdb";
import { ChevronDown, Loader2 } from "lucide-react";
import { Image } from "@/components/ui/image";

export default function EpisodeList({ tmdbId, seasons, lang }) {
  const [seasonNumber, setSeasonNumber] = useState(seasons[0]?.season_number ?? 1);
  const [episodes, setEpisodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState(null);

  const L = lang === "ar"
    ? { season: "الموسم", loading: "جارٍ تحميل الحلقات...", empty: "لا توجد حلقات متاحة لهذا الموسم.", episode: "حلقة" }
    : { season: "Season", loading: "Loading episodes...", empty: "No episodes available for this season.", episode: "Episode" };

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setEpisodes([]);
    (async () => {
      try {
        const res = await tmdb({
          action: "season",
          id: tmdbId,
          season: seasonNumber,
          language: lang === "ar" ? "ar" : "en-US",
        });
        if (!alive) return;
        setEpisodes(res?.data?.data?.episodes || []);
      } catch {
        if (alive) setEpisodes([]);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [tmdbId, seasonNumber, lang]);

  return (
    <div>
      {seasons.length > 1 && (
        <div className="mb-3 flex gap-1.5 overflow-x-auto pb-1">
          {seasons.map((s) => (
            <button
              key={s.season_number}
              onClick={() => { setOpenId(null); setSeasonNumber(s.season_number); }}
              className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold transition-colors ${
                s.season_number === seasonNumber
                  ? "bg-[#6D28D9] text-white"
                  : "border border-[#E9D5FF] bg-white text-[#6B7280] hover:border-[#6D28D9] dark:border-[#4B3F8A] dark:bg-[#2D2A5A] dark:text-[#D6D2EE]"
              }`}
            >
              {L.season} {s.season_number}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="flex items-center gap-2 py-6 text-xs text-[#6B7280] dark:text-[#A8A6C4]">
          <Loader2 className="h-4 w-4 animate-spin text-[#6D28D9]" /> {L.loading}
        </div>
      ) : episodes.length === 0 ? (
        <p className="py-2 text-sm text-[#6B7280] dark:text-[#A8A6C4]">{L.empty}</p>
      ) : (
        <ul className="space-y-2">
          {episodes.map((ep) => (
            <li key={ep.id} className="overflow-hidden rounded-xl border border-[#F3F4F6] bg-white dark:border-[#4B3F8A] dark:bg-[#2D2A5A]">
              <button
                onClick={() => setOpenId(openId === ep.id ? null : ep.id)}
                className="flex w-full items-center gap-3 p-2 text-start"
              >
                <div className="h-12 w-20 shrink-0 overflow-hidden rounded-lg bg-[#F3F4F6] dark:bg-[#1E1B4B]">
                  {ep.still_path ? (
                    <Image src={`https://image.tmdb.org/t/p/w185${ep.still_path}`} alt={ep.name} className="h-full w-full" />
                  ) : null}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-[#111827] dark:text-[#FEF3C7]">
                    {ep.episode_number}. {ep.name}
                  </p>
                  <p className="mt-0.5 text-[10px] text-[#9CA3AF]">
                    {[ep.air_date, ep.runtime ? `${ep.runtime} ${lang === "ar" ? "دقيقة" : "min"}` : ""]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                </div>
                <ChevronDown className={`h-4 w-4 shrink-0 text-[#9CA3AF] transition-transform ${openId === ep.id ? "rotate-180" : ""}`} />
              </button>
              {openId === ep.id && ep.overview && (
                <p className="px-3 pb-3 text-xs leading-relaxed text-[#374151] dark:text-[#D6D2EE]" dir="auto">
                  {ep.overview}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}