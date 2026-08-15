import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ShieldCheck, Mail, ChevronRight, Cookie, Server, MonitorSmartphone, BarChart3, Sparkles } from "lucide-react";
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
    icon: BarChart3,
    title: "1. Information We Collect",
    body: "We collect only what is necessary to operate TestPeak. When you create an account, we store your email address. We do not ask visitors for their name or phone number. We also collect limited data automatically — such as IP address, browser type, device type, and the pages or tools you open — using cookies and local storage.",
  },
  {
    icon: BarChart3,
    title: "2. Analytics",
    body: "We use Google Analytics 4 to understand how visitors use the site in aggregate (e.g., popular tools, visit duration, device type). Google may set cookies and collect anonymized usage data under its own privacy policy. You can disable cookies in your browser settings. Additionally, when you open a tool, we record an anonymous usage event (tool name, category, and timestamp) on our servers to power our analytics dashboard.",
  },
  {
    icon: MonitorSmartphone,
    title: "3. Local vs Server Processing",
    body: "Most tools process your input entirely inside your browser — nothing is sent to our servers. This includes the calculators, unit converters, QR generator, and the image tools (cropper, compressor, enhancer, and background remover). Your images and values never leave your device for these tools.",
  },
  {
    icon: Server,
    title: "4. Tools That Send Data to Our Servers",
    body: "A few features require server-side processing: (a) the AI Logo Maker sends your brand name and tagline to our server to generate logo concepts, which are then stored and returned to you; (b) blog cover and in-article images uploaded by administrators are stored on our servers; (c) account registration stores your email. Everything else runs locally in your browser.",
  },
  {
    icon: ShieldCheck,
    title: "5. How We Use Your Information",
    body: "We use the information we collect to provide and improve our services, communicate with you about your account, analyze and understand usage, maintain security, and comply with legal obligations.",
  },
  {
    icon: ShieldCheck,
    title: "6. Sharing Information",
    body: "We do not sell or rent your personal information. We may share data with trusted service providers who process it on our behalf under their own privacy policies — for example Google (Analytics) and the AI providers that power the Logo Maker. We may also disclose information when required by law.",
  },
  {
    icon: ShieldCheck,
    title: "7. Information Security",
    body: "We apply appropriate technical and organizational measures to protect your information. However, no system is 100% secure, and we cannot guarantee absolute security.",
  },
  {
    icon: ShieldCheck,
    title: "8. Your Rights",
    body: "You have the right to access, correct, or delete your personal data, to object to its processing, and to withdraw consent at any time. To exercise these rights, contact us at the email below.",
  },
  {
    icon: ShieldCheck,
    title: "9. Financial & Health Disclaimer",
    body: "All financial and health tools (loans, interest, BMI, calories, etc.) are for educational and informational purposes only and do not constitute professional financial or medical advice.",
  },
  {
    icon: Cookie,
    title: "10. Cookies",
    body: "We use cookies and local storage to remember your preferences (such as language and favorites) and to measure usage. You can disable cookies in your browser; some features that rely on them may be limited.",
  },
  {
    icon: ShieldCheck,
    title: "11. Children's Privacy",
    body: "TestPeak is not directed at children under 13, and we do not knowingly collect personal information from children.",
  },
  {
    icon: ShieldCheck,
    title: "12. Changes to This Policy",
    body: "We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated revision date.",
  },
];

export default function Privacy() {
  useSeo({
    title: "Privacy Policy — TestPeak",
    description: "How TestPeak collects, uses, and protects your information. Most tools run locally in your browser; a few features send limited data to our servers for processing and analytics.",
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
              <ShieldCheck className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">TestPeak</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground mb-3">Privacy Policy</h1>
            <span className="text-sm text-muted-foreground">Last Updated: August 15, 2026</span>
            <p className="text-muted-foreground mt-6 leading-relaxed max-w-2xl mx-auto">
              At TestPeak, we respect your privacy. This policy explains what data we collect, how we use it, and which tools process information locally in your browser versus on our servers.
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
                      <h3 className="text-lg font-bold text-foreground mb-2">{s.title}</h3>
                      <p className="text-muted-foreground leading-relaxed">{s.body}</p>
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
                <h3 className="font-bold text-foreground">13. Contact Us</h3>
                <a href="mailto:support@testpeak.net" className="text-primary hover:underline">support@testpeak.net</a>
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
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">Ready to get started?</h2>
            <p className="text-muted-foreground mb-8">Jump back in and explore all 31+ free tools TestPeak has to offer.</p>
            <Link to="/">
              <Button className="relative overflow-hidden rounded-xl px-8 py-6 text-lg bg-accent text-accent-foreground hover:scale-105 transition-transform duration-300 shadow-lg shadow-accent/20">
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-accent-foreground/20 to-transparent animate-[shimmer_3s_ease-in-out_infinite] bg-[length:200%_100%]" />
                <span className="relative z-10 flex items-center gap-2">Back to Tools <ChevronRight className="w-5 h-5" /></span>
              </Button>
            </Link>
          </AnimatedElement>
        </div>
      </section>
    </div>
  );
}