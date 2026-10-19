import { useState } from "react";
import { Loader2 } from "lucide-react";

function buildServers(tmdbId, mediaType, season, episode) {
  const isTv = mediaType === "tv";
  return [
    {
      key: "vidsrc",
      label: "VidSrc",
      url: isTv
        ? `https://vidsrc.to/embed/tv/${tmdbId}/${season}/${episode}`
        : `https://vidsrc.to/embed/movie/${tmdbId}`,
    },
    {
      key: "multiembed",
      label: "MultiEmbed",
      url: `https://multiembed.mov/?video_id=${tmdbId}&tmdb=1`,
    },
    {
      key: "embedsu",
      label: "EmbedSU",
      url: isTv
        ? `https://embed.su/embed/tv/${tmdbId}/${season}/${episode}`
        : `https://embed.su/embed/movie/${tmdbId}`,
    },
  ];
}

export default function EmbedServersPlayer({
  tmdbId,
  mediaType = "movie",
  season = 1,
  episode = 1,
  title,
  lang,
}) {
  const servers = buildServers(tmdbId, mediaType, season, episode);
  const [activeKey, setActiveKey] = useState(servers[0].key);
  const [ready, setReady] = useState(false);

  const L = lang === "ar"
    ? { preparing: "جارٍ تجهيز المشغل...", servers: "السيرفرات" }
    : { preparing: "Preparing the player...", servers: "Servers" };

  const current = servers.find((s) => s.key === activeKey) || servers[0];

  return (
    <div>
      <div className="relative w-full aspect-video bg-black">
        {!ready && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-black">
            <Loader2 className="w-8 h-8 animate-spin text-[#F59E0B]" />
            <p className="text-xs text-white/70">{L.preparing}</p>
          </div>
        )}
        <iframe
          key={current.key}
          src={current.url}
          title={title}
          allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
          allowFullScreen
          className="w-full h-full border-0"
          onLoad={() => setReady(true)}
        />
      </div>

      <div className="flex flex-wrap items-center gap-2 px-3 py-3 bg-[#111827]">
        <span className="text-[11px] font-semibold text-white/60">{L.servers}:</span>
        {servers.map((s, i) => (
          <button
            key={s.key}
            type="button"
            title={s.label}
            onClick={() => {
              if (s.key === activeKey) return;
              setReady(false);
              setActiveKey(s.key);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              activeKey === s.key
                ? "bg-[#F59E0B] text-black"
                : "bg-white/10 text-white/80 hover:bg-white/20"
            }`}
          >
            {lang === "ar" ? `سيرفر ${i + 1}` : `Server ${i + 1}`}
          </button>
        ))}
      </div>
    </div>
  );
}