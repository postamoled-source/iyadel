import { useState } from "react";
import { Film } from "lucide-react";
import ProPlayer from "./pro/ProPlayer";
import ProSourceBar from "./pro/ProSourceBar";
import { proLabels } from "./pro/labels";

export default function ProServerPane({ title, lang }) {
  const L = proLabels(lang);
  const [src, setSrc] = useState("");

  return (
    <div className="bg-black">
      {src ? (
        <ProPlayer key={src} src={src} title={title} lang={lang} />
      ) : (
        <div className="flex aspect-video flex-col items-center justify-center gap-2 bg-black px-6 text-center">
          <Film className="h-7 w-7 text-white/35" />
          <p className="text-sm font-semibold text-white/80">{L.proTitle}</p>
          <p className="max-w-sm text-xs leading-relaxed text-white/50">{L.proHint}</p>
        </div>
      )}
      <ProSourceBar lang={lang} onLoad={setSrc} />
    </div>
  );
}