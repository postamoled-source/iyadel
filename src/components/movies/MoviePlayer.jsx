import { useState } from "react";
import { Play, Loader2, AlertCircle, Film } from "lucide-react";
import { Image } from "@/components/ui/image";

const DIRECT_RE = /\.(mp4|m4v|webm|ogg|ogv|mov|mkv|m3u8)(\?.*)?$/i;

function toEmbedUrl(url) {
  const yt = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`;
  const vm = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vm) return `https://player.vimeo.com/video/${vm[1]}`;
  return url;
}

export default function MoviePlayer({ url, poster, title, lang }) {
  const [active, setActive] = useState(false);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  const L = lang === "ar"
    ? {
        play: "تشغيل الآن", preparing: "جارٍ التحضير...",
        error: "تعذّر تشغيل هذا الرابط. تأكد من صحة الرابط أو جرّب متصفحًا آخر.",
        unsupported: "صيغة الفيديو غير مدعومة في هذا المتصفح.",
        noSource: "لا يتوفر رابط تشغيل لهذا العمل بعد.",
        noSourceHint: "يمكن للمشرف إضافة رابط التشغيل من زر «إضافة عمل» في صفحة الأفلام.",
        directHint: "للتشغيل داخل الصفحة، أضف رابطًا مباشرًا بصيغة MP4 أو WebM أو HLS، أو رابط تضمين (Embed).",
      }
    : {
        play: "Play now", preparing: "Preparing...",
        error: "This link could not be played. Check the URL or try another browser.",
        unsupported: "This video format is not supported in your browser.",
        noSource: "No playback source is available for this title yet.",
        noSourceHint: "An admin can add a playback link from the \"Add a title\" button on the Movies page.",
        directHint: "To play in-page, add a direct MP4, WebM or HLS link, or an embed URL.",
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

  const isDirect = DIRECT_RE.test(url);

  if (!active) {
    return (
      <button
        type="button"
        onClick={() => setActive(true)}
        className="group relative w-full aspect-video rounded-2xl overflow-hidden bg-[#111827] shadow-[0_8px_24px_rgba(0,0,0,0.18)]"
        aria-label={L.play}
      >
        {poster ? (
          <Image src={poster} alt={title} className="w-full h-full opacity-70 group-hover:opacity-85 transition-opacity" fittingType="fill" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#6D28D9] to-[#F59E0B] opacity-80" />
        )}
        <span className="absolute inset-0 flex flex-col items-center justify-center gap-3">
          <span className="w-16 h-16 rounded-full bg-white/95 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
            <Play className="w-7 h-7 text-[#6D28D9] fill-[#6D28D9] ms-1" />
          </span>
          <span className="text-white text-sm font-bold drop-shadow">{L.play}</span>
        </span>
      </button>
    );
  }

  return (
    <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black">
      {!ready && !failed && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black z-10">
          <Loader2 className="w-6 h-6 animate-spin text-[#F59E0B]" />
          <p className="text-xs text-white/70">{L.preparing}</p>
        </div>
      )}

      {failed && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black px-6 text-center z-10">
          <AlertCircle className="w-6 h-6 text-[#DC2626]" />
          <p className="text-xs text-white/80 leading-relaxed max-w-xs">{L.error}</p>
        </div>
      )}

      {isDirect ? (
        <video
          src={url}
          poster={poster || undefined}
          controls
          autoPlay
          playsInline
          preload="metadata"
          className="w-full h-full bg-black"
          onLoadedData={() => setReady(true)}
          onCanPlay={() => setReady(true)}
          onError={() => { setFailed(true); setReady(true); }}
        />
      ) : (
        <iframe
          src={toEmbedUrl(url)}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
          allowFullScreen
          className="w-full h-full"
          onLoad={() => setReady(true)}
        />
      )}
    </div>
  );
}