import { useState } from "react";
import { Film, Loader2 } from "lucide-react";
import HlsVideoPlayer from "./HlsVideoPlayer";

const DIRECT_RE = /\.(mp4|m4v|webm|ogg|ogv|mov|mkv|m3u8)(\?.*)?$/i;

function toEmbedUrl(url) {
  const yt = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`;
  const vm = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vm) return `https://player.vimeo.com/video/${vm[1]}`;
  return url;
}

function EmbedPlayer({ url, title, lang }) {
  const [ready, setReady] = useState(false);
  const L = lang === "ar" ? { preparing: "جارٍ التحضير..." } : { preparing: "Preparing..." };

  return (
    <div className="relative w-full aspect-video bg-black">
      {!ready && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black z-10">
          <Loader2 className="w-6 h-6 animate-spin text-[#F59E0B]" />
          <p className="text-xs text-white/70">{L.preparing}</p>
        </div>
      )}
      <iframe
        src={toEmbedUrl(url)}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
        allowFullScreen
        className="w-full h-full"
        onLoad={() => setReady(true)}
      />
    </div>
  );
}

export default function MoviePlayer({ url, poster, title, lang }) {
  const L = lang === "ar"
    ? {
        noSource: "لا يتوفر رابط تشغيل لهذا العمل بعد.",
        noSourceHint: "يمكن للمشرف إضافة رابط التشغيل من زر «إضافة عمل» في صفحة الأفلام.",
        directHint: "يدعم المشغّل MP4 و WebM و HLS (m3u8) وروابط التضمين Embed.",
      }
    : {
        noSource: "No playback source is available for this title yet.",
        noSourceHint: "An admin can add a playback link from the \"Add a title\" button on the Movies page.",
        directHint: "The player supports MP4, WebM, HLS (m3u8) and embed URLs.",
      };

  if (!url) {
    return (
      <div className="flex flex-col items-center justify-center text-center rounded-2xl border border-dashed border-[#E9D5FF] dark:border-[#4B3F8A] bg-white dark:bg-[#2D2A5A] px-5 py-10">
        <Film className="w-8 h-8 text-[#9CA3AF] mb-3" />
        <p className="text-sm font-semibold text-[#111827] dark:text-[#FEF3C7]">{L.noSource}</p>
        <p className="text-xs text-[#6B7280] dark:text-[#A8A6C4] mt-1.5 max-w-xs leading-relaxed">{L.noSourceHint}</p>
        <p className="text-[11px] text-[#9CA3AF] dark:text-[#8B8AB0] mt-2 max-w-xs leading-relaxed">{L.directHint}</p>
      </div>
    );
  }

  return (
    <div className="w-full rounded-2xl overflow-hidden bg-black shadow-[0_8px_24px_rgba(0,0,0,0.18)]">
      {DIRECT_RE.test(url) ? (
        <HlsVideoPlayer src={url} poster={poster} lang={lang} />
      ) : (
        <EmbedPlayer url={url} title={title} lang={lang} />
      )}
    </div>
  );
}