import { Link } from "react-router-dom";
import { useI18n } from "@/lib/i18n";

const CONTENT = {
  ar: {
    dir: "rtl",
    badge: "📚 مقال",
    title: "رسم الدوال الرياضية: من الورق المربّع إلى شاشة المتصفح",
    intro: "أول مرة رأيت فيها رسمًا بيانيًا لدالة، كنت في الثانية عشرة من عمري. كان أستاذ الرياضيات يرسم منحنى على السبورة ويقول «هذه دالة». لم أفهم لماذا نرسم، فالمعادلة كانت واضحة أمامي. بعد سنوات، حين احتجت فعلاً أن أفهم سلوك دالة لوغاريتمية في مسألة فيزياء، أدركت أن الرسم لم يكن رفاهية تعليمية — كان اللغة الوحيدة التي تُشرح بها الدوال فعلاً.",
    p1: "هذا المقال ليس درسًا. هو خلاصة سنوات من رسم الدوال، وأخطاء ارتكبتها، وتفاصيل صغيرة تعلمتها لاحقًا ولم يخبرني بها أحد.",
    tryCalc: "📈 جرّب حاسبة رسم الدوال التفاعلية ↑",
    h2_1: "لماذا نرسم؟ سؤال جيد",
    h2_1_p1: "كثير من الطلاب يعتبرون الرسم خطوة إضافية. تجاوزها الآن، واستعجل الحل. وأنا كنت كذلك تمامًا.",
    h2_1_p2: "المشكلة أن المعادلة وحدها كذابة أحيانًا. تأخذ دالة مثل f(x) = x³ − 3x وتبدأ بتحليلها. تسأل نفسك: كم جذرًا لها؟ أين تتغير إشارتها؟ أين قيمها القصوى؟ يمكنك الإجابة بطرق جبرية، لكن قد تأخذ منك نصف ساعة. أما الرسم، فيجيبك في عشرة ثوانٍ.",
    h2_1_p3: "وهناك أسباب أخرى أقل «أكاديمية»: الرسم يساعدك على اكتشاف أخطائك. لو حللت معادلة ووصلت إلى حل بعيد جدًا عمّا يُظهره الرسم، فأنت غالبًا أخطأت في مكان ما. هذه المراجعة البصرية لا يعطيها أي شيء آخر.",
    h2_2: "كيف ترسم الآن؟ (ما كنت أتمنى لو عرفته سابقًا)",
    h2_2_p1: "قديمًا كنا نرسم يدويًا. نأخذ جدول قيم، نحسب f(x) لكل نقطة، ثم نضع النقاط على ورق مربعات ونوصلها بخط ناعم. طريقة بطيئة، ومزعجة، خاصة عند الدوال التي تتغير بسرعة.",
    h2_2_p2: "اليوم، الأداة في أعلى هذه الصفحة تعمل بنفس المنطق، لكن بحسابات تجريها في أجزاء من الثانية. تكتب الدالة، تضغط «رسم»، وتنظر.",
    callout: "💡 نصيحة عملية: لا تبدأ من نطاق واسع مثل -100 إلى 100. ابدأ من -5 إلى 5، انظر لشكل المنحنى، ثم وسّع تدريجيًا. معظم الطلاب يرتكبون الخطأ نفسه: يفتحون نطاقًا كبيرًا، فيرون خطًا شبه مستقيم، ويظنون أن الدالة بسيطة.",
    h2_3: "ثلاث دوال تستحق أن ترسمها بعينك",
    h3_1: "الدالة التربيعية، لكن معاملها مهم",
    h3_1_p: "الكل يعرف شكل x². قطعة مكافئة تفتح للأعلى. لكن جرّب أن ترسم 0.1*x² و10*x² على نفس الرسم. الشكل نفسه، لكن الإحساس مختلف تمامًا. الأولى تبدو وكأنها تسير ببطء، الثانية تنفجر بعد x=2. هذا الفرق بين «أفهم» و«أرى».",
    h3_2: "الدالة الجيبية، حيث يخدعك البصر",
    h3_2_p: "sin(x) تبدو بسيطة. موجة تكرر نفسها كل 2π. لكن حين ترسم sin(1/x) وتقرّب من الصفر، سترى شيئًا غريبًا: تذبذبات لا نهائية تتزاحم في مساحة صغيرة جدًا. هذا مثال كلاسيكي لدالة «سيئة التصرف» عند نقطة معينة. جرّبها في الأداة، قرّب من الصفر، وستفهم لماذا يعشق الرياضيون هذه الدالة رغم صعوبتها.",
    h3_3: "الدالة e^x: عندما يبدو الرسم بسيطًا لكنه ليس كذلك",
    h3_3_p: "يبدو منحنى سلسًا. لكنه ينمو بسرعة تفوق أي حدس بشري. عند x=10، القيمة تزيد عن 22,000. عند x=20، تقارب نصف مليار. هذا ليس منحنى عادي، هذا انفجار بصري. لهذا يُستخدم في نماذج النمو السكاني، والفائدة المركبة، ومعدلات انتشار الأشياء. لأن النمو الحقيقي في الطبيعة نادرًا ما يكون خطيًا.",
    h2_4: "أخطاء رأيتها عشرات المرات",
    h2_4_li: [
      "كتابة sin x بدون أقواس. الأداة، وأي حاسبة محترمة، تريد sin(x). الفرق بسيط في الكتابة، لكنه يقلب النتيجة رأسًا على عقب.",
      "نسيان الأقواس في الأس. x^2+1 ليست نفس x^(2+1). الأولى قطع مكافئ، الثانية دالة تكعيبية. النتيجة النهائية مختلفة تمامًا، والخطأ يأتي غالبًا من الإهمال لا من الجهل.",
      "خلط ln وlog. الكثير يظنون أنهما نفس الدالة. ليس كذلك. ln للأساس e، وlog للأساس 10. رسمهما مختلف، وخصائصهما الجبرية مختلفة، والخلط بينهما في مسألة فيزياء قد يضيع ساعات.",
      "رسم دالة على نطاق لا يناسبها. دالة لوغاريتمية على نطاق من -10 إلى 10 ستعرض نصف منحنى فقط، لأن ln(x) غير معرّفة أصلاً للقيم السالبة. الأمر ليس خطأ في الأداة، بل في النطاق الذي اخترته أنت.",
    ],
    h2_5: "تفاصيل صغيرة قد لا تلاحظها",
    h2_5_p1: "لو ضغطت على زر «مشاركة»، ستنسخ رابطًا يحتوي على دوالك ونطاق الرسم. يمكنك لصقه في تويتر أو واتساب، ويفتح عند من يستقبله بنفس الشكل الذي تراه الآن.",
    h2_5_p2: "زر «المحفوظات» يخزّن مجموعات الدوال لديك في المتصفح. مفيد لو كنت تحضّر درسًا وتريد الاحتفاظ بترتيب معين. أعطه اسمًا مثل «الواجب» أو «المثال الثاني»، ورجّع إليه في أي وقت.",
    h2_5_p3: "وتصدير JSON مفيد للمشاركة الدائمة. أرسل الملف لصديقك، وهو يستورده في أداته، ويحصل على نفس الدوال بالضبط. لا وسيط، لا رابط ينتهي، ملف واحد.",
    h2_faq: "أسئلة يطرحها الناس عادة",
    faqs: [
      { q: "هل يمكن رسم أكثر من دالة في نفس الوقت؟", a: "نعم، حتى أربع. اضغط «إضافة دالة». كل دالة تأخذ لونًا مختلفًا، وفي الجدول أسفل الرسم سترى عمودًا لكل واحدة. مفيد جدًا لمقارنة سلوك دالتين، مثل sin(x) وx − x³/6 للتقريب." },
      { q: "لماذا الرسم يبدو متقطعًا عند بعض الدوال؟", a: "هذه ليست مشكلة في الأداة. بعض الدوال مثل tan(x) لها خطوط تقارب رأسية، حيث تقفز من +∞ إلى −∞. الأداة تتعرف على هذا القفز وتقطع الخط، وهو السلوك الصحيح رياضيًا. الخط الذي يربط الجانبين سيكون خطأً في الحقيقة." },
      { q: "ما الدقة التي تعطيها الأداة؟", a: "الأداة ترسم عند 2400 نقطة عبر النطاق المحدد. في نطاق من -10 إلى 10، هذا يعني دقة تقارب 0.008 لكل نقطة. أكثر من كافية للاستخدام التعليمي." },
      { q: "هل يمكن رسم الدوال الضمنية مثل x² + y² = 4؟", a: "لا، الأداة ترسم الدوال بصيغة y = f(x) فقط. الدوال الضمنية تحتاج خوارزميات مختلفة. هذه الأداة ليست الأداة المناسبة لها." },
      { q: "هل البيانات التي أُدخلها تُرسل إلى خادم؟", a: "لا. كل شيء يعمل في متصفحك. الدوال، الرسم، التخزين في المحفوظات — كلها تجري محليًا. لا توجد أي اتصالات خارجية بعد تحميل الصفحة. حتى أنك تستطيع فصل الإنترنت واستخدام الأداة بشكل طبيعي." },
    ],
    h2_concl: "كلمة أخيرة",
    concl_p1: "الرسم ليس خطوة إضافية، بل هو الطريقة التي «نرى» بها الرياضيات. المعادلة تخبرك بالعلاقة، والرسم يخبرك بالشكل. وأي محاولة لفهم دالة دون رسمها، هي محاولة نصف ناقصة.",
    concl_p2: "لو أعطيتك نصيحة واحدة فقط، فهي هذه: لا ترسم لتتأكد من حل، بل ارسم لتفكر. كثير من الأفكار الرياضية تأتي بعد النظر إلى منحنى غريب، ثم التساؤل: لماذا يبدو هكذا؟",
    disclaimer: "ملاحظة: الأداة تعليمية، والنتائج قابلة للخطأ في حالات الحسابات العددية الحدّية. للحالات الحرجة، راجع أستاذك أو استخدم أداة متخصصة.",
    author: "✍️ نُشر على",
    authorUpdated: "— آخر تحديث: يناير 2026.",
  },
  en: {
    dir: "ltr",
    badge: "📚 Article",
    title: "Plotting Mathematical Functions: From Graph Paper to the Browser Screen",
    intro: "The first time I saw a graph of a function, I was twelve. My math teacher was drawing a curve on the board and saying \"this is a function.\" I didn't understand why we graphed things — the equation was right there in front of me. Years later, when I actually needed to understand the behavior of a logarithmic function in a physics problem, I realized that graphing wasn't an educational luxury — it was the only language that truly explains what functions do.",
    p1: "This isn't a lesson. It's a distillation of years of plotting functions, mistakes I've made, and small details I learned later that no one told me about.",
    tryCalc: "📈 Try the Interactive Function Plotter ↑",
    h2_1: "Why Plot? Good Question",
    h2_1_p1: "Many students consider graphing an extra step. Skip it now, rush to the answer. I was exactly the same.",
    h2_1_p2: "The problem is that the equation alone is sometimes deceptive. Take a function like f(x) = x³ − 3x and start analyzing it. You ask yourself: how many roots does it have? Where does it change sign? Where are its extreme values? You can answer with algebraic methods, but it might take half an hour. The graph, on the other hand, answers in ten seconds.",
    h2_1_p3: "And there are other, less \"academic\" reasons: plotting helps you catch your mistakes. If you solved an equation and arrived at an answer far from what the graph shows, you probably made an error somewhere. This visual review is something nothing else provides.",
    h2_2: "How Do You Plot Now? (What I Wish I'd Known Earlier)",
    h2_2_p1: "In the old days, we plotted by hand. We'd build a table of values, calculate f(x) for each point, then place the dots on graph paper and connect them with a smooth line. A slow, tedious method, especially for functions that change rapidly.",
    h2_2_p2: "Today, the tool at the top of this page works on the same principle, but with calculations done in fractions of a second. You write the function, press \"plot,\" and look.",
    callout: "💡 Practical tip: don't start with a wide range like -100 to 100. Start from -5 to 5, look at the curve's shape, then expand gradually. Most students make the same mistake: they open a wide range, see a nearly straight line, and think the function is simple.",
    h2_3: "Three Functions Worth Plotting With Your Own Eyes",
    h3_1: "The Quadratic Function, But the Coefficient Matters",
    h3_1_p: "Everyone knows the shape of x². A parabola opening upward. But try plotting 0.1*x² and 10*x² on the same graph. Same shape, but the feel is completely different. The first seems to crawl slowly, the second explodes after x=2. That's the difference between \"I understand\" and \"I see.\"",
    h3_2: "The Sine Function, Where Vision Deceives You",
    h3_2_p: "sin(x) looks simple. A wave repeating every 2π. But when you plot sin(1/x) and zoom in toward zero, you'll see something strange: infinite oscillations crowding into a tiny space. This is a classic example of a \"badly behaved\" function at a specific point. Try it in the tool, zoom toward zero, and you'll understand why mathematicians love this function despite its difficulty.",
    h3_3: "The Function e^x: When the Graph Looks Simple But Isn't",
    h3_3_p: "It looks like a smooth curve. But it grows faster than any human intuition. At x=10, the value exceeds 22,000. At x=20, it approaches half a billion. This isn't an ordinary curve — it's a visual explosion. That's why it's used in population growth models, compound interest, and spread rates. Because real growth in nature is rarely linear.",
    h2_4: "Mistakes I've Seen Dozens of Times",
    h2_4_li: [
      "Writing sin x without parentheses. The tool, and any respectable calculator, wants sin(x). The difference in writing is small, but it turns the result upside down.",
      "Forgetting parentheses in exponents. x^2+1 is not the same as x^(2+1). The first is a parabola, the second is a cubic function. The final result is completely different, and the error usually comes from carelessness, not ignorance.",
      "Mixing up ln and log. Many think they're the same function. They're not. ln is base e, and log is base 10. Their graphs are different, their algebraic properties are different, and confusing them in a physics problem could waste hours.",
      "Plotting a function on a range that doesn't suit it. A logarithmic function on a range from -10 to 10 will show only half a curve, because ln(x) isn't even defined for negative values. The issue isn't with the tool — it's with the range you chose.",
    ],
    h2_5: "Small Details You Might Not Notice",
    h2_5_p1: "If you click the \"Share\" button, it copies a link containing your functions and plot range. You can paste it in Twitter or WhatsApp, and it opens for the recipient in the exact shape you see now.",
    h2_5_p2: "The \"Saved Sets\" button stores your function collections in your browser. Useful if you're preparing a lesson and want to keep a specific arrangement. Give it a name like \"Homework\" or \"Example 2,\" and return to it anytime.",
    h2_5_p3: "And JSON export is useful for permanent sharing. Send the file to a friend, they import it into their tool, and get exactly the same functions. No intermediary, no expiring link, just one file.",
    h2_faq: "Frequently Asked Questions",
    faqs: [
      { q: "Can I plot more than one function at the same time?", a: "Yes, up to four. Click \"Add Function.\" Each function gets a different color, and in the table below the plot you'll see a column for each one. Very useful for comparing the behavior of two functions, like sin(x) and x − x³/6 for approximation." },
      { q: "Why does the graph look broken for some functions?", a: "This isn't a problem with the tool. Some functions like tan(x) have vertical asymptotes, where they jump from +∞ to −∞. The tool detects this jump and breaks the line, which is the mathematically correct behavior. A line connecting both sides would actually be wrong." },
      { q: "What accuracy does the tool provide?", a: "The tool plots at 2400 points across the specified range. In a range from -10 to 10, this means accuracy of about 0.008 per point. More than enough for educational use." },
      { q: "Can I plot implicit functions like x² + y² = 4?", a: "No, the tool plots functions in the form y = f(x) only. Implicit functions require different algorithms. This tool isn't the right one for them." },
      { q: "Is the data I enter sent to a server?", a: "No. Everything runs in your browser. The functions, the plotting, the saved sets storage — all happen locally. There are no external connections after the page loads. You can even disconnect the internet and use the tool normally." },
    ],
    h2_concl: "A Final Word",
    concl_p1: "Plotting isn't an extra step — it's the way we \"see\" mathematics. The equation tells you the relationship, and the graph tells you the shape. Any attempt to understand a function without plotting it is a half-complete attempt.",
    concl_p2: "If I could give you one piece of advice, it's this: don't plot to verify a solution, plot to think. Many mathematical ideas come after looking at a strange curve and wondering: why does it look like that?",
    disclaimer: "Note: The tool is educational, and results may be subject to error in extreme numerical computation cases. For critical cases, consult your teacher or use a specialized tool.",
    author: "✍️ Published on",
    authorUpdated: "— Last updated: January 2026.",
  },
};

function FaqItem({ q, a, rtl }) {
  return (
    <details className="group bg-white dark:bg-[#2D2A5A] border border-[#F3F4F6] dark:border-[#4B3F8A] rounded-xl mb-2.5 transition-all open:border-[#6D28D9] open:ring-2 open:ring-[#6D28D9]/10">
      <summary className={`cursor-pointer list-none flex items-center justify-between p-4 text-[15.5px] font-semibold text-[#111827] dark:text-[#FEF3C7] ${rtl ? "text-right" : "text-left"}`}>
        {q}
        <span className="text-[#6D28D9] dark:text-[#FBBF24] text-xl font-normal transition-transform group-open:rotate-45 shrink-0">+</span>
      </summary>
      <p className="px-4 pb-4 text-[15px] text-[#374151] dark:text-[#D6D2EE] leading-relaxed">{a}</p>
    </details>
  );
}

export default function MathFunctionArticle() {
  const { lang } = useI18n();
  const isAr = lang === "ar";
  const c = isAr ? CONTENT.ar : CONTENT.en;
  const rtl = isAr;

  return (
    <article dir={c.dir} className="prose-content max-w-3xl mx-auto">
      {/* Divider */}
      <div className="my-8 flex items-center gap-3">
        <div className={`h-px flex-1 ${rtl ? "bg-gradient-to-l" : "bg-gradient-to-r"} from-[#6D28D9] to-transparent`} />
        <span className="text-xs font-bold text-[#6D28D9] dark:text-[#FBBF24] whitespace-nowrap uppercase tracking-wide">{c.badge}</span>
        <div className={`h-px flex-1 ${rtl ? "bg-gradient-to-r" : "bg-gradient-to-l"} from-[#F59E0B] to-transparent`} />
      </div>

      <h2 className="text-2xl font-bold text-[#0f766e] dark:text-[#FBBF24] mb-4 border-b border-border pb-2">{c.title}</h2>

      {/* Intro */}
      <div className="bg-gradient-to-br from-[#6D28D9]/5 to-[#a855f7]/5 border-r-4 border-[#6D28D9] rounded-lg p-4 mb-6 text-base text-[#111827] dark:text-[#FEF3C7] leading-relaxed">
        {c.intro}
      </div>

      <p className="text-sm text-[#374151] dark:text-[#D6D2EE] leading-relaxed mb-3">{c.p1}</p>

      {/* Tool link */}
      <a href="#calculator" className="block text-center bg-gradient-to-r from-[#6D28D9] to-[#F59E0B] text-white font-bold py-3 px-4 rounded-xl my-6 hover:opacity-90 transition-opacity">
        {c.tryCalc}
      </a>

      {/* H2_1 */}
      <h3 className="text-xl font-bold text-[#0f766e] dark:text-[#FBBF24] mt-8 mb-3 border-b border-border pb-1">{c.h2_1}</h3>
      <p className="text-sm text-[#374151] dark:text-[#D6D2EE] leading-relaxed mb-3">{c.h2_1_p1}</p>
      <p className="text-sm text-[#374151] dark:text-[#D6D2EE] leading-relaxed mb-3">{c.h2_1_p2}</p>
      <p className="text-sm text-[#374151] dark:text-[#D6D2EE] leading-relaxed mb-3">{c.h2_1_p3}</p>

      {/* H2_2 */}
      <h3 className="text-xl font-bold text-[#0f766e] dark:text-[#FBBF24] mt-8 mb-3 border-b border-border pb-1">{c.h2_2}</h3>
      <p className="text-sm text-[#374151] dark:text-[#D6D2EE] leading-relaxed mb-3">{c.h2_2_p1}</p>
      <p className="text-sm text-[#374151] dark:text-[#D6D2EE] leading-relaxed mb-3">{c.h2_2_p2}</p>

      {/* Callout */}
      <div className="bg-[#eab308]/10 border-r-4 border-[#eab308] rounded-lg p-4 my-5 text-[15px] text-[#111827] dark:text-[#FEF3C7]">
        {c.callout}
      </div>

      {/* H2_3 */}
      <h3 className="text-xl font-bold text-[#0f766e] dark:text-[#FBBF24] mt-8 mb-3 border-b border-border pb-1">{c.h2_3}</h3>
      <h4 className="text-base font-bold text-[#134e4a] dark:text-[#FBBF24] mt-5 mb-2">{c.h3_1}</h4>
      <p className="text-sm text-[#374151] dark:text-[#D6D2EE] leading-relaxed mb-3">{c.h3_1_p}</p>
      <h4 className="text-base font-bold text-[#134e4a] dark:text-[#FBBF24] mt-5 mb-2">{c.h3_2}</h4>
      <p className="text-sm text-[#374151] dark:text-[#D6D2EE] leading-relaxed mb-3">{c.h3_2_p}</p>
      <h4 className="text-base font-bold text-[#134e4a] dark:text-[#FBBF24] mt-5 mb-2">{c.h3_3}</h4>
      <p className="text-sm text-[#374151] dark:text-[#D6D2EE] leading-relaxed mb-3">{c.h3_3_p}</p>

      {/* H2_4 */}
      <h3 className="text-xl font-bold text-[#0f766e] dark:text-[#FBBF24] mt-8 mb-3 border-b border-border pb-1">{c.h2_4}</h3>
      <ul className={`list-disc ${rtl ? "pr-5" : "pl-5"} mb-4 space-y-2 text-sm text-[#374151] dark:text-[#D6D2EE]`}>
        {c.h2_4_li.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>

      {/* H2_5 */}
      <h3 className="text-xl font-bold text-[#0f766e] dark:text-[#FBBF24] mt-8 mb-3 border-b border-border pb-1">{c.h2_5}</h3>
      <p className="text-sm text-[#374151] dark:text-[#D6D2EE] leading-relaxed mb-3">{c.h2_5_p1}</p>
      <p className="text-sm text-[#374151] dark:text-[#D6D2EE] leading-relaxed mb-3">{c.h2_5_p2}</p>
      <p className="text-sm text-[#374151] dark:text-[#D6D2EE] leading-relaxed mb-3">{c.h2_5_p3}</p>

      {/* FAQ */}
      <h3 className="text-xl font-bold text-[#0f766e] dark:text-[#FBBF24] mt-8 mb-3 border-b border-border pb-1">{c.h2_faq}</h3>
      <div className="space-y-2.5">
        {c.faqs.map((f, i) => <FaqItem key={i} q={f.q} a={f.a} rtl={rtl} />)}
      </div>

      {/* Conclusion */}
      <h3 className="text-xl font-bold text-[#0f766e] dark:text-[#FBBF24] mt-8 mb-3 border-b border-border pb-1">{c.h2_concl}</h3>
      <p className="text-sm text-[#374151] dark:text-[#D6D2EE] leading-relaxed mb-3">{c.concl_p1}</p>
      <p className="text-sm text-[#374151] dark:text-[#D6D2EE] leading-relaxed mb-3">{c.concl_p2}</p>

      {/* Disclaimer */}
      <div className={`bg-[#F9FAFB] dark:bg-[#1E1B4B] ${rtl ? "border-r-4" : "border-l-4"} border-[#94A3B8] dark:border-[#8B8AB0] rounded-lg p-4 mt-6 text-[13.5px] text-[#475569] dark:text-[#8B8AB0]`}>
        <strong>{isAr ? "ملاحظة:" : "Note:"}</strong> {c.disclaimer}
      </div>

      {/* Author */}
      <div className="border-t border-border mt-8 pt-4 text-xs text-[#94A3B8] dark:text-[#8B8AB0]">
        <p>{c.author} <Link to="/" className="text-[#6D28D9] dark:text-[#FBBF24] hover:underline">iyadel.com</Link> {c.authorUpdated}</p>
      </div>
    </article>
  );
}