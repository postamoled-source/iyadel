import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { getCachedTools } from "@/lib/tools-cache";
import { useI18n } from "@/lib/i18n";

// Collapsible internal-links cloud rendered from the cached sitemap tool list.
// Boosts internal linking (SEO crawlability) and helps visitors discover more tools.
export default function ExploreAllTools() {
  const { t } = useI18n();
  const [groups, setGroups] = useState(null);

  useEffect(() => {
    let alive = true;
    getCachedTools().then((tools) => {
      if (!alive) return;
      const map = {};
      (tools || []).forEach((tool) => {
        const c = tool.category || "Other";
        (map[c] = map[c] || []).push(tool);
      });
      setGroups(map);
    });
    return () => { alive = false; };
  }, []);

  return (
    <details className="group mt-6 rounded-2xl bg-white dark:bg-[#2D2A5A] border border-[#F3F4F6] dark:border-[#4B3F8A] p-4">
      <summary className="cursor-pointer list-none flex items-center justify-between text-sm font-bold text-[#111827] dark:text-[#FEF3C7]">
        <span>Explore All iyadel Tools — Free • استكشف كل الأدوات المجانية</span>
        <ChevronDown className="w-4 h-4 shrink-0 transition-transform group-open:rotate-180" />
      </summary>
      <div className="mt-4 space-y-4">
        {groups ? (
          Object.entries(groups).map(([cat, tools]) => (
            <div key={cat}>
              <h3 className="text-xs font-bold uppercase tracking-wide text-[#6D28D9] dark:text-[#FBBF24] mb-2">{t(cat)}</h3>
              <div className="flex flex-wrap gap-1.5">
                {tools.map((tool) => (
                  <Link
                    key={tool.slug}
                    to={`/tools/${tool.slug}`}
                    className="text-xs px-2.5 py-1 rounded-full bg-[#F5F3FF] dark:bg-[#1E1B4B] text-[#1E1B4B] dark:text-[#FEF3C7] border border-[#E9D5FF] dark:border-[#4B3F8A] hover:bg-[#6D28D9] hover:text-white hover:border-[#6D28D9] transition-colors"
                  >
                    {tool.name}
                  </Link>
                ))}
              </div>
            </div>
          ))
        ) : (
          <p className="text-xs text-[#6B7280]">Loading… / جارٍ التحميل…</p>
        )}
      </div>
    </details>
  );
}