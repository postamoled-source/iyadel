import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import {
  Youtube, Download, Loader2, FileAudio, ClipboardPaste, Eraser,
  ChevronDown, AlertCircle, CheckCircle2, Music,
} from "lucide-react";

const QUALITIES = ["64", "128", "192", "320"];

const translations = {
  ar: {
    title: "حوّل فيديو يوتيوب إلى MP3",
    subtitle: "أسرع أداة لتحميل الصوت من يوتيوب بجودة عالية – مجاناً وبدون إعلانات",
    placeholder: "https://www.youtube.com/watch?v=...",
    btnText: "تحميل MP3",
    downloading: "جاري التحميل...",
    processing: "⏳ جاري تحويل الفيديو إلى MP3...",
    error: "❌ حدث خطأ. يرجى التحقق من الرابط والمحاولة مرة أخرى.",
    retry: " قد تكون الخدمة مؤقتة، حاول استخدام رابط آخر.",
    ready: "✅ تم التحويل بنجاح!",
    empty: "⚠️ يرجى إدخال رابط يوتيوب.",
    invalid: "⚠️ يرجى إدخال رابط يوتيوب صحيح.",
    invalidUrl: "⚠️ الرابط غير صالح. تأكد من أنه رابط يوتيوب صحيح.",
    downloadText: "تحميل الملف",
    paste: "لصق مثال",
    clear: "مسح",
    qualityLabel: "جودة الصوت",
    faqTitle: "الأسئلة الشائعة",
    faqs: [
      { q: "هل أداة تحويل يوتيوب إلى MP3 مجانية؟", a: "نعم، الأداة مجانية تماماً ولا تتطلب تسجيل أو اشتراك. يمكنك استخدامها لتحويل أي فيديو عام من يوتيوب إلى MP3." },
      { q: "ما هي جودة الصوت التي يمكنني الحصول عليها؟", a: "توفر الأداة عدة خيارات للجودة: 64 kbps، 128 kbps، 192 kbps، و 320 kbps. ننصح باختيار 320 kbps للحصول على أفضل جودة صوت." },
      { q: "هل أحتاج إلى تثبيت برنامج أو إضافة؟", a: "لا، الأداة تعمل مباشرة في متصفحك. كل ما عليك فعله هو لصق رابط الفيديو والضغط على زر التحميل." },
      { q: "كم تستغرق عملية التحويل؟", a: "تستغرق العملية عادةً من 3 إلى 10 ثوانٍ حسب طول الفيديو وسرعة اتصالك بالإنترنت." },
      { q: "هل يمكنني تحويل فيديوهات خاصة أو محمية؟", a: "لا، الأداة تدعم فقط الفيديوهات العامة المتاحة على يوتيوب. لا يمكن تحويل الفيديوهات الخاصة أو المحمية بحقوق نشر." },
    ],
  },
  en: {
    title: "Convert YouTube Video to MP3",
    subtitle: "The fastest tool to download audio from YouTube in high quality – free and ad-free",
    placeholder: "https://www.youtube.com/watch?v=...",
    btnText: "Download MP3",
    downloading: "Downloading...",
    processing: "⏳ Converting video to MP3...",
    error: "❌ An error occurred. Please check the link and try again.",
    retry: " The service might be temporary, try another link.",
    ready: "✅ Conversion completed successfully!",
    empty: "⚠️ Please enter a YouTube link.",
    invalid: "⚠️ Please enter a valid YouTube link.",
    invalidUrl: "⚠️ Invalid URL. Please enter a valid YouTube link.",
    downloadText: "Download File",
    paste: "Paste Example",
    clear: "Clear",
    qualityLabel: "Audio Quality",
    faqTitle: "Frequently Asked Questions",
    faqs: [
      { q: "Is the YouTube to MP3 converter free?", a: "Yes, the tool is completely free and does not require registration or subscription. You can use it to convert any public YouTube video to MP3." },
      { q: "What audio quality can I get?", a: "The tool offers several quality options: 64 kbps, 128 kbps, 192 kbps, and 320 kbps. We recommend choosing 320 kbps for the best audio quality." },
      { q: "Do I need to install any software or extension?", a: "No, the tool works directly in your browser. All you need to do is paste the video link and click the download button." },
      { q: "How long does the conversion take?", a: "The process usually takes 3 to 10 seconds depending on the video length and your internet speed." },
      { q: "Can I convert private or protected videos?", a: "No, the tool only supports public videos available on YouTube. Private or copyright-protected videos cannot be converted." },
    ],
  },
};

function extractVideoId(url) {
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([^&]+)/i,
    /(?:youtu\.be\/)([^?]+)/i,
    /(?:youtube\.com\/embed\/)([^?]+)/i,
    /(?:youtube\.com\/v\/)([^?]+)/i,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

function normalizeUrl(url) {
  const videoId = extractVideoId(url);
  return videoId ? `https://www.youtube.com/watch?v=${videoId}` : url;
}

const APIS = (url, quality) => [
  { url: `https://api.vevioz.com/api/button/mp3/${encodeURIComponent(url)}?quality=${quality}` },
  { url: `https://api.y2mate.com/convert?url=${encodeURIComponent(url)}&quality=${quality}` },
];

export default function YoutubeToMp3() {
  const { lang, isRTL } = useI18n();
  const tr = translations[lang] || translations.ar;
  const [url, setUrl] = useState("");
  const [quality, setQuality] = useState("128");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: "idle", text: "" }); // idle | processing | error | ready
  const [result, setResult] = useState(null); // { title, downloadUrl, sizeMB }
  const [openFaq, setOpenFaq] = useState(0);

  const startConversion = async () => {
    const rawUrl = url.trim();
    if (!rawUrl) {
      setStatus({ type: "error", text: tr.empty });
      setResult(null);
      return;
    }
    const videoId = extractVideoId(rawUrl);
    if (!videoId) {
      setStatus({ type: "error", text: tr.invalidUrl });
      setResult(null);
      return;
    }
    const normalizedUrl = normalizeUrl(rawUrl);
    setLoading(true);
    setStatus({ type: "processing", text: tr.processing });
    setResult(null);
    try {
      let success = false;
      for (const api of APIS(normalizedUrl, quality)) {
        try {
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 8000);
          const response = await fetch(api.url, { signal: controller.signal });
          clearTimeout(timeout);
          if (!response.ok) continue;
          const data = await response.json();
          const downloadUrl = data.download_url || data.link || data.url;
          if (downloadUrl) {
            const title = data.title || `video_${videoId}`;
            const sizeMB = data.size ? (data.size / (1024 * 1024)).toFixed(1) : "?";
            setResult({ title, downloadUrl, sizeMB });
            setStatus({ type: "ready", text: tr.ready });
            success = true;
            break;
          }
        } catch (e) {
          // try next API
        }
      }
      if (!success) {
        setStatus({ type: "error", text: tr.error + tr.retry });
      }
    } finally {
      setLoading(false);
    }
  };

  const fileMeta = `MP3 · ${quality} kbps${result && result.sizeMB !== "?" ? ` · ${result.sizeMB} MB` : ""}`;

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="max-w-[560px] mx-auto w-full">
      <div className="relative bg-white dark:bg-[#1E1B4B] transition-colors duration-300 overflow-hidden rounded-[20px] p-6 shadow-[0_20px_50px_-18px_rgba(239,68,68,0.3)]">
        {/* Hero */}
        <div className="text-center mb-5">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-[#ef4444] to-[#b91c1c] shadow-[0_8px_20px_rgba(239,68,68,0.35)] mb-3">
            <Youtube className="w-7 h-7 text-white" strokeWidth={2.2} />
          </div>
          <h2 className="text-[22px] font-extrabold leading-tight bg-gradient-to-r from-[#0f172a] to-[#ef4444] dark:from-[#FEF3C7] dark:to-[#f87171] bg-clip-text text-transparent">
            {tr.title}
          </h2>
          <p className="mt-1.5 text-sm text-[#475569] dark:text-[#A8A6C4]">{tr.subtitle}</p>
        </div>

        {/* Input */}
        <div className="flex flex-col sm:flex-row gap-2.5 bg-[#f8fafc] dark:bg-[#2D2A5A] p-1.5 rounded-[28px] border-2 border-[#e2e8f0] dark:border-[#4B3F8A] focus-within:border-[#ef4444] transition-colors">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") startConversion(); }}
            placeholder={tr.placeholder}
            dir="ltr"
            className="flex-1 min-w-0 bg-transparent outline-none px-4 h-[48px] text-[#0f172a] dark:text-[#FEF3C7] placeholder:text-[#94a3b8] dark:placeholder:text-[#6B6B8A] text-sm"
          />
          <button
            type="button"
            onClick={startConversion}
            disabled={loading}
            className="shrink-0 inline-flex items-center justify-center gap-2 h-[48px] px-6 rounded-full bg-[#ef4444] hover:bg-[#dc2626] disabled:opacity-60 text-white font-bold text-sm transition-all duration-200 hover:scale-[1.02] active:scale-95"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            <span>{loading ? tr.downloading : tr.btnText}</span>
          </button>
        </div>

        {/* Quick actions */}
        <div className="flex justify-center gap-2 mt-3">
          <button
            type="button"
            onClick={() => setUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ")}
            className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-[#f1f5f9] dark:bg-[#2D2A5A] border border-[#e2e8f0] dark:border-[#4B3F8A] text-[#334155] dark:text-[#A8A6C4] hover:border-[#ef4444] transition-colors"
          >
            <ClipboardPaste className="w-3.5 h-3.5" /> {tr.paste}
          </button>
          <button
            type="button"
            onClick={() => { setUrl(""); setStatus({ type: "idle", text: "" }); setResult(null); }}
            className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-[#f1f5f9] dark:bg-[#2D2A5A] border border-[#e2e8f0] dark:border-[#4B3F8A] text-[#334155] dark:text-[#A8A6C4] hover:border-[#ef4444] transition-colors"
          >
            <Eraser className="w-3.5 h-3.5" /> {tr.clear}
          </button>
        </div>

        {/* Quality */}
        <div className="mt-5">
          <p className="text-center text-[11px] font-semibold uppercase tracking-wider text-[#92400E] dark:text-[#FBBF24] mb-2">{tr.qualityLabel}</p>
          <div className="flex justify-center flex-wrap gap-2">
            {QUALITIES.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => setQuality(q)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all duration-200 ${
                  quality === q
                    ? "bg-[#ef4444] border-[#ef4444] text-white shadow-[0_4px_12px_rgba(239,68,68,0.3)]"
                    : "bg-[#f8fafc] dark:bg-[#2D2A5A] border-[#e2e8f0] dark:border-[#4B3F8A] text-[#334155] dark:text-[#A8A6C4] hover:border-[#ef4444]"
                }`}
              >
                {q} kbps
              </button>
            ))}
          </div>
        </div>

        {/* Status */}
        {status.type !== "idle" && (
          <div className={`mt-4 text-center text-sm font-semibold flex items-center justify-center gap-2 ${
            status.type === "ready" ? "text-emerald-600 dark:text-emerald-400" :
            status.type === "error" ? "text-[#ef4444]" : "text-[#334155] dark:text-[#A8A6C4]"
          }`}>
            {status.type === "processing" && <Loader2 className="w-4 h-4 animate-spin" />}
            {status.type === "ready" && <CheckCircle2 className="w-4 h-4" />}
            {status.type === "error" && <AlertCircle className="w-4 h-4" />}
            <span>{status.text}</span>
          </div>
        )}

        {/* Result */}
        {result && (
          <div className="mt-4 p-4 rounded-[18px] bg-[#f0fdf4] dark:bg-[#14322a] border-2 border-[#bbf7d0] dark:border-emerald-900/50 text-center">
            <div className="flex items-center justify-center gap-3 mb-3">
              <FileAudio className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
              <div className={isRTL ? "text-right" : "text-left"}>
                <div className="font-bold text-[#0f172a] dark:text-[#FEF3C7] text-sm truncate max-w-[260px]">{result.title}.mp3</div>
                <div className="text-xs text-[#475569] dark:text-[#A8A6C4]">{fileMeta}</div>
              </div>
            </div>
            <a
              href={result.downloadUrl}
              download={`${result.title}.mp3`}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition-all duration-200 hover:scale-[1.03]"
            >
              <Download className="w-4 h-4" /> {tr.downloadText}
            </a>
          </div>
        )}

        {/* FAQ */}
        <div className="mt-7 pt-5 border-t border-[#e2e8f0] dark:border-[#4B3F8A]">
          <h3 className="flex items-center gap-2 text-base font-extrabold text-[#0f172a] dark:text-[#FEF3C7] mb-3">
            <Music className="w-4 h-4 text-[#ef4444]" /> {tr.faqTitle}
          </h3>
          <div className="space-y-1">
            {tr.faqs.map((f, i) => (
              <div key={i} className="border-b border-[#f1f5f9] dark:border-[#4B3F8A] pb-1">
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === i ? -1 : i)}
                  className="w-full flex items-center justify-between gap-2 py-3 text-right"
                >
                  <span className="font-bold text-sm text-[#0f172a] dark:text-[#FEF3C7]">{f.q}</span>
                  <ChevronDown className={`w-4 h-4 text-[#94a3b8] shrink-0 transition-transform duration-300 ${openFaq === i ? "rotate-180" : ""}`} />
                </button>
                {openFaq === i && (
                  <p className="pb-3 text-sm text-[#475569] dark:text-[#A8A6C4] leading-relaxed">{f.a}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}