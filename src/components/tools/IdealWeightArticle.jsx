// مقال شامل عن حساب الوزن المثالي حسب الطول والعمر
// يدعم العربية والإنجليزية + RTL/LTR ومتجاوب مع الجوال
import { Link } from "react-router-dom";
import { useI18n } from "@/lib/i18n";

// مكوّن صغير لعرض جدول مرتب
function ArticleTable({ headers, rows, rtl }) {
  return (
    <div className="overflow-x-auto my-4 rounded-xl border border-border">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-[#F5F3FF] dark:bg-[#2D2A5A]">
            {headers.map((h, i) => (
              <th key={i} className={`border border-border px-3 py-2 font-bold text-[#6D28D9] dark:text-[#FBBF24] ${rtl ? "text-right" : "text-left"}`}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className={i % 2 === 0 ? "bg-white dark:bg-[#1E1B4B]" : "bg-[#FAFAFA] dark:bg-[#252253]"}>
              {row.map((cell, j) => (
                <td key={j} className="border border-border px-3 py-2 text-[#374151] dark:text-[#D6D2EE]">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// صندوق تنبيه ملون
function Callout({ children, type = "info", rtl }) {
  const styles = type === "warning"
    ? "bg-amber-50 dark:bg-amber-900/20 border-amber-500"
    : "bg-[#F5F3FF] dark:bg-[#2D2A5A] border-[#6D28D9]";
  const side = rtl ? "border-r-4" : "border-l-4";
  return (
    <div className={`my-4 rounded-lg ${side} p-4 text-sm text-[#374151] dark:text-[#D6D2EE] ${styles}`}>
      {children}
    </div>
  );
}

// عنصر سؤال وجواب قابل للطي
function FaqItem({ question, answer, rtl }) {
  return (
    <details className="group bg-white dark:bg-[#2D2A5A] border border-border rounded-xl mb-2.5">
      <summary className={`cursor-pointer list-none flex items-center justify-between p-4 text-sm font-semibold text-[#6D28D9] dark:text-[#FBBF24] ${rtl ? "text-right" : "text-left"}`}>
        {question}
        <span className="text-muted-foreground transition-transform group-open:rotate-90 shrink-0">▸</span>
      </summary>
      <p className="px-4 pb-4 text-sm text-[#374151] dark:text-[#D6D2EE] leading-relaxed">{answer}</p>
    </details>
  );
}

const CONTENT = {
  ar: {
    dir: "rtl",
    badge: "📚 دليل شامل",
    title: "حساب الوزن المثالي حسب الطول والعمر: دليل شامل مع الجداول",
    introBox: "سؤال يتكرر كثيرًا: «هل وزني مثالي بالنسبة لطولي وعمري؟» المشكلة أن معظم الناس يبحثون عن رقم واحد، بينما الطب يقول إن الموضوع كله نطاق صحي. في هذا الدليل نشرح لك الطريقة الصحيحة للحساب، مع الجداول والمعادلات وأخطاء شائعة يجب تجنبها.",
    p1: "قبل الدخول في الأرقام، لنتفق على شيء مهم: الوزن المثالي ليس وزنًا محددًا بالجرام، بل هو مدى يمكن لجسمك أن يعمل فيه بأفضل حالاته. شخصان لهما نفس الطول قد يكون وزناهما المثاليان مختلفين تمامًا بسبب العمر، العضلات، وبنية الهيكل العظمي.",
    p2: "لهذا السبب بالتحديد، الاعتماد على رقم واحد من تطبيق أو موقع قد يضللك. الأفضل أن تفهم الأساس، ثم تستخدم أداة تعطيك نطاقًا واقعيًا. تابع معي.",
    tryCalc: "⚖️ جرّب حاسبة الوزن المثالي التفاعلية ↑",
    h2_1: "لماذا لا يوجد «وزن مثالي» واحد للجميع؟",
    h2_1_p: "لو سألت عشرة أطباء عن الوزن المثالي لشخص طوله 170 سم، ستحصل على عشرة أرقام مختلفة قليلًا. السبب أن كل معادلة طبية تعتمد على متغيرات مختلفة:",
    h2_1_li: [
      "الطول: العامل الأساسي في كل المعادلات تقريبًا.",
      "الجنس: الرجل والمرأة يختلفان في نسبة العضلات والدهون الطبيعية.",
      "العمر: بعد سن الثلاثين يقل معدل الأيض تدريجيًا.",
      "بنية الجسم: صاحب الهيكل العريض يزن طبيعيًا أكثر من صاحب الهيكل النحيف.",
      "النشاط البدني: الرياضي قد يكون «زائد الوزن» بمؤشر BMI لكن نسبة الدهون عنده منخفضة جدًا.",
    ],
    callout1: "💡 خلاصة سريعة: لا تبحث عن رقم واحد. ابحث عن نطاق يكون فيه وزنك صحيًا، واعتبر نفسك ناجحًا إذا كنت داخل هذا النطاق.",
    h2_2: "الطريقة الأولى: مؤشر كتلة الجسم (BMI)",
    h2_2_p: "هذه أشهر طريقة وأكثرها استخدامًا في العالم، وتعتمدها منظمة الصحة العالمية. المعادلة بسيطة:",
    bmiFormula: "BMI = الوزن (كجم) ÷ (الطول بالمتر)²",
    h2_2_ex: "مثال عملي:",
    h2_2_ex_p: "لنفترض أن شخصًا وزنه 78 كجم وطوله 1.72 م. الخطوة الأولى: نربّع الطول → 1.72 × 1.72 = 2.9584. الخطوة الثانية: نقسم الوزن على النتيجة → 78 ÷ 2.9584 = 26.4. هذا يعني أنه في فئة «زيادة الوزن» قليلًا.",
    h2_2_read: "كيف تقرأ نتيجة BMI؟",
    bmiTable: {
      headers: ["النطاق", "التصنيف"],
      rows: [
        ["أقل من 18.5", "نحافة"],
        ["18.5 – 24.9", "وزن طبيعي ✅"],
        ["25 – 29.9", "زيادة في الوزن"],
        ["30 – 34.9", "سمنة درجة أولى"],
        ["35 – 39.9", "سمنة درجة ثانية"],
        ["40 أو أكثر", "سمنة مفرطة"],
      ],
    },
    h2_2_end: "مع ذلك، مؤشر كتلة الجسم له عيوب معروفة. هو لا يفرّق بين العضلات والدهون. لاعب كمال أجسام طوله 175 سم ووزنه 90 كجم سيظهر في فئة «سمنة»، بينما نسبة الدهون عنده 8% فقط. لهذا لا تعتمد عليه وحده.",
    h2_3: "الطريقة الثانية: معادلة ديفين (Devine)",
    h2_3_p: "طُوّرت هذه المعادلة عام 1974 لاستخدامها في حساب جرعات الأدوية، لأنها تعطي وزنًا مثاليًا أدق من BMI. لا تزال معتمدة في المراجع الطبية حتى اليوم.",
    devine_m: "للرجال: 50 كجم + 0.9 × (الطول بالسنتيمتر − 152)",
    devine_f: "للنساء: 45.5 كجم + 0.9 × (الطول بالسنتيمتر − 152)",
    h2_3_ex: "مثال محسوب:",
    h2_3_ex1: "رجل طوله 178 سم → 50 + 0.9 × (178 − 152) = 50 + 0.9 × 26 = 50 + 23.4 = 73.4 كجم.",
    h2_3_ex2: "امرأة طولها 165 سم → 45.5 + 0.9 × (165 − 152) = 45.5 + 11.7 = 57.2 كجم.",
    h2_4: "جداول الوزن المثالي حسب الطول",
    h2_4_p: "إذا كنت تبحث عن مرجع سريع، هذا جدول مبني على مؤشر كتلة الجسم الصحي (18.5 إلى 24.9). الأرقام تقريبية وليست بديلًا عن استشارة مختص.",
    h2_4_male: "الوزن المثالي للرجال",
    h2_4_female: "الوزن المثالي للنساء",
    maleTable: {
      headers: ["الطول", "نطاق الوزن الصحي"],
      rows: [
        ["155 سم", "44 – 60 كجم"], ["160 سم", "47 – 64 كجم"], ["165 سم", "50 – 68 كجم"],
        ["170 سم", "53 – 72 كجم"], ["175 سم", "57 – 76 كجم"], ["180 سم", "60 – 81 كجم"],
        ["185 سم", "63 – 85 كجم"], ["190 سم", "67 – 90 كجم"],
      ],
    },
    femaleTable: {
      headers: ["الطول", "نطاق الوزن الصحي"],
      rows: [
        ["150 سم", "42 – 56 كجم"], ["155 سم", "44 – 60 كجم"], ["160 سم", "47 – 64 كجم"],
        ["165 سم", "50 – 68 كجم"], ["170 سم", "53 – 72 كجم"], ["175 سم", "57 – 76 كجم"],
        ["180 سم", "60 – 81 كجم"],
      ],
    },
    h2_4_end: "لاحظ أن الفرق بين الرجل والمرأة صغير في الجداول العامة، لكن المعادلات الطبية تعطي فروقًا أكبر قليلًا بسبب اختلاف تركيب الجسم.",
    h2_5: "كيف يؤثر العمر على وزنك المثالي؟",
    h2_5_p: "هذا سؤال يخطئ فيه كثيرون. الحقيقة أن نطاق الوزن الصحي للشخص البالغ يبقى ثابتًا تقريبًا بعد سن العشرين. ما يتغير مع العمر هو مكونات الجسم:",
    h2_5_li: [
      "بعد سن الثلاثين، تبدأ الكتلة العضلية بالانخفاض تدريجيًا بنسبة تصل إلى 3-5% كل عقد.",
      "معدل الأيض الأساسي (BMR) ينخفض، مما يعني أنك تحتاج سعرات أقل للحفاظ على نفس الوزن.",
      "الدهون تميل للتراكم في منطقة البطن بشكل أكبر، وهذا مؤشر خطر حتى لو كان BMI طبيعيًا.",
    ],
    h2_5_p2: "لهذا السبب، شخص عمره 25 سنة ووزنه 75 كجم وطوله 175 سم قد يكون بصحة ممتازة، بينما شخص آخر بنفس المواصفات وعمره 55 سنة قد يكون معرضًا لمشاكل أيضية إذا كانت نسبة دهونه أعلى.",
    h2_5_kids: "ملاحظة حول الأطفال والمراهقين",
    h2_5_kids_p: "الأطفال والمراهقون لا تنطبق عليهم هذه الجداول. لهم جداول نمو خاصة تعتمد على النسب المئوية (Percentiles) حسب العمر والجنس. لا تحاول تطبيق معادلات البالغين على طفل، فقد تعطي نتائج مضللة.",
    h2_6: "أخطاء شائعة عند حساب الوزن المثالي",
    h2_6_li: [
      "الاعتماد على الوزن فقط: الميزان لا يفرّق بين العضلة والدهون والماء. شخصان بنفس الوزن قد يكونان في حالتين صحيتين مختلفتين تمامًا.",
      "قياس الوزن في أوقات مختلفة: الوزن يتغير خلال اليوم بمقدار 1-2 كجم. الأفضل أن تزنه صباحًا بعد الاستيقاظ وقبل الأكل.",
      "مقارنة نفسك بالآخرين: صديقك الذي يزن أقل منك ليس بالضرورة أصح منك.",
      "تجاهل محيط الخصر: دهون البطن مؤشر خطر مستقل عن الوزن. الرجال فوق 102 سم والنساء فوق 88 سم في خطر متزايد.",
      "الاعتماد على BMI للرياضيين: كما قلنا، اللاعبون ذوو العضلات الكبيرة قد يظهرون في فئة «زيادة» بشكل خاطئ.",
    ],
    h2_7: "خطوات عملية للوصول إلى وزنك المثالي",
    h2_7_p: "معرفة وزنك المثالي هو الخطوة الأولى فقط. الخطوة الأصعب هي الوصول إليه والحفاظ عليه. هذه نصائح مثبتة علميًا:",
    h2_7_li: [
      "لا تحرم نفسك: الأنظمة القاسية تفشل على المدى الطويل. الأفضل خسارة 0.5 إلى 1 كجم أسبوعيًا.",
      "زد البروتين: 1.2 إلى 1.6 جرام لكل كجم من وزنك يوميًا، يساعد على حفظ العضلات أثناء فقدان الوزن.",
      "لا تهمل القوة: تمارين المقاومة مرتين أسبوعيًا تحافظ على العضلات وترفع معدل الأيض.",
      "نم جيدًا: قلة النوم ترفع هرمون الجوع (Ghrelin) وتخفض هرمون الشبع (Leptin).",
      "اشرب ماء كافيًا: 2 إلى 3 لترات يوميًا حسب نشاطك والطقس.",
      "تابع تقدمك شهريًا: لا تزن نفسك كل يوم، فالنتائج اليومية مضللة.",
    ],
    calloutWarn: "⚠️ تنبيه مهم: إذا كنت تعاني من نقص أو زيادة كبيرة في الوزن، لا تعتمد على الحاسبات فقط. راجع طبيبًا أو أخصائي تغذية لتقييم شامل يشمل تحاليل الدم وحالتك الصحية العامة.",
    h2_faq: "أسئلة شائعة",
    faqs: [
      { q: "كيف أحسب وزني المثالي بدون حاسبة؟", a: "استخدم معادلة مؤشر كتلة الجسم: اقسم وزنك بالكيلوجرام على مربع طولك بالمتر. إذا كانت النتيجة بين 18.5 و24.9 فأنت في النطاق الصحي. مثال: وزن 70 كجم، طول 1.72 م → 70 ÷ 2.9584 = 23.7 (طبيعي)." },
      { q: "هل الوزن المثالي يختلف بين الرجل والمرأة؟", a: "نعم، بفارق بسيط. النساء لديهن نسبة دهون طبيعية أعلى قليلًا، ومعادلات مثل Devine تعطي المرأة وزنًا أقل بحوالي 4-5 كجم من الرجل عند نفس الطول. الفرق ناتج عن اختلاف تركيبة الجسم والعضلات." },
      { q: "ما هو الوزن المثالي للطول 170 للنساء؟", a: "بناءً على مؤشر كتلة الجسم الصحي، يتراوح النطاق بين 53 و72 كجم. لكن النطاق الأقرب للواقع لمعظم النساء عند هذا الطول هو 58 إلى 70 كجم، حسب العمر وبنية الجسم." },
      { q: "ما هو الوزن المثالي للطول 180 للرجال؟", a: "بين 60 و81 كجم حسب مؤشر كتلة الجسم. معادلة ديفين تعطي 75.4 كجم كرقم مرجعي. لكن تذكّر أن هذا نطاق وليس رقمًا ثابتًا." },
      { q: "هل مؤشر كتلة الجسم كافٍ وحده؟", a: "لا. مؤشر كتلة الجسم مؤشر مبدئي فقط، ولا يقيس نسبة الدهون ولا توزيعها. الأفضل دمجه مع قياس محيط الخصر ونسبة الدهون في الجسم للحصول على صورة أشمل." },
      { q: "هل يمكن أن أكون في وزن طبيعي ومع ذلك غير صحي؟", a: "نعم، هذه حالة تعرف بـ «السمنة النحيفة» (Normal Weight Obesity). شخص وزنه طبيعي لكن نسبة الدهون عنده مرتفعة والعضلات قليلة. لهذا يجب النظر إلى أكثر من مقياس." },
      { q: "كم مرة أزن نفسي؟", a: "مرة واحدة أسبوعيًا في نفس الوقت والظروف كافية. يوميًا قد يسبب قلقًا غير ضروري بسبب التغيرات الطبيعية في الماء والطعام." },
    ],
    h2_concl: "الخلاصة",
    concl_p1: "حساب الوزن المثالي حسب الطول والعمر ليس عملية معقدة، لكنه يحتاج فهم أن النتيجة هي نطاق وليس رقمًا واحدًا. مؤشر كتلة الجسم بداية جيدة، ومعادلات مثل Devine وRobinson تعطي دقة أعلى. الأهم من الرقم نفسه هو نمط حياتك: غذاء متوازن، نشاط بدني منتظم، ونوم كافٍ.",
    concl_p2_pre: "إذا أردت نتيجة سريعة بدل الحساب اليدوي، استخدم",
    concl_p2_link: "حاسبة الوزن المثالي",
    concl_p2_post: "التي تعطيك النطاق بأربع معادلات في ثوانٍ.",
    medWarn: "تنبيه طبي:",
    medWarnText: "هذا المقال لأغراض تعليمية فقط، ولا يُغني عن استشارة طبيب أو أخصائي تغذية. لا تبدأ أي نظام غذائي أو تمريني دون مراجعة مختص.",
    author: "✍️ كُتب ونُشر على",
    authorUpdated: "— آخر تحديث: سبتمبر 2026.",
  },
  en: {
    dir: "ltr",
    badge: "📚 Complete Guide",
    title: "Ideal Weight by Height and Age: A Complete Guide with Charts",
    introBox: "A question that comes up often: \"Is my weight ideal for my height and age?\" The problem is that most people look for a single number, while medicine says it's all about a healthy range. In this guide, we explain the correct way to calculate it, with charts, formulas, and common mistakes to avoid.",
    p1: "Before diving into the numbers, let's agree on something important: ideal weight is not a specific weight in grams — it's a range within which your body can function at its best. Two people of the same height may have completely different ideal weights due to age, muscle mass, and bone structure.",
    p2: "For this exact reason, relying on a single number from an app or website can mislead you. It's better to understand the basics, then use a tool that gives you a realistic range. Read on.",
    tryCalc: "⚖️ Try the Interactive Ideal Weight Calculator ↑",
    h2_1: "Why There Is No Single \"Ideal Weight\" for Everyone",
    h2_1_p: "If you asked ten doctors about the ideal weight for someone who is 170 cm tall, you'd get ten slightly different numbers. The reason is that each medical formula relies on different variables:",
    h2_1_li: [
      "Height: the primary factor in almost every formula.",
      "Sex: men and women differ in natural muscle and fat ratios.",
      "Age: after thirty, metabolism gradually slows down.",
      "Body frame: a broad-framed person naturally weighs more than a narrow-framed one.",
      "Physical activity: an athlete may be \"overweight\" by BMI yet have very low body fat.",
    ],
    callout1: "💡 Quick takeaway: don't search for a single number. Look for a range where your weight is healthy, and consider yourself successful if you're within it.",
    h2_2: "Method 1: Body Mass Index (BMI)",
    h2_2_p: "This is the most popular and widely used method in the world, adopted by the World Health Organization. The formula is simple:",
    bmiFormula: "BMI = Weight (kg) ÷ (Height in meters)²",
    h2_2_ex: "Practical example:",
    h2_2_ex_p: "Suppose someone weighs 78 kg and is 1.72 m tall. Step one: square the height → 1.72 × 1.72 = 2.9584. Step two: divide weight by the result → 78 ÷ 2.9584 = 26.4. This means they fall in the \"overweight\" category slightly.",
    h2_2_read: "How to read your BMI result?",
    bmiTable: {
      headers: ["Range", "Classification"],
      rows: [
        ["Below 18.5", "Underweight"],
        ["18.5 – 24.9", "Normal weight ✅"],
        ["25 – 29.9", "Overweight"],
        ["30 – 34.9", "Obesity (Class I)"],
        ["35 – 39.9", "Obesity (Class II)"],
        ["40 or above", "Extreme obesity"],
      ],
    },
    h2_2_end: "However, BMI has well-known limitations. It doesn't distinguish between muscle and fat. A bodybuilder who is 175 cm tall and weighs 90 kg would appear in the \"obese\" category, while their body fat is only 8%. That's why you shouldn't rely on it alone.",
    h2_3: "Method 2: The Devine Formula",
    h2_3_p: "This formula was developed in 1974 for calculating medication dosages, as it gives a more accurate ideal weight than BMI. It's still referenced in medical literature today.",
    devine_m: "For men: 50 kg + 0.9 × (height in cm − 152)",
    devine_f: "For women: 45.5 kg + 0.9 × (height in cm − 152)",
    h2_3_ex: "Calculated example:",
    h2_3_ex1: "A man who is 178 cm → 50 + 0.9 × (178 − 152) = 50 + 0.9 × 26 = 50 + 23.4 = 73.4 kg.",
    h2_3_ex2: "A woman who is 165 cm → 45.5 + 0.9 × (165 − 152) = 45.5 + 11.7 = 57.2 kg.",
    h2_4: "Ideal Weight Charts by Height",
    h2_4_p: "If you're looking for a quick reference, here's a table based on the healthy BMI range (18.5 to 24.9). The numbers are approximate and not a substitute for consulting a specialist.",
    h2_4_male: "Ideal Weight for Men",
    h2_4_female: "Ideal Weight for Women",
    maleTable: {
      headers: ["Height", "Healthy Weight Range"],
      rows: [
        ["155 cm", "44 – 60 kg"], ["160 cm", "47 – 64 kg"], ["165 cm", "50 – 68 kg"],
        ["170 cm", "53 – 72 kg"], ["175 cm", "57 – 76 kg"], ["180 cm", "60 – 81 kg"],
        ["185 cm", "63 – 85 kg"], ["190 cm", "67 – 90 kg"],
      ],
    },
    femaleTable: {
      headers: ["Height", "Healthy Weight Range"],
      rows: [
        ["150 cm", "42 – 56 kg"], ["155 cm", "44 – 60 kg"], ["160 cm", "47 – 64 kg"],
        ["165 cm", "50 – 68 kg"], ["170 cm", "53 – 72 kg"], ["175 cm", "57 – 76 kg"],
        ["180 cm", "60 – 81 kg"],
      ],
    },
    h2_4_end: "Note that the difference between men and women is small in general charts, but medical formulas give slightly larger differences due to differences in body composition.",
    h2_5: "How Does Age Affect Your Ideal Weight?",
    h2_5_p: "This is a question many get wrong. The truth is that the healthy weight range for adults remains roughly constant after age twenty. What changes with age is your body composition:",
    h2_5_li: [
      "After thirty, muscle mass gradually decreases by up to 3-5% per decade.",
      "Basal Metabolic Rate (BMR) drops, meaning you need fewer calories to maintain the same weight.",
      "Fat tends to accumulate more around the abdomen, which is a risk factor even with a normal BMI.",
    ],
    h2_5_p2: "For this reason, a 25-year-old weighing 75 kg at 175 cm might be in excellent health, while another person with the same stats at age 55 could be at risk of metabolic issues if their body fat percentage is higher.",
    h2_5_kids: "A note on children and teenagers",
    h2_5_kids_p: "Children and teenagers don't fall under these charts. They have special growth charts based on percentiles according to age and sex. Don't try to apply adult formulas to a child — they can give misleading results.",
    h2_6: "Common Mistakes When Calculating Ideal Weight",
    h2_6_li: [
      "Relying on weight alone: the scale doesn't distinguish between muscle, fat, and water. Two people of the same weight could be in completely different health states.",
      "Weighing at different times: weight fluctuates by 1-2 kg during the day. It's best to weigh yourself in the morning after waking up and before eating.",
      "Comparing yourself to others: your friend who weighs less than you isn't necessarily healthier.",
      "Ignoring waist circumference: belly fat is an independent risk factor. Men above 102 cm and women above 88 cm are at increased risk.",
      "Relying on BMI for athletes: as mentioned, athletes with large muscle mass may incorrectly appear in the \"overweight\" category.",
    ],
    h2_7: "Practical Steps to Reach Your Ideal Weight",
    h2_7_p: "Knowing your ideal weight is only the first step. The harder part is reaching it and maintaining it. Here are scientifically-proven tips:",
    h2_7_li: [
      "Don't starve yourself: crash diets fail in the long run. Aim to lose 0.5 to 1 kg per week.",
      "Increase protein: 1.2 to 1.6 grams per kg of body weight daily helps preserve muscle during weight loss.",
      "Don't neglect strength: resistance training twice a week maintains muscle and boosts metabolism.",
      "Sleep well: lack of sleep raises the hunger hormone (Ghrelin) and lowers the satiety hormone (Leptin).",
      "Drink enough water: 2 to 3 liters daily depending on your activity and weather.",
      "Track monthly: don't weigh yourself every day, as daily fluctuations are misleading.",
    ],
    calloutWarn: "⚠️ Important warning: if you have a significant weight deficiency or excess, don't rely on calculators alone. See a doctor or dietitian for a comprehensive assessment including blood tests and your overall health.",
    h2_faq: "Frequently Asked Questions",
    faqs: [
      { q: "How do I calculate my ideal weight without a calculator?", a: "Use the BMI formula: divide your weight in kilograms by your height in meters squared. If the result is between 18.5 and 24.9, you're in the healthy range. Example: weight 70 kg, height 1.72 m → 70 ÷ 2.9584 = 23.7 (normal)." },
      { q: "Does ideal weight differ between men and women?", a: "Yes, slightly. Women naturally have a slightly higher body fat percentage, and formulas like Devine give women about 4-5 kg less than men at the same height. The difference comes from differences in body composition and muscle mass." },
      { q: "What is the ideal weight for a 170 cm woman?", a: "Based on the healthy BMI range, the range is between 53 and 72 kg. However, the most realistic range for most women at this height is 58 to 70 kg, depending on age and body frame." },
      { q: "What is the ideal weight for a 180 cm man?", a: "Between 60 and 81 kg based on BMI. The Devine formula gives 75.4 kg as a reference number. But remember this is a range, not a fixed number." },
      { q: "Is BMI enough on its own?", a: "No. BMI is only a preliminary indicator — it doesn't measure body fat percentage or distribution. It's best to combine it with waist circumference and body fat percentage for a fuller picture." },
      { q: "Can I be at a normal weight and still be unhealthy?", a: "Yes, this is known as \"normal weight obesity.\" A person may have a normal weight but a high body fat percentage and low muscle mass. That's why you should look at more than one metric." },
      { q: "How often should I weigh myself?", a: "Once a week at the same time and under the same conditions is enough. Daily weighing may cause unnecessary anxiety due to natural fluctuations in water and food." },
    ],
    h2_concl: "Conclusion",
    concl_p1: "Calculating your ideal weight by height and age isn't complicated, but it requires understanding that the result is a range, not a single number. BMI is a good starting point, and formulas like Devine and Robinson give higher accuracy. More important than the number itself is your lifestyle: balanced nutrition, regular physical activity, and adequate sleep.",
    concl_p2_pre: "If you want a quick result instead of manual calculation, use the",
    concl_p2_link: "Ideal Weight Calculator",
    concl_p2_post: "which gives you the range using four formulas in seconds.",
    medWarn: "Medical disclaimer:",
    medWarnText: "This article is for educational purposes only and does not replace consulting a doctor or dietitian. Do not start any diet or exercise program without consulting a specialist.",
    author: "✍️ Written and published on",
    authorUpdated: "— Last updated: September 2026.",
  },
};

export default function IdealWeightArticle() {
  const { lang } = useI18n();
  const isAr = lang === "ar";
  const c = isAr ? CONTENT.ar : CONTENT.en;
  const rtl = isAr;

  return (
    <article id="article" dir={c.dir} className="prose-content max-w-none">

      {/* ====== فاصل بصري أنيق ====== */}
      <div className="my-8 flex items-center gap-3">
        <div className={`h-px flex-1 ${rtl ? "bg-gradient-to-l" : "bg-gradient-to-r"} from-[#6D28D9] to-transparent`} />
        <span className="text-xs font-bold text-[#6D28D9] dark:text-[#FBBF24] whitespace-nowrap">{c.badge}</span>
        <div className={`h-px flex-1 ${rtl ? "bg-gradient-to-r" : "bg-gradient-to-l"} from-[#F59E0B] to-transparent`} />
      </div>

      <h2 className="text-2xl font-bold text-[#0f766e] dark:text-[#FBBF24] mb-4 border-b border-border pb-2">
        {c.title}
      </h2>

      {/* ====== مقدمة ====== */}
      <div className="bg-[#F5F3FF] dark:bg-[#2D2A5A] border-l-4 border-[#6D28D9] rounded-lg p-4 mb-6 text-base text-[#374151] dark:text-[#D6D2EE]">
        {c.introBox}
      </div>

      <p className="text-sm text-[#374151] dark:text-[#D6D2EE] leading-relaxed mb-3">
        {c.p1}
      </p>

      <p className="text-sm text-[#374151] dark:text-[#D6D2EE] leading-relaxed mb-3">
        {c.p2}
      </p>

      {/* ====== رابط للأداة ====== */}
      <a href="#calculator" className="block text-center bg-gradient-to-r from-[#6D28D9] to-[#F59E0B] text-white font-bold py-3 px-4 rounded-xl my-6 hover:opacity-90 transition-opacity">
        {c.tryCalc}
      </a>

      {/* ====== H2 الأول ====== */}
      <h3 className="text-xl font-bold text-[#0f766e] dark:text-[#FBBF24] mt-8 mb-3 border-b border-border pb-1">
        {c.h2_1}
      </h3>

      <p className="text-sm text-[#374151] dark:text-[#D6D2EE] leading-relaxed mb-3">
        {c.h2_1_p}
      </p>

      <ul className={`list-disc ${rtl ? "pr-5" : "pl-5"} mb-4 space-y-1.5 text-sm text-[#374151] dark:text-[#D6D2EE]`}>
        {c.h2_1_li.map((item, i) => (
          <li key={i} dangerouslySetInnerHTML={{ __html: `<strong>${item.split(":")[0]}:</strong> ${item.split(":").slice(1).join(":")}` }} />
        ))}
      </ul>

      <Callout rtl={rtl}>
        {c.callout1}
      </Callout>

      {/* ====== H2 الثاني ====== */}
      <h3 className="text-xl font-bold text-[#0f766e] dark:text-[#FBBF24] mt-8 mb-3 border-b border-border pb-1">
        {c.h2_2}
      </h3>

      <p className="text-sm text-[#374151] dark:text-[#D6D2EE] leading-relaxed mb-3">
        {c.h2_2_p}
      </p>

      <p className="text-center text-lg bg-[#F5F3FF] dark:bg-[#2D2A5A] p-3 rounded-lg font-bold text-[#6D28D9] dark:text-[#FBBF24] mb-4">
        {c.bmiFormula}
      </p>

      <h4 className="text-base font-bold text-[#134e4a] dark:text-[#FBBF24] mt-5 mb-2">{c.h2_2_ex}</h4>
      <p className="text-sm text-[#374151] dark:text-[#D6D2EE] leading-relaxed mb-3">
        {c.h2_2_ex_p}
      </p>

      <h4 className="text-base font-bold text-[#134e4a] dark:text-[#FBBF24] mt-5 mb-2">{c.h2_2_read}</h4>

      <ArticleTable headers={c.bmiTable.headers} rows={c.bmiTable.rows} rtl={rtl} />

      <p className="text-sm text-[#374151] dark:text-[#D6D2EE] leading-relaxed mb-3">
        {c.h2_2_end}
      </p>

      {/* ====== H2 الثالث ====== */}
      <h3 className="text-xl font-bold text-[#0f766e] dark:text-[#FBBF24] mt-8 mb-3 border-b border-border pb-1">
        {c.h2_3}
      </h3>

      <p className="text-sm text-[#374151] dark:text-[#D6D2EE] leading-relaxed mb-3">
        {c.h2_3_p}
      </p>

      <p className="text-sm text-[#374151] dark:text-[#D6D2EE] leading-relaxed mb-2">{c.devine_m}</p>
      <p className="text-sm text-[#374151] dark:text-[#D6D2EE] leading-relaxed mb-3">{c.devine_f}</p>

      <h4 className="text-base font-bold text-[#134e4a] dark:text-[#FBBF24] mt-5 mb-2">{c.h2_3_ex}</h4>
      <p className="text-sm text-[#374151] dark:text-[#D6D2EE] leading-relaxed mb-2">
        {c.h2_3_ex1}
      </p>
      <p className="text-sm text-[#374151] dark:text-[#D6D2EE] leading-relaxed mb-3">
        {c.h2_3_ex2}
      </p>

      {/* ====== H2 الرابع: الجداول ====== */}
      <h3 className="text-xl font-bold text-[#0f766e] dark:text-[#FBBF24] mt-8 mb-3 border-b border-border pb-1">
        {c.h2_4}
      </h3>

      <p className="text-sm text-[#374151] dark:text-[#D6D2EE] leading-relaxed mb-4">
        {c.h2_4_p}
      </p>

      <h4 className="text-base font-bold text-[#134e4a] dark:text-[#FBBF24] mt-5 mb-2">{c.h2_4_male}</h4>
      <ArticleTable headers={c.maleTable.headers} rows={c.maleTable.rows} rtl={rtl} />

      <h4 className="text-base font-bold text-[#134e4a] dark:text-[#FBBF24] mt-5 mb-2">{c.h2_4_female}</h4>
      <ArticleTable headers={c.femaleTable.headers} rows={c.femaleTable.rows} rtl={rtl} />

      <p className="text-sm text-[#374151] dark:text-[#D6D2EE] leading-relaxed mb-3">
        {c.h2_4_end}
      </p>

      {/* ====== رابط الأداة ====== */}
      <a href="#calculator" className="block text-center bg-gradient-to-r from-[#6D28D9] to-[#F59E0B] text-white font-bold py-3 px-4 rounded-xl my-6 hover:opacity-90 transition-opacity">
        {c.tryCalc}
      </a>

      {/* ====== H2 الخامس: العمر ====== */}
      <h3 className="text-xl font-bold text-[#0f766e] dark:text-[#FBBF24] mt-8 mb-3 border-b border-border pb-1">
        {c.h2_5}
      </h3>

      <p className="text-sm text-[#374151] dark:text-[#D6D2EE] leading-relaxed mb-3">
        {c.h2_5_p}
      </p>

      <ul className={`list-disc ${rtl ? "pr-5" : "pl-5"} mb-4 space-y-1.5 text-sm text-[#374151] dark:text-[#D6D2EE]`}>
        {c.h2_5_li.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>

      <p className="text-sm text-[#374151] dark:text-[#D6D2EE] leading-relaxed mb-3">
        {c.h2_5_p2}
      </p>

      <h4 className="text-base font-bold text-[#134e4a] dark:text-[#FBBF24] mt-5 mb-2">{c.h2_5_kids}</h4>
      <p className="text-sm text-[#374151] dark:text-[#D6D2EE] leading-relaxed mb-3">
        {c.h2_5_kids_p}
      </p>

      {/* ====== H2 السادس: أخطاء شائعة ====== */}
      <h3 className="text-xl font-bold text-[#0f766e] dark:text-[#FBBF24] mt-8 mb-3 border-b border-border pb-1">
        {c.h2_6}
      </h3>

      <ol className={`list-decimal ${rtl ? "pr-5" : "pl-5"} mb-4 space-y-2 text-sm text-[#374151] dark:text-[#D6D2EE]`}>
        {c.h2_6_li.map((item, i) => (
          <li key={i} dangerouslySetInnerHTML={{ __html: `<strong>${item.split(":")[0]}:</strong> ${item.split(":").slice(1).join(":")}` }} />
        ))}
      </ol>

      {/* ====== H2 السابع: نصائح ====== */}
      <h3 className="text-xl font-bold text-[#0f766e] dark:text-[#FBBF24] mt-8 mb-3 border-b border-border pb-1">
        {c.h2_7}
      </h3>

      <p className="text-sm text-[#374151] dark:text-[#D6D2EE] leading-relaxed mb-3">
        {c.h2_7_p}
      </p>

      <ul className={`list-disc ${rtl ? "pr-5" : "pl-5"} mb-4 space-y-1.5 text-sm text-[#374151] dark:text-[#D6D2EE]`}>
        {c.h2_7_li.map((item, i) => (
          <li key={i} dangerouslySetInnerHTML={{ __html: `<strong>${item.split(":")[0]}:</strong> ${item.split(":").slice(1).join(":")}` }} />
        ))}
      </ul>

      <Callout type="warning" rtl={rtl}>
        {c.calloutWarn}
      </Callout>

      {/* ====== H2 الثامن: FAQ ====== */}
      <h3 className="text-xl font-bold text-[#0f766e] dark:text-[#FBBF24] mt-8 mb-3 border-b border-border pb-1">
        {c.h2_faq}
      </h3>

      <div className="space-y-2">
        {c.faqs.map((f, i) => (
          <FaqItem key={i} question={f.q} answer={f.a} rtl={rtl} />
        ))}
      </div>

      {/* ====== الخلاصة ====== */}
      <h3 className="text-xl font-bold text-[#0f766e] dark:text-[#FBBF24] mt-8 mb-3 border-b border-border pb-1">
        {c.h2_concl}
      </h3>

      <p className="text-sm text-[#374151] dark:text-[#D6D2EE] leading-relaxed mb-3">
        {c.concl_p1}
      </p>

      <p className="text-sm text-[#374151] dark:text-[#D6D2EE] leading-relaxed mb-3">
        {c.concl_p2_pre} <a href="#calculator" className="text-[#6D28D9] dark:text-[#FBBF24] underline">{c.concl_p2_link}</a> {c.concl_p2_post}
      </p>

      {/* ====== تنبيه طبي ====== */}
      <div className={`bg-[#F9FAFB] dark:bg-[#1E1B4B] ${rtl ? "border-r-4" : "border-l-4"} border-muted-foreground/40 rounded-lg p-4 mt-6 text-sm text-muted-foreground`}>
        <strong>{c.medWarn}</strong> {c.medWarnText}
      </div>

      {/* ====== صندوق الكاتب ====== */}
      <div className="border-t border-border mt-8 pt-4 text-xs text-muted-foreground">
        <p>{c.author} <Link to="/" className="text-[#6D28D9] dark:text-[#FBBF24] hover:underline">iyadel.com</Link> {c.authorUpdated}</p>
      </div>

    </article>
  );
}