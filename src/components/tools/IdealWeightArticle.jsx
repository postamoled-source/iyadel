// مقال شامل عن حساب الوزن المثالي حسب الطول والعمر
// يدعم RTL ومتجاوب مع الجوال - يستخدم ألوان علامة iyadel التجارية
import { Link } from "react-router-dom";

// مكوّن صغير لعرض جدول مرتب
function ArticleTable({ headers, rows }) {
  return (
    <div className="overflow-x-auto my-4 rounded-xl border border-border">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-[#F5F3FF] dark:bg-[#2D2A5A]">
            {headers.map((h, i) => (
              <th key={i} className="border border-border px-3 py-2 text-right font-bold text-[#6D28D9] dark:text-[#FBBF24]">{h}</th>
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
function Callout({ children, type = "info" }) {
  const styles = type === "warning"
    ? "bg-amber-50 dark:bg-amber-900/20 border-r-amber-500"
    : "bg-[#F5F3FF] dark:bg-[#2D2A5A] border-r-[#6D28D9]";
  return (
    <div className={`my-4 rounded-lg border-r-4 p-4 text-sm text-[#374151] dark:text-[#D6D2EE] ${styles}`}>
      {children}
    </div>
  );
}

// عنصر سؤال وجواب قابل للطي
function FaqItem({ question, answer }) {
  return (
    <details className="group bg-white dark:bg-[#2D2A5A] border border-border rounded-xl mb-2.5">
      <summary className="cursor-pointer list-none flex items-center justify-between p-4 text-sm font-semibold text-[#6D28D9] dark:text-[#FBBF24]">
        {question}
        <span className="text-muted-foreground transition-transform group-open:rotate-90">▸</span>
      </summary>
      <p className="px-4 pb-4 text-sm text-[#374151] dark:text-[#D6D2EE] leading-relaxed">{answer}</p>
    </details>
  );
}

export default function IdealWeightArticle() {
  return (
    <article id="article" dir="rtl" className="prose-content max-w-none">

      {/* ====== فاصل بصري أنيق ====== */}
      <div className="my-8 flex items-center gap-3">
        <div className="h-px flex-1 bg-gradient-to-l from-[#6D28D9] to-transparent" />
        <span className="text-xs font-bold text-[#6D28D9] dark:text-[#FBBF24] whitespace-nowrap">📚 دليل شامل</span>
        <div className="h-px flex-1 bg-gradient-to-r from-[#F59E0B] to-transparent" />
      </div>

      <h2 className="text-2xl font-bold text-[#0f766e] dark:text-[#FBBF24] mb-4 border-b border-border pb-2">
        حساب الوزن المثالي حسب الطول والعمر: دليل شامل مع الجداول
      </h2>

      {/* ====== مقدمة ====== */}
      <div className="bg-[#F5F3FF] dark:bg-[#2D2A5A] border-r-4 border-[#6D28D9] rounded-lg p-4 mb-6 text-base text-[#374151] dark:text-[#D6D2EE]">
        سؤال يتكرر كثيرًا: «هل وزني مثالي بالنسبة لطولي وعمري؟» المشكلة أن معظم الناس يبحثون عن رقم واحد، بينما الطب يقول إن الموضوع كله <strong>نطاق صحي</strong>. في هذا الدليل نشرح لك الطريقة الصحيحة للحساب، مع الجداول والمعادلات وأخطاء شائعة يجب تجنبها.
      </div>

      <p className="text-sm text-[#374151] dark:text-[#D6D2EE] leading-relaxed mb-3">
        قبل الدخول في الأرقام، لنتفق على شيء مهم: الوزن المثالي <strong>ليس وزنًا محددًا بالجرام</strong>، بل هو مدى يمكن لجسمك أن يعمل فيه بأفضل حالاته. شخصان لهما نفس الطول قد يكون وزناهما المثاليان مختلفين تمامًا بسبب العمر، العضلات، وبنية الهيكل العظمي.
      </p>

      <p className="text-sm text-[#374151] dark:text-[#D6D2EE] leading-relaxed mb-3">
        لهذا السبب بالتحديد، الاعتماد على رقم واحد من تطبيق أو موقع قد يضللك. الأفضل أن تفهم الأساس، ثم تستخدم أداة تعطيك نطاقًا واقعيًا. تابع معي.
      </p>

      {/* ====== رابط للأداة ====== */}
      <a href="#calculator" className="block text-center bg-gradient-to-r from-[#6D28D9] to-[#F59E0B] text-white font-bold py-3 px-4 rounded-xl my-6 hover:opacity-90 transition-opacity">
        ⚖️ جرّب حاسبة الوزن المثالي التفاعلية ↑
      </a>

      {/* ====== H2 الأول ====== */}
      <h3 className="text-xl font-bold text-[#0f766e] dark:text-[#FBBF24] mt-8 mb-3 border-b border-border pb-1">
        لماذا لا يوجد «وزن مثالي» واحد للجميع؟
      </h3>

      <p className="text-sm text-[#374151] dark:text-[#D6D2EE] leading-relaxed mb-3">
        لو سألت عشرة أطباء عن الوزن المثالي لشخص طوله 170 سم، ستحصل على عشرة أرقام مختلفة قليلًا. السبب أن كل معادلة طبية تعتمد على متغيرات مختلفة:
      </p>

      <ul className="list-disc pr-5 mb-4 space-y-1.5 text-sm text-[#374151] dark:text-[#D6D2EE]">
        <li><strong>الطول:</strong> العامل الأساسي في كل المعادلات تقريبًا.</li>
        <li><strong>الجنس:</strong> الرجل والمرأة يختلفان في نسبة العضلات والدهون الطبيعية.</li>
        <li><strong>العمر:</strong> بعد سن الثلاثين يقل معدل الأيض تدريجيًا.</li>
        <li><strong>بنية الجسم:</strong> صاحب الهيكل العريض يزن طبيعيًا أكثر من صاحب الهيكل النحيف.</li>
        <li><strong>النشاط البدني:</strong> الرياضي قد يكون «زائد الوزن» بمؤشر BMI لكن نسبة الدهون عنده منخفضة جدًا.</li>
      </ul>

      <Callout>
        💡 <strong>خلاصة سريعة:</strong> لا تبحث عن رقم واحد. ابحث عن <em>نطاق</em> يكون فيه وزنك صحيًا، واعتبر نفسك ناجحًا إذا كنت داخل هذا النطاق.
      </Callout>

      {/* ====== H2 الثاني ====== */}
      <h3 className="text-xl font-bold text-[#0f766e] dark:text-[#FBBF24] mt-8 mb-3 border-b border-border pb-1">
        الطريقة الأولى: مؤشر كتلة الجسم (BMI)
      </h3>

      <p className="text-sm text-[#374151] dark:text-[#D6D2EE] leading-relaxed mb-3">
        هذه أشهر طريقة وأكثرها استخدامًا في العالم، وتعتمدها منظمة الصحة العالمية. المعادلة بسيطة:
      </p>

      <p className="text-center text-lg bg-[#F5F3FF] dark:bg-[#2D2A5A] p-3 rounded-lg font-bold text-[#6D28D9] dark:text-[#FBBF24] mb-4">
        BMI = الوزن (كجم) ÷ (الطول بالمتر)²
      </p>

      <h4 className="text-base font-bold text-[#134e4a] dark:text-[#FBBF24] mt-5 mb-2">مثال عملي:</h4>
      <p className="text-sm text-[#374151] dark:text-[#D6D2EE] leading-relaxed mb-3">
        لنفترض أن شخصًا وزنه 78 كجم وطوله 1.72 م. الخطوة الأولى: نربّع الطول → 1.72 × 1.72 = 2.9584. الخطوة الثانية: نقسم الوزن على النتيجة → 78 ÷ 2.9584 = <strong>26.4</strong>. هذا يعني أنه في فئة «زيادة الوزن» قليلًا.
      </p>

      <h4 className="text-base font-bold text-[#134e4a] dark:text-[#FBBF24] mt-5 mb-2">كيف تقرأ نتيجة BMI؟</h4>

      <ArticleTable
        headers={["النطاق", "التصنيف"]}
        rows={[
          ["أقل من 18.5", "نحافة"],
          ["18.5 – 24.9", "وزن طبيعي ✅"],
          ["25 – 29.9", "زيادة في الوزن"],
          ["30 – 34.9", "سمنة درجة أولى"],
          ["35 – 39.9", "سمنة درجة ثانية"],
          ["40 أو أكثر", "سمنة مفرطة"],
        ]}
      />

      <p className="text-sm text-[#374151] dark:text-[#D6D2EE] leading-relaxed mb-3">
        مع ذلك، مؤشر كتلة الجسم له عيوب معروفة. هو لا يفرّق بين العضلات والدهون. لاعب كمال أجسام طوله 175 سم ووزنه 90 كجم سيظهر في فئة «سمنة»، بينما نسبة الدهون عنده 8% فقط. لهذا لا تعتمد عليه وحده.
      </p>

      {/* ====== H2 الثالث ====== */}
      <h3 className="text-xl font-bold text-[#0f766e] dark:text-[#FBBF24] mt-8 mb-3 border-b border-border pb-1">
        الطريقة الثانية: معادلة ديفين (Devine)
      </h3>

      <p className="text-sm text-[#374151] dark:text-[#D6D2EE] leading-relaxed mb-3">
        طُوّرت هذه المعادلة عام 1974 لاستخدامها في حساب جرعات الأدوية، لأنها تعطي وزنًا مثاليًا أدق من BMI. لا تزال معتمدة في المراجع الطبية حتى اليوم.
      </p>

      <p className="text-sm text-[#374151] dark:text-[#D6D2EE] leading-relaxed mb-2"><strong>للرجال:</strong> 50 كجم + 0.9 × (الطول بالسنتيمتر − 152)</p>
      <p className="text-sm text-[#374151] dark:text-[#D6D2EE] leading-relaxed mb-3"><strong>للنساء:</strong> 45.5 كجم + 0.9 × (الطول بالسنتيمتر − 152)</p>

      <h4 className="text-base font-bold text-[#134e4a] dark:text-[#FBBF24] mt-5 mb-2">مثال محسوب:</h4>
      <p className="text-sm text-[#374151] dark:text-[#D6D2EE] leading-relaxed mb-2">
        رجل طوله 178 سم → 50 + 0.9 × (178 − 152) = 50 + 0.9 × 26 = 50 + 23.4 = <strong>73.4 كجم</strong>.
      </p>
      <p className="text-sm text-[#374151] dark:text-[#D6D2EE] leading-relaxed mb-3">
        امرأة طولها 165 سم → 45.5 + 0.9 × (165 − 152) = 45.5 + 11.7 = <strong>57.2 كجم</strong>.
      </p>

      {/* ====== H2 الرابع: الجداول ====== */}
      <h3 className="text-xl font-bold text-[#0f766e] dark:text-[#FBBF24] mt-8 mb-3 border-b border-border pb-1">
        جداول الوزن المثالي حسب الطول
      </h3>

      <p className="text-sm text-[#374151] dark:text-[#D6D2EE] leading-relaxed mb-4">
        إذا كنت تبحث عن مرجع سريع، هذا جدول مبني على مؤشر كتلة الجسم الصحي (18.5 إلى 24.9). الأرقام تقريبية وليست بديلًا عن استشارة مختص.
      </p>

      <h4 className="text-base font-bold text-[#134e4a] dark:text-[#FBBF24] mt-5 mb-2">الوزن المثالي للرجال</h4>
      <ArticleTable
        headers={["الطول", "نطاق الوزن الصحي"]}
        rows={[
          ["155 سم", "44 – 60 كجم"],
          ["160 سم", "47 – 64 كجم"],
          ["165 سم", "50 – 68 كجم"],
          ["170 سم", "53 – 72 كجم"],
          ["175 سم", "57 – 76 كجم"],
          ["180 سم", "60 – 81 كجم"],
          ["185 سم", "63 – 85 كجم"],
          ["190 سم", "67 – 90 كجم"],
        ]}
      />

      <h4 className="text-base font-bold text-[#134e4a] dark:text-[#FBBF24] mt-5 mb-2">الوزن المثالي للنساء</h4>
      <ArticleTable
        headers={["الطول", "نطاق الوزن الصحي"]}
        rows={[
          ["150 سم", "42 – 56 كجم"],
          ["155 سم", "44 – 60 كجم"],
          ["160 سم", "47 – 64 كجم"],
          ["165 سم", "50 – 68 كجم"],
          ["170 سم", "53 – 72 كجم"],
          ["175 سم", "57 – 76 كجم"],
          ["180 سم", "60 – 81 كجم"],
        ]}
      />

      <p className="text-sm text-[#374151] dark:text-[#D6D2EE] leading-relaxed mb-3">
        لاحظ أن الفرق بين الرجل والمرأة صغير في الجداول العامة، لكن المعادلات الطبية تعطي فروقًا أكبر قليلًا بسبب اختلاف تركيب الجسم.
      </p>

      {/* ====== رابط الأداة ====== */}
      <a href="#calculator" className="block text-center bg-gradient-to-r from-[#6D28D9] to-[#F59E0B] text-white font-bold py-3 px-4 rounded-xl my-6 hover:opacity-90 transition-opacity">
        ⚖️ جرّب حاسبة الوزن المثالي التفاعلية ↑
      </a>

      {/* ====== H2 الخامس: العمر ====== */}
      <h3 className="text-xl font-bold text-[#0f766e] dark:text-[#FBBF24] mt-8 mb-3 border-b border-border pb-1">
        كيف يؤثر العمر على وزنك المثالي؟
      </h3>

      <p className="text-sm text-[#374151] dark:text-[#D6D2EE] leading-relaxed mb-3">
        هذا سؤال يخطئ فيه كثيرون. الحقيقة أن نطاق الوزن الصحي للشخص البالغ يبقى ثابتًا تقريبًا بعد سن العشرين. ما يتغير مع العمر هو <strong>مكونات الجسم</strong>:
      </p>

      <ul className="list-disc pr-5 mb-4 space-y-1.5 text-sm text-[#374151] dark:text-[#D6D2EE]">
        <li>بعد سن الثلاثين، تبدأ الكتلة العضلية بالانخفاض تدريجيًا بنسبة تصل إلى 3-5% كل عقد.</li>
        <li>معدل الأيض الأساسي (BMR) ينخفض، مما يعني أنك تحتاج سعرات أقل للحفاظ على نفس الوزن.</li>
        <li>الدهون تميل للتراكم في منطقة البطن بشكل أكبر، وهذا مؤشر خطر حتى لو كان BMI طبيعيًا.</li>
      </ul>

      <p className="text-sm text-[#374151] dark:text-[#D6D2EE] leading-relaxed mb-3">
        لهذا السبب، شخص عمره 25 سنة ووزنه 75 كجم وطوله 175 سم قد يكون بصحة ممتازة، بينما شخص آخر بنفس المواصفات وعمره 55 سنة قد يكون معرضًا لمشاكل أيضية إذا كانت نسبة دهونه أعلى.
      </p>

      <h4 className="text-base font-bold text-[#134e4a] dark:text-[#FBBF24] mt-5 mb-2">ملاحظة حول الأطفال والمراهقين</h4>
      <p className="text-sm text-[#374151] dark:text-[#D6D2EE] leading-relaxed mb-3">
        الأطفال والمراهقون لا تنطبق عليهم هذه الجداول. لهم جداول نمو خاصة تعتمد على <strong>النسب المئوية</strong> (Percentiles) حسب العمر والجنس. لا تحاول تطبيق معادلات البالغين على طفل، فقد تعطي نتائج مضللة.
      </p>

      {/* ====== H2 السادس: أخطاء شائعة ====== */}
      <h3 className="text-xl font-bold text-[#0f766e] dark:text-[#FBBF24] mt-8 mb-3 border-b border-border pb-1">
        أخطاء شائعة عند حساب الوزن المثالي
      </h3>

      <ol className="list-decimal pr-5 mb-4 space-y-2 text-sm text-[#374151] dark:text-[#D6D2EE]">
        <li><strong>الاعتماد على الوزن فقط:</strong> الميزان لا يفرّق بين العضلة والدهون والماء. شخصان بنفس الوزن قد يكونان في حالتين صحيتين مختلفتين تمامًا.</li>
        <li><strong>قياس الوزن في أوقات مختلفة:</strong> الوزن يتغير خلال اليوم بمقدار 1-2 كجم. الأفضل أن تزنه صباحًا بعد الاستيقاظ وقبل الأكل.</li>
        <li><strong>مقارنة نفسك بالآخرين:</strong> صديقك الذي يزن أقل منك ليس بالضرورة أصح منك.</li>
        <li><strong>تجاهل محيط الخصر:</strong> دهون البطن مؤشر خطر مستقل عن الوزن. الرجال فوق 102 سم والنساء فوق 88 سم في خطر متزايد.</li>
        <li><strong>الاعتماد على BMI للرياضيين:</strong> كما قلنا، اللاعبون ذوو العضلات الكبيرة قد يظهرون في فئة «زيادة» بشكل خاطئ.</li>
      </ol>

      {/* ====== H2 السابع: نصائح ====== */}
      <h3 className="text-xl font-bold text-[#0f766e] dark:text-[#FBBF24] mt-8 mb-3 border-b border-border pb-1">
        خطوات عملية للوصول إلى وزنك المثالي
      </h3>

      <p className="text-sm text-[#374151] dark:text-[#D6D2EE] leading-relaxed mb-3">
        معرفة وزنك المثالي هو الخطوة الأولى فقط. الخطوة الأصعب هي الوصول إليه والحفاظ عليه. هذه نصائح مثبتة علميًا:
      </p>

      <ul className="list-disc pr-5 mb-4 space-y-1.5 text-sm text-[#374151] dark:text-[#D6D2EE]">
        <li><strong>لا تحرم نفسك:</strong> الأنظمة القاسية تفشل على المدى الطويل. الأفضل خسارة 0.5 إلى 1 كجم أسبوعيًا.</li>
        <li><strong>زد البروتين:</strong> 1.2 إلى 1.6 جرام لكل كجم من وزنك يوميًا، يساعد على حفظ العضلات أثناء فقدان الوزن.</li>
        <li><strong>لا تهمل القوة:</strong> تمارين المقاومة مرتين أسبوعيًا تحافظ على العضلات وترفع معدل الأيض.</li>
        <li><strong>نم جيدًا:</strong> قلة النوم ترفع هرمون الجوع (Ghrelin) وتخفض هرمون الشبع (Leptin).</li>
        <li><strong>اشرب ماء كافيًا:</strong> 2 إلى 3 لترات يوميًا حسب نشاطك والطقس.</li>
        <li><strong>تابع تقدمك شهريًا:</strong> لا تزن نفسك كل يوم، فالنتائج اليومية مضللة.</li>
      </ul>

      <Callout type="warning">
        ⚠️ <strong>تنبيه مهم:</strong> إذا كنت تعاني من نقص أو زيادة كبيرة في الوزن، لا تعتمد على الحاسبات فقط. راجع طبيبًا أو أخصائي تغذية لتقييم شامل يشمل تحاليل الدم وحالتك الصحية العامة.
      </Callout>

      {/* ====== H2 الثامن: FAQ ====== */}
      <h3 className="text-xl font-bold text-[#0f766e] dark:text-[#FBBF24] mt-8 mb-3 border-b border-border pb-1">
        أسئلة شائعة
      </h3>

      <div className="space-y-2">
        <FaqItem
          question="كيف أحسب وزني المثالي بدون حاسبة؟"
          answer="استخدم معادلة مؤشر كتلة الجسم: اقسم وزنك بالكيلوجرام على مربع طولك بالمتر. إذا كانت النتيجة بين 18.5 و24.9 فأنت في النطاق الصحي. مثال: وزن 70 كجم، طول 1.72 م → 70 ÷ 2.9584 = 23.7 (طبيعي)."
        />
        <FaqItem
          question="هل الوزن المثالي يختلف بين الرجل والمرأة؟"
          answer="نعم، بفارق بسيط. النساء لديهن نسبة دهون طبيعية أعلى قليلًا، ومعادلات مثل Devine تعطي المرأة وزنًا أقل بحوالي 4-5 كجم من الرجل عند نفس الطول. الفرق ناتج عن اختلاف تركيبة الجسم والعضلات."
        />
        <FaqItem
          question="ما هو الوزن المثالي للطول 170 للنساء؟"
          answer="بناءً على مؤشر كتلة الجسم الصحي، يتراوح النطاق بين 53 و72 كجم. لكن النطاق الأقرب للواقع لمعظم النساء عند هذا الطول هو 58 إلى 70 كجم، حسب العمر وبنية الجسم."
        />
        <FaqItem
          question="ما هو الوزن المثالي للطول 180 للرجال؟"
          answer="بين 60 و81 كجم حسب مؤشر كتلة الجسم. معادلة ديفين تعطي 75.4 كجم كرقم مرجعي. لكن تذكّر أن هذا نطاق وليس رقمًا ثابتًا."
        />
        <FaqItem
          question="هل مؤشر كتلة الجسم كافٍ وحده؟"
          answer="لا. مؤشر كتلة الجسم مؤشر مبدئي فقط، ولا يقيس نسبة الدهون ولا توزيعها. الأفضل دمجه مع قياس محيط الخصر ونسبة الدهون في الجسم للحصول على صورة أشمل."
        />
        <FaqItem
          question="هل يمكن أن أكون في وزن طبيعي ومع ذلك غير صحي؟"
          answer="نعم، هذه حالة تعرف بـ «السمنة النحيفة» (Normal Weight Obesity). شخص وزنه طبيعي لكن نسبة الدهون عنده مرتفعة والعضلات قليلة. لهذا يجب النظر إلى أكثر من مقياس."
        />
        <FaqItem
          question="كم مرة أزن نفسي؟"
          answer="مرة واحدة أسبوعيًا في نفس الوقت والظروف كافية. يوميًا قد يسبب قلقًا غير ضروري بسبب التغيرات الطبيعية في الماء والطعام."
        />
      </div>

      {/* ====== الخلاصة ====== */}
      <h3 className="text-xl font-bold text-[#0f766e] dark:text-[#FBBF24] mt-8 mb-3 border-b border-border pb-1">
        الخلاصة
      </h3>

      <p className="text-sm text-[#374151] dark:text-[#D6D2EE] leading-relaxed mb-3">
        حساب الوزن المثالي حسب الطول والعمر ليس عملية معقدة، لكنه يحتاج فهم أن النتيجة هي <strong>نطاق</strong> وليس رقمًا واحدًا. مؤشر كتلة الجسم بداية جيدة، ومعادلات مثل Devine وRobinson تعطي دقة أعلى. الأهم من الرقم نفسه هو نمط حياتك: غذاء متوازن، نشاط بدني منتظم، ونوم كافٍ.
      </p>

      <p className="text-sm text-[#374151] dark:text-[#D6D2EE] leading-relaxed mb-3">
        إذا أردت نتيجة سريعة بدل الحساب اليدوي، استخدم <a href="#calculator" className="text-[#6D28D9] dark:text-[#FBBF24] underline">حاسبة الوزن المثالي</a> التي تعطيك النطاق بأربع معادلات في ثوانٍ.
      </p>

      {/* ====== تنبيه طبي ====== */}
      <div className="bg-[#F9FAFB] dark:bg-[#1E1B4B] border-r-3 border-muted-foreground/40 rounded-lg p-4 mt-6 text-sm text-muted-foreground">
        <strong>تنبيه طبي:</strong> هذا المقال لأغراض تعليمية فقط، ولا يُغني عن استشارة طبيب أو أخصائي تغذية. لا تبدأ أي نظام غذائي أو تمريني دون مراجعة مختص.
      </div>

      {/* ====== صندوق الكاتب ====== */}
      <div className="border-t border-border mt-8 pt-4 text-xs text-muted-foreground">
        <p>✍️ كُتب ونُشر على <Link to="/" className="text-[#6D28D9] dark:text-[#FBBF24] hover:underline">iyadel.com</Link> — آخر تحديث: سبتمبر 2026.</p>
      </div>

    </article>
  );
}