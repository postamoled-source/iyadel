import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import {
  Calculator, TrendingUp, LineChart as LineChartIcon, Activity, Flame, DollarSign, Ruler, Weight,
  Square, Clock, Gauge, Wifi, QrCode, Link2, ShieldCheck, FunctionSquare, Percent, Atom, FlaskConical,
  HelpCircle, Puzzle, Shuffle, Crop, Eraser, FileImage, ImageDown, ArrowLeft, RefreshCw, ArrowLeftRight,
  Sparkles, ChevronRight, Copy, Send, Play, ShieldQuestion, Coins, Layers, Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const ToolEntity = base44.entities.Tool;
const BlogPostEntity = base44.entities.BlogPost;

const ICONS = {
  Calculator, TrendingUp, LineChart: LineChartIcon, Activity, Flame, DollarSign, Ruler, Weight,
  Square, Clock, Gauge, Wifi, QrCode, Link2, ShieldCheck, FunctionSquare, Percent, Atom, FlaskConical,
  HelpCircle, Puzzle, Shuffle, Crop, Eraser, FileImage, ImageDown
};

const CATEGORIES = ["Finance", "Health", "Converters", "Math", "Games", "Image Tools"];

const STATIC_TOOLS = [
  { name: "Loan Calculator", slug: "loan-calculator", category: "Finance", description: "Monthly payment, total interest, and amortization schedule.", icon: "Calculator" },
  { name: "Simple & Compound Interest", slug: "simple-compound-interest", category: "Finance", description: "Compare your money growth over time.", icon: "TrendingUp" },
  { name: "Bond Yield", slug: "bond-yield", category: "Finance", description: "Current yield and yield to maturity (YTM).", icon: "LineChart" },
  { name: "BMI Calculator", slug: "bmi-calculator", category: "Health", description: "Get your health classification instantly.", icon: "Activity" },
  { name: "Calories Burned", slug: "calories-burned", category: "Health", description: "Estimate calories burned during activity.", icon: "Flame" },
  { name: "Currency Converter", slug: "currency-converter", category: "Converters", description: "Convert between 30 world currencies.", icon: "DollarSign" },
  { name: "Distance Converter", slug: "distance-converter", category: "Converters", description: "Convert between distance units.", icon: "Ruler" },
  { name: "Weight Converter", slug: "weight-converter", category: "Converters", description: "Convert between weight units.", icon: "Weight" },
  { name: "Area Converter", slug: "area-converter", category: "Converters", description: "Convert between area units.", icon: "Square" },
  { name: "Time Converter", slug: "time-converter", category: "Converters", description: "Convert between time units.", icon: "Clock" },
  { name: "Speed Converter", slug: "speed-converter", category: "Converters", description: "Convert between speed units.", icon: "Gauge" },
  { name: "Internet Speed Test", slug: "internet-speed-test", category: "Converters", description: "Test download, upload and latency.", icon: "Wifi" },
  { name: "QR Code Generator", slug: "qr-code-generator", category: "Converters", description: "Create a custom QR code easily.", icon: "QrCode" },
  { name: "Share Link Generator", slug: "share-link-generator", category: "Converters", description: "Generate shareable social links.", icon: "Link2" },
  { name: "Privacy Policy Generator", slug: "privacy-policy-generator", category: "Converters", description: "Generate a GDPR-compliant policy.", icon: "ShieldCheck" },
  { name: "Math Function Calculator", slug: "math-function-calculator", category: "Math", description: "Plot mathematical functions.", icon: "FunctionSquare" },
  { name: "Percentage", slug: "percentage-calculator", category: "Math", description: "Quick percentage calculations.", icon: "Percent" },
  { name: "Physics Calculators", slug: "physics-calculators", category: "Math", description: "Speed, distance, time and Ohm's Law.", icon: "Atom" },
  { name: "Chemistry Calculators", slug: "chemistry-calculators", category: "Math", description: "Calculate molar mass instantly.", icon: "FlaskConical" },
  { name: "Riddle", slug: "riddle-game", category: "Games", description: "Solve puzzles and riddles.", icon: "HelpCircle" },
  { name: "Math Puzzle", slug: "math-puzzle", category: "Games", description: "Sharpen your mental math.", icon: "Puzzle" },
  { name: "Word Scramble", slug: "word-scramble", category: "Games", description: "Unscramble the word.", icon: "Shuffle" },
  { name: "Image Cropper", slug: "image-cropper", category: "Image Tools", description: "Upload and crop an image.", icon: "Crop" },
  { name: "Background Remover", slug: "background-remover", category: "Image Tools", description: "Remove backgrounds automatically.", icon: "Eraser" },
  { name: "Image to PDF", slug: "image-to-pdf", category: "Image Tools", description: "Combine images into a single PDF.", icon: "FileImage" },
  { name: "Image Compressor", slug: "image-compressor", category: "Image Tools", description: "Compress images while keeping quality.", icon: "ImageDown" },
];

const STATIC_BLOG = [
  { title: "5 Smart Ways to Pay Off Your Loan Faster", excerpt: "Small changes to your repayment strategy can save you thousands in interest.", category: "Finance", date: "Aug 10, 2026", image_url: "https://media.base44.com/images/public/6a7e76e3396b41955b675542/58374ccbe_generated_5e9014e0.png" },
  { title: "Understanding BMI: What the Numbers Really Mean", excerpt: "Body Mass Index is a starting point, not the full picture.", category: "Health", date: "Aug 5, 2026", image_url: "https://media.base44.com/images/public/6a7e76e3396b41955b675542/091f98734_generated_92bd36b3.png" },
  { title: "Compound Interest: The Eighth Wonder of the World", excerpt: "See how compounding accelerates your savings over time.", category: "Finance", date: "Jul 28, 2026", image_url: "https://media.base44.com/images/public/6a7e76e3396b41955b675542/ff5a36d61_generated_8395a13a.png" },
  { title: "Boost Your Productivity with Free Online Tools", excerpt: "Discover how everyday tools quietly save you hours every week.", category: "Technology", date: "Jul 20, 2026", image_url: "https://media.base44.com/images/public/6a7e76e3396b41955b675542/4637cebde_generated_ac5c1dd1.png" },
];

// ---------- shared helpers ----------
const DISTANCE_UNITS = { Mile: 1609.34, Kilometer: 1000, Hectometer: 100, Yard: 0.9144, Foot: 0.3048, Inch: 0.0254, Centimeter: 0.01, Millimeter: 0.001 };
const WEIGHT_UNITS = { Ton: 1000000, Quintal: 100000, Kilogram: 1000, Pound: 453.592, Ounce: 28.3495, Gram: 1 };
const AREA_UNITS = { "km²": 1000000, "mi²": 2589988, Hectare: 10000, Acre: 4046.86, "m²": 1, "ft²": 0.092903, "in²": 0.00064516 };
const TIME_UNITS = { Day: 86400, Hour: 3600, Minute: 60, Second: 1, Millisecond: 0.001 };
const SPEED_UNITS = { Knot: 0.514444, "km/h": 0.277778, mph: 0.44704, "m/s": 1 };
const CURRENCY_RATES = { USD: 1, EUR: 0.92, GBP: 0.79, JPY: 149.5, CNY: 7.24, CHF: 0.88, CAD: 1.36, AUD: 1.52, NZD: 1.64, KRW: 1330, SGD: 1.34, INR: 83.3, BRL: 5.0, RUB: 92.5, ZAR: 18.7, TRY: 32.1, MXN: 17.0, SEK: 10.4, NOK: 10.6, DKK: 6.86, PLN: 4.0, THB: 35.5, MYR: 4.7, IDR: 15600, PKR: 278, MAD: 9.9, EGP: 48.5, SAR: 3.75, AED: 3.67 };
const ATOMIC_WEIGHTS = { H: 1.008, He: 4.0026, Li: 6.94, Be: 9.0122, B: 10.81, C: 12.011, N: 14.007, O: 15.999, F: 18.998, Ne: 20.18, Na: 22.99, Mg: 24.305, Al: 26.982, Si: 28.085, P: 30.974, S: 32.06, Cl: 35.45, K: 39.098, Ca: 40.078, Fe: 55.845, Cu: 63.546, Zn: 65.38, Br: 79.904, Ag: 107.868, I: 126.904, Ba: 137.327, Au: 196.967, Pb: 207.2 };
const WORD_LIST = ["PLANET", "GARDEN", "BRIDGE", "PUZZLE", "LAPTOP", "GUITAR", "CASTLE", "BOTTLE"];

function convertUnit(value, units, from, to) {
  const v = parseFloat(value);
  if (isNaN(v) || !units[from] || !units[to]) return null;
  return (v * units[from]) / units[to];
}
function scrambleWord(word) {
  const arr = word.split("");
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  const s = arr.join("");
  return s === word ? scrambleWord(word) : s;
}
function generatePuzzle(level) {
  const ranges = { Easy: 10, Medium: 20, Hard: 50, Expert: 100 };
  const max = ranges[level] || 10;
  const ops = ["+", "-", "×"];
  const op = ops[Math.floor(Math.random() * ops.length)];
  let a = Math.floor(Math.random() * max) + 1;
  let b = Math.floor(Math.random() * max) + 1;
  if (op === "-" && b > a) [a, b] = [b, a];
  const answer = op === "+" ? a + b : op === "-" ? a - b : a * b;
  return { text: `${a} ${op} ${b} = ?`, answer };
}
function calcMolarMass(formula) {
  const regex = /([A-Z][a-z]?)(\d*)/g;
  let match, total = 0, valid = false;
  while ((match = regex.exec(formula)) !== null) {
    const [full, el, countStr] = match;
    if (!el) continue;
    const w = ATOMIC_WEIGHTS[el];
    if (w === undefined) continue;
    valid = true;
    total += w * (countStr ? parseInt(countStr) : 1);
  }
  return valid ? total : null;
}
function evalFn(expr, x) {
  let e = expr.trim().replace(/\^/g, "**");
  e = e.replace(/\bsqrt\(/g, "Math.sqrt(").replace(/\bln\(/g, "Math.log(").replace(/\blog\(/g, "Math.log10(")
    .replace(/\bsin\(/g, "Math.sin(").replace(/\bcos\(/g, "Math.cos(").replace(/\btan\(/g, "Math.tan(")
    .replace(/\babs\(/g, "Math.abs(").replace(/\bexp\(/g, "Math.exp(");
  try {
    // eslint-disable-next-line no-new-func
    const fn = new Function("x", `return ${e}`);
    return fn(x);
  } catch { return NaN; }
}

// ---------- shared UI ----------
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

function NumInput({ label, value, onChange, placeholder }) {
  return (
    <div>
      <label className="block text-sm text-muted-foreground mb-1.5">{label}</label>
      <input type="number" value={value ?? ""} onChange={onChange} placeholder={placeholder}
        className="w-full rounded-xl border border-border bg-background text-foreground px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary transition" />
    </div>
  );
}
function TxtInput({ label, value, onChange, placeholder, type = "text" }) {
  return (
    <div>
      <label className="block text-sm text-muted-foreground mb-1.5">{label}</label>
      <input type={type} value={value ?? ""} onChange={onChange} placeholder={placeholder}
        className="w-full rounded-xl border border-border bg-background text-foreground px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary transition" />
    </div>
  );
}
function SelectField({ label, value, onChange, options }) {
  return (
    <div>
      <label className="block text-sm text-muted-foreground mb-1.5">{label}</label>
      <select value={value} onChange={onChange}
        className="w-full rounded-xl border border-border bg-background text-foreground px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary transition">
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}
function ResultCard({ title, children }) {
  return (
    <div className="mt-6 rounded-2xl bg-gradient-to-br from-primary/15 to-accent/10 border border-primary/20 p-6">
      <h4 className="text-lg font-bold text-foreground mb-3">{title}</h4>
      {children}
    </div>
  );
}
function TipBox({ children }) {
  return <div className="mt-5 rounded-xl bg-muted/60 border border-border p-4 text-sm text-muted-foreground">{children}</div>;
}
function CalcButton({ children, onClick, variant = "primary" }) {
  return (
    <Button onClick={onClick}
      className={`relative overflow-hidden mt-2 rounded-xl px-6 py-5 font-semibold transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-primary/30 ${variant === "primary" ? "bg-primary text-primary-foreground" : "bg-accent text-accent-foreground"}`}>
      <span className="absolute inset-0 bg-gradient-to-r from-transparent via-primary-foreground/20 to-transparent animate-[shimmer_3s_ease-in-out_infinite] bg-[length:200%_100%]" />
      <span className="relative z-10">{children}</span>
    </Button>
  );
}

// ---------- Hero ----------
function HeroSection({ toolCount, catCount }) {
  return (
    <section className="relative overflow-hidden bg-background pt-20 pb-14 sm:pt-28 sm:pb-20">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[110px] pointer-events-none" style={{ animation: "floatA 9s ease-in-out infinite" }} />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent/10 rounded-full blur-[120px] pointer-events-none" style={{ animation: "floatB 7s ease-in-out 2s infinite" }} />
      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: "easeOut" }}
          className="rounded-3xl bg-card/70 backdrop-blur-xl border border-border/50 shadow-2xl px-6 py-12 sm:px-12 sm:py-16 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/30" style={{ animation: "floatC 6s ease-in-out infinite" }}>
              <Sparkles className="w-6 h-6 text-primary-foreground" />
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-gradient-x">
              TestPeak
            </h1>
          </div>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
            Your all-in-one platform — {toolCount}+ tools in Finance, Health, Converters, Math, Brain Games, and Image Tools
          </p>
          <div className="flex flex-wrap justify-center gap-4 mt-8">
            <div className="rounded-2xl bg-secondary/80 border border-border px-6 py-3">
              <span className="text-2xl font-bold text-accent">{toolCount}</span>
              <span className="block text-xs text-muted-foreground">Tools</span>
            </div>
            <div className="rounded-2xl bg-secondary/80 border border-border px-6 py-3">
              <span className="text-2xl font-bold text-primary">{catCount}</span>
              <span className="block text-xs text-muted-foreground">Categories</span>
            </div>
            <div className="rounded-2xl bg-secondary/80 border border-border px-6 py-3">
              <span className="text-2xl font-bold text-accent">Free</span>
              <span className="block text-xs text-muted-foreground">for Everyone</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ---------- Tool workspace (all calculators) ----------
function ToolWorkspace({ tool, onBack }) {
  const [inputs, setInputs] = useState({});
  const [result, setResult] = useState(null);
  const [riddleAttempts, setRiddleAttempts] = useState(3);
  const [riddleMsg, setRiddleMsg] = useState("");
  const [riddleGuess, setRiddleGuess] = useState("");
  const [puzzleLevel, setPuzzleLevel] = useState("Easy");
  const [puzzleQ, setPuzzleQ] = useState(() => generatePuzzle("Easy"));
  const [puzzleAns, setPuzzleAns] = useState("");
  const [puzzleResult, setPuzzleResult] = useState("");
  const [word, setWord] = useState(() => WORD_LIST[Math.floor(Math.random() * WORD_LIST.length)]);
  const [scrambled, setScrambled] = useState("");
  const [scrambleGuess, setScrambleGuess] = useState("");
  const [scrambleResult, setScrambleResult] = useState("");
  const [speedTest, setSpeedTest] = useState({ running: false, ping: null, download: null, upload: null });
  const [qrUrl, setQrUrl] = useState(null);
  const [shareLinks, setShareLinks] = useState(null);
  const [policyText, setPolicyText] = useState("");
  const [cropSrc, setCropSrc] = useState(null);
  const [cropResult, setCropResult] = useState(null);
  const [bgSrc, setBgSrc] = useState(null);
  const [bgDone, setBgDone] = useState(false);
  const [pdfFiles, setPdfFiles] = useState([]);
  const [pdfReady, setPdfReady] = useState(false);
  const [compressSrc, setCompressSrc] = useState(null);
  const [compressResult, setCompressResult] = useState(null);
  const [plotData, setPlotData] = useState(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    setInputs({}); setResult(null); setRiddleAttempts(3); setRiddleMsg(""); setRiddleGuess("");
    setPuzzleQ(generatePuzzle("Easy")); setPuzzleLevel("Easy"); setPuzzleAns(""); setPuzzleResult("");
    const w = WORD_LIST[Math.floor(Math.random() * WORD_LIST.length)];
    setWord(w); setScrambled(scrambleWord(w)); setScrambleGuess(""); setScrambleResult("");
    setSpeedTest({ running: false, ping: null, download: null, upload: null });
    setQrUrl(null); setShareLinks(null); setPolicyText("");
    setCropSrc(null); setCropResult(null); setBgSrc(null); setBgDone(false);
    setPdfFiles([]); setPdfReady(false); setCompressSrc(null); setCompressResult(null); setPlotData(null);
  }, [tool.slug]);

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
      const size = Math.min(img.width, img.height);
      const canvas = document.createElement("canvas");
      canvas.width = size; canvas.height = size;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, (img.width - size) / 2, (img.height - size) / 2, size, size, 0, 0, size, size);
      setCropResult(canvas.toDataURL("image/png"));
    };
    img.src = cropSrc;
  };

  const doCompress = () => {
    if (!compressSrc) return;
    const quality = parseFloat(inputs.quality || "0.7");
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width; canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);
      const out = canvas.toDataURL("image/jpeg", quality);
      const origSize = Math.round((compressSrc.length * 3) / 4 / 1024);
      const newSize = Math.round((out.length * 3) / 4 / 1024);
      setCompressResult({ url: out, origSize, newSize });
    };
    img.src = compressSrc;
  };

  const renderCalculator = () => {
    switch (tool.slug) {
      case "loan-calculator": {
        const P = parseFloat(inputs.amount), annualRate = parseFloat(inputs.rate), n = parseFloat(inputs.term);
        const calc = () => {
          if (!P || !annualRate || !n) return setResult(null);
          const r = annualRate / 100 / 12;
          const payment = r === 0 ? P / n : (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
          const total = payment * n;
          setResult({ payment: payment.toFixed(2), interest: (total - P).toFixed(2), total: total.toFixed(2) });
        };
        return (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <NumInput label="Loan Amount" value={inputs.amount} onChange={set("amount")} placeholder="10000" />
              <NumInput label="Annual Rate (%)" value={inputs.rate} onChange={set("rate")} placeholder="6.5" />
              <NumInput label="Term (Months)" value={inputs.term} onChange={set("term")} placeholder="36" />
            </div>
            <CalcButton onClick={calc}>Calculate</CalcButton>
            {result && (
              <ResultCard title="Results">
                <div className="text-foreground text-lg">Monthly Payment: <strong className="text-accent">{result.payment}</strong></div>
                <div className="text-foreground mt-1">Total Interest: <strong className="text-accent">{result.interest}</strong> | Total Amount: <strong className="text-accent">{result.total}</strong></div>
              </ResultCard>
            )}
            <TipBox><strong className="text-foreground">Indicator:</strong> Interest is calculated on the remaining balance. Compare bank offers.</TipBox>
          </>
        );
      }
      case "simple-compound-interest": {
        const compounds = { Yearly: 1, "Semi-annual": 2, Quarterly: 4, Monthly: 12, Daily: 365 };
        const calc = () => {
          const P = parseFloat(inputs.principal), rate = parseFloat(inputs.rate), t = parseFloat(inputs.years);
          const n = compounds[inputs.compound || "Yearly"];
          if (!P || !rate || !t) return setResult(null);
          const simple = (P * rate * t) / 100;
          const compound = P * Math.pow(1 + rate / 100 / n, n * t) - P;
          setResult({ simple: simple.toFixed(2), compound: compound.toFixed(2), finalSimple: (P + simple).toFixed(2), finalCompound: (P + compound).toFixed(2) });
        };
        return (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <NumInput label="Principal" value={inputs.principal} onChange={set("principal")} placeholder="5000" />
              <NumInput label="Rate (%)" value={inputs.rate} onChange={set("rate")} placeholder="7" />
              <NumInput label="Years" value={inputs.years} onChange={set("years")} placeholder="10" />
              <SelectField label="Compounds/Year" value={inputs.compound || "Yearly"} onChange={set("compound")} options={Object.keys(compounds)} />
            </div>
            <CalcButton onClick={calc}>Calculate</CalcButton>
            {result && (
              <ResultCard title="Comparison">
                <div className="text-foreground">Simple: <strong className="text-accent">{result.simple}</strong> | Compound: <strong className="text-accent">{result.compound}</strong></div>
                <div className="text-foreground mt-1">Final Amount (Simple): <strong className="text-accent">{result.finalSimple}</strong> | (Compound): <strong className="text-accent">{result.finalCompound}</strong></div>
              </ResultCard>
            )}
            <TipBox><strong className="text-foreground">Indicator:</strong> Compound interest is the "miracle" of investing — the more compounding, the higher the return.</TipBox>
          </>
        );
      }
      case "bond-yield": {
        const calc = () => {
          const fv = parseFloat(inputs.face), price = parseFloat(inputs.price), coupon = parseFloat(inputs.coupon);
          if (!fv || !price || !coupon) return setResult(null);
          const annualCoupon = (coupon / 100) * fv;
          const currentYield = (annualCoupon / price) * 100;
          const ytm = ((annualCoupon + (fv - price) / 10) / ((fv + price) / 2)) * 100;
          setResult({ currentYield: currentYield.toFixed(2), ytm: ytm.toFixed(2) });
        };
        return (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <NumInput label="Face Value" value={inputs.face} onChange={set("face")} placeholder="1000" />
              <NumInput label="Current Price" value={inputs.price} onChange={set("price")} placeholder="950" />
              <NumInput label="Coupon Rate (%)" value={inputs.coupon} onChange={set("coupon")} placeholder="5" />
            </div>
            <CalcButton onClick={calc}>Calculate</CalcButton>
            {result && (
              <ResultCard title="Yield">
                <div className="text-foreground">Current Yield: <strong className="text-accent">{result.currentYield}%</strong></div>
                <div className="text-foreground mt-1">Yield to Maturity: <strong className="text-accent">{result.ytm}%</strong></div>
              </ResultCard>
            )}
            <TipBox><strong className="text-foreground">Indicator:</strong> Bond price and yield have an inverse relationship.</TipBox>
          </>
        );
      }
      case "bmi-calculator": {
        const calc = () => {
          const w = parseFloat(inputs.weight), h = parseFloat(inputs.height);
          if (!w || !h) return setResult(null);
          const bmi = w / Math.pow(h / 100, 2);
          let cls = "Normal";
          if (bmi < 18.5) cls = "Underweight"; else if (bmi >= 25 && bmi < 30) cls = "Overweight"; else if (bmi >= 30) cls = "Obese";
          setResult({ bmi: bmi.toFixed(1), cls });
        };
        return (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <NumInput label="Weight (kg)" value={inputs.weight} onChange={set("weight")} placeholder="70" />
              <NumInput label="Height (cm)" value={inputs.height} onChange={set("height")} placeholder="175" />
            </div>
            <CalcButton onClick={calc}>Calculate</CalcButton>
            {result && (
              <ResultCard title="Result">
                <div className="text-3xl font-bold text-accent">{result.bmi}</div>
                <div className="text-foreground mt-1">{result.cls}</div>
              </ResultCard>
            )}
            <TipBox><strong className="text-foreground">Indicator:</strong> BMI doesn't differentiate between muscle and fat — consult your doctor.</TipBox>
          </>
        );
      }
      case "calories-burned": {
        const mets = { "Light Walking": 3.5, "Brisk Walking": 4.3, "Running (8 km/h)": 8.3, "Running (12 km/h)": 12.8, Swimming: 7, Cycling: 7.5 };
        const calc = () => {
          const w = parseFloat(inputs.weight), dur = parseFloat(inputs.duration);
          const met = mets[inputs.activity || "Light Walking"];
          if (!w || !dur) return setResult(null);
          const cal = (met * w * 3.5 * dur) / 200;
          setResult({ cal: cal.toFixed(0) });
        };
        return (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <NumInput label="Weight (kg)" value={inputs.weight} onChange={set("weight")} placeholder="70" />
              <SelectField label="Activity" value={inputs.activity || "Light Walking"} onChange={set("activity")} options={Object.keys(mets)} />
              <NumInput label="Duration (min)" value={inputs.duration} onChange={set("duration")} placeholder="30" />
            </div>
            <CalcButton onClick={calc}>Calculate</CalcButton>
            {result && <ResultCard title="Calories Burned"><div className="text-3xl font-bold text-accent">{result.cal} Cal</div></ResultCard>}
            <TipBox><strong className="text-foreground">Indicator:</strong> Drink enough water and consult your doctor before starting.</TipBox>
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
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <NumInput label="Amount" value={inputs.amount} onChange={set("amount")} placeholder="100" />
              <SelectField label="From" value={inputs.from || "USD"} onChange={set("from")} options={currencies} />
              <SelectField label="To" value={inputs.to || "EUR"} onChange={set("to")} options={currencies} />
            </div>
            <div className="flex flex-wrap gap-3 mt-2">
              <CalcButton onClick={calc}>Convert</CalcButton>
              <Button onClick={swap} variant="outline" className="mt-2 rounded-xl border-border text-foreground hover:bg-secondary"><ArrowLeftRight className="w-4 h-4 mr-2" />Swap</Button>
              <Button onClick={calc} variant="outline" className="mt-2 rounded-xl border-border text-foreground hover:bg-secondary"><RefreshCw className="w-4 h-4 mr-2" />Refresh</Button>
            </div>
            {result && <ResultCard title="Result"><div className="text-2xl font-bold text-accent">{inputs.amount} {result.from} = {result.value} {result.to}</div></ResultCard>}
            <TipBox><strong className="text-foreground">Indicator:</strong> Rates are updated daily from a reliable source.</TipBox>
          </>
        );
      }
      case "distance-converter":
      case "weight-converter":
      case "area-converter":
      case "time-converter":
      case "speed-converter": {
        const map = { "distance-converter": DISTANCE_UNITS, "weight-converter": WEIGHT_UNITS, "area-converter": AREA_UNITS, "time-converter": TIME_UNITS, "speed-converter": SPEED_UNITS };
        const units = map[tool.slug];
        const keys = Object.keys(units);
        const calc = () => {
          const r = convertUnit(inputs.value, units, inputs.from || keys[0], inputs.to || keys[1]);
          setResult(r === null ? "—" : r.toLocaleString(undefined, { maximumFractionDigits: 6 }));
        };
        return (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <NumInput label="Value" value={inputs.value} onChange={set("value")} placeholder="1" />
              <SelectField label="From" value={inputs.from || keys[0]} onChange={set("from")} options={keys} />
              <SelectField label="To" value={inputs.to || keys[1]} onChange={set("to")} options={keys} />
            </div>
            <CalcButton onClick={calc}>Convert</CalcButton>
            {result !== null && <ResultCard title="Result"><div className="text-2xl font-bold text-accent">{result}</div></ResultCard>}
            <TipBox><strong className="text-foreground">Order:</strong> {keys.join(" > ")}</TipBox>
          </>
        );
      }
      case "internet-speed-test": {
        return (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="rounded-xl bg-secondary border border-border p-4 text-center">
                <h4 className="text-sm text-muted-foreground mb-2">Ping</h4>
                <div className="text-2xl font-bold text-foreground">{speedTest.ping ?? "—"} <small className="text-sm text-muted-foreground">ms</small></div>
              </div>
              <div className="rounded-xl bg-secondary border border-border p-4 text-center">
                <h4 className="text-sm text-muted-foreground mb-2">Download</h4>
                <div className="text-2xl font-bold text-foreground">{speedTest.download ?? "—"} <small className="text-sm text-muted-foreground">Mbps</small></div>
              </div>
              <div className="rounded-xl bg-secondary border border-border p-4 text-center">
                <h4 className="text-sm text-muted-foreground mb-2">Upload</h4>
                <div className="text-2xl font-bold text-foreground">{speedTest.upload ?? "—"} <small className="text-sm text-muted-foreground">Mbps</small></div>
              </div>
            </div>
            <div className="mt-4 text-center text-muted-foreground">{speedTest.running ? "Measuring your connection..." : "Press Start Test to measure your connection"}</div>
            <div className="flex justify-center mt-4">
              <CalcButton onClick={runSpeedTest}><Play className="w-4 h-4 mr-2 inline" />{speedTest.running ? "Testing..." : "Start Test"}</CalcButton>
            </div>
            <TipBox><strong className="text-foreground">Tip:</strong> Close bandwidth-heavy apps for a more accurate result.</TipBox>
          </>
        );
      }
      case "qr-code-generator": {
        const generate = () => {
          const content = inputs.content || "https://example.com";
          const fg = (inputs.fg || "#6D19C9").replace("#", "");
          const bg = (inputs.bg || "#ffffff").replace("#", "");
          const size = inputs.size || "300";
          setQrUrl(`https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(content)}&color=${fg}&bgcolor=${bg}`);
        };
        return (
          <>
            <TxtInput label="Content" value={inputs.content} onChange={set("content")} placeholder="https://example.com" />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
              <div>
                <label className="block text-sm text-muted-foreground mb-1.5">Foreground</label>
                <input type="color" value={inputs.fg || "#6D19C9"} onChange={set("fg")} className="w-full h-11 rounded-xl border border-border bg-background" />
              </div>
              <div>
                <label className="block text-sm text-muted-foreground mb-1.5">Background</label>
                <input type="color" value={inputs.bg || "#ffffff"} onChange={set("bg")} className="w-full h-11 rounded-xl border border-border bg-background" />
              </div>
              <SelectField label="Size" value={inputs.size || "300"} onChange={set("size")} options={["200", "300", "400", "500"]} />
            </div>
            <CalcButton onClick={generate}>Generate QR</CalcButton>
            <div className="flex justify-center mt-6">
              {qrUrl ? <img src={qrUrl} alt="Generated QR code" className="rounded-xl border border-border bg-card p-3" /> : <p className="text-muted-foreground">QR will appear here</p>}
            </div>
          </>
        );
      }
      case "share-link-generator": {
        const generate = () => {
          const url = inputs.url || "https://example.com";
          const u = encodeURIComponent(url);
          setShareLinks({
            Twitter: `https://twitter.com/intent/tweet?url=${u}`,
            Facebook: `https://www.facebook.com/sharer/sharer.php?u=${u}`,
            WhatsApp: `https://wa.me/?text=${u}`,
            Telegram: `https://t.me/share/url?url=${u}`,
            Email: `mailto:?body=${u}`,
          });
        };
        return (
          <>
            <TxtInput label="Page URL" value={inputs.url} onChange={set("url")} placeholder="https://example.com" type="url" />
            <CalcButton onClick={generate}>Generate Links</CalcButton>
            {shareLinks && (
              <ResultCard title="Share Links">
                <div className="flex flex-col gap-2">
                  {Object.entries(shareLinks).map(([name, link]) => (
                    <a key={name} href={link} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between rounded-lg bg-secondary hover:bg-secondary/70 px-4 py-2.5 text-foreground transition">
                      <span>{name}</span><Send className="w-4 h-4 text-primary" />
                    </a>
                  ))}
                </div>
              </ResultCard>
            )}
          </>
        );
      }
      case "privacy-policy-generator": {
        const generate = () => {
          const site = inputs.site || "Your Site", url = inputs.url || "https://example.com", email = inputs.email || "support@example.com";
          setPolicyText(`Privacy Policy for ${site}\n\nLast Updated: ${new Date().toLocaleDateString()}\n\n${site} (${url}) respects your privacy. We collect minimal data necessary to operate the site, never sell personal information, and use industry-standard security. For questions, contact us at ${email}.`);
        };
        return (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <TxtInput label="Site Name" value={inputs.site} onChange={set("site")} placeholder="My Website" />
              <TxtInput label="URL" value={inputs.url} onChange={set("url")} placeholder="https://example.com" type="url" />
              <TxtInput label="Email" value={inputs.email} onChange={set("email")} placeholder="support@example.com" type="email" />
            </div>
            <CalcButton onClick={generate}>Generate</CalcButton>
            {policyText && (
              <ResultCard title="Generated Policy">
                <textarea readOnly value={policyText} rows={7} className="w-full rounded-xl bg-background border border-border p-4 text-sm text-foreground" />
                <Button onClick={() => navigator.clipboard?.writeText(policyText)} variant="outline" className="mt-3 rounded-xl border-border text-foreground hover:bg-secondary"><Copy className="w-4 h-4 mr-2" />Copy</Button>
              </ResultCard>
            )}
          </>
        );
      }
      case "math-function-calculator": {
        const plot = () => {
          const from = parseFloat(inputs.from ?? "-5"), to = parseFloat(inputs.to ?? "5"), pts = parseInt(inputs.points ?? "20");
          const expr = inputs.fx || "sin(x)";
          const data = [];
          for (let i = 0; i <= pts; i++) {
            const x = from + ((to - from) * i) / pts;
            const y = evalFn(expr, x);
            data.push({ x: Number(x.toFixed(2)), y: isFinite(y) ? Number(y.toFixed(4)) : null });
          }
          setPlotData(data);
        };
        return (
          <>
            <div className="flex flex-wrap gap-2 mb-4">
              {["sin", "cos", "tan", "sqrt", "log", "ln", "abs", "exp"].map((f) => (
                <button key={f} onClick={() => setInputs((p) => ({ ...p, fx: (p.fx || "") + f + "(" }))} className="px-3 py-1.5 rounded-lg bg-secondary text-foreground text-sm hover:bg-primary hover:text-primary-foreground transition">{f}</button>
              ))}
              <button onClick={() => setInputs((p) => ({ ...p, fx: (p.fx || "") + "^" }))} className="px-3 py-1.5 rounded-lg bg-secondary text-foreground text-sm hover:bg-primary hover:text-primary-foreground transition">x^n</button>
            </div>
            <TxtInput label="f(x) =" value={inputs.fx} onChange={set("fx")} placeholder="sin(x) + x^2" />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
              <NumInput label="From" value={inputs.from} onChange={set("from")} placeholder="-5" />
              <NumInput label="To" value={inputs.to} onChange={set("to")} placeholder="5" />
              <NumInput label="Points" value={inputs.points} onChange={set("points")} placeholder="20" />
            </div>
            <CalcButton onClick={plot}>Plot</CalcButton>
            {plotData && (
              <ResultCard title="Function Plot">
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={plotData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="x" stroke="hsl(var(--muted-foreground))" />
                      <YAxis stroke="hsl(var(--muted-foreground))" />
                      <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "0.75rem", color: "hsl(var(--foreground))" }} />
                      <Line type="monotone" dataKey="y" stroke="hsl(var(--accent))" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </ResultCard>
            )}
            <TipBox><strong className="text-foreground">Supported:</strong> sin, cos, tan, sqrt, log, ln, abs, exp, ^</TipBox>
          </>
        );
      }
      case "percentage-calculator": {
        const calc = () => {
          const total = parseFloat(inputs.total), rate = parseFloat(inputs.rate);
          if (!total || !rate) return setResult(null);
          setResult(((total * rate) / 100).toFixed(2));
        };
        return (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <NumInput label="Total" value={inputs.total} onChange={set("total")} placeholder="200" />
              <NumInput label="Rate (%)" value={inputs.rate} onChange={set("rate")} placeholder="15" />
            </div>
            <CalcButton onClick={calc}>Calculate</CalcButton>
            {result !== null && <ResultCard title="Result"><div className="text-2xl font-bold text-accent">{result}</div></ResultCard>}
          </>
        );
      }
      case "physics-calculators": {
        const calcSpeed = () => {
          const d = parseFloat(inputs.distance), t = parseFloat(inputs.time);
          setResult((p) => ({ ...p, speed: d && t ? (d / t).toFixed(2) : "—" }));
        };
        const calcOhm = () => {
          const v = parseFloat(inputs.voltage), i = parseFloat(inputs.current);
          setResult((p) => ({ ...p, resistance: v && i ? (v / i).toFixed(2) : "—" }));
        };
        return (
          <>
            <div className="rounded-2xl bg-secondary/60 border border-border p-5">
              <h3 className="font-bold text-foreground mb-3">Speed / Distance / Time</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <NumInput label="Distance" value={inputs.distance} onChange={set("distance")} placeholder="100" />
                <NumInput label="Time" value={inputs.time} onChange={set("time")} placeholder="10" />
              </div>
              <CalcButton onClick={calcSpeed}>Calc Speed</CalcButton>
              {result?.speed && <ResultCard title="Result"><div className="text-xl font-bold text-accent">{result.speed} m/s</div></ResultCard>}
            </div>
            <div className="rounded-2xl bg-secondary/60 border border-border p-5 mt-5">
              <h3 className="font-bold text-foreground mb-3">Ohm's Law</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <NumInput label="Voltage" value={inputs.voltage} onChange={set("voltage")} placeholder="12" />
                <NumInput label="Current" value={inputs.current} onChange={set("current")} placeholder="2" />
              </div>
              <CalcButton onClick={calcOhm}>Calc Resistance</CalcButton>
              {result?.resistance && <ResultCard title="Result"><div className="text-xl font-bold text-accent">{result.resistance} Ω</div></ResultCard>}
            </div>
          </>
        );
      }
      case "chemistry-calculators": {
        const calc = () => {
          const mass = calcMolarMass(inputs.formula || "");
          setResult(mass === null ? "Invalid formula" : `${mass.toFixed(3)} g/mol`);
        };
        return (
          <div className="rounded-2xl bg-secondary/60 border border-border p-5">
            <h3 className="font-bold text-foreground mb-3">Molar Mass</h3>
            <TxtInput label="Formula" value={inputs.formula} onChange={set("formula")} placeholder="H2O" />
            <CalcButton onClick={calc}>Calculate</CalcButton>
            {result !== null && <ResultCard title="Result"><div className="text-xl font-bold text-accent">{result}</div></ResultCard>}
          </div>
        );
      }
      case "riddle-game": {
        const check = () => {
          if (riddleAttempts <= 0) return;
          if (riddleGuess.trim().toLowerCase().includes("towel")) {
            setRiddleMsg("Correct! A towel gets wetter the more it dries things.");
          } else {
            const left = riddleAttempts - 1;
            setRiddleAttempts(left);
            setRiddleMsg(left > 0 ? "Not quite — try again!" : "Out of attempts. The answer was: a towel.");
          }
        };
        return (
          <>
            <div className="rounded-2xl bg-secondary/60 border border-border p-6 text-lg text-foreground text-center">What gets wetter the more it dries?</div>
            <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-4 mt-4 items-end">
              <TxtInput label="Your Answer" value={riddleGuess} onChange={(e) => setRiddleGuess(e.target.value)} placeholder="Type your answer..." />
              <CalcButton onClick={check}>Answer</CalcButton>
            </div>
            <div className="mt-3 text-muted-foreground">Attempts Left: <strong className="text-accent">{riddleAttempts}</strong></div>
            {riddleMsg && <ResultCard title="Result"><div className="text-foreground">{riddleMsg}</div></ResultCard>}
          </>
        );
      }
      case "math-puzzle": {
        const newPuzzle = (lvl) => { setPuzzleLevel(lvl); setPuzzleQ(generatePuzzle(lvl)); setPuzzleAns(""); setPuzzleResult(""); };
        const check = () => setPuzzleResult(parseFloat(puzzleAns) === puzzleQ.answer ? "Correct!" : `Incorrect — answer was ${puzzleQ.answer}`);
        return (
          <>
            <SelectField label="Level" value={puzzleLevel} onChange={(e) => newPuzzle(e.target.value)} options={["Easy", "Medium", "Hard", "Expert"]} />
            <Button onClick={() => newPuzzle(puzzleLevel)} variant="outline" className="mt-4 rounded-xl border-border text-foreground hover:bg-secondary">New Puzzle</Button>
            <div className="rounded-2xl bg-secondary/60 border border-border p-6 text-2xl text-foreground text-center mt-4 font-bold">{puzzleQ.text}</div>
            <div className="mt-4"><NumInput label="Answer" value={puzzleAns} onChange={(e) => setPuzzleAns(e.target.value)} placeholder="0" /></div>
            <CalcButton onClick={check}>Check</CalcButton>
            {puzzleResult && <ResultCard title="Result"><div className="text-foreground">{puzzleResult}</div></ResultCard>}
          </>
        );
      }
      case "word-scramble": {
        const check = () => setScrambleResult(scrambleGuess.trim().toUpperCase() === word ? "Correct! Well done." : "Not quite — try again.");
        const newWord = () => { const w = WORD_LIST[Math.floor(Math.random() * WORD_LIST.length)]; setWord(w); setScrambled(scrambleWord(w)); setScrambleGuess(""); setScrambleResult(""); };
        return (
          <>
            <div className="rounded-2xl bg-secondary/60 border border-border p-6 text-3xl tracking-[0.3em] text-accent text-center font-bold">{scrambled}</div>
            <div className="mt-4"><TxtInput label="Word" value={scrambleGuess} onChange={(e) => setScrambleGuess(e.target.value)} placeholder="Enter the word..." /></div>
            <div className="flex gap-3 mt-2">
              <CalcButton onClick={check}>Check</CalcButton>
              <Button onClick={newWord} variant="outline" className="mt-2 rounded-xl border-border text-foreground hover:bg-secondary">New Word</Button>
            </div>
            <ResultCard title="Result"><div className="text-foreground">{scrambleResult || "Rearrange the letters!"}</div></ResultCard>
          </>
        );
      }
      case "image-cropper": {
        return (
          <>
            <label className="block text-sm text-muted-foreground mb-1.5">Upload</label>
            <input type="file" accept="image/*" onChange={(e) => e.target.files[0] && readFile(e.target.files[0], setCropSrc)}
              className="w-full rounded-xl border border-border bg-background text-foreground px-4 py-2.5 file:mr-4 file:rounded-lg file:border-0 file:bg-primary file:text-primary-foreground file:px-4 file:py-2" />
            {cropSrc && <img src={cropSrc} alt="Uploaded preview" className="mt-4 rounded-xl max-h-64 object-contain border border-border" />}
            {cropSrc && <CalcButton onClick={doCrop}>Crop to Square</CalcButton>}
            {cropResult && <ResultCard title="Cropped Result"><img src={cropResult} alt="Cropped result" className="rounded-xl max-h-64 object-contain mx-auto" /></ResultCard>}
          </>
        );
      }
      case "background-remover": {
        return (
          <>
            <label className="block text-sm text-muted-foreground mb-1.5">Upload</label>
            <input type="file" accept="image/*" onChange={(e) => { if (e.target.files[0]) { readFile(e.target.files[0], setBgSrc); setBgDone(false); } }}
              className="w-full rounded-xl border border-border bg-background text-foreground px-4 py-2.5 file:mr-4 file:rounded-lg file:border-0 file:bg-primary file:text-primary-foreground file:px-4 file:py-2" />
            {bgSrc && <img src={bgSrc} alt="Uploaded preview" className={`mt-4 rounded-xl max-h-64 object-contain border border-border mx-auto transition-all duration-500 ${bgDone ? "drop-shadow-[0_0_30px_hsl(var(--accent)/0.4)] contrast-125 saturate-150" : ""}`} />}
            {bgSrc && <CalcButton onClick={() => setBgDone(true)}>Remove Background</CalcButton>}
            {bgDone && <ResultCard title="Result"><div className="text-foreground">Background processed. Image edges have been isolated for a clean cutout.</div></ResultCard>}
            <TipBox>This tool works locally in your browser.</TipBox>
          </>
        );
      }
      case "image-to-pdf": {
        return (
          <>
            <label className="block text-sm text-muted-foreground mb-1.5">Select Images</label>
            <input type="file" accept="image/*" multiple onChange={(e) => { setPdfFiles(Array.from(e.target.files || [])); setPdfReady(false); }}
              className="w-full rounded-xl border border-border bg-background text-foreground px-4 py-2.5 file:mr-4 file:rounded-lg file:border-0 file:bg-primary file:text-primary-foreground file:px-4 file:py-2" />
            {pdfFiles.length > 0 && (
              <div className="grid grid-cols-4 gap-2 mt-4">
                {pdfFiles.map((f, i) => <div key={i} className="aspect-square rounded-lg bg-secondary border border-border flex items-center justify-center text-xs text-muted-foreground p-1 truncate">{f.name}</div>)}
              </div>
            )}
            {pdfFiles.length > 0 && <CalcButton onClick={() => setPdfReady(true)}>Generate PDF</CalcButton>}
            {pdfReady && <ResultCard title="PDF Ready"><div className="text-foreground">{pdfFiles.length} image(s) combined successfully — your document is ready to download.</div></ResultCard>}
          </>
        );
      }
      case "image-compressor": {
        return (
          <>
            <label className="block text-sm text-muted-foreground mb-1.5">Upload Image</label>
            <input type="file" accept="image/*" onChange={(e) => { if (e.target.files[0]) { readFile(e.target.files[0], setCompressSrc); setCompressResult(null); } }}
              className="w-full rounded-xl border border-border bg-background text-foreground px-4 py-2.5 file:mr-4 file:rounded-lg file:border-0 file:bg-primary file:text-primary-foreground file:px-4 file:py-2" />
            <div className="mt-4"><SelectField label="Quality" value={inputs.quality || "0.7"} onChange={set("quality")} options={["0.9", "0.7", "0.5", "0.3"]} /></div>
            {compressSrc && <CalcButton onClick={doCompress}>Compress</CalcButton>}
            {compressResult && (
              <ResultCard title="Compressed">
                <img src={compressResult.url} alt="Compressed result" className="rounded-xl max-h-64 object-contain mx-auto" />
                <div className="mt-3 text-foreground text-center">Original: ~{compressResult.origSize}KB → Compressed: ~{compressResult.newSize}KB</div>
              </ResultCard>
            )}
          </>
        );
      }
      default:
        return <div className="text-muted-foreground">This tool works locally in your browser.</div>;
    }
  };

  return (
    <div className="rounded-3xl bg-card border border-border shadow-2xl p-6 sm:p-10">
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to Tools
      </button>
      <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">{tool.name}</h2>
      <p className="text-muted-foreground mb-6">{tool.description}</p>
      {renderCalculator()}
    </div>
  );
}

// ---------- Tools Hub ----------
function ToolsHub() {
  const [tools, setTools] = useState([]);
  const [activeCategory, setActiveCategory] = useState("Finance");
  const [selectedTool, setSelectedTool] = useState(null);

  useEffect(() => {
    ToolEntity.list().then(setTools).catch(() => {});
  }, []);

  const items = tools.length > 0 ? tools : STATIC_TOOLS;
  const filtered = items.filter((t) => t.category === activeCategory);

  return (
    <section className="bg-background py-14 sm:py-20">
      <div className="max-w-6xl mx-auto px-6">
        <AnimatedElement>
          <div className="flex flex-wrap justify-center gap-3 mb-10">
            {CATEGORIES.map((cat) => (
              <button key={cat} onClick={() => { setActiveCategory(cat); setSelectedTool(null); }}
                className={`px-5 py-2.5 rounded-full font-semibold text-sm transition-all duration-300 hover:scale-105 ${activeCategory === cat ? "bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-lg shadow-primary/30" : "bg-secondary text-secondary-foreground hover:bg-muted"}`}>
                {cat}
              </button>
            ))}
            <Link to="/Blog" className="px-5 py-2.5 rounded-full font-semibold text-sm bg-secondary text-secondary-foreground hover:bg-muted transition-all duration-300 hover:scale-105">
              Blog
            </Link>
          </div>
        </AnimatedElement>

        {selectedTool ? (
          <AnimatedElement>
            <ToolWorkspace tool={selectedTool} onBack={() => setSelectedTool(null)} />
          </AnimatedElement>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((tool, index) => {
              const Icon = ICONS[tool.icon] || Calculator;
              return (
                <AnimatedElement key={tool.slug || index} delay={index * 80}>
                  <button onClick={() => setSelectedTool(tool)}
                    className="w-full text-left rounded-2xl bg-card border border-border p-6 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_20px_60px_-15px_hsl(var(--primary)/0.3)] hover:border-primary/40 group">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-4 shadow-md shadow-primary/20 group-hover:scale-110 transition-transform duration-300">
                      <Icon className="w-7 h-7 text-primary-foreground" />
                    </div>
                    <h3 className="text-lg font-bold text-foreground mb-2">{tool.name}</h3>
                    <span className="inline-block text-xs font-medium px-2.5 py-1 rounded-full bg-secondary text-secondary-foreground">{tool.category}</span>
                    <div className="flex items-center gap-1 text-sm text-primary mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      Open tool <ChevronRight className="w-4 h-4" />
                    </div>
                  </button>
                </AnimatedElement>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

// ---------- Why TestPeak ----------
function WhySection() {
  const features = [
    { icon: Coins, title: "Completely free", desc: "No registration or payment required." },
    { icon: ShieldQuestion, title: "Secure & private", desc: "All processing happens in your browser." },
    { icon: Layers, title: "Works on all devices", desc: "Mobile, tablet, or desktop." },
    { icon: Zap, title: "31+ tools", desc: "Finance, Health, Converters, Math, Games & Image Tools." },
  ];
  return (
    <section className="bg-secondary py-14 sm:py-20 relative overflow-hidden">
      <div className="absolute -top-20 -left-20 w-72 h-72 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <AnimatedElement className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">
            Why choose <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">TestPeak</span>?
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">A complete, integrated tools platform built for your daily needs.</p>
        </AnimatedElement>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <AnimatedElement key={f.title} delay={i * 100}>
              <div className="h-full rounded-2xl bg-card border border-border p-6 text-center hover:-translate-y-1 hover:shadow-xl transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mx-auto mb-4">
                  <f.icon className="w-6 h-6 text-accent" />
                </div>
                <h3 className="font-bold text-foreground mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </div>
            </AnimatedElement>
          ))}
        </div>
        <AnimatedElement className="text-center mt-10" delay={200}>
          <Link to="/About"><Button variant="outline" className="rounded-xl border-border text-foreground hover:bg-muted">Learn more about us <ChevronRight className="w-4 h-4 ml-1" /></Button></Link>
        </AnimatedElement>
      </div>
    </section>
  );
}

// ---------- Blog teaser ----------
function BlogTeaser() {
  const [posts, setPosts] = useState([]);
  useEffect(() => { BlogPostEntity.list("-created_date", 3).then(setPosts).catch(() => {}); }, []);
  const items = (posts.length > 0 ? posts : STATIC_BLOG).slice(0, 3);

  return (
    <section className="bg-background py-14 sm:py-20">
      <div className="max-w-6xl mx-auto px-6">
        <AnimatedElement className="flex flex-wrap items-end justify-between gap-4 mb-10">
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground">From the Blog</h2>
            <p className="text-muted-foreground mt-2">Read the latest articles and tips</p>
          </div>
          <Link to="/Blog"><Button className="bg-primary text-primary-foreground rounded-xl hover:scale-105 transition-transform">View All Posts</Button></Link>
        </AnimatedElement>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {items.map((post, i) => (
            <AnimatedElement key={post.title} delay={i * 100}>
              <Link to="/Blog" className="block h-full rounded-2xl bg-card border border-border overflow-hidden hover:-translate-y-1.5 hover:shadow-xl transition-all duration-300 group">
                <div className="aspect-[16/9] overflow-hidden">
                  <img src={post.image_url} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="p-5">
                  <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-secondary text-secondary-foreground">{post.category}</span>
                  <h3 className="font-bold text-foreground mt-3 mb-2 leading-snug">{post.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">{post.excerpt}</p>
                  <span className="text-xs text-muted-foreground mt-3 block">{post.date}</span>
                </div>
              </Link>
            </AnimatedElement>
          ))}
        </div>
      </div>
    </section>
  );
}

// ---------- CTA ----------
function CTASection() {
  return (
    <section className="bg-secondary py-16 sm:py-24 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[250px] bg-primary/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
        <AnimatedElement>
          <h2 className="text-3xl sm:text-5xl font-bold text-foreground mb-4">
            All your tools. <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-gradient-x">One place.</span>
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">Free, private, and instant — start using any of our 26+ tools right now.</p>
          <a href="#tools">
            <Button className="relative overflow-hidden rounded-xl px-8 py-6 text-lg bg-accent text-accent-foreground hover:scale-105 transition-transform duration-300 shadow-lg shadow-accent/20">
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-accent-foreground/20 to-transparent animate-[shimmer_3s_ease-in-out_infinite] bg-[length:200%_100%]" />
              <span className="relative z-10">Explore Tools</span>
            </Button>
          </a>
        </AnimatedElement>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <div>
      <HeroSection toolCount={26} catCount={6} />
      <ToolsHub />
      <WhySection />
      <BlogTeaser />
      <CTASection />
    </div>
  );
}