// Client-side adaptation of the PHP sitemap-tools cache.
// Fetches the published sitemap, extracts tool URLs, enriches them from
// STATIC_TOOLS, and caches the result in localStorage for 24h.
// Falls back to the full STATIC_TOOLS list on any error.
import { STATIC_TOOLS } from "@/data/tools";

const CACHE_KEY = "iyadel_tools_cache";
const EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

function fallbackList() {
  return STATIC_TOOLS.map((t) => ({ slug: t.slug, name: t.name, category: t.category }));
}

async function extractToolsFromSitemap() {
  const res = await fetch("/sitemap.xml", { cache: "no-store" });
  if (!res.ok) throw new Error("sitemap fetch failed");
  const xml = await res.text();
  const doc = new DOMParser().parseFromString(xml, "application/xml");
  const locs = Array.from(doc.querySelectorAll("loc")).map((n) => (n.textContent || "").trim());
  const slugSet = new Set();
  locs.forEach((u) => {
    const m = u.match(/\/tools\/([^/?#]+)$/);
    if (m) slugSet.add(m[1]);
  });
  if (slugSet.size < 5) throw new Error("sitemap too sparse"); // fall back to full list
  const found = STATIC_TOOLS.filter((t) => slugSet.has(t.slug)).map((t) => ({
    slug: t.slug, name: t.name, category: t.category,
  }));
  return found.length ? found : fallbackList();
}

export async function getCachedTools() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.data) && Date.now() - parsed.ts < EXPIRY_MS) {
        return parsed.data;
      }
    }
  } catch {}

  let tools;
  try {
    tools = await extractToolsFromSitemap();
  } catch {
    tools = fallbackList();
  }

  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data: tools }));
  } catch {}
  return tools;
}