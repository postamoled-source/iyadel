import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useI18n } from "@/lib/i18n";
import { base44 } from "@/api/base44Client";
import { tmdb } from "@/functions/tmdb";
import { ArrowLeft, Star, Calendar, Clock, Globe, Loader2, Download, Film, Tv, Users } from "lucide-react";
import { Image } from "@/components/ui/image";
import MoviePlayer from "@/components/movies/MoviePlayer";

function Section({ title, children }) {
  return (
    <div className="mb-6">
      <h2 className="text-lg font-bold text-[#111827] dark:text-[#FEF3C7] mb-3 pb-2 border-b-2 border-[#FDE68A] dark:border-[#4B3F8A]">
        {title}
      </h2>
      {children}
    </div>
  );
}

export default function MovieDetail() {
  const { type, id } = useParams();
  const { lang } = useI18n();
  const navigate = useNavigate();

  const isCustom = !/^\d+$/.test(String(id || ""));
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const L = lang === "ar"
    ? { back: "رجوع", overview: "القصة", player: "المشاهدة", downloads: "التحميل",
        cast: "طاقم العمل", similar: "أعمال مشابهة",
        loading: "جارٍ التحميل...", notFound: "لم يتم العثور على العمل.",
        noDownloads: "لا تتوفر روابط تحميل مباشرة لهذا العمل.",
        minutes: "دقيقة", seasons: "مواسم", country: "الدولة", original: "الاسم الأصلي",
        movie: "فيلم", series: "مسلسل" }
    : { back: "Back", overview: "Overview", player: "Watch", downloads: "Download",
        cast: "Cast", similar: "Similar titles",
        loading: "Loading...", notFound: "This title could not be found.",
        noDownloads: "No direct download links are available for this title.",
        minutes: "min", seasons: "seasons", country: "Country", original: "Original title",
        movie: "Movie", series: "Series" };

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      setError("");
      try {
        if (isCustom) {
          const rec = await base44.entities.MovieEntry.get(id);
          if (!alive) return;
          setItem({ kind: "custom", record: rec });
        } else {
          const res = await tmdb({ action: "detail", type, id, language: lang === "ar" ? "ar" : "en-US" });
          if (!alive) return;
          setItem({ kind: "tmdb", data: res.data?.data });
        }
      } catch (e) {
        if (!alive) return;
        setError(e?.response?.data?.error || e?.message || "Error");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [type, id, isCustom, lang]);

  useEffect(() => { window.scrollTo(0, 0); }, [id]);

  if (loading) {
    return (
      <section className="bg-[#FFFBEB] dark:bg-[#1E1B4B] min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center text-[#6B7280] dark:text-[#A8A6C4]">
          <Loader2 className="w-7 h-7 animate-spin text-[#6D28D9] mb-3" />
          <p className="text-sm">{L.loading}</p>
        </div>
      </section>
    );
  }

  if (error || !item) {
    return (
      <section className="bg-[#FFFBEB] dark:bg-[#1E1B4B] min-h-screen">
        <div className="max-w-3xl mx-auto px-4 py-16 text-center">
          <p className="text-sm text-[#6B7280] dark:text-[#A8A6C4] mb-4">{L.notFound}</p>
          <Link to="/movies" className="text-sm font-semibold text-[#6D28D9] dark:text-[#FBBF24]">{L.back}</Link>
        </div>
      </section>
    );
  }

  const custom = item.kind === "custom";
  const r = custom ? item.record : null;
  const d = custom ? null : item.data;

  const title = custom ? r.title : (d.title || d.name);
  const originalTitle = custom ? "" : (d.original_title || d.original_name || "");
  const overview = custom ? r.overview : d.overview;
  const poster = custom
    ? r.poster_url
    : (d.poster_path ? `https://image.tmdb.org/t/p/w500${d.poster_path}` : "");
  const backdrop = custom
    ? (r.backdrop_url || r.poster_url)
    : (d.backdrop_path ? `https://image.tmdb.org/t/p/w1280${d.backdrop_path}` : "");
  const year = custom ? r.release_year : (d.release_date || d.first_air_date || "").slice(0, 4);
  const rating = custom ? r.rating : d.vote_average;
  const mediaType = custom ? r.media_type : (type === "tv" ? "tv" : "movie");
  const genreNames = custom
    ? (r.genres || [])
    : (d.genres || []).map((g) => g.name);
  const countryNames = custom
    ? (r.country ? [r.country] : [])
    : ((d.production_countries || []).length
        ? (d.production_countries || []).map((c) => c.name)
        : (d.origin_country || []));
  const runtime = custom ? "" : (d.runtime ? `${d.runtime} ${L.minutes}` : (d.number_of_seasons ? `${d.number_of_seasons} ${L.seasons}` : ""));
  const cast = custom ? [] : (d.credits?.cast || []).slice(0, 10);

  const streamUrl = custom ? (r.watch_url || "") : "";

  const similar = custom
    ? []
    : (d.similar?.results || []).slice(0, 6).map((s) => ({
        id: s.id,
        media_type: mediaType,
        title: s.title || s.name,
        poster: s.poster_path ? `https://image.tmdb.org/t/p/w500${s.poster_path}` : "",
        year: (s.release_date || s.first_air_date || "").slice(0, 4),
        rating: s.vote_average || 0,
        isCustom: false,
      }));

  const downloadLinks = custom ? (r.download_links || []).filter((l) => l.url) : [];
  const TypeIcon = mediaType === "tv" ? Tv : Film;
  const typeLabel = mediaType === "tv" ? L.series : L.movie;

  return (
    <section className="bg-[#FFFBEB] dark:bg-[#1E1B4B] min-h-screen">
      <div className="relative">
        {backdrop ? (
          <div className="relative h-44 sm:h-72 w-full overflow-hidden">
            <Image src={backdrop} alt={title} className="w-full h-full" fittingType="fill" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#FFFBEB] dark:from-[#1E1B4B] via-[#FFFBEB]/50 dark:via-[#1E1B4B]/65 to-transparent" />
          </div>
        ) : (
          <div className="h-24 w-full bg-gradient-to-br from-[#6D28D9] to-[#F59E0B]" />
        )}
      </div>

      <div className="max-w-3xl mx-auto px-4 -mt-14 sm:-mt-24 relative">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-sm text-[#6D28D9] dark:text-[#FBBF24] font-semibold mb-4 hover:opacity-80"
        >
          <ArrowLeft className="w-4 h-4" /> {L.back}
        </button>

        <div className="flex gap-4 mb-6">
          <div className="w-[110px] sm:w-[150px] shrink-0 aspect-[2/3] rounded-2xl overflow-hidden bg-[#F3F4F6] dark:bg-[#2D2A5A] shadow-[0_8px_24px_rgba(0,0,0,0.18)]">
            {poster ? (
              <Image src={poster} alt={title} className="w-full h-full" fittingType="fill" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#6D28D9] to-[#F59E0B]">
                <TypeIcon className="w-10 h-10 text-white/80" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0 pt-12 sm:pt-20">
            <span className="inline-block text-[10px] font-bold uppercase tracking-wide text-[#6D28D9] dark:text-[#FBBF24] bg-white dark:bg-[#2D2A5A] border border-[#E9D5FF] dark:border-[#4B3F8A] rounded-full px-2.5 py-0.5 mb-2">
              {typeLabel}
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-[#111827] dark:text-[#FEF3C7] leading-tight">{title}</h1>
            {originalTitle && originalTitle !== title && (
              <p className="text-xs text-[#9CA3AF] dark:text-[#8B8AB0] mt-1 italic" dir="auto">
                {L.original}: {originalTitle}
              </p>
            )}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-xs text-[#6B7280] dark:text-[#A8A6C4]">
              {year && <span className="inline-flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{year}</span>}
              {runtime && <span className="inline-flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{runtime}</span>}
              {rating > 0 && (
                <span className="inline-flex items-center gap-1 font-bold text-[#111827] dark:text-[#FEF3C7]">
                  <Star className="w-3.5 h-3.5 text-[#FBBF24] fill-[#FBBF24]" />{Number(rating).toFixed(1)}
                </span>
              )}
            </div>
          </div>
        </div>

        {genreNames.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {genreNames.map((g) => (
              <span key={g} className="text-[11px] font-medium text-[#6B7280] dark:text-[#D6D2EE] bg-white dark:bg-[#2D2A5A] border border-[#E9D5FF] dark:border-[#4B3F8A] rounded-full px-2.5 py-0.5">
                {g}
              </span>
            ))}
          </div>
        )}

        {countryNames.length > 0 && (
          <p className="inline-flex items-center gap-1.5 text-xs text-[#6B7280] dark:text-[#A8A6C4] mb-6">
            <Globe className="w-3.5 h-3.5" /> {L.country}: {countryNames.join(", ")}
          </p>
        )}

        <div className="mb-6">
          <MoviePlayer url={streamUrl} poster={poster || backdrop} title={title} lang={lang} />
        </div>

        {overview && (
          <Section title={L.overview}>
            <p className="text-sm text-[#374151] dark:text-[#D6D2EE] leading-relaxed" dir="auto">{overview}</p>
          </Section>
        )}

        <Section title={L.downloads}>
          {downloadLinks.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {downloadLinks.map((l, i) => (
                <a
                  key={i}
                  href={l.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-white dark:bg-[#2D2A5A] border border-[#E9D5FF] dark:border-[#4B3F8A] rounded-xl px-4 py-2.5 text-sm font-semibold text-[#6D28D9] dark:text-[#FBBF24] hover:border-[#6D28D9] transition-colors"
                >
                  <Download className="w-4 h-4" /> {l.quality || L.downloads}
                </a>
              ))}
            </div>
          ) : (
            <p className="text-sm text-[#6B7280] dark:text-[#A8A6C4] leading-relaxed bg-[#FFFBEB] dark:bg-[#2D2A5A] border border-[#FDE68A] dark:border-[#4B3F8A] rounded-xl p-4">
              {L.noDownloads}
            </p>
          )}
        </Section>

        {cast.length > 0 && (
          <Section title={L.cast}>
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
              {cast.map((p) => (
                <div key={p.id} className="w-24 shrink-0 text-center">
                  <div className="w-20 h-20 mx-auto rounded-full overflow-hidden bg-[#F3F4F6] dark:bg-[#2D2A5A] flex items-center justify-center">
                    {p.profile_path ? (
                      <img src={`https://image.tmdb.org/t/p/w185${p.profile_path}`} alt={p.name} className="w-full h-full object-cover" />
                    ) : (
                      <Users className="w-7 h-7 text-[#9CA3AF]" />
                    )}
                  </div>
                  <p className="text-[11px] font-semibold text-[#111827] dark:text-[#FEF3C7] mt-2 leading-tight line-clamp-2">{p.name}</p>
                  <p className="text-[10px] text-[#9CA3AF] leading-tight line-clamp-2">{p.character}</p>
                </div>
              ))}
            </div>
          </Section>
        )}

        {similar.length > 0 && (
          <Section title={L.similar}>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {similar.map((s) => (
                <Link
                  key={s.id}
                  to={`/movies/${s.media_type}/${s.id}`}
                  className="flex items-center gap-2 bg-white dark:bg-[#2D2A5A] border border-[#F3F4F6] dark:border-[#4B3F8A] rounded-xl p-2 hover:-translate-y-0.5 hover:shadow-md transition-all"
                >
                  <div className="w-10 h-14 rounded-lg overflow-hidden shrink-0 bg-[#F3F4F6] dark:bg-[#1E1B4B]">
                    {s.poster ? <img src={s.poster} alt={s.title} className="w-full h-full object-cover" /> : null}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-[#111827] dark:text-[#FEF3C7] line-clamp-2 leading-tight">{s.title}</p>
                    {s.year && <p className="text-[10px] text-[#9CA3AF] mt-0.5">{s.year}</p>}
                  </div>
                </Link>
              ))}
            </div>
          </Section>
        )}

        <Link to="/movies" className="inline-flex items-center gap-1.5 text-sm text-[#6D28D9] dark:text-[#FBBF24] font-semibold mt-2 mb-8 hover:opacity-80">
          <ArrowLeft className="w-4 h-4" /> {L.back}
        </Link>
      </div>
    </section>
  );
}