import { useEffect } from "react";
import { X } from "lucide-react";

function toEmbed(url) {
  const yt = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}?autoplay=1&rel=0`;
  const vm = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vm) return `https://player.vimeo.com/video/${vm[1]}?autoplay=1`;
  return url;
}

export default function TrailerModal({ url, title, lang, onClose }) {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-3 backdrop-blur-sm"
      onClick={onClose}
    >
      <div className="w-full max-w-3xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-2 flex items-center justify-between gap-3">
          <p className="line-clamp-1 text-sm font-semibold text-white/90">{title}</p>
          <button
            onClick={onClose}
            aria-label={lang === "ar" ? "إغلاق" : "Close"}
            className="rounded-lg bg-white/10 p-1.5 text-white transition-colors hover:bg-white/20"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="aspect-video w-full overflow-hidden rounded-xl bg-black">
          <iframe
            src={toEmbed(url)}
            title={title}
            allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
            allowFullScreen
            className="h-full w-full border-0"
          />
        </div>
      </div>
    </div>
  );
}