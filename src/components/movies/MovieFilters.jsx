import { Search, Film, Tv, X } from "lucide-react";

const selectClass =
  "w-full bg-white dark:bg-[#2D2A5A] border border-[#E9D5FF] dark:border-[#4B3F8A] rounded-xl px-3 py-2.5 text-sm text-[#111827] dark:text-[#FEF3C7] focus:outline-none focus:ring-2 focus:ring-[#6D28D9]/40 min-h-[44px]";

export default function MovieFilters({
  lang,
  type, setType,
  genre, setGenre,
  country, setCountry,
  sort, setSort,
  query, setQuery,
  genres, countries,
}) {
  const L = lang === "ar"
    ? { movies: "أفلام", series: "مسلسلات", all: "كل الأنواع", allCountries: "كل الدول",
        sortPopular: "الأكثر شعبية", sortTop: "الأعلى تقييماً", sortNew: "الأحدث",
        search: "ابحث عن فيلم أو مسلسل...", clear: "مسح", genre: "التصنيف", country: "الدولة", order: "الترتيب" }
    : { movies: "Movies", series: "Series", all: "All genres", allCountries: "All countries",
        sortPopular: "Most popular", sortTop: "Top rated", sortNew: "Newest",
        search: "Search for a movie or series...", clear: "Clear", genre: "Genre", country: "Country", order: "Sort" };

  const genreList = (type === "tv" ? genres.tv : genres.movie) || [];

  return (
    <div className="space-y-4">
      <div className="flex gap-2 p-1 bg-white dark:bg-[#2D2A5A] border border-[#F3F4F6] dark:border-[#4B3F8A] rounded-2xl">
        {[
          { key: "movie", label: L.movies, Icon: Film },
          { key: "tv", label: L.series, Icon: Tv },
        ].map(({ key, label, Icon }) => {
          const active = type === key;
          return (
            <button
              key={key}
              onClick={() => { setType(key); setGenre(""); setCountry(""); setQuery(""); }}
              className={`flex-1 inline-flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all min-h-[44px] ${
                active
                  ? "bg-gradient-to-r from-[#6D28D9] to-[#F59E0B] text-white shadow-[0_4px_12px_rgba(109,40,217,0.25)]"
                  : "text-[#6B7280] dark:text-[#A8A6C4] hover:text-[#6D28D9]"
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          );
        })}
      </div>

      <div className="relative">
        <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={L.search}
          className="w-full bg-white dark:bg-[#2D2A5A] border border-[#E9D5FF] dark:border-[#4B3F8A] rounded-xl ps-10 pe-10 py-3 text-sm text-[#111827] dark:text-[#FEF3C7] focus:outline-none focus:ring-2 focus:ring-[#6D28D9]/40 min-h-[44px]"
        />
        {query && (
          <button onClick={() => setQuery("")} aria-label={L.clear} className="absolute end-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#6D28D9]">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {!query && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-[#6B7280] dark:text-[#A8A6C4] mb-1">{L.genre}</label>
            <select value={genre} onChange={(e) => setGenre(e.target.value)} className={selectClass}>
              <option value="">{L.all}</option>
              {genreList.map((g) => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-[#6B7280] dark:text-[#A8A6C4] mb-1">{L.country}</label>
            <select value={country} onChange={(e) => setCountry(e.target.value)} className={selectClass}>
              <option value="">{L.allCountries}</option>
              {countries.map((c) => (
                <option key={c.iso} value={c.iso}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="col-span-2">
            <label className="block text-[11px] font-semibold text-[#6B7280] dark:text-[#A8A6C4] mb-1">{L.order}</label>
            <select value={sort} onChange={(e) => setSort(e.target.value)} className={selectClass}>
              <option value="popularity.desc">{L.sortPopular}</option>
              <option value="vote_average.desc">{L.sortTop}</option>
              <option value="primary_release_date.desc">{L.sortNew}</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
}