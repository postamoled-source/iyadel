// بيانات أداة تعلّم اللغات — ٨ لغات، ١٢ مستوى لكل لغة، ١٥ سؤالاً لكل مستوى
// vocab: اختيار المعنى العربي للكلمة باللغة الهدف
// type: كتابة الكلمة باللغة الهدف
// fill: إكمال الفراغ (باللغة الهدف)
// arrange: ترتيب كلمات (باللغة الهدف)
// listen: استماع ثم اختيار المعنى العربي
// say: الشخصية تنطق جملة باللغة الهدف ثم تختار معناها العربي

export const LANGS = [
  { code: "en", name: "English", nameAr: "الإنجليزية", flag: "🇬🇧", tts: "en-US" },
  { code: "ar", name: "Arabic", nameAr: "العربية", flag: "🇸🇦", tts: "ar-SA" },
  { code: "fr", name: "French", nameAr: "الفرنسية", flag: "🇫🇷", tts: "fr-FR" },
  { code: "es", name: "Spanish", nameAr: "الإسبانية", flag: "🇪🇸", tts: "es-ES" },
  { code: "it", name: "Italian", nameAr: "الإيطالية", flag: "🇮🇹", tts: "it-IT" },
  { code: "de", name: "German", nameAr: "الألمانية", flag: "🇩🇪", tts: "de-DE" },
  { code: "ja", name: "Japanese", nameAr: "اليابانية", flag: "🇯🇵", tts: "ja-JP" },
  { code: "pt", name: "Portuguese", nameAr: "البرتغالية", flag: "🇵🇹", tts: "pt-PT" },
];

// عدد الأسئلة لكل مستوى: ١-٤ → ١٥ ، ٥-٦ → ٢٠ ، ٧-٨ → ٢٥ ، ٩-١٠ → ٣٠ ، ١١-١٢ → ٣٥
export const COUNTS = [15, 15, 15, 15, 20, 20, 25, 25, 30, 30, 35, 35];

// ترتيب بنك الأسئلة (interleaved لتنويع الأنواع وتغطية الكلمات)
const SEQ = [
  [0, "vocab"], [0, "listen"], [0, "type"], "fill",
  [1, "vocab"], [1, "listen"], [1, "type"], "arrange0",
  [2, "vocab"], [2, "listen"], [2, "type"], "say",
  [3, "vocab"], [3, "listen"], [3, "type"], "arrange1",
  [4, "vocab"], [4, "listen"], [4, "type"], "listenSay",
  [5, "vocab"], [5, "listen"], [5, "type"],
  [6, "vocab"], [6, "listen"], [6, "type"],
  [7, "vocab"], [7, "listen"], [7, "type"],
  [8, "vocab"], [8, "listen"], [8, "type"],
  [9, "vocab"], [9, "listen"], [9, "type"],
];

// كل كلمة: { ar, en, fr, es, it, de, ja, pt }
// كل fill: { en:{s,a,o}, fr:{s,a,o}, ... }
// كل arrange: { en:[...], fr:[...], ... }
// كل say: { ar, en, fr, es, it, de, ja, pt }  (القيمة هي النص المنطوق، ar هو المعنى)
export const THEMES = [
  {
    title: "1 · Greetings", titleAr: "١ · التحيات",
    words: [
      { ar: "مرحباً", en: "Hello", fr: "Bonjour", es: "Hola", it: "Ciao", de: "Hallo", ja: "こんにちは", pt: "Olá" },
      { ar: "شكراً", en: "Thank you", fr: "Merci", es: "Gracias", it: "Grazie", de: "Danke", ja: "ありがとう", pt: "Obrigado" },
      { ar: "من فضلك", en: "Please", fr: "S'il vous plaît", es: "Por favor", it: "Per favore", de: "Bitte", ja: "お願いします", pt: "Por favor" },
      { ar: "آسف", en: "Sorry", fr: "Pardon", es: "Perdón", it: "Scusa", de: "Entschuldigung", ja: "ごめんなさい", pt: "Desculpa" },
      { ar: "نعم", en: "Yes", fr: "Oui", es: "Sí", it: "Sì", de: "Ja", ja: "はい", pt: "Sim" },
      { ar: "لا", en: "No", fr: "Non", es: "No", it: "No", de: "Nein", ja: "いいえ", pt: "Não" },
      { ar: "أهلاً", en: "Welcome", fr: "Bienvenue", es: "Bienvenido", it: "Benvenuto", de: "Willkommen", ja: "ようこそ", pt: "Bem-vindo" },
      { ar: "وداعاً", en: "Goodbye", fr: "Au revoir", es: "Adiós", it: "Arrivederci", de: "Tschüss", ja: "さようなら", pt: "Adeus" },
      { ar: "صديق", en: "Friend", fr: "Ami", es: "Amigo", it: "Amico", de: "Freund", ja: "友だち", pt: "Amigo" },
      { ar: "كيف حالك؟", en: "How are you?", fr: "Comment ça va ?", es: "¿Cómo estás?", it: "Come stai?", de: "Wie geht's?", ja: "元気ですか", pt: "Como vai?" },
    ],
    fill: [
      { en: { s: "I say ___ when I meet someone.", a: "hello", o: ["hello", "bye", "no", "yes"] }, fr: { s: "Je dis ___ quand je rencontre quelqu'un.", a: "bonjour", o: ["bonjour", "oui", "non", "merci"] }, es: { s: "Digo ___ cuando conozco a alguien.", a: "hola", o: ["hola", "sí", "no", "gracias"] }, it: { s: "Dico ___ quando incontro qualcuno.", a: "ciao", o: ["ciao", "sì", "no", "grazie"] }, de: { s: "Ich sage ___, wenn ich jemanden treffe.", a: "hallo", o: ["hallo", "ja", "nein", "danke"] }, ja: { s: "誰かに会う時に___と言います。", a: "こんにちは", o: ["こんにちは", "はい", "いいえ", "ありがとう"] }, pt: { s: "Digo ___ quando encontro alguém.", a: "olá", o: ["olá", "sim", "não", "obrigado"] }, ar: { s: "أقول ___ عندما أقابل شخصاً.", a: "مرحباً", o: ["مرحباً", "نعم", "لا", "شكراً"] } },
    ],
    arrange: [
      { en: ["Hello", "my", "friend"], fr: ["Bonjour", "mon", "ami"], es: ["Hola", "amigo", "mío"], it: ["Ciao", "amico", "mio"], de: ["Hallo", "mein", "Freund"], ja: ["こんにちは", "友だち"], pt: ["Olá", "meu", "amigo"], ar: ["مرحباً", "يا", "صديقي"] },
      { en: ["Thank", "you", "very", "much"], fr: ["Merci", "beaucoup"], es: ["Muchas", "gracias"], it: ["Grazie", "mille"], de: ["Vielen", "Dank"], ja: ["どうも", "ありがとう"], pt: ["Muito", "obrigado"], ar: ["شكراً", "جزيلاً"] },
    ],
    say: [
      { ar: "صباح الخير!", en: "Good morning!", fr: "Bonjour !", es: "¡Buenos días!", it: "Buongiorno!", de: "Guten Morgen!", ja: "おはようございます！", pt: "Bom dia!" },
    ],
  },
  {
    title: "2 · Family", titleAr: "٢ · العائلة",
    words: [
      { ar: "أم", en: "Mother", fr: "Mère", es: "Madre", it: "Madre", de: "Mutter", ja: "母", pt: "Mãe" },
      { ar: "أب", en: "Father", fr: "Père", es: "Padre", it: "Padre", de: "Vater", ja: "父", pt: "Pai" },
      { ar: "أخ", en: "Brother", fr: "Frère", es: "Hermano", it: "Fratello", de: "Bruder", ja: "兄", pt: "Irmão" },
      { ar: "أخت", en: "Sister", fr: "Sœur", es: "Hermana", it: "Sorella", de: "Schwester", ja: "姉", pt: "Irmã" },
      { ar: "ابن", en: "Son", fr: "Fils", es: "Hijo", it: "Figlio", de: "Sohn", ja: "息子", pt: "Filho" },
      { ar: "ابنة", en: "Daughter", fr: "Fille", es: "Hija", it: "Figlia", de: "Tochter", ja: "娘", pt: "Filha" },
      { ar: "جد", en: "Grandfather", fr: "Grand-père", es: "Abuelo", it: "Nonno", de: "Großvater", ja: "おじいさん", pt: "Avô" },
      { ar: "جدة", en: "Grandmother", fr: "Grand-mère", es: "Abuela", it: "Nonna", de: "Großmutter", ja: "おばあさん", pt: "Avó" },
      { ar: "عم", en: "Uncle", fr: "Oncle", es: "Tío", it: "Zio", de: "Onkel", ja: "おじ", pt: "Tio" },
      { ar: "عمة", en: "Aunt", fr: "Tante", es: "Tía", it: "Zia", de: "Tante", ja: "おば", pt: "Tia" },
    ],
    fill: [
      { en: { s: "My father's mother is my ___.", a: "grandmother", o: ["grandmother", "uncle", "father", "brother"] }, fr: { s: "La mère de mon père est ma ___.", a: "grand-mère", o: ["grand-mère", "oncle", "père", "frère"] }, es: { s: "La madre de mi padre es mi ___.", a: "abuela", o: ["abuela", "tío", "padre", "hermano"] }, it: { s: "La madre di mio padre è la mia ___.", a: "nonna", o: ["nonna", "zio", "padre", "fratello"] }, de: { s: "Die Mutter meines Vaters ist meine ___.", a: "Großmutter", o: ["Großmutter", "Onkel", "Vater", "Bruder"] }, ja: { s: "父の母は私の___です。", a: "おばあさん", o: ["おばあさん", "おじ", "父", "兄"] }, pt: { s: "A mãe do meu pai é a minha ___.", a: "avó", o: ["avó", "tio", "pai", "irmão"] }, ar: { s: "أم أبي هي ___.", a: "جدتي", o: ["جدتي", "عمي", "أبي", "أخي"] } },
    ],
    arrange: [
      { en: ["My", "mother", "is", "kind"], fr: ["Ma", "mère", "est", "gentille"], es: ["Mi", "madre", "es", "amable"], it: ["Mia", "madre", "è", "gentile"], de: ["Meine", "Mutter", "ist", "nett"], ja: ["母", "は", "優しい"], pt: ["Minha", "mãe", "é", "gentil"], ar: ["أمي", "لطيفة"] },
      { en: ["I", "love", "my", "family"], fr: ["J'aime", "ma", "famille"], es: ["Amo", "a", "mi", "familia"], it: ["Amo", "la", "mia", "famiglia"], de: ["Ich", "liebe", "meine", "Familie"], ja: ["家族", "が", "好き"], pt: ["Amo", "a", "minha", "família"], ar: ["أحب", "عائلتي"] },
    ],
    say: [
      { ar: "هذه عائلتي.", en: "This is my family.", fr: "C'est ma famille.", es: "Esta es mi familia.", it: "Questa è la mia famiglia.", de: "Das ist meine Familie.", ja: "これは私の家族です。", pt: "Esta é a minha família." },
    ],
  },
  {
    title: "3 · Numbers", titleAr: "٣ · الأرقام",
    words: [
      { ar: "واحد", en: "One", fr: "Un", es: "Uno", it: "Uno", de: "Eins", ja: "一", pt: "Um" },
      { ar: "اثنان", en: "Two", fr: "Deux", es: "Dos", it: "Due", de: "Zwei", ja: "二", pt: "Dois" },
      { ar: "ثلاثة", en: "Three", fr: "Trois", es: "Tres", it: "Tre", de: "Drei", ja: "三", pt: "Três" },
      { ar: "أربعة", en: "Four", fr: "Quatre", es: "Cuatro", it: "Quattro", de: "Vier", ja: "四", pt: "Quatro" },
      { ar: "خمسة", en: "Five", fr: "Cinq", es: "Cinco", it: "Cinque", de: "Fünf", ja: "五", pt: "Cinco" },
      { ar: "ستة", en: "Six", fr: "Six", es: "Seis", it: "Sei", de: "Sechs", ja: "六", pt: "Seis" },
      { ar: "سبعة", en: "Seven", fr: "Sept", es: "Siete", it: "Sette", de: "Sieben", ja: "七", pt: "Sete" },
      { ar: "ثمانية", en: "Eight", fr: "Huit", es: "Ocho", it: "Otto", de: "Acht", ja: "八", pt: "Oito" },
      { ar: "تسعة", en: "Nine", fr: "Neuf", es: "Nueve", it: "Nove", de: "Neun", ja: "九", pt: "Nove" },
      { ar: "عشرة", en: "Ten", fr: "Dix", es: "Diez", it: "Dieci", de: "Zehn", ja: "十", pt: "Dez" },
    ],
    fill: [
      { en: { s: "Two plus two is ___.", a: "four", o: ["four", "five", "three", "one"] }, fr: { s: "Deux plus deux font ___.", a: "quatre", o: ["quatre", "cinq", "trois", "un"] }, es: { s: "Dos más dos son ___.", a: "cuatro", o: ["cuatro", "cinco", "tres", "uno"] }, it: { s: "Due più due fa ___.", a: "quattro", o: ["quattro", "cinque", "tre", "uno"] }, de: { s: "Zwei plus zwei ist ___.", a: "vier", o: ["vier", "fünf", "drei", "eins"] }, ja: { s: "二たす二は___です。", a: "四", o: ["四", "五", "三", "一"] }, pt: { s: "Dois mais dois são ___.", a: "quatro", o: ["quatro", "cinco", "três", "um"] }, ar: { s: "اثنان زائد اثنان يساوي ___.", a: "أربعة", o: ["أربعة", "خمسة", "ثلاثة", "واحد"] } },
    ],
    arrange: [
      { en: ["I", "have", "two", "books"], fr: ["J'ai", "deux", "livres"], es: ["Tengo", "dos", "libros"], it: ["Ho", "due", "libri"], de: ["Ich", "habe", "zwei", "Bücher"], ja: ["本", "を", "二冊", "持っています"], pt: ["Tenho", "dois", "livros"], ar: ["لدي", "كتابان"] },
      { en: ["Three", "and", "four", "is", "seven"], fr: ["Trois", "et", "quatre", "font", "sept"], es: ["Tres", "y", "cuatro", "son", "siete"], it: ["Tre", "e", "quattro", "fa", "sette"], de: ["Drei", "und", "vier", "sind", "sieben"], ja: ["三", "と", "四", "で", "七"], pt: ["Três", "e", "quatro", "são", "sete"], ar: ["ثلاثة", "وأربعة", "تساوي", "سبعة"] },
    ],
    say: [
      { ar: "عمري عشر سنوات.", en: "I am ten years old.", fr: "J'ai dix ans.", es: "Tengo diez años.", it: "Ho dieci anni.", de: "Ich bin zehn Jahre alt.", ja: "私は十歳です。", pt: "Tenho dez anos." },
    ],
  },
  {
    title: "4 · Colors", titleAr: "٤ · الألوان",
    words: [
      { ar: "أحمر", en: "Red", fr: "Rouge", es: "Rojo", it: "Rosso", de: "Rot", ja: "赤", pt: "Vermelho" },
      { ar: "أزرق", en: "Blue", fr: "Bleu", es: "Azul", it: "Blu", de: "Blau", ja: "青", pt: "Azul" },
      { ar: "أخضر", en: "Green", fr: "Vert", es: "Verde", it: "Verde", de: "Grün", ja: "緑", pt: "Verde" },
      { ar: "أصفر", en: "Yellow", fr: "Jaune", es: "Amarillo", it: "Giallo", de: "Gelb", ja: "黄", pt: "Amarelo" },
      { ar: "أبيض", en: "White", fr: "Blanc", es: "Blanco", it: "Bianco", de: "Weiß", ja: "白", pt: "Branco" },
      { ar: "أسود", en: "Black", fr: "Noir", es: "Negro", it: "Nero", de: "Schwarz", ja: "黒", pt: "Preto" },
      { ar: "برتقالي", en: "Orange", fr: "Orange", es: "Naranja", it: "Arancione", de: "Orange", ja: "オレンジ", pt: "Laranja" },
      { ar: "وردي", en: "Pink", fr: "Rose", es: "Rosa", it: "Rosa", de: "Rosa", ja: "ピンク", pt: "Rosa" },
      { ar: "بنفسجي", en: "Purple", fr: "Violet", es: "Morado", it: "Viola", de: "Lila", ja: "紫", pt: "Roxo" },
      { ar: "بني", en: "Brown", fr: "Marron", es: "Marrón", it: "Marrone", de: "Braun", ja: "茶色", pt: "Marrom" },
    ],
    fill: [
      { en: { s: "Grass is ___.", a: "green", o: ["green", "red", "black", "pink"] }, fr: { s: "L'herbe est ___.", a: "verte", o: ["verte", "rouge", "noire", "rose"] }, es: { s: "La hierba es ___.", a: "verde", o: ["verde", "roja", "negra", "rosa"] }, it: { s: "L'erba è ___.", a: "verde", o: ["verde", "rossa", "nera", "rosa"] }, de: { s: "Gras ist ___.", a: "grün", o: ["grün", "rot", "schwarz", "rosa"] }, ja: { s: "草は___です。", a: "緑", o: ["緑", "赤", "黒", "ピンク"] }, pt: { s: "A erva é ___.", a: "verde", o: ["verde", "vermelha", "preta", "rosa"] }, ar: { s: "العشب ___.", a: "أخضر", o: ["أخضر", "أحمر", "أسود", "وردي"] } },
    ],
    arrange: [
      { en: ["The", "sky", "is", "blue"], fr: ["Le", "ciel", "est", "bleu"], es: ["El", "cielo", "es", "azul"], it: ["Il", "cielo", "è", "blu"], de: ["Der", "Himmel", "ist", "blau"], ja: ["空", "は", "青い"], pt: ["O", "céu", "é", "azul"], ar: ["السماء", "زرقاء"] },
      { en: ["I", "like", "red"], fr: ["J'aime", "le", "rouge"], es: ["Me", "gusta", "el", "rojo"], it: ["Mi", "piace", "il", "rosso"], de: ["Ich", "mag", "rot"], ja: ["赤", "が", "好き"], pt: ["Gosto", "de", "vermelho"], ar: ["أحب", "الأحمر"] },
    ],
    say: [
      { ar: "أحب الثلج الأبيض.", en: "I like the white snow.", fr: "J'aime la neige blanche.", es: "Me gusta la nieve blanca.", it: "Mi piace la neve bianca.", de: "Ich mag den weißen Schnee.", ja: "白い雪が好きです。", pt: "Gosto da neve branca." },
    ],
  },
  {
    title: "5 · Food & Drink", titleAr: "٥ · الطعام والشراب",
    words: [
      { ar: "خبز", en: "Bread", fr: "Pain", es: "Pan", it: "Pane", de: "Brot", ja: "パン", pt: "Pão" },
      { ar: "حليب", en: "Milk", fr: "Lait", es: "Leche", it: "Latte", de: "Milch", ja: "牛乳", pt: "Leite" },
      { ar: "ماء", en: "Water", fr: "Eau", es: "Agua", it: "Acqua", de: "Wasser", ja: "水", pt: "Água" },
      { ar: "تفاحة", en: "Apple", fr: "Pomme", es: "Manzana", it: "Mela", de: "Apfel", ja: "りんご", pt: "Maçã" },
      { ar: "بيضة", en: "Egg", fr: "Œuf", es: "Huevo", it: "Uovo", de: "Ei", ja: "たまご", pt: "Ovo" },
      { ar: "جبن", en: "Cheese", fr: "Fromage", es: "Queso", it: "Formaggio", de: "Käse", ja: "チーズ", pt: "Queijo" },
      { ar: "أرز", en: "Rice", fr: "Riz", es: "Arroz", it: "Riso", de: "Reis", ja: "米", pt: "Arroz" },
      { ar: "لحم", en: "Meat", fr: "Viande", es: "Carne", it: "Carne", de: "Fleisch", ja: "肉", pt: "Carne" },
      { ar: "سمك", en: "Fish", fr: "Poisson", es: "Pescado", it: "Pesce", de: "Fisch", ja: "魚", pt: "Peixe" },
      { ar: "سكر", en: "Sugar", fr: "Sucre", es: "Azúcar", it: "Zucchero", de: "Zucker", ja: "砂糖", pt: "Açúcar" },
    ],
    fill: [
      { en: { s: "I drink ___ when I am thirsty.", a: "water", o: ["water", "bread", "rice", "meat"] }, fr: { s: "Je bois ___ quand j'ai soif.", a: "eau", o: ["eau", "pain", "riz", "viande"] }, es: { s: "Bebo ___ cuando tengo sed.", a: "agua", o: ["agua", "pan", "arroz", "carne"] }, it: { s: "Bevo ___ quando ho sete.", a: "acqua", o: ["acqua", "pane", "riso", "carne"] }, de: { s: "Ich trinke ___, wenn ich Durst habe.", a: "Wasser", o: ["Wasser", "Brot", "Reis", "Fleisch"] }, ja: { s: "喉が渇いた時に___を飲みます。", a: "水", o: ["水", "パン", "米", "肉"] }, pt: { s: "Bebo ___ quando tenho sede.", a: "água", o: ["água", "pão", "arroz", "carne"] }, ar: { s: "أشرب ___ عندما أكون عطشان.", a: "ماء", o: ["ماء", "خبز", "أرز", "لحم"] } },
    ],
    arrange: [
      { en: ["I", "drink", "water", "every", "day"], fr: ["Je", "bois", "de", "l'eau", "tous", "les", "jours"], es: ["Bebo", "agua", "todos", "los", "días"], it: ["Bevo", "acqua", "ogni", "giorno"], de: ["Ich", "trinke", "jeden", "Tag", "Wasser"], ja: ["毎日", "水", "を", "飲みます"], pt: ["Bebo", "água", "todos", "os", "dias"], ar: ["أشرب", "الماء", "كل", "يوم"] },
      { en: ["I", "eat", "bread"], fr: ["Je", "mange", "du", "pain"], es: ["Como", "pan"], it: ["Mangio", "pane"], de: ["Ich", "esse", "Brot"], ja: ["パン", "を", "食べます"], pt: ["Como", "pão"], ar: ["آكل", "الخبز"] },
    ],
    say: [
      { ar: "أشرب الماء كل يوم.", en: "I drink water every day.", fr: "Je bois de l'eau tous les jours.", es: "Bebo agua todos los días.", it: "Bevo acqua ogni giorno.", de: "Ich trinke jeden Tag Wasser.", ja: "毎日水を飲みます。", pt: "Bebo água todos os dias." },
    ],
  },
  {
    title: "6 · Animals", titleAr: "٦ · الحيوانات",
    words: [
      { ar: "قطة", en: "Cat", fr: "Chat", es: "Gato", it: "Gatto", de: "Katze", ja: "猫", pt: "Gato" },
      { ar: "كلب", en: "Dog", fr: "Chien", es: "Perro", it: "Cane", de: "Hund", ja: "犬", pt: "Cão" },
      { ar: "طائر", en: "Bird", fr: "Oiseau", es: "Pájaro", it: "Uccello", de: "Vogel", ja: "鳥", pt: "Pássaro" },
      { ar: "حصان", en: "Horse", fr: "Cheval", es: "Caballo", it: "Cavallo", de: "Pferd", ja: "馬", pt: "Cavalo" },
      { ar: "أسد", en: "Lion", fr: "Lion", es: "León", it: "Leone", de: "Löwe", ja: "ライオン", pt: "Leão" },
      { ar: "نمر", en: "Tiger", fr: "Tigre", es: "Tigre", it: "Tigre", de: "Tiger", ja: "虎", pt: "Tigre" },
      { ar: "فيل", en: "Elephant", fr: "Éléphant", es: "Elefante", it: "Elefante", de: "Elefant", ja: "象", pt: "Elefante" },
      { ar: "قرد", en: "Monkey", fr: "Singe", es: "Mono", it: "Scimmia", de: "Affe", ja: "猿", pt: "Macaco" },
      { ar: "ثعبان", en: "Snake", fr: "Serpent", es: "Serpiente", it: "Serpente", de: "Schlange", ja: "蛇", pt: "Cobra" },
      { ar: "بقرة", en: "Cow", fr: "Vache", es: "Vaca", it: "Mucca", de: "Kuh", ja: "牛", pt: "Vaca" },
    ],
    fill: [
      { en: { s: "A ___ can fly.", a: "bird", o: ["bird", "cow", "fish", "rabbit"] }, fr: { s: "Un ___ peut voler.", a: "oiseau", o: ["oiseau", "vache", "poisson", "lapin"] }, es: { s: "Un ___ puede volar.", a: "pájaro", o: ["pájaro", "vaca", "pez", "conejo"] }, it: { s: "Un ___ può volare.", a: "uccello", o: ["uccello", "mucca", "pesce", "coniglio"] }, de: { s: "Ein ___ kann fliegen.", a: "Vogel", o: ["Vogel", "Kuh", "Fisch", "Hase"] }, ja: { s: "___は飛べます。", a: "鳥", o: ["鳥", "牛", "魚", "うさぎ"] }, pt: { s: "Um ___ pode voar.", a: "pássaro", o: ["pássaro", "vaca", "peixe", "coelho"] }, ar: { s: "يستطيع ___ الطيران.", a: "طائر", o: ["طائر", "بقرة", "سمك", "أرنب"] } },
    ],
    arrange: [
      { en: ["The", "cat", "is", "small"], fr: ["Le", "chat", "est", "petit"], es: ["El", "gato", "es", "pequeño"], it: ["Il", "gatto", "è", "piccolo"], de: ["Die", "Katze", "ist", "klein"], ja: ["猫", "は", "小さい"], pt: ["O", "gato", "é", "pequeno"], ar: ["القطة", "صغيرة"] },
      { en: ["The", "lion", "is", "strong"], fr: ["Le", "lion", "est", "fort"], es: ["El", "león", "es", "fuerte"], it: ["Il", "leone", "è", "forte"], de: ["Der", "Löwe", "ist", "stark"], ja: ["ライオン", "は", "強い"], pt: ["O", "leão", "é", "forte"], ar: ["الأسد", "قوي"] },
    ],
    say: [
      { ar: "الأسد قوي.", en: "The lion is strong.", fr: "Le lion est fort.", es: "El león es fuerte.", it: "Il leone è forte.", de: "Der Löwe ist stark.", ja: "ライオンは強いです。", pt: "O leão é forte." },
    ],
  },
  {
    title: "7 · Daily Routines", titleAr: "٧ · الروتين اليومي",
    words: [
      { ar: "يأكل", en: "Eat", fr: "Manger", es: "Comer", it: "Mangiare", de: "Essen", ja: "食べる", pt: "Comer" },
      { ar: "يشرب", en: "Drink", fr: "Boire", es: "Beber", it: "Bere", de: "Trinken", ja: "飲む", pt: "Beber" },
      { ar: "يقرأ", en: "Read", fr: "Lire", es: "Leer", it: "Leggere", de: "Lesen", ja: "読む", pt: "Ler" },
      { ar: "يكتب", en: "Write", fr: "Écrire", es: "Escribir", it: "Scrivere", de: "Schreiben", ja: "書く", pt: "Escrever" },
      { ar: "يجري", en: "Run", fr: "Courir", es: "Correr", it: "Correre", de: "Laufen", ja: "走る", pt: "Correr" },
      { ar: "ينام", en: "Sleep", fr: "Dormir", es: "Dormir", it: "Dormire", de: "Schlafen", ja: "寝る", pt: "Dormir" },
      { ar: "يعمل", en: "Work", fr: "Travailler", es: "Trabajar", it: "Lavorare", de: "Arbeiten", ja: "働く", pt: "Trabalhar" },
      { ar: "يدرس", en: "Study", fr: "Étudier", es: "Estudiar", it: "Studiare", de: "Studieren", ja: "勉強する", pt: "Estudar" },
      { ar: "يلعب", en: "Play", fr: "Jouer", es: "Jugar", it: "Giocare", de: "Spielen", ja: "遊ぶ", pt: "Jogar" },
      { ar: "يمشي", en: "Walk", fr: "Marcher", es: "Caminar", it: "Camminare", de: "Gehen", ja: "歩く", pt: "Andar" },
    ],
    fill: [
      { en: { s: "I ___ when I am tired.", a: "sleep", o: ["sleep", "run", "eat", "study"] }, fr: { s: "Je ___ quand je suis fatigué.", a: "dors", o: ["dors", "cours", "mange", "étudie"] }, es: { s: "___ cuando estoy cansado.", a: "duermo", o: ["duermo", "corro", "como", "estudio"] }, it: { s: "___ quando sono stanco.", a: "dormo", o: ["dormo", "corro", "mangio", "studio"] }, de: { s: "Ich ___, wenn ich müde bin.", a: "schlafe", o: ["schlafe", "laufe", "esse", "studiere"] }, ja: { s: "疲れた時に___します。", a: "寝", o: ["寝", "走", "食べ", "勉強"] }, pt: { s: "___ quando estou cansado.", a: "durmo", o: ["durmo", "corro", "como", "estudo"] }, ar: { s: "عندما أكون متعباً ___.", a: "أنام", o: ["أنام", "أجري", "آكل", "أدرس"] } },
    ],
    arrange: [
      { en: ["I", "read", "a", "book", "at", "night"], fr: ["Je", "lis", "un", "livre", "la", "nuit"], es: ["Leo", "un", "libro", "por", "la", "noche"], it: ["Leggo", "un", "libro", "di", "notte"], de: ["Ich", "lese", "nachts", "ein", "Buch"], ja: ["夜", "に", "本", "を", "読みます"], pt: ["Leio", "um", "livro", "à", "noite"], ar: ["أقرأ", "كتاباً", "في", "الليل"] },
      { en: ["She", "studies", "every", "day"], fr: ["Elle", "étudie", "tous", "les", "jours"], es: ["Ella", "estudia", "todos", "los", "días"], it: ["Lei", "studia", "ogni", "giorno"], de: ["Sie", "studiert", "jeden", "Tag"], ja: ["彼女", "は", "毎日", "勉強します"], pt: ["Ela", "estuda", "todos", "os", "dias"], ar: ["هي", "تدرس", "كل", "يوم"] },
    ],
    say: [
      { ar: "أستيقظ مبكراً.", en: "I wake up early.", fr: "Je me lève tôt.", es: "Me despierto temprano.", it: "Mi sveglio presto.", de: "Ich stehe früh auf.", ja: "早く起きます。", pt: "Acordo cedo." },
    ],
  },
  {
    title: "8 · At School", titleAr: "٨ · في المدرسة",
    words: [
      { ar: "معلّم", en: "Teacher", fr: "Professeur", es: "Profesor", it: "Insegnante", de: "Lehrer", ja: "先生", pt: "Professor" },
      { ar: "طالب", en: "Student", fr: "Élève", es: "Estudiante", it: "Studente", de: "Schüler", ja: "生徒", pt: "Aluno" },
      { ar: "كتاب", en: "Book", fr: "Livre", es: "Libro", it: "Libro", de: "Buch", ja: "本", pt: "Livro" },
      { ar: "قلم", en: "Pen", fr: "Stylo", es: "Bolígrafo", it: "Penna", de: "Stift", ja: "ペン", pt: "Caneta" },
      { ar: "صف", en: "Class", fr: "Classe", es: "Clase", it: "Classe", de: "Klasse", ja: "クラス", pt: "Turma" },
      { ar: "مكتب", en: "Desk", fr: "Bureau", es: "Escritorio", it: "Banco", de: "Schreibtisch", ja: "机", pt: "Mesa" },
      { ar: "حقيبة", en: "Bag", fr: "Sac", es: "Mochila", it: "Borsa", de: "Tasche", ja: "カバン", pt: "Mochila" },
      { ar: "مسطرة", en: "Ruler", fr: "Règle", es: "Regla", it: "Righello", de: "Lineal", ja: "定規", pt: "Régua" },
      { ar: "امتحان", en: "Exam", fr: "Examen", es: "Examen", it: "Esame", de: "Prüfung", ja: "試験", pt: "Exame" },
      { ar: "درس", en: "Lesson", fr: "Leçon", es: "Lección", it: "Lezione", de: "Lektion", ja: "授業", pt: "Lição" },
    ],
    fill: [
      { en: { s: "The teacher writes with a ___.", a: "pen", o: ["pen", "book", "tree", "sun"] }, fr: { s: "Le professeur écrit avec un ___.", a: "stylo", o: ["stylo", "livre", "arbre", "soleil"] }, es: { s: "El profesor escribe con un ___.", a: "bolígrafo", o: ["bolígrafo", "libro", "árbol", "sol"] }, it: { s: "L'insegnante scrive con una ___.", a: "penna", o: ["penna", "libro", "albero", "sole"] }, de: { s: "Der Lehrer schreibt mit einem ___.", a: "Stift", o: ["Stift", "Buch", "Baum", "Sonne"] }, ja: { s: "先生は___で書きます。", a: "ペン", o: ["ペン", "本", "木", "太陽"] }, pt: { s: "O professor escreve com uma ___.", a: "caneta", o: ["caneta", "livro", "árvore", "sol"] }, ar: { s: "يكتب المعلّم بـ___.", a: "قلم", o: ["قلم", "كتاب", "شجرة", "شمس"] } },
    ],
    arrange: [
      { en: ["The", "teacher", "reads", "the", "book"], fr: ["Le", "professeur", "lit", "le", "livre"], es: ["El", "profesor", "lee", "el", "libro"], it: ["L'insegnante", "legge", "il", "libro"], de: ["Der", "Lehrer", "liest", "das", "Buch"], ja: ["先生", "は", "本", "を", "読みます"], pt: ["O", "professor", "lê", "o", "livro"], ar: ["المعلّم", "يقرأ", "الكتاب"] },
      { en: ["I", "do", "my", "homework"], fr: ["Je", "fais", "mes", "devoirs"], es: ["Hago", "mi", "tarea"], it: ["Faccio", "i", "compiti"], de: ["Ich", "mache", "meine", "Hausaufgaben"], ja: ["宿題", "を", "します"], pt: ["Faço", "o", "meu", "trabalho"], ar: ["أحل", "واجبي"] },
    ],
    say: [
      { ar: "افتح كتابك من فضلك.", en: "Open your book, please.", fr: "Ouvre ton livre, s'il te plaît.", es: "Abre tu libro, por favor.", it: "Apri il tuo libro, per favore.", de: "Öffne dein Buch, bitte.", ja: "本を開いてください。", pt: "Abre o teu livro, por favor." },
    ],
  },
  {
    title: "9 · Telling Time", titleAr: "٩ · الوقت",
    words: [
      { ar: "وقت", en: "Time", fr: "Temps", es: "Tiempo", it: "Tempo", de: "Zeit", ja: "時間", pt: "Tempo" },
      { ar: "ساعة (زمن)", en: "Hour", fr: "Heure", es: "Hora", it: "Ora", de: "Stunde", ja: "時間", pt: "Hora" },
      { ar: "دقيقة", en: "Minute", fr: "Minute", es: "Minuto", it: "Minuto", de: "Minute", ja: "分", pt: "Minuto" },
      { ar: "يوم", en: "Day", fr: "Jour", es: "Día", it: "Giorno", de: "Tag", ja: "日", pt: "Dia" },
      { ar: "أسبوع", en: "Week", fr: "Semaine", es: "Semana", it: "Settimana", de: "Woche", ja: "週", pt: "Semana" },
      { ar: "شهر", en: "Month", fr: "Mois", es: "Mes", it: "Mese", de: "Monat", ja: "月", pt: "Mês" },
      { ar: "سنة", en: "Year", fr: "Année", es: "Año", it: "Anno", de: "Jahr", ja: "年", pt: "Ano" },
      { ar: "اليوم", en: "Today", fr: "Aujourd'hui", es: "Hoy", it: "Oggi", de: "Heute", ja: "今日", pt: "Hoje" },
      { ar: "غداً", en: "Tomorrow", fr: "Demain", es: "Mañana", it: "Domani", de: "Morgen", ja: "明日", pt: "Amanhã" },
      { ar: "الآن", en: "Now", fr: "Maintenant", es: "Ahora", it: "Ora", de: "Jetzt", ja: "今", pt: "Agora" },
    ],
    fill: [
      { en: { s: "There are sixty ___ in one hour.", a: "minutes", o: ["minutes", "hours", "seconds", "days"] }, fr: { s: "Il y a soixante ___ dans une heure.", a: "minutes", o: ["minutes", "heures", "secondes", "jours"] }, es: { s: "Hay sesenta ___ en una hora.", a: "minutos", o: ["minutos", "horas", "segundos", "días"] }, it: { s: "Ci sono sessanta ___ in un'ora.", a: "minuti", o: ["minuti", "ore", "secondi", "giorni"] }, de: { s: "Es gibt sechzig ___ in einer Stunde.", a: "Minuten", o: ["Minuten", "Stunden", "Sekunden", "Tage"] }, ja: { s: "一時間は六十___です。", a: "分", o: ["分", "時間", "秒", "日"] }, pt: { s: "Há sessenta ___ numa hora.", a: "minutos", o: ["minutos", "horas", "segundos", "dias"] }, ar: { s: "في الساعة ستون ___.", a: "دقيقة", o: ["دقيقة", "ساعة", "ثانية", "يوم"] } },
    ],
    arrange: [
      { en: ["Today", "is", "a", "good", "day"], fr: ["Aujourd'hui", "est", "un", "bon", "jour"], es: ["Hoy", "es", "un", "buen", "día"], it: ["Oggi", "è", "un", "bel", "giorno"], de: ["Heute", "ist", "ein", "guter", "Tag"], ja: ["今日", "は", "いい", "日"], pt: ["Hoje", "é", "um", "bom", "dia"], ar: ["اليوم", "يوم", "جيد"] },
      { en: ["I", "have", "time", "now"], fr: ["J'ai", "le", "temps", "maintenant"], es: ["Tengo", "tiempo", "ahora"], it: ["Ho", "tempo", "ora"], de: ["Ich", "habe", "jetzt", "Zeit"], ja: ["今", "時間", "が", "あります"], pt: ["Tenho", "tempo", "agora"], ar: ["لدي", "وقت", "الآن"] },
    ],
    say: [
      { ar: "كم الساعة الآن؟", en: "What time is it now?", fr: "Quelle heure est-il ?", es: "¿Qué hora es ahora?", it: "Che ora è adesso?", de: "Wie spät ist es jetzt?", ja: "今何時ですか。", pt: "Que horas são agora?" },
    ],
  },
  {
    title: "10 · Travel", titleAr: "١٠ · السفر",
    words: [
      { ar: "سيارة", en: "Car", fr: "Voiture", es: "Coche", it: "Auto", de: "Auto", ja: "車", pt: "Carro" },
      { ar: "قطار", en: "Train", fr: "Train", es: "Tren", it: "Treno", de: "Zug", ja: "電車", pt: "Comboio" },
      { ar: "طائرة", en: "Plane", fr: "Avion", es: "Avión", it: "Aereo", de: "Flugzeug", ja: "飛行機", pt: "Avião" },
      { ar: "حافلة", en: "Bus", fr: "Bus", es: "Autobús", it: "Autobus", de: "Bus", ja: "バス", pt: "Autocarro" },
      { ar: "طريق", en: "Road", fr: "Route", es: "Carretera", it: "Strada", de: "Straße", ja: "道", pt: "Estrada" },
      { ar: "خريطة", en: "Map", fr: "Carte", es: "Mapa", it: "Mappa", de: "Karte", ja: "地図", pt: "Mapa" },
      { ar: "تذكرة", en: "Ticket", fr: "Billet", es: "Billete", it: "Biglietto", de: "Ticket", ja: "切符", pt: "Bilhete" },
      { ar: "فندق", en: "Hotel", fr: "Hôtel", es: "Hotel", it: "Hotel", de: "Hotel", ja: "ホテル", pt: "Hotel" },
      { ar: "مطار", en: "Airport", fr: "Aéroport", es: "Aeropuerto", it: "Aeroporto", de: "Flughafen", ja: "空港", pt: "Aeroporto" },
      { ar: "شاطئ", en: "Beach", fr: "Plage", es: "Playa", it: "Spiaggia", de: "Strand", ja: "海辺", pt: "Praia" },
    ],
    fill: [
      { en: { s: "We travel by ___ to other cities.", a: "train", o: ["train", "bread", "pen", "rain"] }, fr: { s: "Nous voyageons par ___ pour d'autres villes.", a: "train", o: ["train", "pain", "stylo", "pluie"] }, es: { s: "Viajamos en ___ a otras ciudades.", a: "tren", o: ["tren", "pan", "bolígrafo", "lluvia"] }, it: { s: "Viaggiamo in ___ per altre città.", a: "treno", o: ["treno", "pane", "penna", "pioggia"] }, de: { s: "Wir reisen mit dem ___ in andere Städte.", a: "Zug", o: ["Zug", "Brot", "Stift", "Regen"] }, ja: { s: "他の都市へ___で旅行します。", a: "電車", o: ["電車", "パン", "ペン", "雨"] }, pt: { s: "Viajamos de ___ para outras cidades.", a: "comboio", o: ["comboio", "pão", "caneta", "chuva"] }, ar: { s: "نسافر بـ___ إلى مدن أخرى.", a: "قطار", o: ["قطار", "خبز", "قلم", "مطر"] } },
    ],
    arrange: [
      { en: ["The", "plane", "flies", "in", "the", "sky"], fr: ["L'avion", "vole", "dans", "le", "ciel"], es: ["El", "avión", "vuela", "en", "el", "cielo"], it: ["L'aereo", "vola", "nel", "cielo"], de: ["Das", "Flugzeug", "fliegt", "am", "Himmel"], ja: ["飛行機", "は", "空", "を", "飛びます"], pt: ["O", "avião", "voa", "no", "céu"], ar: ["الطائرة", "تحلق", "في", "السماء"] },
      { en: ["I", "need", "a", "ticket"], fr: ["J'ai", "besoin", "d'un", "billet"], es: ["Necesito", "un", "billete"], it: ["Ho", "bisogno", "di", "un", "biglietto"], de: ["Ich", "brauche", "ein", "Ticket"], ja: ["切符", "が", "必要です"], pt: ["Preciso", "de", "um", "bilhete"], ar: ["أحتاج", "تذكرة"] },
    ],
    say: [
      { ar: "نسافر بالطائرة.", en: "We travel by plane.", fr: "Nous voyageons en avion.", es: "Viajamos en avión.", it: "Viaggiamo in aereo.", de: "Wir reisen mit dem Flugzeug.", ja: "飛行機で旅行します。", pt: "Viajamos de avião." },
    ],
  },
  {
    title: "11 · Weather & Feelings", titleAr: "١١ · الطقس والمشاعر",
    words: [
      { ar: "مطر", en: "Rain", fr: "Pluie", es: "Lluvia", it: "Pioggia", de: "Regen", ja: "雨", pt: "Chuva" },
      { ar: "ثلج", en: "Snow", fr: "Neige", es: "Nieve", it: "Neve", de: "Schnee", ja: "雪", pt: "Neve" },
      { ar: "حار", en: "Hot", fr: "Chaud", es: "Caliente", it: "Caldo", de: "Heiß", ja: "暑い", pt: "Quente" },
      { ar: "بارد", en: "Cold", fr: "Froid", es: "Frío", it: "Freddo", de: "Kalt", ja: "寒い", pt: "Frio" },
      { ar: "رياح", en: "Wind", fr: "Vent", es: "Viento", it: "Vento", de: "Wind", ja: "風", pt: "Vento" },
      { ar: "غيمة", en: "Cloud", fr: "Nuage", es: "Nube", it: "Nuvola", de: "Wolke", ja: "雲", pt: "Nuvem" },
      { ar: "سعيد", en: "Happy", fr: "Heureux", es: "Feliz", it: "Felice", de: "Glücklich", ja: "幸せ", pt: "Feliz" },
      { ar: "حزين", en: "Sad", fr: "Triste", es: "Triste", it: "Triste", de: "Traurig", ja: "悲しい", pt: "Triste" },
      { ar: "متعب", en: "Tired", fr: "Fatigué", es: "Cansado", it: "Stanco", de: "Müde", ja: "疲れた", pt: "Cansado" },
      { ar: "جائع", en: "Hungry", fr: "Affamé", es: "Hambriento", it: "Affamato", de: "Hungrig", ja: "お腹すいた", pt: "Faminto" },
    ],
    fill: [
      { en: { s: "When it is cold I feel ___.", a: "cold", o: ["cold", "hot", "happy", "big"] }, fr: { s: "Quand il fait froid je ressens ___.", a: "froid", o: ["froid", "chaud", "heureux", "grand"] }, es: { s: "Cuando hace frío siento ___.", a: "frío", o: ["frío", "calor", "feliz", "grande"] }, it: { s: "Quando fa freddo sento ___.", a: "freddo", o: ["freddo", "caldo", "felice", "grande"] }, de: { s: "Wenn es kalt ist, fühle ich ___.", a: "kalt", o: ["kalt", "heiß", "glücklich", "groß"] }, ja: { s: "寒い時、___を感じます。", a: "寒さ", o: ["寒さ", "暑さ", "幸せ", "大きい"] }, pt: { s: "Quando faz frio sinto ___.", a: "frio", o: ["frio", "calor", "feliz", "grande"] }, ar: { s: "عندما يكون الجو بارداً أشعر بـ___.", a: "البرد", o: ["البرد", "الحر", "السعادة", "الكبر"] } },
    ],
    arrange: [
      { en: ["It", "is", "cold", "today"], fr: ["Il", "fait", "froid", "aujourd'hui"], es: ["Hace", "frío", "hoy"], it: ["Fa", "freddo", "oggi"], de: ["Es", "ist", "kalt", "heute"], ja: ["今日", "は", "寒い"], pt: ["Está", "frio", "hoje"], ar: ["الجو", "بارد", "اليوم"] },
      { en: ["I", "am", "happy", "today"], fr: ["Je", "suis", "heureux", "aujourd'hui"], es: ["Estoy", "feliz", "hoy"], it: ["Sono", "felice", "oggi"], de: ["Ich", "bin", "heute", "glücklich"], ja: ["今日", "は", "幸せ"], pt: ["Estou", "feliz", "hoje"], ar: ["أنا", "سعيد", "اليوم"] },
    ],
    say: [
      { ar: "أنا سعيد اليوم!", en: "I am happy today!", fr: "Je suis heureux aujourd'hui !", es: "¡Estoy feliz hoy!", it: "Sono felice oggi!", de: "Ich bin heute glücklich!", ja: "今日は幸せです！", pt: "Estou feliz hoje!" },
    ],
  },
  {
    title: "12 · Conversations", titleAr: "١٢ · المحادثات",
    words: [
      { ar: "مرحباً، كيف حالك؟", en: "Hello, how are you?", fr: "Bonjour, comment ça va ?", es: "Hola, ¿cómo estás?", it: "Ciao, come stai?", de: "Hallo, wie geht's?", ja: "こんにちは、お元気ですか", pt: "Olá, como vai?" },
      { ar: "شكراً جزيلاً", en: "Thank you very much", fr: "Merci beaucoup", es: "Muchas gracias", it: "Grazie mille", de: "Vielen Dank", ja: "どうもありがとう", pt: "Muito obrigado" },
      { ar: "سعيد بلقائك", en: "Nice to meet you", fr: "Enchanté", es: "Encantado", it: "Piacere", de: "Schön", ja: "はじめまして", pt: "Prazer" },
      { ar: "أراك غداً", en: "See you tomorrow", fr: "À demain", es: "Hasta mañana", it: "A domani", de: "Bis morgen", ja: "また明日", pt: "Até amanhã" },
      { ar: "ما اسمك؟", en: "What is your name?", fr: "Comment tu t'appelles ?", es: "¿Cómo te llamas?", it: "Come ti chiami?", de: "Wie heißt du?", ja: "名前は何ですか", pt: "Como te chamas?" },
      { ar: "اسمي...", en: "My name is...", fr: "Je m'appelle...", es: "Me llamo...", it: "Mi chiamo...", de: "Ich heiße...", ja: "私の名前は...", pt: "Meu nome é..." },
      { ar: "أنا بخير", en: "I am fine", fr: "Je vais bien", es: "Estoy bien", it: "Sto bene", de: "Mir geht's gut", ja: "大丈夫です", pt: "Estou bem" },
      { ar: "وداعاً", en: "Goodbye", fr: "Au revoir", es: "Adiós", it: "Arrivederci", de: "Auf Wiedersehen", ja: "さようなら", pt: "Adeus" },
      { ar: "ساعدني من فضلك", en: "Please help me", fr: "Aide-moi, s'il te plaît", es: "Ayúdame, por favor", it: "Aiutami, per favore", de: "Hilf mir, bitte", ja: "助けてください", pt: "Ajuda-me, por favor" },
      { ar: "أنا أتعلّم...", en: "I am learning...", fr: "J'apprends...", es: "Estoy aprendiendo...", it: "Sto imparando...", de: "Ich lerne...", ja: "勉強しています...", pt: "Estou a aprender..." },
    ],
    fill: [
      { en: { s: "I ___ my friend at school.", a: "see", o: ["see", "eat", "drink", "run"] }, fr: { s: "Je ___ mon ami à l'école.", a: "vois", o: ["vois", "mange", "bois", "cours"] }, es: { s: "___ a mi amigo en la escuela.", a: "Veo", o: ["Veo", "Como", "Bebo", "Corro"] }, it: { s: "___ il mio amico a scuola.", a: "Vedo", o: ["Vedo", "Mangio", "Bevo", "Corro"] }, de: { s: "Ich ___ meinen Freund in der Schule.", a: "sehe", o: ["sehe", "esse", "trinke", "laufe"] }, ja: { s: "学校で友だちに___。", a: "会う", o: ["会う", "食べる", "飲む", "走る"] }, pt: { s: "___ o meu amigo na escola.", a: "Vejo", o: ["Vejo", "Como", "Bebo", "Corro"] }, ar: { s: "أرى صديقي في ___.", a: "المدرسة", o: ["المدرسة", "البيت", "السوق", "الشارع"] } },
    ],
    arrange: [
      { en: ["What", "is", "your", "name"], fr: ["Comment", "tu", "t'appelles"], es: ["Cómo", "te", "llamas"], it: ["Come", "ti", "chiami"], de: ["Wie", "heißt", "du"], ja: ["名前", "は", "何"], pt: ["Como", "te", "chamas"], ar: ["ما", "اسمك"] },
      { en: ["I", "am", "learning", "English", "now"], fr: ["J'apprends", "l'anglais", "maintenant"], es: ["Estoy", "aprendiendo", "inglés", "ahora"], it: ["Sto", "imparando", "l'inglese", "ora"], de: ["Ich", "lerne", "jetzt", "Englisch"], ja: ["今", "英語", "を", "勉強しています"], pt: ["Estou", "a", "aprender", "inglês", "agora"], ar: ["أنا", "أتعلّم", "الإنجليزية", "الآن"] },
    ],
    say: [
      { ar: "وداعاً، أراك غداً!", en: "Goodbye, see you tomorrow!", fr: "Au revoir, à demain !", es: "¡Adiós, hasta mañana!", it: "Arrivederci, a domani!", de: "Auf Wiedersehen, bis morgen!", ja: "さようなら、また明日！", pt: "Adeus, até amanhã!" },
    ],
  },
];

// صور داعمة لكل مستوى حسب الموضوع (١٢ صورة)
export const THEMES_IMAGES = [
  "https://media.base44.com/images/public/6a7e76e3396b41955b675542/aacea1278_generated_image.png",
  "https://media.base44.com/images/public/6a7e76e3396b41955b675542/bf49677a2_generated_image.png",
  "https://media.base44.com/images/public/6a7e76e3396b41955b675542/72c5f40fa_generated_image.png",
  "https://media.base44.com/images/public/6a7e76e3396b41955b675542/dcbb5fac7_generated_image.png",
  "https://media.base44.com/images/public/6a7e76e3396b41955b675542/3def38858_generated_image.png",
  "https://media.base44.com/images/public/6a7e76e3396b41955b675542/393df6a85_generated_image.png",
  "https://media.base44.com/images/public/6a7e76e3396b41955b675542/03c940502_generated_image.png",
  "https://media.base44.com/images/public/6a7e76e3396b41955b675542/fe6b41608_generated_image.png",
  "https://media.base44.com/images/public/6a7e76e3396b41955b675542/fec5a3ca9_generated_image.png",
  "https://media.base44.com/images/public/6a7e76e3396b41955b675542/6422fa196_generated_image.png",
  "https://media.base44.com/images/public/6a7e76e3396b41955b675542/ea6cd04c3_generated_image.png",
  "https://media.base44.com/images/public/6a7e76e3396b41955b675542/10c19b5ba_generated_image.png",
];

// بناء بنك أسئلة المستوى (٣٥ سؤالاً كحد أقصى) — target: لغة الهدف، base: لغة المعاني
function buildBank(th, target, base) {
  const bank = [];
  const w = (i, type) => {
    const word = th.words[i];
    if (type === "vocab") bank.push({ type, word: word[target], ar: word[base] });
    else if (type === "listen") bank.push({ type, speak: word[target], ar: word[base] });
    else if (type === "type") bank.push({ type, ar: word[base], word: word[target] });
  };
  for (const s of SEQ) {
    if (Array.isArray(s)) w(s[0], s[1]);
    else if (s === "fill") bank.push({ type: "fill", sentence: th.fill[0][target].s, answer: th.fill[0][target].a, options: th.fill[0][target].o });
    else if (s === "arrange0") bank.push({ type: "arrange", words: th.arrange[0][target] });
    else if (s === "arrange1") bank.push({ type: "arrange", words: th.arrange[1][target] });
    else if (s === "say") bank.push({ type: "say", speak: th.say[0][target], ar: th.say[0][base] });
    else if (s === "listenSay") bank.push({ type: "listen", speak: th.say[0][target], ar: th.say[0][base], pool: "say" });
  }
  return bank;
}

// بناء مستويات اللغة الهدف مع لغة الأساس (base) لتقديم المعاني
export function levelsForLang(target, base) {
  return THEMES.map((th, idx) => ({
    title: th.title,
    titleAr: th.titleAr,
    image: THEMES_IMAGES[idx],
    exercises: buildBank(th, target, base).slice(0, COUNTS[idx]),
  }));
}

// مجمّعات المعاني لتوليد المشتّتات حسب لغة الأساس
export function meaningPool(base) {
  return Array.from(new Set(THEMES.flatMap((th) => th.words.map((w) => w[base]))));
}
export function sayPool(base) {
  return THEMES.map((th) => th.say[0][base]);
}

// عبارات تشجيعية تنطقها الشخصية (TTS) عند الإجابة
export const PRAISE = ["Great job!", "Well done!", "Perfect!", "You are amazing!", "Keep going!"];
export const WRONG = ["Try again!", "Not quite!"];