import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import ProServerPane from "./ProServerPane";

function buildServers(tmdbId, mediaType, season, episode) {
  const isTv = mediaType === "tv";
  const path = isTv ? `tv/${tmdbId}/${season}/${episode}` : `movie/${tmdbId}`;
  return [
    {
      key: "vidlink",
      label: "VidLink",
      url: `https://vidlink.pro/${path}`,
    },
    {
      key: "vidfast",
      label: "VidFast",
      url: `https://vidfast.vc/${path}`,
    },
    {
      key: "pro",
      label: "Pro",
      url: "",
    },
    {
      key: "111movies",
      label: "111Movies",
      url: `https://111movies.com/${path}`,
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
  const [blocked, setBlocked] = useState(false);

  const L = lang === "ar"
    ? {
        preparing: "جارٍ تجهيز المشغل...",
        servers: "السيرفرات",
        blocked: "هذا السيرفر لم يفتح داخل الصفحة — قد يكون محجوباً من المتصفح.",
        openTab: "افتح السيرفر في نافذة جديدة",
        other: "أو اختر سيرفراً آخر من الأسفل.",
        blackHint: "إذا بقيت الشاشة سوداء فالسيرفر غير متاح من شبكتك.",
      }
    : {
        preparing: "Preparing the player...",
        servers: "Servers",
        blocked: "This server did not open inside the page — the browser may be blocking it.",
        openTab: "Open the server in a new tab",
        other: "Or pick another server below.",
        blackHint: "If the screen stays black, this server isn't reachable from your network.",
      };

  // Third-party embeds can be refused by the browser (frame blocking, network
  // errors). After a grace period show a way out instead of an endless spinner.
  useEffect(() => {
    if (ready) return;
    const t = setTimeout(() => setBlocked(true), 15000);
    return () => clearTimeout(t);
  }, [ready, activeKey]);

  const current = servers.find((s) => s.key === activeKey) || servers[0];

  return (
    <div>
      {current.key === "pro" ? (
        <ProServerPane title={title} lang={lang} />
      ) : (
        <div className="relative w-full aspect-video bg-black">
          {!ready && !blocked && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-black">
              <Loader2 className="w-8 h-8 animate-spin text-[#F59E0B]" />
              <p className="text-xs text-white/70">{L.preparing}</p>
            </div>
          )}
          {!ready && blocked && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-black px-5 text-center">
              <p className="max-w-xs text-xs leading-relaxed text-white/70">{L.blocked}</p>
              <a
                href={current.url}
                target="_blank"
                rel="noreferrer"
                className="rounded-lg bg-[#F59E0B] px-3 py-2 text-xs font-bold text-black"
              >
                {L.openTab}
              </a>
              <p className="text-[11px] text-white/40">{L.other}</p>
            </div>
          )}
          <iframe
            key={current.key}
            src={current.url}
            title={title}
            referrerPolicy="origin"
            allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
            allowFullScreen
            className="w-full h-full border-0"
            onLoad={() => setReady(true)}
          />
        </div>
      )}

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
              setBlocked(false);
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

      {current.key !== "pro" && (
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/10 bg-[#111827] px-3 py-2">
          <p className="text-[11px] leading-relaxed text-white/40">{L.blackHint}</p>
          <a
            href={current.url}
            target="_blank"
            rel="noreferrer"
            className="text-[11px] font-semibold text-[#F59E0B] underline"
          >
            {L.openTab}
          </a>
        </div>
      )}
    </div>
  );
}