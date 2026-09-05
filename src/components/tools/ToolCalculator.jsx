import { useState, useEffect, useRef } from "react";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { getExchangeRates } from "@/functions/getExchangeRates";
import { generateLogo } from "@/functions/generateLogo";
import Game2048 from "@/components/games/Game2048";
import MemoryMatch from "@/components/games/MemoryMatch";
import WhackAMole from "@/components/games/WhackAMole";
import BallLauncher from "@/components/games/BallLauncher";
import SnakeGame from "@/components/games/SnakeGame";
import MathPuzzleGame from "@/components/games/MathPuzzleGame";
import WordScrambleGame from "@/components/games/WordScrambleGame";
import GameMusicButton from "@/components/games/GameMusicButton";
import PercentageCalculator from "@/components/tools/PercentageCalculator";
import JpgToPngConverter from "@/components/tools/JpgToPngConverter";
import ImageResizer from "@/components/tools/ImageResizer";
import MathTools from "@/components/tools/MathTools";
import HealthTools from "@/components/tools/HealthTools";
import { NumInput, TxtInput, FnInput, SelectField, RangeField, ResultCard, ResultCircle, InsightBox, TipBox, CalcButton } from "@/components/tools/ToolUI";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, AreaChart, Area, Legend } from "recharts";
import { jsPDF } from "jspdf";
import { DISTANCE_UNITS, WEIGHT_UNITS, AREA_UNITS, TIME_UNITS, SPEED_UNITS, CURRENCY_RATES, RIDDLES, RIDDLES_AR, convertUnit, calcMolarMass, compileExpr, FN_COLORS } from "@/lib/tool-utils";
import {
  DollarSign, TrendingUp, Coins, Activity, Flame, Ruler, Weight, Square, Clock, Gauge, Wifi,
  QrCode, Link2, ShieldCheck, Send, Copy, Play, ArrowLeftRight, X, Shuffle, Wand2, ImageDown,
  Zap, Atom, Box, SlidersHorizontal, RefreshCw,
} from "lucide-react";

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
  const ff = { Sans: "sans-serif", Serif: "serif", Mono: "monospace", Poppins: "Poppins, sans-serif", Playfair: "'Playfair Display', serif", Pacifico: "Pacifico, cursive", Bebas: "'Bebas Neue', sans-serif", Lobster: "Lobster, cursive", Oswald: "Oswald, sans-serif", Anton: "Anton, sans-serif", Montserrat: "Montserrat, sans-serif", Dancing: "'Dancing Script', cursive" }[p.font] || "sans-serif";
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
  } else if (p.template === "Gradient") {
    const grad = ctx.createLinearGradient(cx - 240, 0, cx + 240, 0);
    grad.addColorStop(0, primary); grad.addColorStop(1, accent);
    const size = fitSize(brand, 86 * sc, 520, "bold ");
    ctx.font = "bold " + size + "px " + ff; ctx.fillStyle = grad; ctx.fillText(brand, cx, 300);
    ctx.fillStyle = accent; ctx.fillRect(cx - 80, 345, 160, 5);
    drawTag(400, 28, 460);
  } else if (p.template === "Lettermark") {
    const letter = (brand || "A").trim().charAt(0).toUpperCase() || "A";
    const grad = ctx.createLinearGradient(0, 120, 0, 480);
    grad.addColorStop(0, primary); grad.addColorStop(1, accent);
    ctx.fillStyle = grad; ctx.beginPath(); ctx.arc(cx, 300, 200, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#fff"; ctx.font = "bold " + (220 * sc) + "px " + ff; ctx.fillText(letter, cx, 310);
    drawTag(540, 28, 400);
  } else if (p.template === "Mascot") {
    ctx.font = (150 * sc) + "px serif"; ctx.fillStyle = primary; ctx.fillText(icon, cx, 240);
    drawBrand(360, 60, 460); drawTag(425, 26, 440);
  } else if (p.template === "Monogram") {
    const words = (brand || "AB").trim().split(/\s+/);
    const mono = (words.length >= 2 ? words[0][0] + words[1][0] : (brand || "A")).toUpperCase().slice(0, 2) || "A";
    ctx.strokeStyle = primary; ctx.lineWidth = 8; ctx.strokeRect(150, 180, 300, 240);
    ctx.fillStyle = primary; ctx.font = "bold " + (130 * sc) + "px " + ff; ctx.fillText(mono, cx, 330);
    drawTag(450, 28, 380);
  } else if (p.template === "Circle") {
    const grad = ctx.createLinearGradient(0, 100, 0, 500);
    grad.addColorStop(0, primary); grad.addColorStop(1, accent);
    ctx.fillStyle = grad; ctx.beginPath(); ctx.arc(cx, 300, 230, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#fff";
    const size = fitSize(brand, 52 * sc, 360, "bold ");
    ctx.font = "bold " + size + "px " + ff; ctx.fillText(brand, cx, 295);
    if (tag) { ctx.font = (24 * sc) + "px " + ff; ctx.fillStyle = "rgba(255,255,255,0.85)"; ctx.fillText(tag, cx, 350); }
  } else if (p.template === "Hexagon") {
    const grad = ctx.createLinearGradient(0, 100, 0, 500);
    grad.addColorStop(0, primary); grad.addColorStop(1, accent);
    ctx.fillStyle = grad; ctx.beginPath();
    const rad = 235, cy = 300;
    for (let k = 0; k < 6; k++) { const a = Math.PI / 6 + (k * Math.PI) / 3; const px = cx + rad * Math.cos(a); const py = cy + rad * Math.sin(a); if (k === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py); }
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = "#fff";
    const size = fitSize(brand, 48 * sc, 320, "bold ");
    ctx.font = "bold " + size + "px " + ff; ctx.fillText(brand, cx, 295);
    if (tag) { ctx.font = (22 * sc) + "px " + ff; ctx.fillStyle = "rgba(255,255,255,0.85)"; ctx.fillText(tag, cx, 345); }
  } else if (p.template === "Stripe") {
    ctx.fillStyle = primary; ctx.fillRect(0, 230, 600, 140);
    ctx.fillStyle = accent; ctx.fillRect(0, 230, 600, 8); ctx.fillRect(0, 362, 600, 8);
    ctx.fillStyle = "#fff";
    const size = fitSize(brand, 56 * sc, 520, "bold ");
    ctx.font = "bold " + size + "px " + ff; ctx.fillText(brand, cx, 305);
    drawTag(420, 28, 440);
  } else {
    drawIcon(215, 110); drawBrand(335, 62, 500); drawTag(395, 28, 460);
  }
}

// The interactive body of every tool. Works both embedded in /tools/:slug pages
// and inside the legacy home-page workspace modal.
export default function ToolCalculator({ slug }) {
  const { t, lang } = useI18n();
  const riddles = lang === "ar" ? RIDDLES_AR : RIDDLES;
  const [inputs, setInputs] = useState({});
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  // Gate results behind an explicit button click: show a spinner for ~800ms,
  // then reveal the computed result with a fade/slide animation and scroll to it.
  const runCalc = (compute) => {
    setBusy(true);
    setTimeout(() => {
      const r = compute();
      setResult(r);
      setBusy(false);
      setTimeout(() => {
        const el = document.querySelector('[data-tool-result="true"]');
        el?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 60);
    }, 800);
  };
  const [riddleAttempts, setRiddleAttempts] = useState(3);
  const [riddleMsg, setRiddleMsg] = useState("");
  const [riddleGuess, setRiddleGuess] = useState("");
  const [riddle, setRiddle] = useState(() => riddles[0]);
  const [bgResult, setBgResult] = useState(null);
  const [pdfBusy, setPdfBusy] = useState(false);
  const [speedTest, setSpeedTest] = useState({ running: false, phase: null, ping: null, download: null, upload: null, jitter: null, ip: null, isp: null, needle: 0 });
  const [shareLinks, setShareLinks] = useState(null);
  const [policyText, setPolicyText] = useState("");
  const [cropSrc, setCropSrc] = useState(null);
  const [cropResult, setCropResult] = useState(null);
  const [bgSrc, setBgSrc] = useState(null);
  const [pdfFiles, setPdfFiles] = useState([]);
  const [compressSrc, setCompressSrc] = useState(null);
  const [compressResult, setCompressResult] = useState(null);
  const [plotData, setPlotData] = useState(null);
  const [enhSrc, setEnhSrc] = useState(null);
  const [enhResult, setEnhResult] = useState(null);
  const [enhVersion, setEnhVersion] = useState(0);
  const [fontReady, setFontReady] = useState(0);
  const enhOrigRef = useRef(null);
  const logoCanvasRef = useRef(null);
  const [aiLogos, setAiLogos] = useState([]);
  const [aiBusy, setAiBusy] = useState(false);
  const [aiSelected, setAiSelected] = useState(null);
  const [showToolbar, setShowToolbar] = useState(false);
  const [fxRates, setFxRates] = useState(null);
  const [fxUpdated, setFxUpdated] = useState("");
  const [fxLoading, setFxLoading] = useState(false);

  useEffect(() => {
    setInputs({}); setResult(null); setBusy(false); setRiddleAttempts(3); setRiddleMsg(""); setRiddleGuess("");
    setSpeedTest({ running: false, phase: null, ping: null, download: null, upload: null, jitter: null, ip: null, isp: null, needle: 0 });
    setShareLinks(null); setPolicyText("");
    setCropSrc(null); setCropResult(null); setBgSrc(null); setBgResult(null);
    setPdfFiles([]); setCompressSrc(null); setCompressResult(null); setPlotData(null);
    setPdfBusy(false); setRiddle(riddles[Math.floor(Math.random() * riddles.length)]);
    setEnhSrc(null); setEnhResult(null); enhOrigRef.current = null; setEnhVersion(0);
    setAiLogos([]); setAiBusy(false); setAiSelected(null);
    setShowToolbar(false);
  }, [slug]);

  // Fetch live exchange rates when the currency converter is opened.
  useEffect(() => {
    if (slug !== "currency-converter" || fxRates) return;
    let active = true;
    setFxLoading(true);
    getExchangeRates()
      .then((res) => {
        if (!active) return;
        const data = res?.data ?? res;
        if (data && data.rates) { setFxRates(data.rates); setFxUpdated(data.updated || ""); }
      })
      .catch(() => {})
      .finally(() => { if (active) setFxLoading(false); });
    return () => { active = false; };
  }, [slug, fxRates]);

  const refreshFx = () => {
    setFxLoading(true);
    getExchangeRates()
      .then((res) => {
        const data = res?.data ?? res;
        if (data && data.rates) { setFxRates(data.rates); setFxUpdated(data.updated || ""); }
      })
      .catch(() => {})
      .finally(() => setFxLoading(false));
  };

  // Live image enhancement: recompute from the original on every slider change.
  useEffect(() => {
    const orig = enhOrigRef.current;
    if (!orig) return;
    const b = parseFloat(inputs.brightness || "0");
    const c = parseFloat(inputs.contrast || "0");
    const s = parseFloat(inputs.saturation || "0");
    const sh = parseFloat(inputs.sharpen || "0");
    const dh = parseFloat(inputs.dehaze || "0");
    const temp = parseFloat(inputs.temperature || "0");
    const eff = inputs.effect || "none";
    const { width, height, data } = orig;
    const cf = (259 * (c + 255)) / (255 * (259 - c));
    const dcf = (259 * (dh * 1.2 + 255)) / (255 * (259 - dh * 1.2));
    const sat = 1 + (s + dh * 0.4) / 100;
    const out = new ImageData(width, height);
    const d = out.data;
    const cw = width, ch = height;
    for (let i = 0; i < data.length; i += 4) {
      let r = data[i] + b, g = data[i + 1] + b, bl = data[i + 2] + b;
      r = cf * (r - 128) + 128; g = cf * (g - 128) + 128; bl = cf * (bl - 128) + 128;
      r = dcf * (r - 128) + 128; g = dcf * (g - 128) + 128; bl = dcf * (bl - 128) + 128;
      const gray = 0.299 * r + 0.587 * g + 0.114 * bl;
      r = gray + (r - gray) * sat; g = gray + (g - gray) * sat; bl = gray + (bl - gray) * sat;
      r += temp * 0.6; bl -= temp * 0.6;
      if (eff === "sepia") {
        const nr = r * 0.393 + g * 0.769 + bl * 0.189;
        const ng = r * 0.349 + g * 0.686 + bl * 0.168;
        const nb = r * 0.272 + g * 0.534 + bl * 0.131;
        r = nr; g = ng; bl = nb;
      } else if (eff === "vintage") {
        const nr = r * 0.393 + g * 0.769 + bl * 0.189;
        const ng = r * 0.349 + g * 0.686 + bl * 0.168;
        const nb = r * 0.272 + g * 0.534 + bl * 0.131;
        r = nr * 0.88 + 28; g = ng * 0.88 + 22; bl = nb * 0.88 + 14;
      } else if (eff === "invert") {
        r = 255 - r; g = 255 - g; bl = 255 - bl;
      } else if (eff === "vignette") {
        const px = (i / 4) % cw, py = Math.floor((i / 4) / cw);
        const dx = (px - cw / 2) / (cw / 2), dy = (py - ch / 2) / (ch / 2);
        const v = Math.max(0, 1 - Math.sqrt(dx * dx + dy * dy) * 0.65);
        r *= v; g *= v; bl *= v;
      }
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
  }, [enhVersion, inputs.brightness, inputs.contrast, inputs.saturation, inputs.sharpen, inputs.dehaze, inputs.temperature, inputs.effect]);

  // Live logo canvas: redraw on any input change (2× buffer for a crisp 1200px download).
  useEffect(() => {
    if (slug !== "logo-maker") return;
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
  }, [slug, inputs.template, inputs.brandName, inputs.tagline, inputs.icon, inputs.font, inputs.primary, inputs.accent, inputs.size, fontReady]);

  // Load web fonts on demand so canvas text renders the chosen typeface.
  useEffect(() => {
    if (slug !== "logo-maker") return;
    const f = inputs.font || "Sans";
    if (["Sans", "Serif", "Mono"].includes(f)) return;
    const family = { Poppins: "Poppins", Playfair: "Playfair Display", Pacifico: "Pacifico", Bebas: "Bebas Neue", Lobster: "Lobster", Oswald: "Oswald", Anton: "Anton", Montserrat: "Montserrat", Dancing: "Dancing Script" }[f];
    if (!family) return;
    document.fonts.load(`700 40px "${family}"`).then(() => setFontReady((v) => v + 1)).catch(() => {});
    document.fonts.load(`400 40px "${family}"`).then(() => setFontReady((v) => v + 1)).catch(() => {});
  }, [slug, inputs.font]);

  // Changing any input hides the previous result so it only re-appears after the next Calculate click.
  const set = (k) => (e) => { setInputs((p) => ({ ...p, [k]: e.target.value })); setResult(null); setPolicyText(""); setPlotData(null); };

  const runSpeedTest = async () => {
    const upd = (patch) => setSpeedTest((p) => ({ ...p, ...patch }));
    upd({ running: true, phase: "ping", ping: null, download: null, upload: null, jitter: null, ip: null, isp: null, needle: 0 });
    const base = "https://speed.cloudflare.com";
    const pings = [];
    for (let i = 0; i < 5; i++) {
      const s = performance.now();
      try { await fetch(`${base}/__down?bytes=0&_=${Date.now()}${i}`, { cache: "no-store" }); } catch {}
      pings.push(performance.now() - s);
    }
    const ping = Math.round(pings.reduce((a, b) => a + b, 0) / pings.length);
    const jitter = Math.round(Math.max(...pings) - Math.min(...pings));
    upd({ phase: "download", ping, jitter, needle: 0 });
    try {
      const dlStart = performance.now();
      const res = await fetch(`${base}/__down?bytes=10000000&_=${Date.now()}`, { cache: "no-store" });
      await res.blob();
      const dt = (performance.now() - dlStart) / 1000;
      const download = +((10000000 * 8) / dt / 1e6).toFixed(1);
      upd({ needle: 100 });
      await new Promise((r) => setTimeout(r, 300));
      upd({ download, needle: download });
    } catch {}
    upd({ phase: "upload" });
    try {
      const payload = new Blob([new Uint8Array(2 * 1024 * 1024)]);
      const upStart = performance.now();
      await fetch(`${base}/__up`, { method: "POST", body: payload, cache: "no-store" });
      const ut = (performance.now() - upStart) / 1000;
      const upload = +((2 * 1024 * 1024 * 8) / ut / 1e6).toFixed(1);
      upd({ upload, needle: upload });
    } catch {}
    let ip = null, isp = null;
    try {
      const r = await fetch(`${base}/meta`);
      const j = await r.json();
      ip = j.clientIp || j.ip || null;
      isp = j.asOrganization || j.asn || null;
    } catch {}
    upd({ running: false, phase: "done", ip, isp });
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
    };
    img.src = bgSrc;
  };

  const renderCalculator = () => {
    switch (slug) {
      case "loan-calculator": {
        const calc = () => {
          const P = parseFloat(inputs.amount), annualRate = parseFloat(inputs.rate), n = parseFloat(inputs.term);
          if (!P || !n || isNaN(annualRate)) return null;
          const r = annualRate / 100 / 12;
          const payment = r === 0 ? P / n : (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
          return { P, r, n, payment: payment.toFixed(2), interest: (payment * n - P).toFixed(2), total: (payment * n).toFixed(2) };
        };
        const lr = result;
        return (
          <>
            <div className="flex flex-col gap-3">
              <NumInput label={t("Loan Amount")} value={inputs.amount} onChange={set("amount")} placeholder="10000" />
              <NumInput label={t("Annual Rate (%)")} value={inputs.rate} onChange={set("rate")} placeholder="6.5" />
              <NumInput label={t("Term (Months)")} value={inputs.term} onChange={set("term")} placeholder="36" />
            </div>
            <div className="flex justify-center mt-6"><CalcButton onClick={() => runCalc(calc)} busy={busy} busyLabel={t("Analyzing...")}>{t("Calculate Loan")}</CalcButton></div>
            {lr && (
              <>
                <ResultCard title={t("Your Results")}>
                  <ResultCircle value={`$${lr.payment}`} unit={t("Monthly Payment")} />
                  <div className="mt-5 text-sm text-[#1E1B4B] dark:text-[#FEF3C7]">{t("Breakdown")}: {t("Total Interest")} <strong className="text-[#F59E0B]">${lr.interest}</strong> · {t("Total Amount")} <strong className="text-[#6D28D9]">${lr.total}</strong></div>
                  <InsightBox icon={DollarSign}>{t("Paying biweekly or adding extra to each payment can cut years off your loan and save thousands in interest.")}</InsightBox>
                </ResultCard>
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="rounded-2xl bg-gradient-to-b from-card to-background border border-border p-5 shadow-[0_12px_30px_-14px_hsl(var(--primary)/0.25),inset_0_1px_0_0_hsl(0_0%_100%/0.05)]">
                    <h4 className="text-sm font-semibold text-muted-foreground mb-2 text-center">{t("Principal vs Interest")}</h4>
                    <div className="h-56">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={[{ name: t("Principal"), value: lr.P }, { name: t("Interest"), value: parseFloat(lr.interest) }]} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={3} isAnimationActive animationDuration={900} animationEasing="ease-out">
                            <Cell fill="hsl(var(--primary))" />
                            <Cell fill="hsl(var(--accent))" />
                          </Pie>
                          <Tooltip formatter={(v) => `$${v.toLocaleString()}`} contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", color: "hsl(var(--foreground))" }} />
                          <Legend wrapperStyle={{ fontSize: 12 }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  <div className="rounded-2xl bg-gradient-to-b from-card to-background border border-border p-5 shadow-[0_12px_30px_-14px_hsl(var(--primary)/0.25),inset_0_1px_0_0_hsl(0_0%_100%/0.05)]">
                    <h4 className="text-sm font-semibold text-muted-foreground mb-2 text-center">{t("Balance Over Time")}</h4>
                    <div className="h-56">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={Array.from({ length: Math.min(Math.round(lr.n) + 1, 60) }, (_, i) => {
                          const m = i;
                          let bal = lr.P;
                          for (let k = 0; k < m; k++) { bal = bal * (1 + lr.r) - parseFloat(lr.payment); }
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
            <TipBox>{t("Indicator: Interest is calculated on the remaining balance. Always compare multiple bank offers.")}</TipBox>
          </>
        );
      }
      case "simple-compound-interest": {
        // Compare simple vs compound interest. yrs = duration in years.
        const compounds = { Yearly: 1, "Semi-annual": 2, Quarterly: 4, Monthly: 12, Daily: 365 };
        const P = parseFloat(inputs.principal), rate = parseFloat(inputs.rate), yrs = parseFloat(inputs.years);
        const n = compounds[inputs.compound || "Yearly"];
        const interestResult = (!isNaN(P) && !isNaN(rate) && !isNaN(yrs) && P >= 0 && yrs >= 0) ? (() => {
          const simple = (P * rate * yrs) / 100;
          const compound = P * Math.pow(1 + rate / 100 / n, n * yrs) - P;
          return { simple: simple.toFixed(2), compound: compound.toFixed(2), finalSimple: (P + simple).toFixed(2), finalCompound: (P + compound).toFixed(2), P, rate, yrs, n };
        })() : null;
        const calc = () => interestResult;
        return (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <NumInput label={t("Principal Amount")} value={inputs.principal} onChange={set("principal")} placeholder="5000" />
              <NumInput label={t("Interest Rate (%)")} value={inputs.rate} onChange={set("rate")} placeholder="7" />
              <NumInput label={t("Duration (Years)")} value={inputs.years} onChange={set("years")} placeholder="10" />
              <SelectField label={t("Compound Frequency")} value={inputs.compound || "Yearly"} onChange={set("compound")} options={Object.keys(compounds).map((k) => ({ value: k, label: t(k) }))} />
            </div>
            <div className="flex justify-center mt-6"><CalcButton onClick={() => runCalc(calc)} busy={busy} busyLabel={t("Analyzing...")}>{t("Calculate Interest")}</CalcButton></div>
            {result && (
              <>
                <ResultCard title={t("Comparison")}>
                  <ResultCircle value={`$${result.compound}`} unit={t("Compound Interest")} />
                  <div className="mt-5 text-sm text-[#1E1B4B] dark:text-[#FEF3C7]">{t("Breakdown")}: {t("Simple")} <strong className="text-[#6D28D9]">${result.simple}</strong> · {t("Compound")} <strong className="text-[#F59E0B]">${result.compound}</strong></div>
                  <InsightBox icon={TrendingUp}>{t("Compound interest accelerates growth by earning interest on your interest — the more frequent the compounding, the higher the return.")}</InsightBox>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-4">
                    <div className="bg-background rounded-2xl p-6 border border-border shadow-sm">
                      <div className="text-sm text-muted-foreground mb-1">{t("Simple Interest Earned")}</div>
                      <div className="text-2xl font-bold text-primary">${result.simple}</div>
                      <div className="text-sm text-muted-foreground mt-2">{t("Final Amount:")} <strong className="text-foreground">${result.finalSimple}</strong></div>
                    </div>
                    <div className="bg-background rounded-2xl p-6 border border-border shadow-sm">
                      <div className="text-sm text-muted-foreground mb-1">{t("Compound Interest Earned")}</div>
                      <div className="text-2xl font-bold text-accent">${result.compound}</div>
                      <div className="text-sm text-muted-foreground mt-2">{t("Final Amount:")} <strong className="text-foreground">${result.finalCompound}</strong></div>
                    </div>
                  </div>
                </ResultCard>
                <div className="mt-6 rounded-2xl bg-gradient-to-b from-card to-background border border-border p-5 shadow-[0_12px_30px_-14px_hsl(var(--primary)/0.25),inset_0_1px_0_0_hsl(0_0%_100%/0.05)]">
                  <h4 className="text-sm font-semibold text-muted-foreground mb-2 text-center">{t("Growth Over Time")}</h4>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={Array.from({ length: Math.min(Math.round(result.yrs) + 1, 100) }, (_, yr) => {
                        const simpleBal = result.P + (result.P * result.rate * yr) / 100;
                        const compBal = result.P * Math.pow(1 + result.rate / 100 / result.n, result.n * yr);
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
                        <Area type="monotone" dataKey="Simple" name={t("Simple")} stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#gSimple)" isAnimationActive animationDuration={1000} animationEasing="ease-out" />
                        <Area type="monotone" dataKey="Compound" name={t("Compound")} stroke="hsl(var(--accent))" strokeWidth={2} fill="url(#gCompound)" isAnimationActive animationDuration={1100} animationBegin={150} animationEasing="ease-out" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </>
            )}
            <TipBox>{t("Compound interest is the miracle of investing — the more frequent the compounding, the higher the return.")}</TipBox>
          </>
        );
      }
      case "currency-converter": {
        const rates = (fxRates && Object.keys(fxRates).length > 0) ? fxRates : CURRENCY_RATES;
        const currencies = Object.keys(rates);
        const calc = () => {
          const amt = parseFloat(inputs.amount);
          const from = inputs.from || "USD", to = inputs.to || "EUR";
          if (!amt || !rates[from] || !rates[to]) return null;
          const r = (amt * rates[to]) / rates[from];
          return { value: isFinite(r) ? r.toFixed(2) : "—", from, to, amount: inputs.amount };
        };
        const swap = () => { setInputs((p) => ({ ...p, from: p.to || "EUR", to: p.from || "USD" })); setResult(null); };
        return (
          <>
            <div className="flex flex-col gap-3">
              <NumInput label={t("Amount")} value={inputs.amount} onChange={set("amount")} placeholder="100" />
              <SelectField label={t("From Currency")} value={inputs.from || "USD"} onChange={set("from")} options={currencies} />
              <SelectField label={t("To Currency")} value={inputs.to || "EUR"} onChange={set("to")} options={currencies} />
            </div>
            <div className="flex flex-wrap justify-center gap-4">
              <CalcButton onClick={() => runCalc(calc)} busy={busy} busyLabel={t("Analyzing...")}>{t("Convert Currency")}</CalcButton>
              <CalcButton onClick={swap} variant="secondary"><ArrowLeftRight className="w-5 h-5" />{t("Swap")}</CalcButton>
            </div>
            <div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <span className={`w-2 h-2 rounded-full ${fxRates ? "bg-emerald-500" : "bg-amber-500"} ${fxLoading ? "animate-pulse" : ""}`} />
              {fxLoading ? t("Fetching live rates...") : (fxRates ? `${t("Live rates")}${fxUpdated ? ` · ${fxUpdated}` : ""}` : t("Using offline rates"))}
              <button onClick={refreshFx} className="ml-1 text-primary font-semibold hover:underline">{t("Refresh")}</button>
            </div>
            {result && (
              <>
                <ResultCard title={t("Conversion Result")}>
                  <ResultCircle value={result.value} unit={result.to} sub={`${result.amount} ${result.from}`} />
                  <InsightBox icon={Coins}>{t("Live exchange rates fluctuate constantly — for large transfers, compare a few providers to get the best rate.")}</InsightBox>
                </ResultCard>
                <div className="mt-6 rounded-2xl bg-gradient-to-b from-card to-background border border-border p-5 shadow-[0_12px_30px_-14px_hsl(var(--primary)/0.25),inset_0_1px_0_0_hsl(0_0%_100%/0.05)]">
                  <h4 className="text-sm font-semibold text-muted-foreground mb-3 text-center">{t("Value Comparison")}</h4>
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
            <TipBox>{t("Live exchange rates are fetched from a reliable source for informational purposes only.")}</TipBox>
          </>
        );
      }
      case "internet-speed-test": {
        const st = speedTest;
        const dispV = st.running ? (st.needle || 0) : (st.download || 0);
        const ang = 180 * (1 - Math.min(dispV, 200) / 200);
        const nx = 130 + 95 * Math.cos(ang * Math.PI / 180);
        const ny = 140 - 95 * Math.sin(ang * Math.PI / 180);
        const arcLen = Math.PI * 110;
        const activeLen = (Math.min(dispV, 200) / 200) * arcLen;
        const phaseLabel = st.running
          ? (st.phase === "ping" ? t("Measuring ping...") : st.phase === "download" ? t("Testing download...") : t("Testing upload..."))
          : (st.phase === "done" ? t("Test complete") : t("Press Start Test to begin."));
        const sCard = (Icon, label, value, unit, color) => (
          <div className="rounded-2xl bg-background border border-border p-3 text-center shadow-sm">
            <Icon className={`w-5 h-5 mx-auto mb-1 ${color}`} />
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
            <div className="text-xl font-bold text-foreground tabular-nums leading-tight">{value ?? "—"} <small className="text-xs font-normal text-muted-foreground">{unit}</small></div>
          </div>
        );
        return (
          <>
            <div className="flex flex-col items-center">
              <div className="relative w-[260px] h-[150px]">
                <svg viewBox="0 0 260 150" className="w-full h-full">
                  <defs>
                    <linearGradient id="speedGrad" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#34d399" />
                      <stop offset="55%" stopColor="#fbbf24" />
                      <stop offset="100%" stopColor="#f87171" />
                    </linearGradient>
                  </defs>
                  <path d="M20 140 A110 110 0 0 1 240 140" fill="none" stroke="#FDE68A" strokeWidth="14" strokeLinecap="round" />
                  <path d="M20 140 A110 110 0 0 1 240 140" fill="none" stroke="url(#speedGrad)" strokeWidth="14" strokeLinecap="round" strokeDasharray={`${activeLen} ${arcLen}`} style={{ transition: "stroke-dasharray 0.4s ease" }} />
                  {[0, 50, 100, 150, 200].map((v) => {
                    const a = 180 * (1 - v / 200);
                    const tx = 130 + 128 * Math.cos(a * Math.PI / 180);
                    const ty = 140 - 128 * Math.sin(a * Math.PI / 180);
                    return <text key={v} x={tx} y={ty + 4} textAnchor="middle" fontSize="11" fill="#92400E" fontWeight="700">{v}</text>;
                  })}
                  <line x1="130" y1="140" x2={nx} y2={ny} stroke="#6D28D9" strokeWidth="4" strokeLinecap="round" style={{ transition: "all 0.4s ease" }} />
                  <circle cx="130" cy="140" r="11" fill="#6D28D9" />
                  <circle cx="130" cy="140" r="4" fill="#FFFBEB" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-end pb-1 pointer-events-none">
                  <div className="text-4xl font-black text-[#1E1B4B] dark:text-[#FEF3C7] tabular-nums leading-none">{st.download ?? "—"}</div>
                  <div className="text-xs font-semibold text-muted-foreground mt-1">{t("Mbps")}</div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 mt-4">
              {sCard(Activity, t("Ping"), st.ping, t("ms"), "text-emerald-500")}
              {sCard(Wifi, t("Download"), st.download, t("Mbps"), "text-primary")}
              {sCard(ArrowLeftRight, t("Upload"), st.upload, t("Mbps"), "text-accent")}
            </div>
            {st.phase === "done" && (
              <div className="grid grid-cols-3 gap-3 mt-3 text-center">
                <div className="rounded-xl bg-background border border-border p-2.5">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{t("Jitter")}</div>
                  <div className="text-sm font-bold text-foreground tabular-nums">{st.jitter ?? "—"} <small className="text-[10px] text-muted-foreground">{t("ms")}</small></div>
                </div>
                <div className="rounded-xl bg-background border border-border p-2.5">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">IP</div>
                  <div className="text-sm font-bold text-foreground truncate">{st.ip ?? "—"}</div>
                </div>
                <div className="rounded-xl bg-background border border-border p-2.5">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">ISP</div>
                  <div className="text-sm font-bold text-foreground truncate">{st.isp ?? "—"}</div>
                </div>
              </div>
            )}
            <div className="mt-4 text-center text-sm text-muted-foreground">{phaseLabel}</div>
            <div className="flex justify-center">
              <CalcButton onClick={runSpeedTest} busy={st.running} busyLabel={t("Testing...")}>
                {!st.running && <Play className="w-5 h-5 mr-2 inline" />}
                {st.running ? t("Testing...") : t("Start Speed Test")}
              </CalcButton>
            </div>
            <TipBox>{t("Close bandwidth-heavy applications for the most accurate result.")}</TipBox>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <NumInput label={t("Number of Codes")} value={inputs.count} onChange={set("count")} placeholder="5" />
              <NumInput label={t("Code Length")} value={inputs.length} onChange={set("length")} placeholder="8" />
              <TxtInput label={t("Prefix (optional)")} value={inputs.prefix} onChange={set("prefix")} placeholder="SALE" />
              <NumInput label={t("Dash every N (0 = off)")} value={inputs.dashEvery} onChange={set("dashEvery")} placeholder="4" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
              <SelectField label={t("Character Set")} value={inputs.charset || "Alphanumeric"} onChange={set("charset")} options={Object.keys(charsetOptions).map((k) => ({ value: k, label: t(k) }))} />
            </div>
            <div className="flex justify-center mt-6"><CalcButton onClick={generate}>{t("Generate Coupons")}</CalcButton></div>
            {codes.length > 0 && (
              <ResultCard title={`${codes.length} ${t("Coupons Generated")}`}>
                <div className="flex justify-center mb-6">
                  <button onClick={copyAll} className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary transition-colors">
                    <Copy className="w-4 h-4" /> {t("Copy All")}
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
            <TipBox>{t("Tip: The default set excludes easily-confused characters (O, I, 0, 1) so codes stay readable.")}</TipBox>
          </>
        );
      }
      case "bond-yield": {
        const calc = () => {
          const face = parseFloat(inputs.face), price = parseFloat(inputs.price), coupon = parseFloat(inputs.coupon), years = parseFloat(inputs.years);
          if (!face || !price || isNaN(coupon) || !years) return null;
          const currentYield = (coupon / price) * 100;
          const ytm = ((coupon + (face - price) / years) / ((face + price) / 2)) * 100;
          return { currentYield: currentYield.toFixed(2), ytm: ytm.toFixed(2) };
        };
        const br = result;
        return (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <NumInput label={t("Face Value ($)")} value={inputs.face} onChange={set("face")} placeholder="1000" />
              <NumInput label={t("Current Price ($)")} value={inputs.price} onChange={set("price")} placeholder="950" />
              <NumInput label={t("Annual Coupon ($)")} value={inputs.coupon} onChange={set("coupon")} placeholder="50" />
              <NumInput label={t("Years to Maturity")} value={inputs.years} onChange={set("years")} placeholder="5" />
            </div>
            <div className="flex justify-center mt-6"><CalcButton onClick={() => runCalc(calc)} busy={busy} busyLabel={t("Analyzing...")}>{t("Calculate Yield")}</CalcButton></div>
            {br && (
              <>
                <ResultCard title={t("Bond Yield")}>
                  <ResultCircle value={`${br.currentYield}%`} unit={t("Current Yield")} />
                  <div className="mt-5 text-sm text-[#1E1B4B] dark:text-[#FEF3C7]">{t("Breakdown")}: {t("Yield to Maturity (YTM)")} <strong className="text-[#F59E0B]">{br.ytm}%</strong></div>
                  <InsightBox icon={TrendingUp}>{t("Current Yield = Annual Coupon ÷ Price. YTM approximates total return if the bond is held to maturity.")}</InsightBox>
                </ResultCard>
                <div className="mt-6 rounded-2xl bg-gradient-to-b from-card to-background border border-border p-5 shadow-[0_12px_30px_-14px_hsl(var(--primary)/0.25),inset_0_1px_0_0_hsl(0_0%_100%/0.05)]">
                  <h4 className="text-sm font-semibold text-muted-foreground mb-2 text-center">{t("Yield Comparison (%)")}</h4>
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={[{ name: "Current Yield", value: parseFloat(br.currentYield) }, { name: "YTM", value: parseFloat(br.ytm) }]}>
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
        const calc = () => {
          const w = parseFloat(inputs.weight), h = parseFloat(inputs.height) / 100;
          if (!w || !h) return null;
          const bmi = w / (h * h);
          const cat = bmi < 18.5 ? t("Underweight") : bmi < 25 ? t("Normal weight") : bmi < 30 ? t("Overweight") : t("Obese");
          const pos = Math.max(0, Math.min(100, ((bmi - 15) / 20) * 100));
          return { bmi: bmi.toFixed(1), cat, pos };
        };
        const r = result;
        return (
          <>
            <div className="flex flex-col gap-3">
              <NumInput label={t("Weight (kg)")} value={inputs.weight} onChange={set("weight")} placeholder="70" />
              <NumInput label={t("Height (cm)")} value={inputs.height} onChange={set("height")} placeholder="175" />
            </div>
            <div className="flex justify-center mt-6"><CalcButton onClick={() => runCalc(calc)} busy={busy} busyLabel={t("Analyzing...")}>{t("Calculate BMI")}</CalcButton></div>
            {r && (
              <ResultCard title={t("Your BMI")}>
                <ResultCircle value={r.bmi} unit={r.cat} />
                <div className="mt-6">
                  <div className="flex h-3 rounded-full overflow-hidden">
                    <div className="flex-1 bg-blue-400" /><div className="flex-1 bg-emerald-400" /><div className="flex-1 bg-amber-400" /><div className="flex-1 bg-rose-400" />
                  </div>
                  <div className="relative mt-1">
                    <div className="absolute -top-3 w-4 h-4 rounded-full bg-white dark:bg-[#FEF3C7] border-2 border-[#1E1B4B] dark:border-[#FEF3C7] shadow" style={{ left: `calc(${r.pos}% - 8px)` }} />
                  </div>
                  <div className="flex text-[10px] text-muted-foreground mt-2">
                    <span className="flex-1 text-center">{t("Underweight")}</span>
                    <span className="flex-1 text-center">{t("Normal")}</span>
                    <span className="flex-1 text-center">{t("Overweight")}</span>
                    <span className="flex-1 text-center">{t("Obese")}</span>
                  </div>
                </div>
                <InsightBox icon={Activity}>{t("BMI is a general indicator. For a complete health assessment, consult a doctor.")}</InsightBox>
              </ResultCard>
            )}
            <TipBox>{t("BMI is a general indicator. Consult a doctor for a complete health assessment.")}</TipBox>
          </>
        );
      }
      case "calories-burned": {
        const metMap = { Walking: 3.5, Running: 9.8, Cycling: 7.5, Swimming: 8.0, "Weight Lifting": 6.0, Yoga: 2.5 };
        const calc = () => {
          const w = parseFloat(inputs.weight), m = parseFloat(inputs.minutes), met = metMap[inputs.activity || "Walking"];
          if (!w || !m || !met) return null;
          return { cal: Math.round((met * 3.5 * w) / 200 * m), activity: inputs.activity || "Walking" };
        };
        const r = result;
        return (
          <>
            <div className="flex flex-col gap-3">
              <NumInput label={t("Weight (kg)")} value={inputs.weight} onChange={set("weight")} placeholder="70" />
              <NumInput label={t("Duration (min)")} value={inputs.minutes} onChange={set("minutes")} placeholder="30" />
            </div>
            <SelectField label={t("Activity")} value={inputs.activity || "Walking"} onChange={set("activity")} options={Object.keys(metMap).map((k) => ({ value: k, label: t(k) }))} />
            <div className="flex justify-center mt-6"><CalcButton onClick={() => runCalc(calc)} busy={busy} busyLabel={t("Analyzing...")}>{t("Check Calories")}</CalcButton></div>
            {r && (
              <ResultCard title={t("Calories Burned")}>
                <ResultCircle value={r.cal} unit={t("kcal")} sub={r.activity} />
                <InsightBox icon={Flame}>{t("Estimates use MET values. Actual burn varies with intensity and metabolism — higher intensity activities burn more per minute.")}</InsightBox>
              </ResultCard>
            )}
            <TipBox>{t("Estimates based on MET values. Actual burn varies by intensity and metabolism.")}</TipBox>
          </>
        );
      }
      case "distance-converter": {
        const calc = () => {
          const v = parseFloat(inputs.value);
          const from = inputs.from || "Mile", to = inputs.to || "Kilometer";
          if (isNaN(v)) return null;
          return { out: convertUnit(v, DISTANCE_UNITS, from, to), to, from, value: inputs.value };
        };
        const r = result;
        return (
          <>
            <div className="flex flex-col gap-3">
              <NumInput label={t("Value")} value={inputs.value} onChange={set("value")} placeholder="1" />
              <SelectField label={t("From")} value={inputs.from || "Mile"} onChange={set("from")} options={Object.keys(DISTANCE_UNITS).map((k) => ({ value: k, label: t(k) }))} />
              <SelectField label={t("To")} value={inputs.to || "Kilometer"} onChange={set("to")} options={Object.keys(DISTANCE_UNITS).map((k) => ({ value: k, label: t(k) }))} />
            </div>
            <div className="flex justify-center mt-6"><CalcButton onClick={() => runCalc(calc)} busy={busy} busyLabel={t("Analyzing...")}>{t("Convert")}</CalcButton></div>
            {r && (
              <ResultCard title={t("Result")}>
                <ResultCircle value={r.out.toLocaleString(undefined, { maximumFractionDigits: 4 })} unit={t(r.to)} sub={`${r.value} ${t(r.from)}`} />
                <div className="mt-4 text-sm text-[#1E1B4B] dark:text-[#FEF3C7]">{t("Breakdown")}: {r.value} {t(r.from)} = {r.out.toLocaleString(undefined, { maximumFractionDigits: 6 })} {t(r.to)}</div>
                <InsightBox icon={Ruler}>{t("Unit conversions use precise factors — 1 mile = 1.60934 km. Results round for display but stay accurate.")}</InsightBox>
              </ResultCard>
            )}
          </>
        );
      }
      case "weight-converter": {
        const calc = () => {
          const v = parseFloat(inputs.value);
          const from = inputs.from || "Kilogram", to = inputs.to || "Pound";
          if (isNaN(v)) return null;
          return { out: convertUnit(v, WEIGHT_UNITS, from, to), to, from, value: inputs.value };
        };
        const r = result;
        return (
          <>
            <div className="flex flex-col gap-3">
              <NumInput label={t("Value")} value={inputs.value} onChange={set("value")} placeholder="1" />
              <SelectField label={t("From")} value={inputs.from || "Kilogram"} onChange={set("from")} options={Object.keys(WEIGHT_UNITS).map((k) => ({ value: k, label: t(k) }))} />
              <SelectField label={t("To")} value={inputs.to || "Pound"} onChange={set("to")} options={Object.keys(WEIGHT_UNITS).map((k) => ({ value: k, label: t(k) }))} />
            </div>
            <div className="flex justify-center mt-6"><CalcButton onClick={() => runCalc(calc)} busy={busy} busyLabel={t("Analyzing...")}>{t("Convert")}</CalcButton></div>
            {r && (
              <ResultCard title={t("Result")}>
                <ResultCircle value={r.out.toLocaleString(undefined, { maximumFractionDigits: 4 })} unit={t(r.to)} sub={`${r.value} ${t(r.from)}`} />
                <div className="mt-4 text-sm text-[#1E1B4B] dark:text-[#FEF3C7]">{t("Breakdown")}: {r.value} {t(r.from)} = {r.out.toLocaleString(undefined, { maximumFractionDigits: 6 })} {t(r.to)}</div>
                <InsightBox icon={Weight}>{t("Weight conversions use exact factors — 1 kg = 2.20462 lb. Results round for display but stay accurate.")}</InsightBox>
              </ResultCard>
            )}
          </>
        );
      }
      case "area-converter": {
        const calc = () => {
          const v = parseFloat(inputs.value);
          const from = inputs.from || "m²", to = inputs.to || "ft²";
          if (isNaN(v)) return null;
          return { out: convertUnit(v, AREA_UNITS, from, to), to, from, value: inputs.value };
        };
        const r = result;
        return (
          <>
            <div className="flex flex-col gap-3">
              <NumInput label={t("Value")} value={inputs.value} onChange={set("value")} placeholder="1" />
              <SelectField label={t("From")} value={inputs.from || "m²"} onChange={set("from")} options={Object.keys(AREA_UNITS).map((k) => ({ value: k, label: t(k) }))} />
              <SelectField label={t("To")} value={inputs.to || "ft²"} onChange={set("to")} options={Object.keys(AREA_UNITS).map((k) => ({ value: k, label: t(k) }))} />
            </div>
            <div className="flex justify-center mt-6"><CalcButton onClick={() => runCalc(calc)} busy={busy} busyLabel={t("Analyzing...")}>{t("Convert")}</CalcButton></div>
            {r && (
              <ResultCard title={t("Result")}>
                <ResultCircle value={r.out.toLocaleString(undefined, { maximumFractionDigits: 4 })} unit={t(r.to)} sub={`${r.value} ${t(r.from)}`} />
                <div className="mt-4 text-sm text-[#1E1B4B] dark:text-[#FEF3C7]">{t("Breakdown")}: {r.value} {t(r.from)} = {r.out.toLocaleString(undefined, { maximumFractionDigits: 6 })} {t(r.to)}</div>
                <InsightBox icon={Square}>{t("Area conversions use exact factors — 1 m² = 10.7639 ft². Results round for display but stay accurate.")}</InsightBox>
              </ResultCard>
            )}
          </>
        );
      }
      case "time-converter": {
        const calc = () => {
          const v = parseFloat(inputs.value);
          const from = inputs.from || "Hour", to = inputs.to || "Minute";
          if (isNaN(v)) return null;
          return { out: convertUnit(v, TIME_UNITS, from, to), to, from, value: inputs.value };
        };
        const r = result;
        return (
          <>
            <div className="flex flex-col gap-3">
              <NumInput label={t("Value")} value={inputs.value} onChange={set("value")} placeholder="1" />
              <SelectField label={t("From")} value={inputs.from || "Hour"} onChange={set("from")} options={Object.keys(TIME_UNITS).map((k) => ({ value: k, label: t(k) }))} />
              <SelectField label={t("To")} value={inputs.to || "Minute"} onChange={set("to")} options={Object.keys(TIME_UNITS).map((k) => ({ value: k, label: t(k) }))} />
            </div>
            <div className="flex justify-center mt-6"><CalcButton onClick={() => runCalc(calc)} busy={busy} busyLabel={t("Analyzing...")}>{t("Convert")}</CalcButton></div>
            {r && (
              <ResultCard title={t("Result")}>
                <ResultCircle value={r.out.toLocaleString(undefined, { maximumFractionDigits: 4 })} unit={t(r.to)} sub={`${r.value} ${t(r.from)}`} />
                <div className="mt-4 text-sm text-[#1E1B4B] dark:text-[#FEF3C7]">{t("Breakdown")}: {r.value} {t(r.from)} = {r.out.toLocaleString(undefined, { maximumFractionDigits: 6 })} {t(r.to)}</div>
                <InsightBox icon={Clock}>{t("Time conversions use exact factors — 1 hour = 60 minutes = 3600 seconds. Results round for display but stay accurate.")}</InsightBox>
              </ResultCard>
            )}
          </>
        );
      }
      case "speed-converter": {
        const calc = () => {
          const v = parseFloat(inputs.value);
          const from = inputs.from || "km/h", to = inputs.to || "mph";
          if (isNaN(v)) return null;
          return { out: convertUnit(v, SPEED_UNITS, from, to), to, from, value: inputs.value };
        };
        const r = result;
        return (
          <>
            <div className="flex flex-col gap-3">
              <NumInput label="Value" value={inputs.value} onChange={set("value")} placeholder="100" />
              <SelectField label={t("From")} value={inputs.from || "km/h"} onChange={set("from")} options={Object.keys(SPEED_UNITS).map((k) => ({ value: k, label: t(k) }))} />
              <SelectField label={t("To")} value={inputs.to || "mph"} onChange={set("to")} options={Object.keys(SPEED_UNITS).map((k) => ({ value: k, label: t(k) }))} />
            </div>
            <div className="flex justify-center mt-6"><CalcButton onClick={() => runCalc(calc)} busy={busy} busyLabel={t("Analyzing...")}>{t("Convert")}</CalcButton></div>
            {r && (
              <ResultCard title={t("Result")}>
                <ResultCircle value={r.out.toLocaleString(undefined, { maximumFractionDigits: 4 })} unit={t(r.to)} sub={`${r.value} ${t(r.from)}`} />
                <div className="mt-4 text-sm text-[#1E1B4B] dark:text-[#FEF3C7]">{t("Breakdown")}: {r.value} {t(r.from)} = {r.out.toLocaleString(undefined, { maximumFractionDigits: 6 })} {t(r.to)}</div>
                <InsightBox icon={Gauge}>{t("Speed conversions use exact factors — 1 km/h = 0.621371 mph. Results round for display but stay accurate.")}</InsightBox>
              </ResultCard>
            )}
          </>
        );
      }
      case "qr-code-generator": {
        const calc = () => {
          const data = inputs.text || "";
          if (!data) return null;
          return `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(data)}`;
        };
        const src = result;
        return (
          <>
            <TxtInput label={t("Text or URL")} value={inputs.text} onChange={set("text")} placeholder="https://iyadel.com" />
            <div className="flex justify-center mt-6"><CalcButton onClick={() => runCalc(calc)} busy={busy} busyLabel={t("Generating...")}>{t("Generate QR")}</CalcButton></div>
            {src && (
              <ResultCard title={t("Your QR Code")}>
                <img src={src} alt="QR Code" className="w-48 h-48 mx-auto rounded-xl bg-white p-2" />
                <a href={src} download="qr-code.png" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 mt-4 text-primary font-semibold hover:underline">{t("Download")} <ImageDown className="w-4 h-4" /></a>
                <InsightBox icon={QrCode}>{t("Your QR code is generated on demand and not stored anywhere — share or download it freely.")}</InsightBox>
              </ResultCard>
            )}
            <TipBox>{t("Your QR code is generated on demand and not stored anywhere.")}</TipBox>
          </>
        );
      }
      case "share-link-generator": {
        const calc = () => {
          if (!inputs.url) return null;
          const url = encodeURIComponent(inputs.url);
          const text = encodeURIComponent(inputs.text || "");
          return {
            Facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
            Twitter: `https://twitter.com/intent/tweet?url=${url}&text=${text}`,
            LinkedIn: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
            WhatsApp: `https://wa.me/?text=${text}%20${url}`,
          };
        };
        const links = result;
        return (
          <>
            <TxtInput label={t("Page URL")} value={inputs.url} onChange={set("url")} placeholder="https://iyadel.com" />
            <TxtInput label={t("Message (optional)")} value={inputs.text} onChange={set("text")} placeholder="Check this out!" />
            <div className="flex justify-center mt-6"><CalcButton onClick={() => runCalc(calc)} busy={busy} busyLabel={t("Analyzing...")}>{t("Generate Links")}</CalcButton></div>
            {links && (
              <ResultCard title={t("Share Links")}>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(links).map(([k, v]) => (
                    <a key={k} href={v} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 rounded-xl bg-background border border-border px-4 py-3 text-sm font-semibold text-[#1F2937] dark:text-[#FEF3C7] hover:border-primary/50 hover:text-primary transition-all"><Send className="w-4 h-4" /> {k}</a>
                  ))}
                </div>
                <InsightBox icon={Link2}>{t("Share links open each platform's native sharing dialog with your URL and message pre-filled.")}</InsightBox>
              </ResultCard>
            )}
          </>
        );
      }
      case "privacy-policy-generator": {
        const generate = () => {
          setBusy(true);
          setTimeout(() => {
            const name = inputs.appName || "iyadel", site = inputs.siteUrl || "https://iyadel.com", email = inputs.email || "support@iyadel.com";
            const text = `Privacy Policy for ${name}\n\nLast Updated: ${new Date().toLocaleDateString()}\n\n${name} ("we", "us", "our") operates ${site}. This policy explains what data we collect and how we use it.\n\n1. Information We Collect\nWe collect information you provide voluntarily and data collected automatically (IP address, browser type, cookies).\n\n2. How We Use Your Information\nWe use information to provide and improve our services, communicate with you, and analyze usage.\n\n3. Cookies\nWe use cookies to improve your experience. You can disable cookies in your browser settings.\n\n4. Third-Party Services\nWe may use third-party tools that collect data according to their own privacy policies.\n\n5. Your Rights\nYou may access, correct, or delete your personal data at any time. Contact us at ${email}.\n\n6. Security\nWe take reasonable measures to protect your data, though no system is 100% secure.\n\n7. Changes to This Policy\nWe may update this policy. Changes will be posted on this page.\n\nContact: ${email}`;
            setPolicyText(text);
            setBusy(false);
            setTimeout(() => document.querySelector('[data-tool-result="true"]')?.scrollIntoView({ behavior: "smooth", block: "center" }), 60);
          }, 800);
        };
        const copy = () => navigator.clipboard?.writeText(policyText);
        return (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <TxtInput label={t("App Name")} value={inputs.appName} onChange={set("appName")} placeholder="iyadel" />
              <TxtInput label={t("Site URL")} value={inputs.siteUrl} onChange={set("siteUrl")} placeholder="https://iyadel.com" />
              <TxtInput label={t("Contact Email")} value={inputs.email} onChange={set("email")} placeholder="support@iyadel.com" />
            </div>
            <div className="flex justify-center mt-6"><CalcButton onClick={generate} busy={busy} busyLabel={t("Analyzing...")}>{t("Generate Policy")}</CalcButton></div>
            {policyText && (
              <ResultCard title={t("Generated Privacy Policy")}>
                <pre className="text-left text-sm whitespace-pre-wrap text-muted-foreground max-h-72 overflow-y-auto bg-background rounded-xl p-4 border border-border">{policyText}</pre>
                <button onClick={copy} className="inline-flex items-center gap-2 mt-4 rounded-xl border border-border bg-background px-4 py-2 text-sm font-medium hover:bg-secondary"><Copy className="w-4 h-4" /> {t("Copy")}</button>
                <InsightBox icon={ShieldCheck}>{t("This generated policy is a starting point — review it with a legal professional before publishing.")}</InsightBox>
              </ResultCard>
            )}
          </>
        );
      }
      case "math-function-calculator": {
        const plot = () => {
          setBusy(true);
          setTimeout(() => {
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
            setBusy(false);
            setTimeout(() => document.querySelector('[data-tool-result="true"]')?.scrollIntoView({ behavior: "smooth", block: "center" }), 60);
          }, 800);
        };
        return (
          <>
            <FnInput label="f(x) =" value={inputs.expr} onChange={set("expr")} placeholder={"sin(x)\ncos(x)\nx^2"} />
            <p className="text-xs text-muted-foreground mt-2 text-left ml-1">{t("One function per line. Supports:")} sin, cos, tan, asin, acos, atan, sinh, cosh, tanh, sqrt, cbrt, ln, log, log2, exp, abs, floor, ceil, round, sign, pi, e, tau, ^, !</p>
            <div className="flex justify-center mt-6"><CalcButton onClick={plot} busy={busy} busyLabel={t("Analyzing...")}>{t("Plot Function")}</CalcButton></div>
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
        return <PercentageCalculator />;
      }
      case "percentage-calculator-legacy": {
        const a = parseFloat(inputs.a), b = parseFloat(inputs.b);
        const mode = inputs.mode || "of";
        const out = (mode === "of") ? (a && b ? (a / 100 * b) : null)
          : (mode === "isWhat") ? (a && b ? (a / b * 100) : null)
          : (mode === "change") ? (a && b ? ((b - a) / a * 100) : null) : null;
        return (
          <>
            <SelectField label={t("Calculation Type")} value={mode} onChange={set("mode")} options={[{ value: "of", label: t("of") }, { value: "isWhat", label: t("isWhat") }, { value: "change", label: t("change") }]} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
              <NumInput label={t("Value A")} value={inputs.a} onChange={set("a")} placeholder="20" />
              <NumInput label={t("Value B")} value={inputs.b} onChange={set("b")} placeholder="150" />
            </div>
            {out != null && (
              <>
                <ResultCard title={t("Result")}>
                  <div className="text-4xl font-extrabold text-accent">{out.toFixed(2)}{mode !== "of" ? "%" : ""}</div>
                </ResultCard>
                {mode === "of" ? (
                  <div className="mt-6 rounded-2xl bg-gradient-to-b from-card to-background border border-border p-5 shadow-[0_12px_30px_-14px_hsl(var(--primary)/0.25),inset_0_1px_0_0_hsl(0_0%_100%/0.05)]">
                    <h4 className="text-sm font-semibold text-muted-foreground mb-3 text-center">{a}% {t("ofB")} {b}</h4>
                    <div className="h-6 w-full rounded-full bg-secondary overflow-hidden">
                      <div className="h-full bg-primary rounded-full transition-all duration-700" style={{ width: `${Math.min(a, 100)}%` }} />
                    </div>
                    <div className="mt-3 text-center text-sm text-muted-foreground">{t("Result")} <strong className="text-primary">{out.toFixed(2)}</strong> {t("ofB")} {b}</div>
                  </div>
                ) : (
                  <div className="mt-6 rounded-2xl bg-gradient-to-b from-card to-background border border-border p-5 shadow-[0_12px_30px_-14px_hsl(var(--primary)/0.25),inset_0_1px_0_0_hsl(0_0%_100%/0.05)]">
                    <h4 className="text-sm font-semibold text-muted-foreground mb-3 text-center">{mode === "isWhat" ? `${a} ${t("asPctOf")} ${b}` : `${t("changeFrom")} ${a} ${t("toWord")} ${b}`}</h4>
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
            <TipBox>{t("Percentage tip")}</TipBox>
          </>
        );
      }
      case "physics-calculators": {
        const mode = inputs.mode || "speed";
        let la = t("Distance (m)"), lb = t("Time (s)"), unit = "m/s";
        if (mode === "distance") { la = t("Speed (m/s)"); lb = t("Time (s)"); unit = "m"; }
        else if (mode === "time") { la = t("Distance (m)"); lb = t("Speed (m/s)"); unit = "s"; }
        else if (mode === "ohm") { la = t("Voltage (V)"); lb = t("Resistance (Ω)"); unit = "A"; }
        const calc = () => {
          const a = parseFloat(inputs.a), b = parseFloat(inputs.b);
          if (!a || !b) return null;
          const value = (mode === "ohm") ? a / b : (mode === "distance") ? a * b : a / b;
          return { value: value.toFixed(3), unit, mode };
        };
        const r = result;
        return (
          <>
            <SelectField label={t("Calculation")} value={mode} onChange={set("mode")} options={[{ value: "speed", label: t("speed") }, { value: "distance", label: t("distance") }, { value: "time", label: t("time") }, { value: "ohm", label: t("ohm") }]} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
              <NumInput label={la} value={inputs.a} onChange={set("a")} placeholder="100" />
              <NumInput label={lb} value={inputs.b} onChange={set("b")} placeholder="10" />
            </div>
            <div className="flex justify-center mt-6"><CalcButton onClick={() => runCalc(calc)} busy={busy} busyLabel={t("Analyzing...")}>{t("Calculate")}</CalcButton></div>
            {r && (
              <ResultCard title={t("Result")}>
                <ResultCircle value={r.value} unit={r.unit} />
                <InsightBox icon={Zap}>{t("Speed = Distance ÷ Time • Ohm's Law: I = V ÷ R. Keep units consistent for correct results.")}</InsightBox>
              </ResultCard>
            )}
            <TipBox>{t("Speed = Distance ÷ Time • Ohm's Law: I = V ÷ R.")}</TipBox>
          </>
        );
      }
      case "chemistry-calculators": {
        const calc = () => {
          const mass = calcMolarMass(inputs.formula || "");
          if (mass == null) return { error: true };
          return { mass: mass.toFixed(3) };
        };
        const r = result;
        return (
          <>
            <TxtInput label={t("Chemical Formula")} value={inputs.formula} onChange={set("formula")} placeholder="H2O" />
            <div className="flex justify-center mt-6"><CalcButton onClick={() => runCalc(calc)} busy={busy} busyLabel={t("Analyzing...")}>{t("Calculate")}</CalcButton></div>
            {r && (r.error ? (
              <ResultCard title={t("Molar Mass")}>
                <div className="text-sm text-destructive">{t("Could not parse the formula. Use element symbols like H2O, NaCl, or C6H12O6.")}</div>
              </ResultCard>
            ) : (
              <ResultCard title={t("Molar Mass")}>
                <ResultCircle value={r.mass} unit="g/mol" sub={inputs.formula} />
                <InsightBox icon={Atom}>{t("Molar mass sums the atomic weights of every atom in the formula — essential for converting between grams and moles.")}</InsightBox>
              </ResultCard>
            ))}
            <TipBox>{t("Enter a formula like H2O, NaCl, or C6H12O6. Supports common elements.")}</TipBox>
          </>
        );
      }
      case "riddle-game": {
        const guess = () => {
          if (riddleGuess.trim().toLowerCase() === riddle.answer.toLowerCase()) setRiddleMsg(t("Correct! 🎉"));
          else {
            const left = riddleAttempts - 1;
            setRiddleAttempts(left);
            setRiddleMsg(left > 0 ? `${t("Wrong.")} ${left} ${t("attempt(s) left.")}` : `${t("Out of attempts! The answer was")} "${riddle.answer}".`);
          }
        };
        const next = () => { setRiddle(riddles[Math.floor(Math.random() * riddles.length)]); setRiddleGuess(""); setRiddleMsg(""); setRiddleAttempts(3); };
        return (
          <>
            <div className="rounded-2xl bg-background border border-border p-6 mb-6">
              <p className="text-lg font-semibold text-foreground mb-2">{t("Riddle")}</p>
              <p className="text-muted-foreground">{riddle.q}</p>
            </div>
            <TxtInput label={t("Your Answer")} value={riddleGuess} onChange={(e) => setRiddleGuess(e.target.value)} placeholder={t("Type your guess")} />
            <div className="flex flex-wrap justify-center gap-3 mt-6">
              <CalcButton onClick={guess}>{t("Submit Answer")}</CalcButton>
              <Button onClick={next} variant="outline" className="mt-6 rounded-2xl px-6 py-6">{t("New Riddle")}</Button>
              <GameMusicButton theme="riddle" className="mt-6" />
            </div>
            {riddleMsg && <ResultCard title="Result"><div className="text-lg font-semibold text-foreground">{riddleMsg}</div></ResultCard>}
            <TipBox>{t("Attempts left:")} {riddleAttempts}</TipBox>
          </>
        );
      }
      case "math-puzzle":
        return <MathPuzzleGame />;
      case "word-scramble":
        return <WordScrambleGame />;
      case "image-cropper": {
        return (
          <>
            <input type="file" accept="image/*" onChange={(e) => e.target.files[0] && readFile(e.target.files[0], setCropSrc)} className="block mx-auto text-sm text-muted-foreground file:mr-3 file:rounded-full file:border-0 file:bg-primary file:text-primary-foreground file:px-4 file:py-2" />
            {cropSrc && <div className="mt-6"><img src={cropSrc} alt="preview" className="max-h-64 mx-auto rounded-xl" /></div>}
            <div className="mt-6"><SelectField label={t("Aspect Ratio")} value={inputs.ratio || "1:1"} onChange={set("ratio")} options={["1:1", "4:3", "16:9", "3:4", "9:16"]} /></div>
            <div className="flex justify-center mt-6"><CalcButton onClick={doCrop}>{t("Crop Image")}</CalcButton></div>
            {cropResult && (
              <ResultCard title={t("Cropped Image")}>
                <img src={cropResult.url} alt="cropped" className="max-h-64 mx-auto rounded-xl" />
                <div className="mt-3 text-sm text-muted-foreground">{cropResult.w} × {cropResult.h} px</div>
                <a href={cropResult.url} download="cropped.png" className="inline-flex items-center gap-2 mt-4 text-primary font-semibold hover:underline">{t("Download")} <ImageDown className="w-4 h-4" /></a>
              </ResultCard>
            )}
            <TipBox>{t("Crops the image to a centered region with the selected aspect ratio — 1:1 for profile pictures, 16:9 for banners.")}</TipBox>
          </>
        );
      }
      case "background-remover": {
        return (
          <>
            <input type="file" accept="image/*" onChange={(e) => { if (e.target.files[0]) { readFile(e.target.files[0], setBgSrc); setBgResult(null); } }} className="block mx-auto text-sm text-muted-foreground file:mr-3 file:rounded-full file:border-0 file:bg-primary file:text-primary-foreground file:px-4 file:py-2" />
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
          pdf.save("iyadel-images.pdf");
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
      case "jpg-to-png": {
        return <JpgToPngConverter />;
      }
      case "image-resizer": {
        return <ImageResizer />;
      }
      case "image-enhancer": {
        const presets = [
          { name: "Auto", vals: { brightness: "10", contrast: "15", saturation: "10", sharpen: "20", dehaze: "20", temperature: "0", effect: "none" } },
          { name: "Vivid", vals: { brightness: "0", contrast: "20", saturation: "40", sharpen: "15", dehaze: "10", temperature: "0", effect: "none" } },
          { name: "B&W", vals: { brightness: "0", contrast: "15", saturation: "-100", sharpen: "10", dehaze: "0", temperature: "0", effect: "none" } },
          { name: "Warm", vals: { brightness: "8", contrast: "10", saturation: "25", sharpen: "10", dehaze: "15", temperature: "20", effect: "none" } },
          { name: "Soft", vals: { brightness: "12", contrast: "-10", saturation: "-5", sharpen: "0", dehaze: "0", temperature: "0", effect: "none" } },
          { name: "Vintage", vals: { brightness: "5", contrast: "10", saturation: "-15", sharpen: "5", dehaze: "10", temperature: "15", effect: "vintage" } },
          { name: "Sepia", vals: { brightness: "5", contrast: "10", saturation: "-10", sharpen: "5", dehaze: "0", temperature: "10", effect: "sepia" } },
          { name: "HDR", vals: { brightness: "5", contrast: "30", saturation: "20", sharpen: "35", dehaze: "40", temperature: "0", effect: "none" } },
          { name: "Cool", vals: { brightness: "0", contrast: "15", saturation: "10", sharpen: "10", dehaze: "15", temperature: "-25", effect: "none" } },
          { name: "Sunset", vals: { brightness: "8", contrast: "12", saturation: "30", sharpen: "10", dehaze: "20", temperature: "35", effect: "none" } },
          { name: "Noir", vals: { brightness: "-5", contrast: "30", saturation: "-100", sharpen: "20", dehaze: "10", temperature: "0", effect: "none" } },
          { name: "Dramatic", vals: { brightness: "-5", contrast: "40", saturation: "15", sharpen: "25", dehaze: "30", temperature: "0", effect: "none" } },
          { name: "Invert", vals: { brightness: "0", contrast: "0", saturation: "0", sharpen: "0", dehaze: "0", temperature: "0", effect: "invert" } },
          { name: "Vignette", vals: { brightness: "0", contrast: "15", saturation: "10", sharpen: "10", dehaze: "0", temperature: "0", effect: "vignette" } },
        ];
        const applyPreset = (vals) => setInputs((p) => ({ ...p, ...vals }));
        const resetEnhance = () => setInputs((p) => ({ ...p, brightness: "0", contrast: "0", saturation: "0", sharpen: "0", dehaze: "0", temperature: "0", effect: "none" }));
        const rotateBase = (deg) => {
          const orig = enhOrigRef.current;
          if (!orig) return;
          const { width: w, height: h } = orig;
          const c = document.createElement("canvas");
          c.width = (deg === 90 || deg === 270) ? h : w;
          c.height = (deg === 90 || deg === 270) ? w : h;
          const cx = c.getContext("2d");
          cx.translate(c.width / 2, c.height / 2);
          cx.rotate((deg * Math.PI) / 180);
          const src = document.createElement("canvas");
          src.width = w; src.height = h;
          src.getContext("2d").putImageData(orig, 0, 0);
          cx.drawImage(src, -w / 2, -h / 2);
          enhOrigRef.current = cx.getImageData(0, 0, c.width, c.height);
          setEnhVersion((v) => v + 1);
        };
        const flipBase = (axis) => {
          const orig = enhOrigRef.current;
          if (!orig) return;
          const { width: w, height: h } = orig;
          const c = document.createElement("canvas");
          c.width = w; c.height = h;
          const cx = c.getContext("2d");
          cx.translate(axis === "h" ? w : 0, axis === "v" ? h : 0);
          cx.scale(axis === "h" ? -1 : 1, axis === "v" ? -1 : 1);
          const src = document.createElement("canvas");
          src.width = w; src.height = h;
          src.getContext("2d").putImageData(orig, 0, 0);
          cx.drawImage(src, 0, 0);
          enhOrigRef.current = cx.getImageData(0, 0, w, h);
          setEnhVersion((v) => v + 1);
        };
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
            {enhSrc && (
              <div className="mt-6 flex flex-wrap justify-center gap-2">
                <button onClick={() => rotateBase(90)} className="px-3 py-2 rounded-xl bg-card border border-border text-sm font-semibold text-card-foreground hover:bg-muted transition-all">{t("Rotate 90°")}</button>
                <button onClick={() => rotateBase(270)} className="px-3 py-2 rounded-xl bg-card border border-border text-sm font-semibold text-card-foreground hover:bg-muted transition-all">{t("Rotate -90°")}</button>
                <button onClick={() => rotateBase(180)} className="px-3 py-2 rounded-xl bg-card border border-border text-sm font-semibold text-card-foreground hover:bg-muted transition-all">{t("Rotate 180°")}</button>
                <button onClick={() => flipBase("h")} className="px-3 py-2 rounded-xl bg-card border border-border text-sm font-semibold text-card-foreground hover:bg-muted transition-all">{t("Flip H")}</button>
                <button onClick={() => flipBase("v")} className="px-3 py-2 rounded-xl bg-card border border-border text-sm font-semibold text-card-foreground hover:bg-muted transition-all">{t("Flip V")}</button>
              </div>
            )}
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {presets.map((p) => (
                <button key={p.name} onClick={() => applyPreset(p.vals)} className="px-4 py-2 rounded-full bg-card border border-border text-sm font-semibold text-card-foreground hover:bg-muted hover:border-primary/30 transition-all">{t(p.name)}</button>
              ))}
              <button onClick={resetEnhance} className="px-4 py-2 rounded-full bg-secondary border border-border text-sm font-semibold text-secondary-foreground hover:bg-muted transition-all">{t("Reset")}</button>
            </div>
            <div className="mt-6"><SelectField label={t("Effect")} value={inputs.effect || "none"} onChange={set("effect")} options={[{ value: "none", label: t("None") }, { value: "sepia", label: t("Sepia") }, { value: "vintage", label: t("Vintage") }, { value: "invert", label: t("Invert") }, { value: "vignette", label: t("Vignette") }]} /></div>
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
              <RangeField label={t("Brightness")} value={inputs.brightness || "0"} onChange={set("brightness")} min={-100} max={100} />
              <RangeField label={t("Contrast")} value={inputs.contrast || "0"} onChange={set("contrast")} min={-100} max={100} />
              <RangeField label={t("Saturation")} value={inputs.saturation || "0"} onChange={set("saturation")} min={-100} max={100} />
              <RangeField label={t("Temperature")} value={inputs.temperature || "0"} onChange={set("temperature")} min={-100} max={100} />
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
        const templates = ["Minimalist", "Badge", "Modern", "Emblem", "Bold", "Gradient", "Lettermark", "Mascot", "Monogram", "Circle", "Hexagon", "Stripe"];
        const icons = ["★","✦","◆","●","■","▲","♥","⬢","◎","✺","✥","❖","⚜","☀","☘","♛","♜","⚙","☰","🚀","⚡","🛡","🎯","🔥","💎","🌿","🌟","🍃","🌱","🌍","🌙","☀️","⭐","🍀","🌷","🌹","🦋","🐾","🐉","🦅","🦁","🐺","🦊","🐱","🐶","🐋","🐬","🐝","🐞","⚽","🏀","🏈","🎮","🎵","🎸","🎧","📷","✏️","📖","💡","🔬","🧪","⚙️","🔧","🔨","🛠","💻","🖥","📱","📡","🔔","✉️","📦","🛒","💰","💳","🏷","🎁","🏆","👑","⚖️","🔑","🗝","📌","📍","✅","❤️","💜","💚","💙","🧡","💛","🤍"];
        const fonts = ["Sans", "Serif", "Mono", "Poppins", "Playfair", "Pacifico", "Bebas", "Lobster", "Oswald", "Anton", "Montserrat", "Dancing"];
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
      case "basic-calculator":
      case "scientific-calculator":
      case "fraction-calculator":
      case "statistics-calculator":
      case "geometry-calculator":
      case "quadratic-solver":
      case "gcd-lcm-calculator":
      case "perm-comb-calculator":
      case "matrix-calculator":
        return <MathTools slug={slug} />;
      case "ideal-weight":
      case "body-fat":
      case "daily-protein":
      case "daily-carbs":
      case "daily-fat":
      case "running-pace":
      case "bmr-calculator":
      case "tdee-calculator":
      case "calorie-calculator":
        return <HealthTools slug={slug} />;
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

  return renderCalculator();
}