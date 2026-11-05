import { useRef, useState } from "react";
import { Link2, Upload, Zap } from "lucide-react";
import { proLabels } from "./labels";

export default function ProSourceBar({ lang, onLoad }) {
  const L = proLabels(lang);
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  const fileRef = useRef(null);

  const submit = () => {
    const url = value.trim();
    if (!/^https?:\/\//i.test(url)) {
      setError(L.sourceInvalid);
      return;
    }
    setError("");
    onLoad(url);
  };

  return (
    <div className="space-y-2 border-t border-white/10 bg-[#111827] px-3 py-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-0 flex-1">
          <Link2 className="pointer-events-none absolute start-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/40" />
          <input
            dir="ltr"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") submit(); }}
            placeholder={L.sourcePlaceholder}
            spellCheck={false}
            className="w-full rounded-lg border border-white/15 bg-black/40 py-2 pe-3 ps-8 text-xs text-white placeholder:text-white/30 focus:border-[#F59E0B] focus:outline-none"
          />
        </div>
        <button
          type="button"
          onClick={submit}
          className="inline-flex items-center gap-1.5 rounded-lg bg-[#F59E0B] px-3 py-2 text-xs font-bold text-black hover:bg-[#FBBF24]"
        >
          <Zap className="h-3.5 w-3.5" />
          {L.sourceLoad}
        </button>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold text-white/85 hover:bg-white/10"
        >
          <Upload className="h-3.5 w-3.5" />
          {L.sourceFile}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="video/*,.mkv,.m3u8"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onLoad(URL.createObjectURL(file));
            e.target.value = "";
          }}
        />
      </div>
      <p className="text-[11px] text-white/40">{error || L.sourceHint}</p>
    </div>
  );
}