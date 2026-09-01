// مستويات إضافية (١٧–٢٠): جمل مبعثرة + خليط + ترتيب مزدوج
// يعيد استخدام بيانات THEMES الموجودة (arrange / fill) المتوفرة بـ٨ لغات
// ملاحظة: نصل إلى THEMES/THEMES_IMAGES داخل دوال build (عند الاستدعاء) لا عند تحميل الوحدة،
// لتجنّب التبعية الدائرية مع learn-languages.js (THEMES تُعرّف بعد استيراد هذا الملف).
import { THEMES, THEMES_IMAGES } from "./learn-languages";

// صور مخصّصة للمستويات ١٧–٢٠ (نمط نحلة FluentBee)
export const ARRANGE_IMAGES = [
  "https://media.base44.com/images/public/6a7e76e3396b41955b675542/6fd23d067_generated_image.png",
  "https://media.base44.com/images/public/6a7e76e3396b41955b675542/1bde3014f_generated_image.png",
  "https://media.base44.com/images/public/6a7e76e3396b41955b675542/17f2c5361_generated_image.png",
  "https://media.base44.com/images/public/6a7e76e3396b41955b675542/8976d26a3_generated_image.png",
];

const arrangePool = () => THEMES.flatMap((th) => th.arrange); // ٢٤ جملة قابلة للترتيب لكل لغة
const fillPool = () => THEMES.flatMap((th) => th.fill); // ١٢ جملة فراغ لكل لغة

export const ARRANGE_LEVELS = [
  {
    title: "17 · Scrambled Sentences", titleAr: "١٧ · الجمل المبعثرة", imageIdx: 0, count: 10,
    build: (target) => arrangePool().slice(0, 10).map((e) => ({ type: "arrange", words: e[target] })),
  },
  {
    title: "18 · Scrambled Sentences II", titleAr: "١٨ · الجمل المبعثرة ٢", imageIdx: 1, count: 15,
    build: (target) => arrangePool().slice(9, 24).map((e) => ({ type: "arrange", words: e[target] })),
  },
  {
    title: "19 · Scramble & Fill", titleAr: "١٩ · ترتيب وإكمال", imageIdx: 2, count: 15,
    build: (target) => {
      const arr = arrangePool().slice(16, 24).map((e) => ({ type: "arrange", words: e[target] }));
      const fil = fillPool().slice(0, 7).map((e) => ({ type: "fill", sentence: e[target].s, answer: e[target].a, options: e[target].o }));
      const ex = [];
      for (let i = 0; i < 8; i++) { ex.push(arr[i]); if (i < 7) ex.push(fil[i]); }
      return ex; // ٨ ترتيب + ٧ إكمال = ١٥
    },
  },
  {
    title: "20 · Arrange Both Languages", titleAr: "٢٠ · ترتيب اللغتين", imageIdx: 3, count: 20,
    build: (target, base) => arrangePool().slice(0, 20).map((e) => ({
      type: "pair",
      targetWords: e[target],
      baseWords: e[base],
    })),
  },
];