import { useState } from "react";
import { FileImage, ImageDown, Upload, Sparkles } from "lucide-react";
import { useI18n } from "@/lib/i18n";

// JPG → PNG converter. Runs entirely in the browser (canvas + toBlob),
// matching the iyadel image-tool pattern: nothing is uploaded, result is private.
export default function JpgToPngConverter() {
  const { t, isRTL } = useI18n();
  const [src, setSrc] = useState(null);     // data URL of the uploaded JPG
  const [result, setResult] = useState(null); // { url, origSize, newSize, w, h }
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const onFile = (file) => {
    setError("");
    setResult(null);
    if (!file) return;
    // Faithful to the JPG-only spec: reject non-JPEG inputs with a friendly message.
    if (!/^image\/jpe?g$/i.test(file.type)) {
      setError(t("Please upload a JPG image."));
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => setSrc(e.target.result);
    reader.readAsDataURL(file);
  };

  const convert = () => {
    if (!src) return;
    setError("");
    setBusy(true);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      canvas.getContext("2d").drawImage(img, 0, 0);
      canvas.toBlob((blob) => {
        setBusy(false);
        if (!blob) { setError(t("Conversion failed. Please try another image.")); return; }
        const url = URL.createObjectURL(blob);
        const origSize = Math.round((src.length * 3) / 4 / 1024);
        const newSize = Math.round(blob.size / 1024);
        setResult({ url, origSize, newSize, w: img.width, h: img.height });
      }, "image/png");
    };
    img.onerror = () => { setBusy(false); setError(t("Could not read the image file.")); };
    img.src = src;
  };

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="max-w-[480px] mx-auto w-full">
      {/* Upload */}
      <label className="block">
        <span className="block text-[13px] font-semibold text-[#8B4513] dark:text-[#FBBF24] mb-1 ml-1">{t("Upload JPG Image")}</span>
        <div className="relative rounded-[16px] border-[1.5px] border-dashed border-[#FFE8A0] dark:border-[#4B3F8A] bg-[#FFFEF5] dark:bg-[#2D2A5A] hover:border-[#F59E0B] transition-colors cursor-pointer">
          <input
            type="file"
            accept="image/jpeg,image/jpg"
            onChange={(e) => onFile(e.target.files?.[0])}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div className="flex flex-col items-center justify-center gap-2 py-8 px-4 text-center">
            <span className="w-11 h-11 rounded-full bg-[#FEF3C7] flex items-center justify-center">
              <Upload className="w-5 h-5 text-[#F59E0B]" />
            </span>
            <span className="text-sm font-semibold text-[#1E1B4B] dark:text-[#FEF3C7]">{t("Tap to choose a JPG file")}</span>
            <span className="text-xs text-muted-foreground">{t("Max 10 MB · processed privately in your browser")}</span>
          </div>
        </div>
      </label>

      {error && (
        <div className="mt-3 text-sm text-destructive bg-destructive/5 border border-destructive/20 rounded-xl px-3 py-2">{error}</div>
      )}

      {src && (
        <div className="mt-5">
          <img src={src} alt="preview" className="max-h-64 mx-auto rounded-xl border border-[#FDE68A] dark:border-[#4B3F8A]" />
        </div>
      )}

      {/* Convert button */}
      <div className="mt-6 flex justify-center">
        <button
          type="button"
          onClick={convert}
          disabled={!src || busy}
          className="relative overflow-hidden transition-transform duration-200 hover:-translate-y-0.5 active:translate-y-0 h-[52px] w-full max-w-[320px] rounded-full p-0.5 disabled:opacity-50 disabled:hover:translate-y-0"
          style={{ background: "linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)", boxShadow: "0 12px 24px -8px rgba(109,40,217,0.5)" }}
        >
          <span
            className="flex items-center justify-center gap-2 w-full h-full rounded-full text-white font-bold text-base"
            style={{ background: "linear-gradient(135deg, #6D28D9 0%, #8B5CF6 100%)" }}
          >
            <FileImage className="w-4 h-4" />
            <span>{busy ? t("Converting...") : t("Convert to PNG")}</span>
          </span>
        </button>
      </div>

      {/* Result */}
      {result && (
        <div
          className="mt-6 bg-[#FFFBEB] dark:bg-[#2D2A5A] border-2 border-[#FDE68A] dark:border-[#4B3F8A] rounded-[18px] p-[18px] animate-[slideDown_0.3s_ease-out]"
          style={{ backgroundImage: "radial-gradient(circle, rgba(245,158,11,0.08) 1px, transparent 1px)", backgroundSize: "14px 14px" }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-[#F59E0B]" />
            <span className="font-semibold uppercase tracking-widest text-[11px] text-[#92400E] dark:text-[#FBBF24]">{t("Converted PNG")}</span>
          </div>
          <img
            src={result.url}
            alt="png result"
            className="max-h-64 mx-auto rounded-xl border border-[#FDE68A] dark:border-[#4B3F8A]"
            style={{ background: "repeating-conic-gradient(hsl(var(--muted)) 0 25%, transparent 0 50%) 50% / 16px 16px" }}
          />
          <div className="mt-3 text-sm text-[#1E1B4B] dark:text-[#FEF3C7] text-center">
            {result.origSize} KB → <strong className="text-[#F59E0B]">{result.newSize} KB</strong> · {result.w}×{result.h}px
          </div>
          <a
            href={result.url}
            download="converted.png"
            className="inline-flex items-center justify-center gap-2 mt-4 w-full rounded-full bg-gradient-to-r from-[#6D28D9] to-[#8B5CF6] text-white font-semibold px-5 py-3 hover:opacity-90 transition-opacity"
          >
            <ImageDown className="w-4 h-4" /> {t("Download PNG")}
          </a>
          <p className="mt-3 text-xs text-muted-foreground text-center">
            {t("Your image was re-encoded as a PNG in your browser — nothing was uploaded, so it stays private. PNG preserves full quality and supports transparency.")}
          </p>
        </div>
      )}
    </div>
  );
}