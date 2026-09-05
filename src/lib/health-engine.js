// Pure functional engine for health & fitness calculations.
// Ported from the Python reference (Mifflin-St Jeor, Devine, US Navy body fat, etc.).

const num = (v) => {
  if (v === null || v === undefined || v === "") return NaN;
  const x = typeof v === "string" ? parseFloat(v) : Number(v);
  return Number.isFinite(x) ? x : NaN;
};
const r2 = (n) => (Number.isFinite(n) ? Math.round(n * 100) / 100 : n);
const r1 = (n) => (Number.isFinite(n) ? Math.round(n * 10) / 10 : n);

const isFemale = (g) => (g || "").toLowerCase() === "female";

const ACTIVITY_FACTORS = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

// Mifflin-St Jeor basal metabolic rate.
function mifflinBmr(gender, weightKg, heightCm, age) {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return isFemale(gender) ? base - 161 : base + 5;
}

export function calculateBmi({ weight, height }) {
  const w = num(weight);
  const h = num(height) / 100;
  if (!w || !h || h <= 0) return null;
  const bmi = w / (h * h);
  let category;
  if (bmi < 18.5) category = "Underweight";
  else if (bmi < 25) category = "Normal weight";
  else if (bmi < 30) category = "Overweight";
  else category = "Obese";
  const pos = Math.max(0, Math.min(100, ((bmi - 15) / 25) * 100));
  return { bmi: r1(bmi), category, pos };
}

export function calculateCalories({ age, gender, height, weight, activity }) {
  const a = num(age);
  const h = num(height);
  const w = num(weight);
  if (!a || !h || !w) return null;
  const g = isFemale(gender) ? "female" : "male";
  const act = (activity || "sedentary").toLowerCase();
  const bmr = mifflinBmr(g, w, h, a);
  const factor = ACTIVITY_FACTORS[act] ?? 1.2;
  const tdee = bmr * factor;
  return {
    bmr: r2(bmr),
    tdee: r2(tdee),
    maintenance: r2(tdee),
    factor,
    loss: r2(tdee - 500),
    gain: r2(tdee + 500),
  };
}

export function calculateIdealWeight({ gender, height }) {
  const h = num(height);
  if (!h) return null;
  const g = isFemale(gender) ? "female" : "male";
  const inches = h / 2.54;
  const base = g === "male" ? 50 : 45.5;
  const ideal = base + 2.3 * (inches - 60);
  return { ideal: r2(ideal), low: r2(ideal - 5), high: r2(ideal + 5) };
}

export function calculateBodyFat({ gender, age, weight, height, waist, neck, hip }) {
  const a = num(age);
  const h = num(height);
  const w = num(weight);
  const wa = num(waist);
  const n = num(neck);
  if (!a || !h || !w || !wa || !n) return null;
  const g = isFemale(gender) ? "female" : "male";
  let bf;
  if (g === "male") {
    if (wa - n <= 0) return { error: "Waist must be greater than neck." };
    bf = 86.01 * Math.log10(wa - n) - 70.041 * Math.log10(h) + 36.76;
  } else {
    const hp = num(hip);
    if (!hp) return { error: "Hip measurement is required for females." };
    if (wa + hp - n <= 0) return { error: "Waist + hip must be greater than neck." };
    bf = 163.205 * Math.log10(wa + hp - n) - 97.684 * Math.log10(h) - 78.387;
  }
  let category;
  if (g === "male") {
    if (bf < 6) category = "Essential Fat";
    else if (bf < 14) category = "Athletic";
    else if (bf < 18) category = "Fitness";
    else if (bf < 25) category = "Acceptable";
    else category = "Obese";
  } else {
    if (bf < 14) category = "Essential Fat";
    else if (bf < 21) category = "Athletic";
    else if (bf < 25) category = "Fitness";
    else if (bf < 32) category = "Acceptable";
    else category = "Obese";
  }
  const pos = Math.max(0, Math.min(100, (bf / 40) * 100));
  return { bodyFat: r2(bf), category, pos };
}

const PROTEIN_FACTORS = {
  sedentary: { maintain: 0.8, build_muscle: 1.0, lose_fat: 1.2 },
  active: { maintain: 1.2, build_muscle: 1.6, lose_fat: 1.8 },
  athlete: { maintain: 1.6, build_muscle: 2.2, lose_fat: 2.0 },
};

export function calculateProtein({ weight, activity, goal }) {
  const w = num(weight);
  if (!w) return null;
  const act = (activity || "sedentary").toLowerCase();
  const gl = (goal || "maintain").toLowerCase();
  const factor = (PROTEIN_FACTORS[act] || PROTEIN_FACTORS.sedentary)[gl] ?? 0.8;
  const protein = w * factor;
  return { protein: r2(protein), low: r2(protein * 0.8), high: r2(protein * 1.2), factor };
}

export function calculateCarbs({ calories, percent }) {
  const c = num(calories);
  const p = num(percent) || 45;
  if (!c) return null;
  const grams = (c * (p / 100)) / 4;
  return { grams: r2(grams), percent: p };
}

export function calculateFat({ calories, percent }) {
  const c = num(calories);
  const p = num(percent) || 30;
  if (!c) return null;
  const grams = (c * (p / 100)) / 9;
  return { grams: r2(grams), percent: p };
}

export function calculatePace({ distance, time }) {
  const d = num(distance);
  const tm = num(time);
  if (!d || d <= 0 || !tm) return null;
  const pace = tm / d;
  const speed = d / (tm / 60);
  return { pace: r2(pace), speed: r2(speed) };
}

export function calculateBmr({ age, gender, height, weight }) {
  const a = num(age);
  const h = num(height);
  const w = num(weight);
  if (!a || !h || !w) return null;
  const g = isFemale(gender) ? "female" : "male";
  const bmr = mifflinBmr(g, w, h, a);
  return { bmr: r2(bmr) };
}

export function calculateTdee({ age, gender, height, weight, activity }) {
  const a = num(age);
  const h = num(height);
  const w = num(weight);
  if (!a || !h || !w) return null;
  const g = isFemale(gender) ? "female" : "male";
  const act = (activity || "sedentary").toLowerCase();
  const bmr = mifflinBmr(g, w, h, a);
  const factor = ACTIVITY_FACTORS[act] ?? 1.2;
  const tdee = bmr * factor;
  return { tdee: r2(tdee), bmr: r2(bmr), factor };
}