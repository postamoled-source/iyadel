import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import { AlertCircle, RefreshCw, Loader2 } from "lucide-react";

const TEXT = {
  ar: {
    preparing: "جارٍ تجهيز المشغل...",
    failTitle: "فشل تشغيل الوسائط",
    networkError: "فشل الاتصال بالخادم. تأكد من اتصال الإنترنت أو من قيود CORS.",
    mediaError: "خطأ في قراءة صيغة الفيديو. جارٍ الاسترداد...",
    formatError: "تعذّر تشغيل الفيديو بسبب عدم توافق التنسيق أو تلف الرابط.",
    loadError: "تعذّر تحميل الفيديو. تأكد من صحة الرابط أو سياسة الحماية (CORS).",
    unsupported: "المتصفح لا يدعم تشغيل هذا التنسيق.",
    retry: "إعادة المحاولة",
  },
  en: {
    preparing: "Preparing the player...",
    failTitle: "Media playback failed",
    networkError: "Could not reach the server. Check your connection or CORS restrictions.",
    mediaError: "The video format could not be read. Recovering...",
    formatError: "Playback failed due to an unsupported format or a broken link.",
    loadError: "The video could not be loaded. Check the URL or its CORS policy.",
    unsupported: "This browser does not support this video format.",
    retry: "Try again",
  },
};

export default function HlsVideoPlayer({ src, poster, lang }) {
  const videoRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [attempt, setAttempt] = useState(0);

  const L = TEXT[lang === "ar" ? "ar" : "en"];

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;

    let hls = null;
    setLoading(true);
    setError(null);

    const isHls = /\.m3u8(\?.*)?$/i.test(src);

    const onLoaded = () => setLoading(false);
    const onError = () => {
      setLoading(false);
      setError(L.loadError);
    };
    video.addEventListener("loadeddata", onLoaded);
    video.addEventListener("error", onError);

    // HLS through hls.js (Android, desktop Chrome/Firefox)
    if (isHls && Hls.isSupported()) {
      hls = new Hls({ enableWorker: true, lowLatencyMode: true });
      hls.loadSource(src);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => setLoading(false));
      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (!data.fatal) return;
        if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
          setError(L.networkError);
          hls.startLoad();
        } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
          setError(L.mediaError);
          hls.recoverMediaError();
        } else {
          hls.destroy();
          setError(L.formatError);
        }
      });
    }
    // Native HLS (Safari / iOS) or a direct file (MP4, WebM, …)
    else if (video.canPlayType("application/vnd.apple.mpegurl") || !isHls) {
      video.src = src;
    } else {
      setError(L.unsupported);
      setLoading(false);
    }

    return () => {
      video.removeEventListener("loadeddata", onLoaded);
      video.removeEventListener("error", onError);
      if (hls) hls.destroy();
    };
  }, [src, attempt, L]);

  return (
    <div className="relative w-full aspect-video bg-black">
      <video
        ref={videoRef}
        controls
        playsInline
        preload="auto"
        poster={poster || undefined}
        className="w-full h-full object-contain"
      />

      {loading && !error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 pointer-events-none">
          <Loader2 className="w-10 h-10 text-[#F59E0B] animate-spin mb-2" />
          <span className="text-white text-sm font-medium">{L.preparing}</span>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#111827]/95 p-6 text-center z-20">
          <AlertCircle className="w-12 h-12 text-red-500 mb-3" />
          <h4 className="text-white font-semibold text-base mb-1">{L.failTitle}</h4>
          <p className="text-[#9CA3AF] text-xs sm:text-sm max-w-md mb-5 leading-relaxed">{error}</p>
          <button
            onClick={() => setAttempt((n) => n + 1)}
            className="flex items-center gap-2 bg-[#F59E0B] hover:opacity-90 text-black px-4 py-2 rounded-lg text-sm font-bold transition-all shadow-md active:scale-95"
          >
            <RefreshCw className="w-4 h-4" />
            {L.retry}
          </button>
        </div>
      )}
    </div>
  );
}