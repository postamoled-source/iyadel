import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import {
  Youtube, ClipboardPaste, Eraser, ChevronDown,
  AlertCircle, Music, ExternalLink,
} from "lucide-react";

const translations = {
  ar: {
    title: "حوّل فيديو يوتيوب إلى MP3",
    subtitle: "أسرع أداة لتحميل الصوت من يوتيوب بجودة عالية – مجاناً وبدون إعلانات",
    placeholder: "https://www.youtube.com/watch?v=...",
    btnText: "تحويل",
    empty: "⚠️ يرجى إدخال رابط يوتيوب.",
    invalidUrl: "⚠️ الرابط غير صالح. تأكد من أنه رابط يوتيوب صحيح.",
    paste: "لصق مثال",
    clear: "مسح",
    iframeTitle: "اختر الجودة وحمّل الملف",
    iframeHint: "اضغط أحد أزرار الجودة بالأسفل لبدء التحميل",
    faqTitle: "الأسئلة الشائعة",
    faqs: [
      { q: "هل أداة تحويل يوتيوب إلى MP3 مجانية؟", a: "نعم، الأداة مجانية تماماً ولا تتطلب تسجيل أو اشتراك. يمكنك استخدامها لتحويل أي فيديو عام من يوتيوب إلى MP3." },
      { q: "ما هي جودة الصوت التي يمكنني الحصول عليها؟", a: "تظهر أزرار لعدة جودات (64، 128، 192، 320 kbps) داخل نافذة التحميل. ننصح باختيار 320 kbps للحصول على أفضل جودة صوت." },
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
    empty: "⚠️ Please enter a YouTube link.",
    invalidUrl: "⚠️ Invalid URL. Please enter a valid YouTube link.",
    paste: "Paste Example",
    clear: "Clear",
    iframeTitle: "Pick a quality and download",
    iframeHint: "Tap one of the quality buttons below to start the download",
    faqTitle: "Frequently Asked Questions",
    faqs: [
      { q: "Is the YouTube to MP3 converter free?", a: "Yes, the tool is completely free and does not require registration or subscription. You can use it to convert any public YouTube video to MP3." },
      { q: "What audio quality can I get?", a: "Quality buttons (64, 128, 192, 320 kbps) appear inside the download panel. We recommend 320 kbps for the best audio quality." },
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
  const [videoId, setVideoId] = useState(null);
  const [error, setError] = useState("");
  const [openFaq, setOpenFaq] = useState(0);

  const startConversion = () => {
    const rawUrl = url.trim();
    if (!rawUrl) { setError(tr.empty); setVideoId(null); return; }
    const id = extractVideoId(rawUrl);
    if (!id) { setError(tr.invalidUrl); setVideoId(null); return; }
    setError("");
    setVideoId(id);
  };

  // vevioz button widget — renders download-quality buttons for the video.
  const widgetSrc = videoId ? `https://api.vevioz.com/api/button/mp3/${videoId}` : null;

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
            className="shrink-0 inline-flex items-center justify-center gap-2 h-[48px] px-6 rounded-full bg-[#ef4444] hover:bg-[#dc2626] text-white font-bold text-sm transition-all duration-200 hover:scale-[1.02] active:scale-95"
          >
            <ExternalLink className="w-4 h-4" />
            <span>{tr.btnText}</span>
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
            onClick={() => { setUrl(""); setError(""); setVideoId(null); }}
            className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-[#f1f5f9] dark:bg-[#2D2A5A] border border-[#e2e8f0] dark:border-[#4B3F8A] text-[#334155] dark:text-[#A8A6C4] hover:border-[#ef4444] transition-colors"
          >
            <Eraser className="w-3.5 h-3.5" /> {tr.clear}
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mt-4 text-center text-sm font-semibold flex items-center justify-center gap-2 text-[#ef4444]">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}

        {/* Download widget (iframe) */}
        {widgetSrc && (
          <div className="mt-5">
            <p className="text-center text-xs text-[#475569] dark:text-[#A8A6C4] mb-2">{tr.iframeHint}</p>
            <div className="rounded-[18px] border-2 border-[#e2e8f0] dark:border-[#4B3F8A] bg-[#f8fafc] dark:bg-[#2D2A5A] overflow-hidden">
              <iframe
                title={tr.iframeTitle}
                src={widgetSrc}
                className="w-full"
                style={{ height: 220, border: "none", background: "transparent" }}
                scrolling="no"
                allowTransparency="true"
              />
            </div>
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