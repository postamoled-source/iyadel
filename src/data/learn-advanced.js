// المستويات المتقدمة 21–26 (8 لغات) — بيانات مستقلة عن المستويات الكلاسيكية 1–20
// مستوى 21: ترتيب الجمل (ordering) · 22: سباق الزمن (speed) · 23: السياق المفقود (cloze) · 24: المرآة المعكوسة (mirror)
// يُولَّد بنك الأسئلة من بيانات المنهج الموجودة (THEMES + CLOZE) لضمان تنوّع كافٍ:
//   21 → 15 سؤالاً (جمل الترتيب من THEMES)
//   22 → 20 سؤالاً (ترجمة اختيار من متعدّد من كلمات THEMES)
//   23 → 25 سؤالاً (جمل cloze من learn-cloze)
//   24 → 30 سؤالاً (مراجعة الأخطاء السابقة + ترجمة من THEMES)
// الاستيراد دائري مع learn-languages لكن آمن: لا نصل إلى THEMES/meaningPool إلا داخل الدوال (وقت التشغيل)

import { THEMES, meaningPool } from "./learn-languages";
import { CLOZE_LEVELS } from "./learn-cloze";
import { buildReviewQuestions, buildKingQuestions, REVIEW_IMG, KING_IMG } from "./learn-master";

const IMG = {
  21: "https://media.base44.com/images/public/6a7e76e3396b41955b675542/345e2b205_generated_image.png",
  22: "https://media.base44.com/images/public/6a7e76e3396b41955b675542/7ef323d07_generated_image.png",
  23: "https://media.base44.com/images/public/6a7e76e3396b41955b675542/07443da4b_generated_image.png",
  24: "https://media.base44.com/images/public/6a7e76e3396b41955b675542/446bcfa62_generated_image.png",
};

const shuffle = (arr) => arr.map((v) => [Math.random(), v]).sort((a, b) => a[0] - b[0]).map((v) => v[1]);
const sample = (arr, n) => shuffle(arr).slice(0, n);

// 21 — ترتيب الجمل: التلميح بلغة الأساس، والترتيب بلغة الهدف
function buildOrdering(target, base, count = 15) {
  const pool = THEMES.flatMap((th) => th.arrange);
  return pool.slice(0, count).map((e) => ({
    hint: e[base].join(" "),
    shuffled: shuffle(e[target]),
    correct: e[target],
  }));
}

// ترجمة اختيار من متعدّد: الكلمة بلغة الهدف، الخيارات بلغة الأساس
function buildTranslationMCQ(target, base, count) {
  const pool = THEMES.flatMap((th) => th.words);
  const meanings = meaningPool(base);
  return pool.slice(0, count).map((w) => {
    const correct = w[base];
    const distractors = sample(meanings.filter((m) => m !== correct), 3);
    const options = shuffle([correct, ...distractors]);
    return { word: w[target], options, correct: options.indexOf(correct) };
  });
}

// 23 — cloze: جملة واحدة (أول جملة) من تمارين learn-cloze
function buildCloze(target, base, count = 25) {
  const pool = [...CLOZE_LEVELS[0].banks(target), ...CLOZE_LEVELS[1].banks(target)];
  return pool.slice(0, count).map((q) => ({
    passage: q.s[0],
    options: q.o,
    correct: q.a,
  }));
}

// 24 — المرآة: مراجعة الأخطاء السابقة أولاً، ثم إكمال بترجمة من THEMES حتى 30
function buildMirror(target, base, count = 30) {
  const meanings = meaningPool(base);
  const mistakes = getAdvMistakes(target);
  const review = mistakes.slice(-count).map((m) => {
    const distractors = sample(meanings.filter((x) => x !== m.correct), 3);
    const options = shuffle([m.correct, ...distractors]);
    return { word: m.word, options, correct: options.indexOf(m.correct) };
  });
  const base30 = buildTranslationMCQ(target, base, count);
  const merged = [...review];
  for (const q of base30) {
    if (merged.length >= count) break;
    if (!merged.some((m) => m.word === q.word)) merged.push(q);
  }
  return merged.slice(0, count);
}

export const ADV_LEVELS = [
  { advanced: true, advN: 21, advType: "ordering", title: "Sentence Ordering", titleAr: "ترتيب الجمل", qLabel: "15 questions", qLabelAr: "15 سؤالاً", special: false, image: IMG[21] },
  { advanced: true, advN: 22, advType: "speed", title: "Speed Race", titleAr: "سباق الزمن", qLabel: "20 questions", qLabelAr: "20 سؤالاً", special: false, image: IMG[22] },
  { advanced: true, advN: 23, advType: "cloze", title: "Missing Context", titleAr: "السياق المفقود", qLabel: "25 questions", qLabelAr: "25 سؤالاً", special: false, image: IMG[23] },
  { advanced: true, advN: 24, advType: "mirror", title: "Mirror Challenge", titleAr: "المرآة المعكوسة", qLabel: "30 questions", qLabelAr: "30 سؤالاً", special: true, image: IMG[24] },
  { advanced: true, advN: 25, advType: "review", title: "Grand Review", titleAr: "المراجعة الشاملة", qLabel: "40 questions", qLabelAr: "40 سؤالاً", special: true, image: REVIEW_IMG },
  { advanced: true, advN: 26, advType: "king", title: "King Level", titleAr: "مستوى الملك", qLabel: "50 questions", qLabelAr: "50 سؤالاً", special: true, image: KING_IMG },
];

export const ADV_LEVELS_BY_N = Object.fromEntries(ADV_LEVELS.map((l) => [l.advN, l]));

export function logAdvMistake(lang, word, correct) {
  try {
    const m = JSON.parse(localStorage.getItem("iyadel_adv_mistakes") || "[]");
    m.push({ lang, word, correct });
    if (m.length > 60) m.shift();
    localStorage.setItem("iyadel_adv_mistakes", JSON.stringify(m));
  } catch {}
}

export function getAdvMistakes(lang) {
  try {
    return JSON.parse(localStorage.getItem("iyadel_adv_mistakes") || "[]").filter((m) => m.lang === lang);
  } catch { return []; }
}

export function getAdvQuestions(n, target, base) {
  if (n === 21) return buildOrdering(target, base, 15);
  if (n === 22) return buildTranslationMCQ(target, base, 20);
  if (n === 23) return buildCloze(target, base, 25);
  if (n === 24) return buildMirror(target, base, 30);
  if (n === 25) return buildReviewQuestions(target, base, 40);
  if (n === 26) return buildKingQuestions(target, base, 50);
  return [];
}