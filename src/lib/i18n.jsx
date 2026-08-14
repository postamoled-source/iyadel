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

  // Tool categories
  "Finance": "التمويل",
  "Health": "الصحة",
  "Converters": "المحولات",
  "Math": "الرياضيات",
  "Games": "الألعاب",
  "Image Tools": "أدوات الصور",
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