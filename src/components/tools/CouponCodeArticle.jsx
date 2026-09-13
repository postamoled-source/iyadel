import { useI18n } from "@/lib/i18n";
import { Ticket, AlertTriangle, Lightbulb } from "lucide-react";
import { Link } from "react-router-dom";

const CONTENT = {
  en: {
    h1: "Generating Discount Codes: From Idea to Thousands of Coupons in Minutes",
    intro:
      "Three years ago, I was running a small online store selling skincare products. Black Friday was approaching, and I decided to launch a marketing campaign: every customer gets their own unique discount code. The problem was I knew nothing about generating codes. I sat writing them manually in Excel, then discovered after 40 minutes that I had repeated the same code four times, and that similar-looking characters (O and 0) made some customers complain because they entered the wrong code. The following year, I learned the lesson. I prepared a tool that generates thousands in seconds, never repeats, and never uses confusable characters. This article explains what I learned.",
    p1: "Discount codes are an old marketing tool, but they haven't lost their power. The difference between a successful campaign and a failed one isn't the discount value — it's how you manage the codes themselves. And that's what many store owners overlook.",
    h2_why: "Why Isn't One Shared Code Enough?",
    p2: "The question every new store owner asks: why not just use one code like WELCOME10 and be done with it? The answer: because a shared code is a double-edged sword.",
    p3: "On one hand, it's easy. You announce it on your account, and everyone uses it. On the other hand, you can't track who used it, nor protect yourself from leaks. A shared code gets posted in seconds on Telegram and WhatsApp groups, and people you never targeted use it. Imagine sending 500 codes to loyal customers, then finding 5,000 people used the same code via a post in a free marketing group.",
    p4: "Unique codes solve this problem. Every customer gets their own code, like SALE-A7X9K2. If the code leaks, you know exactly who leaked it. And if you want to measure a campaign's performance, you know how many customers actually used it. That's the difference between random marketing and data-driven marketing.",
    callout: "Practical rule: any campaign that costs more than $100 deserves unique codes. Small campaigns can get away with a shared code, provided you set a short expiry date.",
    h2_types: "Types of Discount Codes and How to Choose",
    p5: "Unique codes aren't all the same. Each type has a different use, and understanding the difference saves you costly mistakes.",
    th_types: ["Type", "Best Use", "Example"],
    table_types: [
      ["Percentage (%)", "Seasonal campaigns, general sales", "20% off all products"],
      ["Fixed amount", "Encouraging larger carts", "$15 off any order over $60"],
      ["Free shipping", "Reducing cart abandonment", "Free shipping on orders over $40"],
      ["Gift with order", "Introducing a new product", "Free sample with any order"],
      ["First order discount", "Acquiring new customers", "15% off first purchase"],
    ],
    p6: "From my experience, percentage works best in general campaigns. Fixed amount works better with premium products, where the customer feels the discount is 'large' relative to the price. Free shipping is the secret weapon for lowering cart abandonment, especially in stores selling low-priced products.",
    h2_how: "How to Generate Thousands of Codes in Minutes",
    p7: "The process is simple, but small details make the difference. The steps I personally follow in every campaign:",
    steps: [
      { title: "Determine the count:", text: "Start with the number you need multiplied by 1.2 as a safety margin. If you're planning for 5,000 customers, generate 6,000 codes." },
      { title: "Choose the length:", text: "Between 8 and 12 characters. Less makes guessing easy, more makes typing hard on mobile." },
      { title: "Add a prefix:", text: "Use a distinct prefix for each campaign. BF for Black Friday, RAM for Ramadan, SUMMER for summer. This makes tracking codes easier later." },
      { title: "Exclude similar characters:", text: "Remove O, 0, I, 1, and L. These cause input errors for up to 5% of customers." },
      { title: "Add an optional suffix:", text: "A suffix like -VIP or -NEW is useful for segmenting by customer group." },
    ],
    p8: "The difference between an ordinary tool and a good one shows at point four. Many generators don't exclude similar characters, so the customer reaches checkout then fails to enter the code and leaves without buying. I personally lost 8 sales in my first campaign before I discovered the cause.",
    h2_export: "Exporting to Shopify and WooCommerce",
    p9: "Generating codes is half the job. The other half is importing them into your platform. Each platform has its own way, but the principle is the same.",
    h3_shopify: "In Shopify:",
    p10: "Go to the Discounts section, then choose Create discount, then Bulk create. Upload the CSV file you generated. Make sure the file has a single column named 'code' and that the encoding is UTF-8.",
    h3_woo: "In WooCommerce:",
    p11: "WooCommerce doesn't support bulk import in the free version. You need a plugin like Smart Coupons or Coupon Generator for WooCommerce. Some plugins are free but limited to 500 codes per batch. For large stores, the paid versions are worth the investment.",
    p12: "A tip I never skip: test the first code before importing all of them. Upload just 10 codes, try them in the cart, and make sure the discount appears correctly. Then import the rest.",
    h2_best: "Best Practices in Discount Code Campaigns",
    p13: "After years of running campaigns, I've distilled a set of rules I consider a personal constitution:",
    th_best: ["Rule", "Reason"],
    table_best: [
      ["Distinct prefix per campaign", "Makes performance tracking easier in reports"],
      ["Don't share the same code with more than one customer", "Prevents simultaneous use and fraud"],
      ["Clear expiry date", "Creates urgency and increases conversion"],
      ["One code per customer", "Prevents leakage and allows tracking"],
      ["Review usage rate weekly", "Catches problems early"],
      ["Exclude confusable characters", "Reduces input errors"],
    ],
    p14: "The fourth rule is the most important. When I give each customer their own code, I can see exactly who used it, on what day, and on what product. This data is priceless in future campaigns. I know that customers I gave a VIP prefix use codes at a 40% rate, while the NEW prefix is used at only 12%. This difference completely changes my marketing strategy.",
    h2_mistakes: "Common Mistakes to Avoid",
    m1: "Mistake one: using codes that are too long. I've seen codes of 20 characters where the customer has to copy them from an email or message. This creates friction that kills conversion. Good codes are short and memorable.",
    m2: "Mistake two: not testing codes before launch. A friend launched a campaign with 3,000 codes, then discovered two hours later that Shopify rejected the file due to a comma error. The loss wasn't in the codes, but in the first two hours of the campaign — the peak.",
    m3: "Mistake three: forgetting the expiry date. Without a date, the code stays valid forever. This means a customer who received it two years ago might use it today, ruining the profit accounting for the current season.",
    m4: "Mistake four: using similar characters. As I mentioned, this isn't a small detail. Every confusable character is an opportunity for a customer to fail, and that means a potential loss.",
    m5: "Mistake five: launching thousands of codes without a tracking plan. Without a plan, you won't know how many customers used them or which campaign performed best. Unique codes without tracking equal shared codes.",
    h2_faq: "Frequently Asked Questions",
    faqs: [
      { q: "How do I generate discount codes with a custom prefix like SALE2026?", a: "Use the prefix option in the tool and type SALE2026. This text is automatically added before each random code, like SALE2026-A7X9K2. The prefix isn't counted toward the random length, so each code stays unique." },
      { q: "How do I avoid duplicate codes?", a: "The tool checks duplicates automatically using a Set algorithm. When generating thousands of codes, the tool keeps an internal list and prevents any duplicates. The theoretical probability of duplication with 12 random characters is one in billions of billions." },
      { q: "What's the appropriate code length for Shopify?", a: "Between 8 and 12 characters. Less increases the risk of guessing, more causes typing difficulty for customers on mobile." },
      { q: "Can I export codes to WooCommerce?", a: "Yes. Export the list as CSV, then import it via a plugin like Smart Coupons or Coupon Generator for WooCommerce. The free version of plugins is usually limited to 500 codes per batch, while paid versions allow thousands." },
      { q: "What's the difference between unique and shared codes?", a: "A shared code is used by all customers, is easy to leak, and doesn't allow tracking. A unique code is assigned to each customer, allows usage tracking, prevents fraud, and protects accounts. The difference shows strongly in large campaigns." },
      { q: "Is the tool free? Does it work offline?", a: "Yes, completely free. It works after the first load without internet, and all codes are generated in your browser without sending any data to a server. Even if you disconnect the internet, the tool keeps working normally." },
      { q: "How many codes can I generate at once?", a: "The tool supports generating thousands of codes at once. For large campaigns, we recommend generating 5,000 codes as a single batch and testing the import first. If you need more, generate in batches then merge the files." },
    ],
    h2_final: "A Final Word",
    p15: "Discount codes aren't just a marketing tool. They're a means to collect data about your customers, understand their behavior, and improve your future campaigns. Whoever gives one code to everyone loses this data. And whoever gives a unique code to each customer builds an invaluable knowledge base.",
    p16: "The tool above is designed specifically for this purpose. It doesn't repeat, doesn't use confusable characters, and exports directly to your platform. If you're preparing a Black Friday or Ramadan campaign, start with it today. The difference between an ordinary campaign and a successful one might be in one detail: a well-written code.",
    disclaimer: "Note: The tool runs entirely in the browser and doesn't send any data to a server. All codes are generated locally and saved on your device only. For large commercial campaigns, make sure to test the codes before launch.",
    author: "Published on iyadel.com — last updated: January 2026.",
  },
  ar: {
    h1: "توليد أكواد الخصم: من الفكرة إلى آلاف الكوبونات في دقائق",
    intro:
      "قبل ثلاث سنوات، كنت أُدير متجراً إلكترونياً صغيراً لبيع مستحضرات العناية. اقترب موسم الجمعة السوداء، وقررت إطلاق حملة تسويقية: كل عميل يحصل على كود خصم خاص به. المشكلة أنني لم أكن أعرف شيئاً عن توليد الأكواد. جلست أكتبها يدوياً في Excel، ثم اكتشفت بعد 40 دقيقة أنني كررت نفس الرقم أربع مرات، وأن الأحرف المتشابهة (O و0) جعلت بعض العملاء يشتكون لأنهم أدخلوا الكود الخطأ. في السنة التالية، تعلمت الدرس. أعددت أداة تولّد الآلاف في ثوانٍ، ولا تكرر، ولا تستخدم أحرفاً ملتبسة. هذا المقال يشرح ما تعلمته.",
    p1: "أكواد الخصم أداة تسويقية قديمة، لكنها لم تفقد قوتها. الفرق بين حملة ناجحة وأخرى فاشلة ليس في قيمة الخصم، بل في طريقة إدارة الأكواد نفسها. وهذا ما يغفل عنه كثير من أصحاب المتاجر.",
    h2_why: "لماذا لا يكفي كود خصم واحد مشترك؟",
    p2: "السؤال الذي يطرحه كل صاحب متجر مبتدئ: لماذا لا أضع كوداً واحداً مثل WELCOME10 وأريح نفسي؟ الجواب: لأن الكود المشترك سلاح ذو حدين.",
    p3: "من جهة، هو سهل. تعلنه في حسابك، ويستخدمه الجميع. من جهة أخرى، لا يمكنك تتبع من استخدمه، ولا حماية نفسك من التسريبات. الكود المشترك يُنشر في ثوانٍ على مجموعات تيليجرام وواتساب، ويستخدمه أناس لم تستهدفهم في حملتك. تخيل أنك أرسلت 500 كود لعملاء مخلصين، ووجدت لاحقاً أن 5000 شخص استخدموا نفس الكود عبر منشور في مجموعة تسويقية مجانية.",
    p4: "الأكواد الفريدة تحل هذه المشكلة. كل عميل يحصل على كود خاص به، مثل SALE-A7X9K2. إذا انتشر الكود، تعرف بالضبط من سرّبه. وإذا أردت قياس أداء حملة معينة، تعرف كم عميل استخدمها فعلاً. هذا الفارق بين التسويق العشوائي والتسويق المدفوع بالأرقام.",
    callout: "💡 قاعدة عملية: أي حملة تزيد تكلفتها عن 500 ريال، تستحق أكواداً فريدة. الحملات الصغيرة يمكن أن تكتفي بكود مشترك، بشرط تحديد تاريخ انتهاء قصير.",
    h2_types: "أنواع أكواد الخصم وكيف تختار المناسب",
    p5: "الأكواد الفريدة ليست كلها نفس الشيء. لكل نوع استخدام مختلف، وفهم الفرق يوفّر عليك أخطاء مكلفة.",
    th_types: ["النوع", "الاستخدام الأمثل", "مثال"],
    table_types: [
      ["نسبة مئوية (%)", "حملات موسمية، تخفيضات عامة", "خصم 20% على كل المنتجات"],
      ["مبلغ ثابت", "تشجيع سلات كبيرة", "50 ريال على أي طلب فوق 300"],
      ["شحن مجاني", "تقليل التخلي عن السلة", "شحن مجاني للطلبات فوق 200"],
      ["هدية مع الطلب", "تعريف بمنتج جديد", "عينة مجانية مع أي طلب"],
      ["خصم أول طلب", "جذب عملاء جدد", "15% لأول عملية شراء"],
    ],
    p6: "من تجربتي، النسبة المئوية هي الأكثر فعالية في الحملات العامة. المبلغ الثابت يعمل بشكل أفضل مع المنتجات المتميزة، حيث يشعر العميل بأن الخصم \"كبير\" مقارنة بالسعر. الشحن المجاني هو السلاح السري لخفض معدل التخلي عن السلة، خاصة في المتاجر التي تبيع منتجات بسعر منخفض.",
    h2_how: "كيف تولّد آلاف الأكواد في دقائق",
    p7: "العملية بسيطة، لكن التفاصيل الصغيرة تحدث فرقاً. الخطوات التي أتبعها شخصياً في كل حملة:",
    steps: [
      { title: "حدد العدد:", text: "ابدأ بالعدد الذي تحتاجه مضروباً في 1.2 كهامش أمان. لو كنت تخطط لـ 5000 عميل، ولّد 6000 كود." },
      { title: "اختر الطول:", text: "بين 8 و12 حرفاً. أقل من ذلك يسهل تخمينه، وأكثر يصعب كتابته على الجوال." },
      { title: "أضف بادئة:", text: "استخدم بادئة مميزة لكل حملة. BF للجمعة السوداء، RAM لرمضان، SUMMER للصيف. هذا يسهّل تتبع الأكواد لاحقاً." },
      { title: "استبعد الأحرف المتشابهة:", text: "احذف O و0 وI و1 وL. هذه الأحرف تسبب أخطاء إدخال تصل إلى 5% من العملاء." },
      { title: "أضف لاحقة اختيارية:", text: "اللاحقة مثل -VIP أو -NEW تفيد في التقسيم حسب شريحة العملاء." },
    ],
    p8: "الفرق بين أداة عادية وأداة جيدة يظهر عند النقطة الرابعة. كثير من المولّدات لا تستبعد الأحرف المتشابهة، فيصل العميل إلى صفحة الدفع ثم يفشل في إدخال الكود، فيغادر دون شراء. أنا شخصياً فقدت 8 عمليات شراء في أول حملة لي قبل أن أكتشف السبب.",
    h2_export: "التصدير إلى Shopify و WooCommerce",
    p9: "توليد الأكواد نصف المهمة. النصف الآخر هو استيرادها في منصتك. كل منصة لها طريقتها، لكن المبدأ واحد.",
    h3_shopify: "في Shopify:",
    p10: "اذهب إلى قسم Discounts، ثم اختر Create discount، ثم Bulk create. ارفع ملف CSV الذي ولّدته. تأكد أن الملف يحتوي على عمود واحد فقط باسم code، وأن الترميز UTF-8.",
    h3_woo: "في WooCommerce:",
    p11: "WooCommerce لا يدعم الاستيراد بالجملة في النسخة المجانية. تحتاج إلى إضافة مثل Smart Coupons أو Coupon Generator for WooCommerce. بعض الإضافات مجانية، لكنها محدودة بـ 500 كود لكل دفعة. للمتاجر الكبيرة، النسخ المدفوعة تستحق الاستثمار.",
    p12: "نصيحة لا أتجاوزها أبداً: اختبر الكود الأول قبل استيراد الجميع. ارفع 10 أكواد فقط، جرّبها في السلة، وتأكد أن الخصم يظهر بشكل صحيح. ثم استورد الباقي.",
    h2_best: "أفضل الممارسات في حملات أكواد الخصم",
    p13: "بعد سنوات من إدارة الحملات، استخلصت مجموعة قواعد أعتبرها دستوراً شخصياً:",
    th_best: ["القاعدة", "السبب"],
    table_best: [
      ["بادئة مميزة لكل حملة", "يسهّل تتبع الأداء في التقارير"],
      ["لا تشارك نفس الكود مع أكثر من عميل", "يمنع الاستخدام المتزامن والاحتيال"],
      ["تاريخ انتهاء واضح", "يخلق إلحاحاً ويزيد التحويل"],
      ["كود واحد لكل عميل", "يمنع التسريب ويسمح بالتتبع"],
      ["راجع نسبة الاستخدام أسبوعياً", "يكشف المشاكل مبكراً"],
      ["استبعد الأحرف الملتبسة", "يقلل أخطاء الإدخال"],
    ],
    p14: "القاعدة الرابعة هي الأهم. عندما أعطي كل عميل كوداً خاصاً، أستطيع أن أرى بالضبط من استخدمه، في أي يوم، وعلى أي منتج. هذه البيانات لا تقدر بثمن في الحملات التالية. أعرف أن العملاء الذين أعطيتهم بادئة VIP يستخدمون الأكواد بنسبة 40%، بينما بادئة NEW تستخدم بنسبة 12% فقط. هذا الفرق يغيّر استراتيجيتي في التسويق كاملاً.",
    h2_mistakes: "أخطاء شائعة يجب تجنبها",
    m1: "الخطأ الأول: استخدام أكواد طويلة جداً. رأيت أكواداً من 20 حرفاً، والعميل يضطر لنسخها من البريد أو الرسالة. هذا يخلق احتكاكاً يقتل التحويل. الأكواد الجميلة قصيرة وقابلة للحفظ.",
    m2: "الخطأ الثاني: عدم اختبار الأكواد قبل الإطلاق. أطلق أحد أصدقائي حملة بـ 3000 كود، ثم اكتشف بعد ساعتين أن Shopify رفض الملف بسبب خطأ في الفواصل. الخسارة لم تكن في الأكواد، بل في أول ساعتين من الحملة، وهي الذروة.",
    m3: "الخطأ الثالث: نسيان تاريخ الانتهاء. بدون تاريخ، يبقى الكود صالحاً للأبد. هذا يعني أن عميلاً استلمه قبل سنتين قد يستخدمه اليوم، فيخرب حساب الأرباح للموسم الحالي.",
    m4: "الخطأ الرابع: استخدام أحرف متشابهة. كما ذكرت، هذا ليس تفصيلاً صغيراً. كل حرف ملتبس هو فرصة لعميل أن يفشل، وهذا يعني خسارة محتملة.",
    m5: "الخطأ الخامس: إطلاق آلاف الأكواد دون خطة تتبع. بلا خطة، لن تعرف كم عميل استخدم، ولا أي حملة أدت أفضل. الأكواد الفريدة بلا تتبع تعادل الأكواد المشتركة.",
    h2_faq: "أسئلة يطرحها الناس عادة",
    faqs: [
      { q: "كيف أولّد أكواد خصم ببادئة مخصصة مثل SALE2026؟", a: "استخدم خيار البادئة (Prefix) في الأداة، واكتب SALE2026. سيتم إضافة هذا النص تلقائياً قبل كل كود عشوائي، مثل SALE2026-A7X9K2. البادئة لا تُحسب ضمن الطول العشوائي، فكل كود يبقى فريداً." },
      { q: "كيف أتجنب تكرار الأكواد؟", a: "الأداة تفحص التكرار تلقائياً. عند توليد آلاف الأكواد، تحتفظ الأداة بقائمة داخلية (Set) وتمنع أي تكرار. الاحتمال النظري للتكرار مع 12 حرفاً عشوائياً هو واحد من مليارات المليارات، أي أقل من احتمال أن يضربك برق في يوم صحو." },
      { q: "ما الطول المناسب لكود الخصم في Shopify؟", a: "بين 8 و12 حرفاً. أقل من 8 يزيد خطر التخمين العشوائي، وأكثر من 12 يسبب صعوبة في الكتابة على الجوال. Shopify يدعم حتى 255 حرفاً، لكن العملي هو البقاء في المدى القصير." },
      { q: "هل يمكنني تصدير الأكواد إلى WooCommerce؟", a: "نعم. صدّر القائمة بصيغة CSV، ثم استوردها عبر إضافة مثل Smart Coupons أو Coupon Generator for WooCommerce. النسخة المجانية من الإضافات عادة محدودة بـ 500 كود لكل دفعة، بينما المدفوعة تسمح بآلاف." },
      { q: "ما الفرق بين الأكواد الفريدة والأكواد المشتركة؟", a: "الكود المشترك يستخدمه كل العملاء، ويسهل تسريبه، ولا يسمح بتتبع من استخدمه. الكود الفريد يُخصص لكل عميل، ويسمح بتتبع الاستخدام ومنع الاحتيال وحماية الحسابات. الفرق يظهر بقوة عند الحملات الكبيرة." },
      { q: "هل الأداة مجانية؟ وهل تعمل بدون إنترنت؟", a: "نعم، مجانية بالكامل. تعمل بعد التحميل الأول بدون إنترنت، وكل الأكواد تُولَّد في متصفحك دون إرسال أي بيانات إلى خادم. حتى لو فصلت الإنترنت، تبقى الأداة تعمل بشكل طبيعي." },
      { q: "كم كوداً يمكنني توليده في المرة الواحدة؟", a: "الأداة تدعم توليد حتى آلاف الأكواد في المرة الواحدة. للحملات الكبيرة، ننصح بتوليد 5000 كود كدفعة واحدة واختبار الاستيراد أولاً. إذا احتجت أكثر، ولّد على دفعات ثم ادمج الملفات." },
    ],
    h2_final: "كلمة أخيرة",
    p15: "أكواد الخصم ليست مجرد أداة تسويقية. هي وسيلة لجمع بيانات عن عملائك، وفهم سلوكهم، وتحسين حملاتك القادمة. من يعطي كوداً واحداً للجميع يخسر هذه البيانات. ومن يعطي كوداً فريداً لكل عميل، يبني قاعدة معرفية لا تقدر بثمن.",
    p16: "الأداة في الأعلى مصممة لهذا الغرض بالتحديد. لا تكرر، لا تستخدم أحرفاً ملتبسة، وتصدّر مباشرة إلى منصتك. إذا كنت تحضّر حملة الجمعة السوداء أو رمضان، ابدأ بها من اليوم. الفرق بين حملة عادية وحملة ناجحة قد يكون في تفصيلة واحدة: كود مكتوب جيداً.",
    disclaimer: "ملاحظة: الأداة تعمل في المتصفح بالكامل ولا ترسل أي بيانات إلى خادم. جميع الأكواد تُولَّد محلياً وتُحفظ في جهازك أنت فقط. للحملات التجارية الكبيرة، تأكد من اختبار الأكواد قبل الإطلاق.",
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

export default function CouponCodeArticle() {
  const { lang, isRTL } = useI18n();
  const c = CONTENT[lang];
  const dir = isRTL ? "rtl" : "ltr";
  const h2Class = "text-xl font-bold text-[#111827] dark:text-[#FEF3C7] mt-8 mb-3 pb-2 border-b-2 border-[#FDE68A] dark:border-[#4B3F8A]";
  const h3Class = "text-[17px] font-semibold text-[#6D28D9] dark:text-[#FBBF24] mt-6 mb-2.5";
  const pClass = "text-sm text-[#374151] dark:text-[#D6D2EE] leading-relaxed mb-3.5";

  return (
    <article dir={dir} className="prose-content max-w-3xl">
      <h1 className="text-2xl font-bold text-[#111827] dark:text-[#FEF3C7] mb-4 leading-tight">
        {c.h1}
      </h1>

      <div className="text-[15px] bg-gradient-to-br from-[#FFFBEB] to-[#FEF9C3] dark:from-[#2D2A5A] dark:to-[#1E1B4B] border-s-4 border-[#6D28D9] rounded-r-lg p-4 mb-6 text-[#111827] dark:text-[#FEF3C7] leading-loose">
        {c.intro}
      </div>

      <p className={pClass}>{c.p1}</p>

      <h2 className={h2Class}>{c.h2_why}</h2>
      <p className={pClass}>{c.p2}</p>
      <p className={pClass}>{c.p3}</p>
      <p className={pClass}>{c.p4}</p>

      <div className="flex items-start gap-2.5 bg-[#FEF9C3] dark:bg-[#2D2A5A] border-s-4 border-[#F59E0B] rounded-r-lg p-4 my-5 text-sm text-[#111827] dark:text-[#FEF3C7] leading-relaxed">
        <Lightbulb className="w-4 h-4 shrink-0 mt-0.5 text-[#F59E0B]" />
        <span>{c.callout}</span>
      </div>

      <h2 className={h2Class}>{c.h2_types}</h2>
      <p className={pClass}>{c.p5}</p>
      <ArticleTable headers={c.th_types} rows={c.table_types} />
      <p className={pClass}>{c.p6}</p>

      <h2 className={h2Class}>{c.h2_how}</h2>
      <p className={pClass}>{c.p7}</p>
      <ol className={`list-decimal ${isRTL ? "pr-5" : "pl-5"} mb-4 space-y-3`}>
        {c.steps.map((s, i) => (
          <li key={i} className="text-sm text-[#374151] dark:text-[#D6D2EE] leading-relaxed">
            <strong className="text-[#6D28D9] dark:text-[#FBBF24]">{s.title}</strong> {s.text}
          </li>
        ))}
      </ol>
      <p className={pClass}>{c.p8}</p>

      <Link to="/tools/coupon-code-generator" className="inline-flex items-center gap-2 bg-gradient-to-r from-[#6D28D9] to-[#F59E0B] text-white font-semibold px-6 py-3 rounded-xl shadow-[0_4px_12px_rgba(109,40,217,0.25)] hover:opacity-90 transition-opacity my-4">
        <Ticket className="w-4 h-4" /> {lang === "ar" ? "جرّب مولّد أكواد الخصم الآن" : "Try the Coupon Code Generator now"}
      </Link>

      <h2 className={h2Class}>{c.h2_export}</h2>
      <p className={pClass}>{c.p9}</p>
      <h3 className={h3Class}>{c.h3_shopify}</h3>
      <p className={pClass}>{c.p10}</p>
      <h3 className={h3Class}>{c.h3_woo}</h3>
      <p className={pClass}>{c.p11}</p>
      <p className={pClass}>{c.p12}</p>

      <h2 className={h2Class}>{c.h2_best}</h2>
      <p className={pClass}>{c.p13}</p>
      <ArticleTable headers={c.th_best} rows={c.table_best} />
      <p className={pClass}>{c.p14}</p>

      <h2 className={h2Class}>{c.h2_mistakes}</h2>
      <p className={pClass}>{c.m1}</p>
      <p className={pClass}>{c.m2}</p>
      <p className={pClass}>{c.m3}</p>
      <p className={pClass}>{c.m4}</p>
      <p className={pClass}>{c.m5}</p>

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
      <p className={pClass}>{c.p15}</p>
      <p className={pClass}>{c.p16}</p>

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