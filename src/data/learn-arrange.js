// مستويات إضافية (١٧–٢٠): جمل مبعثرة + خليط + ترتيب مزدوج
// يعيد استخدام بيانات THEMES الموجودة (arrange / fill) المتوفرة بـ٨ لغات
import { THEMES, THEMES_IMAGES } from "./learn-languages";

const ARRANGE = THEMES.flatMap((th) => th.arrange); // ٢٤ جملة قابلة للترتيب لكل لغة
const FILL = THEMES.flatMap((th) => th.fill); // ١٢ جملة فراغ لكل لغة
const img = (i) => THEMES_IMAGES[i];

// المستوى ١٧: ١٠ جمل مبعثرة (ترتيب)
const L17 = {
  title: "17 · Scrambled Sentences", titleAr: "١٧ · الجمل المبعثرة", image: img(11), count: 10,
  build: (target) => ARRANGE.slice(0, 10).map((e) => ({ type: "arrange", words: e[target] })),
};
// المستوى ١٨: ١٥ جملة مبعثرة (ترتيب)
const L18 = {
  title: "18 · Scrambled Sentences II", titleAr: "١٨ · الجمل المبعثرة ٢", image: img(9), count: 15,
  build: (target) => ARRANGE.slice(9, 24).map((e) => ({ type: "arrange", words: e[target] })),
};
// المستوى ١٩: ١٥ سؤالاً = جملة مبعثرة ثم جملة املئ الفراغ (تناوب)
const L19 = {
  title: "19 · Scramble & Fill", titleAr: "١٩ · ترتيب وإكمال", image: img(8), count: 15,
  build: (target) => {
    const arr = ARRANGE.slice(16, 24).map((e) => ({ type: "arrange", words: e[target] }));
    const fil = FILL.slice(0, 7).map((e) => ({ type: "fill", sentence: e[target].s, answer: e[target].a, options: e[target].o }));
    const ex = [];
    for (let i = 0; i < 8; i++) { ex.push(arr[i]); if (i < 7) ex.push(fil[i]); }
    return ex; // ٨ ترتيب + ٧ إكمال = ١٥
  },
};
// المستوى ٢٠: ٢٠ سؤالاً — ترتيب جملة بلغة التعلم + جملة بلغة المتحدث (جملتان لكل سؤال)
const L20 = {
  title: "20 · Arrange Both Languages", titleAr: "٢٠ · ترتيب اللغتين", image: img(1), count: 20,
  build: (target, base) => ARRANGE.slice(0, 20).map((e) => ({
    type: "pair",
    targetWords: e[target],
    baseWords: e[base],
  })),
};

export const ARRANGE_LEVELS = [L17, L18, L19, L20];