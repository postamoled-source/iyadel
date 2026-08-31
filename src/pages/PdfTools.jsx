import { useState, useCallback } from "react";
import { jsPDF } from "jspdf";
import { useI18n } from "@/lib/i18n";
import {
  FileDown, FileOutput, Layers, Minimize2, Shield, ScanText, Wrench,
  FileText, FileSpreadsheet, FileImage, Scissors, ArrowDownUp, Globe,
  Lock, Droplet, ListOrdered, Eye, FilePlus, Search, X, Upload, Download,
  Sparkles, Info,
} from "lucide-react";

/* ---------- CDN library loader (loaded on demand, cached) ---------- */
const scriptCache = {};
function loadScript(src) {
  if (scriptCache[src]) return scriptCache[src];
  const p = new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = src; s.async = true;
    s.onload = resolve;
    s.onerror = () => { delete scriptCache[src]; reject(new Error("Failed to load: " + src)); };
    document.head.appendChild(s);
  });
  scriptCache[src] = p;
  return p;
}
const ensurePdfLib = async () => { if (!window.PDFLib) await loadScript("https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/dist/pdf-lib.min.js"); return window.PDFLib; };
const ensurePdfJs = async () => {
  if (!window.pdfjsLib) {
    await loadScript("https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.min.js");
    window.pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js";
  }
  return window.pdfjsLib;
};
const ensureMammoth = async () => { if (!window.mammoth) await loadScript("https://cdn.jsdelivr.net/npm/mammoth@1.6.0/mammoth.browser.min.js"); return window.mammoth; };
const ensureXlsx = async () => { if (!window.XLSX) await loadScript("https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js"); return window.XLSX; };
const ensureJsZip = async () => { if (!window.JSZip) await loadScript("https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js"); return window.JSZip; };
const ensureTesseract = async () => { if (!window.Tesseract) await loadScript("https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js"); return window.Tesseract; };

/* ---------- helpers ---------- */
const readAsDataURL = (file) => new Promise((res, rej) => { const r = new FileReader(); r.onload = (e) => res(e.target.result); r.onerror = rej; r.readAsDataURL(file); });
const readAsArrayBuffer = (file) => new Promise((res, rej) => { const r = new FileReader(); r.onload = (e) => res(e.target.result); r.onerror = rej; r.readAsArrayBuffer(file); });
const parsePageRanges = (input) => {
  const pages = [];
  input.split(",").forEach((part) => {
    part = part.trim(); if (!part) return;
    if (part.includes("-")) { const [a, b] = part.split("-").map(Number); for (let i = a; i <= b; i++) pages.push(i); }
    else { const n = parseInt(part, 10); if (!isNaN(n)) pages.push(n); }
  });
  return pages;
};
const downloadBlob = (blob, name) => { const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 4000); };

/* ---------- tool catalog ---------- */
const CATEGORIES = [
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

export default function PdfTools() {
  const { t, isRTL } = useI18n();
  const [query, setQuery] = useState("");
  const [activeSlug, setActiveSlug] = useState(null);
  const [files, setFiles] = useState([]);
  const [status, setStatus] = useState("");
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);
  const [extra, setExtra] = useState({ password: "123456", watermark: "iyadel.com", pages: "1", order: "1,2,3" });
  const [dragOver, setDragOver] = useState(false);

  const activeTool = (() => {
    for (const c of CATEGORIES) { const f = c.tools.find((x) => x.slug === activeSlug); if (f) return { tool: f, cat: c }; }
    return null;
  })();
  const HeaderIcon = activeTool?.tool?.icon;

  const reset = (slug) => {
    setActiveSlug(slug); setFiles([]); setStatus(""); setProgress(0); setResult(null);
    setExtra({ password: "123456", watermark: "iyadel.com", pages: "1", order: "1,2,3" });
  };

  const onFiles = (list) => { setFiles(Array.from(list || [])); setResult(null); setStatus(""); setProgress(0); };

  const run = useCallback(async () => {
    if (!activeTool) return;
    const { slug } = activeTool.tool;
    if (slug !== "create-blank-pdf" && files.length === 0) { setStatus(t("Please choose a file first.")); return; }
    setStatus(t("Processing...")); setProgress(20); setResult(null);
    try {
      let out = null;
      switch (slug) {
        case "merge-pdf": {
          const { PDFDocument } = await ensurePdfLib();
          const merged = await PDFDocument.create();
          for (let i = 0; i < files.length; i++) {
            if (files[i].type !== "application/pdf") throw new Error(t("Not a PDF") + ": " + files[i].name);
            const pdf = await PDFDocument.load(await files[i].arrayBuffer());
            (await merged.copyPages(pdf, pdf.getPageIndices())).forEach((p) => merged.addPage(p));
            setProgress(20 + Math.round(((i + 1) / files.length) * 70));
          }
          const bytes = await merged.save();
          out = { kind: "file", blob: new Blob([bytes], { type: "application/pdf" }), name: "merged.pdf" };
          break;
        }
        case "split-pdf": {
          const { PDFDocument } = await ensurePdfLib();
          const JSZip = await ensureJsZip();
          const pdf = await PDFDocument.load(await files[0].arrayBuffer());
          const total = pdf.getPageCount();
          const zip = new JSZip();
          for (let i = 0; i < total; i++) {
            const np = await PDFDocument.create();
            const [pg] = await np.copyPages(pdf, [i]);
            np.addPage(pg);
            zip.file(`page_${i + 1}.pdf`, await np.save());
            setProgress(20 + Math.round(((i + 1) / total) * 70));
          }
          out = { kind: "file", blob: await zip.generateAsync({ type: "blob" }), name: "split_pages.zip" };
          break;
        }
        case "extract-pages": {
          const { PDFDocument } = await ensurePdfLib();
          const nums = parsePageRanges(extra.pages);
          if (!nums.length) throw new Error(t("Invalid page numbers."));
          const pdf = await PDFDocument.load(await files[0].arrayBuffer());
          const total = pdf.getPageCount();
          const valid = nums.filter((n) => n >= 1 && n <= total);
          if (!valid.length) throw new Error(t("No valid pages."));
          const np = await PDFDocument.create();
          (await np.copyPages(pdf, valid.map((n) => n - 1))).forEach((p) => np.addPage(p));
          out = { kind: "file", blob: new Blob([await np.save()], { type: "application/pdf" }), name: "extracted_pages.pdf" };
          break;
        }
        case "rearrange-pages": {
          const { PDFDocument } = await ensurePdfLib();
          const order = extra.order.split(",").map((s) => parseInt(s.trim(), 10)).filter((n) => !isNaN(n) && n > 0);
          if (!order.length) throw new Error(t("Invalid order."));
          const pdf = await PDFDocument.load(await files[0].arrayBuffer());
          const total = pdf.getPageCount();
          const valid = order.filter((n) => n <= total);
          if (!valid.length) throw new Error(t("No valid pages."));
          const np = await PDFDocument.create();
          (await np.copyPages(pdf, valid.map((n) => n - 1))).forEach((p) => np.addPage(p));
          out = { kind: "file", blob: new Blob([await np.save()], { type: "application/pdf" }), name: "rearranged.pdf" };
          break;
        }
        case "compress-pdf":
        case "web-optimize": {
          const { PDFDocument } = await ensurePdfLib();
          const pdf = await PDFDocument.load(await files[0].arrayBuffer());
          const bytes = await pdf.save({ useObjectStreams: true });
          const before = files[0].size, after = bytes.byteLength;
          out = { kind: "file", blob: new Blob([bytes], { type: "application/pdf" }), name: slug === "compress-pdf" ? "compressed.pdf" : "web_optimized.pdf", sizeInfo: `${(before / 1024).toFixed(1)} KB → ${(after / 1024).toFixed(1)} KB` };
          break;
        }
        case "protect-pdf": {
          const { PDFDocument } = await ensurePdfLib();
          const pdf = await PDFDocument.load(await files[0].arrayBuffer());
          pdf.encrypt({ userPassword: extra.password, ownerPassword: extra.password });
          out = { kind: "file", blob: new Blob([await pdf.save()], { type: "application/pdf" }), name: "protected.pdf" };
          break;
        }
        case "watermark-pdf": {
          const { PDFDocument, rgb, degrees } = await ensurePdfLib();
          const pdf = await PDFDocument.load(await files[0].arrayBuffer());
          pdf.getPages().forEach((page) => {
            const { width, height } = page.getSize();
            const tw = extra.watermark.length * 14;
            page.drawText(extra.watermark, { x: width / 2 - tw / 2, y: height / 2, size: 40, color: rgb(0.8, 0.8, 0.8), opacity: 0.3, rotate: degrees(-30) });
          });
          out = { kind: "file", blob: new Blob([await pdf.save()], { type: "application/pdf" }), name: "watermarked.pdf" };
          break;
        }
        case "page-numbers": {
          const { PDFDocument, rgb } = await ensurePdfLib();
          const pdf = await PDFDocument.load(await files[0].arrayBuffer());
          pdf.getPages().forEach((page, i) => {
            const { width } = page.getSize();
            page.drawText(String(i + 1), { x: width / 2 - 4, y: 18, size: 12, color: rgb(0, 0, 0) });
          });
          out = { kind: "file", blob: new Blob([await pdf.save()], { type: "application/pdf" }), name: "numbered.pdf" };
          break;
        }
        case "word-to-pdf": {
          const mammoth = await ensureMammoth();
          const html = (await mammoth.convertToHtml({ arrayBuffer: await readAsArrayBuffer(files[0]) })).value;
          const text = (new DOMParser().parseFromString(html, "text/html")).body.textContent || "";
          const doc = new jsPDF("p", "mm", "a4");
          doc.setFontSize(12);
          const lines = doc.splitTextToSize(text, 180);
          lines.forEach((line, i) => { const y = 20 + (i % 48) * 6; if (i > 0 && i % 48 === 0) doc.addPage(); doc.text(line, 15, y); });
          out = { kind: "file", blob: doc.output("blob"), name: "word_to_pdf.pdf" };
          break;
        }
        case "excel-to-pdf": {
          const XLSX = await ensureXlsx();
          const wb = XLSX.read(await readAsArrayBuffer(files[0]), { type: "array" });
          const data = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 1 });
          const doc = new jsPDF("p", "mm", "a4");
          doc.setFontSize(10);
          let y = 20;
          data.forEach((row) => {
            const lines = doc.splitTextToSize(row.join("  "), 180);
            doc.text(lines, 15, y); y += 6 * lines.length;
            if (y > 280) { doc.addPage(); y = 20; }
          });
          out = { kind: "file", blob: doc.output("blob"), name: "excel_to_pdf.pdf" };
          break;
        }
        case "image-to-pdf": {
          const doc = new jsPDF("p", "mm", "a4");
          for (let i = 0; i < files.length; i++) {
            if (!files[i].type.startsWith("image/")) throw new Error(t("Not an image") + ": " + files[i].name);
            const dataURL = await readAsDataURL(files[i]);
            const fmt = files[i].type === "image/png" ? "PNG" : "JPEG";
            const dims = await new Promise((res) => { const img = new Image(); img.onload = () => res({ w: img.width, h: img.height }); img.src = dataURL; });
            const ratio = Math.min(190 / dims.w, 277 / dims.h);
            const w = dims.w * ratio, h = dims.h * ratio;
            if (i > 0) doc.addPage();
            doc.addImage(dataURL, fmt, (210 - w) / 2, (297 - h) / 2, w, h);
            setProgress(20 + Math.round(((i + 1) / files.length) * 70));
          }
          out = { kind: "file", blob: doc.output("blob"), name: "images_to_pdf.pdf" };
          break;
        }
        case "pdf-to-text": {
          const pdfjsLib = await ensurePdfJs();
          const pdf = await pdfjsLib.getDocument({ data: await readAsArrayBuffer(files[0]) }).promise;
          let text = "";
          for (let i = 1; i <= pdf.numPages; i++) {
            const tc = await (await pdf.getPage(i)).getTextContent();
            text += `${t("Page")} ${i}:\n${tc.items.map((it) => it.str).join(" ")}\n\n`;
            setProgress(20 + Math.round((i / pdf.numPages) * 70));
          }
          out = { kind: "text", text, name: "extracted_text.txt" };
          break;
        }
        case "pdf-to-images": {
          const pdfjsLib = await ensurePdfJs();
          const JSZip = await ensureJsZip();
          const pdf = await pdfjsLib.getDocument({ data: await readAsArrayBuffer(files[0]) }).promise;
          const zip = new JSZip();
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const vp = page.getViewport({ scale: 1.5 });
            const canvas = document.createElement("canvas");
            canvas.width = vp.width; canvas.height = vp.height;
            await page.render({ canvasContext: canvas.getContext("2d"), viewport: vp }).promise;
            zip.file(`page_${i}.png`, canvas.toDataURL("image/png").split(",")[1], { base64: true });
            setProgress(20 + Math.round((i / pdf.numPages) * 70));
          }
          out = { kind: "file", blob: await zip.generateAsync({ type: "blob" }), name: "pdf_images.zip" };
          break;
        }
        case "ocr-image": {
          const Tesseract = await ensureTesseract();
          setStatus(t("Recognizing text... (may take a moment)"));
          const dataURL = await readAsDataURL(files[0]);
          const { data } = await Tesseract.recognize(dataURL, "ara+eng");
          out = { kind: "text", text: data.text, name: "ocr_text.txt" };
          break;
        }
        case "view-pdf": {
          out = { kind: "view", url: URL.createObjectURL(files[0]), name: files[0].name };
          break;
        }
        case "create-blank-pdf": {
          const { PDFDocument } = await ensurePdfLib();
          const pdf = await PDFDocument.create();
          pdf.addPage([595, 842]);
          out = { kind: "file", blob: new Blob([await pdf.save()], { type: "application/pdf" }), name: "blank.pdf" };
          break;
        }
        default: throw new Error(t("Tool not supported."));
      }
      if (out.kind === "file") { const url = URL.createObjectURL(out.blob); setResult({ kind: "file", url, name: out.name, sizeInfo: out.sizeInfo }); }
      else if (out.kind === "text") setResult({ kind: "text", text: out.text, name: out.name });
      else if (out.kind === "view") setResult({ kind: "view", url: out.url, name: out.name });
      setStatus(t("Done!")); setProgress(100);
    } catch (e) {
      setStatus(t("Error") + ": " + e.message); setProgress(100);
    }
  }, [activeTool, files, extra, t]);

  const filtered = query.trim().toLowerCase();
  const visibleCats = CATEGORIES.map((c) => ({ ...c, tools: c.tools.filter((t2) => !filtered || (t2.name + " " + t2.nameEn + " " + c.name + " " + c.nameEn).toLowerCase().includes(filtered)) })).filter((c) => c.tools.length);

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="min-h-screen bg-[#FFFBEB] dark:bg-[#1E1B4B]">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-primary/30 blur-[120px]" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-accent/20 blur-[120px]" />
        <div className="relative max-w-5xl mx-auto px-4 pt-10 pb-6 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-violet-600 shadow-lg mb-3">
            <FileDown className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-[#6D28D9] to-[#F59E0B] bg-clip-text text-transparent">{t("PDF Tools")}</h1>
          <p className="mt-2 text-sm text-muted-foreground max-w-xl mx-auto">{t("A complete set of PDF tools that run in your browser — no file is ever uploaded.")}</p>
          <div className="mt-3 inline-flex items-center gap-2 text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 px-3 py-1.5 rounded-full">
            <Info className="w-3.5 h-3.5" /> {t("All processing happens on your device. Your files stay private.")}
          </div>
          {/* Search */}
          <div className="relative max-w-md mx-auto mt-5">
            <Search className="absolute top-1/2 -translate-y-1/2 start-3.5 w-4 h-4 text-muted-foreground" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t("Search a tool...")} className="w-full h-12 rounded-full bg-white dark:bg-[#2D2A5A] border-2 border-[#FDE68A] dark:border-[#4B3F8A] ps-11 pe-10 text-sm font-medium text-[#1E1B4B] dark:text-[#FEF3C7] outline-none focus:border-primary focus:shadow-[0_0_0_4px_rgba(109,40,217,0.15)] transition-all" />
            {query && <button onClick={() => setQuery("")} className="absolute top-1/2 -translate-y-1/2 end-3 text-muted-foreground"><X className="w-4 h-4" /></button>}
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="max-w-5xl mx-auto px-4 pb-16">
        {visibleCats.map((cat) => {
          const CatIcon = cat.icon;
          return (
            <section key={cat.key} className="mb-8">
              <div className="flex items-center gap-3 mb-4 pb-2 border-b-2 border-[#FDE68A] dark:border-[#4B3F8A]">
                <span className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0"><CatIcon className="w-5 h-5 text-primary" /></span>
                <div className="min-w-0">
                  <h2 className="text-lg font-bold text-[#1E1B4B] dark:text-[#FEF3C7] truncate">{cat.name} <span className="text-xs font-normal text-muted-foreground">({cat.nameEn})</span></h2>
                  <p className="text-xs text-muted-foreground truncate">{cat.desc}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {cat.tools.map((tool) => {
                  const ToolIcon = tool.icon;
                  return (
                    <button key={tool.slug} onClick={() => reset(tool.slug)} className="group text-start bg-white dark:bg-[#2D2A5A] rounded-2xl p-4 border border-[#FDE68A] dark:border-[#4B3F8A] hover:-translate-y-1 hover:shadow-[0_8px_24px_-8px_rgba(109,40,217,0.25)] hover:border-primary transition-all">
                      <span className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-primary to-violet-600 shadow-md mb-2 group-hover:scale-110 transition-transform">
                        <ToolIcon className="w-5 h-5 text-white" />
                      </span>
                      <h3 className="text-sm font-bold text-[#1E1B4B] dark:text-[#FEF3C7]">{tool.name}</h3>
                      <span className="block text-[11px] text-muted-foreground">{tool.nameEn}</span>
                      <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{tool.desc}</p>
                    </button>
                  );
                })}
              </div>
            </section>
          );
        })}
        {visibleCats.length === 0 && <p className="text-center text-sm text-muted-foreground py-10">{t("No tools found.")}</p>}
      </div>

      {/* Modal */}
      {activeTool && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={(e) => e.target === e.currentTarget && setActiveSlug(null)}>
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-[#1E1B4B] rounded-3xl shadow-2xl p-6">
            <button onClick={() => setActiveSlug(null)} className="absolute top-4 end-4 w-9 h-9 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-destructive/15 hover:text-destructive transition-colors"><X className="w-4 h-4" /></button>
            <div className="flex items-center gap-3 mb-4">
              <span className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-violet-600 shadow-md">{HeaderIcon ? <HeaderIcon className="w-6 h-6 text-white" /> : null}</span>
              <div>
                <h3 className="text-xl font-extrabold text-[#1E1B4B] dark:text-[#FEF3C7]">{activeTool.tool.name}</h3>
                <span className="text-xs text-muted-foreground">{activeTool.tool.nameEn} · {activeTool.cat.name}</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-3">{activeTool.tool.desc}</p>
            <div className="text-xs bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200 rounded-xl px-3 py-2 mb-4 flex items-center gap-2"><Info className="w-3.5 h-3.5 shrink-0" /> {t("Processing runs in your browser. Nothing is uploaded.")}</div>

            {/* Upload */}
            {activeTool.tool.accept && (
              <label
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => { e.preventDefault(); setDragOver(false); onFiles(e.dataTransfer.files); }}
                className={`block rounded-2xl border-2 border-dashed p-6 text-center cursor-pointer transition-colors ${dragOver ? "border-primary bg-primary/5" : "border-[#FFE8A0] dark:border-[#4B3F8A] bg-[#FFFEF5] dark:bg-[#2D2A5A] hover:border-primary"}`}
              >
                <input type="file" accept={activeTool.tool.accept} multiple={activeTool.tool.multi} className="hidden" onChange={(e) => onFiles(e.target.files)} />
                <Upload className="w-8 h-8 text-primary mx-auto mb-2" />
                <p className="text-sm font-semibold text-[#1E1B4B] dark:text-[#FEF3C7]">{t("Drag files here or tap to choose")}</p>
                {files.length > 0 && <p className="text-xs text-muted-foreground mt-1">{files.map((f) => f.name).join(", ")}</p>}
              </label>
            )}

            {/* Extra options */}
            {activeTool.slug === "protect-pdf" && (
              <div className="mt-3"><label className="block text-[13px] font-semibold text-[#8B4513] dark:text-[#FBBF24] mb-1 ml-1">{t("Password")}</label>
                <input type="text" value={extra.password} onChange={(e) => setExtra({ ...extra, password: e.target.value })} className="w-full h-[52px] rounded-2xl border-2 border-[#FDE68A] dark:border-[#4B3F8A] bg-[#FFFEF5] dark:bg-[#2D2A5A] text-[#1E1B4B] dark:text-[#FEF3C7] px-4 outline-none focus:border-primary" /></div>
            )}
            {activeTool.slug === "watermark-pdf" && (
              <div className="mt-3"><label className="block text-[13px] font-semibold text-[#8B4513] dark:text-[#FBBF24] mb-1 ml-1">{t("Watermark text")}</label>
                <input type="text" value={extra.watermark} onChange={(e) => setExtra({ ...extra, watermark: e.target.value })} className="w-full h-[52px] rounded-2xl border-2 border-[#FDE68A] dark:border-[#4B3F8A] bg-[#FFFEF5] dark:bg-[#2D2A5A] text-[#1E1B4B] dark:text-[#FEF3C7] px-4 outline-none focus:border-primary" /></div>
            )}
            {activeTool.slug === "extract-pages" && (
              <div className="mt-3"><label className="block text-[13px] font-semibold text-[#8B4513] dark:text-[#FBBF24] mb-1 ml-1">{t("Pages (e.g. 1,3,5-7)")}</label>
                <input type="text" value={extra.pages} onChange={(e) => setExtra({ ...extra, pages: e.target.value })} className="w-full h-[52px] rounded-2xl border-2 border-[#FDE68A] dark:border-[#4B3F8A] bg-[#FFFEF5] dark:bg-[#2D2A5A] text-[#1E1B4B] dark:text-[#FEF3C7] px-4 outline-none focus:border-primary" /></div>
            )}
            {activeTool.slug === "rearrange-pages" && (
              <div className="mt-3"><label className="block text-[13px] font-semibold text-[#8B4513] dark:text-[#FBBF24] mb-1 ml-1">{t("New order (e.g. 3,1,2)")}</label>
                <input type="text" value={extra.order} onChange={(e) => setExtra({ ...extra, order: e.target.value })} className="w-full h-[52px] rounded-2xl border-2 border-[#FDE68A] dark:border-[#4B3F8A] bg-[#FFFEF5] dark:bg-[#2D2A5A] text-[#1E1B4B] dark:text-[#FEF3C7] px-4 outline-none focus:border-primary" /></div>
            )}

            {/* Run button */}
            <div className="mt-5 flex justify-center">
              <button onClick={run} className="relative overflow-hidden transition-transform duration-200 hover:-translate-y-0.5 active:translate-y-0 h-[52px] w-full max-w-[320px] rounded-full p-0.5" style={{ background: "linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)", boxShadow: "0 12px 24px -8px rgba(109,40,217,0.5)" }}>
                <span className="flex items-center justify-center gap-2 w-full h-full rounded-full text-white font-bold text-base" style={{ background: "linear-gradient(135deg, #6D28D9 0%, #8B5CF6 100%)" }}>
                  <Sparkles className="w-4 h-4" /> {t("Process")}
                </span>
              </button>
            </div>

            {/* Progress + status */}
            {progress > 0 && <div className="mt-4"><div className="h-1.5 rounded-full bg-muted overflow-hidden"><div className="h-full bg-primary transition-all" style={{ width: `${progress}%` }} /></div>{status && <p className="mt-2 text-sm text-muted-foreground text-center">{status}</p>}</div>}

            {/* Result */}
            {result?.kind === "file" && (
              <div className="mt-5 rounded-2xl bg-[#FFFBEB] dark:bg-[#2D2A5A] border-2 border-[#FDE68A] dark:border-[#4B3F8A] p-4 animate-[slideDown_0.3s_ease-out]">
                <a href={result.url} download={result.name} className="inline-flex items-center justify-center gap-2 w-full rounded-full bg-gradient-to-r from-[#6D28D9] to-[#8B5CF6] text-white font-semibold px-5 py-3 hover:opacity-90 transition-opacity"><Download className="w-4 h-4" /> {t("Download")} {result.name}</a>
                {result.sizeInfo && <p className="mt-2 text-xs text-muted-foreground text-center">{result.sizeInfo}</p>}
              </div>
            )}
            {result?.kind === "text" && (
              <div className="mt-5 rounded-2xl bg-[#FFFBEB] dark:bg-[#2D2A5A] border-2 border-[#FDE68A] dark:border-[#4B3F8A] p-4 animate-[slideDown_0.3s_ease-out]">
                <pre className="bg-muted/40 rounded-xl p-3 max-h-64 overflow-auto whitespace-pre-wrap text-sm text-[#1E1B4B] dark:text-[#FEF3C7]">{result.text}</pre>
                <button onClick={() => downloadBlob(new Blob([result.text], { type: "text/plain;charset=utf-8" }), result.name)} className="mt-3 inline-flex items-center justify-center gap-2 w-full rounded-full bg-gradient-to-r from-[#6D28D9] to-[#8B5CF6] text-white font-semibold px-5 py-3 hover:opacity-90 transition-opacity"><Download className="w-4 h-4" /> {t("Download")} {result.name}</button>
              </div>
            )}
            {result?.kind === "view" && (
              <div className="mt-5"><iframe src={result.url} title="preview" className="w-full h-80 rounded-2xl border border-[#FDE68A] dark:border-[#4B3F8A]" /><a href={result.url} download={result.name} className="mt-3 inline-flex items-center justify-center gap-2 w-full rounded-full bg-gradient-to-r from-[#6D28D9] to-[#8B5CF6] text-white font-semibold px-5 py-3 hover:opacity-90 transition-opacity"><Download className="w-4 h-4" /> {t("Download")}</a></div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}