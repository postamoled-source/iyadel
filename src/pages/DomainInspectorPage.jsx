import { useI18n } from "@/lib/i18n";
import { useSeo } from "@/lib/analytics";
import { Link } from "react-router-dom";
import DomainInspector from "@/components/tools/DomainInspector";
import {
  Database, FileClock, MapPin, Activity, Info, Languages,
  BookOpen, ChevronRight, Gift, ShieldCheck, Zap,
} from "lucide-react";

const FEATURES = [
  {
    Icon: Database,
    title: "DNS Records (A, MX, NS)",
    desc: "The domain's address book: which server IP it points to, where its mail servers live, and which name servers answer for it.",
  },
  {
    Icon: FileClock,
    title: "Registration Info (RDAP/WHOIS)",
    desc: "Registrar, creation date, expiration date, nameservers and registrant — straight from the official registry.",
  },
  {
    Icon: MapPin,
    title: "Hosting Location",
    desc: "The server's IP address, country, city and hosting provider — see where a site actually lives.",
  },
  {
    Icon: Activity,
    title: "Uptime & Response Time",
    desc: "Three live checks over HTTPS measure whether the site is up right now and how fast it answers.",
  },
  {
    Icon: Info,
    title: "Notices & Remarks",
    desc: "Automatic remarks flag expiring domains, missing mail records, unresponsive servers and privacy-protected owners.",
  },
  {
    Icon: Languages,
    title: "Instant Translation",
    desc: "The full report translates instantly between Arabic and English — read every result in your language.",
  },
];

const STEPS = [
  "Type any domain — like google.com or yoursite.net — and press Inspect.",
  "The tool queries the public registry (RDAP), DNS-over-HTTPS and IP geolocation services in parallel.",
  "You get a full report: DNS, registration, hosting, uptime and automatic notices — in seconds.",
];

const FAQS = [
  {
    q: "How can I check where a website is hosted for free?",
    a: "Type the domain in the inspector above and press Inspect. The hosting location card shows the server IP, country, city and hosting provider — no account or payment needed.",
  },
  {
    q: "Can I see who owns a domain and when it expires?",
    a: "The Registration Info card shows the registrar, creation and expiration dates and registrant details from the official RDAP registry. Many owners enable WHOIS privacy, in which case personal details are replaced by a privacy service — the tool flags this for you.",
  },
  {
    q: "What do A, MX and NS records tell me about a domain?",
    a: "A records map the domain to server IP addresses; MX records list the mail servers that receive its email; NS records name the authoritative name servers answering for the domain. Missing MX records, for example, mean the domain cannot receive email on its own.",
  },
  {
    q: "How do I check if a website is down or it's just my connection?",
    a: "The Uptime card runs three live checks over HTTPS. If all three pass and respond fast, the site is up and your connection is fine; if the checks pass but your browser can't open the site, the issue is local — try another network or clear your cache.",
  },
  {
    q: "Is my lookup private? Do you store the domains I check?",
    a: "The inspection runs from your browser against public services. We don't store the domains you check and no account is needed.",
  },
];

export default function DomainInspectorPage() {
  const { t } = useI18n();
  useSeo({
    title: "فحص النطاقات والخوادم المجاني — DNS وWHOIS وموقع الاستضافة في فحص واحد",
    description: "افحص أي نطاق مجاناً بلا تسجيل: سجلات DNS، معلومات التسجيل RDAP/WHOIS، عنوان IP وموقع الاستضافة، فحص التشغيل Uptime والملاحظات التلقائية — كل ذلك في فحص واحد يعمل من متصفحك.",
    keywords: "فحص نطاق موقع مجانا, معرفة موقع استضافة أي موقع, فحص سجلات DNS لنطاق أونلاين, بديل WHOIS مجاني بدون تسجيل, معرفة جهة تسجيل الدومين وتاريخ انتهائه, فحص حالة الموقع هل هو متوقف أم يعمل, فحص سجلات MX للنطاق مجانا, أداة فحص النطاقات والسيرفرات, افحص أي دومين قبل شرائه, معرفة عنوان IP لأي موقع",
    path: "/domain-inspector",
  });

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
  const appSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "iyadel Domain & Server Inspector",
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Web",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  };
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://iyadel.com/" },
      { "@type": "ListItem", position: 2, name: "Domain & Server Inspector", item: "https://iyadel.com/domain-inspector" },
    ],
  };

  return (
    <div className="bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@graph": [appSchema, faqSchema, breadcrumbSchema] }) }}
      />

      {/* Hero */}
      <section className="relative bg-secondary pt-16 pb-12 overflow-hidden">
        <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-6">
            <Link to="/" className="hover:text-primary transition-colors">{t("Home")}</Link>
            <ChevronRight className="w-3.5 h-3.5 rtl:rotate-180" />
            <span className="text-foreground font-semibold">{t("Domain & Server Inspector")}</span>
          </nav>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground leading-tight">
            {t("Domain & Server Inspector")} — <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">{t("Free Domain Lookup")}</span>
          </h1>
          <p className="text-lg text-muted-foreground mt-4 max-w-2xl leading-relaxed">
            {t("Everything a domain reveals — explained feature by feature, then scanned live in one click.")}
          </p>
          <div className="flex flex-wrap gap-2 mt-6">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-background border border-border px-4 py-1.5 text-sm font-semibold text-foreground"><Gift className="w-4 h-4 text-accent" /> {t("Completely free")}</span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-background border border-border px-4 py-1.5 text-sm font-semibold text-foreground"><ShieldCheck className="w-4 h-4 text-primary" /> {t("No signup needed")}</span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-background border border-border px-4 py-1.5 text-sm font-semibold text-foreground"><Zap className="w-4 h-4 text-accent" /> {t("Runs in your browser")}</span>
          </div>
        </div>
      </section>

      {/* Live tool */}
      <DomainInspector hideGuideLink />

      {/* Features */}
      <section className="bg-background pb-16">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground mb-3">{t("What this inspector checks — and what each result means")}</h2>
          <p className="text-muted-foreground mb-8 max-w-2xl">{t("Six signals, one scan. Each card below explains what the tool reads from any domain.")}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map(({ Icon, title, desc }) => (
              <div key={title} className="rounded-[1.75rem] bg-card border border-border p-6 hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg transition-all duration-300">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-card-foreground mb-2">{t(title)}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{t(desc)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-secondary py-14">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground mb-8">{t("How the inspection works")}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {STEPS.map((step, i) => (
              <div key={i} className="rounded-[1.75rem] bg-card border border-border p-6">
                <div className="w-9 h-9 rounded-full bg-primary text-primary-foreground font-bold flex items-center justify-center mb-4">{i + 1}</div>
                <p className="text-sm text-muted-foreground leading-relaxed">{t(step)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-background py-14">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground mb-8">{t("Frequently asked questions")}</h2>
          <div className="space-y-3">
            {FAQS.map((f) => (
              <details key={f.q} className="group rounded-2xl bg-card border border-border p-5 open:border-primary/30 open:shadow-lg transition-all">
                <summary className="flex items-center justify-between gap-3 cursor-pointer font-bold text-card-foreground list-none">
                  {t(f.q)}
                  <ChevronRight className="w-4 h-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-90 rtl:group-open:-rotate-90" />
                </summary>
                <p className="text-sm text-muted-foreground leading-relaxed mt-3">{t(f.a)}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Blog CTA */}
      <section className="bg-background pb-16">
        <div className="max-w-3xl mx-auto px-6">
          <div className="rounded-[2rem] bg-gradient-to-br from-primary/10 to-accent/5 border border-primary/20 p-8 sm:p-10 flex flex-col sm:flex-row items-center gap-6 text-center sm:text-start">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shrink-0">
              <BookOpen className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-foreground mb-1">{t("Read the full walkthrough")}</h3>
              <p className="text-sm text-muted-foreground">{t("A step-by-step guide to reading a domain report — with illustrations.")}</p>
            </div>
            <Link
              to={`/Blog/post?slug=${encodeURIComponent("check-domain-dns-whois-uptime-guide")}&title=${encodeURIComponent("Check Any Domain Before You Trust It: DNS, WHOIS, Hosting & Uptime Explained")}`}
              className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-6 py-3 font-semibold text-sm hover:bg-primary/90 transition-colors shrink-0"
            >
              {t("Read more")} <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}