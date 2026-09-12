import { useI18n } from "@/lib/i18n";
import { Clock, AlertTriangle, Lightbulb } from "lucide-react";

const CONTENT = {
  en: {
    intro:
      "I remember the first time I tried to calculate my work hours at a small restaurant. I'd write '7 hours and 45 minutes' on a sheet, then try to convert it to a decimal for the payroll spreadsheet. It took me ten minutes, and I got it wrong twice. A simple time converter would have done it in two seconds. This article isn't a math lesson — it's notes from years of dealing with time daily, and mistakes I made myself.",
    p1: "Time is a strange thing. We deal with it every day, but converting between its units trips many people up in small ways. The truth is most errors aren't hard — they come from lack of attention or wrong assumptions about how the sexagesimal system works.",
    h2_why: "Why is conversion hard for people?",
    p2: "The main reason is that an hour isn't 100 minutes. We live in a decimal system for most things, then deal with time in a sexagesimal system (60 minutes, 60 seconds). This contradiction creates real confusion.",
    p3: "If an hour were 100 minutes, converting 7 hours and 45 minutes would just be 7.45. But it's not. 45 minutes isn't 0.45 of an hour — it's 0.75. That's the difference between a correct and a completely wrong result.",
    p4: "The problem shows up clearly in payroll systems. Many companies ask employees to write their hours in decimal format. Those who know the rule write 7.75; those who don't write 7.45 and lose part of their pay without realizing it. Not because anyone is stealing, but because the two systems are different.",
    h2_decimal: "Decimal hours: what I wish someone had explained",
    p5: "The idea is simple: one minute is 1/60 of an hour. So to convert minutes to a decimal fraction, divide them by 60.",
    p6: "15 minutes = 0.25 hour. 30 minutes = 0.5 hour. 45 minutes = 0.75 hour. These numbers become familiar over time, but in the beginning you need a calculator or a tool to do it for you.",
    p7: "The general rule: Decimal hours = Hours + (Minutes ÷ 60). Nothing more. If you work 8 hours and 20 minutes, then 20 ÷ 60 = 0.333, and the result is 8.333 decimal hours. You can round to 8.33 or 8.34 depending on your payroll system's precision.",
    callout: "Practical tip: If you fill a weekly timesheet, memorize a small table: 6 minutes = 0.1, 12 minutes = 0.2, 15 minutes = 0.25, 30 minutes = 0.5, 45 minutes = 0.75. These standard values cover most cases.",
    h2_month: "Month and year: the two units that fool people",
    p8: "Conversion between seconds, minutes, and hours is straightforward. But when you reach months and years, things become less obvious. The logical question: how many days in a month?",
    p9: "The honest answer: there's no single answer. February is 28 days (29 in a leap year), January is 31, April is 30. If you calculate the month as a mathematical average over a full year, you get about 30.44 days. And the year itself isn't exactly 365 days, but 365.25 on average.",
    p10: "For this reason, most global converters (including Google's famous converter) use:",
    ul1: [
      "Year = 365.25 days = 8,766 hours = 525,960 minutes",
      "Month = Year ÷ 12 = 30.4375 days ≈ 730.5 hours",
    ],
    p11: "These are average values, and they're suitable for most uses. But if you're calculating a lease duration from January to December, don't use them. Go directly to the calendar and count the actual difference between the dates.",
    h3_when: "When do you actually need month and year conversion?",
    p12: "There are many practical cases. For example, if you're calculating a project's age in hours and want to know how many years it took. Or calculating an employee's service duration in months instead of days. Or estimating a battery's lifespan in years based on a daily consumption rate.",
    p13: "In all these cases, the average is sufficient. No one needs single-day precision in a project that lasted 5 years. But being aware that these are approximate values matters, especially if you're writing an official report.",
    h2_mistakes: "Mistakes I've seen more than once",
    p14: "The first and most common: mixing up minutes and decimal fractions. Someone writes 6 hours and 30 minutes as 6.30 instead of 6.5. The difference seems small, but it means losing 20 minutes of pay each workday. Over a month, the loss can reach full hours.",
    p15: "The second: using 'month = 30 days' as an absolute. This works for estimates, but fails in contracts and legal commitments. A contract from February 1 to March 1 isn't 30 days — it's 28 or 29.",
    p16: "The third: relying on rounding too early. If you convert 7 hours and 50 minutes to 7.8 instead of 7.833, the difference might be acceptable in normal context but unacceptable in a precise payroll system. Best to keep the full fraction until the end, then round in the last step.",
    p17: "The fourth: not paying attention to time zones when converting dates. But that's a different topic — converting dates between time zones isn't the same as converting time units. The key thing to know: time conversion as a measurement system differs from converting dates between zones.",
    h2_table1: "Quick minutes-to-decimal table",
    th1: ["Minutes", "Decimal Hours", "Common Use"],
    table1: [
      ["5 minutes", "0.083", "Short break"],
      ["10 minutes", "0.167", "Quick meeting"],
      ["15 minutes", "0.25", "Quarter hour"],
      ["20 minutes", "0.333", "Third of an hour"],
      ["30 minutes", "0.5", "Half hour"],
      ["40 minutes", "0.667", "Two-thirds hour"],
      ["45 minutes", "0.75", "Three-quarters hour"],
      ["50 minutes", "0.833", "Five-sixths hour"],
    ],
    h2_table2: "Reference table for larger units",
    th2: ["Unit", "In Hours", "In Minutes"],
    table2: [
      ["Day", "24", "1,440"],
      ["Week", "168", "10,080"],
      ["Month (average)", "730.5", "43,830"],
      ["Year", "8,766", "525,960"],
    ],
    p18: "These numbers are based on accepted averages. If you want a quick comparison with a regular calendar year (365 days), the year would be 8,760 hours instead of 8,766. The difference is 6 hours over a full year — not huge, but it shows up in long reports.",
    h2_details: "Small details you might miss",
    p19: "The tool above doesn't just handle hours and minutes. You can convert between any two units, from seconds to years, and from months to weeks. This is useful in different contexts — calculating a film's duration in hours and wanting to know the minutes, or a training duration in seconds and wanting hours, or a project's age in months and wanting weeks.",
    p20: "The 'Value in All Units' table gives you a quick picture of the number you entered across every unit at once. Useful when you're unsure which unit fits, or when you want a fast comparison. Note that the selected result unit carries a ◄ mark for easy identification.",
    p21: "The swap button (⇄) lets you reverse the units with one click. If you entered 120 minutes and converted to hours, then want to see the reverse, press the button and everything flips.",
    h2_faq: "Frequently asked questions",
    faqs: [
      { q: "How do I convert 7 hours and 45 minutes to decimal hours?", a: "45 minutes = 45 ÷ 60 = 0.75 hour. So 7 hours and 45 minutes = 7.75 decimal hours. This is the format most payroll and timesheet systems require." },
      { q: "How many seconds in a day?", a: "24 hours × 60 minutes × 60 seconds = 86,400 seconds. The tool calculates this automatically if you enter 1 day and select 'seconds' as the result." },
      { q: "How many hours in a year?", a: "A calendar year is 365 days, with a leap year every 4 years. So the internationally accepted average is 365.25 days = 8,766 hours = 525,960 minutes. A regular year (365 days) is 8,760 hours." },
      { q: "Can I use it to calculate work hours for payroll?", a: "Yes — enter the hours and minutes and read the decimal result, like 6 hours and 30 minutes = 6.5 hours, ready to enter into any payroll system." },
      { q: "Why is 45 minutes equal to 0.75 and not 0.45?", a: "Because an hour is 60 minutes, not 100. The decimal fraction is calculated by dividing minutes by 60. 45 ÷ 60 = 0.75. If an hour were 100 minutes, the answer would be 0.45, but our time system is sexagesimal." },
      { q: "Is a month always 30.44 days?", a: "No, this is only an average. Actual months range from 28 to 31 days. The average is useful for quick mathematical conversions but inaccurate for contracts and legal commitments that need actual date counting." },
      { q: "Does the tool work offline?", a: "Yes. After the page loads, all calculations happen in your browser. There are no external connections, and no data is sent anywhere." },
    ],
    h2_final: "A final word",
    p22: "Time is something we deal with every day, but we rarely think about its units. Converting between them is a small skill, but it saves real time and avoids costly mistakes. Whether you're an employee filling a timesheet, a student calculating an experiment's duration, or just someone who wants to know how many minutes are in a year, the tool above is designed to be the fastest path to the answer.",
    p23: "If I give you one piece of advice: don't rely on memory for conversions. Even if you know the rule, mistakes happen. Use a tool, or keep a small table in front of you. The minutes you save thinking, you invest in something more important.",
    disclaimer: "The tool is accurate for standard conversions. For cases involving time zones or complex calendars, consult specialized sources.",
    author: "Published on iyadel.com — last updated: January 2026.",
  },
  ar: {
    intro:
      "أتذكر أول مرة حاولت فيها حساب ساعات عملي في مطعم صغير. كنت أكتب \"7 ساعات و45 دقيقة\" في ورقة، ثم أحاول تحويلها إلى رقم عشري لأدخله في جدول الرواتب. أخذت مني عشر دقائق، وأخطأت مرتين. لو كان لدي محول وقت بسيط، لانتهى الأمر في ثانيتين. هذا المقال ليس درسًا في الرياضيات، بل ملاحظات من سنوات من التعامل اليومي مع الوقت، وأخطاء ارتكبتها بنفسي.",
    p1: "الوقت شيء غريب. نتعامل معه كل يوم، لكن تحويله بين وحداته يوقع الكثيرين في حفر صغيرة. والحقيقة أن معظم الأخطاء ليست صعبة، بل ناتجة عن قلة الانتباه أو عن افتراضات خاطئة حول كيفية عمل النظام الستيني.",
    h2_why: "لماذا التحويل صعب على الناس؟",
    p2: "السبب الرئيسي أن الساعة ليست 100 دقيقة. نحن نعيش في نظام عشري في معظم أمورنا، ثم نتعامل مع الوقت بنظام ستيني (60 دقيقة، 60 ثانية). هذا التناقض يخلق ارتباكًا حقيقيًا.",
    p3: "لو كانت الساعة 100 دقيقة، لكان تحويل 7 ساعات و45 دقيقة مجرد 7.45. لكنها ليست كذلك. 45 دقيقة ليست 0.45 من الساعة، بل 0.75. هذا الفرق بين نتيجة صحيحة وأخرى خاطئة تمامًا.",
    p4: "المشكلة تظهر بوضوح في أنظمة الرواتب. كثير من الشركات تطلب من الموظف أن يكتب ساعات عمله بصيغة عشرية. من يعرف القاعدة يكتب 7.75، ومن لا يعرفها يكتب 7.45، ويفقد جزءًا من راتبه دون أن يدري. ليس لأن أحدًا يسرق، بل لأن النظامين مختلفان.",
    h2_decimal: "الساعات العشرية: ما كنت أتمنى أن أحدًا شرحه لي",
    p5: "الفكرة بسيطة: دقيقة واحدة هي 1/60 من الساعة. إذن، لتحويل الدقائق إلى كسر عشري، اقسمها على 60.",
    p6: "15 دقيقة = 0.25 ساعة. 30 دقيقة = 0.5 ساعة. 45 دقيقة = 0.75 ساعة. هذه الأرقام تصبح معروفة بعد فترة، لكن في البداية تحتاج إلى آلة حاسبة أو أداة تحسب لك.",
    p7: "القاعدة العامة: الساعات العشرية = الساعات + (الدقائق ÷ 60). لا شيء أكثر من ذلك. لو كنت تعمل 8 ساعات و20 دقيقة، إذن 20 ÷ 60 = 0.333، والنتيجة 8.333 ساعة عشرية. يمكنك تقريبها إلى 8.33 أو 8.34 حسب دقة نظام الرواتب عندك.",
    callout: "نصيحة عملية: إذا كنت تملأ كشف ساعات أسبوعيًا، احفظ جدولًا صغيرًا في ذهنك: 6 دقائق = 0.1، 12 دقيقة = 0.2، 15 دقيقة = 0.25، 30 دقيقة = 0.5، 45 دقيقة = 0.75. هذه القيم القياسية تغطي معظم الحالات.",
    h2_month: "الشهر والسنة: الوحدتان اللتان تخدعان الناس",
    p8: "التحويل بين الثواني والدقائق والساعات مباشر. لكن حين تصل إلى الشهر والسنة، تصبح الأمور أقل بداهة. والسؤال المنطقي: كم يوماً في الشهر؟",
    p9: "الجواب الصادق: لا يوجد جواب واحد. فبراير 28 يوماً (29 في السنة الكبيسة)، ويناير 31 يوماً، وأبريل 30. لو حسبت الشهر بمتوسط رياضي على مدى سنة كاملة، ستحصل على 30.44 يوماً تقريباً. ولو أخذت السنة نفسها، فليست 365 يوماً بالضبط، بل 365.25 في المتوسط.",
    p10: "لهذا السبب، معظم المحولات العالمية (بما فيها محول جوجل الشهير) تستخدم:",
    ul1: [
      "السنة = 365.25 يوماً = 8,766 ساعة = 525,960 دقيقة",
      "الشهر = السنة ÷ 12 = 30.4375 يوماً ≈ 730.5 ساعة",
    ],
    p11: "هذه القيم متوسطات، وهي الأنسب لمعظم الاستخدامات. لكن لو كنت تحسب مدة عقد إيجار من يناير إلى ديسمبر، فلا تستخدمها. اذهب مباشرة إلى التقويم واحسب الفرق الحقيقي بين التاريخين.",
    h3_when: "متى تحتاج تحويل الشهر والسنة فعلاً؟",
    p12: "هناك حالات عملية كثيرة. مثلًا، لو كنت تحسب عمر مشروع بالساعات، وتريد أن تعرف كم سنة استغرق. أو تحسب مدة خدمة موظف بالأشهر بدل الأيام. أو تحسب مدة بقاء بطارية بالسنوات بناءً على معدل استهلاك يومي.",
    p13: "في كل هذه الحالات، المتوسط كافٍ. لا أحد يحتاج دقة اليوم الواحد في مشروع استمر 5 سنوات. لكن الانتباه إلى أن هذه القيم تقديرية مهم، خاصة إن كنت تكتب تقريراً رسمياً.",
    h2_mistakes: "أخطاء رأيتها بنفسي أكثر من مرة",
    p14: "الخطأ الأول والأشهر: الخلط بين الدقائق والكسر العشري. شخص يكتب 6 ساعات و30 دقيقة في شكل 6.30 بدل 6.5. الفرق يبدو صغيرًا، لكنه يعني خسارة 20 دقيقة من الأجر في كل يوم عمل. خلال شهر، قد تصل الخسارة إلى ساعات كاملة.",
    p15: "الخطأ الثاني: استخدام \"شهر = 30 يوماً\" بشكل مطلق. هذا يعمل لو كنت تحسب تقديرياً، لكنه يخيب في العقود والالتزامات القانونية. عقد من 1 فبراير إلى 1 مارس ليس 30 يوماً، بل 28 أو 29.",
    p16: "الخطأ الثالث: الاعتماد على التقريب في مرحلة مبكرة. لو حولت 7 ساعات و50 دقيقة إلى 7.8 بدل 7.833، قد يكون الفرق مقبولاً في سياق عادي، لكنه غير مقبول في نظام رواتب دقيق. الأفضل أن تحتفظ بالكسر الكامل حتى النهاية، ثم تقرب في الخطوة الأخيرة.",
    p17: "الخطأ الرابع: عدم الانتباه إلى المنطقة الزمنية عند تحويل التواريخ. لكن هذا موضوع آخر، وليس تحويل الوحدات نفسه. المهم أن تعرف: تحويل الوقت كنظام قياس يختلف عن تحويل التواريخ بين مناطق زمنية.",
    h2_table1: "جدول صغير لتحويل الدقائق",
    th1: ["الدقائق", "الساعات العشرية", "الاستخدام الشائع"],
    table1: [
      ["5 دقائق", "0.083", "فترة راحة قصيرة"],
      ["10 دقائق", "0.167", "اجتماع سريع"],
      ["15 دقيقة", "0.25", "ربع ساعة"],
      ["20 دقيقة", "0.333", "ثلث ساعة"],
      ["30 دقيقة", "0.5", "نصف ساعة"],
      ["40 دقيقة", "0.667", "ثلثا ساعة"],
      ["45 دقيقة", "0.75", "ثلاثة أرباع ساعة"],
      ["50 دقيقة", "0.833", "خمسة أسداس ساعة"],
    ],
    h2_table2: "جدول مرجعي للوحدات الأكبر",
    th2: ["الوحدة", "بالساعات", "بالدقائق"],
    table2: [
      ["يوم", "24", "1,440"],
      ["أسبوع", "168", "10,080"],
      ["شهر (متوسط)", "730.5", "43,830"],
      ["سنة", "8,766", "525,960"],
    ],
    p18: "هذه الأرقام مأخوذة من المتوسطات المعتمدة. لو أردت مقارنة سريعة مع أرقام السنة الميلادية العادية (365 يوماً)، ستكون السنة 8,760 ساعة بدل 8,766. الفرق 6 ساعات على مدى عام كامل. ليس ضخماً، لكنه يظهر في التقارير الطويلة.",
    h2_details: "تفاصيل صغيرة قد تفوتك",
    p19: "الأداة في الأعلى لا تتعامل فقط مع الساعات والدقائق. يمكنك تحويل بين أي وحدتين، من الثواني إلى السنوات، ومن الأشهر إلى الأسابيع. هذا مفيد في سياقات مختلفة. مثلًا، لو كنت تحسب مدة فيلم بالساعات وتريد أن تعرف كم دقيقة، أو تحسب مدة تدريب بالثواني وتريد أن تعرف كم ساعة، أو تحسب عمر مشروع بالأشهر وتريد أن تعرف كم أسبوع.",
    p20: "جدول \"القيمة بكل الوحدات\" يعطيك صورة سريعة عن حجم الرقم الذي أدخلته في كل الوحدات دفعة واحدة. مفيد عندما تكون غير متأكد من الوحدة المناسبة، أو عندما تريد مقارنة بسرعة. لاحظ أن الوحدة المختارة كنتيجة تحمل علامة ◄ في الجدول، لتسهيل التمييز.",
    p21: "وزر التبديل (⇄) يسمح لك بعكس الوحدات بنقرة واحدة. لو أدخلت 120 دقيقة وحولتها إلى ساعات، ثم أردت أن ترى العكس، اضغط الزر وسيتغير كل شيء.",
    h2_faq: "أسئلة يطرحها الناس عادة",
    faqs: [
      { q: "كيف أحول 7 ساعات و45 دقيقة إلى ساعات عشرية؟", a: "45 دقيقة = 45 ÷ 60 = 0.75 ساعة. إذن 7 ساعات و45 دقيقة = 7.75 ساعة عشرية. هذه هي الصيغة التي تطلبها معظم أنظمة الرواتب والجداول الزمنية." },
      { q: "كم ثانية في اليوم الواحد؟", a: "24 ساعة × 60 دقيقة × 60 ثانية = 86,400 ثانية. الأداة تحسب هذا تلقائيًا لو أدخلت 1 يوم واخترت \"ثانية\" كنتيجة." },
      { q: "كم ساعة في السنة الواحدة؟", a: "السنة الميلادية 365 يوماً، وتضاف إليها سنة كبيسة كل 4 سنوات. لذا المتوسط المعتمد دولياً هو 365.25 يوماً = 8,766 ساعة = 525,960 دقيقة. لو أخذنا السنة العادية فقط (365 يوماً)، ستكون 8,760 ساعة." },
      { q: "هل يمكن استخدامه لحساب ساعات العمل في كشف الرواتب؟", a: "نعم، أدخل الساعات والدقائق واقرأ النتيجة العشرية، مثل 6 ساعات و30 دقيقة = 6.5 ساعة، جاهزة للإدخال في أي نظام رواتب." },
      { q: "لماذا 45 دقيقة تساوي 0.75 وليس 0.45؟", a: "لأن الساعة 60 دقيقة، وليس 100. الكسر العشري يُحسب بقسمة الدقائق على 60. 45 ÷ 60 = 0.75. لو كانت الساعة 100 دقيقة، لكان الجواب 0.45، لكن نظامنا الزمني ستيني." },
      { q: "هل الشهر دائماً 30.44 يوماً؟", a: "لا، هذه قيمة متوسطة فقط. الشهور الفعلية تتراوح بين 28 و31 يوماً. المتوسط مفيد للتحويلات الرياضية السريعة، لكنه غير دقيق للعقود والالتزامات القانونية التي تحتاج حساباً بالتواريخ الفعلية." },
      { q: "هل تعمل الأداة بدون إنترنت؟", a: "نعم. بعد تحميل الصفحة، كل الحسابات تتم في المتصفح. لا توجد أي اتصالات خارجية، ولا يتم إرسال أي بيانات." },
    ],
    h2_final: "كلمة أخيرة",
    p22: "الوقت شيء نتعامل معه كل يوم، لكن قليلًا ما نفكر في وحداته. التحويل بينها مهارة صغيرة، لكنها توفّر وقتًا حقيقيًا وتجنّب أخطاء مكلفة. سواء كنت موظفًا يملأ كشف ساعات، أو طالبًا يحسب مدة تجربة، أو مجرد شخص يريد أن يعرف كم دقيقة في السنة، الأداة في الأعلى مصممة لتكون أسرع طريق للإجابة.",
    p23: "لو أعطيتك نصيحة واحدة، فهي: لا تعتمد على الذاكرة في التحويلات. حتى لو كنت تعرف القاعدة، الخطأ وارد. استخدم أداة، أو احتفظ بجدول صغير أمامك. الدقائق التي توفّرها في التفكير، تستثمرها في شيء أهم.",
    disclaimer: "الأداة دقيقة في التحويلات القياسية. للحالات التي تتضمن مناطق زمنية أو تقويمات معقدة، راجع مصادر متخصصة.",
    author: "نُشر على iyadel.com — آخر تحديث: يناير 2026.",
  },
};

function ArticleTable({ headers, rows }) {
  return (
    <div className="overflow-x-auto my-5 rounded-xl border border-[#F3F4F6] dark:border-[#4B3F8A] shadow-sm">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-[#FFFBEB] dark:bg-[#2D2A5A]">
            {headers.map((h, i) => (
              <th key={i} className="px-4 py-2.5 text-start font-semibold text-[#111827] dark:text-[#FEF3C7] border-b border-[#F3F4F6] dark:border-[#4B3F8A]">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-t border-[#F3F4F6] dark:border-[#4B3F8A]">
              {row.map((cell, j) => (
                <td key={j} className="px-4 py-2.5 text-[#374151] dark:text-[#D6D2EE]">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function TimeConverterArticle() {
  const { lang, isRTL } = useI18n();
  const c = CONTENT[lang];
  const dir = isRTL ? "rtl" : "ltr";
  const h2Class = "text-xl font-bold text-[#111827] dark:text-[#FEF3C7] mt-8 mb-3 pb-2 border-b-2 border-[#FDE68A] dark:border-[#4B3F8A]";
  const h3Class = "text-[17px] font-semibold text-[#6D28D9] dark:text-[#FBBF24] mt-6 mb-2.5";
  const pClass = "text-sm text-[#374151] dark:text-[#D6D2EE] leading-relaxed mb-3.5";
  const ulClass = `list-disc ${isRTL ? "pr-5" : "pl-5"} mb-4 space-y-2`;

  return (
    <article dir={dir} className="prose-content max-w-3xl">
      <h1 className="text-2xl font-bold text-[#111827] dark:text-[#FEF3C7] mb-4 leading-tight">
        {lang === "ar" ? "تحويل الوقت: من الجدول المدرسي إلى كشف الرواتب" : "Time Conversion: From the School Schedule to the Payroll Sheet"}
      </h1>

      <div className="text-[15px] bg-gradient-to-br from-[#FFFBEB] to-[#FEF9C3] dark:from-[#2D2A5A] dark:to-[#1E1B4B] border-s-4 border-[#6D28D9] rounded-r-lg p-4 mb-6 text-[#111827] dark:text-[#FEF3C7] leading-loose">
        {c.intro}
      </div>

      <p className={pClass}>{c.p1}</p>

      <h2 className={h2Class}>{c.h2_why}</h2>
      <p className={pClass}>{c.p2}</p>
      <p className={pClass}>{c.p3}</p>
      <p className={pClass}>{c.p4}</p>

      <h2 className={h2Class}>{c.h2_decimal}</h2>
      <p className={pClass}>{c.p5}</p>
      <p className={pClass}>{c.p6}</p>
      <p className={pClass}>{c.p7}</p>

      <div className="flex items-start gap-2.5 bg-[#FEF9C3] dark:bg-[#2D2A5A] border-s-4 border-[#F59E0B] rounded-r-lg p-4 my-5 text-sm text-[#111827] dark:text-[#FEF3C7] leading-relaxed">
        <Lightbulb className="w-4 h-4 shrink-0 mt-0.5 text-[#F59E0B]" />
        <span>{c.callout}</span>
      </div>

      <h2 className={h2Class}>{c.h2_month}</h2>
      <p className={pClass}>{c.p8}</p>
      <p className={pClass}>{c.p9}</p>
      <p className={pClass}>{c.p10}</p>
      <ul className={ulClass}>
        {c.ul1.map((item, i) => (
          <li key={i} className="text-sm text-[#374151] dark:text-[#D6D2EE]">{item}</li>
        ))}
      </ul>
      <p className={pClass}>{c.p11}</p>

      <h3 className={h3Class}>{c.h3_when}</h3>
      <p className={pClass}>{c.p12}</p>
      <p className={pClass}>{c.p13}</p>

      <h2 className={h2Class}>{c.h2_mistakes}</h2>
      <p className={pClass}>{c.p14}</p>
      <p className={pClass}>{c.p15}</p>
      <p className={pClass}>{c.p16}</p>
      <p className={pClass}>{c.p17}</p>

      <h2 className={h2Class}>{c.h2_table1}</h2>
      <ArticleTable headers={c.th1} rows={c.table1} />

      <h2 className={h2Class}>{c.h2_table2}</h2>
      <ArticleTable headers={c.th2} rows={c.table2} />
      <p className={pClass}>{c.p18}</p>

      <h2 className={h2Class}>{c.h2_details}</h2>
      <p className={pClass}>{c.p19}</p>
      <p className={pClass}>{c.p20}</p>
      <p className={pClass}>{c.p21}</p>

      <h2 className={h2Class}>{c.h2_faq}</h2>
      <div className="space-y-2.5 mb-6">
        {c.faqs.map((f, i) => (
          <details key={i} className="group bg-white dark:bg-[#2D2A5A] border border-[#F3F4F6] dark:border-[#4B3F8A] rounded-xl">
            <summary className="cursor-pointer list-none flex items-center justify-between p-4 text-sm font-semibold text-[#111827] dark:text-[#FEF3C7]">
              {f.q}
              <span className="text-[#6D28D9] dark:text-[#FBBF24] text-xl font-light transition-transform group-open:rotate-45">+</span>
            </summary>
            <p className="px-4 pb-4 text-sm text-[#374151] dark:text-[#D6D2EE] leading-relaxed">{f.a}</p>
          </details>
        ))}
      </div>

      <h2 className={h2Class}>{c.h2_final}</h2>
      <p className={pClass}>{c.p22}</p>
      <p className={pClass}>{c.p23}</p>

      <div className="flex items-start gap-2.5 text-xs text-[#374151] dark:text-[#A8A6C4] bg-[#FFFBEB] dark:bg-[#2D2A5A] rounded-lg p-4 border-s-4 border-[#9CA3AF] dark:border-[#6B6B8A] mt-7">
        <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-[#9CA3AF]" />
        <span>{c.disclaimer}</span>
      </div>

      <div className="border-t border-[#F3F4F6] dark:border-[#4B3F8A] mt-10 pt-5 text-xs text-[#9CA3AF] dark:text-[#8B8AB0]">
        ✍️ {c.author}
      </div>
    </article>
  );
}