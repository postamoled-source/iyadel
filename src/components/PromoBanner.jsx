import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X, Zap, ChevronDown } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { getCachedTools } from "@/lib/tools-cache";
import { PDF_TOOLS_FLAT } from "@/data/pdf-tools";

const PDF_SLUGS = new Set(PDF_TOOLS_FLAT.map((t) => t.slug));

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
  "٪ Percentage Calculator — النسبة المئوية",
  "⚛️ Physics Calculators — حاسبات الفيزياء",
  "🧪 Chemistry Calculators — الكيمياء",
  "🧠 Brain Games — ألعاب العقل",
];

const TOTAL_SECONDS = 300;

export default function PromoBanner() {
  const { isRTL, t } = useI18n();
  const [visible, setVisible] = useState(true);
  const [text, setText] = useState("");
  const [remaining, setRemaining] = useState(TOTAL_SECONDS);
  const [showTools, setShowTools] = useState(false);
  const [groups, setGroups] = useState(null);

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
        if (twTimer.current) clearTimeout(twTimer.current);
        setText(current.substring(0, charIndex.current));
        twTimer.current = setTimeout(() => {
          isDeleting.current = true;
          tickTypewriter();
        }, 2400);
        return;
      }
    } else {
      charIndex.current--;
      if (charIndex.current < 0) {
        isDeleting.current = false;
        charIndex.current = 0;
        msgIndex.current = (msgIndex.current + 1) % MESSAGES.length;
        if (twTimer.current) clearTimeout(twTimer.current);
        twTimer.current = setTimeout(tickTypewriter, 400);
        return;
      }
    }
    setText(current.substring(0, charIndex.current));
    const speed = isDeleting.current ? 40 : 90;
    if (twTimer.current) clearTimeout(twTimer.current);
    twTimer.current = setTimeout(tickTypewriter, speed);
  }, []);

  // Typewriter + countdown start together whenever the banner is visible,
  // and stop together whenever it hides — so the animated text is always
  // running with every fresh 5-minute cycle.
  useEffect(() => {
    if (!visible) return;
    tickTypewriter();
    tickTimer.current = setInterval(() => {
      setRemaining((r) => (r <= 0 ? 0 : r - 1));
    }, 1000);
    const onVisibility = () => {
      pausedRef.current = document.hidden;
      if (!document.hidden) {
        if (twTimer.current) clearTimeout(twTimer.current);
        twTimer.current = setTimeout(tickTypewriter, 120);
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      if (twTimer.current) clearTimeout(twTimer.current);
      if (tickTimer.current) clearInterval(tickTimer.current);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [visible, tickTypewriter]);

  // When the countdown reaches zero, hide the banner; the effect above cleans
  // up the typewriter + interval automatically.
  useEffect(() => {
    if (remaining <= 0 && visible) {
      setVisible(false);
    }
  }, [remaining, visible]);

  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const timeStr = `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  const progress = (remaining / TOTAL_SECONDS) * 100;

  useEffect(() => {
    let alive = true;
    getCachedTools().then((tools) => {
      if (!alive) return;
      const map = {};
      (tools || []).forEach((tool) => {
        const c = tool.category || "Other";
        (map[c] = map[c] || []).push(tool);
      });
      // Surface all PDF sub-tools under the "PDF Tools" group.
      (map["PDF Tools"] = map["PDF Tools"] || []).push(...PDF_TOOLS_FLAT);
      setGroups(map);
    });
    return () => { alive = false; };
  }, []);

  const dismiss = () => {
    setVisible(false);
  };

  const show = () => {
    msgIndex.current = 0;
    charIndex.current = 0;
    isDeleting.current = false;
    setText("");
    setRemaining(TOTAL_SECONDS);
    setVisible(true);
  };

  return (
    <>
      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ opacity: 0, y: -24, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            dir={isRTL ? "rtl" : "ltr"}
            className="relative w-full overflow-hidden bg-[#1E1B4B] text-white"
          >
            <div className="absolute inset-0 bg-[linear-gradient(110deg,#4C1D95,#6D28D9,#7C3AED,#4C1D95,#312E81)] bg-[length:300%_300%] [animation:promoGradient_9s_ease_infinite]" />
            <motion.div
              aria-hidden
              className="pointer-events-none absolute -top-20 left-1/4 h-44 w-44 rounded-full bg-[#FBBF24] opacity-30 blur-[60px]"
              animate={{ x: [0, 40, 0], y: [0, 10, 0], opacity: [0.25, 0.45, 0.25] }}
              transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              aria-hidden
              className="pointer-events-none absolute -bottom-16 right-1/4 h-40 w-40 rounded-full bg-[#EF4444] opacity-25 blur-[55px]"
              animate={{ x: [0, -30, 0], y: [0, -12, 0], opacity: [0.2, 0.4, 0.2] }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            />
            <div className="pointer-events-none absolute inset-0 opacity-[0.08] [background-image:radial-gradient(circle,#fff_1px,transparent_1.5px)] [background-size:18px_18px]" />
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
              <div className="absolute -inset-y-4 -left-1/3 w-1/3 -skew-x-12 bg-white/10 blur-md [animation:promoShimmer_5s_ease-in-out_infinite]" />
            </div>
            <div className="absolute inset-x-0 bottom-0 h-[2px] bg-gradient-to-r from-transparent via-[#FBBF24] to-transparent" />

            <div className="relative mx-auto flex max-w-6xl flex-col gap-2 px-4 py-2.5 sm:flex-row sm:items-center sm:gap-4">
              <div className="flex min-w-0 flex-1 items-center gap-2.5">
                <motion.img
                  src="https://media.base44.com/images/public/6a7e76e3396b41955b675542/119b4193b_796788088_1400521338814129_7628354999335043826_n.gif"
                  alt="iyadel — Financial Calculator"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1, y: [0, -3, 0] }}
                  transition={{ opacity: { delay: 0.15, duration: 0.5 }, scale: { delay: 0.15, duration: 0.5 }, y: { duration: 3, repeat: Infinity, ease: "easeInOut" } }}
                  className="h-9 w-auto shrink-0 rounded-lg object-cover ring-1 ring-[#FBBF24]/60 shadow-[0_0_14px_rgba(251,191,36,0.45)]"
                />
                <motion.span
                  className="flex shrink-0 items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-extrabold text-[#FBBF24] ring-1 ring-[#FBBF24]/40 backdrop-blur-sm"
                  animate={{ boxShadow: ["0 0 0 0 rgba(251,191,36,0.5)", "0 0 0 6px rgba(251,191,36,0)", "0 0 0 0 rgba(251,191,36,0)"] }}
                  transition={{ duration: 2.2, repeat: Infinity }}
                >
                  <Sparkles className="h-3.5 w-3.5" /> iyadel
                </motion.span>
                <div className="min-h-[24px] flex-1 items-center text-sm font-medium leading-6 text-white/95 sm:text-[15px]">
                  <span dir="ltr" className="text-[#FBBF24]">{text}</span>
                  <span className="ml-0.5 inline-block h-4 w-[2px] translate-y-0.5 bg-[#FBBF24] [animation:blink_0.9s_steps(2)_infinite]" />
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-2.5">
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-black/30 px-2 py-0.5 text-[11px] font-bold tabular-nums text-white/90 ring-1 ring-white/15">
                    {timeStr}
                  </span>
                  <div className="hidden h-1.5 w-16 overflow-hidden rounded-full bg-black/40 sm:block">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-[#EF4444] via-[#FBBF24] to-[#FACC15]"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
                <motion.button
                  onClick={() => setShowTools((s) => !s)}
                  whileHover={{ scale: 1.04, y: -1 }}
                  whileTap={{ scale: 0.97 }}
                  className="group inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#FBBF24] to-[#F59E0B] px-3.5 py-1.5 text-xs font-bold text-[#1E1B4B] shadow-[0_4px_16px_rgba(251,191,36,0.45)] ring-1 ring-white/30"
                >
                  <Zap className="h-3.5 w-3.5 transition-transform group-hover:scale-110" />
                  <span>{t("Discover All Free Tools")}</span>
                  <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showTools ? "rotate-180" : ""}`} />
                </motion.button>
              </div>
            </div>

            <button
              onClick={dismiss}
              aria-label="Close / إغلاق"
              className="absolute top-1.5 right-2 z-20 flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-white/70 transition hover:rotate-90 hover:bg-white/25 hover:text-white"
            >
              <X className="h-3.5 w-3.5" />
            </button>

            <style>{`
              @keyframes promoGradient { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
              @keyframes promoShimmer { 0%{transform:translateX(-20%);opacity:0} 35%{opacity:0.6} 70%{opacity:0} 100%{transform:translateX(420%);opacity:0} }
              @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
            `}</style>
          </motion.div>
        )}
      </AnimatePresence>

      {createPortal(
        !visible && (
          <button
            onClick={show}
            aria-label="إظهار الإعلان / Show promo"
            style={{ position: "fixed", top: "4.5rem", right: "1rem", zIndex: 9999 }}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-[#6D28D9] to-[#7C3AED] text-[#FBBF24] shadow-[0_8px_24px_rgba(109,40,217,0.5)] ring-2 ring-[#FBBF24]/40"
          >
            <Sparkles className="h-5 w-5" />
          </button>
        ),
        document.body
      )}

      {createPortal(
        <AnimatePresence>
          {showTools && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="fixed inset-0 z-[10000] flex flex-col bg-black/60 backdrop-blur-sm"
              onClick={() => setShowTools(false)}
            >
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                dir={isRTL ? "rtl" : "ltr"}
                onClick={(e) => e.stopPropagation()}
                className="mt-auto max-h-[75vh] overflow-y-auto rounded-t-3xl bg-[#1E1B4B] p-5 shadow-[0_-8px_40px_rgba(0,0,0,0.5)]"
              >
                <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-white/20" />
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="flex items-center gap-2 text-base font-bold text-[#FBBF24]">
                    <Zap className="h-4 w-4" /> {t("Discover All Free Tools")}
                  </h2>
                  <button
                    onClick={() => setShowTools(false)}
                    aria-label="إغلاق / Close"
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white/70 transition hover:bg-white/25 hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="space-y-4">
                  {groups ? (
                    Object.entries(groups).map(([cat, tools]) => (
                      <div key={cat}>
                        <h3 className="mb-2 text-[11px] font-bold uppercase tracking-wide text-[#FBBF24]">{t(cat)}</h3>
                        <div className="flex flex-wrap gap-1.5">
                          {tools.map((tool) => (
                            <Link
                              key={tool.slug}
                              to={PDF_SLUGS.has(tool.slug) ? `/pdf-tools?tool=${tool.slug}` : `/tools/${tool.slug}`}
                              onClick={() => setShowTools(false)}
                              className="rounded-full border border-white/15 bg-white/10 px-2.5 py-1.5 text-xs font-medium text-white/90 transition-colors hover:bg-[#FBBF24] hover:text-[#1E1B4B] hover:border-[#FBBF24]"
                            >
                              {tool.name}
                            </Link>
                          ))}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-white/60">Loading… / جارٍ التحميل…</p>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}