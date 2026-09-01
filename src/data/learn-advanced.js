// المستويات المتقدمة 21–24 (8 لغات) — بيانات مستقلة عن المستويات الكلاسيكية 1–20
// مستوى 21: ترتيب الجمل (ordering) · 22: سباق الزمن (speed) · 23: السياق المفقود (cloze) · 24: المرآة المعكوسة (mirror)

const IMG = {
  21: "https://media.base44.com/images/public/6a7e76e3396b41955b675542/dcbb5fac7_generated_image.png",
  22: "https://media.base44.com/images/public/6a7e76e3396b41955b675542/03c940502_generated_image.png",
  23: "https://media.base44.com/images/public/6a7e76e3396b41955b675542/6422fa196_generated_image.png",
  24: "https://media.base44.com/images/public/6a7e76e3396b41955b675542/10c19b5ba_generated_image.png",
};

export const ADV_QUESTIONS = {
  ar: {
    21: [
      { hint: "الولد يقرأ الكتاب", shuffled: ["الكتاب", "يقرأ", "الولد"], correct: ["الولد", "يقرأ", "الكتاب"] },
      { hint: "نحن نلعب في الحديقة", shuffled: ["في", "نلعب", "الحديقة", "نحن"], correct: ["نحن", "نلعب", "في", "الحديقة"] },
    ],
    22: [
      { word: "سعيد", options: ["حزين", "مبتهج", "غاضب", "خائف"], correct: 1 },
      { word: "كبير", options: ["صغير", "ضخم", "طويل", "قصير"], correct: 1 },
    ],
    23: [
      { passage: "السماء ___ زرقاء اليوم.", options: ["جداً", "ليست", "صافية", "فوق"], correct: "صافية" },
      { passage: "أحب أن آكل ___ في الصباح.", options: ["العشاء", "الغداء", "الفطور", "العصير"], correct: "الفطور" },
    ],
  },
  en: {
    21: [
      { hint: "The cat drinks milk", shuffled: ["milk", "drinks", "The", "cat"], correct: ["The", "cat", "drinks", "milk"] },
      { hint: "She writes a letter", shuffled: ["a", "writes", "She", "letter"], correct: ["She", "writes", "a", "letter"] },
    ],
    22: [
      { word: "Happy", options: ["Sad", "Joyful", "Angry", "Scared"], correct: 1 },
      { word: "Big", options: ["Small", "Huge", "Tall", "Short"], correct: 1 },
    ],
    23: [
      { passage: "The sky is ___ blue today.", options: ["very", "not", "clear", "above"], correct: "clear" },
      { passage: "I like to eat ___ in the morning.", options: ["dinner", "lunch", "breakfast", "juice"], correct: "breakfast" },
    ],
  },
  fr: {
    21: [
      { hint: "Le chat boit du lait", shuffled: ["du", "boit", "chat", "Le", "lait"], correct: ["Le", "chat", "boit", "du", "lait"] },
      { hint: "Elle écrit une lettre", shuffled: ["une", "écrit", "Elle", "lettre"], correct: ["Elle", "écrit", "une", "lettre"] },
    ],
    22: [
      { word: "Heureux", options: ["Triste", "Joyeux", "Fâché", "Peur"], correct: 1 },
      { word: "Grand", options: ["Petit", "Énorme", "Long", "Court"], correct: 1 },
    ],
    23: [
      { passage: "Le ciel est ___ bleu aujourd'hui.", options: ["très", "pas", "clair", "au-dessus"], correct: "clair" },
      { passage: "J'aime manger ___ le matin.", options: ["le dîner", "le déjeuner", "le petit-déjeuner", "le jus"], correct: "le petit-déjeuner" },
    ],
  },
  es: {
    21: [
      { hint: "El gato bebe leche", shuffled: ["leche", "bebe", "El", "gato"], correct: ["El", "gato", "bebe", "leche"] },
      { hint: "Ella escribe una carta", shuffled: ["una", "escribe", "Ella", "carta"], correct: ["Ella", "escribe", "una", "carta"] },
    ],
    22: [
      { word: "Feliz", options: ["Triste", "Alegre", "Enojado", "Asustado"], correct: 1 },
      { word: "Grande", options: ["Pequeño", "Enorme", "Alto", "Bajo"], correct: 1 },
    ],
    23: [
      { passage: "El cielo está ___ azul hoy.", options: ["muy", "no", "claro", "sobre"], correct: "claro" },
      { passage: "Me gusta comer ___ por la mañana.", options: ["la cena", "el almuerzo", "el desayuno", "el jugo"], correct: "el desayuno" },
    ],
  },
  de: {
    21: [
      { hint: "Die Katze trinkt Milch", shuffled: ["trinkt", "Milch", "Die", "Katze"], correct: ["Die", "Katze", "trinkt", "Milch"] },
      { hint: "Sie schreibt einen Brief", shuffled: ["einen", "schreibt", "Sie", "Brief"], correct: ["Sie", "schreibt", "einen", "Brief"] },
    ],
    22: [
      { word: "Glücklich", options: ["Traurig", "Fröhlich", "Wütend", "Ängstlich"], correct: 1 },
      { word: "Groß", options: ["Klein", "Riesig", "Lang", "Kurz"], correct: 1 },
    ],
    23: [
      { passage: "Der Himmel ist ___ blau heute.", options: ["sehr", "nicht", "klar", "über"], correct: "klar" },
      { passage: "Ich esse gerne ___ am Morgen.", options: ["das Abendessen", "das Mittagessen", "das Frühstück", "den Saft"], correct: "das Frühstück" },
    ],
  },
  it: {
    21: [
      { hint: "Il gatto beve latte", shuffled: ["beve", "latte", "Il", "gatto"], correct: ["Il", "gatto", "beve", "latte"] },
      { hint: "Lei scrive una lettera", shuffled: ["una", "scrive", "Lei", "lettera"], correct: ["Lei", "scrive", "una", "lettera"] },
    ],
    22: [
      { word: "Felice", options: ["Triste", "Contento", "Arrabbiato", "Spaventato"], correct: 1 },
      { word: "Grande", options: ["Piccolo", "Enorme", "Alto", "Basso"], correct: 1 },
    ],
    23: [
      { passage: "Il cielo è ___ azzurro oggi.", options: ["molto", "non", "chiaro", "sopra"], correct: "chiaro" },
      { passage: "Mi piace mangiare ___ al mattino.", options: ["la cena", "il pranzo", "la colazione", "il succo"], correct: "la colazione" },
    ],
  },
  pt: {
    21: [
      { hint: "O gato bebe leite", shuffled: ["bebe", "leite", "O", "gato"], correct: ["O", "gato", "bebe", "leite"] },
      { hint: "Ela escreve uma carta", shuffled: ["uma", "escreve", "Ela", "carta"], correct: ["Ela", "escreve", "uma", "carta"] },
    ],
    22: [
      { word: "Feliz", options: ["Triste", "Alegre", "Bravo", "Assustado"], correct: 1 },
      { word: "Grande", options: ["Pequeno", "Enorme", "Alto", "Baixo"], correct: 1 },
    ],
    23: [
      { passage: "O céu está ___ azul hoje.", options: ["muito", "não", "claro", "sobre"], correct: "claro" },
      { passage: "Gosto de comer ___ de manhã.", options: ["o jantar", "o almoço", "o pequeno-almoço", "o sumo"], correct: "o pequeno-almoço" },
    ],
  },
  ja: {
    21: [
      { hint: "猫はミルクを飲みます", shuffled: ["は", "ミルクを", "猫", "飲みます"], correct: ["猫", "は", "ミルクを", "飲みます"] },
      { hint: "彼女は手紙を書きます", shuffled: ["は", "手紙を", "彼女", "書きます"], correct: ["彼女", "は", "手紙を", "書きます"] },
    ],
    22: [
      { word: "速い", options: ["遅い", "速い", "静か", "騒がしい"], correct: 1 },
      { word: "大きい", options: ["小さい", "巨大", "長い", "短い"], correct: 1 },
    ],
    23: [
      { passage: "今日は___が青いです。", options: ["とても", "ない", "晴れて", "上"], correct: "晴れて" },
      { passage: "朝は___を食べます。", options: ["夕食", "昼食", "朝食", "ジュース"], correct: "朝食" },
    ],
  },
};

export const ADV_LEVELS = [
  { advanced: true, advN: 21, advType: "ordering", title: "Sentence Ordering", titleAr: "ترتيب الجمل", qLabel: "12 questions", qLabelAr: "12 سؤالاً", special: false, image: IMG[21] },
  { advanced: true, advN: 22, advType: "speed", title: "Speed Race", titleAr: "سباق الزمن", qLabel: "10 questions", qLabelAr: "10 أسئلة", special: false, image: IMG[22] },
  { advanced: true, advN: 23, advType: "cloze", title: "Missing Context", titleAr: "السياق المفقود", qLabel: "8 questions", qLabelAr: "8 أسئلة", special: false, image: IMG[23] },
  { advanced: true, advN: 24, advType: "mirror", title: "Mirror Challenge", titleAr: "المرآة المعكوسة", qLabel: "Variable", qLabelAr: "متغير", special: true, image: IMG[24] },
];

export const ADV_LEVELS_BY_N = Object.fromEntries(ADV_LEVELS.map((l) => [l.advN, l]));

export function logAdvMistake(lang, word, correct) {
  try {
    const m = JSON.parse(localStorage.getItem("iyadel_adv_mistakes") || "[]");
    m.push({ lang, word, correct });
    if (m.length > 30) m.shift();
    localStorage.setItem("iyadel_adv_mistakes", JSON.stringify(m));
  } catch {}
}

export function getAdvMistakes(lang) {
  try {
    return JSON.parse(localStorage.getItem("iyadel_adv_mistakes") || "[]").filter((m) => m.lang === lang);
  } catch { return []; }
}

export function buildMirrorQuestions(lang) {
  const mistakes = getAdvMistakes(lang);
  const shuffle = (arr) => arr.map((v) => [Math.random(), v]).sort((a, b) => a[0] - b[0]).map((v) => v[1]);
  if (!mistakes.length) {
    const word = lang === "ar" ? "تحدي" : "Challenge";
    const distractors = lang === "ar" ? ["سهل", "عادي", "صعب"] : ["Easy", "Normal", "Hard"];
    const opts = shuffle([word, ...distractors]);
    return [{ word, options: opts, correct: opts.indexOf(word) }];
  }
  return mistakes.slice(-5).map((m) => {
    const distractors = lang === "ar" ? ["خيار أ", "خيار ب", "خيار ج"] : ["Choice A", "Choice B", "Choice C"];
    const opts = shuffle([m.correct, ...distractors]);
    return { word: m.word, options: opts, correct: opts.indexOf(m.correct) };
  });
}

export function getAdvQuestions(n, lang) {
  if (n === 24) return buildMirrorQuestions(lang);
  return (ADV_QUESTIONS[lang] && ADV_QUESTIONS[lang][n]) || [];
}