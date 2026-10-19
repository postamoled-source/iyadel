import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useI18n } from "@/lib/i18n";
import { useSeo } from "@/lib/analytics";
import { base44 } from "@/api/base44Client";
import { tmdb } from "@/functions/tmdb";
import { ChevronLeft, ChevronRight, Plus, Loader2, AlertCircle, Clapperboard } from "lucide-react";
import MovieCard from "@/components/movies/MovieCard";
import MovieFilters from "@/components/movies/MovieFilters";
import AddMovieDialog from "@/components/movies/AddMovieDialog";

const PAGE_SIZE_NOTE = 20;

export default function Movies() {
  const { lang, isRTL } = useI18n();

  const [type, setType] = useState("movie");
  const [genre, setGenre] = useState("");
  const [country, setCountry] = useState("");
  const [sort, setSort] = useState("popularity.desc");
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [page, setPage] = useState(1);

  const [genres, setGenres] = useState({ movie: [], tv: [] });
  const [countries, setCountries] = useState([]);
  const [items, setItems] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [library, setLibrary] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdd, setShowAdd] = useState(false);

  const L = lang === "ar"
    ? { title: "الأفلام والمسلسلات", subtitle: "تصفّح آلاف الأفلام والمسلسلات حسب التصنيف والدولة",
        library: "مكتبتي", prev: "السابق", next: "التالي", page: "صفحة", of: "من",
        loading: "جارٍ التحميل...", error: "تعذّر تحميل المحتوى. حاول مرة أخرى.",
        empty: "لا توجد نتائج مطابقة.", add: "إضافة عمل", retry: "إعادة المحاولة" }
    : { title: "Movies & Series", subtitle: "Browse thousands of movies and series by genre and country",
        library: "My Library", prev: "Previous", next: "Next", page: "Page", of: "of",
        loading: "Loading...", error: "Could not load content. Please try again.",
        empty: "No matching results.", add: "Add a title", retry: "Retry" };

  useSeo({
    title: lang === "ar" ? "الأفلام والمسلسلات" : "Movies & Series",
    description: lang === "ar"
      ? "تصفّح الأفلام والمسلسلات حسب التصنيف والدولة مع التفاصيل والتقييمات وأماكن المشاهدة الرسمية."
      : "Browse movies and series by genre and country with details, ratings and official where-to-watch links.",
    path: "/movies",
  });

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query.trim()), 450);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    setPage(1);
  }, [type, genre, country, sort, debouncedQuery]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [g, c] = await Promise.all([
          tmdb({ action: "genres", language: lang === "ar" ? "ar" : "en-US" }),
          tmdb({ action: "countries", language: lang === "ar" ? "ar" : "en-US" }),
        ]);
        if (!alive) return;
        setGenres(g.data || { movie: [], tv: [] });
        setCountries(c.data?.countries || []);
      } catch {
        /* filters stay empty — the catalog still loads */
      }
    })();
    return () => { alive = false; };
  }, [lang]);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const payload = debouncedQuery
          ? { action: "search", query: debouncedQuery, page, language: lang === "ar" ? "ar" : "en-US" }
          : { action: "discover", type, genre, country, sort, page, language: lang === "ar" ? "ar" : "en-US" };
        const res = await tmdb(payload);
        if (!alive) return;
        const data = res.data || {};
        const results = (data.results || [])
          .filter((r) => (debouncedQuery ? r.media_type : type))
          .map((r) => ({
            id: r.id,
            media_type: debouncedQuery ? r.media_type : type,
            title: r.title || r.name || "",
            poster: r.poster_path ? `https://image.tmdb.org/t/p/w500${r.poster_path}` : "",
            year: (r.release_date || r.first_air_date || "").slice(0, 4),
            rating: r.vote_average || 0,
            isCustom: false,
          }));
        setItems(results);
        setTotalPages(Math.min(data.total_pages || 1, 500));
      } catch (e) {
        if (!alive) return;
        setError(e?.response?.data?.error || e?.message || "Error");
        setItems([]);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [type, genre, country, sort, debouncedQuery, page, lang]);

  const loadLibrary = useCallback(async () => {
    try {
      const res = await base44.entities.MovieEntry.filter(
        { status: "published", media_type: type },
        { sort: "-created_date", limit: 20 }
      );
      setLibrary((res.items || []).map((m) => ({
        id: m.id,
        media_type: m.media_type,
        title: m.title,
        poster: m.poster_url || "",
        year: m.release_year || "",
        rating: m.rating || 0,
        isCustom: true,
      })));
    } catch {
      setLibrary([]);
    }
  }, [type]);

  useEffect(() => { loadLibrary(); }, [loadLibrary]);

  useEffect(() => {
    let alive = true;
    base44.auth.me()
      .then((u) => { if (alive) setIsAdmin(u?.role === "admin"); })
      .catch(() => { if (alive) setIsAdmin(false); });
    return () => { alive = false; };
  }, []);

  const showLibrary = library.length > 0 && !debouncedQuery && page === 1;

  return (
    <section className="bg-[#FFFBEB] dark:bg-[#1E1B4B] min-h-screen py-6">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#111827] dark:text-[#FEF3C7] flex items-center gap-2">
              <Clapperboard className="w-6 h-6 text-[#6D28D9]" />
              {L.title}
            </h1>
            <p className="text-sm text-[#6B7280] dark:text-[#A8A6C4] mt-1">{L.subtitle}</p>
          </div>
          {isAdmin && (
            <button
              onClick={() => setShowAdd(true)}
              className="shrink-0 inline-flex items-center gap-1.5 bg-gradient-to-r from-[#6D28D9] to-[#F59E0B] text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-[0_4px_12px_rgba(109,40,217,0.25)] hover:opacity-90 transition-opacity min-h-[44px]"
            >
              <Plus className="w-4 h-4" />
              {L.add}
            </button>
          )}
        </div>

        <MovieFilters
          lang={lang}
          type={type} setType={setType}
          genre={genre} setGenre={setGenre}
          country={country} setCountry={setCountry}
          sort={sort} setSort={setSort}
          query={query} setQuery={setQuery}
          genres={genres} countries={countries}
        />

        {showLibrary && (
          <div className="mt-8">
            <h2 className="text-lg font-bold text-[#111827] dark:text-[#FEF3C7] mb-3 pb-2 border-b-2 border-[#FDE68A] dark:border-[#4B3F8A]">
              {L.library}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
              {library.map((m) => <MovieCard key={m.id} item={m} lang={lang} />)}
            </div>
          </div>
        )}

        <div className="mt-8">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-[#6B7280] dark:text-[#A8A6C4]">
              <Loader2 className="w-7 h-7 animate-spin text-[#6D28D9] mb-3" />
              <p className="text-sm">{L.loading}</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <AlertCircle className="w-7 h-7 text-[#DC2626] mb-3" />
              <p className="text-sm text-[#6B7280] dark:text-[#A8A6C4] mb-4 max-w-xs">{L.error}</p>
              <button
                onClick={() => setPage((p) => p)}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-[#6D28D9] to-[#F59E0B] text-white text-sm font-semibold px-5 py-2.5 rounded-xl"
              >
                {L.retry}
              </button>
            </div>
          ) : items.length === 0 ? (
            <p className="text-center text-sm text-[#6B7280] dark:text-[#A8A6C4] py-16">{L.empty}</p>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
                {items.map((m) => <MovieCard key={`${m.media_type}-${m.id}`} item={m} lang={lang} />)}
              </div>

              <div className="flex items-center justify-center gap-3 mt-8">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-[#E9D5FF] dark:border-[#4B3F8A] text-sm font-semibold text-[#6D28D9] dark:text-[#FBBF24] disabled:opacity-40 min-h-[44px]"
                >
                  {isRTL ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                  {L.prev}
                </button>
                <span className="text-sm text-[#6B7280] dark:text-[#A8A6C4] font-medium">
                  {L.page} {page} {L.of} {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-[#E9D5FF] dark:border-[#4B3F8A] text-sm font-semibold text-[#6D28D9] dark:text-[#FBBF24] disabled:opacity-40 min-h-[44px]"
                >
                  {L.next}
                  {isRTL ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </button>
              </div>
            </>
          )}
        </div>

        <p className="text-center text-[11px] text-[#9CA3AF] dark:text-[#8B8AB0] mt-8">
          {lang === "ar"
            ? "بيانات الأفلام والمسلسلات مقدَّمة من TMDB. هذا المنتج يستخدم واجهة TMDB لكنه غير معتمد أو مصادق عليه من TMDB."
            : "Movie and series data provided by TMDB. This product uses the TMDB API but is not endorsed or certified by TMDB."}
        </p>
      </div>

      {showAdd && (
        <AddMovieDialog lang={lang} onAdded={loadLibrary} onClose={() => setShowAdd(false)} />
      )}
    </section>
  );
}