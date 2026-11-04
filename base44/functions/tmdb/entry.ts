import { secrets } from "base44:runtime";

const BASE = "https://api.themoviedb.org/3";

// A title "supports Arabic" when TMDB returns an Arabic localized overview or
// title for it (or it was produced in Arabic in the first place).
const ARABIC_RE = /[\u0600-\u06FF]/;

function supportsArabic(item) {
  if (!item) return false;
  if (String(item.original_language || "").toLowerCase() === "ar") return true;
  return ARABIC_RE.test(item.overview || "") || ARABIC_RE.test(item.title || item.name || "");
}

async function tmdb(path, params, key) {
  const url = new URL(BASE + path);
  url.searchParams.set("api_key", key);
  url.searchParams.set("language", params.language || "en-US");
  Object.keys(params).forEach((k) => {
    if (k === "language") return;
    const v = params[k];
    if (v !== undefined && v !== null && v !== "") url.searchParams.set(k, String(v));
  });
  const res = await fetch(url.toString(), {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(10000),
  });
  if (!res.ok) throw new Error("TMDB request failed with status " + res.status);
  return res.json();
}

export default async function (req) {
  try {
    const key = secrets.get("TMDB_API_KEY");
    if (!key) return Response.json({ error: "TMDB API key is not configured" }, { status: 500 });

    const body = await req.json().catch(() => ({}));
    const action = body.action;
    const language = body.language || "en-US";

    if (action === "genres") {
      const [movie, tv] = await Promise.all([
        tmdb("/genre/movie/list", { language }, key),
        tmdb("/genre/tv/list", { language }, key),
      ]);
      return Response.json({ movie: movie.genres || [], tv: tv.genres || [] });
    }

    if (action === "countries") {
      const list = await tmdb("/configuration/countries", { language }, key);
      const countries = (list || [])
        .map((c) => ({ iso: c.iso_3166_1, name: c.english_name }))
        .sort((a, b) => a.name.localeCompare(b.name));
      return Response.json({ countries });
    }

    if (action === "discover") {
      const type = body.type === "tv" ? "tv" : "movie";
      const path = type === "tv" ? "/discover/tv" : "/discover/movie";
      const page = Math.max(1, Number(body.page) || 1);
      const params: Record<string, unknown> = {
        sort_by: body.sort || "popularity.desc",
        include_adult: false,
      };
      if (body.genre) params.with_genres = body.genre;
      if (body.country) params.with_origin_country = body.country;
      if (body.year) {
        if (type === "tv") params.first_air_date_year = body.year;
        else params.primary_release_year = body.year;
      }

      if (!body.prioritize_arabic) {
        const data = await tmdb(path, { ...params, language, page }, key);
        return Response.json({
          results: (data.results || []).map((r) => ({ ...r, has_arabic: supportsArabic(r) })),
          page: data.page || 1,
          total_pages: data.total_pages || 1,
          total_results: data.total_results || 0,
        });
      }

      // Two TMDB pages make up one screen page, so every page leads with the
      // titles that carry an Arabic translation and ends with the rest.
      const tmdbPages = [(page - 1) * 2 + 1, (page - 1) * 2 + 2];
      const languages = language === "ar" ? ["ar"] : [language, "ar"];
      const jobs = tmdbPages.flatMap((p) => languages.map((l) => ({ page: p, language: l })));
      const fetched = await Promise.all(
        jobs.map((j) =>
          tmdb(path, { ...params, language: j.language, page: j.page }, key).catch(() => ({ results: [], total_pages: 1 }))
        )
      );
      const pageData = (p: number, l: string) =>
        fetched[jobs.findIndex((j) => j.page === p && j.language === l)];

      const merged: any[] = [];
      const seen = new Set<unknown>();
      tmdbPages.forEach((p) => {
        (pageData(p, language).results || []).forEach((r) => {
          if (seen.has(r.id)) return;
          seen.add(r.id);
          merged.push(r);
        });
      });

      const arabicIds = new Set<unknown>();
      tmdbPages.forEach((p) => {
        (pageData(p, "ar").results || []).forEach((r) => {
          if (supportsArabic(r)) arabicIds.add(r.id);
        });
      });

      const results = merged
        .map((r) => ({ ...r, has_arabic: arabicIds.has(r.id) }))
        .sort((a, b) => Number(b.has_arabic) - Number(a.has_arabic));

      const rawTotal = Math.max(...tmdbPages.map((p) => pageData(p, language).total_pages || 1));
      return Response.json({
        results,
        page,
        total_pages: Math.max(1, Math.ceil(rawTotal / 2)),
        total_results: merged.length,
      });
    }

    if (action === "search") {
      const q = String(body.query || "").trim();
      if (!q) return Response.json({ results: [], page: 1, total_pages: 1 });
      const data = await tmdb("/search/multi", { query: q, page: body.page || 1, language, include_adult: false }, key);
      const results = (data.results || []).filter((r) => r.media_type === "movie" || r.media_type === "tv");
      return Response.json({ results, page: data.page || 1, total_pages: data.total_pages || 1 });
    }

    if (action === "detail") {
      const type = body.type === "tv" ? "tv" : "movie";
      const id = String(body.id || "").replace(/[^0-9]/g, "");
      if (!id) return Response.json({ error: "A valid id is required" }, { status: 400 });
      const data = await tmdb(
        (type === "tv" ? "/tv/" : "/movie/") + id,
        { language, append_to_response: "credits,videos,watch/providers,similar" },
        key
      );
      return Response.json({ data });
    }

    if (action === "season") {
      const id = String(body.id || "").replace(/[^0-9]/g, "");
      const seasonNumber = Number(body.season);
      if (!id || Number.isNaN(seasonNumber)) {
        return Response.json({ error: "A valid id and season number are required" }, { status: 400 });
      }
      const data = await tmdb(`/tv/${id}/season/${seasonNumber}`, { language }, key);
      const episodes = (data.episodes || []).map((ep) => ({
        id: ep.id,
        episode_number: ep.episode_number,
        name: ep.name,
        overview: ep.overview,
        air_date: ep.air_date,
        runtime: ep.runtime,
        still_path: ep.still_path,
        vote_average: ep.vote_average,
      }));
      return Response.json({ data: { season_number: data.season_number, episodes } });
    }

    return Response.json({ error: "Unknown action" }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}