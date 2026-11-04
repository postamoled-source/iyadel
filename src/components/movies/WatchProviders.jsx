import { ExternalLink } from "lucide-react";
import { Image } from "@/components/ui/image";

const GROUPS = [
  { key: "flatrate", en: "Subscription", ar: "اشتراك" },
  { key: "free", en: "Free", ar: "مجاني" },
  { key: "ads", en: "With ads", ar: "مع إعلانات" },
  { key: "rent", en: "Rent", ar: "إيجار" },
  { key: "buy", en: "Buy", ar: "شراء" },
];

export default function WatchProviders({ providers, region, lang }) {
  const results = providers?.results || {};
  const codes = Object.keys(results);
  const usedRegion = results[region] ? region : results.US ? "US" : codes[0];
  const data = usedRegion ? results[usedRegion] : null;
  if (!data) return null;

  const groups = GROUPS.map((g) => ({ ...g, list: data[g.key] || [] })).filter((g) => g.list.length);
  if (!groups.length) return null;

  return (
    <div className="space-y-3">
      {usedRegion !== region && (
        <p className="text-[11px] text-[#9CA3AF] dark:text-[#8B8AB0]">
          {lang === "ar" ? `التوفر معروض لمنطقة ${usedRegion}` : `Availability shown for ${usedRegion}`}
        </p>
      )}
      {groups.map((g) => (
        <div key={g.key}>
          <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-[#9CA3AF] dark:text-[#8B8AB0]">
            {lang === "ar" ? g.ar : g.en}
          </p>
          <div className="flex flex-wrap gap-2">
            {g.list.map((p) => (
              <a
                key={`${g.key}-${p.provider_id}`}
                href={data.link || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-[#E9D5FF] bg-white px-2.5 py-1.5 text-xs font-semibold text-[#111827] transition-colors hover:border-[#6D28D9] dark:border-[#4B3F8A] dark:bg-[#2D2A5A] dark:text-[#FEF3C7]"
              >
                {p.logo_path && (
                  <Image
                    src={`https://image.tmdb.org/t/p/w92${p.logo_path}`}
                    alt={p.provider_name}
                    className="h-6 w-6 rounded-md"
                  />
                )}
                {p.provider_name}
              </a>
            ))}
          </div>
        </div>
      ))}
      {data.link && (
        <a
          href={data.link}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6D28D9] hover:opacity-80 dark:text-[#FBBF24]"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          {lang === "ar" ? "كل خيارات المشاهدة" : "See all watch options"}
        </a>
      )}
    </div>
  );
}