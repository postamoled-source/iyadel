import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { youtubeToMp3 } from "@/functions/youtubeToMp3";
import {
  Youtube, ClipboardPaste, Eraser, ChevronDown,
  AlertCircle, Music, Download, Loader2, ExternalLink,
} from "lucide-react";

const translations = {
  ar: {
    title: "حوّل فيديو يوتيوب إلى MP3",
    subtitle: "أسرع أداة لتحميل الصوت من يوتيوب بجودة عالية – مجاناً وبدون إعلانات",
    placeholder: "https://www.youtube.com/watch?v=...",
    btnText: "تحويل",
    converting: "جارٍ التحويل...",
    convertingHint: "قد يستغرق ذلك بضع ثوانٍ حسب طول الفيديو",
    empty: "⚠️ يرجى إدخال رابط يوتيوب.",
    invalidUrl: "⚠️ الرابط غير صالح. تأكد من أنه رابط يوتيوب صحيح.",
    paste: "لصق مثال",
    clear: "مسح",
    downloadReady: "✅ الملف جاهز للتحميل",
    downloadBtn: "تحميل MP3",
    openBtn: "فتح الرابط",
    errorTitle: "تعذّر التحويل",
    errorMsg: "واجهة التحويل تعيد خطأ حالياً (قد يكون عطلاً مؤقتاً في خوادم المزوّد أو قيداً على الباقة). حاول لاحقاً أو بفيديو آخر.",
    retry: "إعادة المحاولة",
    faqTitle: "الأسئلة الشائعة",
    faqs: [
      { q: "هل أداة تحويل يوتيوب إلى MP3 مجانية؟", a: "نعم، الأداة مجانية تماماً ولا تتطلب تسجيل أو اشتراك. يمكنك استخدامها لتحويل أي فيديو عام من يوتيوب إلى MP3." },
      { q: "ما هي جودة الصوت التي يمكنني الحصول عليها؟", a: "يتم التحويل بجودة 128 kbps افتراضياً، وهي جودة جيدة توازن بين الحجم والوضوح. للحصول على أفضل جودة يمكنك استخدام جودة أعلى." },
      { q: "هل أحتاج إلى تثبيت برنامج أو إضافة؟", a: "لا، الأداة تعمل مباشرة في متصفحك. كل ما عليك فعله هو لصق رابط الفيديو والضغط على زر التحويل." },
      { q: "كم تستغرق عملية التحويل؟", a: "تستغرق العملية عادةً من 3 إلى 10 ثوانٍ حسب طول الفيديو وسرعة اتصالك بالإنترنت." },
      { q: "هل يمكنني تحويل فيديوهات خاصة أو محمية؟", a: "لا، الأداة تدعم فقط الفيديوهات العامة المتاحة على يوتيوب." },
    ],
  },
  en: {
    title: "Convert YouTube Video to MP3",
    subtitle: "The fastest tool to download audio from YouTube in high quality – free and ad-free",
    placeholder: "https://www.youtube.com/watch?v=...",
    btnText: "Convert",
    converting: "Converting...",
    convertingHint: "This may take a few seconds depending on the video length",
    empty: "⚠️ Please enter a YouTube link.",
    invalidUrl: "⚠️ Invalid URL. Please enter a valid YouTube link.",
    paste: "Paste Example",
    clear: "Clear",
    downloadReady: "✅ Your file is ready to download",
    downloadBtn: "Download MP3",
    openBtn: "Open Link",
    errorTitle: "Conversion failed",
    errorMsg: "The conversion API is currently returning an error (likely a temporary provider server outage or a plan limitation). Please try again later or with another video.",
    retry: "Retry",
    faqTitle: "Frequently Asked Questions",
    faqs: [
      { q: "Is the YouTube to MP3 converter free?", a: "Yes, the tool is completely free and does not require registration or subscription. You can use it to convert any public YouTube video to MP3." },
      { q: "What audio quality can I get?", a: "Conversion defaults to 128 kbps, a good balance between size and clarity. Higher quality is available for better audio." },
      { q: "Do I need to install any software or extension?", a: "No, the tool works directly in your browser. Just paste the video link and click the convert button." },
      { q: "How long does the conversion take?", a: "The process usually takes 3 to 10 seconds depending on the video length and your internet speed." },
      { q: "Can I convert private or protected videos?", a: "No, the tool only supports public videos available on YouTube." },
    ],
  },
};

function extractVideoId(url) {
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([^&]+)/i,
    /(?:youtu\.be\/)([^?]+)/i,
    /(?:youtube\.com\/embed\/)([^?]+)/i,
    /(?:youtube\.com\/v\/)([^?]+)/i,
    /(?:youtube\.com\/shorts\/)([^?]+)/i,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

export default function YoutubeToMp3() {
  const { lang, isRTL } = useI18n();
  const tr = translations[lang] || translations.ar;
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null); // { status, downloadUrl, title }
  const [openFaq, setOpenFaq] = useState(0);

  const startConversion = async () => {
    const rawUrl = url.trim();
    if (!rawUrl) { setError(tr.empty); setResult(null); return; }
    if (!extractVideoId(rawUrl)) { setError(tr.invalidUrl); setResult(null); return; }
    setError("");
    setResult(null);
    setLoading(true);
    try {
      const res = await youtubeToMp3({ url: rawUrl });
      const data = res.data || res;
      setResult(data);
      if (data.status && data.status !== "COMPLETED" && data.status !== "AVAILABLE" && data.status !== "SUCCESS") {
        // provider returned a non-success terminal status
        if (!data.downloadUrl) {
          setError(tr.errorMsg);
        }
      }
    } catch (e) {
      setError((e && e.message) || tr.errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const hasDownload = result && result.downloadUrl && (result.status === "COMPLETED" || result.status === "AVAILABLE" || result.status === "SUCCESS");

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
            onKeyDown={(e) => { if (e.key === "Enter" && !loading) startConversion(); }}
            placeholder={tr.placeholder}
            dir="ltr"
            disabled={loading}
            className="flex-1 min-w-0 bg-transparent outline-none px-4 h-[48px] text-[#0f172a] dark:text-[#FEF3C7] placeholder:text-[#94a3b8] dark:placeholder:text-[#6B6B8A] text-sm disabled:opacity-50"
          />
          <button
            type="button"
            onClick={startConversion}
            disabled={loading}
            className="shrink-0 inline-flex items-center justify-center gap-2 h-[48px] px-6 rounded-full bg-[#ef4444] hover:bg-[#dc2626] text-white font-bold text-sm transition-all duration-200 hover:scale-[1.02] active:scale-95 disabled:opacity-60 disabled:hover:scale-100"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ExternalLink className="w-4 h-4" />}
            <span>{loading ? tr.btnText : tr.btnText}</span>
          </button>
        </div>

        {/* Quick actions */}
        <div className="flex justify-center gap-2 mt-3">
          <button
            type="button"
            onClick={() => { setUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ"); setError(""); setResult(null); }}
            disabled={loading}
            className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-[#f1f5f9] dark:bg-[#2D2A5A] border border-[#e2e8f0] dark:border-[#4B3F8A] text-[#334155] dark:text-[#A8A6C4] hover:border-[#ef4444] transition-colors disabled:opacity-50"
          >
            <ClipboardPaste className="w-3.5 h-3.5" /> {tr.paste}
          </button>
          <button
            type="button"
            onClick={() => { setUrl(""); setError(""); setResult(null); }}
            disabled={loading}
            className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-[#f1f5f9] dark:bg-[#2D2A5A] border border-[#e2e8f0] dark:border-[#4B3F8A] text-[#334155] dark:text-[#A8A6C4] hover:border-[#ef4444] transition-colors disabled:opacity-50"
          >
            <Eraser className="w-3.5 h-3.5" /> {tr.clear}
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mt-4 rounded-[16px] bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-[#ef4444] shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="font-bold text-sm text-[#ef4444]">{tr.errorTitle}</div>
              <div className="text-xs text-[#475569] dark:text-[#A8A6C4] mt-1">{error}</div>
              <button
                type="button"
                onClick={startConversion}
                disabled={loading}
                className="mt-2 text-xs font-bold text-[#ef4444] hover:underline disabled:opacity-50"
              >
                {tr.retry}
              </button>
            </div>
          </div>
        )}

        {/* Converting state */}
        {loading && (
          <div className="mt-5 rounded-[18px] border-2 border-[#e2e8f0] dark:border-[#4B3F8A] bg-[#f8fafc] dark:bg-[#2D2A5A] p-6 flex flex-col items-center justify-center gap-3 animate-[fadeIn_0.3s_ease-out]">
            <Loader2 className="w-8 h-8 text-[#ef4444] animate-spin" />
            <div className="text-sm font-bold text-[#0f172a] dark:text-[#FEF3C7]">{tr.converting}</div>
            <div className="text-xs text-[#475569] dark:text-[#A8A6C4]">{tr.convertingHint}</div>
          </div>
        )}

        {/* Download ready */}
        {hasDownload && !loading && (
          <div className="mt-5 rounded-[18px] border-2 border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30 p-5 flex flex-col items-center gap-3 animate-[slideDown_0.3s_ease-out]">
            <div className="flex items-center gap-2 text-sm font-bold text-emerald-600 dark:text-emerald-400">
              <Music className="w-4 h-4" />
              {tr.downloadReady}
            </div>
            {result.title && (
              <div className="text-xs text-[#475569] dark:text-[#A8A6C4] text-center max-w-full truncate">{result.title}</div>
            )}
            <a
              href={result.downloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 h-[48px] px-6 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm transition-all duration-200 hover:scale-[1.02] active:scale-95"
            >
              <Download className="w-4 h-4" />
              {tr.downloadBtn}
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