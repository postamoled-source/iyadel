import { useI18n } from "@/lib/i18n";

const CONTENT = {
  en: {
    title: "Car Calculations: From the Gas Bill to Engine Power",
    intro: "The first time I opened my car's hood to check something, I was nineteen. I didn't know the difference between oil and coolant, but I knew my gas bill was going up every month. So I sat down and calculated: how many liters do I actually consume? And how much does each kilometer cost? Then I started reading about horsepower and torque. Years later, I realized most car owners live with numbers they don't understand, while understanding them requires only simple equations.",
    body1: "This article is not a technical guide to cars. It's notes from years of driving, reading, and trial and error. You'll need a calculator — or you can use the four tools above. No difference.",
    h2_why: "Why Calculate? A Question Worth Asking",
    why1: "Someone might say: what's the point of calculating fuel cost? I fill up, I pay, that's it. But it's not that simple. When you know your weekly commute costs you 240 a month, you start considering alternatives. And when you know your car consumes 11 L/100km instead of 7 for a similar car, you realize the difference isn't in price — it's in choice.",
    why2: "The same logic applies to horsepower. Many buy a 200 HP car then never use half of it. Others buy a 120 HP car and complain about its weakness. Calculation doesn't tell you what to buy, but it tells you what to expect.",
    h2_fuel: "Fuel Cost: The First Number You Should Know",
    fuel1: "The equation is simple: Cost = (Distance ÷ 100) × Consumption × Price per Liter. But the details are where people stumble.",
    fuel2: "The first problem is that consumption isn't constant. Your car uses 7 liters on the highway and 11 in traffic. The average you see on paper (like 8 L/100km) is from standardized tests, but it doesn't necessarily reflect your daily driving.",
    fuel3: "The better way is to calculate your real consumption yourself: fill the tank, record the kilometers, then fill again and record the liters. Divide liters by kilometers and multiply by 100. Repeat three or four times and you'll get a more accurate number than any catalog.",
    callout1: "💡 Tip: Don't calculate trip cost based on factory consumption. Use your real consumption. The difference could be 20%, which means 20 extra on every 100 you spend.",
    h2_mileage: "Mileage: How to Read Consumption Numbers",
    mil1: "The most common unit in the Arab world is L/100km. A lower number = a more efficient car. 8 L/100km is better than 12 L/100km.",
    mil2: "But in America, the standard unit is MPG (miles per gallon), and here it's inverted: a higher number = higher efficiency. A 30 MPG car is more efficient than a 20 MPG car. This difference creates real confusion when comparing cars from different markets.",
    table1Title: "Quick Conversion Table",
    table1Head: ["L/100km", "km/L", "MPG (US)", "Rating"],
    table1Rows: [
      ["5.0", "20.0", "47.0", "Excellent"],
      ["6.0", "16.7", "39.2", "Very Good"],
      ["8.0", "12.5", "29.4", "Good"],
      ["10.0", "10.0", "23.5", "Fair"],
      ["12.0", "8.3", "19.6", "High"],
      ["15.0", "6.7", "15.7", "Very High"],
    ],
    mil3: "Note that conversion between units isn't linear. Doubling L/100km doesn't mean halving MPG. This is an additional reason to use a tool that calculates for you.",
    h2_hp: "Horsepower: What Is It Really?",
    hp1: "One horsepower isn't the power of a real horse. James Watt invented it in the 18th century to compare his steam engines to the horses used to lift coal from mines. He defined it as the ability to lift 550 pounds (250 kg) one foot in one second. A somewhat arbitrary number, but it became the standard.",
    hp2: "Practically, one mechanical horsepower = 745.7 watts. One metric horsepower = 735.5 watts. The difference is 1.4%, but it shows up in European and Japanese cars that sometimes declare their power in metric (PS) instead of mechanical (HP).",
    hp3: "To calculate horsepower from force, distance, and time:",
    formulaHp: "Power (W) = Force (N) × Distance (m) ÷ Time (s)",
    hp4: "Example: if a driving force of 5000 N moves a car 100 meters in 5 seconds, then Power = 5000 × 100 ÷ 5 = 100,000 W = 134 HP. That's a reasonable number for a mid-size car.",
    h2_et: "ET Method: How to Measure Engine Power Without a Dynamometer",
    et1: "This is my favorite method. It needs no equipment. Just a car, a safe road, and a stopwatch. The idea is to measure the time your car takes to cover a quarter mile (402 meters) from a standstill.",
    et2: "The equation: HP = Weight ÷ (ET ÷ 5.825)³",
    et3: "Example: a 1500 kg car that covers the quarter mile in 14 seconds:",
    etSteps: ["14 ÷ 5.825 = 2.403", "2.403³ = 13.88", "1500 ÷ 13.88 = 108 HP"],
    et4: "But this method is an estimate. It depends on the driver knowing how to launch, the road being level, and weather conditions being moderate. It gives a more accurate number than nothing, but it doesn't replace a dynamometer.",
    callout2: "⚠️ Warning: Don't measure the quarter mile on public roads. Go to a closed track or a safe area. This isn't legal advice, it's safety advice.",
    h2_ref: "Reference Table: Common Values for Different Cars",
    table2Head: ["Car Type", "Approx. Power", "Weight/Power"],
    table2Rows: [
      ["Small city car", "90–120 HP", "10–12 kg/HP"],
      ["Mid-size sedan", "140–180 HP", "8–10 kg/HP"],
      ["Family SUV", "180–250 HP", "9–11 kg/HP"],
      ["Sports car", "300–450 HP", "4–6 kg/HP"],
      ["Electric car", "200–400 HP", "5–8 kg/HP"],
    ],
    ref1: "Weight/power is the most important number when talking about acceleration. A 200 HP car weighing 1200 kg is faster than a 250 HP car weighing 1800 kg. Torque matters too, but weight/power gives the quickest picture.",
    h2_details: "Small Details You Might Miss",
    det1: "The tool above contains four separate calculators in tabs. Each is completely independent. You can use it on mobile and any modern browser, without registration or download.",
    det2: "The gas mileage calculator gives you four numbers at once: L/100km, km/L, MPG, and cost per kilometer. Very useful if you're comparing two cars or want to know your real efficiency.",
    det3: "The fuel cost calculator adds a cost-splitting option for passengers. If you're traveling with family or friends, you can know each person's share instantly, without manual calculation.",
    h2_final: "A Final Word",
    final1: "A car is a marvelous machine, but it's drowning in numbers. Liters, kilometers, horsepower, newtons, watts. Most of these numbers don't change your life, but some change your decisions. How much do you really pay for fuel? Is your car as efficient as you think? Do you really need 300 horsepower?",
    final2: "The answers come from calculation, not from feeling. Use the four tools above and try your real numbers. You won't know your car the way you will after this experience.",
    disclaimer: "Note: All calculations are for educational and estimation purposes. Actual values vary based on driving conditions and maintenance. Consult a specialist for major financial or technical decisions.",
  },
  ar: {
    title: "حسابات السيارة: من فاتورة البنزين إلى قوة المحرك",
    intro: "أول مرة فتحت فيها كبوت سيارتي لأتفقد شيئًا، كنت في التاسعة عشرة من عمري. لم أكن أعرف الفرق بين الزيت والتبريد، لكنني كنت أعرف أن فاتورة البنزين ترتفع كل شهر. جلست أحسب: كم لترًا أستهلك فعلاً؟ وكم يكلفني كل كيلومتر؟ ثم بدأت أقرأ عن القوة الحصانية وعزم الدوران. بعد سنوات، صرت أدرك أن معظم مالكي السيارات يعيشون مع أرقام لا يفهمونها، بينما فهمها لا يتطلب سوى معادلات بسيطة.",
    body1: "هذا المقال ليس دليلًا تقنيًا للسيارات. هو ملاحظات من سنوات من القيادة، والقراءة، والتجربة والخطأ. ستحتاج إلى آلة حاسبة، أو يمكنك استخدام الأدوات الأربع في الأعلى. لا فرق.",
    h2_why: "لماذا نحسب؟ سؤال يستحق التفكير",
    why1: "قد يقول قائل: ما الفائدة من حساب تكلفة الوقود؟ أعبئ البنزين وأدفع، هذا كل شيء. لكن الأمر ليس بهذه البساطة. حين تعرف أن رحلتك الأسبوعية للعمل تكلفك 240 ريالًا شهريًا، تبدأ تفكر في خيارات أخرى. وحين تعرف أن سيارتك تستهلك 11 لترًا لكل 100 كم بدل 7 لسيارة أخرى مماثلة، تدرك أن الفرق ليس في السعر، بل في الاختيار.",
    why2: "نفس المنطق ينطبق على القوة الحصانية. كثيرون يشترون سيارة بقوة 200 حصان ثم لا يستخدمون نصفها. وآخرون يشترون سيارة بـ 120 حصانًا ويشتكون من ضعفها. الحساب لا يخبرك بماذا تشتري، لكنه يخبرك بماذا تتوقع.",
    h2_fuel: "تكلفة الوقود: أول رقم يجب أن تعرفه",
    fuel1: "المعادلة بسيطة: التكلفة = (المسافة ÷ 100) × الاستهلاك × سعر اللتر. لكن التفاصيل هي ما يوقع الناس في الخطأ.",
    fuel2: "المشكلة الأولى أن الاستهلاك ليس رقمًا ثابتًا. سيارتك تستهلك 7 لترات على الطريق السريع، و11 لترًا في الزحام. المتوسط الذي تراه على الورق (مثل 8 لتر/100كم) هو نتيجة اختبارات معيارية، لكنه لا يعكس قيادتك اليومية بالضرورة.",
    fuel3: "الطريقة الأفضل أن تحسب استهلاكك الحقيقي بنفسك: املأ الخزان، سجل عدد الكيلومترات، ثم املأه مرة أخرى وسجل اللترات. اقسم اللترات على عدد الكيلومترات واضرب في 100. كرر العملية ثلاث أو أربع مرات، وستحصل على رقم أدق من أي كتالوج.",
    callout1: "💡 نصيحة: لا تحسب تكلفة الرحلة بناءً على استهلاك المصنع. استخدم استهلاكك الحقيقي. الفرق قد يكون 20%، وهذا يعني 20 ريالًا إضافيًا على كل 100 ريال تنفقها.",
    h2_mileage: "الميلاج: كيف تقرأ أرقام الاستهلاك؟",
    mil1: "الوحدة الأشهر في العالم العربي هي لتر/100كم. رقم أقل = سيارة أكثر كفاءة. 8 لتر/100كم أفضل من 12 لتر/100كم.",
    mil2: "لكن في أمريكا، الوحدة السائدة هي MPG (ميل لكل غالون)، وهنا الانعكاس: رقم أعلى = كفاءة أعلى. سيارة بـ 30 MPG أكثر كفاءة من سيارة بـ 20 MPG. هذا الاختلاف يخلق ارتباكًا حقيقيًا عند مقارنة السيارات من أسواق مختلفة.",
    table1Title: "جدول التحويل السريع",
    table1Head: ["لتر/100كم", "كم/لتر", "MPG (US)", "التقييم"],
    table1Rows: [
      ["5.0", "20.0", "47.0", "ممتاز جدًا"],
      ["6.0", "16.7", "39.2", "ممتاز"],
      ["8.0", "12.5", "29.4", "جيد"],
      ["10.0", "10.0", "23.5", "مقبول"],
      ["12.0", "8.3", "19.6", "مرتفع"],
      ["15.0", "6.7", "15.7", "مرتفع جدًا"],
    ],
    mil3: "لاحظ أن التحويل بين الوحدات ليس خطيًا. مضاعفة لتر/100كم لا تعني نصف MPG. هذا سبب إضافي لاستخدام أداة تحسب بدلًا منك.",
    h2_hp: "القوة الحصانية: ما هي فعلاً؟",
    hp1: "الحصان الواحد ليس قوة حصان حقيقي. اخترعه جيمس واط في القرن الثامن عشر ليقارن قوة محركاته البخارية بقوة الأحصنة التي كانت تستخدم في رفع الفحم من المناجم. عرّفها بأنها القدرة على رفع 550 رطلاً (250 كجم) لمسافة قدم واحدة في ثانية واحدة. رقم عشوائي نوعًا ما، لكنه صار المعيار.",
    hp2: "عمليًا، الحصان الميكانيكي الواحد = 745.7 واط. أما الحصان المتري = 735.5 واط. الفرق 1.4%، لكنه يظهر في السيارات الأوروبية واليابانية التي تعلن عن قوتها أحيانًا بالحصان المتري (PS) بدل الميكانيكي (HP).",
    hp3: "لحساب القوة الحصانية من القوة والمسافة والزمن:",
    formulaHp: "القدرة (واط) = القوة (نيوتن) × المسافة (متر) ÷ الزمن (ثانية)",
    hp4: "مثال: إذا كانت قوة دفع 5000 نيوتن تحرّك سيارة مسافة 100 متر في 5 ثوانٍ، إذن القدرة = 5000 × 100 ÷ 5 = 100,000 واط = 134 حصان. هذا رقم منطقي لسيارة متوسطة.",
    h2_et: "طريقة ET: كيف تقيس قوة محركك بدون دينامومتر؟",
    et1: "هذه الطريقة المفضلة عندي. لا تحتاج أي معدات. تحتاج فقط سيارة، وطريقًا آمنًا، وساعة توقيت. الفكرة أن تقيس الزمن الذي تستغرقه سيارتك لتقطع ربع ميل (402 متر) من الثبات.",
    et2: "المعادلة: HP = الوزن ÷ (ET ÷ 5.825)³",
    et3: "مثال: سيارة وزنها 1500 كجم قطعت الربع ميل في 14 ثانية:",
    etSteps: ["14 ÷ 5.825 = 2.403", "2.403³ = 13.88", "1500 ÷ 13.88 = 108 حصان"],
    et4: "لكن هذه الطريقة تقديرية. تعتمد على أن السائق يعرف كيف ينطلق، وأن الطريق مستوٍ، وأن حالة الطقس معتدلة. تعطي رقمًا أدق من لا شيء، لكنها لا تعوض الدينامومتر.",
    callout2: "⚠️ تحذير: لا تقيس الربع ميل على الطرق العامة. اذهب إلى مضمار مغلق أو منطقة آمنة. هذه ليست نصيحة قانونية، بل نصيحة سلامة.",
    h2_ref: "جدول مرجعي: قيم شائعة لسيارات مختلفة",
    table2Head: ["نوع السيارة", "القوة التقريبية", "الوزن/القوة"],
    table2Rows: [
      ["سيارة مدينة صغيرة", "90–120 HP", "10–12 كجم/HP"],
      ["سيدان متوسطة", "140–180 HP", "8–10 كجم/HP"],
      ["SUV عائلية", "180–250 HP", "9–11 كجم/HP"],
      ["سيارة رياضية", "300–450 HP", "4–6 كجم/HP"],
      ["سيارة كهربائية", "200–400 HP", "5–8 كجم/HP"],
    ],
    ref1: "الوزن/القوة هو الرقم الأهم عند الحديث عن التسارع. سيارة 200 حصان وزنها 1200 كجم أسرع من سيارة 250 حصان وزنها 1800 كجم. عزم الدوران مهم أيضًا، لكن الوزن/القوة يعطي الصورة الأسرع.",
    h2_details: "تفاصيل صغيرة قد تفوتك",
    det1: "الأداة في الأعلى تحتوي على أربع حاسبات منفصلة في تبويبات. كل واحدة مستقلة تمامًا. يمكنك استخدامها على الجوال، وعلى أي متصفح حديث، دون تسجيل أو تحميل.",
    det2: "حاسبة استهلاك البنزين تعطيك أربعة أرقام في وقت واحد: لتر/100كم، كم/لتر، MPG، وتكلفة الكيلومتر. مفيد جدًا لو كنت تقارن بين سيارتين أو تريد معرفة كفاءة سيارتك الحقيقية.",
    det3: "حاسبة تكلفة الوقود تضيف خيار تقسيم التكلفة على الركاب. لو كنت مسافرًا مع عائلتك أو أصدقائك، يمكنك معرفة نصيب كل فرد فورًا، دون حساب يدوي.",
    h2_final: "كلمة أخيرة",
    final1: "السيارة آلة مدهشة، لكنها غارقة في الأرقام. لتر، كيلومتر، حصان، نيوتن، واط. معظم هذه الأرقام لا تغير حياتك، لكن بعضها يغير قراراتك. كم تدفع فعلاً للوقود؟ هل سيارتك كفؤة كما تظن؟ هل تحتاج فعلًا إلى 300 حصان؟",
    final2: "الأجوبة تأتي من الحساب، لا من الإحساس. استخدم الأدوات الأربع في الأعلى، وجرّب أرقامك الحقيقية. لن تعرف سيارتك كما تعرفها بعد هذه التجربة.",
    disclaimer: "ملاحظة: جميع الحسابات لأغراض تعليمية وتقديرية. القيم الفعلية تختلف حسب ظروف القيادة والصيانة. استشر مختصًا للقرارات المالية أو التقنية الكبيرة.",
  },
};

function H2({ children }) {
  return (
    <h2 className="text-xl font-bold text-[#111827] dark:text-[#FEF3C7] mt-8 mb-3 pb-2 border-b-2 border-[#F3F4F6] dark:border-[#4B3F8A]">
      {children}
    </h2>
  );
}

function P({ children }) {
  return (
    <p className="text-sm text-[#374151] dark:text-[#D6D2EE] leading-relaxed mb-3.5">{children}</p>
  );
}

function Code({ children }) {
  return (
    <code className="inline-block bg-[#FEE2E2] dark:bg-[#6D28D9]/20 text-[#991B1B] dark:text-[#FCA5A5] px-1.5 py-0.5 rounded text-[13px] font-mono ltr-dir" dir="ltr">
      {children}
    </code>
  );
}

function Callout({ children }) {
  return (
    <div className="bg-[#FEF3C7]/60 dark:bg-[#2D2A5A] border-s-4 border-[#EAB308] dark:border-[#F59E0B] p-4 rounded-lg my-5 text-sm text-[#111827] dark:text-[#FEF3C7] leading-relaxed transition-colors duration-300">
      {children}
    </div>
  );
}

function Table({ head, rows }) {
  return (
    <div className="my-4 overflow-x-auto">
      <table className="w-full border-collapse text-sm bg-white dark:bg-[#2D2A5A] rounded-lg overflow-hidden">
        <thead>
          <tr className="bg-[#F9FAFB] dark:bg-[#1E1B4B]">
            {head.map((h, i) => (
              <th key={i} className="border border-[#F3F4F6] dark:border-[#4B3F8A] px-3.5 py-2.5 text-right font-semibold text-[#111827] dark:text-[#FEF3C7] text-[14px]">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td key={j} className="border border-[#F3F4F6] dark:border-[#4B3F8A] px-3.5 py-2.5 text-[#374151] dark:text-[#D6D2EE] font-mono">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function CarToolsArticle() {
  const { lang, isRTL } = useI18n();
  const c = CONTENT[lang] || CONTENT.en;
  return (
    <article dir={isRTL ? "rtl" : "ltr"} className="prose-content max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-[#111827] dark:text-[#FEF3C7] leading-snug mb-4">{c.title}</h1>
      <div className="bg-gradient-to-br from-[#6D28D9]/6 to-[#F59E0B]/6 border-s-4 border-[#6D28D9] dark:border-[#8B5CF6] p-4 rounded-lg mb-6 text-sm text-[#111827] dark:text-[#FEF3C7] leading-relaxed">
        {c.intro}
      </div>
      <P>{c.body1}</P>

      <H2>{c.h2_why}</H2>
      <P>{c.why1}</P>
      <P>{c.why2}</P>

      <H2>{c.h2_fuel}</H2>
      <P>{c.fuel1}</P>
      <P>{c.fuel2}</P>
      <P>{c.fuel3}</P>
      <Callout>{c.callout1}</Callout>

      <H2>{c.h2_mileage}</H2>
      <P>{c.mil1}</P>
      <P>{c.mil2}</P>
      <p className="text-sm text-[#374151] dark:text-[#D6D2EE] mb-2">{c.table1Title}:</p>
      <Table head={c.table1Head} rows={c.table1Rows} />
      <P>{c.mil3}</P>

      <H2>{c.h2_hp}</H2>
      <P>{c.hp1}</P>
      <P>{c.hp2}</P>
      <P>{c.hp3}</P>
      <div className="bg-[#FEE2E2] dark:bg-[#1E1B4B] p-3.5 rounded-lg text-center text-sm font-mono font-bold text-[#991B1B] dark:text-[#FCA5A5] mb-3" dir="ltr">{c.formulaHp}</div>
      <P>{c.hp4}</P>

      <H2>{c.h2_et}</H2>
      <P>{c.et1}</P>
      <P>{c.et2}</P>
      <P>{c.et3}</P>
      <ul className="list-disc ps-6 mb-3.5 space-y-1.5">
        {c.etSteps.map((step, i) => <li key={i} className="text-sm text-[#374151] dark:text-[#D6D2EE]">{step}</li>)}
      </ul>
      <P>{c.et4}</P>
      <Callout>{c.callout2}</Callout>

      <H2>{c.h2_ref}</H2>
      <Table head={c.table2Head} rows={c.table2Rows} />
      <P>{c.ref1}</P>

      <H2>{c.h2_details}</H2>
      <P>{c.det1}</P>
      <P>{c.det2}</P>
      <P>{c.det3}</P>

      <H2>{c.h2_final}</H2>
      <P>{c.final1}</P>
      <P>{c.final2}</P>

      <div className="text-[13px] text-[#6B7280] dark:text-[#A8A6C4] bg-[#F9FAFB] dark:bg-[#2D2A5A] p-4 rounded-lg border-s-4 border-[#9CA3AF] dark:border-[#6B6B8A] mt-7">
        {c.disclaimer}
      </div>
    </article>
  );
}