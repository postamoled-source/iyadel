import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

// MASTER_DATA — 63 tools: name, slug, category, title (= seo_title), description (= meta_description)
const MASTER_DATA = [
  { n: "BMI Calculator", s: "bmi-calculator", c: "Health", t: "احسب كتلة جسمك المثالية فوراً مع الحاسب الذكي الذهبي - iyadel", d: "هل وزنك مثالي؟ احسب كتلة جسمك BMI فوراً واعرف وزنك المثالي ونسبة الدهون مع نصائح فورية مجاناً." },
  { n: "Calories Burned", s: "calories-burned", c: "Health", t: "اعرف سعراتك المحروقة أثناء الرياضة مع الحاسب الدقيق الفوري - iyadel", d: "كم سعراً حرقت اليوم؟ احسب السعرات المحروقة أثناء الجري والمشي والرياضة بدقة مع حاسبنا الذكي المجاني." },
  { n: "Ideal Weight Calculator", s: "ideal-weight-calculator", c: "Health", t: "اكتشف وزنك المثالي حسب طولك مع المقدر السحري الذكي - iyadel", d: "ما هو وزنك المثالي حسب طولك وعمرك؟ اكتشفه الآن مع مقدرنا السحري واحصل على هدف واقعي لوزنك." },
  { n: "Body Fat Calculator", s: "body-fat-calculator", c: "Health", t: "احسب نسبة الدهون في جسمك بدقة مع المحلل الاحترافي - iyadel", d: "اعرف نسبة الدهون الحقيقية في جسمك بثوانٍ. أدخل قياساتك وسيقوم محللنا الاحترافي بحسابها بدقة عالية." },
  { n: "Daily Protein Calculator", s: "daily-protein-calculator", c: "Health", t: "احسب احتياجك اليومي من البروتين مع الحاسب الذهبي الدقيق - iyadel", d: "كم بروتين تحتاج يومياً لبناء العضل؟ احسب احتياجك الدقيق حسب وزنك ونشاطك مع حاسبنا الذهبي." },
  { n: "Daily Carbs Calculator", s: "daily-carbs-calculator", c: "Health", t: "اعرف كمية الكارب التي تحتاجها يومياً مع الحاسب الذكي الفوري - iyadel", d: "احسب كمية الكاربوهيدرات المناسبة لك يومياً للحفاظ على طاقتك ووزنك مع حاسبنا الذكي المجاني." },
  { n: "Daily Fat Calculator", s: "daily-fat-calculator", c: "Health", t: "احسب دهونك اليومية المسموحة مع المقدر الاحترافي الذكي - iyadel", d: "لا تحرم نفسك من الدهون الصحية. اعرف كمية الدهون المسموحة لك يومياً مع مقدرنا الاحترافي الدقيق." },
  { n: "Running Pace Calculator", s: "running-pace-calculator", c: "Health", t: "احسب سرعة الجري المثالية لك مع الحاسب السحري الدقيق - iyadel", d: "تريد تحسين جريك؟ احسب سرعتك ووقتك لكل كيلومتر مع حاسبنا السحري وخطط لسباقك القادم." },
  { n: "BMR Calculator", s: "bmr-calculator", c: "Health", t: "اعرف معدل حرق جسمك الأساسي مع الحاسب الذكي الفوري - iyadel", d: "اعرف كم يحرق جسمك وهو مرتاح. احسب معدل الأيض الأساسي BMR فوراً بدون معادلات معقدة." },
  { n: "TDEE Calculator", s: "tdee-calculator", c: "Health", t: "احسب سعراتك اليومية الكاملة مع المحلل الذهبي الدقيق - iyadel", d: "كم سعراً تحتاج حقاً يومياً؟ احسب احتياجك الكامل TDEE مع نشاطك وابدأ خطة انقاص وزنك اليوم." },
  { n: "Daily Calorie Calculator", s: "daily-calorie-calculator", c: "Health", t: "خطط سعراتك اليومية لإنقاص الوزن مع الحاسب الاحترافي - iyadel", d: "خطط سعراتك بذكاء. احسب سعراتك اليومية لإنقاص أو زيادة الوزن مع حاسبنا الاحترافي المجاني." },
  { n: "Loan Calculator", s: "loan-calculator", c: "Finance", t: "احسب قسط قرضك الشهري والفائدة مع الحاسب الذكي الفوري - iyadel", d: "كم سيكون قسط قرضك؟ احسب القسط الشهري والفائدة الإجمالية فوراً مع حاسبنا الذكي قبل الذهاب للبنك." },
  { n: "Simple & Compound Interest", s: "simple-compound-interest", c: "Finance", t: "احسب الفائدة البسيطة والمركبة بثانية مع الحاسب الذهبي - iyadel", d: "احسب أرباحك من الفائدة البسيطة والمركبة بثانية. اعرف كم سينمو مالك مع حاسبنا الذهبي." },
  { n: "Bond Yield", s: "bond-yield", c: "Finance", t: "اعرف عائد السندات الحقيقي قبل الاستثمار مع المحلل الدقيق - iyadel", d: "هل السند مربح؟ احسب عائد السندات الحقيقي قبل الاستثمار مع محللنا الدقيق واتخذ قرارك بثقة." },
  { n: "Car Tools Suite", s: "car-tools-suite", c: "Finance", t: "كل حسابات سيارتك في مكان واحد مع الحزمة الاحترافية الذكية - iyadel", d: "كل حسابات سيارتك في مكان واحد. احسب استهلاك الوقود والقسط والتأمين مع حزمتنا الاحترافية الذكية." },
  { n: "Currency Converter", s: "currency-converter", c: "Converters", t: "حول العملات بسعر الصرف المباشر مع المحول الذكي الفوري - iyadel", d: "حول أي عملة بسعر الصرف المباشر. حول الدولار واليورو وكل العملات فوراً مع محولنا الذكي المجاني." },
  { n: "Distance Converter", s: "distance-converter", c: "Converters", t: "حول المسافات من متر لميل وكيلومتر مع المحول الدقيق الذكي - iyadel", d: "حول المسافات من متر لكيلومتر وميل وبوصة بدقة عالية. أداة سريعة للطلاب والمهندسين." },
  { n: "Weight Converter", s: "weight-converter", c: "Converters", t: "حول وزنك بين الكيلو والباوند والأوقية مع المحول الذهبي - iyadel", d: "حول وزنك بين الكيلو والباوند والأوقية والجرام فوراً. محول ذهبي دقيق للطبخ والشحن والرياضة." },
  { n: "Area Converter", s: "area-converter", c: "Converters", t: "حول وحدات المساحة من متر لميل مع المحول الاحترافي السريع - iyadel", d: "حول وحدات المساحة من متر مربع لهكتار وفدان وميل. محول احترافي سريع للعقار والهندسة." },
  { n: "Time Converter", s: "time-converter", c: "Converters", t: "حول الوقت بين المناطق الزمنية مع المحول السحري الفوري - iyadel", d: "حول الوقت بين المناطق الزمنية والثواني والساعات والأيام مع محولنا السحري الفوري المجاني." },
  { n: "Speed Converter", s: "speed-converter", c: "Converters", t: "حول السرعة من كم/ساعة لميل/ثانية مع المحول الاحترافي - iyadel", d: "حول السرعة من كم/ساعة لميل/ساعة وعقدة ومتر/ثانية مع محولنا الاحترافي الدقيق للسائقين." },
  { n: "Internet Speed Test", s: "internet-speed-test", c: "Converters", t: "افحص سرعة النت الحقيقية Ping والتحميل مع الفاحص الدقيق - iyadel", d: "هل انترنتك بطيء؟ افحص سرعة التحميل والرفع والـ Ping بدقة في 10 ثوانٍ فقط بدون برامج." },
  { n: "QR Code Generator", s: "qr-code-generator", c: "Converters", t: "أنشئ QR كود احترافي لعملك بثانية مع المنشئ السحري الذكي - iyadel", d: "حول أي رابط أو نص أو رقم هاتف إلى QR كود احترافي بثانية. جودة عالية ويعمل على كل الأجهزة." },
  { n: "Share Link Generator", s: "share-link-generator", c: "Converters", t: "أنشئ رابط مشاركة ذكي واحترافي مع المنشئ الفوري الذهبي - iyadel", d: "أنشئ روابط مشاركة ذكية لواتساب وفيسبوك وتويتر بضغطة واحدة. منشئ فوري يزيد زياراتك." },
  { n: "Privacy Policy Generator", s: "privacy-policy-generator", c: "Converters", t: "ولّد سياسة خصوصية احترافية لموقعك مع المنشئ الذهبي الذكي - iyadel", d: "تحتاج سياسة خصوصية لموقعك؟ ولّد سياسة احترافية قانونية في ثوانٍ مع منشئنا الذهبي المجاني." },
  { n: "Coupon Code Generator", s: "coupon-code-generator", c: "Converters", t: "ولّد أكواد خصم جاهزة لمتجرك مع المنشئ الفوري الذكي - iyadel", d: "ولّد مئات أكواد الخصم الجاهزة لمتجرك الإلكتروني بثانية. أكواد فريدة وجاهزة للنسخ." },
  { n: "Math Function Calculator", s: "math-function-calculator", c: "Math", t: "حل الدوال الرياضية المعقدة فوراً مع الحاسب الاحترافي - iyadel", d: "حل الدوال الرياضية المعقدة ورسمها فوراً. أداة احترافية للطلاب والمهندسين بدون تعقيد." },
  { n: "Percentage", s: "percentage", c: "Math", t: "احسب النسبة المئوية بثانية مع الحاسب السحري الفوري - iyadel", d: "احسب النسبة المئوية والخصم والزيادة بثانية. الحاسب السحري الأسرع للحسابات اليومية." },
  { n: "Physics Calculators", s: "physics-calculators", c: "Math", t: "حل مسائل الفيزياء المعقدة مع الحزمة الذكية الذهبية - iyadel", d: "حل مسائل الفيزياء كالسرعة والطاقة والجاذبية مع حزمتنا الذكية. شرح بخطوات مجاناً." },
  { n: "Chemistry Calculators", s: "chemistry-calculators", c: "Math", t: "حل معادلات الكيمياء بسهولة مع المحلل الاحترافي الذكي - iyadel", d: "حل معادلات الكيمياء والمول والتركيز بسهولة. محلل احترافي للطلاب والمختبرات." },
  { n: "Basic Calculator", s: "basic-calculator", c: "Math", t: "آلة حاسبة ذكية وسريعة لكل حساباتك اليومية - iyadel", d: "آلة حاسبة ذكية وسريعة لكل حساباتك اليومية. خفيفة وتعمل بدون انترنت على الجوال." },
  { n: "Scientific Calculator", s: "scientific-calculator", c: "Math", t: "حل المعادلات العلمية المتقدمة مع الحاسبة الاحترافية الذكية - iyadel", d: "حل المعادلات العلمية واللوغاريتم والجذور مع حاسبتنا الاحترافية المتقدمة المجانية." },
  { n: "Fraction Calculator", s: "fraction-calculator", c: "Math", t: "احسب الكسور وتبسيطها فوراً مع الحاسب الذكي الدقيق - iyadel", d: "احسب الكسور وجمعها وتبسيطها فوراً. الحاسب الذكي الأسرع لحل مسائل الكسور." },
  { n: "Statistics Calculator", s: "statistics-calculator", c: "Math", t: "حل مسائل الإحصاء والاحتمالات مع المحلل الذهبي الفوري - iyadel", d: "حل مسائل الإحصاء والمتوسط والانحراف والاحتمالات مع محللنا الذهبي الفوري للطلاب." },
  { n: "Geometry Calculator", s: "geometry-calculator", c: "Math", t: "احسب المساحات والأحجام الهندسية مع الحاسب السحري الدقيق - iyadel", d: "احسب مساحة ومحيط وحجم الأشكال الهندسية بثانية. حاسب سحري دقيق للهندسة." },
  { n: "Quadratic Equation Solver", s: "quadratic-equation-solver", c: "Math", t: "حل المعادلة التربيعية بخطوات مع الحلال الذكي الاحترافي - iyadel", d: "حل المعادلة التربيعية بخطوات واضحة. أدخل المعاملات وسيحلها حلالنا الذكي فوراً." },
  { n: "GCD & LCM Calculator", s: "gcd-lcm-calculator", c: "Math", t: "استخرج القاسم والمضاعف المشترك فوراً مع الحاسب الذكي - iyadel", d: "استخرج القاسم المشترك الأكبر والمضاعف المشترك الأصغر لأي رقمين فوراً مع حاسبنا الذكي." },
  { n: "Permutations & Combinations", s: "permutations-combinations", c: "Math", t: "احسب التوافيق والتباديل بثانية مع الحاسب الدقيق السحري - iyadel", d: "احسب التوافيق والتباديل والاحتمالات بثانية. الحاسب الدقيق لمسائل الإحصاء." },
  { n: "Matrix Calculator", s: "matrix-calculator", c: "Math", t: "احسب عمليات المصفوفات 2×2 فوراً مع الحاسب الاحترافي الذكي - iyadel", d: "احسب جمع وطرح وضرب المصفوفات 2×2 فوراً مع حاسبنا الاحترافي للرياضيات." },
  { n: "Image Cropper", s: "image-cropper", c: "Image", t: "قص صورك بدقة احترافية بدون فوتوشوب مع الأداة السحرية - iyadel", d: "قص صورك بدقة احترافية بأي مقاس تريده. أداة سحرية مجانية تعمل بدون فوتوشوب." },
  { n: "Background Remover", s: "background-remover", c: "Image", t: "احذف خلفية أي صورة بضغطة مع المزيل الذكي الاحترافي - iyadel", d: "احذف خلفية أي صورة بضغطة زر بالذكاء الاصطناعي. نتيجة احترافية شفافة بدون برامج." },
  { n: "Image to PDF", s: "image-to-pdf", c: "Image", t: "حول صورك إلى ملف PDF بجودة عالية مع المحول الذهبي - iyadel", d: "حول صورك JPG إلى ملف PDF بجودة عالية. اجمع عدة صور في ملف واحد مجاناً." },
  { n: "Image Compressor", s: "image-compressor", c: "Image", t: "قلل حجم الصور 80% بدون فقدان الجودة مع الضاغط الذكي - iyadel", d: "قلل حجم الصور 80% بدون فقدان الجودة. ضاغط ذكي يجعل موقعك أسرع." },
  { n: "JPG to PNG Converter", s: "jpg-to-png-converter", c: "Image", t: "حول JPG إلى PNG بشفافية مع المحول الاحترافي الفوري - iyadel", d: "حول JPG إلى PNG بخلفية شفافة بجودة عالية. محول احترافي فوري مجاني." },
  { n: "Image Resizer", s: "image-resizer", c: "Image", t: "غير مقاس صورك لأي حجم تريده مع الأداة الذكية السريعة - iyadel", d: "غير مقاس صورك لأي حجم تريده للانستغرام والويب. أداة ذكية سريعة بدون تشويه." },
  { n: "Image Enhancer", s: "image-enhancer", c: "Image", t: "حسن جودة صورك الضبابية بذكاء اصطناعي مع المحسن الذهبي - iyadel", d: "حسن جودة صورك الضبابية والقديمة بالذكاء الاصطناعي. محسن ذهبي يجعلها واضحة." },
  { n: "Logo Maker", s: "logo-maker", c: "Image", t: "صمم شعار أحلامك مجاناً مع الصانع الاحترافي الذكي - iyadel", d: "صمم شعار احترافي مجاناً بدون مصمم. قوالب جاهزة وخطوط وأيقونات مع تحميل فوري." },
  { n: "Word to PDF", s: "word-to-pdf", c: "PDF", t: "حول الوورد إلى PDF بجودة عالية مع المحول الذكي الفوري - iyadel", d: "حول ملف Word إلى PDF احترافي بجودة عالية في ثانية. يحافظ على التنسيق والصور ويعمل على الجوال." },
  { n: "Excel to PDF", s: "excel-to-pdf", c: "PDF", t: "حول الإكسل إلى PDF بدقة مع المحول الاحترافي الذهبي - iyadel", d: "حول جداول الإكسل إلى PDF احترافي بدقة. يحافظ على الأرقام والتنسيق مع محولنا الذهبي." },
  { n: "Images to PDF", s: "images-to-pdf", c: "Image", t: "اجمع كل صورك في ملف PDF واحد مع المنشئ السحري الذكي - iyadel", d: "اجمع كل صورك في ملف PDF واحد مرتب. منشئ سحري سريع ومجاني بدون علامة مائية." },
  { n: "PDF to Text", s: "pdf-to-text", c: "PDF", t: "استخرج النصوص من أي PDF مقفل مع المحول الذكي الدقيق - iyadel", d: "استخرج النصوص من أي ملف PDF حتى المقفل. حول PDF إلى نص قابل للنسخ فوراً." },
  { n: "PDF to Images", s: "pdf-to-images", c: "Image", t: "حول صفحات PDF إلى صور عالية الجودة مع المحول الفوري - iyadel", d: "حول صفحات PDF إلى صور JPG عالية الجودة. استخرج كل صفحة كصورة بثانية." },
  { n: "Merge PDF", s: "merge-pdf", c: "PDF", t: "ادمج ملفات PDF في ملف واحد بثانية مع الأداة الاحترافية - iyadel", d: "ادمج عدة ملفات PDF في ملف واحد مرتب بثانية. أداة احترافية سريعة ومجانية." },
  { n: "Split PDF", s: "split-pdf", c: "PDF", t: "قسّم ملف PDF الكبير إلى أجزاء صغيرة مع المقسم الذكي الفوري - iyadel", d: "قسّم ملف PDF الكبير إلى أجزاء صغيرة. اختر الصفحات وقسمها فوراً مع مقسمنا الذكي." },
  { n: "Extract Pages", s: "extract-pages", c: "PDF", t: "استخرج صفحات محددة من PDF مع الأداة الدقيقة الفورية - iyadel", d: "استخرج صفحات محددة من ملف PDF واحفظها كملف جديد. أداة دقيقة وسريعة." },
  { n: "Rearrange Pages", s: "rearrange-pages", c: "PDF", t: "رتب صفحات PDF بالسحب والإفلات مع الأداة السحرية الذكية - iyadel", d: "رتب صفحات PDF بالسحب والإفلات بسهولة. غير ترتيب الصفحات كما تريد بأداتنا السحرية." },
  { n: "Compress PDF", s: "compress-pdf", c: "PDF", t: "قلل حجم PDF 90% مع الحفاظ على الجودة مع الضاغط الذهبي - iyadel", d: "ملف PDF حجمه كبير؟ قلله 90% مع الحفاظ على الجودة ليصبح جاهز للإرسال فوراً." },
  { n: "Web Optimize", s: "web-optimize", c: "PDF", t: "حسّن ملف PDF للويب ليحمل بسرعة مع المحسن الاحترافي - iyadel", d: "حسّن ملف PDF ليحمل بسرعة على الويب. ضغط ذكي للمواقع والبريد الإلكتروني." },
  { n: "Add Watermark", s: "add-watermark", c: "PDF", t: "أضف علامة مائية لحماية ملفاتك مع الأداة الاحترافية الذكية - iyadel", d: "أضف علامة مائية نصية أو شعار لحماية ملفات PDF الخاصة بك. أداة احترافية مجانية." },
  { n: "Add Page Numbers", s: "add-page-numbers", c: "PDF", t: "رقّم صفحات PDF تلقائياً باحترافية مع الأداة الفورية الذكية - iyadel", d: "رقّم صفحات PDF تلقائياً باحترافية. اختر المكان والخط وأضف الترقيم بثانية." },
  { n: "OCR Image", s: "ocr-image", c: "Image", t: "استخرج النص من الصور الممسوحة مع المحلل الذكي السحري - iyadel", d: "استخرج النص من الصور الممسوحة ضوئياً والـ Screenshot. تقنية OCR ذكية تدعم العربية." },
  { n: "View PDF", s: "view-pdf", c: "PDF", t: "اعرض ملفات PDF مباشرة في المتصفح مع العارض السريع الذكي - iyadel", d: "اعرض ملفات PDF مباشرة في المتصفح بدون تحميل. عارض سريع وخفيف وآمن." },
  { n: "Create Blank PDF", s: "create-blank-pdf", c: "PDF", t: "أنشئ ملف PDF فارغ بثانية مع المنشئ الاحترافي الفوري - iyadel", d: "أنشئ ملف PDF فارغ بثانية واحدة. منشئ احترافي جاهز للكتابة والطباعة." },
];

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const Tool = base44.asServiceRole.entities.Tool;

    // Load all existing tools once and index by slug + name for reliable matching
    const existing = await Tool.list('-created_date', 200);
    const bySlug = {};
    const byName = {};
    for (const t of existing) {
      if (t.slug) bySlug[t.slug] = t;
      if (t.name) byName[t.name] = t;
    }

    let updated = 0;
    let created = 0;
    const updatedSlugs = [];
    const createdSlugs = [];
    const errors = [];

    for (const item of MASTER_DATA) {
      try {
        // Match by slug first, then by name (handles slug mismatches)
        const match = (item.s && bySlug[item.s]) || (item.n && byName[item.n]);
        if (match) {
          await Tool.update(match.id, {
            title: item.t,
            seo_title: item.t,
            meta_description: item.d,
            description: item.d
          });
          updated++;
          updatedSlugs.push(item.s);
        } else {
          // Tool record doesn't exist yet — create it
          await Tool.create({
            name: item.n,
            slug: item.s,
            category: item.c,
            title: item.t,
            seo_title: item.t,
            meta_description: item.d,
            description: item.d
          });
          created++;
          createdSlugs.push(item.s);
        }
      } catch (e) {
        errors.push({ slug: item.s, error: e.message });
      }
    }

    return Response.json({
      success: true,
      total: MASTER_DATA.length,
      updated,
      created,
      updatedSlugs,
      createdSlugs,
      errors
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}