import { useEffect, useRef, useState } from "react";
import videojs from "video.js";
import "video.js/dist/video-js.css";
import { Film, Loader2 } from "lucide-react";

const SOURCE_TYPES = [
  { re: /\.m3u8(\?.*)?$/i, type: "application/x-mpegURL" },
  { re: /\.(mp4|m4v)(\?.*)?$/i, type: "video/mp4" },
  { re: /\.webm(\?.*)?$/i, type: "video/webm" },
  { re: /\.(ogv|ogg)(\?.*)?$/i, type: "video/ogg" },
  { re: /\.mov(\?.*)?$/i, type: "video/quicktime" },
  { re: /\.mkv(\?.*)?$/i, type: "video/x-matroska" },
];

const DIRECT_RE = /\.(mp4|m4v|webm|ogg|ogv|mov|mkv|m3u8)(\?.*)?$/i;

function sourceType(url) {
  const found = SOURCE_TYPES.find((s) => s.re.test(url));
  return found ? found.type : "video/mp4";
}

function toEmbedUrl(url) {
  const yt = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`;
  const vm = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vm) return `https://player.vimeo.com/video/${vm[1]}`;
  return url;
}

function VideoJsPlayer({ src, poster, type }) {
  const videoRef = useRef(null);
  const playerRef = useRef(null);

  useEffect(() => {
    if (!playerRef.current) {
      playerRef.current = videojs(videoRef.current, {
        controls: true,
        autoplay: false,
        preload: "auto",
        fluid: true,
        responsive: true,
        playsinline: true,
        playbackRates: [0.5, 1, 1.25, 1.5, 2],
        controlBar: { pictureInPictureToggle: true },
        poster: poster || "",
        sources: [{ src, type }],
      });
    } else {
      playerRef.current.poster(poster || "");
      playerRef.current.src({ src, type });
    }
  }, [src, poster, type]);

  useEffect(() => {
    return () => {
      const player = playerRef.current;
      if (player && !player.isDisposed()) {
        player.dispose();
        playerRef.current = null;
      }
    };
  }, []);

  return (
    <div className="w-full" data-vjs-player>
      <video
        ref={videoRef}
        className="video-js vjs-big-play-centered w-full"
        controls
        preload="auto"
        playsInline
        webkit-playsinline="true"
      />
    </div>
  );
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
        unsupported: "تعذّر تشغيل هذا الرابط. تأكد من صحة الرابط أو جرّب متصفحًا آخر.",
      }
    : {
        noSource: "No playback source is available for this title yet.",
        noSourceHint: "An admin can add a playback link from the \"Add a title\" button on the Movies page.",
        directHint: "The player supports MP4, WebM, HLS (m3u8) and embed URLs.",
        unsupported: "This link could not be played. Check the URL or try another browser.",
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

  return (
    <div className="iyadel-player w-full rounded-2xl overflow-hidden bg-black shadow-[0_8px_24px_rgba(0,0,0,0.18)]">
      {isDirect ? (
        <VideoJsPlayer src={url} poster={poster} type={sourceType(url)} />
      ) : (
        <EmbedPlayer url={url} title={title} lang={lang} />
      )}
    </div>
  );
}