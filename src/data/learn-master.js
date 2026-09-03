// المستويان ٢٥ و٢٦ — المراجعة الشاملة (40 سؤالاً) ومستوى الملك (50 سؤالاً أكاديمياً في القواعد)
// 25 → مراجعة كل المستويات السابقة بأصعب أنواع الأسئلة (أخطاء المستخدم + ترتيب + cloze + ترجمة)
// 26 → بنك قواعد منسّق لكل لغة: اختيار الجملة الصحيحة (pick) + إكمال الفراغ النحوي (gap)
//      + مرادفات الجُمل لا الكلمات (syn) + إكمال من تمارين cloze حتى ٥٠ سؤالاً
// الاستيراد دائري مع learn-languages و learn-advanced لكنه آمن: لا نصل إلا داخل الدوال (وقت التشغيل)

import { THEMES, meaningPool } from "./learn-languages";
import { CLOZE_LEVELS } from "./learn-cloze";
import { getAdvMistakes } from "./learn-advanced";

// صور المستويين (بطاقات الخريطة)
export const REVIEW_IMG = "https://media.base44.com/images/public/6a7e76e3396b41955b675542/03a3e22fc_generated_image.png";
export const KING_IMG = "https://media.base44.com/images/public/6a7e76e3396b41955b675542/1d1decd3c_generated_image.png";

// صور داعمة خفيفة لبعض أسئلة مستوى الملك
const IMG_RAIN = "https://media.base44.com/images/public/6a7e76e3396b41955b675542/4a8d6bef7_generated_image.png";
const IMG_SCHOOL = "https://media.base44.com/images/public/6a7e76e3396b41955b675542/93881acb9_generated_image.png";
const IMG_MARKET = "https://media.base44.com/images/public/6a7e76e3396b41955b675542/ddc58ad99_generated_image.png";

const shuffle = (arr) => arr.map((v) => [Math.random(), v]).sort((a, b) => a[0] - b[0]).map((v) => v[1]);
const sample = (arr, n) => shuffle(arr).slice(0, n);

// بنك مستوى الملك — 30 سؤالاً منسّقاً لكل لغة (10 pick + 10 gap + 10 syn)
// pick: اختر الجملة الصحيحة نحوياً · gap: أكمل الفراغ بالصيغة الصحيحة · syn: اختر الجملة الأقرب في المعنى
export const KING_BANKS = {
  en: {
    pick: [
      { o: ["She goes to school every day.", "She go to school every day.", "She going to school every day.", "She gone to school every day."], a: 0 },
      { o: ["I have lived here for 2010.", "I have lived here since 2010.", "I live here since 2010.", "I am living here since 2010."], a: 1 },
      { o: ["He don't like coffee.", "He doesn't likes coffee.", "He not like coffee.", "He doesn't like coffee."], a: 3 },
      { o: ["There are many books on the table.", "There is many books on the table.", "There be many books on the table.", "There was much books on the table."], a: 0 },
      { o: ["I am more taller than my brother.", "I am tallest than my brother.", "I am taller than my brother.", "I am the taller than my brother."], a: 2 },
      { o: ["She said me the truth.", "She told me the truth.", "She tell me the truth.", "She told to me the truth."], a: 1 },
      { o: ["If I will see him, I will tell him.", "If I see him, I will tell him.", "If I would see him, I will tell him.", "If I see him, I would told him."], a: 1 },
      { o: ["I look forward to meet you.", "I look forward for meeting you.", "I look forward to meeting you.", "I looking forward to meet you."], a: 2 },
      { o: ["The informations are useful.", "The information is useful.", "The information are useful.", "An information is useful."], a: 1 },
      { o: ["He has been working here for five years.", "He is working here since five years.", "He works here since five years.", "He have been working here for five years."], a: 0 },
    ],
    gap: [
      { s: "Yesterday she ___ to the market.", o: ["go", "went", "goes", "gone"], a: 1, img: IMG_MARKET },
      { s: "They ___ playing football in the park now.", o: ["is", "am", "are", "be"], a: 2 },
      { s: "I have ___ my homework already.", o: ["finish", "finished", "finishing", "finishes"], a: 1 },
      { s: "She is good ___ mathematics.", o: ["in", "on", "at", "for"], a: 2 },
      { s: "We ___ visit our grandparents next week.", o: ["will", "wills", "are will", "will to"], a: 0 },
      { s: "This book is ___ than that one.", o: ["interesting", "more interesting", "most interesting", "interestinger"], a: 1 },
      { s: "He ___ like coffee.", o: ["doesn't", "don't", "not", "isn't"], a: 0 },
      { s: "Look! The baby ___.", o: ["sleep", "sleeps", "is sleeping", "sleeping"], a: 2 },
      { s: "I would rather ___ at home tonight.", o: ["to stay", "stay", "staying", "stayed"], a: 1 },
      { s: "She has been teaching ___ ten years.", o: ["since", "for", "from", "during"], a: 1 },
    ],
    syn: [
      { s: "It's raining cats and dogs.", o: ["It is raining heavily.", "Cats and dogs are outside.", "The weather is cold and windy.", "There are many animals in the street."], a: 0, img: IMG_RAIN },
      { s: "He passed the exam with flying colours.", o: ["He failed the exam.", "He passed with a very high score.", "He passed with difficulty.", "He cheated in the exam."], a: 1 },
      { s: "I'm broke.", o: ["I am tired.", "I have no money at all.", "I am broken-hearted.", "I am lost."], a: 1 },
      { s: "She hit the books all night.", o: ["She read stories before sleeping.", "She studied hard all night.", "She threw the books away.", "She bought new books."], a: 1 },
      { s: "It's a piece of cake.", o: ["It is very delicious.", "It is a small gift.", "It is very easy.", "It is a part of a cake."], a: 2 },
      { s: "He let the cat out of the bag.", o: ["He bought a cat.", "He revealed the secret by mistake.", "He made a small error.", "He freed an animal."], a: 1 },
      { s: "We see eye to eye on this.", o: ["We agree on this matter.", "We look at each other.", "We are the same height.", "We argue about this."], a: 0 },
      { s: "She is under the weather today.", o: ["She is wet from the rain.", "She feels slightly ill today.", "She is outside the house.", "She is very happy."], a: 1 },
      { s: "Better late than never.", o: ["Never arrive late.", "Arriving late is better than not arriving at all.", "Being late is always fine.", "It is never too early to start."], a: 1 },
      { s: "He burned the midnight oil.", o: ["He worked late into the night.", "He made a fire at night.", "He wasted the night away.", "He slept early."], a: 0 },
    ],
  },
  ar: {
    pick: [
      { o: ["هذا كتابٌ مفيدٌ", "هذه كتابٌ مفيدٌ", "هذا كتابةٌ مفيدةٌ", "هذه كتابٌ مفيدٌ"], a: 0 },
      { o: ["كان الجوَّ جميلٌ", "كان الجوُّ جميلاً", "كان الجوِّ جميلاً", "كان الجوُّ جميلٌ"], a: 1 },
      { o: ["إنّ العلمُ نورٌ", "إنّ العلمِ نورٌ", "إنّ العلمَ نورٌ", "إنّ العلمَ نوراً"], a: 2 },
      { o: ["لا تنسَ ذكرَ الله", "لا تنسْت ذكرَ الله", "لا تنسُ ذكرَ الله", "لا تنسَ ذكرُ الله"], a: 0 },
      { o: ["الطلاب مجتهدين في امتحاناتهم", "الطلاب مجتهدون", "الطلاب مجتهدات", "الطلاب مجتهدٌ"], a: 1 },
      { o: ["قرأتُ الكتابُ كاملًا", "قرأتُ الكتابَ كاملًا", "قرأتُ الكتابِ كاملًا", "قرأتَ الكتابَ كاملًا"], a: 1 },
      { o: ["مررتُ زميلي أمس", "مررتُ بزميلي أمس", "مررتُ إلى زميلي أمس", "مررتُ لزميلي أمس"], a: 1 },
      { o: ["أعجبتني المنظرُ", "أعجبني المنظرَ", "أعجبَ لي المنظرُ", "أعجبني المنظرُ"], a: 3 },
      { o: ["أحمد أفضلُ من أخيه", "أحمد أفضلَ من أخيه", "أحمد أفضلُ من أخوه", "أحمد أفضلُ أخيه"], a: 0 },
      { o: ["يا طالبُ العلمِ اجتهدْ", "يا طالبِ العلمِ اجتهدْ", "يا طالبَ العلمِ اجتهدْ", "يا طالب العلمُ اجتهدْ"], a: 2 },
    ],
    gap: [
      { s: "ذهبَ الأولادُ ___ المدرسةِ.", o: ["إلى", "في", "على", "مع"], a: 0, img: IMG_SCHOOL },
      { s: "الجوُّ ___ اليوم.", o: ["جميلٌ", "جميلًا", "جميلٍ", "جميلِ"], a: 0 },
      { s: "أنا ___ في المدرسةِ.", o: ["طالبًا", "طالبٍ", "طالبٌ", "طالبةٌ"], a: 2 },
      { s: "قرأتُ ___ نافعًا.", o: ["كتابٌ", "كتابًا", "كتابٍ", "كتابُ"], a: 1 },
      { s: "___ التلميذُ واجبَه.", o: ["أنجزُ", "أنجزَ", "أنجزْ", "أنجزِ"], a: 1 },
      { s: "البيتُ ___ واسعةٌ.", o: ["غرفَهُ", "غرفُهُ", "غرفِهِ", "غرفةً"], a: 1 },
      { s: "لا ___ الواجبَ يا محمدُ.", o: ["تهملُ", "تهملْ", "تهملَ", "أهملتَ"], a: 1 },
      { s: "المعلمون ___ في الفصلِ.", o: ["حاضرين", "حاضرون", "حاضرات", "حاضرونَ"], a: 1 },
      { s: "أعطيتُ الفقيرَ ___.", o: ["نقودٌ", "نقودٍ", "نقودًا", "نقودُ"], a: 2 },
      { s: "الحمدُ ___ اللهِ ربِّ العالمين.", o: ["على", "لِ", "إلى", "في"], a: 1 },
    ],
    syn: [
      { s: "الوقتُ كالسيفِ إن لم تقطعْه قطعَك.", o: ["السيف خطرٌ على الناس", "استغلْ وقتك قبل أن يضيعَ", "الوقتُ طويلٌ كالسيف", "لا تحملْ سيفاً أبداً"], a: 1 },
      { s: "رجعَ بخُفَّي حُنين.", o: ["عادَ خاليَ الوفاضِ", "عادَ بحذاءٍ جديدٍ", "عادَ مسروراً فرحاً", "عادَ متأخراً جداً"], a: 0 },
      { s: "العلمُ نورٌ.", o: ["النورُ يُرى بالعينِ", "العلمُ سهلٌ يسيرٌ", "العلمُ يهدي صاحبَه", "النورُ سريعٌ"], a: 2 },
      { s: "ضربَ عصفورينِ بحجرٍ واحدٍ.", o: ["رمى حجراً على طائر", "الحجرُ يؤذي العصافير", "حقّقَ هدفينِ بعملٍ واحدٍ", "أصابَ عصفوراً واحداً"], a: 2 },
      { s: "القناعةُ كنزٌ لا يفنى.", o: ["الرضا بالقليلِ غنىً", "الكنوزُ كثيرةٌ", "القناعةُ صعبةٌ", "المالُ لا ينفعُ"], a: 0 },
      { s: "يدٌ واحدةٌ لا تصفّقُ.", o: ["التصفيقُ بالكفّينِ", "التعاونُ ضروريٌّ للنجاحِ", "اليدُ تعملُ وحدها", "الصوتُ لا يُسمعُ"], a: 1 },
      { s: "من طلبَ العلا سهرَ الليالي.", o: ["النجومُ تُرى ليلاً", "النومُ المتأخرُ مفيدٌ", "العلا ممنوعةٌ", "التفوقُ يحتاجُ اجتهاداً وتعباً"], a: 3, img: IMG_SCHOOL },
      { s: "كلامُه كالسمِّ في العسلِ.", o: ["كلامُه جميلٌ ومفيدٌ", "كلامُه خطرٌ يتخفى خلفَ اللطفِ", "العسلُ شفاءٌ", "كلامُه صادقٌ دائماً"], a: 1 },
      { s: "الحديثُ ذو شجونٍ.", o: ["للحكايةِ تفاصيلُ كثيرةٌ تؤثرُ", "الحديثُ عن الأشجارِ", "الشجنُ نبتةٌ طيبة", "الحديثُ قصيرٌ ممتعٌ"], a: 0 },
      { s: "قال: صبرٌ جميلٌ.", o: ["تجلّدَ وتحمّلَ بصبرٍ", "غضبَ كثيراً", "صرخَ من الألمِ", "شكا للناسِ"], a: 0 },
    ],
  },
  fr: {
    pick: [
      { o: ["Elle vas à l'école.", "Elle va à l'école.", "Elle va à le école.", "Elle vais à l'école."], a: 1 },
      { o: ["Je suis vingt ans.", "J'ai vingt ans.", "J'ai vingt années vieilles.", "Je ai vingt ans."], a: 1 },
      { o: ["Il y a beaucoup de monde.", "Il y a beaucoup de mondes.", "Il y a beaucoup du monde.", "Il a beaucoup de monde."], a: 0 },
      { o: ["Nous avons allés au cinéma.", "Nous sommes aller au cinéma.", "Nous sommes allés au cinéma.", "Nous avons aller au cinéma."], a: 2 },
      { o: ["C'est le livre à Marie.", "C'est le livre de Marie.", "C'est le livre de la Marie.", "Ce sont le livre de Marie."], a: 1 },
      { o: ["Elle s'est levé tôt.", "Elle est levée tôt.", "Elle s'est levée tôt.", "Elle s'est levez tôt."], a: 2 },
      { o: ["Il faut que tu parts maintenant.", "Il faut que tu partiras maintenant.", "Il faut que tu partes maintenant.", "Il faut que tu partez maintenant."], a: 2 },
      { o: ["Ces enfant sont sages.", "Cet enfants sont sages.", "Cette enfants sont sages.", "Ces enfants sont sages."], a: 3 },
      { o: ["Je n'ai pas vu cette film.", "Je n'ai pas vu ce films.", "Je n'ai pas vu ce film.", "Je ne ai pas vu ce film."], a: 2 },
      { o: ["Je me suis souvenu de cette journée.", "Je me suis souvenu de cette journé.", "Je me suis souvenir de cette journée.", "Je me suis souvenu à cette journée."], a: 0 },
    ],
    gap: [
      { s: "Hier, nous ___ au restaurant.", o: ["allons", "sommes allés", "allé", "irons"], a: 1 },
      { s: "Elle ___ française.", o: ["est", "a", "sont", "as"], a: 0 },
      { s: "Ils ___ deux chats.", o: ["a", "est", "ont", "sont"], a: 2 },
      { s: "Je ___ téléphonerai demain.", o: ["lui", "le", "la", "eux"], a: 0 },
      { s: "Nous allons ___ au cinéma ce soir.", o: ["sortir", "sortons", "sortis", "sortant"], a: 0 },
      { s: "Le livre que je lis ___ intéressant.", o: ["sont", "est", "es", "étaient"], a: 1 },
      { s: "Si j'avais du temps, je ___ plus.", o: ["voyagerai", "voyage", "voyagerais", "voyager"], a: 2 },
      { s: "Il est ___ grand que son frère.", o: ["mieux", "plus", "meilleur", "très"], a: 1 },
      { s: "Nous habitons à Paris ___ 2015.", o: ["pendant", "dans", "pour", "depuis"], a: 3 },
      { s: "Elle parle ___ au téléphone.", o: ["le français", "français", "de français", "à français"], a: 1 },
    ],
    syn: [
      { s: "Il pleut des cordes.", o: ["Il pleut légèrement.", "Des cordes sont tombées.", "Il pleut très fortement.", "Le temps est nuageux."], a: 2, img: IMG_RAIN },
      { s: "Ça marche du tonnerre.", o: ["Cela fonctionne très bien.", "Le tonnerre gronde fort.", "C'est très dangereux.", "C'est très lent."], a: 0 },
      { s: "Je suis fauché.", o: ["Je suis très fatigué.", "Je n'ai plus d'argent.", "Je suis blessé à la main.", "Je suis complètement seul."], a: 1 },
      { s: "Il a un cœur d'or.", o: ["Il a une maladie de cœur.", "Il est très généreux.", "Il collectionne l'or.", "Il est très riche."], a: 1 },
      { s: "Elle en a fait tout un fromage.", o: ["Elle a préparé un fromage.", "Elle aime beaucoup le fromage.", "Elle a tout terminé.", "Elle a exagéré l'importance de quelque chose."], a: 3 },
      { s: "C'est du gâteau.", o: ["C'est un délicieux dessert.", "C'est très facile.", "C'est très cher.", "C'est cassé."], a: 1 },
      { s: "Il a posé un lapin à Marie.", o: ["Il a offert un lapin à Marie.", "Il est arrivé une heure en retard.", "Il n'est pas venu au rendez-vous.", "Il a menti sur les animaux."], a: 2 },
      { s: "Mieux vaut tard que jamais.", o: ["Il ne faut jamais être en retard.", "Le retard est toujours inacceptable", "Tôt ou tard, tout arrive", "Arriver tard vaut mieux que ne rien faire"], a: 3 },
      { s: "Il n'y a pas un chat.", o: ["Il n'y a personne.", "Il n'y a aucun animal.", "Un chat est caché quelque part.", "C'est un endroit très peuplé."], a: 0 },
      { s: "Elle a le cafard.", o: ["Elle a vu un insecte.", "Elle est triste et déprimée.", "Elle a très peur.", "Elle est très en colère."], a: 1 },
    ],
  },
  es: {
    pick: [
      { o: ["Ella vas a la escuela.", "Ella va a la escuela.", "Ella va a el escuela.", "Ella voy a la escuela."], a: 1 },
      { o: ["Tengo veinte años.", "Soy veinte años.", "Hago veinte años.", "Estoy veinte años."], a: 0 },
      { o: ["Me gustan el café.", "Me gusta el café.", "Me gusta la café.", "Yo gusta el café."], a: 1 },
      { o: ["Ayer vamos al cine.", "Ayer fuemos al cine.", "Ayer fuimos al cine.", "Ayer íbamos al cine siempre."], a: 2 },
      { o: ["La sopa es caliente.", "La sopa está caliento.", "La sopa está caliente.", "La sopa es calienta."], a: 2 },
      { o: ["He vivido aquí desde 2010.", "He vivido aquí desde hace 2010.", "Vivo aquí por 2010.", "Hemos vivido aquí desde 2010 años."], a: 0 },
      { o: ["Espero que vienes mañana.", "Espero que vendrás mañana.", "Espero que vengas mañana.", "Espero que vengáis mañana, tú."], a: 2 },
      { o: ["No he lo visto.", "No lo he visto.", "No he visto le.", "No he lo ver."], a: 1 },
      { o: ["Hay muchos libro.", "Hay mucho libros.", "Hay están muchos libros.", "Hay muchos libros."], a: 3 },
      { o: ["Me encanta el música.", "Me encanta la música.", "Me encantan la música.", "Encanto la música."], a: 1 },
    ],
    gap: [
      { s: "Ayer yo ___ al mercado.", o: ["fui", "voy", "iré", "soy"], a: 0, img: IMG_MARKET },
      { s: "Ellos ___ estudiantes.", o: ["es", "son", "están", "está"], a: 1 },
      { s: "Nosotros ___ una casa.", o: ["tienen", "tengo", "tenemos", "tiene"], a: 2 },
      { s: "Ella ___ muy inteligente.", o: ["está", "sea", "es", "ser"], a: 2 },
      { s: "Vamos ___ viajar mañana.", o: ["en", "a", "por", "de"], a: 1 },
      { s: "Estudio ___ dos horas cada día.", o: ["desde", "por el", "durante", "para"], a: 2 },
      { s: "Si tuviera dinero, ___ un coche.", o: ["compro", "compré", "compraba", "compraría"], a: 3 },
      { s: "Este libro es ___ interesante que aquel.", o: ["más", "mejor", "muy", "mucho"], a: 0 },
      { s: "Necesito ___ con la tarea.", o: ["ayudar", "ayuda", "ayudando", "ayudo"], a: 1 },
      { s: "El café ___ muy caliente.", o: ["es", "sea", "está", "están"], a: 2 },
    ],
    syn: [
      { s: "Está lloviendo a cántaros.", o: ["Llueve un poco.", "Llueve muchísimo.", "Los cántaros están rotos.", "Hay viento fuerte."], a: 1, img: IMG_RAIN },
      { s: "No tengo un duro.", o: ["No tengo dinero.", "Perdí una moneda.", "Estoy enfermo.", "Encontré dinero."], a: 0 },
      { s: "Es pan comido.", o: ["Es una comida rica.", "Es muy difícil.", "Es muy fácil.", "Es una merienda."], a: 2 },
      { s: "Se me ha ido el santo al cielo.", o: ["He perdido una oportunidad.", "Estoy muy religioso.", "El santo desapareció.", "Estoy muy feliz."], a: 0 },
      { s: "Más vale tarde que nunca.", o: ["Nunca llegues tarde.", "Llegar tarde es mejor que no llegar", "El atraso siempre es grave", "Siempre hay tiempo de sobra"], a: 1 },
      { s: "Tiene memoria de elefante.", o: ["Olvida todo rápido.", "Recuerda todo muy bien", "Es un animal fuerte", "Es muy lento"], a: 1 },
      { s: "Me quedé de piedra.", o: ["Me caí al suelo.", "Estaba muy aburrido", "Me sorprendí muchísimo", "Estaba muy cansado"], a: 2 },
      { s: "Habla por los codos.", o: ["Habla muchísimo.", "Habla bajito.", "Habla con las manos.", "Habla poco."], a: 0 },
      { s: "Es la gota que colma el vaso.", o: ["Es una gota pequeña", "El vaso está lleno de agua", "Es lo que excede mi paciencia", "Es una buena noticia"], a: 2 },
      { s: "Ponerse las botas.", o: ["Comprar botas nuevas", "Calzarse deprisa", "Comer o disfrutar en abundancia", "Ponerse serio"], a: 2 },
    ],
  },
  it: {
    pick: [
      { o: ["Lei vado a scuola.", "Lei va a la scuola.", "Lei va a scuola.", "Lei vai a scuola."], a: 2 },
      { o: ["Ho vent'anni.", "Sono vent'anni.", "Faccio vent'anni.", "Ho venti anni vecchio."], a: 0 },
      { o: ["Mi piace il musica.", "Me piace la musica.", "Mi piacciono la musica.", "Mi piace la musica."], a: 3 },
      { o: ["Ieri abbiamo andati al cinema.", "Ieri siamo andare al cinema.", "Ieri siamo andati al cinema.", "Ieri siamo andato al cinema."], a: 2 },
      { o: ["Il mio casa è grande.", "La mia casa è grande.", "La mia casa è grande e bello.", "I mie casa sono grande."], a: 1 },
      { o: ["Spero che tu vieni domani.", "Spero che tu verrai domani.", "Spero che tu venire domani.", "Spero che tu venga domani."], a: 3 },
      { o: ["Non ho visto lo.", "Non l'ho visto.", "Non ho lo visto.", "Non lo ho visto lui."], a: 1 },
      { o: ["C'è molti libri.", "Ci sono molto libri.", "Ci sono molti libri.", "Sono molti libri qui."], a: 2 },
      { o: ["Le ragazze sono alti.", "Le ragazze è alte.", "I ragazze sono alte.", "Le ragazze sono alte."], a: 3 },
      { o: ["Da quanto tempo vivi qui?", "Per quanto tempo abiti qui da?", "Quanto da tempo vivi qui?", "Da quanto tempo hai vivi qui?"], a: 0 },
    ],
    gap: [
      { s: "Ieri siamo ___ al cinema.", o: ["andato", "andata", "andati", "andare"], a: 2 },
      { s: "Loro ___ studenti.", o: ["è", "siete", "sono", "siamo"], a: 2 },
      { s: "Noi ___ una casa.", o: ["hanno", "ho", "ha", "abbiamo"], a: 3 },
      { s: "Lei ___ molto intelligente.", o: ["sta", "sono", "è", "essere"], a: 2 },
      { s: "Andiamo ___ viaggiare domani.", o: ["in", "a", "di", "per"], a: 1 },
      { s: "Studio italiano ___ due ore al giorno.", o: ["da", "in", "con", "per"], a: 3 },
      { s: "Abito a Roma ___ il 2015.", o: ["per", "dal", "in", "fino per"], a: 1 },
      { s: "Se avessi tempo, ___ di più.", o: ["viaggio", "viaggiavo", "viaggerei", "viaggerò"], a: 2 },
      { s: "Questo libro è ___ interessante di quello.", o: ["molto", "meglio", "assai", "più"], a: 3 },
      { s: "Mi ___ un caffè, per favore.", o: ["porto", "porta", "portare", "porti"], a: 3 },
    ],
    syn: [
      { s: "Piove a catinelle.", o: ["Piove leggermente.", "Le catinelle sono rotte.", "Piove fortissimo.", "C'è il sole."], a: 2, img: IMG_RAIN },
      { s: "Sono al verde.", o: ["Amo la natura.", "Sono arrabbiato.", "Non ho soldi.", "Sono malato."], a: 2 },
      { s: "È un gioco da ragazzi.", o: ["È un gioco per bambini", "È molto difficile", "È divertentissimo", "È facilissimo"], a: 3 },
      { s: "Ha un cuore d'oro.", o: ["Ha problemi di cuore", "È molto generoso", "Ama molto l'oro", "È molto ricco"], a: 1 },
      { s: "Meglio tardi che mai.", o: ["Non arrivare mai tardi", "Il ritardo è sempre grave", "Il tempo guarisce tutto", "Arrivare tardi è meglio che non arrivare"], a: 3 },
      { s: "Sono rimasto di sasso.", o: ["Sono diventato duro", "Sono caduto a terra", "Sono rimasto molto sorpreso", "Mi sono molto arrabbiato"], a: 2 },
      { s: "Parla a vanvera.", o: ["Parla velocemente", "Parla senza senso", "Parla a voce bassa", "Parla molto bene"], a: 1 },
      { s: "È la goccia che ha fatto traboccare il vaso.", o: ["Il vaso si è rotto", "È una piccola goccia", "È una buona notizia", "È il fatto che mi ha fatto perdere la pazienza"], a: 3 },
      { s: "In bocca al lupo!", o: ["Attento al lupo!", "Che schifo!", "Buona fortuna!", "A presto!"], a: 2 },
      { s: "Prendere due piccioni con una fava.", o: ["Ottenere due risultati con una sola azione", "Cacciare gli uccelli", "Comprare due uccelli", "Sprecare il tempo"], a: 0 },
    ],
  },
  de: {
    pick: [
      { o: ["Ich gehe nach Haus.", "Ich gehe nach Hause.", "Ich gehe zu Hause.", "Ich bin nach Hause gehen."], a: 1 },
      { o: ["Ich habe das Buch lesen.", "Ich habe das Buch gelest.", "Ich bin das Buch gelesen.", "Ich habe das Buch gelesen."], a: 3 },
      { o: ["Er ist seit drei Jahren hier.", "Er ist seit drei Jahre hier.", "Er ist für drei Jahren hier.", "Er ist seit drei Jahr hier."], a: 0 },
      { o: ["Das ist das Auto von mein Vater.", "Das ist das Auto meines Vaters.", "Das ist das Auto meinem Vater.", "Das ist das Auto meiner Vater."], a: 1 },
      { o: ["Wir haben gestern Fußball spielen.", "Wir sind gestern Fußball gespielt.", "Wir haben gestern Fußball gespielt worden.", "Wir haben gestern Fußball gespielt."], a: 3 },
      { o: ["Es gibt vielen Büchern.", "Es geben viele Bücher.", "Es gibt viele Bücher.", "Es gibt vieles Bücher."], a: 2 },
      { o: ["Ich anrufe dich morgen.", "Ich rufe dich morgen an.", "Ich rufe an dich morgen.", "Ich dich morgen anrufe."], a: 1 },
      { o: ["Der Hund, den bellt, ist groß.", "Der Hund, dem bellt, ist groß.", "Der Hund, der bellt, ist groß.", "Der Hund, dessen bellt, ist groß."], a: 2 },
      { o: ["Ich kenne, wo er wohnt.", "Ich weiß, wo er wohnt.", "Ich weiß, wo er wohhnen.", "Ich weiß wo er wohnst."], a: 1 },
      { o: ["Meine Schwester und mich gehen einkaufen.", "Meine Schwester und ich geht einkaufen.", "Ich und meine Schwester gehe einkaufen.", "Meine Schwester und ich gehen einkaufen."], a: 3 },
    ],
    gap: [
      { s: "Gestern ___ wir ins Kino.", o: ["gehen", "gingen", "gegangen", "gehst"], a: 1 },
      { s: "Er ___ Student.", o: ["hat", "bin", "ist", "sind"], a: 2 },
      { s: "Wir ___ ein Haus.", o: ["habt", "hat", "sein", "haben"], a: 3 },
      { s: "Sie ist sehr ___ .", o: ["intelligente", "intelligenter", "Intelligenz", "intelligent"], a: 3 },
      { s: "Ich gehe ___ Schule.", o: ["nach", "zur", "in", "auf"], a: 1, img: IMG_SCHOOL },
      { s: "Ich lerne Deutsch ___ einem Jahr.", o: ["für", "vor", "seit", "ab"], a: 2 },
      { s: "Wenn ich Zeit hätte, ___ ich mehr.", o: ["werde reisen", "reise", "reiste", "würde reisen"], a: 3 },
      { s: "Dieses Buch ist ___ als jenes.", o: ["am interessantesten", "interessanter", "mehr interessant", "interessant"], a: 1 },
      { s: "Ich habe ___ Hund gesehen.", o: ["ein", "einen", "einer", "eines"], a: 1 },
      { s: "Kannst du mir ___ ?", o: ["hilfst", "half", "helfen", "hilf"], a: 2 },
    ],
    syn: [
      { s: "Es regnet Bindfäden.", o: ["Es regnet leicht.", "Bindfäden sind nass.", "Es ist sehr kalt.", "Es regnet sehr stark."], a: 3, img: IMG_RAIN },
      { s: "Ich bin pleite.", o: ["Ich bin sehr müde.", "Ich habe kein Geld.", "Ich bin verletzt.", "Ich bin allein."], a: 1 },
      { s: "Das ist ein Kinderspiel.", o: ["Das ist ein Spiel für Kinder", "Das macht viel Spaß", "Das ist sehr schwer", "Das ist sehr leicht"], a: 3 },
      { s: "Er hat ein Herz aus Gold.", o: ["Er hat Herzprobleme", "Er liebt das Gold", "Er ist sehr großzügig", "Er ist sehr reich"], a: 2 },
      { s: "Besser spät als nie.", o: ["Man darf nie zu spät kommen", "Pünktlichkeit ist egal", "Alles hat seine Zeit", "Spät zu kommen ist besser als gar nicht"], a: 3 },
      { s: "Ich verstehe nur Bahnhof.", o: ["Ich mag Züge sehr", "Ich fahre gern Bahn", "Ich verstehe nichts", "Ich höre schlecht"], a: 2 },
      { s: "Jetzt geht es um die Wurst.", o: ["Jetzt gibt es Wurst", "Es ist Essenszeit", "Jetzt wird geschlafen", "Jetzt geht es um alles"], a: 3 },
      { s: "Da liegt der Hund begraben.", o: ["Ein Hund ist hier begraben", "Das ist das eigentliche Problem", "Es riecht schlecht hier", "Das ist ein kleines Geheimnis"], a: 1 },
      { s: "Tomaten auf den Augen haben.", o: ["Gemüse nicht mögen", "Sehr müde sein", "Traurig sein", "Offensichtliches nicht sehen"], a: 3 },
      { s: "Ich drücke dir die Daumen!", o: ["Ich drücke stark zu", "Ich wasche die Hände", "Ich wünsche dir viel Glück", "Ich bin zornig"], a: 2 },
    ],
  },
  ja: {
    pick: [
      { o: ["これは本です。", "これは本います。", "これが本あります。", "これは本だします。"], a: 0 },
      { o: ["私は毎日日本語が勉強します。", "私は毎日日本語を勉強します。", "私は毎日日本語に勉強します。", "私は毎日日本語へ勉強します。"], a: 1 },
      { o: ["昨日、映画を見ます。", "明日、映画を見ました。", "昨日、映画を見ました。", "昨日、映画を見ませんでした。"], a: 2 },
      { o: ["机の上に猫があります。", "机の上に猫がいます。", "机の上に猫がです。", "机の上に猫がおります。"], a: 1 },
      { o: ["友達を公園へ行きました。", "友達が公園を行きました。", "友達と公園へ行きました。", "友達は公園をへ行きました。"], a: 2 },
      { o: ["日本語が少し話せます。", "日本語が少し話しますできます。", "日本語を少し話すです。", "日本語が少し話きたいですできます。"], a: 0 },
      { o: ["このかばんは軽いでした。", "このかばんは軽くです。", "このかばんは軽くてでした。", "このかばんは軽いです。"], a: 3 },
      { o: ["先生は教室にあります。", "先生は教室がいます。", "先生は教室にいます。", "先生は教室へいます。"], a: 2 },
      { o: ["寿司を食べたことがいます。", "寿司を食べことがあります。", "寿司を食べたことがあります。", "寿司を食べたことです。"], a: 2 },
      { o: ["雨が降ったら、出かけません。", "雨が降っても、行きました。", "雨が降れば、行きました。", "雨が降るなら、出かけました。"], a: 0 },
    ],
    gap: [
      { s: "私はりんご___食べます。", o: ["は", "を", "が", "に"], a: 1 },
      { s: "教室___学生がいます。", o: ["を", "に", "へ", "が"], a: 1, img: IMG_SCHOOL },
      { s: "昨日、友達___会いました。", o: ["を", "に", "が", "は"], a: 1 },
      { s: "これは私___本です。", o: ["の", "を", "に", "は"], a: 0 },
      { s: "学校___歩いて行きます。", o: ["までに", "まで", "にまで", "をまで"], a: 1 },
      { s: "明日、試験___あります。", o: ["が", "を", "に", "は"], a: 0 },
      { s: "映画を見___です。", o: ["た", "たい", "ます", "ない"], a: 1 },
      { s: "日本語___勉強しています。", o: ["を", "に", "が", "で"], a: 0 },
      { s: "電車___学校に行きます。", o: ["で", "を", "に", "が"], a: 0 },
      { s: "彼___本を読みます。", o: ["は", "を", "に", "で"], a: 0 },
    ],
    syn: [
      { s: "毎朝、公園を散歩します。", o: ["朝ごとに公園を歩きます。", "公園で朝ごはんを食べます。", "夜、公園を走ります。", "公園の木を切ります。"], a: 0 },
      { s: "彼は石橋を叩いて渡るタイプです。", o: ["非常に大胆な人です。", "とても慎重な人です。", "橋を作る人です。", "せっかちな人です。"], a: 1 },
      { s: "猫の手も借りたいほど忙しいです。", o: ["とても忙しいです。", "猫が好きです。", "手を洗いたいです。", "暇です。"], a: 0 },
      { s: "その話は嘘だと思います。", o: ["その話は本当だと思います。", "その話は正しくないと思います。", "その話は面白いと思います。", "その話は古いと思います。"], a: 1 },
      { s: "彼女は笑顔が素敵です。", o: ["彼女はいつも怒っています。", "彼女の笑った顔がいいです。", "彼女は笑い方が下手です。", "彼女はよく泣きます。"], a: 1 },
      { s: "後で先生に聞いてみます。", o: ["先生に後で質問します。", "先生の後ろに立ちます。", "先生に遅れました。", "先生の声を聞きました。"], a: 0 },
      { s: "日本語は敬語が難しいです。", o: ["敬語はやさしいです。", "日本語は易しいです。", "敬語は難しいと思います。", "日本語の先生は厳しいです。"], a: 2, img: IMG_SCHOOL },
      { s: "電気を消してください。", o: ["電気をつけてください。", "電気を見せてください。", "電気を止めてください。", "電気を消さないでください。"], a: 2 },
      { s: "この問題は簡単ではありません。", o: ["この問題は易しいです。", "この問題は短いです。", "この問題は難しいです。", "この問題は面白いです。"], a: 2 },
      { s: "兄は私より三歳年上です。", o: ["兄は私より若いです。", "兄は三歳下です。", "兄は学生です。", "兄は私より年齢が大きいです。"], a: 3 },
    ],
  },
  pt: {
    pick: [
      { o: ["Ela vai a escola.", "Ela vão à escola.", "Ela vai à escola.", "Ela vou à escola."], a: 2 },
      { o: ["Tenho vinte anos.", "Sou vinte anos.", "Faço vinte anos.", "Estou vinte anos."], a: 0 },
      { o: ["Há muitos livro.", "Hão muitos livros.", "Tem muitos livros a mesa.", "Há muitos livros."], a: 3 },
      { o: ["Gosto o café.", "Gosto de café.", "Gosto a café.", "Eu gosta de café."], a: 1 },
      { o: ["Ontem vamos ao cinema.", "Ontem fomos no cinema.", "Ontem fomos ao cinema.", "Ontem fomos ao cinema ontem."], a: 2 },
      { o: ["Espero que vens amanhã.", "Espero que venhas amanhã.", "Espero que virás amanhã.", "Espero que vens ontem."], a: 1 },
      { o: ["Não vi ele ontem.", "Não o vi ele.", "Não vi o ontem.", "Não o vi ontem."], a: 3 },
      { o: ["Ela é cansada.", "Ela está cansado.", "Ela está cansada.", "Ela são cansada."], a: 2 },
      { o: ["Preciso ajuda.", "Preciso a ajuda.", "Preciso de a ajuda.", "Preciso de ajuda."], a: 3 },
      { o: ["Há dois anos que vivo aqui.", "Vivo aqui desde dois anos.", "Vivo aqui à dois anos.", "Vivo aqui por dois anos que."], a: 0 },
    ],
    gap: [
      { s: "Ontem eu ___ ao mercado.", o: ["vou", "fui", "irei", "era"], a: 1, img: IMG_MARKET },
      { s: "Eles ___ estudantes.", o: ["é", "estão", "são", "está"], a: 2 },
      { s: "Nós ___ uma casa.", o: ["têm", "tenho", "tem", "temos"], a: 3 },
      { s: "Ela ___ muito inteligente.", o: ["está", "seja", "é", "ser"], a: 2 },
      { s: "Preciso ___ estudar hoje.", o: ["a", "de", "em", "por"], a: 1 },
      { s: "Estudo português ___ duas horas por dia.", o: ["desde", "por", "durante", "para"], a: 2 },
      { s: "Moro em Lisboa ___ 2015.", o: ["durante", "por", "desde", "até"], a: 2 },
      { s: "Se tivesse tempo, ___ mais.", o: ["viajo", "viajava", "viajarei", "viajaria"], a: 3 },
      { s: "Este livro é ___ interessante do que aquele.", o: ["mais", "muito", "melhor", "muito mais"], a: 0 },
      { s: "O café ___ muito quente.", o: ["é", "seja", "estão", "está"], a: 3 },
    ],
    syn: [
      { s: "Está a chover canecas.", o: ["Chove um pouco.", "As canecas estão molhadas.", "Está a chover muito.", "Está sol."], a: 2, img: IMG_RAIN },
      { s: "Estou falido.", o: ["Estou cansado.", "Não tenho dinheiro.", "Estou doente.", "Estou sozinho."], a: 1 },
      { s: "É canja.", o: ["É uma sopa.", "É muito fácil.", "É comida rica.", "É muito difícil."], a: 1 },
      { s: "Tem um coração de ouro.", o: ["Tem problema de coração.", "Gosta muito de ouro.", "É muito generoso.", "É muito rico."], a: 2 },
      { s: "Mais vale tarde do que nunca.", o: ["Nunca chegues tarde", "O atraso é sempre grave", "Há sempre tempo de sobra", "Chegar tarde é melhor do que não chegar"], a: 3 },
      { s: "Fiquei de pedra.", o: ["Fiquei cansado", "Caí ao chão", "Fiquei muito surpreendido", "Fiquei zangado"], a: 2 },
      { s: "Falar pelos cotovelos.", o: ["Falar pouco", "Falar muito", "Falar com as mãos", "Falar baixinho"], a: 1 },
      { s: "É a gota de água.", o: ["É apenas uma gota", "O copo está cheio", "É uma boa notícia", "É o que excede a paciência"], a: 3 },
      { s: "Andar nas nuvens.", o: ["Estar distraído a sonhar", "Andar de avião", "Estar molhado", "Estar muito cansado"], a: 0 },
      { s: "Matar dois coelhos com uma cajadada.", o: ["Caçar coelhos no campo", "Conseguir dois objetivos com uma só ação", "Fazer algo malfeito", "Perder tempo à toa"], a: 1 },
    ],
  },
};

// 25 — المراجعة الشاملة: أخطاء المستخدم + ترتيب الجمل + cloze + ترجمة (٤٠ سؤالاً)
export function buildReviewQuestions(target, base, count = 40) {
  const meanings = meaningPool(base);
  const out = [];
  const used = new Set();

  // 1) أخطاء المستخدم السابقة أولاً
  for (const m of getAdvMistakes(target).slice(-8)) {
    const distractors = sample(meanings.filter((x) => x !== m.correct), 3);
    const options = shuffle([m.correct, ...distractors]);
    out.push({ t: "mcq", word: m.word, options, correct: options.indexOf(m.correct) });
    used.add(m.word);
  }
  // 2) ترتيب الجمل من كل المستويات
  const arrangePool = THEMES.flatMap((th) => th.arrange);
  for (const e of sample(arrangePool, 10)) {
    out.push({ t: "order", hint: e[base].join(" "), shuffled: shuffle(e[target]), correct: e[target] });
  }
  // 3) أسئلة cloze الصعبة
  const clozePool = [...CLOZE_LEVELS[0].banks(target), ...CLOZE_LEVELS[1].banks(target)];
  for (const q of sample(clozePool, 12)) {
    const options = shuffle(q.o);
    out.push({ t: "cloze", s: q.s, options, correct: options.indexOf(q.a) });
  }
  // 4) ترجمة اختيار من متعدد حتى اكتمال العدد
  const words = THEMES.flatMap((th) => th.words);
  for (const w of shuffle(words)) {
    if (out.length >= count) break;
    const correct = w[base];
    if (used.has(w[target])) continue;
    used.add(w[target]);
    const distractors = sample(meanings.filter((m) => m !== correct), 3);
    const options = shuffle([correct, ...distractors]);
    out.push({ t: "mcq", word: w[target], options, correct: options.indexOf(correct) });
  }
  return shuffle(out).slice(0, count);
}

// 26 — مستوى الملك: 30 سؤالاً منسّقاً من بنك القواعد + إكمال من تمارين cloze حتى ٥٠
export function buildKingQuestions(target, base, count = 50) {
  const bank = KING_BANKS[target] || KING_BANKS.en;
  const out = [];
  for (const q of bank.pick) out.push({ t: "pick", options: q.o, correct: q.a });
  for (const q of bank.gap) out.push({ t: "gap", s: q.s, options: q.o, correct: q.a, img: q.img });
  for (const q of bank.syn) out.push({ t: "syn", s: q.s, options: q.o, correct: q.a, img: q.img });
  // إكمال الفراغ النحوي من تمارين الجُمل (cloze)
  const clozePool = [...CLOZE_LEVELS[0].banks(target), ...CLOZE_LEVELS[1].banks(target)];
  for (const q of sample(clozePool, count - out.length)) {
    const options = shuffle(q.o);
    out.push({ t: "cloze", s: q.s, options, correct: options.indexOf(q.a) });
  }
  // إن بقيت أسئلة نضيف ترتيب جمل (بناء الجملة الصحيح)
  const remaining = count - out.length;
  if (remaining > 0) {
    const arrangePool = THEMES.flatMap((th) => th.arrange);
    for (const e of sample(arrangePool, remaining)) {
      out.push({ t: "order", hint: e[base].join(" "), shuffled: shuffle(e[target]), correct: e[target] });
    }
  }
  return shuffle(out);
}