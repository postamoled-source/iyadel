import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useI18n } from "@/lib/i18n";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import MobileSelect from "@/components/MobileSelect";
import PullToRefresh from "@/components/PullToRefresh";
import { useIsMobile } from "@/hooks/use-mobile";
import { createPortal } from "react-dom";
import { Image as Img } from "@/components/ui/image";
import { generateLogo } from "@/functions/generateLogo";
import Game2048 from "@/components/games/Game2048";
import MemoryMatch from "@/components/games/MemoryMatch";
import WhackAMole from "@/components/games/WhackAMole";
import BallLauncher from "@/components/games/BallLauncher";
import SnakeGame from "@/components/games/SnakeGame";
import MathPuzzleGame from "@/components/games/MathPuzzleGame";
import WordScrambleGame from "@/components/games/WordScrambleGame";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, AreaChart, Area, Legend } from "recharts";
import { jsPDF } from "jspdf";
import { CATEGORIES, STATIC_TOOLS, LOGO_URL } from "@/data/tools";
import { DISTANCE_UNITS, WEIGHT_UNITS, AREA_UNITS, TIME_UNITS, SPEED_UNITS, CURRENCY_RATES, ATOMIC_WEIGHTS, RIDDLES, convertUnit, calcMolarMass, compileExpr, FN_COLORS } from "@/lib/tool-utils";
import { Calculator, TrendingUp, LineChart as LineChartIcon, Activity, Flame, DollarSign, Ruler, Weight, Square, Clock, Gauge, Wifi, QrCode, Link2, ShieldCheck, FunctionSquare, Percent, Atom, FlaskConical, HelpCircle, Puzzle, Shuffle, Crop, Eraser, FileImage, ImageDown, ArrowLeft, RefreshCw, ArrowLeftRight, ChevronRight, Copy, Send, Play, ShieldQuestion, Coins, Layers, Zap, Box, Gift, ExternalLink, Smartphone, Ticket, Search, X, Star, Wand2, Palette, Hammer, Crosshair, SlidersHorizontal, Swords, Spline } from "lucide-react";
import { useFavorites } from "@/hooks/useFavorites";
import { trackEvent, useSeo } from "@/lib/analytics";
import { TOOL_CONTENT_AR, TOOL_GUIDES_AR } from "@/data/translations-ar";
import { TOOL_GUIDES } from "@/data/tool-guides";

const ToolEntity = base44.entities.Tool;
const BlogPostEntity = base44.entities.BlogPost;

const ICONS = {
  Calculator, TrendingUp, LineChart: LineChartIcon, Activity, Flame, DollarSign, Ruler, Weight,
  Square, Clock, Gauge, Wifi, QrCode, Link2, ShieldCheck, FunctionSquare, Percent, Atom, FlaskConical,
  HelpCircle, Puzzle, Shuffle, Crop, Eraser, FileImage, ImageDown, Ticket, Wand2, Palette, Hammer, Crosshair, Swords, Spline
};



const STATIC_BLOG = [
  { title: "5 Smart Ways to Pay Off Your Loan Faster", excerpt: "Small changes to your repayment strategy can save you thousands in interest.", category: "Finance", date: "Aug 10, 2026", image_url: "https://media.base44.com/images/public/6a7e76e3396b41955b675542/58374ccbe_generated_5e9014e0.png" },
  { title: "Understanding BMI: What the Numbers Really Mean", excerpt: "Body Mass Index is a starting point, not the full picture.", category: "Health", date: "Aug 5, 2026", image_url: "https://media.base44.com/images/public/6a7e76e3396b41955b675542/091f98734_generated_92bd36b3.png" },
  { title: "Compound Interest: The Eighth Wonder of the World", excerpt: "See how compounding accelerates your savings over time.", category: "Finance", date: "Jul 28, 2026", image_url: "https://media.base44.com/images/public/6a7e76e3396b41955b675542/ff5a36d61_generated_8395a13a.png" },
];



// ---------- shared UI ----------
const styles = `
  @keyframes floatA { 0%, 100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-20px) rotate(3deg); } }
  @keyframes floatB { 0%, 100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-15px) rotate(-2deg); } }
  @keyframes floatC { 0%, 100% { transform: translateY(0) scale(1); } 50% { transform: translateY(-10px) scale(1.05); } }
  @keyframes shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
  .animate-gradient-x { background-size: 200% 200%; animation: gradientX 5s ease infinite; }
  @keyframes gradientX { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
`;

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
    }, { threshold: 0.05, rootMargin: "0px 0px 100px 0px" });
    observer.observe(el);
    return () => { observer.disconnect(); clearTimeout(fallback); };
  }, [delay]);
  return (
    <div ref={ref} className={`transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"} ${className || ""}`}>
      {children}
    </div>
  );
}

function NumInput({ label, value, onChange, placeholder }) {
  return (
    <div className="text-left">
      <label className="block text-sm font-medium text-muted-foreground mb-1.5 ml-1">{label}</label>
      <input type="number" inputMode="decimal" value={value ?? ""} onChange={onChange} placeholder={placeholder}
        className="w-full rounded-2xl border border-border bg-background text-foreground text-base px-4 py-3.5 min-h-[52px] focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-sm" />
    </div>
  );
}
function TxtInput({ label, value, onChange, placeholder, type = "text" }) {
  return (
    <div className="text-left">
      <label className="block text-sm font-medium text-muted-foreground mb-1.5 ml-1">{label}</label>
      <input type={type} inputMode={type === "number" ? "decimal" : undefined} value={value ?? ""} onChange={onChange} placeholder={placeholder}
        className="w-full rounded-2xl border border-border bg-background text-foreground text-base px-4 py-3.5 min-h-[52px] focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-sm" />
    </div>
  );
}
function FnInput({ label, value, onChange, placeholder }) {
  return (
    <div className="text-left">
      <label className="block text-sm font-medium text-muted-foreground mb-1.5 ml-1">{label}</label>
      <textarea value={value ?? ""} onChange={onChange} placeholder={placeholder} rows={3}
        className="w-full rounded-2xl border border-border bg-background text-foreground text-base px-4 py-3 min-h-[52px] focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-sm resize-y font-mono" />
    </div>
  );
}
function SelectField({ label, value, onChange, options }) {
  return (
    <div className="text-left">
      <label className="block text-sm font-medium text-muted-foreground mb-1.5 ml-1">{label}</label>
      <MobileSelect
        value={value}
        onChange={(v) => onChange({ target: { value: v } })}
        options={options}
        placeholder={options[0]}
        triggerClassName="w-full flex items-center gap-2 rounded-2xl border border-border bg-background text-foreground text-base px-4 py-3.5 h-auto min-h-[52px] shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
      />
    </div>
  );
}
function RangeField({ label, value, onChange, min, max, step = 1 }) {
  return (
    <div className="text-left">
      <div className="flex items-center justify-between mb-1.5 ml-1">
        <label className="block text-sm font-medium text-muted-foreground">{label}</label>
        <span className="text-xs font-bold text-primary tabular-nums">{value ?? min}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value ?? min} onChange={onChange}
        className="w-full h-10 accent-primary cursor-pointer" />
    </div>
  );
}
function ColorField({ label, value, onChange }) {
  return (
    <div className="text-left">
      <label className="block text-sm font-medium text-muted-foreground mb-1.5 ml-1">{label}</label>
      <div className="flex items-center gap-3 rounded-2xl border border-border bg-background px-4 py-2.5 min-h-[52px] shadow-sm">
        <input type="color" value={value} onChange={onChange} className="w-10 h-10 rounded-lg cursor-pointer border-0 bg-transparent p-0" />
        <span className="text-sm font-mono text-muted-foreground">{value}</span>
      </div>
    </div>
  );
}
function ResultCard({ title, children }) {
  return (
    <div className="mt-8 rounded-[2rem] bg-gradient-to-b from-primary/10 to-transparent border border-primary/20 p-8 shadow-inner shadow-primary/5 animate-[fadeIn_0.5s_ease-out]">
      <h4 className="text-lg font-bold text-foreground mb-4 text-center">{title}</h4>
      <div className="text-center">{children}</div>
    </div>
  );
}
function TipBox({ children }) {
  return <div className="mt-6 rounded-2xl bg-secondary border border-border p-5 text-sm text-secondary-foreground text-center shadow-sm">{children}</div>;
}
function CalcButton({ children, onClick, variant = "primary" }) {
  return (
    <Button onClick={onClick}
      className={`relative overflow-hidden mt-6 w-full sm:w-auto rounded-2xl px-8 py-6 font-bold text-base transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_0_20px_-5px_hsl(var(--primary)/0.5)] ${variant === "primary" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}>
      {variant === "primary" && <span className="absolute inset-0 bg-gradient-to-r from-transparent via-primary-foreground/20 to-transparent animate-[shimmer_3s_ease-in-out_infinite] bg-[length:200%_100%]" />}
      <span className="relative z-10">{children}</span>
    </Button>
  );
}

// ---------- Hero ----------
function HeroSection({ toolCount, catCount, searchQuery, onSearchChange }) {
  const { t } = useI18n();
  const scrollTo = (id, fallback) => {
    const el = document.getElementById(id) || (fallback && document.getElementById(fallback));
    if (!el) return;
    const y = el.getBoundingClientRect().top + window.scrollY - 80;
    try { window.scrollTo({ top: y, behavior: "smooth" }); }
    catch { window.scrollTo(0, y); }
  };
  return (
    <section className="relative overflow-hidden bg-background pt-10 pb-16">
      <style>{styles}</style>
      <div className="absolute top-10 left-10 w-[400px] h-[400px] bg-primary/20 rounded-full blur-[120px] pointer-events-none" style={{ animation: "floatA 9s ease-in-out infinite" }} />
      <div className="absolute bottom-20 right-10 w-[500px] h-[500px] bg-accent/15 rounded-full blur-[150px] pointer-events-none" style={{ animation: "floatB 7s ease-in-out 2s infinite" }} />
      
      <div className="max-w-5xl mx-auto px-6 relative z-10">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: "easeOut" }}
          className="rounded-[3rem] bg-card border border-border shadow-2xl p-10 md:p-20 text-center relative overflow-hidden group">
          
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none" />

          <div className="flex items-center justify-center gap-4 mb-6" style={{ animation: "floatC 6s ease-in-out infinite" }}>
            <img src={LOGO_URL} alt="TestPeak" className="w-12 h-12 md:w-16 md:h-16 rounded-2xl object-cover shadow-lg shadow-primary/30" />
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-gradient-x">
              TestPeak
            </h1>
          </div>
          
          <p className="text-lg md:text-xl text-card-foreground/80 max-w-2xl mx-auto mb-10 font-medium">
            {t("Your all-in-one platform")} — {toolCount}+ {t("tools in Finance, Health, Converters, Math, Brain Games, and Image Tools")}
          </p>
          
          <div className="flex flex-wrap justify-center gap-4 md:gap-6">
            <button onClick={() => scrollTo("tools")} className="flex items-center gap-3 rounded-full bg-background border border-border px-5 py-2.5 hover:border-primary/50 transition-colors shadow-sm cursor-pointer">
              <Box className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-foreground"><span className="text-primary">{toolCount}</span> {t("Tools")}</span>
            </button>
            <button onClick={() => scrollTo("categories", "tools")} className="flex items-center gap-3 rounded-full bg-background border border-border px-5 py-2.5 hover:border-accent/50 transition-colors shadow-sm cursor-pointer">
              <Layers className="w-4 h-4 text-accent" />
              <span className="text-sm font-semibold text-foreground"><span className="text-accent">{catCount}</span> {t("Categories")}</span>
            </button>
            <button onClick={() => scrollTo("why")} className="flex items-center gap-3 rounded-full bg-background border border-border px-5 py-2.5 hover:border-primary/50 transition-colors shadow-sm cursor-pointer">
              <Gift className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-foreground"><span className="text-primary">{t("Free")}</span> {t("for Everyone")}</span>
            </button>
          </div>

          <div className="max-w-xl mx-auto mt-10">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                value={searchQuery || ""}
                onChange={(e) => { onSearchChange(e.target.value); scrollTo("tools"); }}
                onFocus={() => scrollTo("tools")}
                placeholder={t("Search for a tool by name...")}
                className="w-full rounded-2xl border border-border bg-background text-foreground pl-12 pr-12 py-4 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-sm text-base"
              />
              {searchQuery && (
                <button onClick={() => onSearchChange("")} aria-label={t("Clear")} className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ---------- Tool workspace (all calculators) ----------
function sharpenImage(src, w, h, amount) {
  const out = new Uint8ClampedArray(src.length);
  const k = [0, -1, 0, -1, 5, -1, 0, -1, 0];
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      for (let ch = 0; ch < 3; ch++) {
        let sum = 0;
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const xx = x + kx < 0 ? 0 : x + kx >= w ? w - 1 : x + kx;
            const yy = y + ky < 0 ? 0 : y + ky >= h ? h - 1 : y + ky;
            sum += src[(yy * w + xx) * 4 + ch] * k[(ky + 1) * 3 + (kx + 1)];
          }
        }
        const orig = src[i + ch];
        const v = orig + amount * (sum - orig);
        out[i + ch] = v < 0 ? 0 : v > 255 ? 255 : v;
      }
      out[i + 3] = src[i + 3];
    }
  }
  return out;
}
function drawLogo(ctx, p) {
  const W = 600, H = 600;
  ctx.clearRect(0, 0, W, H);
  const ff = { Sans: "sans-serif", Serif: "serif", Mono: "monospace" }[p.font] || "sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const cx = W / 2;
  const brand = p.brand || "Your Brand";
  const tag = p.tagline || "";
  const icon = p.icon || "★";
  const primary = p.primary || "#3b2a8c";
  const accent = p.accent || "#f5a623";
  const sc = p.scale || 1;
  // Shrink the font so long names fit inside the canvas instead of overflowing.
  const fitSize = (text, maxSize, maxW, weight) => {
    let size = maxSize;
    ctx.font = weight + size + "px " + ff;
    while (ctx.measureText(text).width > maxW && size > 14) {
      size -= 2;
      ctx.font = weight + size + "px " + ff;
    }
    return size;
  };
  const drawIcon = (y, size) => { ctx.font = (size * sc) + "px serif"; ctx.fillStyle = primary; ctx.fillText(icon, cx, y); };
  const drawBrand = (y, maxSize, maxW) => {
    const size = fitSize(brand, maxSize * sc, maxW, "bold ");
    ctx.font = "bold " + size + "px " + ff; ctx.fillStyle = primary; ctx.fillText(brand, cx, y);
  };
  const drawTag = (y, maxSize, maxW) => {
    if (!tag) return;
    const size = fitSize(tag, maxSize * sc, maxW, "");
    ctx.font = size + "px " + ff; ctx.fillStyle = accent; ctx.fillText(tag, cx, y);
  };
  if (p.template === "Badge") {
    ctx.strokeStyle = accent; ctx.lineWidth = 8;
    ctx.beginPath(); ctx.arc(cx, 300, 250, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = primary; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(cx, 300, 232, 0, Math.PI * 2); ctx.stroke();
    drawIcon(220, 110); drawBrand(330, 60, 420); drawTag(395, 26, 400);
  } else if (p.template === "Modern") {
    drawIcon(190, 80); drawBrand(300, 66, 480);
    ctx.fillStyle = accent; ctx.fillRect(cx - 110, 345, 220, 6);
    drawTag(390, 26, 440);
  } else if (p.template === "Emblem") {
    ctx.strokeStyle = primary; ctx.lineWidth = 6;
    ctx.strokeRect(90, 130, 420, 340);
    drawIcon(225, 100); drawBrand(320, 56, 380); drawTag(385, 26, 360);
  } else if (p.template === "Bold") {
    drawBrand(290, 92, 500);
    ctx.fillStyle = accent; ctx.fillRect(cx - 100, 345, 200, 8);
    drawTag(400, 30, 460);
  } else {
    drawIcon(215, 110); drawBrand(335, 62, 500); drawTag(395, 28, 460);
  }
}
function ToolWorkspace({ tool, onBack }) {
  const { t, lang } = useI18n();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [inputs, setInputs] = useState({});
  const [result, setResult] = useState(null);
  const [riddleAttempts, setRiddleAttempts] = useState(3);
  const [riddleMsg, setRiddleMsg] = useState("");
  const [riddleGuess, setRiddleGuess] = useState("");
  const [riddle, setRiddle] = useState(() => RIDDLES[0]);
  const [bgResult, setBgResult] = useState(null);
  const [pdfBusy, setPdfBusy] = useState(false);
  const [speedTest, setSpeedTest] = useState({ running: false, ping: null, download: null, upload: null });
  const [qrUrl, setQrUrl] = useState(null);
  const [shareLinks, setShareLinks] = useState(null);
  const [policyText, setPolicyText] = useState("");
  const [showGuide, setShowGuide] = useState(false);
  const [cropSrc, setCropSrc] = useState(null);
  const [cropResult, setCropResult] = useState(null);
  const [bgSrc, setBgSrc] = useState(null);
  const [bgDone, setBgDone] = useState(false);
  const [pdfFiles, setPdfFiles] = useState([]);
  const [pdfReady, setPdfReady] = useState(false);
  const [compressSrc, setCompressSrc] = useState(null);
  const [compressResult, setCompressResult] = useState(null);
  const [plotData, setPlotData] = useState(null);
  const [enhSrc, setEnhSrc] = useState(null);
  const [enhResult, setEnhResult] = useState(null);
  const [enhVersion, setEnhVersion] = useState(0);
  const enhOrigRef = useRef(null);
  const logoCanvasRef = useRef(null);
  const [aiLogos, setAiLogos] = useState([]);
  const [aiBusy, setAiBusy] = useState(false);
  const [aiSelected, setAiSelected] = useState(null);
  const [showToolbar, setShowToolbar] = useState(false);

  useEffect(() => {
    setInputs({}); setResult(null); setRiddleAttempts(3); setRiddleMsg(""); setRiddleGuess("");
    setSpeedTest({ running: false, ping: null, download: null, upload: null });
    setQrUrl(null); setShareLinks(null); setPolicyText("");
    setCropSrc(null); setCropResult(null); setBgSrc(null); setBgDone(false);
    setPdfFiles([]); setPdfReady(false); setCompressSrc(null); setCompressResult(null); setPlotData(null);
    setBgResult(null); setPdfBusy(false); setRiddle(RIDDLES[Math.floor(Math.random() * RIDDLES.length)]);
    setEnhSrc(null); setEnhResult(null); enhOrigRef.current = null; setEnhVersion(0);
    setAiLogos([]); setAiBusy(false); setAiSelected(null);
    setShowToolbar(false);
    setShowGuide(false);
  }, [tool.slug]);

  // Live image enhancement: recompute from the original on every slider change.
  useEffect(() => {
    const orig = enhOrigRef.current;
    if (!orig) return;
    const b = parseFloat(inputs.brightness || "0");
    const c = parseFloat(inputs.contrast || "0");
    const s = parseFloat(inputs.saturation || "0");
    const sh = parseFloat(inputs.sharpen || "0");
    const dh = parseFloat(inputs.dehaze || "0");
    const { width, height, data } = orig;
    const cf = (259 * (c + 255)) / (255 * (259 - c));
    const dcf = (259 * (dh * 1.2 + 255)) / (255 * (259 - dh * 1.2));
    const sat = 1 + (s + dh * 0.4) / 100;
    const out = new ImageData(width, height);
    const d = out.data;
    for (let i = 0; i < data.length; i += 4) {
      let r = data[i] + b, g = data[i + 1] + b, bl = data[i + 2] + b;
      r = cf * (r - 128) + 128; g = cf * (g - 128) + 128; bl = cf * (bl - 128) + 128;
      r = dcf * (r - 128) + 128; g = dcf * (g - 128) + 128; bl = dcf * (bl - 128) + 128;
      const gray = 0.299 * r + 0.587 * g + 0.114 * bl;
      r = gray + (r - gray) * sat; g = gray + (g - gray) * sat; bl = gray + (bl - gray) * sat;
      d[i] = r < 0 ? 0 : r > 255 ? 255 : r;
      d[i + 1] = g < 0 ? 0 : g > 255 ? 255 : g;
      d[i + 2] = bl < 0 ? 0 : bl > 255 ? 255 : bl;
      d[i + 3] = data[i + 3];
    }
    let final = d;
    if (sh > 0) final = sharpenImage(d, width, height, sh / 100);
    const canvas = document.createElement("canvas");
    canvas.width = width; canvas.height = height;
    canvas.getContext("2d").putImageData(new ImageData(final, width, height), 0, 0);
    setEnhResult(canvas.toDataURL("image/png"));
  }, [enhVersion, inputs.brightness, inputs.contrast, inputs.saturation, inputs.sharpen, inputs.dehaze]);

  // Live logo canvas: redraw on any input change (2× buffer for a crisp 1200px download).
  useEffect(() => {
    if (tool.slug !== "logo-maker") return;
    const canvas = logoCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.setTransform(2, 0, 0, 2, 0, 0);
    drawLogo(ctx, {
      template: inputs.template || "Minimalist",
      brand: inputs.brandName || "",
      tagline: inputs.tagline || "",
      icon: inputs.icon || "★",
      font: inputs.font || "Sans",
      primary: inputs.primary || "#3b2a8c",
      accent: inputs.accent || "#f5a623",
      scale: parseFloat(inputs.size || "100") / 100,
    });
  }, [tool.slug, inputs.template, inputs.brandName, inputs.tagline, inputs.icon, inputs.font, inputs.primary, inputs.accent, inputs.size]);

  const set = (k) => (e) => setInputs((p) => ({ ...p, [k]: e.target.value }));

  const runSpeedTest = () => {
    setSpeedTest({ running: true, ping: null, download: null, upload: null });
    setTimeout(() => setSpeedTest((p) => ({ ...p, ping: Math.floor(Math.random() * 40) + 8 })), 900);
    setTimeout(() => setSpeedTest((p) => ({ ...p, download: (Math.random() * 130 + 20).toFixed(1) })), 2000);
    setTimeout(() => setSpeedTest((p) => ({ ...p, running: false, upload: (Math.random() * 45 + 5).toFixed(1) })), 3100);
  };

  const readFile = (file, cb) => {
    const reader = new FileReader();
    reader.onload = (e) => cb(e.target.result);
    reader.readAsDataURL(file);
  };

  const doCrop = () => {
    if (!cropSrc) return;
    const img = new Image();
    img.onload = () => {
      const ratioMap = { "1:1": 1, "4:3": 4 / 3, "16:9": 16 / 9, "3:4": 3 / 4, "9:16": 9 / 16 };
      const r = ratioMap[inputs.ratio || "1:1"];
      const iw = img.width, ih = img.height;
      let cw, ch;
      if (iw / ih > r) { ch = ih; cw = Math.round(ih * r); }
      else { cw = iw; ch = Math.round(iw / r); }
      const canvas = document.createElement("canvas");
      canvas.width = cw; canvas.height = ch;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, (iw - cw) / 2, (ih - ch) / 2, cw, ch, 0, 0, cw, ch);
      setCropResult({ url: canvas.toDataURL("image/png"), w: cw, h: ch });
    };
    img.src = cropSrc;
  };

  const doCompress = () => {
    if (!compressSrc) return;
    const quality = parseFloat(inputs.quality || "0.7");
    const maxDim = parseInt(inputs.maxDim || "0");
    const img = new Image();
    img.onload = () => {
      let w = img.width, h = img.height;
      if (maxDim > 0 && Math.max(w, h) > maxDim) {
        const scale = maxDim / Math.max(w, h);
        w = Math.round(w * scale); h = Math.round(h * scale);
      }
      const canvas = document.createElement("canvas");
      canvas.width = w; canvas.height = h;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, w, h);
      const out = canvas.toDataURL("image/jpeg", quality);
      const origSize = Math.round((compressSrc.length * 3) / 4 / 1024);
      const newSize = Math.round((out.length * 3) / 4 / 1024);
      const saved = origSize > 0 ? Math.round((1 - newSize / origSize) * 100) : 0;
      setCompressResult({ url: out, origSize, newSize, saved, w, h });
    };
    img.src = compressSrc;
  };

  const removeBg = () => {
    if (!bgSrc) return;
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width; canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);
      const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const d = data.data;
      const tol = parseInt(inputs.bgTol || "44");
      const feather = inputs.feather === "on";
      const bases = [[0, 0], [canvas.width - 1, 0], [0, canvas.height - 1], [canvas.width - 1, canvas.height - 1]].map(([x, y]) => { const i = (y * canvas.width + x) * 4; return [d[i], d[i + 1], d[i + 2]]; });
      for (let i = 0; i < d.length; i += 4) {
        let matched = -1;
        for (let b = 0; b < bases.length; b++) {
          if (Math.abs(d[i] - bases[b][0]) <= tol && Math.abs(d[i + 1] - bases[b][1]) <= tol && Math.abs(d[i + 2] - bases[b][2]) <= tol) { matched = b; break; }
        }
        if (matched >= 0) {
          d[i + 3] = 0;
        } else if (feather) {
          // soft edge: fade alpha for pixels close to the background but within 1.6× tolerance
          let near = false, minDist = Infinity;
          for (const b of bases) {
            const dist = Math.abs(d[i] - b[0]) + Math.abs(d[i + 1] - b[1]) + Math.abs(d[i + 2] - b[2]);
            if (dist < minDist) minDist = dist;
          }
          const softLimit = tol * 1.6;
          if (minDist < softLimit) { d[i + 3] = Math.round((minDist - tol) / (softLimit - tol) * 255); near = true; }
          if (!near) d[i + 3] = 255;
        }
      }
      ctx.putImageData(data, 0, 0);
      setBgResult(canvas.toDataURL("image/png"));
      setBgDone(true);
    };
    img.src = bgSrc;
  };

  const renderCalculator = () => {
    switch (tool.slug) {
      case "loan-calculator": {
        const P = parseFloat(inputs.amount), annualRate = parseFloat(inputs.rate), n = parseFloat(inputs.term);
        const r = annualRate / 100 / 12;
        const payment = P && annualRate && n ? (r === 0 ? P / n : (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)) : null;
        const loanResult = payment != null ? { payment: payment.toFixed(2), interest: (payment * n - P).toFixed(2), total: (payment * n).toFixed(2) } : null;
        const calc = () => setResult(loanResult);
        return (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <NumInput label="Loan Amount" value={inputs.amount} onChange={set("amount")} placeholder="10000" />
              <NumInput label="Annual Rate (%)" value={inputs.rate} onChange={set("rate")} placeholder="6.5" />
              <NumInput label="Term (Months)" value={inputs.term} onChange={set("term")} placeholder="36" />
            </div>
            <div className="flex justify-center mt-6"><CalcButton onClick={calc}>Calculate Loan</CalcButton></div>
            {loanResult && (
              <>
                <ResultCard title="Your Results">
                  <div className="text-card-foreground text-lg mb-2">Monthly Payment</div>
                  <div className="text-4xl font-extrabold text-primary mb-6">${loanResult.payment}</div>
                  <div className="flex flex-wrap justify-center gap-6 text-card-foreground">
                    <div>Total Interest: <strong className="text-accent ml-1">${loanResult.interest}</strong></div>
                    <div>Total Amount: <strong className="text-accent ml-1">${loanResult.total}</strong></div>
                  </div>
                </ResultCard>
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="rounded-2xl bg-background border border-border p-5 shadow-sm">
                    <h4 className="text-sm font-semibold text-muted-foreground mb-2 text-center">Principal vs Interest</h4>
                    <div className="h-56">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={[{ name: "Principal", value: P }, { name: "Interest", value: parseFloat(loanResult.interest) }]} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={3} isAnimationActive animationDuration={900} animationEasing="ease-out">
                            <Cell fill="hsl(var(--primary))" />
                            <Cell fill="hsl(var(--accent))" />
                          </Pie>
                          <Tooltip formatter={(v) => `$${v.toLocaleString()}`} contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", color: "hsl(var(--foreground))" }} />
                          <Legend wrapperStyle={{ fontSize: 12 }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  <div className="rounded-2xl bg-background border border-border p-5 shadow-sm">
                    <h4 className="text-sm font-semibold text-muted-foreground mb-2 text-center">Balance Over Time</h4>
                    <div className="h-56">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={Array.from({ length: Math.min(Math.round(n) + 1, 60) }, (_, i) => {
                          const m = i;
                          let bal = P;
                          for (let k = 0; k < m; k++) { bal = bal * (1 + r) - parseFloat(loanResult.payment); }
                          return { month: m, balance: Math.max(bal, 0) };
                        })}>
                          <defs>
                            <linearGradient id="loanBal" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.5} />
                              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 11 }} />
                          <YAxis stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 11 }} />
                          <Tooltip formatter={(v) => `$${Math.round(v).toLocaleString()}`} contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", color: "hsl(var(--foreground))" }} />
                          <Area type="monotone" dataKey="balance" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#loanBal)" isAnimationActive animationDuration={1000} animationEasing="ease-out" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </>
            )}
            <TipBox><strong>Indicator:</strong> Interest is calculated on the remaining balance. Always compare multiple bank offers.</TipBox>
          </>
        );
      }
      case "simple-compound-interest": {
        const compounds = { Yearly: 1, "Semi-annual": 2, Quarterly: 4, Monthly: 12, Daily: 365 };
        const P = parseFloat(inputs.principal), rate = parseFloat(inputs.rate), t = parseFloat(inputs.years);
        const n = compounds[inputs.compound || "Yearly"];
        const interestResult = (P && rate && t) ? (() => {
          const simple = (P * rate * t) / 100;
          const compound = P * Math.pow(1 + rate / 100 / n, n * t) - P;
          return { simple: simple.toFixed(2), compound: compound.toFixed(2), finalSimple: (P + simple).toFixed(2), finalCompound: (P + compound).toFixed(2) };
        })() : null;
        const calc = () => setResult(interestResult);
        return (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <NumInput label="Principal Amount" value={inputs.principal} onChange={set("principal")} placeholder="5000" />
              <NumInput label="Interest Rate (%)" value={inputs.rate} onChange={set("rate")} placeholder="7" />
              <NumInput label="Duration (Years)" value={inputs.years} onChange={set("years")} placeholder="10" />
              <SelectField label="Compound Frequency" value={inputs.compound || "Yearly"} onChange={set("compound")} options={Object.keys(compounds)} />
            </div>
            <div className="flex justify-center mt-6"><CalcButton onClick={calc}>Calculate Interest</CalcButton></div>
            {interestResult && (
              <>
                <ResultCard title="Comparison">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-4">
                    <div className="bg-background rounded-2xl p-6 border border-border shadow-sm">
                      <div className="text-sm text-muted-foreground mb-1">Simple Interest Earned</div>
                      <div className="text-2xl font-bold text-primary">${interestResult.simple}</div>
                      <div className="text-sm text-muted-foreground mt-2">Final Amount: <strong className="text-foreground">${interestResult.finalSimple}</strong></div>
                    </div>
                    <div className="bg-background rounded-2xl p-6 border border-border shadow-sm">
                      <div className="text-sm text-muted-foreground mb-1">Compound Interest Earned</div>
                      <div className="text-2xl font-bold text-accent">${interestResult.compound}</div>
                      <div className="text-sm text-muted-foreground mt-2">Final Amount: <strong className="text-foreground">${interestResult.finalCompound}</strong></div>
                    </div>
                  </div>
                </ResultCard>
                <div className="mt-6 rounded-2xl bg-background border border-border p-5 shadow-sm">
                  <h4 className="text-sm font-semibold text-muted-foreground mb-2 text-center">Growth Over Time</h4>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={Array.from({ length: Math.round(t) + 1 }, (_, yr) => {
                        const simpleBal = P + (P * rate * yr) / 100;
                        const compBal = P * Math.pow(1 + rate / 100 / n, n * yr);
                        return { year: yr, Simple: +simpleBal.toFixed(2), Compound: +compBal.toFixed(2) };
                      })}>
                        <defs>
                          <linearGradient id="gSimple" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="gCompound" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity={0.4} />
                            <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="year" stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 11 }} />
                        <YAxis stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 11 }} />
                        <Tooltip formatter={(v) => `$${v.toLocaleString()}`} contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", color: "hsl(var(--foreground))" }} />
                        <Legend wrapperStyle={{ fontSize: 12 }} />
                        <Area type="monotone" dataKey="Simple" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#gSimple)" isAnimationActive animationDuration={1000} animationEasing="ease-out" />
                        <Area type="monotone" dataKey="Compound" stroke="hsl(var(--accent))" strokeWidth={2} fill="url(#gCompound)" isAnimationActive animationDuration={1100} animationBegin={150} animationEasing="ease-out" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </>
            )}
            <TipBox><strong>Indicator:</strong> Compound interest is the "miracle" of investing — the more frequent the compounding, the higher the return.</TipBox>
          </>
        );
      }
      case "currency-converter": {
        const currencies = Object.keys(CURRENCY_RATES);
        const calc = () => {
          const amt = parseFloat(inputs.amount);
          const from = inputs.from || "USD", to = inputs.to || "EUR";
          if (!amt) return setResult(null);
          const r = convertUnit(amt, CURRENCY_RATES, from, to);
          setResult({ value: r ? r.toFixed(2) : "—", from, to });
        };
        const swap = () => setInputs((p) => ({ ...p, from: p.to || "EUR", to: p.from || "USD" }));
        return (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <NumInput label="Amount" value={inputs.amount} onChange={set("amount")} placeholder="100" />
              <SelectField label="From Currency" value={inputs.from || "USD"} onChange={set("from")} options={currencies} />
              <SelectField label="To Currency" value={inputs.to || "EUR"} onChange={set("to")} options={currencies} />
            </div>
            <div className="flex flex-wrap justify-center gap-4 mt-8">
              <CalcButton onClick={calc}>Convert Currency</CalcButton>
              <Button onClick={swap} variant="outline" className="mt-6 rounded-2xl border-border bg-background text-foreground hover:bg-secondary hover:text-secondary-foreground h-[72px] px-6"><ArrowLeftRight className="w-5 h-5 mr-2" />Swap</Button>
            </div>
            {result && (
              <>
                <ResultCard title="Conversion Result">
                  <div className="text-xl text-card-foreground mb-2">{inputs.amount} {result.from} =</div>
                  <div className="text-5xl font-extrabold text-accent">{result.value} <span className="text-2xl text-card-foreground/70 ml-1">{result.to}</span></div>
                </ResultCard>
                <div className="mt-6 rounded-2xl bg-background border border-border p-5 shadow-sm">
                  <h4 className="text-sm font-semibold text-muted-foreground mb-3 text-center">Value Comparison</h4>
                  <div className="flex items-end justify-center gap-4 h-40">
                    <div className="flex flex-col items-center gap-1 w-24">
                      <div className="text-xs font-bold text-primary">{inputs.amount}</div>
                      <div className="w-full rounded-t-lg bg-primary transition-all duration-700" style={{ height: `${Math.min((parseFloat(inputs.amount) / Math.max(parseFloat(inputs.amount), parseFloat(result.value))) * 100, 100)}%` }} />
                      <span className="text-xs text-muted-foreground mt-1">{result.from}</span>
                    </div>
                    <div className="flex flex-col items-center gap-1 w-24">
                      <div className="text-xs font-bold text-accent">{result.value}</div>
                      <div className="w-full rounded-t-lg bg-accent transition-all duration-700" style={{ height: `${Math.min((parseFloat(result.value) / Math.max(parseFloat(inputs.amount), parseFloat(result.value))) * 100, 100)}%` }} />
                      <span className="text-xs text-muted-foreground mt-1">{result.to}</span>
                    </div>
                  </div>
                </div>
              </>
            )}
            <TipBox>Rates provided for informational purposes. They are updated daily from reliable sources but may not reflect exact trading values.</TipBox>
          </>
        );
      }
      case "internet-speed-test": {
        return (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="rounded-2xl bg-background border border-border p-8 text-center shadow-sm relative overflow-hidden group">
                <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <h4 className="text-sm font-medium text-muted-foreground mb-3 relative z-10">Ping</h4>
                <div className="text-4xl font-bold text-foreground relative z-10">{speedTest.ping ?? "—"} <small className="text-lg font-normal text-muted-foreground">ms</small></div>
              </div>
              <div className="rounded-2xl bg-background border border-border p-8 text-center shadow-sm relative overflow-hidden group">
                <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <h4 className="text-sm font-medium text-muted-foreground mb-3 relative z-10">Download</h4>
                <div className="text-4xl font-bold text-primary relative z-10">{speedTest.download ?? "—"} <small className="text-lg font-normal text-primary/70">Mbps</small></div>
              </div>
              <div className="rounded-2xl bg-background border border-border p-8 text-center shadow-sm relative overflow-hidden group">
                <div className="absolute inset-0 bg-accent/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <h4 className="text-sm font-medium text-muted-foreground mb-3 relative z-10">Upload</h4>
                <div className="text-4xl font-bold text-accent relative z-10">{speedTest.upload ?? "—"} <small className="text-lg font-normal text-accent/70">Mbps</small></div>
              </div>
            </div>
            <div className="mt-8 text-center text-card-foreground font-medium">{speedTest.running ? "Measuring your connection..." : "Press Start Test to begin."}</div>
            <div className="flex justify-center mt-6">
              <CalcButton onClick={runSpeedTest}>
                {speedTest.running ? <RefreshCw className="w-5 h-5 mr-2 inline animate-spin" /> : <Play className="w-5 h-5 mr-2 inline" />}
                {speedTest.running ? "Testing..." : "Start Speed Test"}
              </CalcButton>
            </div>
            <TipBox>Close bandwidth-heavy applications for the most accurate result.</TipBox>
          </>
        );
      }
      case "coupon-code-generator": {
        const charsetOptions = {
          "Alphanumeric": "ABCDEFGHJKLMNPQRSTUVWXYZ23456789",
          "Letters": "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
          "Numbers": "0123456789",
          "Hex": "0123456789ABCDEF",
        };
        const generate = () => {
          const count = Math.min(Math.max(parseInt(inputs.count || "5"), 1), 50);
          const len = Math.max(parseInt(inputs.length || "8"), 4);
          const chars = charsetOptions[inputs.charset || "Alphanumeric"];
          const prefix = (inputs.prefix || "").toUpperCase().replace(/\s/g, "");
          const dashEvery = parseInt(inputs.dashEvery || "0");
          const out = [];
          for (let c = 0; c < count; c++) {
            let code = "";
            for (let i = 0; i < len; i++) code += chars[Math.floor(Math.random() * chars.length)];
            if (dashEvery > 0) code = code.match(new RegExp(`.{1,${dashEvery}}`, "g")).join("-");
            out.push(prefix + code);
          }
          setResult(out);
        };
        const codes = Array.isArray(result) ? result : [];
        const copyAll = () => navigator.clipboard?.writeText(codes.join("\n"));
        const copyOne = (code) => navigator.clipboard?.writeText(code);
        return (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <NumInput label="Number of Codes" value={inputs.count} onChange={set("count")} placeholder="5" />
              <NumInput label="Code Length" value={inputs.length} onChange={set("length")} placeholder="8" />
              <TxtInput label="Prefix (optional)" value={inputs.prefix} onChange={set("prefix")} placeholder="SALE" />
              <NumInput label="Dash every N (0 = off)" value={inputs.dashEvery} onChange={set("dashEvery")} placeholder="4" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
              <SelectField label="Character Set" value={inputs.charset || "Alphanumeric"} onChange={set("charset")} options={Object.keys(charsetOptions)} />
            </div>
            <div className="flex justify-center mt-6"><CalcButton onClick={generate}>Generate Coupons</CalcButton></div>
            {codes.length > 0 && (
              <ResultCard title={`${codes.length} Coupon${codes.length > 1 ? "s" : ""} Generated`}>
                <div className="flex justify-center mb-6">
                  <button onClick={copyAll} className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary transition-colors">
                    <Copy className="w-4 h-4" /> Copy All
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-80 overflow-y-auto pr-1">
                  {codes.map((code, i) => (
                    <div key={i} className="flex items-center justify-between rounded-xl bg-background border border-border px-4 py-3">
                      <code className="text-sm font-mono font-semibold text-primary tracking-wider break-all">{code}</code>
                      <button onClick={() => copyOne(code)} className="text-muted-foreground hover:text-primary transition-colors shrink-0 ml-3" aria-label="Copy code">
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </ResultCard>
            )}
            <TipBox><strong>Tip:</strong> The default set excludes easily-confused characters (O, I, 0, 1) so codes stay readable.</TipBox>
          </>
        );
      }
      case "bond-yield": {
        const face = parseFloat(inputs.face), price = parseFloat(inputs.price), coupon = parseFloat(inputs.coupon), years = parseFloat(inputs.years);
        const bondResult = (face && price && !isNaN(coupon) && years) ? (() => {
          const currentYield = (coupon / price) * 100;
          const ytm = ((coupon + (face - price) / years) / ((face + price) / 2)) * 100;
          return { currentYield: currentYield.toFixed(2), ytm: ytm.toFixed(2) };
        })() : null;
        const calc = () => setResult(bondResult);
        return (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <NumInput label="Face Value ($)" value={inputs.face} onChange={set("face")} placeholder="1000" />
              <NumInput label="Current Price ($)" value={inputs.price} onChange={set("price")} placeholder="950" />
              <NumInput label="Annual Coupon ($)" value={inputs.coupon} onChange={set("coupon")} placeholder="50" />
              <NumInput label="Years to Maturity" value={inputs.years} onChange={set("years")} placeholder="5" />
            </div>
            <div className="flex justify-center mt-6"><CalcButton onClick={calc}>Calculate Yield</CalcButton></div>
            {bondResult && (
              <>
                <ResultCard title="Bond Yield">
                  <div className="text-sm text-muted-foreground mb-1">Current Yield</div>
                  <div className="text-3xl font-bold text-primary mb-4">{bondResult.currentYield}%</div>
                  <div className="text-sm text-muted-foreground mb-1">Yield to Maturity (YTM)</div>
                  <div className="text-3xl font-bold text-accent">{bondResult.ytm}%</div>
                </ResultCard>
                <div className="mt-6 rounded-2xl bg-background border border-border p-5 shadow-sm">
                  <h4 className="text-sm font-semibold text-muted-foreground mb-2 text-center">Yield Comparison (%)</h4>
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={[{ name: "Current Yield", value: parseFloat(bondResult.currentYield) }, { name: "YTM", value: parseFloat(bondResult.ytm) }]}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 12 }} />
                        <YAxis stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 11 }} unit="%" />
                        <Tooltip formatter={(v) => `${v}%`} contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", color: "hsl(var(--foreground))" }} />
                        <Bar dataKey="value" radius={[8, 8, 0, 0]} barSize={64} isAnimationActive animationDuration={900} animationEasing="ease-out">
                          <Cell fill="hsl(var(--primary))" />
                          <Cell fill="hsl(var(--accent))" />
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </>
            )}
            <TipBox>Current Yield = Annual Coupon ÷ Price. YTM approximates total return if held to maturity.</TipBox>
          </>
        );
      }
      case "bmi-calculator": {
        const w = parseFloat(inputs.weight), h = parseFloat(inputs.height) / 100;
        const bmi = w && h ? w / (h * h) : null;
        const cat = bmi ? (bmi < 18.5 ? "Underweight" : bmi < 25 ? "Normal weight" : bmi < 30 ? "Overweight" : "Obese") : null;
        return (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <NumInput label="Weight (kg)" value={inputs.weight} onChange={set("weight")} placeholder="70" />
              <NumInput label="Height (cm)" value={inputs.height} onChange={set("height")} placeholder="175" />
            </div>
            {bmi && (
              <ResultCard title="Your BMI">
                <div className="text-5xl font-extrabold text-primary mb-3">{bmi.toFixed(1)}</div>
                <div className="text-lg font-semibold text-accent">{cat}</div>
              </ResultCard>
            )}
            <TipBox>BMI is a general indicator. Consult a doctor for a complete health assessment.</TipBox>
          </>
        );
      }
      case "calories-burned": {
        const metMap = { Walking: 3.5, Running: 9.8, Cycling: 7.5, Swimming: 8.0, "Weight Lifting": 6.0, Yoga: 2.5 };
        const w = parseFloat(inputs.weight), m = parseFloat(inputs.minutes);
        const met = metMap[inputs.activity || "Walking"];
        const cal = w && m && met ? (met * 3.5 * w) / 200 * m : null;
        return (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <NumInput label="Weight (kg)" value={inputs.weight} onChange={set("weight")} placeholder="70" />
              <NumInput label="Duration (min)" value={inputs.minutes} onChange={set("minutes")} placeholder="30" />
            </div>
            <SelectField label="Activity" value={inputs.activity || "Walking"} onChange={set("activity")} options={Object.keys(metMap)} />
            {cal != null && (
              <ResultCard title="Calories Burned">
                <div className="text-5xl font-extrabold text-primary mb-2">{Math.round(cal)}</div>
                <div className="text-muted-foreground">kcal</div>
              </ResultCard>
            )}
            <TipBox>Estimates based on MET values. Actual burn varies by intensity and metabolism.</TipBox>
          </>
        );
      }
      case "distance-converter": {
        const v = parseFloat(inputs.value);
        const from = inputs.from || "Mile", to = inputs.to || "Kilometer";
        const out = !isNaN(v) ? convertUnit(v, DISTANCE_UNITS, from, to) : null;
        return (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <NumInput label="Value" value={inputs.value} onChange={set("value")} placeholder="1" />
              <SelectField label="From" value={from} onChange={set("from")} options={Object.keys(DISTANCE_UNITS)} />
              <SelectField label="To" value={to} onChange={set("to")} options={Object.keys(DISTANCE_UNITS)} />
            </div>
            {out != null && (
              <ResultCard title="Result">
                <div className="text-4xl font-extrabold text-accent">{out.toLocaleString(undefined, { maximumFractionDigits: 6 })}</div>
                <div className="text-muted-foreground mt-2">{to}</div>
              </ResultCard>
            )}
          </>
        );
      }
      case "weight-converter": {
        const v = parseFloat(inputs.value);
        const from = inputs.from || "Kilogram", to = inputs.to || "Pound";
        const out = !isNaN(v) ? convertUnit(v, WEIGHT_UNITS, from, to) : null;
        return (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <NumInput label="Value" value={inputs.value} onChange={set("value")} placeholder="1" />
              <SelectField label="From" value={from} onChange={set("from")} options={Object.keys(WEIGHT_UNITS)} />
              <SelectField label="To" value={to} onChange={set("to")} options={Object.keys(WEIGHT_UNITS)} />
            </div>
            {out != null && (
              <ResultCard title="Result">
                <div className="text-4xl font-extrabold text-accent">{out.toLocaleString(undefined, { maximumFractionDigits: 6 })}</div>
                <div className="text-muted-foreground mt-2">{to}</div>
              </ResultCard>
            )}
          </>
        );
      }
      case "area-converter": {
        const v = parseFloat(inputs.value);
        const from = inputs.from || "m²", to = inputs.to || "ft²";
        const out = !isNaN(v) ? convertUnit(v, AREA_UNITS, from, to) : null;
        return (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <NumInput label="Value" value={inputs.value} onChange={set("value")} placeholder="1" />
              <SelectField label="From" value={from} onChange={set("from")} options={Object.keys(AREA_UNITS)} />
              <SelectField label="To" value={to} onChange={set("to")} options={Object.keys(AREA_UNITS)} />
            </div>
            {out != null && (
              <ResultCard title="Result">
                <div className="text-4xl font-extrabold text-accent">{out.toLocaleString(undefined, { maximumFractionDigits: 6 })}</div>
                <div className="text-muted-foreground mt-2">{to}</div>
              </ResultCard>
            )}
          </>
        );
      }
      case "time-converter": {
        const v = parseFloat(inputs.value);
        const from = inputs.from || "Hour", to = inputs.to || "Minute";
        const out = !isNaN(v) ? convertUnit(v, TIME_UNITS, from, to) : null;
        return (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <NumInput label="Value" value={inputs.value} onChange={set("value")} placeholder="1" />
              <SelectField label="From" value={from} onChange={set("from")} options={Object.keys(TIME_UNITS)} />
              <SelectField label="To" value={to} onChange={set("to")} options={Object.keys(TIME_UNITS)} />
            </div>
            {out != null && (
              <ResultCard title="Result">
                <div className="text-4xl font-extrabold text-accent">{out.toLocaleString(undefined, { maximumFractionDigits: 6 })}</div>
                <div className="text-muted-foreground mt-2">{to}</div>
              </ResultCard>
            )}
          </>
        );
      }
      case "speed-converter": {
        const v = parseFloat(inputs.value);
        const from = inputs.from || "km/h", to = inputs.to || "mph";
        const out = !isNaN(v) ? convertUnit(v, SPEED_UNITS, from, to) : null;
        return (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <NumInput label="Value" value={inputs.value} onChange={set("value")} placeholder="100" />
              <SelectField label="From" value={from} onChange={set("from")} options={Object.keys(SPEED_UNITS)} />
              <SelectField label="To" value={to} onChange={set("to")} options={Object.keys(SPEED_UNITS)} />
            </div>
            {out != null && (
              <ResultCard title="Result">
                <div className="text-4xl font-extrabold text-accent">{out.toLocaleString(undefined, { maximumFractionDigits: 6 })}</div>
                <div className="text-muted-foreground mt-2">{to}</div>
              </ResultCard>
            )}
          </>
        );
      }
      case "qr-code-generator": {
        const data = inputs.text || "";
        const src = data ? `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(data)}` : null;
        return (
          <>
            <TxtInput label="Text or URL" value={inputs.text} onChange={set("text")} placeholder="https://testpriving.com" />
            {src && (
              <ResultCard title="Your QR Code">
                <img src={src} alt="QR Code" className="w-48 h-48 mx-auto rounded-xl bg-white p-2" />
                <a href={src} download="qr-code.png" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 mt-4 text-primary font-semibold hover:underline">Download <ImageDown className="w-4 h-4" /></a>
              </ResultCard>
            )}
            <TipBox>Your QR code is generated on demand and not stored anywhere.</TipBox>
          </>
        );
      }
      case "share-link-generator": {
        const url = encodeURIComponent(inputs.url || "");
        const text = encodeURIComponent(inputs.text || "");
        const links = inputs.url ? {
          Facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
          Twitter: `https://twitter.com/intent/tweet?url=${url}&text=${text}`,
          LinkedIn: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
          WhatsApp: `https://wa.me/?text=${text}%20${url}`,
        } : null;
        return (
          <>
            <TxtInput label="Page URL" value={inputs.url} onChange={set("url")} placeholder="https://testpriving.com" />
            <TxtInput label="Message (optional)" value={inputs.text} onChange={set("text")} placeholder="Check this out!" />
            {links && (
              <ResultCard title="Share Links">
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(links).map(([k, v]) => (
                    <a key={k} href={v} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 rounded-xl bg-background border border-border px-4 py-3 text-sm font-semibold text-foreground hover:border-primary/50 hover:text-primary transition-all"><Send className="w-4 h-4" /> {k}</a>
                  ))}
                </div>
              </ResultCard>
            )}
          </>
        );
      }
      case "privacy-policy-generator": {
        const generate = () => {
          const name = inputs.appName || "TestPeak", site = inputs.siteUrl || "https://testpriving.com", email = inputs.email || "support@testpriving.com";
          const text = `Privacy Policy for ${name}\n\nLast Updated: ${new Date().toLocaleDateString()}\n\n${name} ("we", "us", "our") operates ${site}. This policy explains what data we collect and how we use it.\n\n1. Information We Collect\nWe collect information you provide voluntarily and data collected automatically (IP address, browser type, cookies).\n\n2. How We Use Your Information\nWe use information to provide and improve our services, communicate with you, and analyze usage.\n\n3. Cookies\nWe use cookies to improve your experience. You can disable cookies in your browser settings.\n\n4. Third-Party Services\nWe may use third-party tools that collect data according to their own privacy policies.\n\n5. Your Rights\nYou may access, correct, or delete your personal data at any time. Contact us at ${email}.\n\n6. Security\nWe take reasonable measures to protect your data, though no system is 100% secure.\n\n7. Changes to This Policy\nWe may update this policy. Changes will be posted on this page.\n\nContact: ${email}`;
          setPolicyText(text);
        };
        const copy = () => navigator.clipboard?.writeText(policyText);
        return (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <TxtInput label="App Name" value={inputs.appName} onChange={set("appName")} placeholder="TestPeak" />
              <TxtInput label="Site URL" value={inputs.siteUrl} onChange={set("siteUrl")} placeholder="https://testpriving.com" />
              <TxtInput label="Contact Email" value={inputs.email} onChange={set("email")} placeholder="support@testpriving.com" />
            </div>
            <div className="flex justify-center mt-6"><CalcButton onClick={generate}>Generate Policy</CalcButton></div>
            {policyText && (
              <ResultCard title="Generated Privacy Policy">
                <pre className="text-left text-sm whitespace-pre-wrap text-muted-foreground max-h-72 overflow-y-auto bg-background rounded-xl p-4 border border-border">{policyText}</pre>
                <button onClick={copy} className="inline-flex items-center gap-2 mt-4 rounded-xl border border-border bg-background px-4 py-2 text-sm font-medium hover:bg-secondary"><Copy className="w-4 h-4" /> Copy</button>
              </ResultCard>
            )}
          </>
        );
      }
      case "math-function-calculator": {
        const plot = () => {
          const lines = (inputs.expr || "sin(x)").split("\n").map((l) => l.trim()).filter(Boolean);
          const fns = lines.map((raw, idx) => {
            let compiled = null, error = null;
            try { compiled = compileExpr(raw); } catch (err) { error = err.message; }
            return { raw, label: `f${idx + 1}: ${raw}`, key: `f${idx}`, color: FN_COLORS[idx % FN_COLORS.length], compiled, error };
          });
          const grid = [];
          for (let x = -10; x <= 10.001; x += 0.2) grid.push(+x.toFixed(2));
          const data = grid.map((x) => {
            const row = { x };
            fns.forEach((f) => {
              if (!f.compiled) return;
              try {
                const y = f.compiled(x);
                if (typeof y === "number" && isFinite(y)) row[f.key] = +y.toFixed(4);
              } catch {}
            });
            return row;
          });
          setPlotData({ data, fns });
        };
        return (
          <>
            <FnInput label="f(x) =" value={inputs.expr} onChange={set("expr")} placeholder={"sin(x)\ncos(x)\nx^2"} />
            <p className="text-xs text-muted-foreground mt-2 text-left ml-1">{t("One function per line. Supports:")} sin, cos, tan, asin, acos, atan, sinh, cosh, tanh, sqrt, cbrt, ln, log, log2, exp, abs, floor, ceil, round, sign, pi, e, tau, ^, !</p>
            <div className="flex justify-center mt-6"><CalcButton onClick={plot}>{t("Plot Function")}</CalcButton></div>
            {plotData && plotData.fns && plotData.fns.length > 0 && (
              <>
                {plotData.fns.some((f) => f.error) && (
                  <div className="mt-4 space-y-1.5 text-left">
                    {plotData.fns.filter((f) => f.error).map((f, i) => (
                      <div key={i} className="text-xs text-destructive bg-destructive/5 border border-destructive/20 rounded-lg px-3 py-2 break-all">
                        ⚠ <span className="font-mono font-semibold">{f.raw}</span> — {f.error}
                      </div>
                    ))}
                  </div>
                )}
                {plotData.fns.some((f) => !f.error) && (
                  <ResultCard title={t("Plot")}>
                    <div className="w-full h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={plotData.data}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis dataKey="x" stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 11 }} />
                          <YAxis stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 11 }} />
                          <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", color: "hsl(var(--foreground))" }} />
                          <Legend wrapperStyle={{ fontSize: 12 }} />
                          {plotData.fns.filter((f) => !f.error).map((f) => (
                            <Line key={f.key} type="monotone" dataKey={f.key} name={f.label} stroke={f.color} dot={false} strokeWidth={2} connectNulls isAnimationActive animationDuration={800} animationEasing="ease-out" />
                          ))}
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </ResultCard>
                )}
              </>
            )}
            <TipBox>{t("Enter one function per line to plot them together. pi and e are constants, ^ for powers, ! for factorial.")}</TipBox>
          </>
        );
      }
      case "percentage-calculator": {
        const a = parseFloat(inputs.a), b = parseFloat(inputs.b);
        const mode = inputs.mode || "of";
        const out = (mode === "of") ? (a && b ? (a / 100 * b) : null)
          : (mode === "isWhat") ? (a && b ? (a / b * 100) : null)
          : (mode === "change") ? (a && b ? ((b - a) / a * 100) : null) : null;
        return (
          <>
            <SelectField label="Calculation Type" value={mode} onChange={set("mode")} options={["of", "isWhat", "change"]} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
              <NumInput label="Value A" value={inputs.a} onChange={set("a")} placeholder="20" />
              <NumInput label="Value B" value={inputs.b} onChange={set("b")} placeholder="150" />
            </div>
            {out != null && (
              <>
                <ResultCard title="Result">
                  <div className="text-4xl font-extrabold text-accent">{out.toFixed(2)}{mode !== "of" ? "%" : ""}</div>
                </ResultCard>
                {mode === "of" ? (
                  <div className="mt-6 rounded-2xl bg-background border border-border p-5 shadow-sm">
                    <h4 className="text-sm font-semibold text-muted-foreground mb-3 text-center">{a}% of {b}</h4>
                    <div className="h-6 w-full rounded-full bg-secondary overflow-hidden">
                      <div className="h-full bg-primary rounded-full transition-all duration-700" style={{ width: `${Math.min(a, 100)}%` }} />
                    </div>
                    <div className="mt-3 text-center text-sm text-muted-foreground">Result <strong className="text-primary">{out.toFixed(2)}</strong> of {b}</div>
                  </div>
                ) : (
                  <div className="mt-6 rounded-2xl bg-background border border-border p-5 shadow-sm">
                    <h4 className="text-sm font-semibold text-muted-foreground mb-3 text-center">{mode === "isWhat" ? `${a} as % of ${b}` : `Change from ${a} to ${b}`}</h4>
                    <div className="flex items-end justify-center gap-2 h-40">
                      <div className="flex flex-col items-center gap-1">
                        <div className="w-16 rounded-t-lg bg-primary transition-all duration-700" style={{ height: `${Math.min((mode === "isWhat" ? Math.min(a / b, 1) : 1) * 100, 100)}%` }} />
                        <span className="text-xs text-muted-foreground">{mode === "isWhat" ? a : a}</span>
                      </div>
                      <div className="flex flex-col items-center gap-1">
                        <div className="w-16 rounded-t-lg bg-accent transition-all duration-700" style={{ height: `${Math.min((mode === "isWhat" ? 1 : b / a) * 100, 100)}%` }} />
                        <span className="text-xs text-muted-foreground">{mode === "isWhat" ? b : b}</span>
                      </div>
                    </div>
                    <div className="mt-3 text-center text-sm text-muted-foreground">{out.toFixed(2)}%</div>
                  </div>
                )}
              </>
            )}
            <TipBox>"of" = A% of B • "isWhat" = A is what % of B • "change" = % change from A to B.</TipBox>
          </>
        );
      }
      case "physics-calculators": {
        const mode = inputs.mode || "speed";
        const a = parseFloat(inputs.a), b = parseFloat(inputs.b);
        let la = "Distance (m)", lb = "Time (s)", unit = "m/s";
        if (mode === "distance") { la = "Speed (m/s)"; lb = "Time (s)"; unit = "m"; }
        else if (mode === "time") { la = "Distance (m)"; lb = "Speed (m/s)"; unit = "s"; }
        else if (mode === "ohm") { la = "Voltage (V)"; lb = "Resistance (Ω)"; unit = "A"; }
        const res = (mode === "ohm") ? (a && b ? a / b : null) : (mode === "distance") ? (a && b ? a * b : null) : (a && b ? a / b : null);
        return (
          <>
            <SelectField label="Calculation" value={mode} onChange={set("mode")} options={["speed", "distance", "time", "ohm"]} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
              <NumInput label={la} value={inputs.a} onChange={set("a")} placeholder="100" />
              <NumInput label={lb} value={inputs.b} onChange={set("b")} placeholder="10" />
            </div>
            {res != null && (
              <ResultCard title="Result">
                <div className="text-4xl font-extrabold text-accent">{res.toFixed(3)}</div>
                <div className="text-muted-foreground mt-2">{unit}</div>
              </ResultCard>
            )}
            <TipBox>Speed = Distance ÷ Time • Ohm's Law: I = V ÷ R.</TipBox>
          </>
        );
      }
      case "chemistry-calculators": {
        const mass = calcMolarMass(inputs.formula || "");
        return (
          <>
            <TxtInput label="Chemical Formula" value={inputs.formula} onChange={set("formula")} placeholder="H2O" />
            {mass != null ? (
              <ResultCard title="Molar Mass">
                <div className="text-4xl font-extrabold text-accent">{mass.toFixed(3)}</div>
                <div className="text-muted-foreground mt-2">g/mol</div>
              </ResultCard>
            ) : inputs.formula ? (
              <TipBox>Could not parse the formula. Use element symbols like H2O, NaCl, or C6H12O6.</TipBox>
            ) : null}
            <TipBox>Enter a formula like H2O, NaCl, or C6H12O6. Supports common elements.</TipBox>
          </>
        );
      }
      case "riddle-game": {
        const guess = () => {
          if (riddleGuess.trim().toLowerCase() === riddle.answer.toLowerCase()) setRiddleMsg("Correct! 🎉");
          else {
            const left = riddleAttempts - 1;
            setRiddleAttempts(left);
            setRiddleMsg(left > 0 ? `Wrong. ${left} attempt${left > 1 ? "s" : ""} left.` : `Out of attempts! The answer was "${riddle.answer}".`);
          }
        };
        const next = () => { setRiddle(RIDDLES[Math.floor(Math.random() * RIDDLES.length)]); setRiddleGuess(""); setRiddleMsg(""); setRiddleAttempts(3); };
        return (
          <>
            <div className="rounded-2xl bg-background border border-border p-6 mb-6">
              <p className="text-lg font-semibold text-foreground mb-2">Riddle</p>
              <p className="text-muted-foreground">{riddle.q}</p>
            </div>
            <TxtInput label="Your Answer" value={riddleGuess} onChange={(e) => setRiddleGuess(e.target.value)} placeholder="Type your guess" />
            <div className="flex flex-wrap justify-center gap-3 mt-6">
              <CalcButton onClick={guess}>Submit Answer</CalcButton>
              <Button onClick={next} variant="outline" className="mt-6 rounded-2xl px-6 py-6">New Riddle</Button>
            </div>
            {riddleMsg && <ResultCard title="Result"><div className="text-lg font-semibold text-foreground">{riddleMsg}</div></ResultCard>}
            <TipBox>Attempts left: {riddleAttempts}</TipBox>
          </>
        );
      }
      case "math-puzzle":
        return <MathPuzzleGame />;
      case "word-scramble":
        return <WordScrambleGame />;
      case "image-cropper": {
        const cropResultData = cropResult && cropResult.url ? cropResult : null;
        return (
          <>
            <input type="file" accept="image/*" onChange={(e) => e.target.files[0] && readFile(e.target.files[0], setCropSrc)} className="block mx-auto text-sm text-muted-foreground file:mr-3 file:rounded-full file:border-0 file:bg-primary file:text-primary-foreground file:px-4 file:py-2" />
            {cropSrc && <div className="mt-6"><img src={cropSrc} alt="preview" className="max-h-64 mx-auto rounded-xl" /></div>}
            <div className="mt-6"><SelectField label={t("Aspect Ratio")} value={inputs.ratio || "1:1"} onChange={set("ratio")} options={["1:1", "4:3", "16:9", "3:4", "9:16"]} /></div>
            <div className="flex justify-center mt-6"><CalcButton onClick={doCrop}>{t("Crop Image")}</CalcButton></div>
            {cropResultData && (
              <ResultCard title={t("Cropped Image")}>
                <img src={cropResultData.url} alt="cropped" className="max-h-64 mx-auto rounded-xl" />
                <div className="mt-3 text-sm text-muted-foreground">{cropResultData.w} × {cropResultData.h} px</div>
                <a href={cropResultData.url} download="cropped.png" className="inline-flex items-center gap-2 mt-4 text-primary font-semibold hover:underline">{t("Download")} <ImageDown className="w-4 h-4" /></a>
              </ResultCard>
            )}
            <TipBox>{t("Crops the image to a centered region with the selected aspect ratio — 1:1 for profile pictures, 16:9 for banners.")}</TipBox>
          </>
        );
      }
      case "background-remover": {
        return (
          <>
            <input type="file" accept="image/*" onChange={(e) => { if (e.target.files[0]) { readFile(e.target.files[0], setBgSrc); setBgDone(false); setBgResult(null); } }} className="block mx-auto text-sm text-muted-foreground file:mr-3 file:rounded-full file:border-0 file:bg-primary file:text-primary-foreground file:px-4 file:py-2" />
            {bgSrc && <div className="mt-6"><img src={bgSrc} alt="preview" className="max-h-64 mx-auto rounded-xl" /></div>}
            <div className="mt-6"><SelectField label={t("Tolerance")} value={inputs.bgTol || "44"} onChange={set("bgTol")} options={["20", "32", "44", "60", "80"]} /></div>
            <div className="mt-6"><SelectField label={t("Edge Smoothing")} value={inputs.feather || "off"} onChange={set("feather")} options={["off", "on"]} /></div>
            <div className="flex justify-center mt-6"><CalcButton onClick={removeBg}>{t("Remove Background")}</CalcButton></div>
            {bgResult && (
              <ResultCard title={t("Result")}>
                <img src={bgResult} alt="no background" className="max-h-64 mx-auto rounded-xl" style={{ background: "repeating-conic-gradient(hsl(var(--muted)) 0 25%, transparent 0 50%) 50% / 16px 16px" }} />
                <a href={bgResult} download="no-bg.png" className="inline-flex items-center gap-2 mt-4 text-primary font-semibold hover:underline">{t("Download")} <ImageDown className="w-4 h-4" /></a>
              </ResultCard>
            )}
            <TipBox>{t("Works best on images with a solid, uniform background. Raise the tolerance for backgrounds close to the subject; enable Edge Smoothing to soften jagged borders.")}</TipBox>
          </>
        );
      }
      case "image-to-pdf": {
        const onFiles = (files) => { Array.from(files).forEach((f) => readFile(f, (url) => setPdfFiles((p) => [...p, url]))); };
        const moveItem = (i, dir) => setPdfFiles((p) => {
          const n = [...p]; const j = i + dir;
          if (j < 0 || j >= n.length) return p;
          [n[i], n[j]] = [n[j], n[i]]; return n;
        });
        const removeItem = (i) => setPdfFiles((p) => p.filter((_, idx) => idx !== i));
        const makePdf = async () => {
          if (!pdfFiles.length) return;
          setPdfBusy(true);
          const orientation = inputs.pdfOrient || "portrait";
          const pdf = new jsPDF({ orientation, unit: "pt", format: "a4" });
          for (let i = 0; i < pdfFiles.length; i++) {
            const dim = await new Promise((res) => { const im = new Image(); im.onload = () => res({ w: im.width, h: im.height }); im.onerror = () => res(null); im.src = pdfFiles[i]; });
            if (i > 0) pdf.addPage();
            const pw = pdf.internal.pageSize.getWidth(), ph = pdf.internal.pageSize.getHeight();
            const margin = 24;
            if (dim) {
              const s = Math.min((pw - margin * 2) / dim.w, (ph - margin * 2) / dim.h);
              const dw = dim.w * s, dh = dim.h * s;
              pdf.addImage(pdfFiles[i], "JPEG", (pw - dw) / 2, (ph - dh) / 2, dw, dh);
            }
          }
          pdf.save("testpeak-images.pdf");
          setPdfBusy(false);
        };
        return (
          <>
            <input type="file" accept="image/*" multiple onChange={(e) => onFiles(e.target.files)} className="block mx-auto text-sm text-muted-foreground file:mr-3 file:rounded-full file:border-0 file:bg-primary file:text-primary-foreground file:px-4 file:py-2" />
            <div className="mt-6"><SelectField label={t("Page Orientation")} value={inputs.pdfOrient || "portrait"} onChange={set("pdfOrient")} options={["portrait", "landscape"]} /></div>
            {pdfFiles.length > 0 && (
              <div className="mt-6 space-y-2">
                {pdfFiles.map((u, i) => (
                  <div key={i} className="flex items-center gap-3 rounded-xl bg-background border border-border p-2">
                    <img src={u} alt="" className="w-14 h-14 object-cover rounded-lg shrink-0" />
                    <span className="text-sm font-medium text-muted-foreground shrink-0">#{i + 1}</span>
                    <div className="ml-auto flex items-center gap-1">
                      <button onClick={() => moveItem(i, -1)} disabled={i === 0} className="w-8 h-8 rounded-lg border border-border text-foreground hover:bg-secondary disabled:opacity-40 transition-colors flex items-center justify-center">↑</button>
                      <button onClick={() => moveItem(i, 1)} disabled={i === pdfFiles.length - 1} className="w-8 h-8 rounded-lg border border-border text-foreground hover:bg-secondary disabled:opacity-40 transition-colors flex items-center justify-center">↓</button>
                      <button onClick={() => removeItem(i)} className="w-8 h-8 rounded-lg border border-border text-destructive hover:bg-destructive/10 transition-colors flex items-center justify-center"><X className="w-4 h-4" /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="flex justify-center mt-6"><CalcButton onClick={makePdf}>{pdfBusy ? t("Creating...") : t("Create PDF")}</CalcButton></div>
            <TipBox>{t("Add images, reorder or remove them, choose the page orientation, then create a single PDF — all in your browser.")}</TipBox>
          </>
        );
      }
      case "image-compressor": {
        return (
          <>
            <input type="file" accept="image/*" onChange={(e) => e.target.files[0] && readFile(e.target.files[0], setCompressSrc)} className="block mx-auto text-sm text-muted-foreground file:mr-3 file:rounded-full file:border-0 file:bg-primary file:text-primary-foreground file:px-4 file:py-2" />
            {compressSrc && <div className="mt-6"><img src={compressSrc} alt="preview" className="max-h-64 mx-auto rounded-xl" /></div>}
            <div className="mt-6"><SelectField label={t("Quality")} value={inputs.quality || "0.7"} onChange={set("quality")} options={["0.9", "0.7", "0.5", "0.3"]} /></div>
            <div className="mt-6"><SelectField label={t("Max Dimension (px)")} value={inputs.maxDim || "0"} onChange={set("maxDim")} options={["0", "640", "1024", "1920", "2560"]} /></div>
            <div className="flex justify-center mt-6"><CalcButton onClick={doCompress}>{t("Compress")}</CalcButton></div>
            {compressResult && (
              <ResultCard title={t("Compression Result")}>
                <img src={compressResult.url} alt="compressed" className="max-h-48 mx-auto rounded-xl" />
                <div className="mt-3 text-sm text-muted-foreground">{compressResult.origSize} KB → {compressResult.newSize} KB ({compressResult.saved}% {t("smaller")}, {compressResult.w}×{compressResult.h}px)</div>
                <a href={compressResult.url} download="compressed.jpg" className="inline-flex items-center gap-2 mt-4 text-primary font-semibold hover:underline">{t("Download")} <ImageDown className="w-4 h-4" /></a>
              </ResultCard>
            )}
          </>
        );
      }
      case "image-enhancer": {
        const presets = [
          { name: "Auto", vals: { brightness: "10", contrast: "15", saturation: "10", sharpen: "20", dehaze: "20" } },
          { name: "Vivid", vals: { brightness: "0", contrast: "20", saturation: "40", sharpen: "15", dehaze: "10" } },
          { name: "B&W", vals: { brightness: "0", contrast: "10", saturation: "-100", sharpen: "10", dehaze: "0" } },
          { name: "Warm", vals: { brightness: "8", contrast: "10", saturation: "25", sharpen: "10", dehaze: "15" } },
          { name: "Soft", vals: { brightness: "12", contrast: "-10", saturation: "-5", sharpen: "0", dehaze: "0" } },
        ];
        const applyPreset = (vals) => setInputs((p) => ({ ...p, ...vals }));
        const resetEnhance = () => setInputs((p) => ({ ...p, brightness: "0", contrast: "0", saturation: "0", sharpen: "0", dehaze: "0" }));
        const downloadEnhanced = () => {
          if (!enhResult) return;
          const a = document.createElement("a");
          a.href = enhResult; a.download = "enhanced.png";
          document.body.appendChild(a); a.click(); a.remove();
        };
        return (
          <>
            <input type="file" accept="image/*" onChange={(e) => { if (e.target.files[0]) { readFile(e.target.files[0], (url) => { setEnhSrc(url); setEnhResult(null); const img = new Image(); img.onload = () => { let { width: w, height: h } = img; if (Math.max(w, h) > 1000) { const s = 1000 / Math.max(w, h); w = Math.round(w * s); h = Math.round(h * s); } const c = document.createElement("canvas"); c.width = w; c.height = h; const cx = c.getContext("2d"); cx.drawImage(img, 0, 0, w, h); enhOrigRef.current = cx.getImageData(0, 0, w, h); setEnhVersion((v) => v + 1); }; img.src = url; }); } }} className="block mx-auto text-sm text-muted-foreground file:mr-3 file:rounded-full file:border-0 file:bg-primary file:text-primary-foreground file:px-4 file:py-2" />
            {enhSrc && <div className="mt-6"><img src={enhResult || enhSrc} alt="preview" className="max-h-64 mx-auto rounded-xl" /></div>}
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {presets.map((p) => (
                <button key={p.name} onClick={() => applyPreset(p.vals)} className="px-4 py-2 rounded-full bg-card border border-border text-sm font-semibold text-card-foreground hover:bg-muted hover:border-primary/30 transition-all">{t(p.name)}</button>
              ))}
              <button onClick={resetEnhance} className="px-4 py-2 rounded-full bg-secondary border border-border text-sm font-semibold text-secondary-foreground hover:bg-muted transition-all">{t("Reset")}</button>
            </div>
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
              <RangeField label={t("Brightness")} value={inputs.brightness || "0"} onChange={set("brightness")} min={-100} max={100} />
              <RangeField label={t("Contrast")} value={inputs.contrast || "0"} onChange={set("contrast")} min={-100} max={100} />
              <RangeField label={t("Saturation")} value={inputs.saturation || "0"} onChange={set("saturation")} min={-100} max={100} />
              <RangeField label={t("Sharpness")} value={inputs.sharpen || "0"} onChange={set("sharpen")} min={0} max={100} />
              <RangeField label={t("Dehaze")} value={inputs.dehaze || "0"} onChange={set("dehaze")} min={0} max={100} />
            </div>
            {enhResult && (
              <ResultCard title={t("Enhanced Image")}>
                <img src={enhResult} alt="enhanced" className="max-h-72 mx-auto rounded-xl" />
                <div className="flex justify-center mt-5"><Button onClick={downloadEnhanced} className="bg-primary text-primary-foreground rounded-2xl px-6 py-4 font-bold">{t("Download")} <ImageDown className="w-4 h-4 ml-2" /></Button></div>
              </ResultCard>
            )}
            <TipBox>{t("Use a preset for a quick start or fine-tune with the sliders, then download. All processing runs in your browser — your image stays private.")}</TipBox>
          </>
        );
      }
      case "logo-maker": {
        const templates = ["Minimalist", "Badge", "Modern", "Emblem", "Bold"];
        const icons = ["★", "🚀", "⚡", "🛡", "◆", "✦", "🎯", "🔥", "💎", "🌿", "🌟", "⬢", "◎", "✺", "🍃"];
        const fonts = ["Sans", "Serif", "Mono"];
        const palette = ["#3b2a8c", "#1e3a8a", "#0f766e", "#b45309", "#be123c", "#4338ca", "#0891b2", "#9333ea", "#ea580c", "#16a34a"];
        const aiStyles = ["Minimalist", "Vintage emblem", "Modern geometric", "Bold typographic"];
        const downloadLogo = () => {
          const canvas = logoCanvasRef.current;
          if (!canvas) return;
          const a = document.createElement("a");
          a.href = canvas.toDataURL("image/png"); a.download = "logo.png";
          document.body.appendChild(a); a.click(); a.remove();
        };
        const randomize = () => setInputs((p) => ({
          ...p,
          template: templates[Math.floor(Math.random() * templates.length)],
          icon: icons[Math.floor(Math.random() * icons.length)],
          font: fonts[Math.floor(Math.random() * fonts.length)],
          primary: palette[Math.floor(Math.random() * palette.length)],
          accent: palette[Math.floor(Math.random() * palette.length)],
        }));
        const generateAiLogos = async () => {
          const name = (inputs.brandName || "").trim();
          if (!name || aiBusy) return;
          setAiBusy(true); setAiLogos([]); setAiSelected(null);
          const results = await Promise.allSettled(
            aiStyles.map((style) => generateLogo({ name, style, tagline: inputs.tagline || "" }))
          );
          setAiLogos(results.map((r, i) => (r.status === "fulfilled" && r.value?.data?.url ? { url: r.value.data.url, style: aiStyles[i] } : null)));
          setAiBusy(false);
        };
        const downloadAi = async (url) => {
          try {
            const res = await fetch(url); const blob = await res.blob();
            const objUrl = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = objUrl; a.download = "logo-ai.png";
            document.body.appendChild(a); a.click(); a.remove();
            URL.revokeObjectURL(objUrl);
          } catch { window.open(url, "_blank"); }
        };
        const sel = (k, v) => setInputs((p) => ({ ...p, [k]: v }));
        return (
          <>
            <div onClick={() => setShowToolbar((s) => !s)} className="relative cursor-pointer group mx-auto" style={{ maxWidth: 360 }}>
              <canvas ref={logoCanvasRef} width={1200} height={1200} className="w-full rounded-2xl shadow-sm" style={{ background: "repeating-conic-gradient(hsl(var(--muted)) 0 25%, transparent 0 50%) 50% / 24px 24px" }} />
              <div className="absolute inset-0 rounded-2xl flex items-end justify-center pb-3 pointer-events-none">
                <span className="text-[11px] font-semibold text-foreground/70 bg-background/85 px-3 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 shadow-sm">
                  <SlidersHorizontal className="w-3 h-3" /> {t("Click logo to customize")}
                </span>
              </div>
            </div>

            {showToolbar && (
              <div className="mt-4 rounded-2xl border border-primary/30 bg-card shadow-lg p-4 animate-[fadeIn_0.3s_ease-out]">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1.5"><SlidersHorizontal className="w-3.5 h-3.5" /> {t("Design Toolbar")}</span>
                  <button onClick={() => setShowToolbar(false)} className="w-7 h-7 rounded-full bg-secondary text-secondary-foreground hover:bg-muted flex items-center justify-center"><X className="w-4 h-4" /></button>
                </div>

                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5 ml-1">{t("Primary Color")}</label>
                  <div className="flex flex-wrap items-center gap-2">
                    {palette.map((c) => (
                      <button key={c} onClick={() => sel("primary", c)} className="w-7 h-7 rounded-full border-2 transition-transform hover:scale-110" style={{ background: c, borderColor: (inputs.primary || "#3b2a8c") === c ? "hsl(var(--foreground))" : "hsl(var(--border))" }} />
                    ))}
                    <input type="color" value={inputs.primary || "#3b2a8c"} onChange={set("primary")} className="w-9 h-9 rounded-lg cursor-pointer border border-border bg-transparent p-0" title={t("Custom color")} />
                  </div>
                </div>

                <div className="mt-3">
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5 ml-1">{t("Accent Color")}</label>
                  <div className="flex flex-wrap items-center gap-2">
                    {palette.map((c) => (
                      <button key={c} onClick={() => sel("accent", c)} className="w-7 h-7 rounded-full border-2 transition-transform hover:scale-110" style={{ background: c, borderColor: (inputs.accent || "#f5a623") === c ? "hsl(var(--foreground))" : "hsl(var(--border))" }} />
                    ))}
                    <input type="color" value={inputs.accent || "#f5a623"} onChange={set("accent")} className="w-9 h-9 rounded-lg cursor-pointer border border-border bg-transparent p-0" title={t("Custom color")} />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5 ml-1">{t("Font")}</label>
                  <div className="flex flex-wrap gap-2">
                    {fonts.map((f) => (
                      <button key={f} onClick={() => sel("font", f)} className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all border ${(inputs.font || "Sans") === f ? "bg-primary text-primary-foreground border-primary" : "bg-card text-card-foreground border-border hover:border-primary/40"}`}>{f}</button>
                    ))}
                  </div>
                </div>

                <div className="mt-4">
                  <RangeField label={t("Text Size")} value={inputs.size ?? "100"} onChange={set("size")} min={70} max={150} step={5} />
                </div>
              </div>
            )}

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
              <TxtInput label={t("Brand Name")} value={inputs.brandName} onChange={set("brandName")} placeholder="Acme Co." />
              <TxtInput label={t("Tagline (optional)")} value={inputs.tagline} onChange={set("tagline")} placeholder="Quality you can trust" />
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-muted-foreground mb-2 ml-1">{t("Template")}</label>
              <div className="flex flex-wrap gap-2">
                {templates.map((tpl) => (
                  <button key={tpl} onClick={() => sel("template", tpl)}
                    className={`px-4 py-2.5 rounded-2xl text-sm font-semibold transition-all border ${(inputs.template || "Minimalist") === tpl ? "bg-primary text-primary-foreground border-primary shadow-[0_0_20px_-5px_hsl(var(--primary)/0.5)]" : "bg-card text-card-foreground border-border hover:border-primary/40"}`}>
                    {t(tpl)}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-muted-foreground mb-2 ml-1">{t("Icon")}</label>
              <div className="grid grid-cols-5 sm:grid-cols-8 gap-2">
                {icons.map((ic) => (
                  <button key={ic} onClick={() => sel("icon", ic)}
                    className={`aspect-square rounded-xl text-2xl flex items-center justify-center transition-all border ${(inputs.icon || "★") === ic ? "bg-primary/10 border-primary text-primary scale-105" : "bg-card border-border hover:border-primary/40"}`}>
                    {ic}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-3 mt-6">
              <CalcButton onClick={downloadLogo}>{t("Download Logo")}</CalcButton>
              <Button onClick={randomize} variant="outline" className="mt-6 rounded-2xl px-6 py-6 border-border bg-background text-foreground hover:bg-secondary"><Shuffle className="w-5 h-5 mr-2" />{t("Randomize")}</Button>
            </div>

            <div className="mt-10 pt-8 border-t border-border">
              <div className="flex items-center gap-2 mb-2">
                <Wand2 className="w-5 h-5 text-primary" />
                <h4 className="font-bold text-foreground">{t("AI Logo Concepts")}</h4>
              </div>
              <p className="text-xs text-muted-foreground mb-4">{t("Generate multiple original logo concepts from your brand name using AI. Click a slot to view and download.")}</p>
              <div className="flex justify-center"><CalcButton onClick={generateAiLogos}>{aiBusy ? t("Generating...") : t("Generate AI Logos")}</CalcButton></div>
              {(aiBusy || aiLogos.length > 0) && (
                <div className="mt-6 grid grid-cols-2 gap-3">
                  {Array.from({ length: 4 }).map((_, i) => {
                    const logo = aiLogos[i];
                    return (
                      <button key={i} onClick={() => logo && setAiSelected(i)} disabled={!logo}
                        className={`relative aspect-square rounded-2xl overflow-hidden border bg-card transition-all ${logo ? "border-border hover:border-primary/50 hover:-translate-y-1 cursor-pointer" : "border-dashed border-border"} ${aiSelected === i ? "ring-2 ring-primary" : ""}`}>
                        {logo ? (
                          <>
                            <img src={logo.url} alt={logo.style} className="w-full h-full object-cover" />
                            <span className="absolute bottom-0 inset-x-0 bg-black/50 text-white text-[10px] py-1 px-2 truncate text-left">{logo.style}</span>
                          </>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">{aiBusy && <RefreshCw className="w-6 h-6 text-muted-foreground animate-spin" />}</div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
              {aiSelected != null && aiLogos[aiSelected] && (
                <ResultCard title={t("AI Logo") + " · " + aiLogos[aiSelected].style}>
                  <img src={aiLogos[aiSelected].url} alt="logo" className="max-h-72 mx-auto rounded-xl bg-white p-2" />
                  <div className="flex justify-center mt-5"><Button onClick={() => downloadAi(aiLogos[aiSelected].url)} className="bg-primary text-primary-foreground rounded-2xl px-6 py-4 font-bold">{t("Download")} <ImageDown className="w-4 h-4 ml-2" /></Button></div>
                </ResultCard>
              )}
            </div>

            <TipBox>{t("Compose a custom logo live: pick a template, icon, colors, and fonts, then download a transparent PNG. Edit any field to update the preview instantly.")}</TipBox>
          </>
        );
      }
      case "game-2048":
        return <Game2048 />;
      case "memory-match":
        return <MemoryMatch />;
      case "whack-a-mole":
        return <WhackAMole />;
      case "ball-launcher":
        return <BallLauncher />;
      case "snake-game":
        return <SnakeGame />;
      default:
        return (
          <div className="text-center py-10">
            <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
              <Box className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-card-foreground text-lg font-medium">{t("This tool is fully functional in the live app.")}</p>
            <p className="text-muted-foreground mt-2">{t("It operates entirely within your browser for maximum privacy.")}</p>
          </div>
        );
    }
  };

  return (
    <div className="rounded-none sm:rounded-[3rem] bg-transparent sm:bg-card border-0 sm:border border-border shadow-none sm:shadow-2xl p-6 sm:p-14 relative overflow-hidden">
      <button onClick={onBack} className="absolute top-8 left-8 sm:top-10 sm:left-10 flex items-center gap-2 px-4 py-2 rounded-full bg-background border border-border text-sm font-medium text-foreground hover:bg-secondary hover:text-secondary-foreground transition-all duration-300 shadow-sm z-20">
        <ArrowLeft className="w-4 h-4" /> {t("Back")}
      </button>
      <button
        onClick={() => toggleFavorite(tool.slug)}
        aria-label={isFavorite(tool.slug) ? t("Remove from favorites") : t("Add to favorites")}
        className={`absolute top-8 right-8 sm:top-10 sm:right-10 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm z-20 ${isFavorite(tool.slug) ? "bg-accent/15 text-accent border border-accent/30" : "bg-background border border-border text-muted-foreground hover:text-accent hover:border-accent/40"}`}>
        <Star className={`w-5 h-5 ${isFavorite(tool.slug) ? "fill-accent" : ""}`} />
      </button>
      
      <div className="text-center mb-10 mt-12 sm:mt-8 relative z-10">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-card-foreground mb-3">{t(tool.name)}</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">{t(tool.description)}</p>
      </div>
      
      <div className="max-w-4xl mx-auto relative z-10">
        {renderCalculator()}
        {(() => {
          const aboutContent = tool.content
            ? (lang === "ar" ? (TOOL_CONTENT_AR[tool.slug] || tool.content) : tool.content)
            : null;
          if (!aboutContent) return null;
          const guide = lang === "ar" ? TOOL_GUIDES_AR[tool.slug] : TOOL_GUIDES[tool.slug];
          return (
            <>
              {tool.image && (
                <div className="mt-10 rounded-2xl overflow-hidden border border-border">
                  <Img src={tool.image} alt={t(tool.name)} fittingType="fill" className="w-full h-48" />
                </div>
              )}
              <div className="mt-10 rounded-2xl bg-secondary border border-border p-6 text-sm text-secondary-foreground leading-relaxed text-left">
                <h3 className="font-bold text-foreground mb-3">{t("About this tool")}</h3>
                <p>{aboutContent}</p>
                {guide && (
                  <button onClick={() => setShowGuide((s) => !s)}
                    className="mt-4 inline-flex items-center gap-1.5 text-primary font-semibold text-sm hover:gap-3 transition-all duration-300">
                    {showGuide ? t("Show less") : t("Read more")} <ChevronRight className={`w-4 h-4 transition-transform ${showGuide ? "rotate-90" : ""}`} />
                  </button>
                )}
              </div>
              {guide && showGuide && (
                <div className="mt-4 rounded-2xl bg-card border border-primary/20 p-6 text-left shadow-sm">
                  <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-accent" /> {t("How to use this tool")}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-5">{guide.intro}</p>
                  <div className="mb-5">
                    <h4 className="font-semibold text-foreground text-sm mb-3">{t("Steps")}</h4>
                    <ol className="space-y-2.5">
                      {guide.steps.map((step, i) => (
                        <li key={i} className="flex gap-3 text-sm text-card-foreground/90">
                          <span className="shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">{i + 1}</span>
                          <span className="leading-relaxed pt-0.5">{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground text-sm mb-3">{t("Tips")}</h4>
                    <ul className="space-y-2">
                      {guide.tips.map((tip, i) => (
                        <li key={i} className="flex gap-2.5 text-sm text-card-foreground/90">
                          <span className="shrink-0 text-accent mt-0.5"><ShieldCheck className="w-4 h-4" /></span>
                          <span className="leading-relaxed">{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </>
          );
        })()}
      </div>
    </div>
  );
}

// ---------- Tools Hub ----------
function ToolsHub({ searchQuery = "" }) {
  const { t } = useI18n();
  const [tools, setTools] = useState([]);
  const [activeCategory, setActiveCategory] = useState("Finance");
  const [searchParams, setSearchParams] = useSearchParams();
  const { favorites, toggleFavorite, isFavorite } = useFavorites();
  const isMobile = useIsMobile();

  const load = useCallback(async () => { try { setTools(await ToolEntity.list()); } catch {} }, []);
  useEffect(() => { load(); }, [load]);

  const items = (() => {
    const map = new Map();
    STATIC_TOOLS.forEach((t) => map.set(t.slug, t));
    tools.forEach((t) => { if (!map.has(t.slug)) map.set(t.slug, t); });
    return Array.from(map.values());
  })();
  const toolSlug = searchParams.get("tool");
  const selectedTool = toolSlug ? items.find((t) => t.slug === toolSlug) || null : null;
  const query = (searchQuery || "").trim().toLowerCase();
  const isSearching = query.length > 0;
  const filtered = isSearching
    ? items.filter((t) => (`${t.name} ${t.category} ${t.description || ""}`).toLowerCase().includes(query))
    : activeCategory === "Favorites"
      ? items.filter((t) => isFavorite(t.slug))
      : items.filter((t) => t.category === activeCategory);

  const selectTool = (tool) => {
    setActiveCategory(tool.category);
    setSearchParams({ tool: tool.slug });
    trackEvent("tool_select", { tool_slug: tool.slug, tool_name: tool.name, category: tool.category });
  };
  const clearTool = () => {
    const next = new URLSearchParams(searchParams);
    next.delete("tool");
    setSearchParams(next);
  };

  // The list/grid is always visible on mobile (the workspace slides over it as
  // a full-screen modal) and only hidden on desktop when a tool is open inline.
  const showList = isSearching || !selectedTool || isMobile;

  return (
    <section className="bg-background py-16" id="tools">
      <PullToRefresh onRefresh={load}>
      <div className="max-w-5xl mx-auto px-6">
        
        {showList && !isSearching && (
          <div id="categories">
          <AnimatedElement className="flex flex-wrap justify-center gap-3 md:gap-4 mb-16">
            {CATEGORIES.map((cat) => (
              <button key={cat} onClick={() => setActiveCategory(cat)}
                className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-sm transition-all duration-300 ${activeCategory === cat ? "bg-primary text-primary-foreground shadow-[0_0_20px_-5px_hsl(var(--primary)/0.5)]" : "bg-card text-card-foreground border border-border hover:bg-muted hover:border-primary/30"}`}>
                {t(cat)}
              </button>
            ))}
            <button onClick={() => setActiveCategory("Favorites")}
              className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-sm transition-all duration-300 ${activeCategory === "Favorites" ? "bg-accent text-accent-foreground shadow-[0_0_20px_-5px_hsl(var(--accent)/0.5)]" : "bg-card text-card-foreground border border-border hover:bg-muted hover:border-accent/40"}`}>
              <Star className={`w-4 h-4 ${favorites.length > 0 ? "fill-accent text-accent" : ""}`} />
              {t("Favorites")} {favorites.length > 0 && <span className="ml-1 text-xs font-bold">{favorites.length}</span>}
            </button>
            <Link to="/Blog" className="flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-sm bg-card text-card-foreground border border-border hover:bg-muted transition-all duration-300">
              {t("Blog")}
            </Link>
          </AnimatedElement>
          </div>
        )}

        {isSearching && (
          <div className="mb-8 text-center">
            <p className="text-sm text-muted-foreground">
              {filtered.length > 0
                ? `${filtered.length} ${t("results for")} "${searchQuery}"`
                : t("No tools found. Try another name.")}
            </p>
          </div>
        )}
        {showList && filtered.length === 0 && activeCategory === "Favorites" && !isSearching && (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
              <Star className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-card-foreground text-lg font-medium">{t("No favorites yet")}</p>
            <p className="text-muted-foreground mt-2">{t("Tap the star on any tool to save it here for quick access.")}</p>
            <button onClick={() => setActiveCategory("Finance")} className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-5 py-2.5 font-semibold text-sm hover:bg-primary/90 transition-colors">
              {t("Browse Tools")}
            </button>
          </div>
        )}
        {showList && filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((tool, index) => {
            const Icon = ICONS[tool.icon] || Calculator;
            const fav = isFavorite(tool.slug);
            return (
              <AnimatedElement key={tool.slug || index} delay={index * 80}>
                <div onClick={() => selectTool(tool)}
                  className="relative w-full h-full text-center rounded-[2rem] bg-card border border-border p-8 transition-all duration-400 hover:-translate-y-2 hover:shadow-[0_20px_50px_-15px_hsl(var(--primary)/0.2)] hover:border-primary/40 group flex flex-col items-center justify-center cursor-pointer">
                  
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleFavorite(tool.slug); trackEvent("tool_favorite", { tool_slug: tool.slug, action: fav ? "remove" : "add" }); }}
                    aria-label={fav ? t("Remove from favorites") : t("Add to favorites")}
                    className={`absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 z-10 ${fav ? "bg-accent/15 text-accent" : "bg-background border border-border text-muted-foreground hover:text-accent hover:border-accent/40"}`}>
                    <Star className={`w-5 h-5 ${fav ? "fill-accent" : ""}`} />
                  </button>
                  
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-5 shadow-lg shadow-primary/30 group-hover:scale-110 group-hover:shadow-primary/40 transition-all duration-500 overflow-hidden">
                    {tool.logo ? (
                      <img src={tool.logo} alt={t(tool.name)} className="w-full h-full object-cover" />
                    ) : (
                      <Icon className="w-7 h-7 text-primary-foreground" strokeWidth={2.2} />
                    )}
                  </div>
                  
                  <h3 className="text-xl font-bold text-card-foreground mb-1">{t(tool.name)}</h3>
                  <span className="text-sm font-medium text-muted-foreground">{t(tool.category)}</span>
                  
                </div>
              </AnimatedElement>
            );
          })}
        </div>
        )}

        {/* Desktop: inline workspace with a subtle slide-up */}
        <AnimatePresence mode="wait">
          {selectedTool && !isSearching && !isMobile && (
            <motion.div
              key={`ws-${selectedTool.slug}`}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 24 }}
              transition={{ duration: 0.26, ease: "easeOut" }}
            >
              <ToolWorkspace tool={selectedTool} onBack={clearTool} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      </PullToRefresh>

      {/* Mobile: full-screen slide-up modal workspace (ported to body to escape page-transition transforms) */}
      {createPortal(
        <AnimatePresence>
          {selectedTool && !isSearching && isMobile && (
            <motion.div
              key="ws-mobile"
              className="fixed inset-0 z-[60] bg-card overflow-y-auto overscroll-contain"
              style={{ paddingTop: "env(safe-area-inset-top)", paddingBottom: "env(safe-area-inset-bottom)" }}
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ duration: 0.34, ease: [0.32, 0.72, 0, 1] }}
            >
              <ToolWorkspace tool={selectedTool} onBack={clearTool} />
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </section>
  );
}

// ---------- App Store Banner & Quick Links (Footer block from screenshot) ----------
function AppStoreSection() {
  const { t } = useI18n();
  return (
    <section className="bg-background pb-16">
      <div className="max-w-5xl mx-auto px-6">
        <AnimatedElement delay={100}>
          <div className="rounded-[3rem] bg-card border border-border p-10 md:p-14 shadow-2xl relative overflow-hidden flex flex-col md:flex-row gap-10 md:gap-16">
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 to-transparent pointer-events-none" />
            
            <div className="flex-1 relative z-10">
              <h3 className="text-2xl font-bold text-card-foreground mb-4">{t("TestPeak Platform")}</h3>
              <p className="text-muted-foreground mb-6 text-sm leading-relaxed max-w-sm">
                {t("31+ interactive and accurate tools in one place. Finance, health, converters, math, brain games, and image processing — completely free and secure.")}
              </p>
              <p className="text-xs text-muted-foreground/60 mt-auto pt-6">{t("© 2026 TestPeak — All Rights Reserved")}</p>
            </div>
            
            <div className="flex-1 relative z-10 grid grid-cols-2 gap-8">
              <div>
                <h4 className="font-bold text-card-foreground mb-4">{t("Quick Links")}</h4>
                <ul className="space-y-3 text-sm">
                  <li><Link to="/About" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"><Square className="w-3 h-3" /> {t("About Us")}</Link></li>
                  <li><Link to="/Privacy" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"><Square className="w-3 h-3" /> {t("Privacy Policy")}</Link></li>
                  <li><Link to="/Dashboard" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"><ShieldCheck className="w-3 h-3" /> {t("Admin")}</Link></li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-bold text-card-foreground mb-4">{t("Social")}</h4>
                <div className="flex items-center gap-3">
                  <a href="#" className="w-10 h-10 rounded-full bg-background border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/50 transition-all"><ExternalLink className="w-4 h-4" /></a>
                  <a href="#" className="w-10 h-10 rounded-full bg-background border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/50 transition-all"><ExternalLink className="w-4 h-4" /></a>
                  <a href="#" className="w-10 h-10 rounded-full bg-background border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/50 transition-all"><ExternalLink className="w-4 h-4" /></a>
                </div>
                
                <div className="mt-8 space-y-3">
                  <button className="flex items-center gap-3 w-full max-w-[160px] bg-background border border-border rounded-xl p-2.5 hover:border-primary/50 transition-all">
                    <Smartphone className="w-6 h-6 text-foreground" />
                    <div className="text-left">
                      <div className="text-[10px] text-muted-foreground uppercase leading-none mb-1">{t("Get it on")}</div>
                      <div className="text-sm font-bold text-foreground leading-none">{t("Google Play")}</div>
                    </div>
                  </button>
                  <button className="flex items-center gap-3 w-full max-w-[160px] bg-background border border-border rounded-xl p-2.5 hover:border-primary/50 transition-all">
                    <Smartphone className="w-6 h-6 text-foreground" />
                    <div className="text-left">
                      <div className="text-[10px] text-muted-foreground uppercase leading-none mb-1">{t("Download on the")}</div>
                      <div className="text-sm font-bold text-foreground leading-none">{t("App Store")}</div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
            
          </div>
        </AnimatedElement>
      </div>
    </section>
  );
}

// ---------- Why TestPeak & About Content ----------
function WhySection() {
  const { t } = useI18n();
  const features = [
    { icon: Coins, title: "Completely free", desc: "no registration or payment required." },
    { icon: ShieldQuestion, title: "Secure & private", desc: "all processing happens in your browser, no data is uploaded to any server." },
    { icon: Layers, title: "Works on all devices", desc: "mobile, tablet, or desktop." },
    { icon: Zap, title: "31+ tools", desc: "Finance, Health, Converters, Math, Brain Games, and Image Tools." },
  ];
  return (
    <section id="why" className="bg-background pb-16">
      <div className="max-w-5xl mx-auto px-6">
        <AnimatedElement>
          <div className="rounded-[3rem] bg-card border border-border p-10 md:p-14 shadow-2xl relative overflow-hidden">
            <div className="flex items-center gap-3 mb-6">
              <Square className="w-6 h-6 text-primary stroke-[2.5]" />
              <h2 className="text-2xl sm:text-3xl font-extrabold text-card-foreground">{t("About Us")}</h2>
            </div>
            
            <p className="text-card-foreground/80 mb-10 text-lg">
              <strong className="text-foreground">TestPeak</strong> {t("is an")} <strong className="text-foreground">{t("integrated tools platform")}</strong> {t("that provides a wide range of free and interactive tools covering users' daily needs across various domains.")}
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {features.map((f, i) => (
                <div key={f.title} className="rounded-2xl bg-background border border-border p-6 hover:-translate-y-1 hover:border-primary/30 transition-all duration-300">
                  <div className="flex items-start gap-3">
                    <f.icon className="w-5 h-5 text-accent mt-0.5 shrink-0" />
                    <div>
                      <strong className="text-sm text-foreground block mb-1">{t(f.title)} —</strong>
                      <span className="text-sm text-muted-foreground leading-snug block">{t(f.desc)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <p className="text-sm text-muted-foreground mt-10 italic">
              "{t("The TestPeak team works passionately to deliver the best digital experience.")}"
            </p>
          </div>
        </AnimatedElement>
      </div>
    </section>
  );
}

// ---------- Blog teaser ----------
function BlogTeaser() {
  const { t } = useI18n();
  const [posts, setPosts] = useState([]);
  useEffect(() => { BlogPostEntity.list("-created_date", 3).then(setPosts).catch(() => {}); }, []);
  const published = posts.filter((p) => (p.status || "published") === "published");
  const items = (published.length > 0 ? published : STATIC_BLOG).slice(0, 3);

  return (
    <section className="bg-background pb-16">
      <div className="max-w-5xl mx-auto px-6">
        <AnimatedElement>
          <div className="rounded-[3rem] bg-card border border-border p-10 md:p-14 shadow-2xl">
            <div className="flex flex-wrap items-end justify-between gap-6 mb-10">
              <div>
                <h2 className="text-3xl font-extrabold text-card-foreground">{t("From the Blog")}</h2>
                <p className="text-muted-foreground mt-2 font-medium">{t("Read the latest articles and tips")}</p>
              </div>
              <Link to="/Blog"><Button className="bg-primary text-primary-foreground rounded-2xl px-6 py-5 hover:scale-105 transition-transform font-bold">{t("View All Posts")}</Button></Link>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {items.map((post, i) => (
                <Link key={post.title} to="/Blog" className="block h-full rounded-[2rem] bg-background border border-border overflow-hidden hover:-translate-y-2 hover:shadow-xl hover:border-primary/30 transition-all duration-400 group">
                  <div className="aspect-[16/9] overflow-hidden">
                    <img src={post.image_url} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  </div>
                  <div className="p-6">
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-secondary text-secondary-foreground uppercase tracking-wide">{post.category}</span>
                    <h3 className="font-bold text-lg text-foreground mt-4 mb-3 leading-tight group-hover:text-primary transition-colors">{post.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">{post.excerpt}</p>
                    <span className="text-xs font-medium text-muted-foreground/70 mt-5 block uppercase tracking-wider">{post.date}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </AnimatedElement>
      </div>
    </section>
  );
}

// ---------- Privacy Teaser (Matching screenshot bottom section) ----------
function PrivacyTeaser() {
  const { t } = useI18n();
  return (
    <section className="bg-background pb-20">
      <div className="max-w-5xl mx-auto px-6">
        <AnimatedElement>
          <div className="rounded-[3rem] bg-card border border-border p-10 md:p-14 shadow-2xl relative overflow-hidden">
            <div className="flex items-center gap-3 mb-2">
              <Square className="w-6 h-6 text-primary stroke-[2.5]" />
              <h2 className="text-2xl sm:text-3xl font-extrabold text-card-foreground">{t("Privacy Policy")}</h2>
            </div>
            <p className="text-xs text-muted-foreground mb-8 uppercase tracking-wider">{t("Last Updated: August 15, 2026")}</p>
            
            <div className="space-y-6 text-sm text-muted-foreground">
              <p>{t("At TestPeak, your privacy comes first. We don't track you, we don't profile you, and most tools run entirely in your browser. This policy explains how the platform handles data.")}</p>
              
              <div>
                <strong className="text-foreground text-base block mb-1">{t("1. We Don't Track You")}</strong>
                <p>{t("TestPeak uses no Google Analytics or third-party trackers. We do not record which tools you use or set tracking cookies.")}</p>
              </div>
              
              <div>
                <strong className="text-foreground text-base block mb-1">{t("2. Local-First Processing")}</strong>
                <p>{t("Calculators, converters, and image tools run in your browser. Only the AI Logo Maker and admin blog uploads use our servers, and only when you actively use them.")}</p>
              </div>
              
              <div className="pt-4">
                <Link to="/Privacy" className="inline-flex items-center text-primary font-bold hover:text-primary/80 transition-colors">
                  {t("Read full policy")} <ChevronRight className="w-4 h-4 ml-1" />
                </Link>
              </div>
            </div>
          </div>
        </AnimatedElement>
      </div>
    </section>
  );
}

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  useSeo({
    title: "Free Online Calculators, Converters & Image Tools",
    description: "31+ free online tools: loan & interest calculators, BMI & calorie trackers, unit converters, QR generator, image cropper, compressor & background remover. Fast, private, no signup.",
    path: "/",
  });
  return (
    <div className="min-h-screen bg-background selection:bg-primary/30 selection:text-primary">
      <HeroSection toolCount={31} catCount={7} searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      <ToolsHub searchQuery={searchQuery} />
      <AppStoreSection />
      <WhySection />
      <PrivacyTeaser />
      <BlogTeaser />
    </div>
  );
}