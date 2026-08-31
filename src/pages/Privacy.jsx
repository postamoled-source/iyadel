import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useI18n } from "@/lib/i18n";
import { motion } from "framer-motion";
import { ShieldCheck, Mail, ChevronRight, Cookie, Server, MonitorSmartphone, EyeOff, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSeo } from "@/lib/analytics";

function AnimatedElement({ children, className, delay = 0 }) {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight) { setIsVisible(true); return; }
    const fallback = setTimeout(() => setIsVisible(true), 800 + delay);
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { clearTimeout(fallback); setTimeout(() => setIsVisible(true), delay); observer.unobserve(el); }
    }, { threshold: 0.05, rootMargin: "0px 0px 200px 0px" });
    observer.observe(el);
    return () => { observer.disconnect(); clearTimeout(fallback); };
  }, [delay]);
  return (
    <div ref={ref} className={`transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"} ${className || ""}`}>
      {children}
    </div>
  );
}

const SECTIONS = [
  {
    icon: EyeOff,
    title: "1. We Don't Track You",
    body: "iyadel does not use Google Analytics or any third-party analytics or advertising trackers. We do not record which tools you open, track your visits, or build a profile of your behavior. No tracking cookies are ever set.",
  },
  {
    icon: MonitorSmartphone,
    title: "2. Local-First Processing",
    body: "Calculators, converters, the QR generator, and the image tools (cropper, compressor, enhancer, background remover) run entirely in your browser. Your inputs, values, and images never leave your device for these tools.",
  },
  {
    icon: Server,
    title: "3. Tools That Use Our Servers",
    body: "A few features use our servers only when you actively choose them: the AI Logo Maker sends your brand name and tagline to generate logo concepts, which are returned to you; and blog images uploaded by administrators are stored on our servers. These are actions you take — not passive tracking — and no usage profile is built from them.",
  },
  {
    icon: ShieldCheck,
    title: "4. Accounts",
    body: "Creating an account is optional. If you do, we store only your email address to identify you. We do not ask for your name or phone number.",
  },
  {
    icon: Cookie,
    title: "5. Cookies & Local Storage",
    body: "We use local storage only to remember your preferences, such as your language and favorite tools. We do not use tracking cookies, and we share no data with advertisers or third parties.",
  },
  {
    icon: ShieldCheck,
    title: "6. Information Security",
    body: "We apply appropriate technical and organizational measures to protect any data we hold. However, no system is 100% secure, and we cannot guarantee absolute security.",
  },
  {
    icon: ShieldCheck,
    title: "7. Your Rights",
    body: "You may access, correct, or delete your personal data, object to its processing, and withdraw consent at any time. To exercise these rights, contact us at the email below.",
  },
  {
    icon: ShieldCheck,
    title: "8. Financial & Health Disclaimer",
    body: "All financial and health tools (loans, interest, BMI, calories, etc.) are for educational and informational purposes only and do not constitute professional financial or medical advice.",
  },
  {
    icon: ShieldCheck,
    title: "9. Children's Privacy",
    body: "iyadel is not directed at children under 13, and we do not knowingly collect personal information from children.",
  },
  {
    icon: ShieldCheck,
    title: "10. Changes to This Policy",
    body: "We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated revision date.",
  },
];

export default function Privacy() {
  const { t } = useI18n();
  useSeo({
    title: "Privacy Policy — iyadel",
    description: "iyadel does not track you. Most tools run locally in your browser; a few features use our servers only when you actively use them. No analytics, no tracking cookies.",
    path: "/Privacy",
  });
  return (
    <div>
      <section className="relative bg-background pt-20 pb-12 sm:pt-24 sm:pb-16">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/20 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-accent/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: "easeOut" }}>
            <div className="inline-flex items-center gap-2 rounded-full bg-secondary border border-border px-4 py-1.5 mb-5">
              <EyeOff className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">iyadel</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground mb-3">{t("Privacy Policy")}</h1>
            <span className="text-sm text-muted-foreground">{t("Last Updated: August 15, 2026")}</span>
            <p className="text-muted-foreground mt-6 leading-relaxed max-w-2xl mx-auto">
              {t("At iyadel, your privacy comes first. We don't track you and we don't profile you. This policy explains which tools process information locally in your browser, and the few features that use our servers only when you actively use them.")}
            </p>
          </motion.div>
        </div>
      </section>

      <section className="bg-background pb-16">
        <div className="max-w-4xl mx-auto px-6">
          <div className="space-y-6">
            {SECTIONS.map((s, i) => (
              <AnimatedElement key={s.title} delay={i * 50}>
                <div className="rounded-2xl bg-card border border-border p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 shrink-0 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                      <s.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-foreground mb-2">{t(s.title)}</h3>
                      <p className="text-muted-foreground leading-relaxed">{t(s.body)}</p>
                    </div>
                  </div>
                </div>
              </AnimatedElement>
            ))}
          </div>

          <AnimatedElement delay={500}>
            <div className="mt-8 rounded-2xl bg-gradient-to-br from-primary/15 to-accent/10 border border-primary/20 p-6 flex items-center gap-4">
              <Mail className="w-6 h-6 text-accent shrink-0" />
              <div>
                <h3 className="font-bold text-foreground">{t("11. Contact Us")}</h3>
                <a href="mailto:support@iyadel.com" className="text-primary hover:underline">support@iyadel.com</a>
              </div>
            </div>
          </AnimatedElement>
        </div>
      </section>

      <section className="bg-secondary py-16 sm:py-20 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[220px] bg-primary/20 rounded-full blur-[100px] pointer-events-none" />
        <div className="max-w-3xl mx-auto px-6 text-center relative z-10">
          <AnimatedElement>
            <div className="inline-flex items-center gap-2 mb-4 text-accent">
              <Sparkles className="w-5 h-5" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">{t("Ready to get started?")}</h2>
            <p className="text-muted-foreground mb-8">{t("Jump back in and explore all the free tools iyadel has to offer.")}</p>
            <Link to="/">
              <Button className="relative overflow-hidden rounded-xl px-8 py-6 text-lg bg-accent text-accent-foreground hover:scale-105 transition-transform duration-300 shadow-lg shadow-accent/20">
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-accent-foreground/20 to-transparent animate-[shimmer_3s_ease-in-out_infinite] bg-[length:200%_100%]" />
                <span className="relative z-10 flex items-center gap-2">{t("Back to Tools")} <ChevronRight className="w-5 h-5" /></span>
              </Button>
            </Link>
          </AnimatedElement>
        </div>
      </section>
    </div>
  );
}