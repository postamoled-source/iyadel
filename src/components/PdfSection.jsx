import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { FileText, ChevronRight, FileImage, ImageDown, Eraser, Crop } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { trackEvent } from "@/lib/analytics";

// Showcase of document/image tools that produce or refine PDFs — all run in the browser.
const PDF_TOOLS = [
  { slug: "image-to-pdf", Icon: FileImage, title: "Image to PDF", desc: "Combine multiple images into a single PDF you can share or print." },
  { slug: "image-compressor", Icon: ImageDown, title: "Image Compressor", desc: "Shrink image file size while keeping quality, ready for documents." },
  { slug: "background-remover", Icon: Eraser, title: "Background Remover", desc: "Strip backgrounds automatically for clean PDFs and designs." },
  { slug: "image-cropper", Icon: Crop, title: "Image Cropper", desc: "Crop images to exact ratios before exporting to PDF." },
];

export default function PdfSection() {
  const { t, lang } = useI18n();
  const ar = lang === "ar";
  return (
    <section className="bg-background pb-16" id="pdf-tools">
      <div className="max-w-5xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "0px 0px 100px 0px" }}
          transition={{ duration: 0.6 }}
          className="rounded-[3rem] border border-border bg-card p-8 md:p-12 shadow-2xl"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-500 to-orange-500 flex items-center justify-center shadow-lg">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-extrabold text-card-foreground">{ar ? "أدوات PDF" : "PDF Tools"}</h2>
              <p className="text-sm text-muted-foreground">{ar ? "حوّل واضبط صورك إلى PDF — كل ذلك في متصفحك، بدون رفع." : "Prepare & convert images into PDF — all in your browser, nothing uploaded."}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {PDF_TOOLS.map((tl) => (
              <Link key={tl.slug} to={`/tools/${tl.slug}`} onClick={() => trackEvent("pdf_section_open", { slug: tl.slug })}
                className="group rounded-2xl bg-background border border-border p-5 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <tl.Icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-bold text-foreground leading-tight">{t(tl.title)}</h3>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed mb-3">{ar ? tl.desc : tl.desc}</p>
                <span className="inline-flex items-center gap-1 text-primary text-sm font-semibold group-hover:gap-2 transition-all">
                  {ar ? "افتح" : "Open"} <ChevronRight className="w-4 h-4" />
                </span>
              </Link>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}