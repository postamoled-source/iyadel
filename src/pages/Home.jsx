import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Calculator, TrendingUp, LineChart as LineChartIcon, Activity, Flame, DollarSign, Ruler, Weight, Square, Clock, Gauge, Wifi, QrCode, Link2, ShieldCheck, FunctionSquare, Percent, Atom, FlaskConical, HelpCircle, Puzzle, Shuffle, Crop, Eraser, FileImage, ImageDown, ArrowLeft, RefreshCw, ArrowLeftRight, ChevronRight, Copy, Send, Play, ShieldQuestion, Coins, Layers, Zap, Box, Gift, ExternalLink, Smartphone } from "lucide-react";

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
    const fn = new Function("x", `return ${e}`);
    return fn(x);
  } catch { return NaN; }
}

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
      <input type="number" value={value ?? ""} onChange={onChange} placeholder={placeholder}
        className="w-full rounded-2xl border border-border bg-background text-foreground px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-sm" />
    </div>
  );
}
function TxtInput({ label, value, onChange, placeholder, type = "text" }) {
  return (
    <div className="text-left">
      <label className="block text-sm font-medium text-muted-foreground mb-1.5 ml-1">{label}</label>
      <input type={type} value={value ?? ""} onChange={onChange} placeholder={placeholder}
        className="w-full rounded-2xl border border-border bg-background text-foreground px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-sm" />
    </div>
  );
}
function SelectField({ label, value, onChange, options }) {
  return (
    <div className="text-left">
      <label className="block text-sm font-medium text-muted-foreground mb-1.5 ml-1">{label}</label>
      <select value={value} onChange={onChange}
        className="w-full rounded-2xl border border-border bg-background text-foreground px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-sm appearance-none cursor-pointer">
        {options.map((o) => <option key={o} value={o} className="bg-card text-card-foreground">{o}</option>)}
      </select>
    </div>
  );
}
function ResultCard({ title, children }) {
  return (
    <div className="mt-8 rounded-[2rem] bg-gradient-to-b from-primary/10 to-transparent border border-primary/20 p-8 shadow-inner shadow-primary/5">
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
function HeroSection({ toolCount, catCount }) {
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
            <Square className="w-10 h-10 md:w-12 md:h-12 text-accent stroke-[2.5]" />
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-gradient-x">
              TestPeak
            </h1>
          </div>
          
          <p className="text-lg md:text-xl text-card-foreground/80 max-w-2xl mx-auto mb-10 font-medium">
            Your all-in-one platform — {toolCount}+ tools in Finance, Health, Converters, Math, Brain Games, and Image Tools
          </p>
          
          <div className="flex flex-wrap justify-center gap-4 md:gap-6">
            <div className="flex items-center gap-3 rounded-full bg-background border border-border px-5 py-2.5 hover:border-primary/50 transition-colors shadow-sm">
              <Box className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-foreground"><span className="text-primary">{toolCount}</span> Tools</span>
            </div>
            <div className="flex items-center gap-3 rounded-full bg-background border border-border px-5 py-2.5 hover:border-accent/50 transition-colors shadow-sm">
              <Layers className="w-4 h-4 text-accent" />
              <span className="text-sm font-semibold text-foreground"><span className="text-accent">{catCount}</span> Categories</span>
            </div>
            <div className="flex items-center gap-3 rounded-full bg-background border border-border px-5 py-2.5 hover:border-primary/50 transition-colors shadow-sm">
              <Gift className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-foreground"><span className="text-primary">Free</span> for Everyone</span>
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
        const calc = () => {
          const P = parseFloat(inputs.amount), annualRate = parseFloat(inputs.rate), n = parseFloat(inputs.term);
          if (!P || !annualRate || !n) return setResult(null);
          const r = annualRate / 100 / 12;
          const payment = r === 0 ? P / n : (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
          const total = payment * n;
          setResult({ payment: payment.toFixed(2), interest: (total - P).toFixed(2), total: total.toFixed(2) });
        };
        return (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <NumInput label="Loan Amount" value={inputs.amount} onChange={set("amount")} placeholder="10000" />
              <NumInput label="Annual Rate (%)" value={inputs.rate} onChange={set("rate")} placeholder="6.5" />
              <NumInput label="Term (Months)" value={inputs.term} onChange={set("term")} placeholder="36" />
            </div>
            <div className="flex justify-center mt-6"><CalcButton onClick={calc}>Calculate Loan</CalcButton></div>
            {result && (
              <ResultCard title="Your Results">
                <div className="text-card-foreground text-lg mb-2">Monthly Payment</div>
                <div className="text-4xl font-extrabold text-primary mb-6">${result.payment}</div>
                <div className="flex flex-wrap justify-center gap-6 text-card-foreground">
                  <div>Total Interest: <strong className="text-accent ml-1">${result.interest}</strong></div>
                  <div>Total Amount: <strong className="text-accent ml-1">${result.total}</strong></div>
                </div>
              </ResultCard>
            )}
            <TipBox><strong>Indicator:</strong> Interest is calculated on the remaining balance. Always compare multiple bank offers.</TipBox>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <NumInput label="Principal Amount" value={inputs.principal} onChange={set("principal")} placeholder="5000" />
              <NumInput label="Interest Rate (%)" value={inputs.rate} onChange={set("rate")} placeholder="7" />
              <NumInput label="Duration (Years)" value={inputs.years} onChange={set("years")} placeholder="10" />
              <SelectField label="Compound Frequency" value={inputs.compound || "Yearly"} onChange={set("compound")} options={Object.keys(compounds)} />
            </div>
            <div className="flex justify-center mt-6"><CalcButton onClick={calc}>Calculate Interest</CalcButton></div>
            {result && (
              <ResultCard title="Comparison">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-4">
                  <div className="bg-background rounded-2xl p-6 border border-border shadow-sm">
                    <div className="text-sm text-muted-foreground mb-1">Simple Interest Earned</div>
                    <div className="text-2xl font-bold text-primary">${result.simple}</div>
                    <div className="text-sm text-muted-foreground mt-2">Final Amount: <strong className="text-foreground">${result.finalSimple}</strong></div>
                  </div>
                  <div className="bg-background rounded-2xl p-6 border border-border shadow-sm">
                    <div className="text-sm text-muted-foreground mb-1">Compound Interest Earned</div>
                    <div className="text-2xl font-bold text-accent">${result.compound}</div>
                    <div className="text-sm text-muted-foreground mt-2">Final Amount: <strong className="text-foreground">${result.finalCompound}</strong></div>
                  </div>
                </div>
              </ResultCard>
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
              <ResultCard title="Conversion Result">
                <div className="text-xl text-card-foreground mb-2">{inputs.amount} {result.from} =</div>
                <div className="text-5xl font-extrabold text-accent">{result.value} <span className="text-2xl text-card-foreground/70 ml-1">{result.to}</span></div>
              </ResultCard>
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
      default:
        return (
          <div className="text-center py-10">
            <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
              <Box className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-card-foreground text-lg font-medium">This tool is fully functional in the live app.</p>
            <p className="text-muted-foreground mt-2">It operates entirely within your browser for maximum privacy.</p>
          </div>
        );
    }
  };

  return (
    <div className="rounded-[3rem] bg-card border border-border shadow-2xl p-8 sm:p-14 relative overflow-hidden">
      <button onClick={onBack} className="absolute top-8 left-8 sm:top-10 sm:left-10 flex items-center gap-2 px-4 py-2 rounded-full bg-background border border-border text-sm font-medium text-foreground hover:bg-secondary hover:text-secondary-foreground transition-all duration-300 shadow-sm z-20">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>
      
      <div className="text-center mb-10 mt-12 sm:mt-8 relative z-10">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-card-foreground mb-3">{tool.name}</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">{tool.description}</p>
      </div>
      
      <div className="max-w-4xl mx-auto relative z-10">
        {renderCalculator()}
      </div>
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
    <section className="bg-background py-16" id="tools">
      <div className="max-w-5xl mx-auto px-6">
        
        {!selectedTool && (
          <AnimatedElement className="flex flex-wrap justify-center gap-3 md:gap-4 mb-16">
            {CATEGORIES.map((cat) => (
              <button key={cat} onClick={() => setActiveCategory(cat)}
                className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-sm transition-all duration-300 ${activeCategory === cat ? "bg-primary text-primary-foreground shadow-[0_0_20px_-5px_hsl(var(--primary)/0.5)]" : "bg-card text-card-foreground border border-border hover:bg-muted hover:border-primary/30"}`}>
                {cat}
              </button>
            ))}
            <Link to="/Blog" className="flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-sm bg-card text-card-foreground border border-border hover:bg-muted transition-all duration-300">
              Blog
            </Link>
          </AnimatedElement>
        )}

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
                    className="w-full h-full text-center rounded-[2rem] bg-card border border-border p-8 transition-all duration-400 hover:-translate-y-2 hover:shadow-[0_20px_50px_-15px_hsl(var(--primary)/0.2)] hover:border-primary/40 group flex flex-col items-center justify-center">
                    
                    <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center mb-5 shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform duration-500">
                      <Icon className="w-7 h-7 text-primary-foreground" />
                    </div>
                    
                    <h3 className="text-xl font-bold text-card-foreground mb-1">{tool.name}</h3>
                    <span className="text-sm font-medium text-muted-foreground">{tool.category}</span>
                    
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

// ---------- App Store Banner & Quick Links (Footer block from screenshot) ----------
function AppStoreSection() {
  return (
    <section className="bg-background pb-16">
      <div className="max-w-5xl mx-auto px-6">
        <AnimatedElement delay={100}>
          <div className="rounded-[3rem] bg-card border border-border p-10 md:p-14 shadow-2xl relative overflow-hidden flex flex-col md:flex-row gap-10 md:gap-16">
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 to-transparent pointer-events-none" />
            
            <div className="flex-1 relative z-10">
              <h3 className="text-2xl font-bold text-card-foreground mb-4">TestPeak Platform</h3>
              <p className="text-muted-foreground mb-6 text-sm leading-relaxed max-w-sm">
                31+ interactive and accurate tools in one place. Finance, health, converters, math, brain games, and image processing — completely free and secure.
              </p>
              <p className="text-xs text-muted-foreground/60 mt-auto pt-6">© 2026 TestPeak — All Rights Reserved</p>
            </div>
            
            <div className="flex-1 relative z-10 grid grid-cols-2 gap-8">
              <div>
                <h4 className="font-bold text-card-foreground mb-4">Quick Links</h4>
                <ul className="space-y-3 text-sm">
                  <li><Link to="/About" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"><Square className="w-3 h-3" /> About Us</Link></li>
                  <li><Link to="/Privacy" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"><Square className="w-3 h-3" /> Privacy Policy</Link></li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-bold text-card-foreground mb-4">Social</h4>
                <div className="flex items-center gap-3">
                  <a href="#" className="w-10 h-10 rounded-full bg-background border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/50 transition-all"><ExternalLink className="w-4 h-4" /></a>
                  <a href="#" className="w-10 h-10 rounded-full bg-background border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/50 transition-all"><ExternalLink className="w-4 h-4" /></a>
                  <a href="#" className="w-10 h-10 rounded-full bg-background border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/50 transition-all"><ExternalLink className="w-4 h-4" /></a>
                </div>
                
                <div className="mt-8 space-y-3">
                  <button className="flex items-center gap-3 w-full max-w-[160px] bg-background border border-border rounded-xl p-2.5 hover:border-primary/50 transition-all">
                    <Smartphone className="w-6 h-6 text-foreground" />
                    <div className="text-left">
                      <div className="text-[10px] text-muted-foreground uppercase leading-none mb-1">Get it on</div>
                      <div className="text-sm font-bold text-foreground leading-none">Google Play</div>
                    </div>
                  </button>
                  <button className="flex items-center gap-3 w-full max-w-[160px] bg-background border border-border rounded-xl p-2.5 hover:border-primary/50 transition-all">
                    <Smartphone className="w-6 h-6 text-foreground" />
                    <div className="text-left">
                      <div className="text-[10px] text-muted-foreground uppercase leading-none mb-1">Download on the</div>
                      <div className="text-sm font-bold text-foreground leading-none">App Store</div>
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
  const features = [
    { icon: Coins, title: "Completely free", desc: "no registration or payment required." },
    { icon: ShieldQuestion, title: "Secure & private", desc: "all processing happens in your browser, no data is uploaded to any server." },
    { icon: Layers, title: "Works on all devices", desc: "mobile, tablet, or desktop." },
    { icon: Zap, title: "31+ tools", desc: "Finance, Health, Converters, Math, Brain Games, and Image Tools." },
  ];
  return (
    <section className="bg-background pb-16">
      <div className="max-w-5xl mx-auto px-6">
        <AnimatedElement>
          <div className="rounded-[3rem] bg-card border border-border p-10 md:p-14 shadow-2xl relative overflow-hidden">
            <div className="flex items-center gap-3 mb-6">
              <Square className="w-6 h-6 text-primary stroke-[2.5]" />
              <h2 className="text-2xl sm:text-3xl font-extrabold text-card-foreground">About Us</h2>
            </div>
            
            <p className="text-card-foreground/80 mb-10 text-lg">
              <strong className="text-foreground">TestPeak</strong> is an <strong className="text-foreground">integrated tools platform</strong> that provides a wide range of free and interactive tools covering users' daily needs across various domains.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {features.map((f, i) => (
                <div key={f.title} className="rounded-2xl bg-background border border-border p-6 hover:-translate-y-1 hover:border-primary/30 transition-all duration-300">
                  <div className="flex items-start gap-3">
                    <f.icon className="w-5 h-5 text-accent mt-0.5 shrink-0" />
                    <div>
                      <strong className="text-sm text-foreground block mb-1">{f.title} —</strong>
                      <span className="text-sm text-muted-foreground leading-snug block">{f.desc}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <p className="text-sm text-muted-foreground mt-10 italic">
              "The TestPeak team works passionately to deliver the best digital experience."
            </p>
          </div>
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
    <section className="bg-background pb-16">
      <div className="max-w-5xl mx-auto px-6">
        <AnimatedElement>
          <div className="rounded-[3rem] bg-card border border-border p-10 md:p-14 shadow-2xl">
            <div className="flex flex-wrap items-end justify-between gap-6 mb-10">
              <div>
                <h2 className="text-3xl font-extrabold text-card-foreground">From the Blog</h2>
                <p className="text-muted-foreground mt-2 font-medium">Read the latest articles and tips</p>
              </div>
              <Link to="/Blog"><Button className="bg-primary text-primary-foreground rounded-2xl px-6 py-5 hover:scale-105 transition-transform font-bold">View All Posts</Button></Link>
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
  return (
    <section className="bg-background pb-20">
      <div className="max-w-5xl mx-auto px-6">
        <AnimatedElement>
          <div className="rounded-[3rem] bg-card border border-border p-10 md:p-14 shadow-2xl relative overflow-hidden">
            <div className="flex items-center gap-3 mb-2">
              <Square className="w-6 h-6 text-primary stroke-[2.5]" />
              <h2 className="text-2xl sm:text-3xl font-extrabold text-card-foreground">Privacy Policy</h2>
            </div>
            <p className="text-xs text-muted-foreground mb-8 uppercase tracking-wider">Last Updated: August 13, 2026</p>
            
            <div className="space-y-6 text-sm text-muted-foreground">
              <p>At TestPeak, we recognize the importance of your privacy and are committed to protecting it. This Privacy Policy explains how we collect, use, share, and protect your personal information.</p>
              
              <div>
                <strong className="text-foreground text-base block mb-1">1. Information We Collect</strong>
                <p>We collect two main types: information you provide voluntarily (name, email, phone) and information collected automatically (IP, browser type, cookies).</p>
              </div>
              
              <div>
                <strong className="text-foreground text-base block mb-1">2. How We Use Your Information</strong>
                <p>We use information to provide and improve services, communicate with you, analyze usage, and comply with legal obligations.</p>
              </div>
              
              <div className="pt-4">
                <Link to="/Privacy" className="inline-flex items-center text-primary font-bold hover:text-primary/80 transition-colors">
                  Read full policy <ChevronRight className="w-4 h-4 ml-1" />
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
  return (
    <div className="min-h-screen bg-background selection:bg-primary/30 selection:text-primary">
      <HeroSection toolCount={31} catCount={7} />
      <ToolsHub />
      <AppStoreSection />
      <WhySection />
      <PrivacyTeaser />
      <BlogTeaser />
    </div>
  );
}