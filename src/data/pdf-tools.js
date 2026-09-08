// Shared catalog of all PDF sub-tools.
// Used by the PDF Tools page and surfaced in the "Discover All Free Tools" panel.
import {
  FileDown, FileOutput, Layers, Minimize2, Shield, ScanText, Wrench,
  FileText, FileSpreadsheet, FileImage, Scissors, ArrowDownUp, Globe,
  Lock, Droplet, ListOrdered, Eye, FilePlus,
} from "lucide-react";

export const PDF_CATEGORIES = [
  { key: "convert-to-pdf", name: "تحويل إلى PDF", nameEn: "Convert to PDF", icon: FileDown, desc: "حوّل ملفات Word و Excel والصور إلى PDF", tools: [
    { slug: "word-to-pdf", name: "Word إلى PDF", nameEn: "Word to PDF", icon: FileText, desc: "حوّل مستندات Word (.docx) إلى PDF", accept: ".docx", multi: false },
    { slug: "excel-to-pdf", name: "Excel إلى PDF", nameEn: "Excel to PDF", icon: FileSpreadsheet, desc: "حوّل جداول Excel (.xlsx) إلى PDF", accept: ".xlsx,.xls", multi: false },
    { slug: "image-to-pdf", name: "صور إلى PDF", nameEn: "Images to PDF", icon: FileImage, desc: "حوّل مجموعة صور (JPG, PNG) إلى PDF واحد", accept: "image/*", multi: true },
  ]},
  { key: "convert-from-pdf", name: "استخراج من PDF", nameEn: "Extract from PDF", icon: FileOutput, desc: "استخرج النصوص والصور من ملفات PDF", tools: [
    { slug: "pdf-to-text", name: "استخراج النص", nameEn: "PDF to Text", icon: FileText, desc: "استخرج النصوص من PDF", accept: "application/pdf", multi: false },
    { slug: "pdf-to-images", name: "PDF إلى صور", nameEn: "PDF to Images", icon: FileImage, desc: "حوّل كل صفحة من PDF إلى صورة (ZIP)", accept: "application/pdf", multi: false },
  ]},
  { key: "merge-split", name: "دمج وتقسيم", nameEn: "Merge & Split", icon: Layers, desc: "ادمج عدة PDF أو قسّم ملفاً إلى أجزاء", tools: [
    { slug: "merge-pdf", name: "دمج PDF", nameEn: "Merge PDF", icon: Layers, desc: "ادمج عدة ملفات PDF في ملف واحد", accept: "application/pdf", multi: true },
    { slug: "split-pdf", name: "تقسيم PDF", nameEn: "Split PDF", icon: Scissors, desc: "قسّم PDF إلى صفحات منفصلة (ZIP)", accept: "application/pdf", multi: false },
    { slug: "extract-pages", name: "استخراج صفحات", nameEn: "Extract Pages", icon: FileOutput, desc: "استخرج صفحات محددة من PDF", accept: "application/pdf", multi: false },
    { slug: "rearrange-pages", name: "ترتيب الصفحات", nameEn: "Rearrange Pages", icon: ArrowDownUp, desc: "أعد ترتيب صفحات PDF", accept: "application/pdf", multi: false },
  ]},
  { key: "compress-optimize", name: "ضغط وتحسين", nameEn: "Compress & Optimize", icon: Minimize2, desc: "قلّص حجم ملفات PDF", tools: [
    { slug: "compress-pdf", name: "ضغط PDF", nameEn: "Compress PDF", icon: Minimize2, desc: "أعد حفظ PDF لتقليل الحجم", accept: "application/pdf", multi: false },
    { slug: "web-optimize", name: "تحسين للويب", nameEn: "Web Optimize", icon: Globe, desc: "أعد حفظ PDF محسّناً للعرض", accept: "application/pdf", multi: false },
  ]},
  { key: "protect-edit", name: "حماية وتحرير", nameEn: "Protect & Edit", icon: Shield, desc: "حماية، علامة مائية، أرقام صفحات", tools: [
    { slug: "protect-pdf", name: "حماية PDF", nameEn: "Protect PDF", icon: Lock, desc: "أضف كلمة مرور لتشفير PDF", accept: "application/pdf", multi: false },
    { slug: "watermark-pdf", name: "علامة مائية", nameEn: "Add Watermark", icon: Droplet, desc: "أضف نصاً كعلامة مائية على كل صفحة", accept: "application/pdf", multi: false },
    { slug: "page-numbers", name: "أرقام الصفحات", nameEn: "Add Page Numbers", icon: ListOrdered, desc: "أضف أرقام الصفحات أسفل كل صفحة", accept: "application/pdf", multi: false },
  ]},
  { key: "ocr", name: "التعرف على النصوص (OCR)", nameEn: "OCR", icon: ScanText, desc: "استخرج النص من الصور (Tesseract.js)", tools: [
    { slug: "ocr-image", name: "OCR على صورة", nameEn: "OCR Image", icon: ScanText, desc: "استخرج النص من صورة (عربي/إنجليزي)", accept: "image/*", multi: false },
  ]},
  { key: "extra", name: "أدوات إضافية", nameEn: "Extra", icon: Wrench, desc: "عرض PDF أو إنشاء PDF فارغ", tools: [
    { slug: "view-pdf", name: "عرض PDF", nameEn: "View PDF", icon: Eye, desc: "اعرض ملف PDF في المتصفح", accept: "application/pdf", multi: false },
    { slug: "create-blank-pdf", name: "إنشاء PDF فارغ", nameEn: "Create Blank PDF", icon: FilePlus, desc: "أنشئ ملف PDF فارغاً", accept: null, multi: false },
  ]},
];

// Flat list of all PDF sub-tools for surfacing in the Discover panel.
export const PDF_TOOLS_FLAT = PDF_CATEGORIES.flatMap((c) =>
  c.tools.map((t) => ({ slug: t.slug, name: t.nameEn, category: "PDF Tools" }))
);