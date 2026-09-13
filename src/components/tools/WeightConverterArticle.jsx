import { useI18n } from "@/lib/i18n";
import { Weight, AlertTriangle, Lightbulb } from "lucide-react";

const CONTENT = {
  en: {
    intro:
      "The first time I hit a weight conversion problem was in the kitchen. I was following a foreign recipe that called for 8 ounces of flour, and my kitchen only speaks grams. I searched Google, read conflicting numbers, and baked the cake — but it came out a bit dry. Later I realized the problem wasn't the oven; it was the ounce. I'd converted it wrong and used less flour than I should have.",
    p1: "This story isn't unusual. Weight conversion is something we deal with every day without noticing — in the kitchen, at the gym, when shipping packages, and when weighing luggage at the airport. Most people handle these conversions by feel, getting it right sometimes and wrong quite often.",
    h2_why: "Why is converting between weight units so hard?",
    p2: "The first reason is that the world runs on two parallel systems. The metric system (grams, kilograms, tonnes) is built on multiples of ten — logical and easy. The imperial system (pounds, ounces, stones) is built on relatively arbitrary numbers: 16 ounces in a pound, 14 pounds in a stone, 2,000 pounds in a US ton. This difference creates real confusion.",
    p3: "The second reason is that 'weight' itself is a misleading word. In everyday use, we say 'weight' when we actually mean 'mass.' Mass is a constant that doesn't change with location, while weight is the force of gravity and varies by where you are. But we tolerate this mix-up and say 'I weigh 70 kilos' even on the Moon. This linguistic tolerance seeps into scientific understanding.",
    callout: "Tip: If you're writing a scientific or engineering report, distinguish clearly between mass (kg) and weight (N, newtons). In everyday life, there's no need to complicate it.",
    h2_factors: "Essential conversion factors to remember",
    p4: "You don't need to memorize dozens of numbers. Five or six factors cover 90% of daily conversions:",
    th1: ["Conversion", "Factor", "Common Use"],
    table1: [
      ["Kilograms → Pounds", "× 2.20462", "Body weight in the US and UK"],
      ["Pounds → Kilograms", "× 0.453592", "The reverse"],
      ["Grams → Ounces", "÷ 28.3495", "Cooking recipes"],
      ["Ounces → Grams", "× 28.3495", "The reverse"],
      ["Stones → Kilograms", "× 6.35029", "Body weight in the UK"],
      ["Metric Ton → Kilograms", "× 1000", "Shipping and industry"],
    ],
    p5: "Notice that the factors are precise to six decimal places. Some sites use 2.2 instead of 2.20462 — it looks like a small difference, but it accumulates. On a 100 kg weight, the gap becomes 462 grams. Not huge in daily life, but significant in precise contexts.",
    h2_mistakes: "Mistakes I've seen repeated often",
    p6: "Mistake one: using an approximate factor in a context that needs precision. In the kitchen, the difference between 2.2 and 2.20462 may be acceptable. But in shipping or manufacturing, the gap accumulates and matters. Better to use the tool or the full factor.",
    p7: "Mistake two: confusing regular ounces with fluid ounces. A regular ounce (oz) is a unit of mass = 28.3495 grams. A fluid ounce (fl oz) is a unit of volume = 29.5735 milliliters. The numbers look close, but it's disastrous in recipes. One fluid ounce of a liquid is not the same weight as one dry ounce.",
    p8: "Mistake three: forgetting that a 'ton' in the United States is not the same as a 'ton' in the UK. The US short ton = 907.18 kg. The British long ton = 1,016.05 kg. The metric tonne = 1,000 kg exactly. The difference between US and metric is nearly 10% — a massive amount in shipping.",
    p9: "Mistake four: relying on memory for repeated conversions. Even if you know that 1 kg = 2.2 lb, you won't remember that 3.7 kg = 8.16 lb. Better to calculate it in a fraction of a second, without carrying any mental load.",
    h2_table2: "Comprehensive reference table",
    th2: ["Unit", "In Grams", "In Kilograms", "In Pounds"],
    table2: [
      ["1 milligram", "0.001", "0.000001", "0.0000022"],
      ["1 carat", "0.2", "0.0002", "0.00044"],
      ["1 gram", "1", "0.001", "0.002205"],
      ["1 ounce", "28.3495", "0.02835", "0.0625"],
      ["1 pound", "453.592", "0.453592", "1"],
      ["1 kilogram", "1,000", "1", "2.20462"],
      ["1 stone", "6,350.29", "6.35029", "14"],
      ["1 metric ton", "1,000,000", "1,000", "2,204.62"],
    ],
    p10: "This table is useful as a quick reference. But it only gives you the value of a single unit. If you want to know what 3.7 kilograms is in ounces, you'd need an additional calculation. That's why ready-made numbers are handy for everyday use, but instant calculation is more accurate and faster.",
    h2_details: "Small details you might miss",
    p11: "There's a difference between 'weight' and 'mass' in physics. Mass is constant, while weight depends on gravity. A person whose mass is 70 kg on Earth has the same mass on the Moon, but their actual weight (in newtons) becomes one-sixth. This distinction matters in engineering and physics, but it's unnecessary in daily life.",
    p12: "Another note: the 'ton' has three types. Metric (1,000 kg), US short (907.18 kg), and British imperial long (1,016.05 kg). When reading a shipping contract or trade agreement, always verify which ton is used, because the difference can exceed 100 kg per ton.",
    h2_faq: "Frequently asked questions",
    faqs: [
      { q: "How do I convert kilograms to pounds?", a: "Multiply the mass in kilograms by 2.20462. Example: 70 kg × 2.20462 = 154.32 lb. The exact factor is 2.20462262185, but six decimal places are sufficient for any practical use." },
      { q: "How many grams are in one ounce?", a: "One ounce = 28.3495 grams. A fluid ounce (volume) has a completely different value: 29.5735 milliliters. Always confirm which type of ounce is needed before converting." },
      { q: "What is a stone in kilograms?", a: "One stone = 14 pounds = 6.35029 kg. It's used in the UK and Ireland for measuring body weight. If you hear '12 stone,' that's about 76.2 kg." },
      { q: "What's the difference between a metric ton and a US ton?", a: "A metric ton (tonne) = 1,000 kg. A US short ton = 907.18 kg. A British imperial long ton = 1,016.05 kg. The difference between metric and US is nearly 10% — a large amount in shipping." },
      { q: "Can I use ready-made numbers without a calculator?", a: "Yes, for common conversions like kg to pounds or grams to ounces. But for unusual values or when high precision is needed, it's better to use a conversion tool that supports the full factors." },
      { q: "Why does the table include carats and milligrams?", a: "The carat is used in the gemstone and gold trade: 1 carat = 200 milligrams. The milligram is used for very small quantities, like precise recipe ingredients or light element weights. Both units show that conversions cover a wide range, from jewels to delicate items." },
    ],
    h2_final: "A final word",
    p13: "Weight conversion isn't a difficult skill, but it's a field where mistakes abound. The difference between 2.2 and 2.20462 seems trivial — until you reach a context that demands precision. And the ounce differs from the fluid ounce, and the US ton differs from the metric tonne. Small details make a big difference.",
    p14: "If I could give you one piece of advice, it's this: don't rely on instinct. Even if you know the factor, mistakes happen when applying it. Write down the key factors somewhere, or use a calculator when needed. The time you save on double-checking, you invest in something more important.",
    disclaimer: "All factors mentioned in this article are taken from recognized international standards (SI and the Imperial Standard). The article is suitable for everyday use in cooking, fitness, shipping, and travel. For very precise scientific applications, consult the official reference for your standard unit.",
    author: "Published on iyadel.com — last updated: January 2026.",
  },
  ar: {
    intro:
      "أول مرة واجهت فيها مشكلة تحويل الوزن كانت في مطبخ. كنت أتبع وصفة أجنبية تطلب 8 أونصات من الدقيق، ومطبخي لا يعرف إلا الغرامات. أخذت أبحث في جوجل، وقرأت أرقامًا متضاربة. في النهاية، خبزت الكيك، لكنه كان جافًا قليلًا. لاحقًا أدركت أن المشكلة لم تكن في الفرن، بل في الأونصة. حسبتها بالخطأ، وأضفت كمية أقل مما ينبغي.",
    p1: "هذه الحكاية ليست غريبة. تحويل الوزن شيء نتعامل معه كل يوم دون أن ندرك: في المطبخ، في صالة الرياضة، في شحن الطلبات، وفي حساب وزن الأمتعة في المطار. ومعظم الناس يتعاملون مع هذه التحويلات بالحدس، فيصيبون أحيانًا ويخطئون أحيانًا كثيرة.",
    h2_why: "لماذا التحويل بين وحدات الوزن صعب على الناس؟",
    p2: "السبب الأول أن العالم يعيش بنظامين متوازيين. النظام المتري (غرام، كيلوغرام، طن) مبني على مضاعفات العشرة، منطقي وسهل. النظام الإمبراطوري (باوند، أونصة، ستون) مبني على أرقام عشوائية نسبيًا: 16 أونصة في الباوند، 14 باوند في الستون، 2000 باوند في الطن الأمريكي. هذا الاختلاف يخلق ارتباكًا حقيقيًا.",
    p3: "السبب الثاني أن وحدة \"الوزن\" نفسها مُلبِسة. في الاستخدام اليومي، نقول \"وزن\" لما هو في الحقيقة \"كتلة\". الكتلة مقدار ثابت لا يتغير بتغير المكان، أما الوزن فهو قوة جذب الأرض، ويتغير حسب الموقع. لكننا نتسامح مع هذا الخلط، ونقول \"وزني 70 كيلو\" حتى على سطح القمر. هذا التسامح اللغوي ينعكس على الفهم العلمي.",
    callout: "نصيحة: إذا كنت تكتب تقريرًا علميًا أو هندسيًا، فرّق بوضوح بين الكتلة (kg) والوزن (N، نيوتن). في الحياة اليومية، لا داعي للتعقيد.",
    h2_factors: "المعاملات الأساسية التي يجب حفظها",
    p4: "لا تحتاج إلى حفظ عشرات الأرقام. خمسة أو ستة معاملات تكفي لتغطية 90% من التحويلات اليومية:",
    th1: ["التحويل", "المعامل", "الاستخدام الشائع"],
    table1: [
      ["كيلوغرام ← باوند", "× 2.20462", "وزن الجسم في أمريكا وبريطانيا"],
      ["باوند ← كيلوغرام", "× 0.453592", "العكس"],
      ["غرام ← أونصة", "÷ 28.3495", "وصفات الطبخ"],
      ["أونصة ← غرام", "× 28.3495", "العكس"],
      ["ستون ← كيلوغرام", "× 6.35029", "وزن الجسم في بريطانيا"],
      ["طن متري ← كيلوغرام", "× 1000", "الشحن والصناعة"],
    ],
    p5: "لاحظ أن المعاملات دقيقة إلى ست منازل عشرية. بعض المواقع تستخدم 2.2 بدل 2.20462، وهذا يبدو فرقًا صغيرًا، لكنه يتراكم. على وزن 100 كيلوغرام، الفرق يصبح 462 غرامًا. ليس ضخمًا في الحياة اليومية، لكنه مهم في السياقات الدقيقة.",
    h2_mistakes: "أخطاء رأيتها تتكرر كثيرًا",
    p6: "الخطأ الأول: استخدام معامل تقريبي في سياق يحتاج دقة. في المطبخ، الفرق بين 2.2 و2.20462 قد يكون مقبولًا. لكن في الشحن أو الصناعة، الفرق يتراكم ويصبح مهمًا. الأفضل استخدام الأداة أو المعامل الكامل.",
    p7: "الخطأ الثاني: الخلط بين الأونصة العادية والأونصة السائلة. الأونصة العادية (oz) وحدة كتلة = 28.3495 غرام. الأونصة السائلة (fl oz) وحدة حجم = 29.5735 ملليلتر. الفرق يبدو صغيرًا في الأرقام، لكنه كارثي في الوصفات. سائل بأونصة واحدة ليس نفس وزن أونصة واحدة.",
    p8: "الخطأ الثالث: نسيان أن \"الطن\" في الولايات المتحدة ليس نفس \"الطن\" في بريطانيا. الطن الأمريكي (Short Ton) = 907.18 كيلوغرام. الطن البريطاني (Long Ton) = 1016.05 كيلوغرام. الطن المتري = 1000 كيلوغرام بالضبط. الفرق بين الأمريكي والمتري يقارب 10%، وهذا مبلغ ضخم في الشحن.",
    p9: "الخطأ الرابع: الاعتماد على الذاكرة للتحويلات المتكررة. حتى لو كنت تعرف أن 1 كجم = 2.2 باوند، لن تتذكر أن 3.7 كجم = 8.16 باوند. الأفضل أن تحسبها في أجزاء من الثانية، دون أن تحمل أي عبء ذهني.",
    h2_table2: "جدول مرجعي شامل",
    th2: ["الوحدة", "بالغرام", "بالكيلوغرام", "بالباوند"],
    table2: [
      ["1 ملليغرام", "0.001", "0.000001", "0.0000022"],
      ["1 قيراط", "0.2", "0.0002", "0.00044"],
      ["1 غرام", "1", "0.001", "0.002205"],
      ["1 أونصة", "28.3495", "0.02835", "0.0625"],
      ["1 باوند", "453.592", "0.453592", "1"],
      ["1 كيلوغرام", "1000", "1", "2.20462"],
      ["1 ستون", "6350.29", "6.35029", "14"],
      ["1 طن متري", "1,000,000", "1000", "2204.62"],
    ],
    p10: "هذا الجدول مفيد كمرجع سريع. لكنه يعطيك قيم الوحدة الواحدة فقط. إذا أردت معرفة قيمة 3.7 كيلوغرام بالأونصة، ستحتاج إلى حساب إضافي. لهذا السبب، الأرقام الجاهزة مفيدة للاستخدام اليومي، لكن الحساب الفوري أدق وأسرع.",
    h2_details: "تفاصيل صغيرة قد تفوتك",
    p11: "هناك فرق بين \"الوزن\" و\"الكتلة\" في الفيزياء. الكتلة ثابتة، أما الوزن فيعتمد على الجاذبية. شخص كتلته 70 كيلوغرامًا على الأرض يزن نفس الكتلة على سطح القمر، لكن وزنه الفعلي (بالنيوتن) يصبح سدس ما هو عليه. هذا التفريق مهم في الهندسة والفيزياء، لكنه غير ضروري في الحياة اليومية.",
    p12: "ملاحظة أخرى: \"الطن\" له ثلاثة أنواع. المتري (1000 كجم)، الأمريكي (907.18 كجم)، والإمبراطوري البريطاني (1016.05 كجم). عند قراءة عقد شحن أو اتفاقية تجارية، تحقق دائمًا من نوع الطن المستخدم، لأن الفرق قد يصل إلى أكثر من 100 كيلوغرام في الطن الواحد.",
    h2_faq: "أسئلة يطرحها الناس عادة",
    faqs: [
      { q: "كيف أحول الكيلوغرام إلى باوند؟", a: "اضرب الكتلة بالكيلوغرام في 2.20462. مثال: 70 كجم × 2.20462 = 154.32 باوند. المعامل الدقيق هو 2.20462262185، لكن ست منازل كافية لأي استخدام عملي." },
      { q: "كم غرام في الأونصة الواحدة؟", a: "الأونصة الواحدة = 28.3495 غرام. للأونصة السائلة (الحجم) قيمة مختلفة تمامًا: 29.5735 ملليلتر. تأكد دائمًا من نوع الأونصة المطلوبة قبل التحويل." },
      { q: "ما هو الستون بالكيلوغرام؟", a: "الستون الواحد = 14 باوند = 6.35029 كيلوغرام. يُستخدم في المملكة المتحدة وأيرلندا لقياس وزن الجسم. إذا سمعت \"12 ستون\"، فهذا يعني حوالي 76.2 كيلوغرام." },
      { q: "ما الفرق بين الطن المتري والطن الأمريكي؟", a: "الطن المتري = 1000 كجم. الطن الأمريكي (Short Ton) = 907.18 كجم. الطن الإمبراطوري (Long Ton) = 1016.05 كجم. الفرق بين المتري والأمريكي يقارب 10%، وهو مبلغ كبير في سياق الشحن." },
      { q: "هل يمكنني استخدام الأرقام الجاهزة بدون حاسبة؟", a: "نعم، للتحويلات الشائعة مثل الكيلو إلى باوند، أو الغرام إلى أونصة. لكن للقيم غير المعتادة، أو عند الحاجة إلى دقة عالية، الأفضل استخدام أداة تحويل أو حاسبة تدعم المعاملات الكاملة." },
      { q: "لماذا يحتوي الجدول على \"قيراط\" و\"ملليغرام\"؟", a: "القيراط يُستخدم في تجارة الأحجار الكريمة والذهب: 1 قيراط = 200 ملليغرام. الملليغرام يُستخدم لقياس الكميات الصغيرة جدًا، مثل مكونات بعض الوصفات الدقيقة أو أوزان العناصر الخفيفة. الوحدتان تُظهران أن التحويلات تغطي مدى واسعًا، من الجواهر إلى الأشياء الدقيقة." },
    ],
    h2_final: "كلمة أخيرة",
    p13: "تحويل الوزن ليس مهارة صعبة، لكنه مجال يكثر فيه الخطأ. الفرق بين 2.2 و2.20462 يبدو تافهًا، حتى تصل إلى سياق يحتاج دقة. والأونصة تختلف عن الأونصة السائلة، والطن الأمريكي يختلف عن المتري. تفاصيل صغيرة تصنع فرقًا كبيرًا.",
    p14: "لو أردت نصيحة واحدة فقط، فهي هذه: لا تعتمد على الحدس. حتى لو كنت تعرف المعامل، الخطأ وارد عند التطبيق. اكتب المعاملات الأساسية في مكان ما، أو استخدم حاسبة عند الحاجة. الوقت الذي توفره في التحقق، تستثمره في شيء أهم.",
    disclaimer: "جميع المعاملات المذكورة في هذا المقال مأخوذة من المعايير الدولية المعتمدة (SI والمعيار الإمبراطوري). المقال مناسب للاستخدام اليومي في المطبخ، الرياضة، الشحن، والسفر. للاستخدامات العلمية الدقيقة جدًا، راجع المرجع الرسمي لوحدتك القياسية.",
    author: "نُشر على iyadel.com — آخر تحديث: يناير 2026.",
  },
};

function Callout({ icon: Icon, children }) {
  return (
    <div className="bg-amber-50 dark:bg-amber-950/30 border-r-4 border-amber-400 dark:border-amber-500 rounded-xl p-4 my-5 text-sm text-amber-900 dark:text-amber-200 leading-relaxed flex gap-2">
      {Icon && <Icon className="w-5 h-5 shrink-0 mt-0.5 text-amber-500" />}
      <div>{children}</div>
    </div>
  );
}

function DataTable({ headers, rows }) {
  return (
    <div className="overflow-x-auto my-4 rounded-xl border border-gray-200 dark:border-[#4B3F8A]">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-gray-50 dark:bg-[#1E1B4B]">
            {headers.map((h, i) => (
              <th key={i} className="border border-gray-200 dark:border-[#4B3F8A] px-3 py-2 text-right font-semibold text-gray-800 dark:text-[#FEF3C7] whitespace-nowrap">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="odd:bg-white even:bg-gray-50/50 dark:odd:bg-[#2D2A5A] dark:even:bg-[#1E1B4B]/50">
              {row.map((cell, j) => (
                <td key={j} className={`border border-gray-200 dark:border-[#4B3F8A] px-3 py-2 ${j > 0 ? "font-mono text-[#6D28D9] dark:text-[#FBBF24]" : "text-gray-600 dark:text-[#D6D2EE]"}`}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function FaqItem({ q, a }) {
  return (
    <details className="group bg-white dark:bg-[#2D2A5A] border border-gray-200 dark:border-[#4B3F8A] rounded-xl">
      <summary className="cursor-pointer list-none flex items-center justify-between p-4 text-sm font-semibold text-gray-800 dark:text-[#FEF3C7]">
        {q}
        <span className="text-[#6D28D9] dark:text-[#FBBF24] text-xl font-light transition-transform group-open:rotate-45">+</span>
      </summary>
      <p className="px-4 pb-4 text-sm text-gray-600 dark:text-[#D6D2EE] leading-relaxed">{a}</p>
    </details>
  );
}

export default function WeightConverterArticle() {
  const { lang, isRTL } = useI18n();
  const C = CONTENT[lang] || CONTENT.en;
  const dir = isRTL ? "rtl" : "ltr";

  return (
    <article dir={dir} className="prose-content max-w-none">
      <div className="bg-gradient-to-br from-purple-50 to-amber-50 dark:from-[#2D2A5A] dark:to-[#1E1B4B] border-r-4 border-[#6D28D9] rounded-xl p-4 mb-6 text-base text-gray-800 dark:text-[#FEF3C7] leading-loose">
        {C.intro}
      </div>

      <p className="text-sm text-gray-600 dark:text-[#D6D2EE] leading-relaxed mb-5">{C.p1}</p>

      <h2 className="text-xl font-bold text-gray-800 dark:text-[#FEF3C7] mt-6 mb-3 pb-2 border-b-2 border-gray-200 dark:border-[#4B3F8A]">{C.h2_why}</h2>
      <p className="text-sm text-gray-600 dark:text-[#D6D2EE] leading-relaxed mb-3">{C.p2}</p>
      <p className="text-sm text-gray-600 dark:text-[#D6D2EE] leading-relaxed mb-3">{C.p3}</p>
      <Callout icon={Lightbulb}>{C.callout}</Callout>

      <h2 className="text-xl font-bold text-gray-800 dark:text-[#FEF3C7] mt-6 mb-3 pb-2 border-b-2 border-gray-200 dark:border-[#4B3F8A]">{C.h2_factors}</h2>
      <p className="text-sm text-gray-600 dark:text-[#D6D2EE] leading-relaxed mb-3">{C.p4}</p>
      <DataTable headers={C.th1} rows={C.table1} />
      <p className="text-sm text-gray-600 dark:text-[#D6D2EE] leading-relaxed mb-3">{C.p5}</p>

      <h2 className="text-xl font-bold text-gray-800 dark:text-[#FEF3C7] mt-6 mb-3 pb-2 border-b-2 border-gray-200 dark:border-[#4B3F8A]">{C.h2_mistakes}</h2>
      <div className="space-y-3 mb-4">
        <p className="text-sm text-gray-600 dark:text-[#D6D2EE] leading-relaxed"><AlertTriangle className="inline w-4 h-4 text-amber-500 mr-1" />{C.p6}</p>
        <p className="text-sm text-gray-600 dark:text-[#D6D2EE] leading-relaxed"><AlertTriangle className="inline w-4 h-4 text-amber-500 mr-1" />{C.p7}</p>
        <p className="text-sm text-gray-600 dark:text-[#D6D2EE] leading-relaxed"><AlertTriangle className="inline w-4 h-4 text-amber-500 mr-1" />{C.p8}</p>
        <p className="text-sm text-gray-600 dark:text-[#D6D2EE] leading-relaxed"><AlertTriangle className="inline w-4 h-4 text-amber-500 mr-1" />{C.p9}</p>
      </div>

      <h2 className="text-xl font-bold text-gray-800 dark:text-[#FEF3C7] mt-6 mb-3 pb-2 border-b-2 border-gray-200 dark:border-[#4B3F8A]">{C.h2_table2}</h2>
      <DataTable headers={C.th2} rows={C.table2} />
      <p className="text-sm text-gray-600 dark:text-[#D6D2EE] leading-relaxed mb-3">{C.p10}</p>

      <h2 className="text-xl font-bold text-gray-800 dark:text-[#FEF3C7] mt-6 mb-3 pb-2 border-b-2 border-gray-200 dark:border-[#4B3F8A]">{C.h2_details}</h2>
      <p className="text-sm text-gray-600 dark:text-[#D6D2EE] leading-relaxed mb-3">{C.p11}</p>
      <p className="text-sm text-gray-600 dark:text-[#D6D2EE] leading-relaxed mb-3">{C.p12}</p>

      <h2 className="text-xl font-bold text-gray-800 dark:text-[#FEF3C7] mt-6 mb-3 pb-2 border-b-2 border-gray-200 dark:border-[#4B3F8A]">{C.h2_faq}</h2>
      <div className="space-y-2 mb-5">
        {C.faqs.map((f, i) => <FaqItem key={i} q={f.q} a={f.a} />)}
      </div>

      <h2 className="text-xl font-bold text-gray-800 dark:text-[#FEF3C7] mt-6 mb-3 pb-2 border-b-2 border-gray-200 dark:border-[#4B3F8A]">{C.h2_final}</h2>
      <p className="text-sm text-gray-600 dark:text-[#D6D2EE] leading-relaxed mb-3">{C.p13}</p>
      <p className="text-sm text-gray-600 dark:text-[#D6D2EE] leading-relaxed mb-3">{C.p14}</p>

      <div className="bg-gray-50 dark:bg-[#1E1B4B] border-r-3 border-gray-300 dark:border-[#4B3F8A] rounded-xl p-4 mt-6 text-xs text-gray-500 dark:text-[#8B8AB0] leading-relaxed">
        <strong>{lang === "ar" ? "ملاحظة:" : "Note:"}</strong> {C.disclaimer}
      </div>
      <div className="border-t border-gray-200 dark:border-[#4B3F8A] mt-6 pt-4 text-xs text-gray-400 dark:text-[#8B8AB0]">
        ✍️ {C.author}
      </div>
    </article>
  );
}