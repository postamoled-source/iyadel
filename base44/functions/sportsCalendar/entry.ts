const UA = { "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/121 Safari/537.36" };
const CACHE = new Map();
const TTL_LIVE = 60_000;
const TTL_PAST = 15 * 60_000;
const MAX_DAYS = 45;

const REGIONS = [
  { key: "arab", en: "Arab World", ar: "العالم العربي" },
  { key: "europe", en: "Europe", ar: "أوروبا" },
  { key: "africa", en: "Africa", ar: "أفريقيا" },
  { key: "asia", en: "Asia", ar: "آسيا" },
  { key: "americas", en: "Americas", ar: "الأمريكتان" },
  { key: "world", en: "World", ar: "البطولات العالمية" },
];

// Curated competitions, ordered by region. Some competitions carry more than one
// feed id because FotMob exposes both legacy and current ids for them.
const CATALOG = [
  // Arab world
  { ids: [530], en: "Botola Pro", ar: "البطولة الاحترافية المغربية", region: "arab" },
  { ids: [11840], en: "Throne Cup", ar: "كأس العرش المغربي", region: "arab" },
  { ids: [519], en: "Egyptian Premier League", ar: "الدوري المصري الممتاز", region: "arab" },
  { ids: [9941], en: "Egypt Cup", ar: "كأس مصر", region: "arab" },
  { ids: [516], en: "Algerian Ligue 1", ar: "الدوري الجزائري", region: "arab" },
  { ids: [544], en: "Tunisian Ligue I", ar: "الدوري التونسي", region: "arab" },
  { ids: [536, 1000001787], en: "Saudi Pro League", ar: "دوري روشن السعودي", region: "arab" },
  { ids: [9942], en: "King's Cup", ar: "كأس خادم الحرمين الشريفين", region: "arab" },
  { ids: [535], en: "Qatar Stars League", ar: "دوري نجوم قطر", region: "arab" },
  { ids: [538], en: "UAE Pro League", ar: "دوري أدنوك الإماراتي", region: "arab" },
  { ids: [10474], en: "Arab Club Champions Cup", ar: "كأس العرب للأندية الأبطال", region: "arab" },
  { ids: [10242], en: "FIFA Arab Cup", ar: "كأس العرب للمنتخبات", region: "arab" },
  { ids: [329], en: "Gulf Cup", ar: "كأس الخليج للمنتخبات", region: "arab" },
  // Europe
  { ids: [42], en: "UEFA Champions League", ar: "دوري أبطال أوروبا", region: "europe" },
  { ids: [73], en: "UEFA Europa League", ar: "الدوري الأوروبي", region: "europe" },
  { ids: [10216], en: "UEFA Conference League", ar: "دوري المؤتمرات الأوروبي", region: "europe" },
  { ids: [74], en: "UEFA Super Cup", ar: "كأس السوبر الأوروبي", region: "europe" },
  { ids: [47], en: "Premier League", ar: "الدوري الإنجليزي الممتاز", region: "europe" },
  { ids: [132], en: "FA Cup", ar: "كأس الاتحاد الإنجليزي", region: "europe" },
  { ids: [87], en: "LaLiga", ar: "الدوري الإسباني", region: "europe" },
  { ids: [138], en: "Copa del Rey", ar: "كأس ملك إسبانيا", region: "europe" },
  { ids: [55], en: "Serie A", ar: "الدوري الإيطالي", region: "europe" },
  { ids: [54], en: "Bundesliga", ar: "الدوري الألماني", region: "europe" },
  { ids: [209], en: "DFB Pokal", ar: "كأس ألمانيا", region: "europe" },
  { ids: [53], en: "Ligue 1", ar: "الدوري الفرنسي", region: "europe" },
  { ids: [134], en: "Coupe de France", ar: "كأس فرنسا", region: "europe" },
  { ids: [61], en: "Liga Portugal", ar: "الدوري البرتغالي", region: "europe" },
  { ids: [57, 937276], en: "Eredivisie", ar: "الدوري الهولندي", region: "europe" },
  { ids: [71], en: "Süper Lig", ar: "الدوري التركي", region: "europe" },
  { ids: [50], en: "UEFA EURO", ar: "كأس أمم أوروبا", region: "europe" },
  { ids: [288], en: "UEFA EURO U21", ar: "أمم أوروبا تحت 21", region: "europe" },
  { ids: [287], en: "UEFA U19 Championship", ar: "أمم أوروبا تحت 19", region: "europe" },
  { ids: [301], en: "UEFA U17 Championship", ar: "أمم أوروبا تحت 17", region: "europe" },
  { ids: [9806], en: "UEFA Nations League", ar: "دوري الأمم الأوروبية", region: "europe" },
  { ids: [10195], en: "World Cup Qualifying — UEFA", ar: "تصفيات كأس العالم — أوروبا", region: "europe" },
  // Africa
  { ids: [526], en: "CAF Champions League", ar: "دوري أبطال أفريقيا", region: "africa" },
  { ids: [9468], en: "CAF Confederation Cup", ar: "كأس الكونفدرالية الأفريقية", region: "africa" },
  { ids: [9467], en: "CAF Super Cup", ar: "كأس السوبر الأفريقي", region: "africa" },
  { ids: [289], en: "Africa Cup of Nations", ar: "كأس الأمم الأفريقية", region: "africa" },
  { ids: [10608], en: "AFCON Qualification", ar: "تصفيات كأس الأمم الأفريقية", region: "africa" },
  { ids: [9428], en: "African Nations Championship", ar: "أمم أفريقيا للمحليين", region: "africa" },
  { ids: [10196], en: "World Cup Qualifying — CAF", ar: "تصفيات كأس العالم — أفريقيا", region: "africa" },
  // Asia
  { ids: [525], en: "AFC Champions League Elite", ar: "دوري أبطال آسيا للنخبة", region: "asia" },
  { ids: [9469], en: "AFC Champions League Two", ar: "دوري أبطال آسيا 2", region: "asia" },
  { ids: [9470], en: "AFC Challenge League", ar: "دوري التحدي الآسيوي", region: "asia" },
  { ids: [290], en: "AFC Asian Cup", ar: "كأس آسيا للمنتخبات", region: "asia" },
  { ids: [9571], en: "AFC U23 Asian Cup", ar: "كأس آسيا تحت 23", region: "asia" },
  { ids: [9841], en: "AFC U20 Asian Cup", ar: "كأس آسيا تحت 20", region: "asia" },
  { ids: [223, 937875], en: "J.League", ar: "الدوري الياباني", region: "asia" },
  { ids: [8974, 938215], en: "J.League 2", ar: "الدوري الياباني — الدرجة الثانية", region: "asia" },
  { ids: [10197], en: "World Cup Qualifying — AFC", ar: "تصفيات كأس العالم — آسيا", region: "asia" },
  // Americas
  { ids: [45], en: "Copa Libertadores", ar: "كأس ليبرتادوريس", region: "americas" },
  { ids: [299], en: "Copa Sudamericana", ar: "كأس سودأمريكانا", region: "americas" },
  { ids: [268], en: "Brasileirão Série A", ar: "الدوري البرازيلي", region: "americas" },
  { ids: [8814], en: "Brasileirão Série B", ar: "الدوري البرازيلي — الدرجة الثانية", region: "americas" },
  { ids: [112, 1000001729], en: "Argentine Liga Profesional", ar: "الدوري الأرجنتيني", region: "americas" },
  { ids: [130], en: "Major League Soccer", ar: "الدوري الأمريكي", region: "americas" },
  { ids: [44], en: "Copa América", ar: "كوبا أمريكا", region: "americas" },
  { ids: [298], en: "CONCACAF Gold Cup", ar: "الكأس الذهبية", region: "americas" },
  { ids: [297], en: "CONCACAF Champions Cup", ar: "دوري أبطال الكونكاكاف", region: "americas" },
  { ids: [10199], en: "World Cup Qualifying — CONMEBOL", ar: "تصفيات كأس العالم — أمريكا الجنوبية", region: "americas" },
  // World
  { ids: [77], en: "FIFA World Cup", ar: "كأس العالم", region: "world" },
  { ids: [296], en: "FIFA U20 World Cup", ar: "كأس العالم تحت 20", region: "world" },
  { ids: [306], en: "FIFA U17 World Cup", ar: "كأس العالم تحت 17", region: "world" },
  { ids: [66], en: "Olympic Football", ar: "كرة القدم الأولمبية", region: "world" },
  { ids: [78], en: "FIFA Club World Cup", ar: "كأس العالم للأندية", region: "world" },
];

const ID_INDEX = new Map();
for (const entry of CATALOG) for (const id of entry.ids) ID_INDEX.set(String(id), entry);

// The feed sometimes publishes a competition under a different id than the
// league directory does (and splits cups into groups), so fall back to
// country + name matching. Most specific prefixes come first.
const NAME_RULES = [
  { cc: "INT", prefix: "world cup qualification caf", target: 10196 },
  { cc: "INT", prefix: "world cup qualification uefa", target: 10195 },
  { cc: "INT", prefix: "world cup qualification afc", target: 10197 },
  { cc: "INT", prefix: "world cup qualification conmebol", target: 10199 },
  { cc: "INT", prefix: "world cup u20", target: 296 },
  { cc: "INT", prefix: "world cup u17", target: 306 },
  { cc: "INT", prefix: "world cup", target: 77 },
  { cc: "INT", prefix: "africa cup of nations qualification", target: 10608 },
  { cc: "INT", prefix: "africa cup of nations", target: 289 },
  { cc: "INT", prefix: "afc champions league elite", target: 525 },
  { cc: "INT", prefix: "afc champions league two", target: 9469 },
  { cc: "INT", prefix: "afc challenge league", target: 9470 },
  { cc: "INT", prefix: "caf champions league", target: 526 },
  { cc: "INT", prefix: "caf confed", target: 9468 },
  { cc: "INT", prefix: "copa libertadores", target: 45 },
  { cc: "INT", prefix: "copa sudamericana", target: 299 },
  { cc: "INT", prefix: "copa america", target: 44 },
  { cc: "INT", prefix: "concacaf gold cup", target: 298 },
  { cc: "INT", prefix: "concacaf champions cup", target: 297 },
  { cc: "INT", prefix: "champions league", target: 42 },
  { cc: "INT", prefix: "europa league", target: 73 },
  { cc: "INT", prefix: "conference league", target: 10216 },
  { cc: "INT", prefix: "euro u21", target: 288 },
  { cc: "INT", prefix: "european championship", target: 50 },
  { cc: "INT", prefix: "uefa nations league", target: 9806 },
  { cc: "INT", prefix: "club world cup", target: 78 },
  { cc: "INT", prefix: "asian cup", target: 290 },
  { cc: "INT", prefix: "olympic", target: 66 },
  { cc: "MAR", prefix: "botola", target: 530 },
  { cc: "MAR", prefix: "throne cup", target: 11840 },
  { cc: "EGY", prefix: "premier league", target: 519 },
  { cc: "EGY", prefix: "cup", target: 9941 },
  { cc: "ALG", prefix: "ligue 1", target: 516 },
  { cc: "TUN", prefix: "ligue", target: 544 },
  { cc: "KSA", prefix: "saudi pro league", target: 536 },
  { cc: "KSA", prefix: "pro league", target: 536 },
  { cc: "KSA", prefix: "king's cup", target: 9942 },
  { cc: "QAT", prefix: "qatar stars league", target: 535 },
  { cc: "QAT", prefix: "stars league", target: 535 },
  { cc: "UAE", prefix: "pro league", target: 538 },
  { cc: "ENG", prefix: "premier league", target: 47 },
  { cc: "ENG", prefix: "fa cup", target: 132 },
  { cc: "ESP", prefix: "laliga", target: 87 },
  { cc: "ESP", prefix: "copa del rey", target: 138 },
  { cc: "ITA", prefix: "serie a", target: 55 },
  { cc: "GER", prefix: "bundesliga", target: 54 },
  { cc: "GER", prefix: "dfb pokal", target: 209 },
  { cc: "FRA", prefix: "ligue 1", target: 53 },
  { cc: "FRA", prefix: "coupe de france", target: 134 },
  { cc: "POR", prefix: "liga portugal", target: 61 },
  { cc: "NED", prefix: "eredivisie", target: 57 },
  { cc: "TUR", prefix: "super lig", target: 71 },
  { cc: "USA", prefix: "mls", target: 130 },
  { cc: "USA", prefix: "major league soccer", target: 130 },
  { cc: "BRA", prefix: "brasileirao", target: 268 },
  { cc: "BRA", prefix: "serie a", target: 268 },
  { cc: "BRA", prefix: "serie b", target: 8814 },
  { cc: "ARG", prefix: "liga profesional", target: 112 },
  { cc: "ARG", prefix: "primera division", target: 112 },
  { cc: "JPN", prefix: "j. league 2", target: 8974 },
  { cc: "JPN", prefix: "j. league", target: 223 },
];

function normName(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function resolveLeague(id, name, ccode) {
  const byId = ID_INDEX.get(String(id));
  if (byId) return byId;
  const n = normName(name);
  if (!n) return null;
  if (/qualification/.test(n) && !n.startsWith("world cup qualification") && !n.startsWith("africa cup of nations qualification")) {
    return null;
  }
  const cc = String(ccode || "").toUpperCase();
  for (const rule of NAME_RULES) {
    if (rule.cc !== cc) continue;
    if (!n.startsWith(rule.prefix)) continue;
    return ID_INDEX.get(String(rule.target)) || null;
  }
  return null;
}

function validDate(value) {
  const d = String(value || "").trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) return null;
  const t = Date.parse(d + "T00:00:00Z");
  if (Number.isNaN(t)) return null;
  const days = (t - Date.now()) / 86_400_000;
  if (days < -MAX_DAYS || days > MAX_DAYS) return null;
  return d;
}

function teamLogo(id) {
  return id ? `https://images.fotmob.com/image_resources/logo/teamlogo/${id}.png` : "";
}

function mapStatus(status = {}) {
  const reason = status.reason || {};
  const flag = `${reason.short || ""} ${reason.long || ""} ${reason.shortKey || ""} ${reason.longKey || ""}`;
  if (/postpon/i.test(flag)) return "postponed";
  if (/cancel|abandon|award/i.test(flag) || status.cancelled) return "canceled";
  if (status.finished) return "finished";
  if (status.started) return "live";
  return "upcoming";
}

function liveLabel(status = {}) {
  return status.liveTime?.short || status.reason?.short || status.reason?.long || "LIVE";
}

function normalizeFeedMatch(match, entry) {
  const state = mapStatus(match.status);
  const homeScore = match.home?.score;
  const awayScore = match.away?.score;
  return {
    id: String(match.id),
    competition: entry.en,
    competition_ar: entry.ar,
    region: entry.region,
    kickoff: match.status?.utcTime || null,
    home: {
      id: match.home?.id || null,
      name: match.home?.name || "",
      logo: teamLogo(match.home?.id),
      score: typeof homeScore === "number" ? homeScore : null,
      red: match.status?.numberOfHomeRedCards || 0,
    },
    away: {
      id: match.away?.id || null,
      name: match.away?.name || "",
      logo: teamLogo(match.away?.id),
      score: typeof awayScore === "number" ? awayScore : null,
      red: match.status?.numberOfAwayRedCards || match.away?.redCards || 0,
    },
    status: {
      type: state,
      label: state === "live" ? liveLabel(match.status) : null,
      score_str: match.status?.scoreStr || null,
    },
  };
}

async function loadBoard(date) {
  const key = `board:${date}`;
  const hit = CACHE.get(key);
  if (hit && Date.now() - hit.at < hit.ttl) return hit.data;

  const res = await fetch(`https://www.fotmob.com/api/data/matches?date=${date.replace(/-/g, "")}`, { headers: UA });
  if (!res.ok) throw new Error(`Feed responded ${res.status}`);
  const json = await res.json();

  const byEntry = new Map();
  for (const league of json.leagues || []) {
    const entry = resolveLeague(league.id, league.name, league.ccode);
    if (!entry) continue;
    const bucket = byEntry.get(entry.en) || { entry, matches: new Map() };
    for (const match of league.matches || []) {
      if (!match.home?.name || !match.away?.name) continue;
      bucket.matches.set(String(match.id), normalizeFeedMatch(match, entry));
    }
    byEntry.set(entry.en, bucket);
  }

  const sections = [...byEntry.values()]
    .map(({ entry, matches }) => ({
      id: entry.ids[0],
      name: entry.en,
      name_ar: entry.ar,
      region: entry.region,
      logo: `https://images.fotmob.com/image_resources/logo/leaguelogo/${entry.ids[0]}.png`,
      matches: [...matches.values()].sort((a, b) => String(a.kickoff || "").localeCompare(String(b.kickoff || ""))),
    }))
    .filter((section) => section.matches.length > 0);

  const regions = REGIONS.map((region) => ({
    key: region.key,
    name: region.en,
    name_ar: region.ar,
    sections: sections.filter((s) => s.region === region.key),
  })).filter((region) => region.sections.length > 0);

  const allMatches = sections.flatMap((s) => s.matches);
  const data = {
    date,
    updated_at: new Date().toISOString(),
    regions,
    totals: {
      matches: allMatches.length,
      competitions: sections.length,
      live: allMatches.filter((m) => m.status.type === "live").length,
    },
    live_matches: allMatches.filter((m) => m.status.type === "live"),
  };

  const hasLive = data.totals.live > 0 || date === new Date().toISOString().slice(0, 10);
  CACHE.set(key, { at: Date.now(), ttl: hasLive ? TTL_LIVE : TTL_PAST, data });
  if (CACHE.size > 60) CACHE.delete(CACHE.keys().next().value);
  return data;
}

const TTL_TABLE = 10 * 60_000;
const SPLIT_TABLES = new Set(["home", "away", "form", "xg"]);

// Display order for the standings picker: big European and continental
// competitions first (African and world club/international cups included),
// Arab leagues last with the Moroccan Botola at the head of that group.
const PICKER_ORDER = [
  "UEFA Champions League",
  "UEFA Europa League",
  "UEFA Conference League",
  "UEFA Super Cup",
  "Premier League",
  "LaLiga",
  "Serie A",
  "Bundesliga",
  "Ligue 1",
  "Liga Portugal",
  "Eredivisie",
  "Süper Lig",
  "FA Cup",
  "Copa del Rey",
  "DFB Pokal",
  "Coupe de France",
  "UEFA EURO",
  "UEFA Nations League",
  "World Cup Qualifying — UEFA",
  "UEFA EURO U21",
  "UEFA U19 Championship",
  "UEFA U17 Championship",
  "CAF Champions League",
  "CAF Confederation Cup",
  "CAF Super Cup",
  "Africa Cup of Nations",
  "AFCON Qualification",
  "African Nations Championship",
  "World Cup Qualifying — CAF",
  "AFC Champions League Elite",
  "AFC Champions League Two",
  "AFC Challenge League",
  "AFC Asian Cup",
  "AFC U23 Asian Cup",
  "AFC U20 Asian Cup",
  "World Cup Qualifying — AFC",
  "Copa Libertadores",
  "Copa Sudamericana",
  "Copa América",
  "CONCACAF Gold Cup",
  "CONCACAF Champions Cup",
  "World Cup Qualifying — CONMEBOL",
  "Brasileirão Série A",
  "Brasileirão Série B",
  "Argentine Liga Profesional",
  "Major League Soccer",
  "J.League",
  "J.League 2",
  "FIFA World Cup",
  "FIFA Club World Cup",
  "FIFA U20 World Cup",
  "FIFA U17 World Cup",
  "Olympic Football",
  // Arab competitions last — Botola Pro leads this group
  "Botola Pro",
  "Throne Cup",
  "Egyptian Premier League",
  "Egypt Cup",
  "Algerian Ligue 1",
  "Tunisian Ligue I",
  "Saudi Pro League",
  "King's Cup",
  "Qatar Stars League",
  "UAE Pro League",
  "Arab Club Champions Cup",
  "FIFA Arab Cup",
  "Gulf Cup",
];

function competitionsList() {
  const byName = new Map(CATALOG.map((entry) => [entry.en, entry]));
  const ordered = PICKER_ORDER.map((name) => byName.get(name)).filter(Boolean);
  const rest = CATALOG.filter((entry) => !PICKER_ORDER.includes(entry.en));
  const items = [...ordered, ...rest].map((entry) => ({
    id: entry.ids[0],
    name: entry.en,
    name_ar: entry.ar,
    logo: `https://images.fotmob.com/image_resources/logo/leaguelogo/${entry.ids[0]}.png`,
  }));
  return [{ key: "all", name: "Competitions", name_ar: "البطولات والدوريات", items }];
}

function tableRow(row) {
  const goals = String(row.scoresStr || "").split("-");
  return {
    id: row.id || null,
    position: row.idx ?? null,
    name: row.name || "",
    short: row.shortName || row.name || "",
    logo: teamLogo(row.id),
    played: row.played ?? 0,
    wins: row.wins ?? 0,
    draws: row.draws ?? 0,
    losses: row.losses ?? 0,
    goals_for: Number(goals[0]) || 0,
    goals_against: Number(goals[1]) || 0,
    diff: row.goalConDiff ?? 0,
    points: row.pts ?? 0,
    deduction: row.deduction || null,
    color: row.qualColor || null,
  };
}

function groupName(key) {
  if (key === "all") return null;
  const clean = String(key).replace(/^group[_ ]?/i, "").trim();
  return clean ? clean.toUpperCase() : null;
}

async function loadStandings(leagueId) {
  const entry = ID_INDEX.get(String(leagueId));
  if (!entry) throw new Error("Unknown competition");

  const key = `table:${entry.en}`;
  const hit = CACHE.get(key);
  if (hit && Date.now() - hit.at < hit.ttl) return hit.data;

  let payload = null;
  for (const id of entry.ids) {
    try {
      const res = await fetch(`https://www.fotmob.com/api/data/leagues?id=${id}`, { headers: UA });
      if (!res.ok) continue;
      const json = await res.json();
      if (json?.table || json?.details) {
        payload = json;
        break;
      }
    } catch {
      // try the next id for this competition
    }
  }
  if (!payload) throw new Error("Standings are unavailable right now");

  const block = Array.isArray(payload.table) ? payload.table[0] : payload.table;
  const info = block?.data || {};
  const tables = info.table || {};
  const keys = Object.keys(tables).filter((k) => Array.isArray(tables[k]) && tables[k].length > 0);
  const used = keys.includes("all") ? ["all"] : keys.filter((k) => !SPLIT_TABLES.has(k));

  const data = {
    id: entry.ids[0],
    competition: entry.en,
    competition_ar: entry.ar,
    region: entry.region,
    logo: `https://images.fotmob.com/image_resources/logo/leaguelogo/${entry.ids[0]}.png`,
    season: payload.details?.selectedSeason || null,
    legend: (info.legend || [])
      .filter((item) => item?.color)
      .map((item) => ({ title: item.title || "", color: item.color, indices: item.indices || [] })),
    groups: used.map((k) => ({ key: k, name: groupName(k), rows: tables[k].map(tableRow) })),
    matches: competitionMatches(payload.fixtures?.allMatches || [], entry),
    updated_at: new Date().toISOString(),
  };

  CACHE.set(key, { at: Date.now(), ttl: TTL_TABLE, data });
  if (CACHE.size > 80) CACHE.delete(CACHE.keys().next().value);
  return data;
}

function normalizeFixture(fixture, entry) {
  const scoreStr = fixture.status?.scoreStr || "";
  const nums = scoreStr.match(/(\d+)\s*-\s*(\d+)/);
  const state = mapStatus(fixture.status);
  return {
    id: String(fixture.id),
    competition: entry.en,
    competition_ar: entry.ar,
    region: entry.region,
    round: fixture.roundName ? String(fixture.roundName) : null,
    group: fixture.group || null,
    kickoff: fixture.status?.utcTime || null,
    home: {
      id: fixture.home?.id || null,
      name: fixture.home?.name || "",
      logo: teamLogo(fixture.home?.id),
      score: nums ? Number(nums[1]) : null,
      red: 0,
    },
    away: {
      id: fixture.away?.id || null,
      name: fixture.away?.name || "",
      logo: teamLogo(fixture.away?.id),
      score: nums ? Number(nums[2]) : null,
      red: 0,
    },
    status: {
      type: state,
      label: state === "live" ? liveLabel(fixture.status) : null,
      score_str: scoreStr || null,
    },
  };
}

// Knockout competitions carry no table, so fall back to their matches: live
// first, then the next fixtures, then the latest results.
const PLACEHOLDER_TEAM = /^(\d{1,2}[A-Z]|[A-Z]\d|W\d+|\d+)$/;

function competitionMatches(list, entry) {
  const matches = list
    .map((fixture) => normalizeFixture(fixture, entry))
    .filter(
      (match) =>
        !PLACEHOLDER_TEAM.test(match.home.name.trim()) && !PLACEHOLDER_TEAM.test(match.away.name.trim())
    );
  const byKickoff = (a, b) => String(a.kickoff || "").localeCompare(String(b.kickoff || ""));
  const live = matches.filter((m) => m.status.type === "live");
  const upcoming = matches
    .filter((m) => m.status.type === "upcoming" || m.status.type === "postponed")
    .sort(byKickoff)
    .slice(0, 8);
  const finished = matches
    .filter((m) => m.status.type === "finished" || m.status.type === "canceled")
    .sort((a, b) => byKickoff(b, a))
    .slice(0, 8);
  return [...live, ...upcoming, ...finished].slice(0, 14);
}

function minuteLabel(event) {
  const base = event.time;
  if (base === undefined || base === null) return "";
  return event.overloadTime ? `${base}+${event.overloadTime}'` : `${base}'`;
}

function normalizeEvents(events = []) {
  const out = [];
  for (const event of events) {
    const side = event.isHome ? "home" : "away";
    const minute = minuteLabel(event);
    if (event.type === "Goal") {
      const score = Array.isArray(event.newScore) ? event.newScore : null;
      out.push({
        kind: "goal",
        side,
        minute,
        player: event.nameStr || event.fullName || "",
        assist: (event.assistStr || "").replace(/^assist by\s+/i, "").trim() || null,
        own_goal: Boolean(event.ownGoal),
        penalty: /penalt/i.test(`${event.goalDescription || ""} ${event.goalDescriptionKey || ""}`),
        score: score ? `${score[0]} - ${score[1]}` : null,
      });
    } else if (event.type === "Card") {
      out.push({
        kind: event.card === "Red" ? "red" : "yellow",
        side,
        minute,
        player: event.nameStr || event.fullName || "",
        reason: event.cardReason?.defaultText || null,
      });
    } else if (event.type === "Substitution") {
      out.push({
        kind: "sub",
        side,
        minute,
        player_in: event.swap?.[0]?.name || "",
        player_out: event.swap?.[1]?.name || "",
      });
    } else if (event.type === "Half") {
      out.push({ kind: "half", side: null, minute, label: event.halfStrShort || "HT" });
    }
  }
  return out;
}

function normalizeTeamLineup(team, side) {
  if (!team) return null;
  const player = (p) => ({
    name: p.name || "",
    number: p.shirtNumber || "",
    x: p.verticalLayout?.x ?? null,
    y: p.verticalLayout?.y ?? null,
    events: (p.performance?.events || []).map((e) => e.type),
  });
  return {
    side,
    formation: team.formation || null,
    coach: team.coach?.name || null,
    starters: (team.starters || []).map(player),
    subs: (team.subs || []).map((p) => ({ name: p.name || "", number: p.shirtNumber || "" })),
  };
}

async function loadMatch(matchId) {
  const key = `match:${matchId}`;
  const hit = CACHE.get(key);
  if (hit && Date.now() - hit.at < hit.ttl) return hit.data;

  const res = await fetch(`https://www.fotmob.com/api/data/matchDetails?matchId=${encodeURIComponent(matchId)}`, { headers: UA });
  if (!res.ok) throw new Error(`Match feed responded ${res.status}`);
  const json = await res.json();

  const general = json.general || {};
  const info = json.content?.matchFacts?.infoBox || {};
  const status = json.header?.status || {};
  const teams = json.header?.teams || [];
  const homeTeam = teams.find((t) => String(t.id) === String(general.homeTeam?.id)) || teams[0] || {};
  const awayTeam = teams.find((t) => String(t.id) === String(general.awayTeam?.id)) || teams[1] || {};
  const countryCode = json.content?.matchFacts?.countryCode;
  const entry =
    resolveLeague(general.leagueId, general.leagueName, countryCode) ||
    resolveLeague(general.leagueId, general.leagueName, "INT");

  const events = normalizeEvents(json.content?.matchFacts?.events?.events || []);
  const state = mapStatus(status);

  const data = {
    id: String(json.content?.matchFacts?.matchId || matchId),
    competition: entry?.en || general.leagueName || "",
    competition_ar: entry?.ar || null,
    region: entry?.region || null,
    round: info.Tournament?.roundName || general.matchRound || null,
    kickoff: status.utcTime || info["Match Date"]?.utcTime || null,
    venue: info.Stadium?.name || null,
    referee: info.Referee?.text || null,
    attendance: info.Attendance || null,
    status: {
      type: state,
      label: state === "live" ? liveLabel(status) : state === "finished" ? "FT" : null,
      finished: Boolean(status.finished),
      score_str: status.scoreStr || null,
      home_score: typeof homeTeam.score === "number" ? homeTeam.score : null,
      away_score: typeof awayTeam.score === "number" ? awayTeam.score : null,
      home_red: status.numberOfHomeRedCards || 0,
      away_red: status.numberOfAwayRedCards || 0,
    },
    home: { id: homeTeam.id || null, name: homeTeam.name || "", logo: homeTeam.imageUrl || teamLogo(homeTeam.id) },
    away: { id: awayTeam.id || null, name: awayTeam.name || "", logo: awayTeam.imageUrl || teamLogo(awayTeam.id) },
    events,
    lineups: {
      home: normalizeTeamLineup(json.content?.lineup?.homeTeam, "home"),
      away: normalizeTeamLineup(json.content?.lineup?.awayTeam, "away"),
    },
  };

  CACHE.set(key, { at: Date.now(), ttl: state === "live" ? TTL_LIVE : TTL_PAST, data });
  if (CACHE.size > 60) CACHE.delete(CACHE.keys().next().value);
  return data;
}

export default async function (req) {
  try {
    const body = await req.json().catch(() => ({}));
    const action = body.action || "board";

    if (action === "competitions") {
      return Response.json({ regions: competitionsList() });
    }

    if (action === "standings") {
      const leagueId = String(body.leagueId || "").trim();
      if (!/^\d{2,12}$/.test(leagueId)) {
        return Response.json({ error: "Invalid competition id" }, { status: 400 });
      }
      return Response.json(await loadStandings(leagueId));
    }

    if (action === "match") {
      const matchId = String(body.matchId || "").trim();
      if (!/^\d{3,12}$/.test(matchId)) {
        return Response.json({ error: "Invalid match id" }, { status: 400 });
      }
      return Response.json(await loadMatch(matchId));
    }

    const date = validDate(body.date) || new Date().toISOString().slice(0, 10);
    return Response.json(await loadBoard(date));
  } catch (error) {
    return Response.json({ error: error.message }, { status: 502 });
  }
}