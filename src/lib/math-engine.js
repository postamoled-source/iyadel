// ============================================================
// math-engine.js — محرّك الأدوات الحسابية المتكاملة
// دوال نقية (بدون واجهة مستخدم) + دالة توزيع رئيسية.
// ============================================================

// ---------- أدوات مساعدة ----------
const gcd = (a, b) => (b === 0 ? Math.abs(a) : gcd(b, a % b));
const lcm = (a, b) => (a * b) / gcd(a, b);
const factorial = (n) => (n <= 1 ? 1 : n * factorial(n - 1));
const round = (n, d = 4) => Number.isFinite(n) ? Number(n.toFixed(d)) : n;
const parseNum = (v) => {
  const n = typeof v === "string" ? parseFloat(v.trim()) : Number(v);
  return Number.isFinite(n) ? n : 0;
};
const parseNums = (raw, { asInt = false } = {}) =>
  String(raw)
    .split(",")
    .map((s) => (asInt ? parseInt(s.trim(), 10) : parseFloat(s.trim())))
    .filter((n) => !isNaN(n) && isFinite(n));

// ---------- 1. الحساب الأساسي ----------
export function calculateBasic(expression) {
  const expr = String(expression)
    .replace(/÷/g, "/")
    .replace(/×/g, "*")
    .replace(/−/g, "-");
  if (!/^[\d+\-*/().\s]*$/.test(expr)) {
    throw new Error("تعبير غير صالح");
  }
  // eslint-disable-next-line no-new-func
  const result = Function(`"use strict"; return (${expr});`)();
  if (!isFinite(result)) throw new Error("نتيجة غير معرفة");
  return round(result, 8);
}

// ---------- 2. حساب علمي ----------
export function calculateScientific(expression) {
  let e = String(expression)
    .replace(/π/g, "Math.PI")
    .replace(/e(?![xp])/g, "Math.E")
    .replace(/\^/g, "**")
    .replace(/log10\(/g, "Math.log10(")
    .replace(/ln\(/g, "Math.log(")
    .replace(/log\(/g, "Math.log10(")
    .replace(/sin\(/g, "Math.sin(")
    .replace(/cos\(/g, "Math.cos(")
    .replace(/tan\(/g, "Math.tan(")
    .replace(/sqrt\(/g, "Math.sqrt(")
    .replace(/abs\(/g, "Math.abs(");
  if (/[a-zA-Z_]/.test(e.replace(/Math\.\w+/g, "").replace(/\*\*/g, ""))) {
    throw new Error("دالة غير مدعومة");
  }
  // eslint-disable-next-line no-new-func
  const result = Function(`"use strict"; return (${e});`)();
  if (!isFinite(result)) throw new Error("نتيجة غير معرفة");
  return round(result, 8);
}

// ---------- 3. الكسور ----------
export function calculateFraction({ a, b, c, d, op }) {
  const n1 = parseNum(a), d1 = parseNum(b) || 1;
  const n2 = parseNum(c), d2 = parseNum(d) || 1;
  if (d1 === 0 || d2 === 0) throw new Error("المقام لا يساوي صفراً");
  if (op === "div" && n2 === 0) throw new Error("لا يمكن القسمة على صفر");

  let num, den;
  switch (op) {
    case "add": num = n1 * d2 + n2 * d1; den = d1 * d2; break;
    case "sub": num = n1 * d2 - n2 * d1; den = d1 * d2; break;
    case "mul": num = n1 * n2; den = d1 * d2; break;
    case "div": num = n1 * d2; den = d1 * n2; break;
    default: throw new Error("عملية غير معروفة");
  }
  const g = gcd(num, den) || 1;
  num /= g; den /= g;
  if (den < 0) { num = -num; den = -den; }
  return { numerator: num, denominator: den, decimal: round(num / den, 6), display: den === 1 ? `${num}` : `${num} / ${den}` };
}

// ---------- 4. النسب ----------
export function calculatePercent({ value, base }) {
  const v = parseNum(value), b = parseNum(base);
  return round((v / 100) * b, 4);
}

export function calculateChange({ from, to }) {
  const f = parseNum(from), t = parseNum(to);
  if (f === 0) throw new Error("القيمة الأولى لا يمكن أن تكون صفراً");
  const change = ((t - f) / Math.abs(f)) * 100;
  return { percent: round(change, 2), direction: change >= 0 ? "increase" : "decrease" };
}

// ---------- 5. الإحصاء ----------
export function calculateStats(numbers) {
  const nums = parseNums(numbers);
  if (nums.length < 2) throw new Error("أدخل على الأقل رقمين");
  const sorted = [...nums].sort((a, b) => a - b);
  const n = sorted.length;
  const sum = sorted.reduce((a, b) => a + b, 0);
  const mean = sum / n;
  const mid = Math.floor(n / 2);
  const median = n % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
  const freq = {};
  let maxFreq = 0;
  sorted.forEach((x) => {
    freq[x] = (freq[x] || 0) + 1;
    if (freq[x] > maxFreq) maxFreq = freq[x];
  });
  const modes = Object.keys(freq).filter((k) => freq[k] === maxFreq).map(Number);
  const mode = modes.length === n ? null : modes;
  const variance = sorted.reduce((a, b) => a + (b - mean) ** 2, 0) / (n - 1);
  const stdDev = Math.sqrt(variance);
  return {
    count: n, sum: round(sum, 4), mean: round(mean, 4), median,
    mode: mode ? mode.join(", ") : "لا يوجد",
    variance: round(variance, 4), stdDev: round(stdDev, 4),
    min: sorted[0], max: sorted[n - 1]
  };
}

// ---------- 6. الهندسة ----------
export function calculateGeometry({ type, a, b, c }) {
  const x = parseNum(a), y = parseNum(b), z = parseNum(c);
  switch (type) {
    case "rect": return { label: "مساحة مستطيل", value: round(x * y, 4) };
    case "circle": return { label: "مساحة دائرة", value: round(Math.PI * x * x, 4) };
    case "cube": return { label: "حجم متوازي المستطيلات", value: round(x * y * z, 4) };
    case "tri": return { label: "مساحة مثلث", value: round(0.5 * x * y, 4) };
    default: throw new Error("نوع غير معروف");
  }
}

// ---------- 7. المعادلة التربيعية ----------
export function solveQuadratic({ a, b, c }) {
  const A = parseNum(a), B = parseNum(b), C = parseNum(c);
  if (A === 0) throw new Error("a لا يمكن أن يكون صفراً");
  const disc = B * B - 4 * A * C;
  if (disc > 0) {
    const x1 = (-B + Math.sqrt(disc)) / (2 * A);
    const x2 = (-B - Math.sqrt(disc)) / (2 * A);
    return { type: "two_real", roots: [round(x1, 4), round(x2, 4)], discriminant: round(disc, 4) };
  }
  if (disc === 0) {
    const x = -B / (2 * A);
    return { type: "double", roots: [round(x, 4)], discriminant: 0 };
  }
  const real = round(-B / (2 * A), 4);
  const imag = round(Math.sqrt(-disc) / (2 * A), 4);
  return { type: "complex", real, imaginary: imag, display: `${real} ± ${imag}i`, discriminant: round(disc, 4) };
}

// ---------- 8. القاسم المشترك والمضاعف المشترك ----------
export function calculateGcdLcm(numbers) {
  const nums = parseNums(numbers, { asInt: true });
  if (nums.length < 2) throw new Error("أدخل على الأقل رقمين صحيحين");
  const g = nums.reduce((acc, n) => gcd(acc, n));
  const l = nums.reduce((acc, n) => lcm(acc, n));
  return { gcd: g, lcm: l };
}

// ---------- 9. التباديل والتوافيق ----------
export function calculatePermComb({ n, r }) {
  const N = parseInt(n, 10), R = parseInt(r, 10);
  if (N < 0 || R < 0 || R > N) throw new Error("تأكد من أن n ≥ r ≥ 0");
  return {
    nPr: factorial(N) / factorial(N - R),
    nCr: factorial(N) / (factorial(R) * factorial(N - R))
  };
}

// ---------- 10. مصفوفة 2×2 ----------
export function calculateMatrix({ m1, m2, op }) {
  const a = m1 || { a11: 0, a12: 0, a21: 0, a22: 0 };
  const b = m2 || { a11: 0, a12: 0, a21: 0, a22: 0 };
  const A = { a11: parseNum(a.a11), a12: parseNum(a.a12), a21: parseNum(a.a21), a22: parseNum(a.a22) };
  const B = { a11: parseNum(b.a11), a12: parseNum(b.a12), a21: parseNum(b.a21), a22: parseNum(b.a22) };

  if (op === "det") {
    return { type: "determinant", value: round(A.a11 * A.a22 - A.a12 * A.a21, 4) };
  }
  let r;
  switch (op) {
    case "add":
      r = { a11: A.a11 + B.a11, a12: A.a12 + B.a12, a21: A.a21 + B.a21, a22: A.a22 + B.a22 };
      break;
    case "sub":
      r = { a11: A.a11 - B.a11, a12: A.a12 - B.a12, a21: A.a21 - B.a21, a22: A.a22 - B.a22 };
      break;
    case "mul":
      r = {
        a11: A.a11 * B.a11 + A.a12 * B.a21,
        a12: A.a11 * B.a12 + A.a12 * B.a22,
        a21: A.a21 * B.a11 + A.a22 * B.a21,
        a22: A.a21 * B.a12 + A.a22 * B.a22
      };
      break;
    default: throw new Error("عملية مصفوفة غير معروفة");
  }
  return { type: "matrix", result: r };
}

// ============================================================
// دالة التوزيع الرئيسية — تستقبل الأمر والمعطيات وتُرجع النتيجة
// ============================================================
export function mathEngine(command, data = {}) {
  switch (command) {
    case "calculate":
    case "basic":
      return calculateBasic(data.expression || data.expr || data);

    case "scientific":
    case "sci":
      return calculateScientific(data.expression || data.expr || data);

    case "fraction":
      return calculateFraction(data);

    case "percent":
      return calculatePercent(data);

    case "change":
      return calculateChange(data);

    case "stats":
      return calculateStats(data.numbers || data.values || data);

    case "geometry":
    case "geo":
      return calculateGeometry(data);

    case "quadratic":
      return solveQuadratic(data);

    case "gcd_lcm":
    case "gcd":
      return calculateGcdLcm(data.numbers || data.values || data);

    case "perm_comb":
    case "perm":
      return calculatePermComb(data);

    case "matrix":
      return calculateMatrix(data);

    default:
      throw new Error(`أمر غير معروف: ${command}. الأوامر المتاحة: calculate, scientific, fraction, percent, change, stats, geometry, quadratic, gcd_lcm, perm_comb, matrix`);
  }
}

export default mathEngine;