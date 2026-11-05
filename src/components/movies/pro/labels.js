const LABELS = {
  ar: {
    play: "تشغيل / إيقاف",
    restart: "من البداية",
    mute: "كتم الصوت",
    volume: "مستوى الصوت",
    speed: "السرعة",
    quality: "الجودة",
    auto: "تلقائي",
    subtitles: "الترجمة",
    off: "إيقاف",
    fitAuto: "نسبة الفيديو",
    fit169: "16:9",
    fit916: "9:16",
    rotate: "تدوير",
    zoomOut: "تقليص",
    zoomIn: "تكبير",
    stretchOn: "تمديد الصورة",
    stretchOff: "عرض طبيعي",
    pip: "صورة داخل صورة",
    fullscreen: "ملء الشاشة",
    exitFullscreen: "خروج",
    loading: "جارٍ تحميل الفيديو...",
    failed: "تعذّر تشغيل هذا الفيديو، جرّب سيرفراً آخر أو رابطاً مختلفاً.",
    unsupported: "المتصفح لا يدعم صيغة هذا البث.",
    proTitle: "المشغل الاحترافي",
    proHint: "ألصق رابط بث مباشر (MP4 · HLS · DASH) أو اختر ملفاً من جهازك لتشغيله بمزايا المشغل الكاملة.",
    sourcePlaceholder: "https://example.com/stream.m3u8",
    sourceLoad: "تشغيل",
    sourceFile: "ملف",
    sourceHint: "يدعم MP4 · WebM · MKV · HLS (m3u8) · DASH (mpd).",
    sourceInvalid: "الرابط يجب أن يبدأ بـ http:// أو https://",
  },
  en: {
    play: "Play / Pause",
    restart: "From start",
    mute: "Mute",
    volume: "Volume",
    speed: "Speed",
    quality: "Quality",
    auto: "Auto",
    subtitles: "Subtitles",
    off: "Off",
    fitAuto: "Video ratio",
    fit169: "16:9",
    fit916: "9:16",
    rotate: "Rotate",
    zoomOut: "Zoom out",
    zoomIn: "Zoom in",
    stretchOn: "Stretch picture",
    stretchOff: "Natural picture",
    pip: "Picture in picture",
    fullscreen: "Fullscreen",
    exitFullscreen: "Exit",
    loading: "Loading video...",
    failed: "This video could not be played. Try another server or link.",
    unsupported: "This browser cannot play this stream format.",
    proTitle: "Pro player",
    proHint: "Paste a direct stream link (MP4 · HLS · DASH) or pick a file from your device to watch it with the full player.",
    sourcePlaceholder: "https://example.com/stream.m3u8",
    sourceLoad: "Play",
    sourceFile: "File",
    sourceHint: "Supports MP4 · WebM · MKV · HLS (m3u8) · DASH (mpd).",
    sourceInvalid: "The link must start with http:// or https://",
  },
};

export function proLabels(lang) {
  return LABELS[lang === "ar" ? "ar" : "en"];
}

export function formatTime(seconds) {
  if (!isFinite(seconds) || seconds < 0) return "00:00";
  const total = Math.floor(seconds);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const mm = String(m).padStart(2, "0");
  const ss = String(s).padStart(2, "0");
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}