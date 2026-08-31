import { useState, useRef } from "react";
import { Scaling, ImageDown, Upload, Sparkles, Link2, Unlink, Percent, Ruler } from "lucide-react";
import { useI18n } from "@/lib/i18n";

// Image Resizer — runs entirely in the browser (canvas). Nothing is uploaded.
// Supports resizing by exact dimensions (with optional aspect-ratio lock) or by
// a percentage scale. Output preserves the source format (JPEG/PNG).
export default function ImageResizer() {
  const { t, isRTL } = useI18n();
  const [src, setSrc] = useState(null);
  const [orig, setOrig] = useState(null); // { w, h, type }
  const [mode, setMode] = useState("dims"); // "dims" | "scale"
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [scale, setScale] = useState("50");
  const [ratio, setRatio] = useState(true);
  const [result, setResult] = useState(null); // { url, w, h, size, type }
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const imgRef = useRef(null);

  const onFile = (file) => {
    setError(""); setResult(null);
    if (!file) return;
    if (!/^image\//.test(file.type)) { setError(t("Please upload an image file.")); return; }
    const reader = new FileReader();
    reader.onload = (e) => {
      const url = e.target.result;
      const img = new Image();
      img.onload = () => { setOrig({ w: img.width, h: img.height, type: file.type }); imgRef.current = img; };
      img.src = url;
      setSrc(url);
      setWidth(""); setHeight("");
    };
    reader.readAsDataURL(file);
  };

  const computeDims = () => {
    const ow = orig.w, oh = orig.h;
    if (mode === "scale") {
      const s = parseFloat(scale) / 100;
      return { w: Math.max(1, Math.round(ow * s)), h: Math.max(1, Math.round(oh * s)) };
    }
    const w = width ? parseInt(width, 10) : null;
    const h = height ? parseInt(height, 10) : null;
    if (!w && !h) return null;
    if (w && h) {
      if (ratio) {
        const r = Math.min(w / ow, h / oh);
        return { w: Math.max(1, Math.round(ow * r)), h: Math.max(1, Math.round(oh * r)) };
      }
      return { w, h };
    }
    if (w) return { w, h: Math.max(1, Math.round((w / ow) * oh)) };
    return { w: Math.max(1, Math.round((h / oh) * ow)), h };
  };

  const resize = () => {
    if (!src || !orig) { setError(t("Please upload an image first.")); return; }
    const dims = computeDims();
    if (!dims) { setError(t("Enter a width, height, or percentage.")); return; }
    setError(""); setBusy(true);
    const img = imgRef.current || new Image();
    const run = () => {
      const canvas = document.createElement("canvas");
      canvas.width = dims.w; canvas.height = dims.h;
      canvas.getContext("2d").drawImage(img, 0, 0, dims.w, dims.h);
      const outType = orig.type === "image/jpeg" ? "image/jpeg" : "image/png";
      canvas.toBlob((blob) => {
        setBusy(false);
        if (!blob) { setError(t("Resize failed. Please try another image.")); return; }
        const url = URL.createObjectURL(blob);
        setResult({ url, w: dims.w, h: dims.h, size: Math.round(blob.size / 1024), type: outType });
      }, outType, outType === "image/jpeg" ? 0.92 : undefined);
    };
    if (img.complete && img.naturalWidth) run();
    else { img.onload = run; img.src = src; }
  };

  // Keep width/height in sync when ratio is locked (dims mode).
  const onWidth = (v) => {
    setWidth(v); setResult(null);
    if (ratio && orig && v) {
      const w = parseInt(v, 10);
      if (w > 0) setHeight(String(Math.round((w / orig.w) * orig.h)));
    }
  };
  const onHeight = (v) => {
    setHeight(v); setResult(null);
    if (ratio && orig && v) {
      const h = parseInt(v, 10);
      if (h > 0) setWidth(String(Math.round((h / orig.h) * orig.w)));
    }
  };

  const inputCls = "w-full rounded-[16px] border-[1.5px] border-[#FFE8A0] dark:border-[#4B3F8A] bg-[#FFFEF5] dark:bg-[#2D2A5A] text-[#1E1B4B] dark:text-[#FEF3C7] placeholder:text-gray-400 dark:placeholder:text-[#6B6B8A] text-base px-4 h-[52px] transition-all duration-200 focus:outline-none focus:border-[#F59E0B] focus:shadow-[0_0_0_4px_rgba(245,158,11,0.15)]";
  const labelCls = "block text-[13px] font-semibold text-[#8B4513] dark:text-[#FBBF24] mb-1 ml-1";

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="max-w-[480px] mx-auto w-full">
      {/* Upload */}
      <label className="block">
        <span className={labelCls}>{t("Upload Image")}</span>
        <div className="relative rounded-[16px] border-[1.5px] border-dashed border-[#FFE8A0] dark:border-[#4B3F8A] bg-[#FFFEF5] dark:bg-[#2D2A5A] hover:border-[#F59E0B] transition-colors cursor-pointer">
          <input type="file" accept="image/*" onChange={(e) => onFile(e.target.files?.[0])} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
          <div className="flex flex-col items-center justify-center gap-2 py-8 px-4 text-center">
            <span className="w-11 h-11 rounded-full bg-[#FEF3C7] flex items-center justify-center">
              <Upload className="w-5 h-5 text-[#F59E0B]" />
            </span>
            <span className="text-sm font-semibold text-[#1E1B4B] dark:text-[#FEF3C7]">{t("Tap to choose an image")}</span>
            {orig && <span className="text-xs text-muted-foreground">{t("Original")}: {orig.w}×{orig.h}px</span>}
          </div>
        </div>
      </label>

      {error && <div className="mt-3 text-sm text-destructive bg-destructive/5 border border-destructive/20 rounded-xl px-3 py-2">{error}</div>}

      {src && <div className="mt-5"><img src={src} alt="preview" className="max-h-56 mx-auto rounded-xl border border-[#FDE68A] dark:border-[#4B3F8A]" /></div>}

      {/* Mode toggle */}
      {src && (
        <>
          <div className="mt-5 grid grid-cols-2 gap-2 p-1 rounded-full bg-[#FFFEF5] dark:bg-[#2D2A5A] border border-[#FDE68A] dark:border-[#4B3F8A]">
            <button onClick={() => { setMode("dims"); setResult(null); }} className={`flex items-center justify-center gap-1.5 h-10 rounded-full text-sm font-semibold transition-colors ${mode === "dims" ? "text-white" : "text-[#7C4A03] dark:text-[#FBBF24]"}`} style={mode === "dims" ? { background: "linear-gradient(135deg, #6D28D9 0%, #8B5CF6 100%)" } : {}}>
              <Ruler className="w-4 h-4" /> {t("Dimensions")}
            </button>
            <button onClick={() => { setMode("scale"); setResult(null); }} className={`flex items-center justify-center gap-1.5 h-10 rounded-full text-sm font-semibold transition-colors ${mode === "scale" ? "text-white" : "text-[#7C4A03] dark:text-[#FBBF24]"}`} style={mode === "scale" ? { background: "linear-gradient(135deg, #6D28D9 0%, #8B5CF6 100%)" } : {}}>
              <Percent className="w-4 h-4" /> {t("Percentage")}
            </button>
          </div>

          {/* Inputs */}
          {mode === "dims" ? (
            <div className="mt-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>{t("Width (px)")}</label>
                  <input type="number" inputMode="decimal" value={width} onChange={(e) => onWidth(e.target.value)} placeholder="800" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>{t("Height (px)")}</label>
                  <input type="number" inputMode="decimal" value={height} onChange={(e) => onHeight(e.target.value)} placeholder="600" className={inputCls} />
                </div>
              </div>
              <button onClick={() => setRatio((r) => !r)} className="mt-3 flex items-center gap-2 text-sm font-semibold text-[#7C4A03] dark:text-[#FBBF24] ml-1">
                {ratio ? <Link2 className="w-4 h-4 text-[#F59E0B]" /> : <Unlink className="w-4 h-4 text-muted-foreground" />}
                <span className="relative inline-block w-10 h-5 rounded-full transition-colors" style={{ background: ratio ? "#F59E0B" : "hsl(var(--border))" }}>
                  <span className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all" style={{ left: ratio ? "1.25rem" : "0.125rem" }} />
                </span>
                {t("Maintain aspect ratio")}
              </button>
            </div>
          ) : (
            <div className="mt-4">
              <label className={labelCls}>{t("Scale (%)")}</label>
              <input type="number" inputMode="decimal" value={scale} onChange={(e) => { setScale(e.target.value); setResult(null); }} placeholder="50" className={inputCls} />
            </div>
          )}

          {/* Resize button */}
          <div className="mt-6 flex justify-center">
            <button type="button" onClick={resize} disabled={busy} className="relative overflow-hidden transition-transform duration-200 hover:-translate-y-0.5 active:translate-y-0 h-[52px] w-full max-w-[320px] rounded-full p-0.5 disabled:opacity-50 disabled:hover:translate-y-0" style={{ background: "linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)", boxShadow: "0 12px 24px -8px rgba(109,40,217,0.5)" }}>
              <span className="flex items-center justify-center gap-2 w-full h-full rounded-full text-white font-bold text-base" style={{ background: "linear-gradient(135deg, #6D28D9 0%, #8B5CF6 100%)" }}>
                <Scaling className="w-4 h-4" />
                <span>{busy ? t("Resizing...") : t("Resize Image")}</span>
              </span>
            </button>
          </div>
        </>
      )}

      {/* Result */}
      {result && (
        <div className="mt-6 bg-[#FFFBEB] dark:bg-[#2D2A5A] border-2 border-[#FDE68A] dark:border-[#4B3F8A] rounded-[18px] p-[18px] animate-[slideDown_0.3s_ease-out]" style={{ backgroundImage: "radial-gradient(circle, rgba(245,158,11,0.08) 1px, transparent 1px)", backgroundSize: "14px 14px" }}>
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-[#F59E0B]" />
            <span className="font-semibold uppercase tracking-widest text-[11px] text-[#92400E] dark:text-[#FBBF24]">{t("Resized Image")}</span>
          </div>
          <img src={result.url} alt="resized" className="max-h-64 mx-auto rounded-xl border border-[#FDE68A] dark:border-[#4B3F8A]" style={{ background: "repeating-conic-gradient(hsl(var(--muted)) 0 25%, transparent 0 50%) 50% / 16px 16px" }} />
          <div className="mt-3 text-sm text-[#1E1B4B] dark:text-[#FEF3C7] text-center">
            {result.w}×{result.h}px · <strong className="text-[#F59E0B]">{result.size} KB</strong> ({result.type === "image/jpeg" ? "JPEG" : "PNG"})
          </div>
          <a href={result.url} download={`resized.${result.type === "image/jpeg" ? "jpg" : "png"}`} className="inline-flex items-center justify-center gap-2 mt-4 w-full rounded-full bg-gradient-to-r from-[#6D28D9] to-[#8B5CF6] text-white font-semibold px-5 py-3 hover:opacity-90 transition-opacity">
            <ImageDown className="w-4 h-4" /> {t("Download")}
          </a>
          <p className="mt-3 text-xs text-muted-foreground text-center">{t("Resizing happens in your browser — your image is never uploaded and stays private.")}</p>
        </div>
      )}
    </div>
  );
}