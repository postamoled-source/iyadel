import { Link } from "react-router-dom";
import { useI18n } from "@/lib/i18n";
import { trackEvent } from "@/lib/analytics";
import { motion } from "framer-motion";
import { Globe, Volume2, Pencil, Heart, BookOpen, Play } from "lucide-react";

export default function LanguageSection() {
  const { t } = useI18n();
  const feats = [
    { icon: BookOpen, en: "Cut-up sentences & fill-in-the-blank", ar: "جمل مقطّعة وإكمال الفراغ" },
    { icon: Volume2, en: "Listening & speech with a talking character", ar: "استماع ونطق بشخصية متحدثة" },
    { icon: Pencil, en: "Type-in answers", ar: "إجابة بالكتابة" },
    { icon: Heart, en: "Hearts, streaks & many levels", ar: "قلوب وسلاسل ومستويات" },
  ];
  return (
    <section className="bg-[#FFFBEB] dark:bg-[#1E1B4B] transition-colors duration-300 py-16" id="learn-english">
      <div className="max-w-5xl mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.1 }} transition={{ duration: 0.6, ease: "easeOut" }}>
          <div className="rounded-[2.5rem] bg-card border border-primary/20 p-8 md:p-12 shadow-2xl relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-64 h-64 bg-primary/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-accent/15 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
              <div className="shrink-0">
                <div className="w-28 h-28 rounded-3xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-[0_18px_40px_-12px_hsl(var(--primary)/0.5)]">
                  <Globe className="w-16 h-16 text-white" strokeWidth={1.8} />
                </div>
              </div>
              <div className="flex-1 text-center md:text-start">
                <span className="inline-block text-[11px] font-bold uppercase tracking-widest text-primary mb-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20">{t("Learn English")}</span>
                <h2 className="text-2xl md:text-3xl font-extrabold text-card-foreground mb-2">{t("Learn English with iyadel — Duolingo-style")}</h2>
                <p className="text-muted-foreground text-sm leading-relaxed mb-5">
                  {t("An interactive language-learning game: vocabulary, listening, sentence building, and typing — with a talking character and 12 levels.")}
                </p>
                <div className="grid grid-cols-2 gap-2.5 mb-6">
                  {feats.map((f) => (
                    <div key={f.en} className="flex items-center gap-2 rounded-xl bg-background border border-border px-3 py-2 text-xs font-semibold text-foreground">
                      <f.icon className="w-4 h-4 text-accent shrink-0" />
                      <span className="truncate">{t(f.en)}</span>
                    </div>
                  ))}
                </div>
                <Link to="/tools/vocab-quiz" onClick={() => trackEvent("learn_english_open", {})} className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-primary to-accent text-white font-bold px-7 py-3.5 shadow-[0_12px_24px_-6px_hsl(var(--primary)/0.45)] hover:-translate-y-0.5 transition-transform">
                  <Play className="w-5 h-5" /> {t("Start Learning")}
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}