// ============================================================
// math-engine.test.js — اختبارات سريعة للتحقق
// شغّل: node src/lib/math-engine.test.js
// ============================================================
import mathEngine from "./math-engine.js";

const tests = [];
function test(name, fn) {
  try { fn(); tests.push({ name, ok: true }); }
  catch (e) { tests.push({ name, ok: false, error: e.message }); }
}
const assert = (cond, msg) => { if (!cond) throw new Error(msg || "assertion failed"); };

// 1. حساب أساسي
test("calculateBasic", () => {
  assert(mathEngine("calculate", { expression: "2+3*4" }) === 14, "2+3*4 = 14");
  assert(mathEngine("calculate", { expression: "10/4" }) === 2.5, "10/4 = 2.5");
});

// 2. حساب علمي
test("calculateScientific", () => {
  assert(mathEngine("scientific", { expression: "sqrt(16)" }) === 4, "sqrt(16) = 4");
  assert(mathEngine("scientific", { expression: "log10(100)" }) === 2, "log10(100) = 2");
});

// 3. كسور
test("calculateFraction", () => {
  const r = mathEngine("fraction", { a: 2, b: 3, c: 4, d: 5, op: "add" });
  assert(r.numerator === 22 && r.denominator === 15, "2/3 + 4/5 = 22/15");
});

// 4. نسبة
test("calculatePercent", () => {
  assert(mathEngine("percent", { value: 25, base: 200 }) === 50, "25% of 200 = 50");
});

// 5. تغيّر
test("calculateChange", () => {
  const r = mathEngine("change", { from: 40, to: 60 });
  assert(r.percent === 50 && r.direction === "increase", "40→60 = +50%");
});

// 6. إحصاء
test("calculateStats", () => {
  const r = mathEngine("stats", { numbers: "12, 18, 24, 30, 36" });
  assert(r.mean === 24, "mean = 24");
  assert(r.median === 24, "median = 24");
});

// 7. هندسة
test("calculateGeometry", () => {
  assert(mathEngine("geometry", { type: "rect", a: 5, b: 4 }).value === 20, "rect 5×4 = 20");
  assert(Math.abs(mathEngine("geometry", { type: "circle", a: 2 }).value - 12.5664) < 0.01, "circle r=2");
});

// 8. تربيعية
test("solveQuadratic", () => {
  const r = mathEngine("quadratic", { a: 1, b: -5, c: 6 });
  assert(r.type === "two_real" && r.roots.includes(3) && r.roots.includes(2), "x²-5x+6 → {2,3}");
});

// 9. GCD/LCM
test("calculateGcdLcm", () => {
  const r = mathEngine("gcd_lcm", { numbers: "12, 18, 24" });
  assert(r.gcd === 6 && r.lcm === 72, "gcd=6, lcm=72");
});

// 10. تباديل/توافيق
test("calculatePermComb", () => {
  const r = mathEngine("perm_comb", { n: 5, r: 3 });
  assert(r.nPr === 60 && r.nCr === 10, "5P3=60, 5C3=10");
});

// 11. مصفوفة
test("calculateMatrix", () => {
  const r = mathEngine("matrix", { m1: { a11: 1, a12: 2, a21: 3, a22: 4 }, op: "det" });
  assert(r.value === -2, "det = -2");
  const m = mathEngine("matrix", {
    m1: { a11: 1, a12: 2, a21: 3, a22: 4 },
    m2: { a11: 5, a12: 6, a21: 7, a22: 8 }, op: "mul"
  });
  assert(m.result.a11 === 19, "mul a11 = 19");
});

// تقرير
const passed = tests.filter((t) => t.ok).length;
const failed = tests.filter((t) => !t.ok);
tests.forEach((t) => {
  console.log(`${t.ok ? "✅" : "❌"} ${t.name}${t.ok ? "" : " → " + t.error}`);
});
console.log(`\n${passed}/${tests.length} passed${failed.length ? ", " + failed.length + " failed" : ""}`);