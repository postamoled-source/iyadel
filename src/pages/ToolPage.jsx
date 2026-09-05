import { useParams, Link, useNavigate } from "react-router-dom";
import { useI18n } from "@/lib/i18n";
import { useSeo } from "@/lib/analytics";
import { STATIC_TOOLS } from "@/data/tools";
import { TOOLS_SEO } from "@/data/tools-seo";
import { TOOL_GUIDES } from "@/data/tool-guides";
import { TOOL_CONTENT_AR, TOOL_GUIDES_AR } from "@/data/translations-ar";
import {
  ArrowLeft, ChevronRight, Play,
  Calculator as CalcIcon, TrendingUp, LineChart, Activity, Flame, DollarSign, Ruler,
  Weight, Square, Clock, Gauge, Wifi, QrCode, Link2, ShieldCheck, FunctionSquare, Percent,
  Atom, FlaskConical, HelpCircle, Puzzle, Shuffle, Crop, Eraser, FileImage, ImageDown,
  Ticket, Wand2, Palette, Hammer, Crosshair, Spline, Maximize2, FileDown, Languages,
  Pi, Divide, Sigma, Triangle, Hash, Grid3x3,
  Scale, Bone, Drumstick, Wheat, Droplet, Footprints, Heart, Salad,
  GraduationCap,
} from "lucide-react";
import Game2048 from "@/components/games/Game2048";
import MemoryMatch from "@/components/games/MemoryMatch";
import WhackAMole from "@/components/games/WhackAMole";
import BallLauncher from "@/components/games/BallLauncher";
import SnakeGame from "@/components/games/SnakeGame";
import MathPuzzleGame from "@/components/games/MathPuzzleGame";
import WordScrambleGame from "@/components/games/WordScrambleGame";
import VocabQuizGame from "@/components/games/VocabQuizGame";
import LoveCalculator from "@/components/games/LoveCalculator";
import CarTools from "@/components/tools/CarTools";
import UniversityGuide from "@/components/tools/UniversityGuide";
import PercentageCalculator from "@/components/tools/PercentageCalculator";
import JpgToPngConverter from "@/components/tools/JpgToPngConverter";
import ImageResizer from "@/components/tools/ImageResizer";
import ToolCalculator from "@/components/tools/ToolCalculator";
import PageNotFound from "@/lib/PageNotFound";

const ICONS = {
  Calculator: CalcIcon, TrendingUp, LineChart, Activity, Flame, DollarSign, Ruler, Weight,
  Square, Clock, Gauge, Wifi, QrCode, Link2, ShieldCheck, FunctionSquare, Percent, Atom,
  FlaskConical, HelpCircle, Puzzle, Shuffle, Crop, Eraser, FileImage, ImageDown, Ticket,
  Wand2, Palette, Hammer, Crosshair, Spline, Maximize2, FileDown, Languages,
  Pi, Divide, Sigma, Triangle, Hash, Grid3x3,
  Scale, Bone, Drumstick, Wheat, Droplet, Footprints, Heart, Salad,
  GraduationCap,
};

// Tools whose interactive calculator is an importable component → embedded directly.
const EMBED = {
  "game-2048": Game2048,
  "memory-match": MemoryMatch,
  "whack-a-mole": WhackAMole,
  "ball-launcher": BallLauncher,
  "snake-game": SnakeGame,
  "math-puzzle": MathPuzzleGame,
  "word-scramble": WordScrambleGame,
  "vocab-quiz": VocabQuizGame,
  "love-calculator": LoveCalculator,
  "car-tools-suite": CarTools,
  "university-guide": UniversityGuide,
  "percentage-calculator": PercentageCalculator,
  "jpg-to-png": JpgToPngConverter,
  "image-resizer": ImageResizer,
  "loan-calculator": ToolCalculator,
  "simple-compound-interest": ToolCalculator,
  "currency-converter": ToolCalculator,
  "internet-speed-test": ToolCalculator,
  "coupon-code-generator": ToolCalculator,
  "bond-yield": ToolCalculator,
  "bmi-calculator": ToolCalculator,
  "calories-burned": ToolCalculator,
  "distance-converter": ToolCalculator,
  "weight-converter": ToolCalculator,
  "area-converter": ToolCalculator,
  "time-converter": ToolCalculator,
  "speed-converter": ToolCalculator,
  "qr-code-generator": ToolCalculator,
  "share-link-generator": ToolCalculator,
  "privacy-policy-generator": ToolCalculator,
  "math-function-calculator": ToolCalculator,
  "physics-calculators": ToolCalculator,
  "chemistry-calculators": ToolCalculator,
  "riddle-game": ToolCalculator,
  "image-cropper": ToolCalculator,
  "background-remover": ToolCalculator,
  "image-to-pdf": ToolCalculator,
  "image-compressor": ToolCalculator,
  "image-enhancer": ToolCalculator,
  "logo-maker": ToolCalculator,
  "basic-calculator": ToolCalculator,
  "scientific-calculator": ToolCalculator,
  "fraction-calculator": ToolCalculator,
  "statistics-calculator": ToolCalculator,
  "geometry-calculator": ToolCalculator,
  "quadratic-solver": ToolCalculator,
  "gcd-lcm-calculator": ToolCalculator,
  "perm-comb-calculator": ToolCalculator,
  "matrix-calculator": ToolCalculator,
  "ideal-weight": ToolCalculator,
  "body-fat": ToolCalculator,
  "daily-protein": ToolCalculator,
  "daily-carbs": ToolCalculator,
  "daily-fat": ToolCalculator,
  "running-pace": ToolCalculator,
  "bmr-calculator": ToolCalculator,
  "tdee-calculator": ToolCalculator,
  "calorie-calculator": ToolCalculator,
};

const FORMULAS = {
  "loan-calculator": "M = P × r(1+r)^n / ((1+r)^n − 1)",
  "simple-compound-interest": "Simple: I = P×r×t   |   Compound: A = P(1 + r/n)^(n·t)",
  "bond-yield": "Current Yield = Annual Coupon ÷ Price",
  "bmi-calculator": "BMI = weight(kg) ÷ height(m)²",
  "calories-burned": "Calories = MET × weight(kg) × duration(h)",
  "percentage-calculator": "Part = (Percent ÷ 100) × Whole",
  "physics-calculators": "speed = distance ÷ time   |   I = V ÷ R",
  "chemistry-calculators": "Molar Mass = Σ (atomic weight × atom count)",
  "math-function-calculator": "y = f(x), evaluated across the chosen x range",
  "currency-converter": "Target = Amount × exchange_rate",
  "distance-converter": "result = value × (fromFactor ÷ toFactor)   [base: meters]",
  "weight-converter": "result = value × (fromFactor ÷ toFactor)   [base: grams]",
  "area-converter": "result = value × (fromFactor ÷ toFactor)   [base: m²]",
  "time-converter": "result = value × (fromFactor ÷ toFactor)   [base: seconds]",
  "speed-converter": "result = value × (fromFactor ÷ toFactor)   [base: m/s]",
  "basic-calculator": "result = expression  (PEMDAS order of operations)",
  "scientific-calculator": "result = expression  (sin, cos, ln, ^, π, e)",
  "fraction-calculator": "a/b op c/d → simplify by GCD",
  "statistics-calculator": "mean = Σx ÷ n   |   std = √(Σ(x−mean)² ÷ (n−1))",
  "geometry-calculator": "rect: l×w   |   circle: π·r²   |   tri: ½·b·h   |   cube: l·w·h",
  "quadratic-solver": "x = (−b ± √(b²−4ac)) ÷ 2a",
  "gcd-lcm-calculator": "GCD: Euclidean algorithm   |   LCM = (a × b) ÷ GCD",
  "perm-comb-calculator": "nPr = n! ÷ (n−r)!   |   nCr = n! ÷ (r! × (n−r)!)",
  "matrix-calculator": "det = a11·a22 − a12·a21",
  "ideal-weight": "Ideal = 50 + 2.3 × (height_in − 60)   [male]",
  "body-fat": "US Navy: BF = 86.01·log₁₀(waist−neck) − 70.04·log₁₀(height) + 36.76",
  "daily-protein": "Protein (g) = weight(kg) × factor",
  "daily-carbs": "Carbs (g) = (calories × carb%) ÷ 4",
  "daily-fat": "Fat (g) = (calories × fat%) ÷ 9",
  "running-pace": "Pace = time ÷ distance   |   Speed = distance ÷ time",
  "bmr-calculator": "BMR = 10·weight + 6.25·height − 5·age + s   [s=5 male, −161 female]",
  "tdee-calculator": "TDEE = BMR × activity_factor",
  "calorie-calculator": "Maintenance = TDEE   |   Loss = TDEE − 500   |   Gain = TDEE + 500",
};

const EXAMPLES = {
  "loan-calculator": "A $10,000 loan at 6.5% for 36 months → monthly payment ≈ $306.50.",
  "simple-compound-interest": "$1,000 at 5% for 10 years, compounded monthly → ≈ $1,647.",
  "bond-yield": "$80 coupon on a $950 bond → current yield ≈ 8.42%.",
  "bmi-calculator": "70 kg ÷ (1.75 m)² → BMI ≈ 22.9 (Normal).",
  "calories-burned": "70 kg person running (MET 9.8) for 30 min → ≈ 343 kcal.",
  "percentage-calculator": "20% of 250 → 50.",
  "physics-calculators": "100 km in 2 hours → speed = 50 km/h.",
  "chemistry-calculators": "H2O → 2×1.008 + 16.00 ≈ 18.02 g/mol.",
  "currency-converter": "100 USD at rate 0.92 → 92 EUR.",
  "distance-converter": "1 mile → 1.609 km.",
  "weight-converter": "1 kg → 2.205 lb.",
  "area-converter": "1 acre → 0.4047 ha.",
  "time-converter": "1 hour → 3600 s.",
  "speed-converter": "100 km/h → 27.78 m/s.",
  "basic-calculator": "2 + 3 × 4 → 14 (multiplication before addition).",
  "scientific-calculator": "sin(π/2) + 2³ → 1 + 8 = 9.",
  "fraction-calculator": "1/2 + 3/4 → 5/4 = 1.25.",
  "statistics-calculator": "5, 10, 15, 20, 25 → mean 15, median 15.",
  "geometry-calculator": "Circle radius 5 → area ≈ 78.54.",
  "quadratic-solver": "x² − 5x + 6 = 0 → x = 2, x = 3.",
  "gcd-lcm-calculator": "12, 18 → GCD 6, LCM 36.",
  "perm-comb-calculator": "n=5, r=2 → nPr 20, nCr 10.",
  "matrix-calculator": "det([[3,1],[5,2]]) → 1.",
  "ideal-weight": "Male, 175 cm → ideal ≈ 70.4 kg (range 65.4–75.4).",
  "body-fat": "Male, waist 80, neck 38, height 175 → ≈ 15.6% (Fitness).",
  "daily-protein": "70 kg, active, build muscle → 112 g/day.",
  "daily-carbs": "2000 kcal at 45% → 225 g carbs/day.",
  "daily-fat": "2000 kcal at 30% → ≈ 66.7 g fat/day.",
  "running-pace": "10 km in 50 min → pace 5.0 min/km, speed 12 km/h.",
  "bmr-calculator": "Male, 30, 175 cm, 70 kg → BMR ≈ 1650 kcal.",
  "tdee-calculator": "Male, 30, 175 cm, 70 kg, moderate → TDEE ≈ 2558 kcal.",
  "calorie-calculator": "Maintenance 2558 → loss 2058, gain 3058 kcal.",
};

function Section({ title, children }) {
  return (
    <div className="mb-6">
      <h2 className="text-[18px] font-bold text-[#111827] dark:text-[#FEF3C7] mb-3">{title}</h2>
      {children}
    </div>
  );
}

function Faq({ q, a }) {
  return (
    <details className="group bg-white dark:bg-[#2D2A5A] border border-[#F3F4F6] dark:border-[#4B3F8A] rounded-xl">
      <summary className="cursor-pointer list-none flex items-center justify-between p-4 text-sm font-semibold text-[#111827] dark:text-[#FEF3C7]">
        {q}
        <ChevronRight className="w-4 h-4 shrink-0 transition-transform group-open:rotate-90" />
      </summary>
      <p className="px-4 pb-4 text-sm text-[#374151] dark:text-[#D6D2EE] leading-relaxed">{a}</p>
    </details>
  );
}

export default function ToolPage() {
  const { slug } = useParams();
  const { t, lang } = useI18n();
  const navigate = useNavigate();
  const tool = STATIC_TOOLS.find((x) => x.slug === slug);
  const seo = slug ? TOOLS_SEO[slug] : null;
  const useSeoCfg = !!(seo && lang !== "ar");

  useSeo({
    title: useSeoCfg ? seo.title : (tool ? `${tool.name} — Free Online Tool` : "Tool not found"),
    rawTitle: useSeoCfg,
    description: useSeoCfg
      ? seo.metaDescription
      : (tool ? (tool.description || (tool.content || "").slice(0, 150)) : "Tool not found"),
    keywords: useSeoCfg ? seo.keywords : undefined,
    path: `/tools/${slug}`,
  });

  if (!tool) return <PageNotFound />;

  const guide = TOOL_GUIDES[slug] || {};
  const guideAr = TOOL_GUIDES_AR[slug] || {};
  const steps = (lang === "ar" ? guideAr.steps : guide.steps) || [
    `Open the ${tool.name} calculator above.`,
    "Enter your values into the input fields.",
    "Read the result shown instantly.",
  ];
  const intro = lang === "ar" ? (TOOL_CONTENT_AR[slug] || guideAr.intro || tool.content || tool.description) : (guide.intro || tool.content || tool.description);
  const formula = FORMULAS[slug] || `// ${tool.name} — interactive tool, see How to use above.`;
  const example = EXAMPLES[slug] || `Open the ${tool.name} calculator above to try a live example.`;

  const faqs = useSeoCfg
    ? seo.faqs.map((f) => ({ q: f.q, a: f.a }))
    : [
        { q: `${t("What is")} ${t(tool.name)}؟`, a: tool.description ? t(tool.description) : intro },
        { q: `${t("Is")} ${t(tool.name)} ${t("free to use?")}`, a: t("Yes — it is 100% free, runs entirely in your browser, and needs no sign-up.") },
        { q: `${t("Does")} ${t(tool.name)} ${t("work on mobile?")}`, a: t("Yes, it is fully responsive and works on phones, tablets, and desktops.") },
      ];
  const schemaBase = "https://iyadel.com";
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${schemaBase}/` },
      { "@type": "ListItem", position: 2, name: tool.category, item: `${schemaBase}/?cat=${encodeURIComponent(tool.category)}` },
      { "@type": "ListItem", position: 3, name: tool.name, item: `${schemaBase}/tools/${slug}` },
    ],
  };
  const appSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: tool.name,
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Any (Web browser)",
    url: `${schemaBase}/tools/${slug}`,
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  };

  const sameCat = STATIC_TOOLS.filter((x) => x.category === tool.category && x.slug !== tool.slug);
  const others = STATIC_TOOLS.filter((x) => x.category !== tool.category);
  const related = [...sameCat, ...others].slice(0, 4);

  const Icon = ICONS[tool.icon] || CalcIcon;
  const Calc = EMBED[slug];

  return (
    <section className="bg-[#FFFBEB] dark:bg-[#1E1B4B] min-h-screen py-6">
      <div className="max-w-3xl mx-auto px-4">
        <nav className="flex items-center gap-1 text-xs text-[#6B7280] mb-4 flex-wrap">
          <Link to="/" className="hover:text-[#6D28D9]">{t("Home")}</Link>
          <ChevronRight className="w-3 h-3" />
          <Link to="/" className="hover:text-[#6D28D9]">{t(tool.category)}</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-[#111827] dark:text-[#FEF3C7] font-medium truncate">{t(tool.name)}</span>
        </nav>

        <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-[#6D28D9] font-semibold mb-4 hover:opacity-80">
          <ArrowLeft className="w-4 h-4" /> {t("Back")}
        </button>

        <div className="flex items-start gap-4 mb-6">
          <div className="w-[72px] h-[72px] shrink-0 rounded-2xl bg-gradient-to-br from-[#6D28D9] to-[#F59E0B] flex items-center justify-center shadow-[0_8px_20px_rgba(109,40,217,0.25)] overflow-hidden">
            {tool.logo || tool.image ? (
              <img src={tool.logo || tool.image} alt={tool.name} className="w-full h-full object-cover" />
            ) : (
              <Icon className="w-8 h-8 text-white" strokeWidth={2.2} />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-[24px] font-bold text-[#111827] dark:text-[#FEF3C7] leading-tight">
              {useSeoCfg ? seo.h1 : t(tool.name)}
            </h1>
            <span className="inline-block mt-1 text-xs font-medium text-[#6B7280] bg-white dark:bg-[#2D2A5A] border border-[#E9D5FF] rounded-full px-2.5 py-0.5">{t(tool.category)}</span>
            <p className="text-sm text-[#6B7280] mt-2">{t(tool.description)}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-[#2D2A5A] rounded-[20px] p-5 shadow-[0_4px_12px_rgba(109,40,217,0.08)] mb-6">
          {Calc ? (
            <Calc slug={slug} />
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <Icon className="w-10 h-10 text-[#6D28D9] mb-3" />
              <p className="text-sm text-[#6B7280] mb-4 max-w-xs">{t(tool.description)}</p>
              <Link to={tool.route || `/?tool=${tool.slug}`} className="inline-flex items-center gap-2 bg-gradient-to-r from-[#6D28D9] to-[#F59E0B] text-white font-semibold px-6 py-3 rounded-xl shadow-[0_4px_12px_rgba(109,40,217,0.25)] hover:opacity-90 transition-opacity">
                <Play className="w-4 h-4" /> {t("Open")} {tool.name}
              </Link>
            </div>
          )}
        </div>

        <p className="text-sm text-[#374151] dark:text-[#D6D2EE] leading-relaxed mb-6">{intro}</p>

        {useSeoCfg && seo.content && (
          <div className="mb-6">
            <Section title={`What is ${tool.name}?`}>
              <p className="text-sm text-[#374151] dark:text-[#D6D2EE] leading-relaxed">{seo.content}</p>
              <p className="mt-3 text-xs text-[#9CA3AF] dark:text-[#8B8AB0]">Last updated: September 2026</p>
            </Section>
          </div>
        )}

        <Section title={`${t("How to use")} ${t(tool.name)}`}>
          <ol className="space-y-3">
            {steps.slice(0, 3).map((s, i) => (
              <li key={i} className="flex gap-3">
                <span className="shrink-0 w-6 h-6 rounded-full bg-[#6D28D9] text-white text-xs font-bold flex items-center justify-center">{i + 1}</span>
                <span className="text-sm text-[#374151] dark:text-[#D6D2EE] pt-0.5">{s}</span>
              </li>
            ))}
          </ol>
        </Section>

        <Section title={t("Formula")}>
          <pre className="bg-[#F9FAFB] dark:bg-[#1E1B4B] border border-[#F3F4F6] dark:border-[#4B3F8A] rounded-xl p-4 text-sm text-[#111827] dark:text-[#FEF3C7] overflow-x-auto font-mono whitespace-pre-wrap">{formula}</pre>
        </Section>

        <Section title={t("Example")}>
          <p className="text-sm text-[#374151] dark:text-[#D6D2EE] bg-[#FFFBEB] dark:bg-[#2D2A5A] border border-[#FDE68A] rounded-xl p-4">{example}</p>
        </Section>

        <Section title={t("FAQs")}>
          <div className="space-y-2">
            {faqs.map((f, i) => <Faq key={i} q={f.q} a={f.a} />)}
          </div>
        </Section>

        <Section title={t("Related Tools")}>
          <div className="grid grid-cols-2 gap-3">
            {related.map((r) => {
              const RIcon = ICONS[r.icon] || CalcIcon;
              return (
                <Link key={r.slug} to={`/tools/${r.slug}`} className="flex items-center gap-2 bg-white dark:bg-[#2D2A5A] border border-[#F3F4F6] dark:border-[#4B3F8A] rounded-xl p-3 hover:-translate-y-0.5 hover:shadow-md transition-all">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#6D28D9] to-[#F59E0B] flex items-center justify-center overflow-hidden shrink-0">
                    {r.logo ? <img src={r.logo} alt={r.name} className="w-full h-full object-cover" /> : <RIcon className="w-5 h-5 text-white" />}
                  </div>
                  <span className="text-sm font-semibold text-[#111827] dark:text-[#FEF3C7] truncate">{t(r.name)}</span>
                </Link>
              );
            })}
          </div>
        </Section>

        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(appSchema) }} />
      </div>
    </section>
  );
}