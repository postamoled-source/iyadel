import { secrets } from "base44:runtime";

const BASE = "https://api.themoviedb.org/3";

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
      const params = {
        language,
        page: body.page || 1,
        sort_by: body.sort || "popularity.desc",
        include_adult: false,
      };
      if (body.genre) params.with_genres = body.genre;
      if (body.country) params.with_origin_country = body.country;
      if (body.year) {
        if (type === "tv") params.first_air_date_year = body.year;
        else params.primary_release_year = body.year;
      }
      const data = await tmdb(type === "tv" ? "/discover/tv" : "/discover/movie", params, key);
      return Response.json({
        results: data.results || [],
        page: data.page || 1,
        total_pages: data.total_pages || 1,
        total_results: data.total_results || 0,
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

    return Response.json({ error: "Unknown action" }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}