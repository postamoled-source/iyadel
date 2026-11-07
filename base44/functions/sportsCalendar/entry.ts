const CACHE = new Map();
const TTL_MS = 45_000;
const MAX_DAYS = 45;

// Competitions most followed by an Arabic-speaking football audience, in display
// priority order. Every feed carries its own competition name and logo.
const LEAGUES = [
  { slug: "ksa.1", ar: "دوري روشن السعودي" },
  { slug: "caf.champions", ar: "دوري أبطال أفريقيا" },
  { slug: "caf.confed", ar: "كأس الكونفدرالية الأفريقية" },
  { slug: "caf.nations", ar: "كأس أمم أفريقيا" },
  { slug: "uefa.champions", ar: "دوري أبطال أوروبا" },
  { slug: "uefa.europa", ar: "الدوري الأوروبي" },
  { slug: "uefa.europa.conf", ar: "دوري المؤتمرات الأوروبي" },
  { slug: "eng.1", ar: "الدوري الإنجليزي الممتاز" },
  { slug: "esp.1", ar: "الدوري الإسباني" },
  { slug: "ita.1", ar: "الدوري الإيطالي" },
  { slug: "ger.1", ar: "الدوري الألماني" },
  { slug: "fra.1", ar: "الدوري الفرنسي" },
  { slug: "por.1", ar: "الدوري البرتغالي" },
  { slug: "ned.1", ar: "الدوري الهولندي" },
  { slug: "tur.1", ar: "الدوري التركي" },
  { slug: "afc.champions", ar: "دوري أبطال آسيا" },
  { slug: "fifa.worldq.caf", ar: "تصفيات كأس العالم — أفريقيا" },
  { slug: "fifa.worldq.uefa", ar: "تصفيات كأس العالم — أوروبا" },
  { slug: "uefa.nations", ar: "دوري الأمم الأوروبية" },
  { slug: "eng.2", ar: "دوري الدرجة الأولى الإنجليزي" },
  { slug: "esp.2", ar: "الدوري الإسباني — الدرجة الثانية" },
  { slug: "ita.2", ar: "الدوري الإيطالي — الدرجة الثانية" },
  { slug: "ger.2", ar: "الدوري الألماني — الدرجة الثانية" },
  { slug: "fra.2", ar: "الدوري الفرنسي — الدرجة الثانية" },
  { slug: "usa.1", ar: "الدوري الأمريكي" },
  { slug: "mex.1", ar: "الدوري المكسيكي" },
];

function validDate(value) {
  const d = String(value || "").trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) return null;
  const t = Date.parse(d + "T00:00:00Z");
  if (Number.isNaN(t)) return null;
  const days = (t - Date.now()) / 86_400_000;
  if (days < -MAX_DAYS || days > MAX_DAYS) return null;
  return d;
}

function toNumber(score) {
  return score === undefined || score === null || score === "" ? null : Number(score);
}

function normalizeEvent(event) {
  const comp = event.competitions?.[0] || {};
  const status = comp.status?.type || {};
  const competitors = comp.competitors || [];
  const home = competitors.find((c) => c.homeAway === "home");
  const away = competitors.find((c) => c.homeAway === "away");
  if (!home || !away) return null;

  const flag = `${status.name || ""} ${status.description || ""} ${status.shortDetail || ""}`;
  let type = "upcoming";
  if (/postpon|susp/i.test(flag)) type = "postponed";
  else if (/cancel|abandon/i.test(flag)) type = "canceled";
  else if (status.state === "in") type = "live";
  else if (status.state === "post") type = "finished";

  return {
    id: String(event.id || ""),
    home: {
      name: home.team?.displayName || "",
      short: home.team?.shortDisplayName || "",
      logo: home.team?.logo || "",
    },
    away: {
      name: away.team?.displayName || "",
      short: away.team?.shortDisplayName || "",
      logo: away.team?.logo || "",
    },
    kickoff: event.date || comp.date || null,
    venue: comp.venue?.fullName || "",
    status: {
      type,
      live: status.state === "in",
      label: status.state === "pre" ? null : status.shortDetail || status.detail || null,
      home_score: toNumber(home.score),
      away_score: toNumber(away.score),
    },
  };
}

async function fetchLeague(league, date) {
  const res = await fetch(
    `https://site.api.espn.com/apis/site/v2/sports/soccer/${league.slug}/scoreboard?dates=${date.replace(/-/g, "")}&limit=100`,
    { headers: { Accept: "application/json" }, signal: AbortSignal.timeout(9_000) }
  );
  if (!res.ok) return null;
  const json = await res.json();
  const matches = (json.events || [])
    .map(normalizeEvent)
    .filter((m) => m && m.home.name && m.away.name)
    .sort((a, b) => String(a.kickoff || "").localeCompare(String(b.kickoff || "")));
  if (matches.length === 0) return null;

  const meta = json.leagues?.[0] || {};
  return {
    id: league.slug,
    name: meta.name || league.slug,
    name_ar: league.ar,
    logo: String(meta.logos?.[0]?.href || "").replace(/^http:/, "https:"),
    matches,
  };
}

async function fetchAll(date) {
  const sections = [];
  for (let i = 0; i < LEAGUES.length; i += 6) {
    const results = await Promise.allSettled(LEAGUES.slice(i, i + 6).map((l) => fetchLeague(l, date)));
    results.forEach((r) => {
      if (r.status === "fulfilled" && r.value) sections.push(r.value);
    });
  }
  return sections;
}

export default async function (req) {
  try {
    const body = await req.json().catch(() => ({}));
    const date = validDate(body.date) || new Date().toISOString().slice(0, 10);

    const cached = CACHE.get(date);
    if (cached && Date.now() - cached.at < TTL_MS) return Response.json(cached.data);

    const sections = await fetchAll(date);
    if (sections.length === 0) {
      return Response.json({ error: "No match data available for this date" }, { status: 502 });
    }

    const data = {
      date,
      updated_at: new Date().toISOString(),
      sections,
      totals: {
        matches: sections.reduce((n, s) => n + s.matches.length, 0),
        competitions: sections.length,
        live: sections.reduce((n, s) => n + s.matches.filter((m) => m.status.type === "live").length, 0),
      },
    };

    CACHE.set(date, { at: Date.now(), data });
    if (CACHE.size > 40) CACHE.delete(CACHE.keys().next().value);

    return Response.json(data);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}