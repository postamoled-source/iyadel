import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X, ArrowLeftRight } from "lucide-react";
import { useI18n } from "@/lib/i18n";

const MESSAGES = [
  "💱 Currency Converter — محول العملات",
  "🧮 Loan Calculator — حاسبة القروض",
  "📈 Compound Interest — الفائدة المركبة",
  "💵 Bond Yield — عائد السندات",
  "⚖️ BMI Calculator — حاسبة كتلة الجسم",
  "🔥 Calories Burned — السعرات المحروقة",
  "📐 Unit Converters — المحولات",
  "📱 QR Code Generator — مولّد QR",
  "✂️ Image Cropper — قص الصور",
  "🖼️ Background Remover — إزالة الخلفية",
  "📦 Image Compressor — ضغط الصور",
  "📄 Image to PDF — صور إلى PDF",
  "✨ Image Enhancer — تحسين الصور",
  "🎨 Logo Maker — صانع الشعارات",
  "📊 Math Function Plotter — رسم الدوال",
  "％ Percentage Calculator — النسبة المئوية",
  "⚛️ Physics Calculators — حاسبات الفيزياء",
  "🧪 Chemistry Calculators — الكيمياء",
  "🧠 Brain Games — ألعاب العقل",
];

const TOTAL_SECONDS = 300;

export default function PromoBanner() {
  const { isRTL } = useI18n();
  const [visible, setVisible] = useState(true);
  const [text, setText] = useState("");
  const [remaining, setRemaining] = useState(TOTAL_SECONDS);

  const msgIndex = useRef(0);
  const charIndex = useRef(0);
  const isDeleting = useRef(false);
  const twTimer = useRef(null);
  const tickTimer = useRef(null);
  const pausedRef = useRef(false);

  const tickTypewriter = useCallback(() => {
    if (pausedRef.current) return;
    const current = MESSAGES[msgIndex.current];
    if (!isDeleting.current) {
      charIndex.current++;
      if (charIndex.current >= current.length) {
        // pause at full word
        if (twTimer.current) clearTimeout(twTimer.current);
        twTimer.current = setTimeout(() => {
          isDeleting.current = true;
          tickTypewriter();
        }, 2200);
        setText(current.substring(0, charIndex.current));
        return;
      }
    } else {
      charIndex.current--;
      if (charIndex.current < 0) {
        isDeleting.current = false;
        charIndex.current = 0;
        msgIndex.current = (msgIndex.current + 1) % MESSAGES.length;
        if (twTimer.current) clearTimeout(twTimer.current);
        twTimer.current = setTimeout(tickTypewriter, 350);
        return;
      }
    }
    setText(current.substring(0, charIndex.current));
    const speed = isDeleting.current ? 45 : 95;
    if (twTimer.current) clearTimeout(twTimer.current);
    twTimer.current = setTimeout(tickTypewriter, speed);
  }, []);

  useEffect(() => {
    tickTypewriter();
    tickTimer.current = setInterval(() => {
      setRemaining((r) => (r <= 0 ? 0 : r - 1));
    }, 1000);

    const onVisibility = () => {
      pausedRef.current = document.hidden;
      if (!document.hidden && visible && remaining > 0) {
        // resume typewriter
        if (!twTimer.current) twTimer.current = setTimeout(tickTypewriter, 100);
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      if (twTimer.current) clearTimeout(twTimer.current);
      if (tickTimer.current) clearInterval(tickTimer.current);
      document.removeEventListener("visibilitychange", onVisibility);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (remaining <= 0) {
      setVisible(false);
      if (tickTimer.current) clearInterval(tickTimer.current);
    }
  }, [remaining]);

  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const timeStr = `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  const progress = (remaining / TOTAL_SECONDS) * 100;

  const dismiss = () => {
    setVisible(false);
    if (twTimer.current) clearTimeout(twTimer.current);
    if (tickTimer.current) clearInterval(tickTimer.current);
    try { localStorage.setItem("iyadel_promo_dismissed", "1"); } catch {}
  };

  useEffect(() => {
    try {
      if (localStorage.getItem("iyadel_promo_dismissed") === "1") setVisible(false);
    } catch {}
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, height: 0, marginTop: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="relative w-full overflow-hidden bg-gradient-to-r from-[#6D28D9] via-[#7C3AED] to-[#4C1D95] text-white"
          dir={isRTL ? "rtl" : "ltr"}
        >
          {/* glow accents */}
          <div className="pointer-events-none absolute -top-16 -left-10 h-40 w-40 rounded-full bg-[#FBBF24]/30 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-16 right-10 h-40 w-40 rounded-full bg-[#EF4444]/20 blur-3xl" />
          <div className="pointer-events-none absolute inset-0 opacity-[0.07] [background-image:radial-gradient(circle_at_20%_50%,#fff_1px,transparent_1px)] [background-size:16px_16px]" />

          <div className="relative mx-auto flex max-w-6xl flex-col items-stretch gap-2 px-4 py-2.5 sm:flex-row sm:items-center sm:gap-4">
            {/* brand + typewriter */}
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <span className="hidden shrink-0 items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-xs font-bold text-[#FBBF24] ring-1 ring-white/20 sm:flex">
                <Sparkles className="h-3.5 w-3.5" /> iyadel
              </span>
              <div className="min-h-[26px] flex-1 truncate font-medium leading-6 text-white/95 text-sm sm:text-[15px]" dir="ltr">
                <span className="text-[#FBBF24]">{text}</span>
                <span className="ml-0.5 inline-block h-4 w-[2px] translate-y-0.5 animate-pulse bg-[#FBBF24]" />
              </div>
            </div>

            {/* timer + CTA */}
            <div className="flex shrink-0 items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-black/25 px-2 py-0.5 text-[11px] font-bold tabular-nums text-white/90 ring-1 ring-white/15">
                  {timeStr}
                </span>
                <div className="hidden h-1.5 w-20 overflow-hidden rounded-full bg-black/30 sm:block">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#EF4444] via-[#FBBF24] to-[#FACC15] transition-all duration-1000 ease-linear"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
              <a
                href="#tools"
                onClick={(e) => { e.preventDefault(); document.getElementById("tools")?.scrollIntoView({ behavior: "smooth" }); }}
                className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#FBBF24] to-[#F59E0B] px-3.5 py-1.5 text-xs font-bold text-[#1E1B4B] shadow-[0_4px_14px_rgba(251,191,36,0.4)] transition-all hover:-translate-y-0.5 hover:shadow-[0_6px_18px_rgba(251,191,36,0.55)]"
              >
                <ArrowLeftRight className="h-3.5 w-3.5" />
                <span>Discover All Tools</span>
                <span className="opacity-70">| اكتشف الأدوات</span>
              </a>
            </div>
          </div>

          <button
            onClick={dismiss}
            aria-label="Close / إغلاق"
            className="absolute top-1.5 ltr:right-2 rtl:left-2 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-white/70 transition hover:bg-white/20 hover:text-white"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}