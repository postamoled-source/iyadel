import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useI18n } from "@/lib/i18n";
import { motion } from "framer-motion";
import { Coins, ShieldCheck, Layers, Globe, Wrench, Sparkles, Mail, ChevronRight } from "lucide-react";
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

function HeroSection() {
  const { t } = useI18n();
  return (
    <section className="relative bg-background pt-20 pb-14 sm:pt-24 sm:pb-16">
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/20 rounded-full blur-[100px] pointer-events-none" style={{ animation: "floatA 9s ease-in-out infinite" }} />
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-accent/10 rounded-full blur-[100px] pointer-events-none" style={{ animation: "floatB 7s ease-in-out 2s infinite" }} />
      <div className="max-w-5xl mx-auto px-6 relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: "easeOut" }} className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-secondary border border-border px-4 py-1.5 mb-5">
            <Sparkles className="w-4 h-4 text-accent" />
            <span className="text-sm text-muted-foreground">{t("About TestPeak")}</span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-foreground mb-4">
            {t("Built to make life")} <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-gradient-x">{t("simpler")}</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t("TestPeak is an integrated tools platform providing free, interactive tools that cover your daily needs across finance, health, math, converters, games and images.")}
          </p>
        </motion.div>
      </div>
    </section>
  );
}

function AboutUsSection() {
  const { t } = useI18n();
  const features = [
    { icon: Coins, text: "Completely free — no registration or payment required." },
    { icon: ShieldCheck, text: "Secure & private — all processing happens in your browser, no data is uploaded to any server." },
    { icon: Layers, text: "Works on all devices — mobile, tablet, or desktop." },
    { icon: Globe, text: "Supports Arabic & English — choose your preferred language." },
    { icon: Wrench, text: "31+ tools — Finance, Health, Converters, Math, Brain Games, and Image Tools." },
    { icon: Sparkles, text: "Continuous updates — we keep adding new tools to meet your needs." },
  ];
  return (
    <section id="about-us" className="bg-secondary py-16 sm:py-24">
      <div className="max-w-5xl mx-auto px-6">
        <AnimatedElement>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-6">{t("About Us")}</h2>
          <p className="text-lg text-muted-foreground mb-10 leading-relaxed">
            <strong className="text-foreground">TestPeak</strong> {t("is an")} <strong className="text-foreground">{t("integrated tools platform")}</strong> {t("that provides a wide range of free and interactive tools covering users' daily needs across various domains.")}
          </p>
        </AnimatedElement>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {features.map((f, i) => (
            <AnimatedElement key={f.text} delay={i * 90}>
              <div className="flex gap-4 items-start rounded-2xl bg-card border border-border p-5 h-full hover:-translate-y-1 hover:shadow-xl transition-all duration-300">
                <div className="w-10 h-10 shrink-0 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                  <f.icon className="w-5 h-5 text-accent" />
                </div>
                <p className="text-foreground">{t(f.text)}</p>
              </div>
            </AnimatedElement>
          ))}
        </div>
        <AnimatedElement delay={300}>
          <p className="text-muted-foreground mt-10 italic text-center">{t("The TestPeak team works passionately to deliver the best digital experience.")}</p>
        </AnimatedElement>
      </div>
    </section>
  );
}

function PrivacyPolicySection() {
  const { t } = useI18n();
  const sections = [
    { title: "1. We Don't Track You", body: "TestPeak does not use Google Analytics or any third-party tracking. We do not record which tools you use or track your behavior. No tracking cookies are set." },
    { title: "2. Local-First Processing", body: "Calculators, converters, the QR generator, and image tools (cropper, compressor, enhancer, background remover) run entirely in your browser. Your inputs and images never leave your device." },
    { title: "3. Tools That Use Our Servers", body: "The AI Logo Maker sends your brand name and tagline to generate logos, and blog images uploaded by admins are stored on our servers. These are actions you take, not passive tracking." },
    { title: "4. Accounts", body: "If you create an account, we store your email address. We do not ask for your name or phone number." },
    { title: "5. Cookies", body: "We use local storage only to remember your preferences (language, favorites). We do not use tracking cookies and share nothing with advertisers." },
    { title: "6. Information Security", body: "We apply appropriate technical and organizational measures. However, no security system is 100% guaranteed." },
    { title: "7. Your Rights", body: "You have the right to access, correct, delete, object to processing, and withdraw consent at any time." },
    { title: "8. Financial & Health Disclaimer", body: "All financial and health tools are for educational and informational purposes only and do not constitute professional advice." },
  ];
  return (
    <section id="privacy-policy" className="bg-background py-16 sm:py-24">
      <div className="max-w-4xl mx-auto px-6">
        <AnimatedElement>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">{t("Privacy Policy")}</h2>
          <span className="text-sm text-muted-foreground">{t("Last Updated: August 15, 2026")}</span>
          <p className="text-muted-foreground mt-6 leading-relaxed">
            {t("At TestPeak, we recognize the importance of your privacy and are committed to protecting it. This Privacy Policy explains how we collect, use, share, and protect your personal information.")}
          </p>
        </AnimatedElement>
        <div className="mt-10 space-y-8">
          {sections.map((s, i) => (
            <AnimatedElement key={s.title} delay={i * 60}>
              <div className="rounded-2xl bg-card border border-border p-6">
                <h3 className="text-lg font-bold text-foreground mb-2">{t(s.title)}</h3>
                <p className="text-muted-foreground leading-relaxed">{t(s.body)}</p>
              </div>
            </AnimatedElement>
          ))}
        </div>
        <AnimatedElement delay={500}>
          <div className="mt-10 rounded-2xl bg-gradient-to-br from-primary/15 to-accent/10 border border-primary/20 p-6 flex items-center gap-4">
            <Mail className="w-6 h-6 text-accent shrink-0" />
            <div>
              <h3 className="font-bold text-foreground">{t("9. Contact Us")}</h3>
              <a href="mailto:support@testpeak.net" className="text-primary hover:underline">support@testpeak.net</a>
            </div>
          </div>
        </AnimatedElement>
      </div>
    </section>
  );
}

function CTASection() {
  const { t } = useI18n();
  return (
    <section className="bg-secondary py-16 sm:py-20 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[220px] bg-primary/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="max-w-3xl mx-auto px-6 text-center relative z-10">
        <AnimatedElement>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">{t("Ready to get started?")}</h2>
          <p className="text-muted-foreground mb-8">{t("Jump back in and explore all 31+ free tools TestPeak has to offer.")}</p>
          <Link to="/">
            <Button className="relative overflow-hidden rounded-xl px-8 py-6 text-lg bg-accent text-accent-foreground hover:scale-105 transition-transform duration-300 shadow-lg shadow-accent/20">
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-accent-foreground/20 to-transparent animate-[shimmer_3s_ease-in-out_infinite] bg-[length:200%_100%]" />
              <span className="relative z-10 flex items-center gap-2">{t("Back to Tools")} <ChevronRight className="w-5 h-5" /></span>
            </Button>
          </Link>
        </AnimatedElement>
      </div>
    </section>
  );
}

export default function About() {
  useSeo({
    title: "About TestPeak — Free, Private, Cross-Platform Tools",
    description: "Learn about TestPeak — an integrated platform of 31+ free, private, cross-platform online tools covering finance, health, converters, math, games, and image processing.",
    path: "/About",
  });
  return (
    <div>
      <HeroSection />
      <AboutUsSection />
      <PrivacyPolicySection />
      <CTASection />
    </div>
  );
}