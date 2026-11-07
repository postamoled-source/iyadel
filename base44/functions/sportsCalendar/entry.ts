import { secrets } from "base44:runtime";

const CACHE = new Map();
const TTL_MS = 45_000;
const MAX_DAYS = 45;

const UA =
  "Mozilla/5.0 (Linux; Android 13; SM-A536B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Mobile Safari/537.36";

function validDate(value) {
  const d = String(value || "").trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) return null;
  const t = Date.parse(d + "T00:00:00Z");
  if (Number.isNaN(t)) return null;
  const days = (t - Date.now()) / 86_400_000;
  if (days < -MAX_DAYS || days > MAX_DAYS) return null;
  return d;
}

// The calendar page ships its match list as escaped React flight chunks; decode
// them, then pull the balanced JSON array that follows "sections".
function extractSections(html) {
  const chunks = [];
  const re = /self\.__next_f\.push\(\[1,"((?:[^"\\]|\\.)*)"\]\)/g;
  let m;
  while ((m = re.exec(html)) !== null) {
    try {
      chunks.push(JSON.parse('"' + m[1] + '"'));
    } catch {
      // skip a malformed chunk
    }
  }
  const payload = chunks.join("");
  const key = '"sections":[';
  const start = payload.indexOf(key);
  if (start === -1) return null;

  let i = start + key.length - 1;
  let depth = 0;
  let inStr = false;
  let esc = false;
  for (; i < payload.length; i++) {
    const c = payload[i];
    if (inStr) {
      if (esc) esc = false;
      else if (c === "\\") esc = true;
      else if (c === '"') inStr = false;
      continue;
    }
    if (c === '"') {
      inStr = true;
      continue;
    }
    if (c === "[" || c === "{") depth++;
    else if (c === "]" || c === "}") {
      depth--;
      if (depth === 0) {
        i++;
        break;
      }
    }
  }
  const raw = payload.slice(start + key.length - 1, i).replace(/"\$undefined"/g, "null");
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function normalizeMatch(match) {
  const center = match.center || {};
  const hasScore = center.type === "score" && center.home != null && center.away != null;
  const scheduled = typeof center.label === "string" && /^\d{1,2}:\d{2}$/.test(center.label);
  let type = "upcoming";
  if (hasScore) type = center.live ? "live" : "finished";
  else if (!scheduled && center.label) type = "postponed";

  return {
    id: String(match.id || ""),
    home: { name: match.home?.name || "", logo: match.home?.logoUrl || "" },
    away: { name: match.away?.name || "", logo: match.away?.logoUrl || "" },
    kickoff: match.kickoffIso || center.kickoffIso || null,
    status: {
      type,
      label: center.minuteLabel || center.dateLabel || null,
      live: Boolean(center.live),
      home_score: hasScore ? Number(center.home) : null,
      away_score: hasScore ? Number(center.away) : null,
    },
  };
}

function normalizeSections(sections) {
  return sections
    .map((section) => ({
      id: String(section.id || ""),
      title: section.title || "",
      logo: section.logoUrl || "",
      matches: (section.matches || [])
        .map(normalizeMatch)
        .filter((m) => m.home.name && m.away.name)
        .sort((a, b) => String(a.kickoff || "").localeCompare(String(b.kickoff || ""))),
    }))
    .filter((section) => section.matches.length > 0);
}

export default async function (req) {
  try {
    const body = await req.json().catch(() => ({}));
    if (body.debug) {
      const target = encodeURIComponent("https://m.elbotola.com/analytics/calendar/2026-11-07/");
      const cases = [
        { name: "allorigins", url: "https://api.allorigins.win/raw?url=" + target, headers: { Accept: "text/html" } },
        { name: "codetabs", url: "https://api.codetabs.com/v1/proxy?quest=" + target, headers: { Accept: "text/html" } },
        { name: "corsproxy", url: "https://corsproxy.io/?url=" + target, headers: { Accept: "text/html" } },
        { name: "espn_soccer", url: "https://site.api.espn.com/apis/site/v2/sports/soccer/uefa.champions/scoreboard", headers: { Accept: "application/json" } },
      ];
      const out = [];
      for (const c of cases) {
        try {
          const r = await fetch(c.url, { headers: c.headers, signal: AbortSignal.timeout(10000) });
          const txt = await r.text();
          out.push({ name: c.name, status: r.status, head: txt.slice(0, 120) });
        } catch (e) {
          out.push({ name: c.name, error: String(e).slice(0, 120) });
        }
      }
      return Response.json({ debug: out });
    }
    const lang = body.lang === "ar" ? "ar" : "en";
    const date = validDate(body.date) || new Date().toISOString().slice(0, 10);

    const cacheKey = date + ":" + lang;
    const cached = CACHE.get(cacheKey);
    if (cached && Date.now() - cached.at < TTL_MS) return Response.json(cached.data);

    const host = lang === "ar" ? "https://m.elbotola.com" : "https://m.elbotola.com/en";
    const res = await fetch(`${host}/analytics/calendar/${date}/`, {
      headers: { "User-Agent": UA, Accept: "text/html,application/xhtml+xml" },
      signal: AbortSignal.timeout(12_000),
    });
    if (!res.ok) {
      return Response.json({ error: "Upstream calendar unavailable (" + res.status + ")" }, { status: 502 });
    }

    const sections = normalizeSections(extractSections(await res.text()) || []);
    const data = {
      date,
      lang,
      updated_at: new Date().toISOString(),
      sections,
      totals: {
        matches: sections.reduce((sum, s) => sum + s.matches.length, 0),
        competitions: sections.length,
        live: sections.reduce((sum, s) => sum + s.matches.filter((m) => m.status.type === "live").length, 0),
      },
    };

    CACHE.set(cacheKey, { at: Date.now(), data });
    if (CACHE.size > 40) CACHE.delete(CACHE.keys().next().value);

    return Response.json(data);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}