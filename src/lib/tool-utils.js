// Shared constants and helper functions for the tool calculators.

export const DISTANCE_UNITS = { Mile: 1609.34, Kilometer: 1000, Hectometer: 100, Yard: 0.9144, Foot: 0.3048, Inch: 0.0254, Centimeter: 0.01, Millimeter: 0.001 };
export const WEIGHT_UNITS = { Ton: 1000000, Quintal: 100000, Kilogram: 1000, Pound: 453.592, Ounce: 28.3495, Gram: 1 };
export const AREA_UNITS = { "km²": 1000000, "mi²": 2589988, Hectare: 10000, Acre: 4046.86, "m²": 1, "ft²": 0.092903, "in²": 0.00064516 };
export const TIME_UNITS = { Day: 86400, Hour: 3600, Minute: 60, Second: 1, Millisecond: 0.001 };
export const SPEED_UNITS = { Knot: 0.514444, "km/h": 0.277778, mph: 0.44704, "m/s": 1 };
export const CURRENCY_RATES = { USD: 1, EUR: 0.92, GBP: 0.79, JPY: 149.5, CNY: 7.24, CHF: 0.88, CAD: 1.36, AUD: 1.52, NZD: 1.64, KRW: 1330, SGD: 1.34, INR: 83.3, BRL: 5.0, RUB: 92.5, ZAR: 18.7, TRY: 32.1, MXN: 17.0, SEK: 10.4, NOK: 10.6, DKK: 6.86, PLN: 4.0, THB: 35.5, MYR: 4.7, IDR: 15600, PKR: 278, MAD: 9.9, EGP: 48.5, SAR: 3.75, AED: 3.67, KWD: 0.31 };
export const ATOMIC_WEIGHTS = { H: 1.008, He: 4.0026, Li: 6.94, Be: 9.0122, B: 10.81, C: 12.011, N: 14.007, O: 15.999, F: 18.998, Ne: 20.18, Na: 22.99, Mg: 24.305, Al: 26.982, Si: 28.085, P: 30.974, S: 32.06, Cl: 35.45, K: 39.098, Ca: 40.078, Fe: 55.845, Cu: 63.546, Zn: 65.38, Br: 79.904, Ag: 107.868, I: 126.904, Ba: 137.327, Au: 196.967, Pb: 207.2 };
export const WORD_LIST = ["PLANET", "GARDEN", "BRIDGE", "PUZZLE", "LAPTOP", "GUITAR", "CASTLE", "BOTTLE"];
export const RIDDLES = [
  { q: "I speak without a mouth and hear without ears. I have nobody, but I come alive with the wind. What am I?", answer: "echo" },
  { q: "The more you take, the more you leave behind. What are they?", answer: "footsteps" },
  { q: "What has keys but can't open locks?", answer: "piano" },
  { q: "I'm tall when I'm young, and I'm short when I'm old. What am I?", answer: "candle" },
  { q: "What gets wetter the more it dries?", answer: "towel" },
];

export function convertUnit(value, units, from, to) {
  const v = parseFloat(value);
  if (isNaN(v) || !units[from] || !units[to]) return null;
  return (v * units[from]) / units[to];
}
export function scrambleWord(word) {
  const arr = word.split("");
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  const s = arr.join("");
  return s === word ? scrambleWord(word) : s;
}
export function generatePuzzle(level) {
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
export function calcMolarMass(formula) {
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
// Color palette for plotting multiple functions.
export const FN_COLORS = ["#7c3aed", "#eab308", "#0ea5e9", "#ef4444", "#10b981", "#ec4899", "#f97316", "#14b8a6"];

const MATH_FUNCS = {
  sin: "Math.sin", cos: "Math.cos", tan: "Math.tan",
  asin: "Math.asin", acos: "Math.acos", atan: "Math.atan",
  sinh: "Math.sinh", cosh: "Math.cosh", tanh: "Math.tanh",
  sqrt: "Math.sqrt", cbrt: "Math.cbrt",
  ln: "Math.log", log: "Math.log10", log10: "Math.log10", log2: "Math.log2",
  exp: "Math.exp", abs: "Math.abs",
  floor: "Math.floor", ceil: "Math.ceil", round: "Math.round", sign: "Math.sign",
};
const MATH_CONSTS = { pi: "Math.PI", e: "Math.E", tau: "(2*Math.PI)" };
const ALLOWED_IDS = new Set(["Math", "PI", "E", "x", "_fact", "NaN", "Infinity"]);

// Lanczos approximation of the Gamma function — lets `n!` work for any real n.
function _gamma(z) {
  const g = 7;
  const c = [0.99999999999980993, 676.5203681218851, -1259.1392167224028, 771.32342877765313, -176.61502916214059, 12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7];
  if (z < 0.5) return Math.PI / (Math.sin(Math.PI * z) * _gamma(1 - z));
  z -= 1;
  let x = c[0];
  for (let i = 1; i < g + 2; i++) x += c[i] / (z + i);
  const t = z + g + 0.5;
  return Math.sqrt(2 * Math.PI) * Math.pow(t, z + 0.5) * Math.exp(-t) * x;
}
const _fact = (n) => _gamma(Number(n) + 1);

// Compiles a user math expression into a function f(x).
// Throws a clear error for unknown functions/variables or invalid syntax.
export function compileExpr(raw) {
  let s = String(raw || "").trim();
  if (!s) throw new Error("Expression is empty");
  s = s.replace(/\^/g, "**");
  s = s.replace(/(\d+(?:\.\d+)?)!/g, "_fact($1)");
  s = s.replace(/([a-zA-Z_][a-zA-Z0-9_]*)!/g, "(_fact($1))");
  for (const [k, v] of Object.entries(MATH_CONSTS)) {
    s = s.replace(new RegExp(`\\b${k}\\b`, "g"), v);
  }
  for (const [k, v] of Object.entries(MATH_FUNCS)) {
    s = s.replace(new RegExp(`\\b${k}\\b(?=\\s*\\()`, "g"), v);
  }
  // Detect unknown identifiers that are not property accesses (e.g. Math.sin).
  const re = /[a-zA-Z_][a-zA-Z0-9_]*/g;
  let m;
  while ((m = re.exec(s)) !== null) {
    const name = m[0];
    if (s[m.index - 1] === ".") continue;
    if (!ALLOWED_IDS.has(name)) throw new Error(`Unknown function or variable: "${name}"`);
  }
  let fn;
  try {
    fn = new Function("x", "_fact", `"use strict"; return ${s};`);
  } catch {
    throw new Error("Invalid expression syntax");
  }
  return (x) => fn(x, _fact);
}

export function evalFn(expr, x) {
  try { return compileExpr(expr)(x); } catch { return NaN; }
}