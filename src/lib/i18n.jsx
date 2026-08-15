import React, { createContext, useContext, useEffect, useState } from "react";

const AR = {
  // Nav / global
  "Home": "الرئيسية",
  "Blog": "المدونة",
  "About Us": "من نحن",
  "About": "من نحن",
  "Dark Mode": "الوضع الداكن",
  "Light Mode": "الوضع الفاتح",
  "Toggle theme": "تبديل المظهر",
  "Account": "الحساب",
  "Contact Us": "اتصل بنا",

  // Hero
  "Your all-in-one platform": "منصتك المتكاملة",
  "tools in Finance, Health, Converters, Math, Brain Games, and Image Tools":
    "أداة في التمويل والصحة والمحولات والرياضيات وألعاب العقل وأدوات الصور",
  "Tools": "أداة",
  "Categories": "فئات",
  "Free": "مجاني",
  "for Everyone": "للجميع",
  "Search for a tool by name...": "ابحث عن أداة بالاسم...",
  "Clear": "مسح",
  "results for": "نتيجة لـ",
  "No tools found. Try another name.": "لا توجد أدوات. جرّب اسمًا آخر.",

  // Tool categories
  "Finance": "التمويل",
  "Health": "الصحة",
  "Converters": "المحولات",
  "Math": "الرياضيات",
  "Games": "الألعاب",
  "Image Tools": "أدوات الصور",
  "About this tool": "حول هذه الأداة",
  "Finance Tools": "أدوات التمويل",
  "Health Tools": "أدوات الصحة",
  "Brain Games": "ألعاب العقل",

  // Tool workspace
  "Back": "رجوع",
  "This tool is fully functional in the live app.": "هذه الأداة تعمل بالكامل في التطبيق المباشر.",
  "It operates entirely within your browser for maximum privacy.":
    "تعمل بالكامل داخل متصفحك لضمان أقصى درجات الخصوصية.",

  // Tool names
  "Loan Calculator": "حاسبة القروض",
  "Simple & Compound Interest": "الفائدة البسيطة والمركبة",
  "Bond Yield": "عائد السندات",
  "BMI Calculator": "حاسبة مؤشر كتلة الجسم",
  "Calories Burned": "السعرات المحروقة",
  "Currency Converter": "محول العملات",
  "Distance Converter": "محول المسافات",
  "Weight Converter": "محول الأوزان",
  "Area Converter": "محول المساحات",
  "Time Converter": "محول الوقت",
  "Speed Converter": "محول السرعة",
  "Internet Speed Test": "اختبار سرعة الإنترنت",
  "QR Code Generator": "مولّد رمز QR",
  "Share Link Generator": "مولّد روابط المشاركة",
  "Privacy Policy Generator": "مولّد سياسة الخصوصية",
  "Coupon Code Generator": "مولّد أكواد الخصم",
  "Math Function Calculator": "حاسبة الدوال الرياضية",
  "Plot Function": "ارسم الدالة",
  "Plot": "الرسم",
  "One function per line. Supports:": "دالة واحدة في كل سطر. يدعم:",
  "Enter one function per line to plot them together. pi and e are constants, ^ for powers, ! for factorial.": "أدخل دالة واحدة في كل سطر لرسمها معًا. pi و e ثوابت، ^ للقوى، ! للمضروب.",
  "Percentage": "النسبة المئوية",
  "Physics Calculators": "حاسبات الفيزياء",
  "Chemistry Calculators": "حاسبات الكيمياء",
  "Riddle": "الأحجية",
  "Math Puzzle": "لغز رياضي",
  "Word Scramble": "إعادة ترتيب الكلمات",
  "Image Cropper": "قاطع الصور",
  "Background Remover": "إزالة الخلفية",
  "Image to PDF": "صورة إلى PDF",
  "Image Compressor": "ضاغط الصور",

  // Tool descriptions
  "Monthly payment, total interest, and amortization schedule.":
    "الدفعة الشهرية وإجمالي الفائدة وجدول الاستهلاك.",
  "Compare your money growth over time.": "قارن نمو أموالك بمرور الوقت.",
  "Current yield and yield to maturity (YTM).": "العائد الحالي والعائد حتى الاستحقاق.",
  "Get your health classification instantly.": "احصل على تصنيفك الصحي فورًا.",
  "Estimate calories burned during activity.": "قدّر السعرات المحروقة أثناء النشاط.",
  "Convert between 30 world currencies.": "حوّل بين 30 عملة عالمية.",
  "Convert between distance units.": "حوّل بين وحدات المسافة.",
  "Convert between weight units.": "حوّل بين وحدات الوزن.",
  "Convert between area units.": "حوّل بين وحدات المساحة.",
  "Convert between time units.": "حوّل بين وحدات الوقت.",
  "Convert between speed units.": "حوّل بين وحدات السرعة.",
  "Test download, upload and latency.": "اختبر سرعة التنزيل والرفع وزمن الاستجابة.",
  "Create a custom QR code easily.": "أنشئ رمز QR مخصصًا بسهولة.",
  "Generate shareable social links.": "أنشئ روابط مشاركة للتواصل الاجتماعي.",
  "Generate a GDPR-compliant policy.": "أنشئ سياسة متوافقة مع GDPR.",
  "Create random, copy-ready promo codes.": "أنشئ أكواد خصم عشوائية جاهزة للنسخ.",
  "Plot mathematical functions.": "ارسم الدوال الرياضية.",
  "Quick percentage calculations.": "حسابات سريعة للنسبة المئوية.",
  "Speed, distance, time and Ohm's Law.": "السرعة والمسافة والوقت وقانون أوم.",
  "Calculate molar mass instantly.": "احسب الكتلة المولية فورًا.",
  "Solve puzzles and riddles.": "حل الألغاز والأحاجي.",
  "Sharpen your mental math.": "صقّ مهاراتك في الحساب الذهني.",
  "Unscramble the word.": "أعد ترتيب الحروف لتكوين الكلمة.",
  "Upload and crop an image.": "ارفع صورة وقصّها.",
  "Remove backgrounds automatically.": "أزل الخلفيات تلقائيًا.",
  "Combine images into a single PDF.": "ادمج الصور في ملف PDF واحد.",
  "Compress images while keeping quality.": "ضغط الصور مع الحفاظ على الجودة.",
  "Image Enhancer": "محسّن الصور",
  "Logo Maker": "مولّد الشعارات",
  "Sharpen, brighten, and dehaze any image.": "حدّد وعزّز الإضاءة وأزل الضبابية عن أي صورة.",
  "Generate professional logo concepts with AI.": "أنشئ مفاهيم شعارات احترافية بالذكاء الاصطناعي.",
  "Brightness": "السطوع",
  "Contrast": "التباين",
  "Saturation": "التشبّع",
  "Sharpness": "الحدّة",
  "Dehaze": "إزالة الضبابية",
  "Enhanced Image": "الصورة المُحسّنة",
  "Adjust the sliders for a live preview. Sharpen reduces blur, Dehaze cuts fog and haze. Processing runs in your browser — your image stays private.": "حرّك المنزلقات لمعاينة فورية. الحدّة يقلّل الضبابية وإزالة الضبابية يزيل الضباب. تتم المعالجة في متصفحك — صورتك تبقى خاصة.",
  "Brand Name": "اسم العلامة",
  "Style": "النمط",
  "Tagline (optional)": "الشعار النصي (اختياري)",
  "Generate Logo": "أنشئ الشعار",
  "Generating...": "جارٍ الإنشاء...",
  "Your Logo": "شعارك",
  "Creating your logo... this can take a few seconds.": "جارٍ إنشاء شعارك... قد يستغرق بضع ثوانٍ.",
  "AI generates original logo concepts from your brand name and style. Text in the logo may vary — treat results as design inspiration you can refine.": "يُنشئ الذكاء الاصطناعي مفاهيم شعارات أصلية من اسم علامتك ونمطها. قد يختلف النص في الشعار — تعامل مع النتائج كإلهام تصميمي يمكنك تحسينه.",
  "Use a preset for a quick start or fine-tune with the sliders, then download. All processing runs in your browser — your image stays private.": "استخدم زرًا جاهزًا لبداية سريعة أو دقّق بالمنزلقات ثم نزّل. تتم المعالجة في متصفحك — صورتك تبقى خاصة.",
  "Compose a custom logo live: pick a template, icon, colors, and fonts, then download a transparent PNG. Edit any field to update the preview instantly.": "صمّم شعارًا مخصصًا حيًّا: اختر قالبًا ورمزًا وألوان وخطوط، ثم نزّل PNG شفاف. عدّل أي حقل لتحديث المعاينة فورًا.",
  "Auto": "تلقائي",
  "Vivid": "زاهٍ",
  "B&W": "أبيض وأسود",
  "Warm": "دافئ",
  "Soft": "ناعم",
  "Reset": "إعادة الضبط",
  "Template": "قالب",
  "Icon": "رمز",
  "Font": "خط",
  "Primary Color": "اللون الأساسي",
  "Accent Color": "اللون المميّز",
  "Download Logo": "تنزيل الشعار",
  "Randomize": "عشوائي",

  // Why / About section (home)
  "Completely free": "مجاني تمامًا",
  "no registration or payment required.": "لا حاجة للتسجيل أو الدفع.",
  "Secure & private": "آمن وخاص",
  "all processing happens in your browser, no data is uploaded to any server.":
    "تتم جميع المعالجات في متصفحك، ولا يتم رفع أي بيانات إلى أي خادم.",
  "Works on all devices": "يعمل على جميع الأجهزة",
  "mobile, tablet, or desktop.": "جوال أو جهاز لوحي أو حاسوب.",
  "31+ tools": "أكثر من 31 أداة",
  "Finance, Health, Converters, Math, Brain Games, and Image Tools.":
    "التمويل والصحة والمحولات والرياضيات وألعاب العقل وأدوات الصور.",
  "The TestPeak team works passionately to deliver the best digital experience.":
    "يعمل فريق TestPeak بشغف لتقديم أفضل تجربة رقمية.",

  // App store / footer block
  "TestPeak Platform": "منصة TestPeak",
  "31+ interactive and accurate tools in one place. Finance, health, converters, math, brain games, and image processing — completely free and secure.":
    "أكثر من 31 أداة تفاعلية ودقيقة في مكان واحد. تمويل وصحة ومحولات ورياضيات وألعاب عقل ومعالجة صور — مجانية تمامًا وآمنة.",
  "31+ interactive and accurate tools in one place — designed to simplify your daily life.":
    "أكثر من 31 أداة تفاعلية ودقيقة في مكان واحد — مصممة لتبسيط حياتك اليومية.",
  "© 2026 TestPeak — All Rights Reserved": "© 2026 TestPeak — جميع الحقوق محفوظة",
  "2026 TestPeak — All Rights Reserved": "2026 TestPeak — جميع الحقوق محفوظة",
  "Quick Links": "روابط سريعة",
  "Social": "التواصل الاجتماعي",
  "Get it on": "احصل عليه على",
  "Google Play": "متجر Google Play",
  "Download on the": "حمّل من",
  "App Store": "متجر التطبيقات",

  // Blog teaser
  "From the Blog": "من المدونة",
  "Read the latest articles and tips": "اقرأ أحدث المقالات والنصائح",
  "View All Posts": "عرض كل المقالات",

  // Privacy teaser
  "Privacy Policy": "سياسة الخصوصية",
  "Last Updated: August 13, 2026": "آخر تحديث: 13 أغسطس 2026",
  "At TestPeak, we recognize the importance of your privacy and are committed to protecting it. This Privacy Policy explains how we collect, use, share, and protect your personal information.":
    "في TestPeak، ندرك أهمية خصوصيتك ونلتزم بحمايتها. توضح سياسة الخصوصية هذه كيف نجمع بياناتك الشخصية ونستخدمها ونشاركها ونحميها.",
  "1. Information We Collect": "1. المعلومات التي نجمعها",
  "We collect two main types: information you provide voluntarily (name, email, phone) and information collected automatically (IP, browser type, cookies).":
    "نجمع نوعين رئيسيين: المعلومات التي تقدمها طوعًا (الاسم والبريد والهاتف) والمعلومات التي تُجمع تلقائيًا (عنوان IP ونوع المتصفح وملفات تعريف الارتباط).",
  "2. How We Use Your Information": "2. كيف نستخدم معلوماتك",
  "We use information to provide and improve services, communicate with you, analyze usage, and comply with legal obligations.":
    "نستخدم المعلومات لتقديم الخدمات وتحسينها والتواصل معك وتحليل الاستخدام والامتثال للالتزامات القانونية.",
  "Read full policy": "اقرأ السياسة كاملة",

  // Dynamic About-paragraph pieces
  "is an": "هي",
  "integrated tools platform": "منصة أدوات متكاملة",
  "that provides a wide range of free and interactive tools covering users' daily needs across various domains.": "توفر مجموعة واسعة من الأدوات المجانية والتفاعلية التي تغطي الاحتياجات اليومية للمستخدمين في مختلف المجالات.",

  // Blog page
  "TestPeak Blog": "مدونة TestPeak",
  "Read the latest": "اقرأ أحدث",
  "articles & tips": "المقالات والنصائح",
  "Practical guides on finance, health and productivity — powered by the same tools you use every day.": "أدلة عملية حول التمويل والصحة والإنتاجية — مدعومة بالأدوات نفسها التي تستخدمها كل يوم.",
  "Admin Panel": "لوحة الإدارة",
  "All": "الكل",
  "Technology": "التقنية",
  "5 Smart Ways to Pay Off Your Loan Faster": "5 طرق ذكية لسداد قرضك بشكل أسرع",
  "Understanding BMI: What the Numbers Really Mean": "فهم مؤشر كتلة الجسم: ماذا تعني الأرقام حقًا",
  "Compound Interest: The Eighth Wonder of the World": "الفائدة المركبة: المعجزة الثامنة في العالم",
  "Boost Your Productivity with Free Online Tools": "عزّز إنتاجيتك بأدوات مجانية عبر الإنترنت",
  "Small changes to your repayment strategy can save you thousands in interest. Here's how to use the Loan Calculator to your advantage.": "تغييرات صغيرة في استراتيجية السداد قد توفر عليك آلافًا في الفوائد. إليك كيف تستفيد من حاسبة القروض.",
  "Body Mass Index is a starting point, not the full picture. Learn how to read your BMI result the right way.": "مؤشر كتلة الجسم نقطة انطلاق وليس الصورة الكاملة. تعلّم كيف تقرأ نتيجتك بالطريقة الصحيحة.",
  "Einstein allegedly called it the most powerful force in the universe. See how compounding accelerates your savings.": "قيل إن أينشتاين وصفها بأنها أقوى قوة في الكون. اكتشف كيف يعجل التراكم من مدخراتك.",
  "From unit converters to QR generators, discover how everyday tools quietly save you hours every week.": "من محولات الوحدات إلى مولّدات QR، اكتشف كيف توفر لك الأدوات اليومية ساعات كل أسبوع.",
  "Read more": "اقرأ المزيد",
  "Show less": "عرض أقل",
  "How to use this tool": "كيفية استخدام هذه الأداة",
  "Steps": "الخطوات",
  "Tips": "نصائح",
  "5 min read": "5 دقائق قراءة",
  "Aspect Ratio": "نسبة الأبعاد",
  "Crop Image": "قص الصورة",
  "Cropped Image": "الصورة المقصوصة",
  "Tolerance": "التسامح",
  "Edge Smoothing": "تنعيم الحواف",
  "Remove Background": "إزالة الخلفية",
  "Page Orientation": "اتجاه الصفحة",
  "Creating...": "جارٍ الإنشاء...",
  "Create PDF": "إنشاء PDF",
  "Quality": "الجودة",
  "Max Dimension (px)": "أقصى بُعد (بكسل)",
  "Compress": "ضغط",
  "Compression Result": "نتيجة الضغط",
  "smaller": "أصغر",
  "Download": "تنزيل",
  "Result": "النتيجة",
  "portrait": "عمودي",
  "landscape": "أفقي",
  "Never miss an update": "لا تفوّت أي تحديث",
  "Be the first to know when we publish new articles and launch new tools.": "كن أول من يعرف عندما ننشر مقالات جديدة ونطلق أدوات جديدة.",
  "Thanks for subscribing — check your inbox soon!": "شكرًا لاشتراكك — تفقّد بريدك قريبًا!",
  "Subscribe": "اشترك",
  "Article not found": "المقال غير موجود",
  "Back to Blog": "العودة إلى المدونة",
  "Enjoyed this article?": "استمتعت بالمقال؟",
  "Explore 31+ free tools that make everyday tasks effortless.": "استكشف أكثر من 31 أداة مجانية تجعل المهام اليومية سهلة.",
  "Browse Tools": "تصفّح الأدوات",
  "Font Size": "حجم الخط",
  "Background": "الخلفية",
  "Decrease font": "تصغير الخط",
  "Increase font": "تكبير الخط",
  "Light": "فاتح",
  "Sepia": "ورقي",
  "Dark": "داكن",
  "Favorites": "المفضّلة",
  "No favorites yet": "لا توجد مفضّلة بعد",
  "Tap the star on any tool to save it here for quick access.": "اضغط النجمة على أي أداة لحفظها هنا للوصول السريع.",
  "Add to favorites": "إضافة إلى المفضّلة",
  "Remove from favorites": "إزالة من المفضّلة",

  // About page
  "About TestPeak": "عن TestPeak",
  "Built to make life": "صُمّمت لجعل الحياة",
  "simpler": "أبسط",
  "TestPeak is an integrated tools platform providing free, interactive tools that cover your daily needs across finance, health, math, converters, games and images.": "TestPeak منصة أدوات متكاملة توفّر أدوات مجانية وتفاعلية تغطي احتياجاتك اليومية في التمويل والصحة والرياضيات والمحولات والألعاب والصور.",
  "Completely free — no registration or payment required.": "مجاني تمامًا — لا حاجة للتسجيل أو الدفع.",
  "Secure & private — all processing happens in your browser, no data is uploaded to any server.": "آمن وخاص — تتم جميع المعالجات في متصفحك، ولا يتم رفع أي بيانات إلى أي خادم.",
  "Works on all devices — mobile, tablet, or desktop.": "يعمل على جميع الأجهزة — جوال أو جهاز لوحي أو حاسوب.",
  "Supports Arabic & English — choose your preferred language.": "يدعم العربية والإنجليزية — اختر لغتك المفضلة.",
  "31+ tools — Finance, Health, Converters, Math, Brain Games, and Image Tools.": "أكثر من 31 أداة — تمويل وصحة ومحولات ورياضيات وألعاب عقل وأدوات صور.",
  "Continuous updates — we keep adding new tools to meet your needs.": "تحديثات مستمرة — نواصل إضافة أدوات جديدة لتلبية احتياجاتك.",
  "3. Sharing Information": "3. مشاركة المعلومات",
  "We do not sell or rent your personal information. We may share data with trusted partners to help operate our site.": "لا نبيع أو نؤجر معلوماتك الشخصية. قد نشارك البيانات مع شركاء موثوقين للمساعدة في تشغيل موقعنا.",
  "4. Information Security": "4. أمان المعلومات",
  "We use appropriate technical and organizational measures. However, no security system is 100% guaranteed.": "نتخذ تدابير تقنية وتنظيمية مناسبة. ومع ذلك، لا يوجد نظام أمان مضمون 100%.",
  "5. Your Rights": "5. حقوقك",
  "You have the right to access, correct, delete, object to processing, and withdraw consent at any time.": "لديك الحق في الوصول إلى بياناتك وتصحيحها وحذفها والاعتراض على المعالجة وسحب الموافقة في أي وقت.",
  "6. Privacy Policy for Image Tools": "6. سياسة الخصوصية لأدوات الصور",
  "All image processing tools work locally within your browser. No images are uploaded or stored on our servers.": "تعمل جميع أدوات معالجة الصور محليًا داخل متصفحك. لا يتم رفع أي صور أو تخزينها على خوادمنا.",
  "7. Financial Disclaimer": "7. إخلاء المسؤولية المالية",
  "All financial tools are for educational and informational purposes only, and do not constitute financial advice.": "جميع الأدوات المالية لأغراض تعليمية وإعلامية فقط، ولا تُعد نصيحة مالية.",
  "8. Contact Us": "8. اتصل بنا",
  "Ready to get started?": "جاهز للبدء؟",
  "Jump back in and explore all 26+ free tools TestPeak has to offer.": "عُد واستكشف جميع الأدوات المجانية (أكثر من 26) التي يقدمها TestPeak.",
  "Back to Tools": "العودة إلى الأدوات",

  // Dashboard
  "Usage Dashboard": "لوحة تحكم الاستخدام",
  "Most used tools and daily usage trends from your visitors.": "أكثر الأدوات استخداماً ونسب الاستخدام اليومية من زوّارك.",
  "Total Uses": "إجمالي الاستخدام",
  "Today": "اليوم",
  "Unique Tools": "أدوات فريدة",
  "Refresh": "تحديث",
  "No usage data yet": "لا توجد بيانات استخدام بعد",
  "Usage is recorded automatically when visitors open tools.": "يُسجّل الاستخدام تلقائياً عند فتح الزوّار للأدوات.",
  "Most Used Tools": "الأكثر استخداماً",
  "Daily Usage (14 days)": "الاستخدام اليومي (14 يوماً)",
  "Top Tools Chart": "رسم الأدوات الأكثر استخداماً",
  "Usage by Category": "الاستخدام حسب الفئة",
  "Uses": "مرات استخدام",
};

const I18nContext = createContext(null);

export function I18nProvider({ children }) {
  const [lang, setLang] = useState(() => {
    try {
      return localStorage.getItem("tp_lang") || "en";
    } catch {
      return "en";
    }
  });

  const isRTL = lang === "ar";

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = isRTL ? "rtl" : "ltr";
    try {
      localStorage.setItem("tp_lang", lang);
    } catch {}
  }, [lang, isRTL]);

  const t = (key) => (lang === "ar" ? AR[key] ?? key : key);

  return (
    <I18nContext.Provider value={{ lang, setLang, t, dir: isRTL ? "rtl" : "ltr", isRTL }}>
      {children}
    </I18nContext.Provider>
  );
}

export const useI18n = () => {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
};