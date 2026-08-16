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
  "Run": "جري",
  "RUN": "جري",
  "Down": "أسفل",
  "Snake": "الثعبان",
  "Level": "المستوى",
  "Your Answer": "إجابتك",
  "Check": "تحقّق",
  "Next Puzzle": "السؤال التالي",
  "New Word": "كلمة جديدة",
  "Correct! 🎉": "صحيح! 🎉",
  "Wrong. The answer was": "خطأ. الإجابة كانت",
  "Wrong. The word was": "خطأ. الكلمة كانت",
  "Unscramble the letters:": "أعد ترتيب الحروف:",
  "Pick a level": "اختر مستوى",
  "Type the word": "اكتب الكلمة",
  "Type the phrase": "اكتب العبارة",
  "words": "كلمات",
  "letters": "حروف",
  "Classic snake reimagined — elegant levels, glowing gems, and speed that climbs every level.": "الثعبان الكلاسيكي بثوب جديد — مستويات أنيقة وجواهر متوهجة وسرعة تتزايد مع كل مستوى.",
  "Level Up": "مستوى أعلى",
  "Music": "موسيقى",
  "Game Over": "انتهت اللعبة",
  "Swipe or arrows to steer. Eat the fruit and gems to grow — don't hit the walls or yourself!": "اسحب أو استخدم الأسهم للتوجيه. كُل الفاكهة والجواهر لتكبر — وتجنّب الجدران وجسمك!",
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
  "AI Logo Concepts": "مفاهيم شعارات بالذكاء الاصطناعي",
  "Generate AI Logos": "أنشئ شعارات بالذكاء الاصطناعي",
  "AI Logo": "شعار بالذكاء الاصطناعي",
  "Generate multiple original logo concepts from your brand name using AI. Click a slot to view and download.": "أنشئ عدة مفاهيم شعارات أصلية من اسم علامتك بالذكاء الاصطناعي. انقر خانة لعرض الشعار وتنزيله.",
  "Minimalist": "بسيط",
  "Badge": "شارة",
  "Modern": "حديث",
  "Emblem": "إمبلم",
  "Bold": "جريء",
  "Click logo to customize": "انقر الشعار للتخصيص",
  "Design Toolbar": "شريط التصميم",
  "Text Size": "حجم النص",
  "Custom color": "لون مخصص",
  "2048": "2048",
  "Memory Match": "تطابق الذاكرة",
  "Slide and merge tiles to reach 2048.": "حرّك وادمج البلاطات للوصول إلى 2048.",
  "Flip cards and match all the pairs.": "اقلب البطاقات وطابق جميع الأزواج.",
  "New Game": "لعبة جديدة",
  "Score": "النقاط",
  "Best": "الأفضل",
  "Moves": "الحركات",
  "Pairs": "الأزواج",
  "You win!": "فزت!",
  "Game Over": "انتهت اللعبة",
  "Play again": "العب مجددًا",
  "Swipe or use arrow keys to move. Merge equal tiles to reach 2048.": "اسحب أو استخدم أسهم لوحة المفاتيح للتحريك. ادمج البلاطات المتساوية للوصول إلى 2048.",
  "Flip two cards at a time and find every matching pair.": "اقلب بطاقتين في كل مرة واعثر على كل زوج متطابق.",
  "Brain Games Aren't a Waste of Time: How They Train Memory for Kids and Adults": "ألعاب العقل ليست مضيعة للوقت: كيف تدرّب الذاكرة للأطفال والكبار",
  "Instead of mindless scrolling, brain games quietly build memory, focus, and problem-solving — for your child and for you. Here's why playing together matters.": "بدل التصفح المفرغ، تبني ألعاب العقل الذاكرة والتركيز وحل المشكلات بهدوء — لطفلك ولك. إليك لماذا يهم اللعب معًا.",

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
  "Mastering Percentages: Three Calculations Everyone Gets Wrong": "إتقان النسب المئوية: ثلاثة حسابات يخطئ فيها الجميع تقريبًا",
  "Discounts, taxes, and growth rates all hide the same trap. Learn the three percentage calculations that trip up almost everyone.": "التخفيضات والضرائب ومعدلات النمو تخفي جميعها الفخ نفسه. تعلّم حسابات النسبة المئوية الثلاثة التي تُخطئ فيها معظم الناس.",
  "Speed, Distance, and Time: The Formula Behind Every Journey": "السرعة والمسافة والزمن: الصيغة وراء كل رحلة",
  "One simple relationship explains commute times, trip planning, and physics homework. Here is how to use it correctly.": "علاقة بسيطة واحدة تفسّر أوقات التنقل وتخطيط الرحلات وواجب الفيزياء. إليك كيف تستخدمها بشكل صحيح.",
  "Molar Mass Made Simple: From H2O to C6H12O6": "الكتلة المولية ببساطة: من H2O إلى C6H12O6",
  "Why chemists weigh substances in moles, and how to calculate the molar mass of any formula in seconds.": "لماذا يزن الكيميائيون المواد بالمولات، وكيف تحسب الكتلة المولية لأي صيغة في ثوانٍ.",
  "Seeing Functions: Why Plotting an Equation Beats Solving It": "رؤية الدوال: لماذا يتفوق رسم المعادلة على حلها",
  "A graph reveals roots, peaks, and patterns that formulas hide. Here is how to read what a function is telling you.": "يكشف الرسم الجذور والقمم والأنماط التي تخفيها الصيغ. إليك كيف تقرأ ما تخبرك به الدالة.",
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

  // Privacy — re-crafted no-tracking policy (About / Home / Privacy pages)
  "At TestPeak, your privacy comes first. We don't track you, we don't profile you, and most tools run entirely in your browser. This policy explains how the platform handles data.":
    "في TestPeak، خصوصيتك أولًا. لا نُتابعك ولا نُنشئ ملفًا لك، وتعمل معظم الأدوات بالكامل في متصفحك. توضح هذه السياسة كيفية تعامل المنصة مع البيانات.",
  "At TestPeak, your privacy comes first. We don't track you and we don't profile you. This policy explains which tools process information locally in your browser, and the few features that use our servers only when you actively use them.":
    "في TestPeak، خصوصيتك أولًا. لا نُتابعك ولا نُنشئ ملفًا لك. توضح هذه السياسة أي الأدوات تُعالج المعلومات محليًا في متصفحك، والأدوات القليلة التي تستخدم خوادمنا فقط عند استخدامك لها فعلًا.",
  "Last Updated: August 15, 2026": "آخر تحديث: 15 أغسطس 2026",

  "1. We Don't Track You": "1. لا نُتابعك",
  "TestPeak does not use Google Analytics or any third-party tracking. We do not record which tools you use or track your behavior. No tracking cookies are set.":
    "لا يستخدم TestPeak أداة Google Analytics أو أي تتبّع خارجي. لا نسجّل الأدوات التي تستخدمها ولا نُتابع سلوكك. لا نضع أي ملفات تعقّب.",
  "TestPeak uses no Google Analytics or third-party trackers. We do not record which tools you use or set tracking cookies.":
    "لا يستخدم TestPeak أداة Google Analytics أو أي أدوات تتبّع خارجية. لا نسجّل الأدوات التي تستخدمها ولا نضع ملفات تعقّب.",
  "TestPeak does not use Google Analytics or any third-party analytics or advertising trackers. We do not record which tools you open, track your visits, or build a profile of your behavior. No tracking cookies are ever set.":
    "لا يستخدم TestPeak أداة Google Analytics أو أي أدوات تحليلات أو إعلانات خارجية. لا نسجّل الأدوات التي تفتحها ولا نُتابع زياراتك ولا نُنشئ ملفًا لسلوكك. لا نضع ملفات تعقّب أبدًا.",

  "2. Local-First Processing": "2. المعالجة محلية أساسًا",
  "Calculators, converters, the QR generator, and image tools (cropper, compressor, enhancer, background remover) run entirely in your browser. Your inputs and images never leave your device.":
    "تعمل الحاسبات والمحوّلات ومولّد QR وأدوات الصور (القاطع والضاغط والمحسّن وإزالة الخلفية) بالكامل في متصفحك. مدخلاتك وصورك لا تغادر جهازك أبدًا.",
  "Calculators, converters, the QR generator, and the image tools (cropper, compressor, enhancer, background remover) run entirely in your browser. Your inputs, values, and images never leave your device for these tools.":
    "تعمل الحاسبات والمحوّلات ومولّد QR وأدوات الصور (القاطع والضاغط والمحسّن وإزالة الخلفية) بالكامل في متصفحك. مدخلاتك وقيمك وصورك لا تغادر جهازك أبدًا مع هذه الأدوات.",
  "Calculators, converters, and image tools run in your browser. Only the AI Logo Maker and admin blog uploads use our servers, and only when you actively use them.":
    "تعمل الحاسبات والمحوّلات وأدوات الصور في متصفحك. فقط مولّد الشعار بالذكاء الاصطناعي ورفع صور المدوّنة من المشرف يستخدمان خوادمنا، وذلك فقط عند استخدامهما فعلًا.",

  "3. Tools That Use Our Servers": "3. أدوات تستخدم خوادمنا",
  "The AI Logo Maker sends your brand name and tagline to generate logos, and blog images uploaded by admins are stored on our servers. These are actions you take, not passive tracking.":
    "يُرسل مولّد الشعار بالذكاء الاصطناعي اسم علامتك ونصّها لإنشاء الشعارات، وتُخزَّن صور المدوّنة التي يرفعها المشرفون على خوادمنا. هذه أفعال تقوم بها أنت، لا تتبّعًا سلبيًا.",
  "A few features use our servers only when you actively choose them: the AI Logo Maker sends your brand name and tagline to generate logo concepts, which are returned to you; and blog images uploaded by administrators are stored on our servers. These are actions you take — not passive tracking — and no usage profile is built from them.":
    "بعض الميزات تستخدم خوادمنا فقط عند اختيارك لها فعلًا: يُرسل مولّد الشعار بالذكاء الاصطناعي اسم علامتك ونصّها لإنشاء مفاهيم شعارات تُعاد إليك؛ وتُخزَّن صور المدوّنة التي يرفعها المشرفون على خوادمنا. هذه أفعال تقوم بها أنت — لا تتبّعًا سلبيًا — ولا يُبنى منها أي ملف لاستخدامك.",

  "4. Accounts": "4. الحسابات",
  "If you create an account, we store your email address. We do not ask for your name or phone number.":
    "إذا أنشأت حسابًا، نخزّن بريدك الإلكتروني فقط. لا نطلب اسمك أو رقم هاتفك.",
  "Creating an account is optional. If you do, we store only your email address to identify you. We do not ask for your name or phone number.":
    "إنشاء حساب اختياري. إذا فعلت، نخزّن بريدك الإلكتروني فقط للتعرف عليك. لا نطلب اسمك أو رقم هاتفك.",

  "5. Cookies": "5. ملفات تعريف الارتباط",
  "We use local storage only to remember your preferences (language, favorites). We do not use tracking cookies and share nothing with advertisers.":
    "نستخدم التخزين المحلي فقط لتذكّر تفضيلاتك (اللغة، المفضّلة). لا نستخدم ملفات تعقّب ولا نشارك شيئًا مع المعلنين.",
  "5. Cookies & Local Storage": "5. ملفات تعريف الارتباط والتخزين المحلي",
  "We use local storage only to remember your preferences, such as your language and favorite tools. We do not use tracking cookies, and we share no data with advertisers or third parties.":
    "نستخدم التخزين المحلي فقط لتذكّر تفضيلاتك مثل لغتك وأدواتك المفضّلة. لا نستخدم ملفات تعقّب ولا نشارك أي بيانات مع المعلنين أو أطراف ثالثة.",

  "We apply appropriate technical and organizational measures. However, no security system is 100% guaranteed.":
    "نتخذ تدابير تقنية وتنظيمية مناسبة. ومع ذلك، لا يوجد نظام أمان مضمون 100%.",
  "We apply appropriate technical and organizational measures to protect any data we hold. However, no system is 100% secure, and we cannot guarantee absolute security.":
    "نتخذ تدابير تقنية وتنظيمية مناسبة لحماية أي بيانات نحتفظ بها. ومع ذلك، لا يوجد نظام آمن 100%، ولا يمكننا ضمان أمان مطلق.",

  "You may access, correct, or delete your personal data, object to its processing, and withdraw consent at any time. To exercise these rights, contact us at the email below.":
    "يمكنك الوصول إلى بياناتك الشخصية أو تصحيحها أو حذفها، والاعتراض على معالجتها، وسحب موافقتك في أي وقت. لممارسة هذه الحقوق، تواصل معنا عبر البريد أدناه.",

  "8. Financial & Health Disclaimer": "8. إخلاء المسؤولية المالية والصحية",
  "All financial and health tools are for educational and informational purposes only and do not constitute professional advice.":
    "جميع الأدوات المالية والصحية لأغراض تعليمية وإعلامية فقط، ولا تُعد نصيحة مهنية.",
  "All financial and health tools (loans, interest, BMI, calories, etc.) are for educational and informational purposes only and do not constitute professional financial or medical advice.":
    "جميع الأدوات المالية والصحية (القروض والفائدة ومؤشر كتلة الجسم والسعرات وغيرها) لأغراض تعليمية وإعلامية فقط، ولا تُعد نصيحة مالية أو طبية مهنية.",

  "9. Children's Privacy": "9. خصوصية الأطفال",
  "TestPeak is not directed at children under 13, and we do not knowingly collect personal information from children.":
    "TestPeak غير موجّه للأطفال دون 13 عامًا، ولا نجمع عمدًا معلومات شخصية من الأطفال.",
  "10. Changes to This Policy": "10. التغييرات على هذه السياسة",
  "We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated revision date.":
    "قد نُحدّث سياسة الخصوصية من حين لآخر. تُنشر التغييرات على هذه الصفحة مع تاريخ مراجعة مُحدّث.",

  "9. Contact Us": "9. اتصل بنا",
  "11. Contact Us": "11. اتصل بنا",
  "Jump back in and explore all 31+ free tools TestPeak has to offer.":
    "عُد واستكشف جميع الأدوات المجانية (أكثر من 31) التي يقدمها TestPeak.",
  "6. Information Security": "6. أمان المعلومات",
  "7. Your Rights": "7. حقوقك",

  "Restricted admin area — logging in or registering here does not grant admin access. Admin rights are assigned by invitation only.":
    "منطقة محصورة للإدارة فقط — تسجيل الدخول أو إنشاء حساب هنا لا يمنحك صلاحيات المشرف. تُمنح صلاحية المشرف عبر دعوة من المشرف فقط.",

  "Whack-a-Mole": "اطرب الفأر",
  "Whack!": "اضرب!",
  "Score": "النقاط",
  "Time": "الوقت",
  "Best": "الأفضل",
  "Start": "ابدأ",
  "Start Game": "ابدأ اللعبة",
  "Time's up!": "انتهى الوقت!",
  "Tap the moles as fast as you can before they hide again — 30 seconds!":
    "اضرب الفئران بأسرع ما يمكن قبل أن تختبئ مجددًا — 30 ثانية!",
  "Ball Launcher": "قاذفة الكرة",
  "Whack-a-Mole": "اطرب الفأر",
  "Tap & aim to launch balls at the bubbles — 30 seconds!":
    "المس وصوّب لإطلاق الكرات نحو الفقاعات — 30 ثانية!",
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