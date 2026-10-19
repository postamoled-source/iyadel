import { useCallback, useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import {
  Play, Pause, RotateCcw, RotateCw,
  Volume1, Volume2, VolumeX, Maximize, Film, Loader2,
} from "lucide-react";

const RATIOS = [
  { key: "16-9", cls: "aspect-video", cover: false },
  { key: "21-9", cls: "aspect-[21/9]", cover: false },
  { key: "4-3", cls: "aspect-[4/3]", cover: false },
  { key: "cover", cls: "aspect-video", cover: true },
];

const LABELS = {
  ar: {
    play: "تشغيل / إيقاف", rewind: "إرجاع 10 ثوانٍ", forward: "تقديم 10 ثوانٍ",
    mute: "كتم الصوت", volume: "مستوى الصوت", fullscreen: "ملء الشاشة", ratio: "الأبعاد",
    r169: "16:9 الشاشة القياسية", r219: "21:9 العرض السينمائي", r43: "4:3 الكلاسيكي", cover: "ملء الإطار",
  },
  en: {
    play: "Play / Pause", rewind: "Back 10 seconds", forward: "Forward 10 seconds",
    mute: "Mute", volume: "Volume", fullscreen: "Fullscreen", ratio: "Aspect ratio",
    r169: "16:9 Standard", r219: "21:9 Ultrawide", r43: "4:3 Classic", cover: "Fill frame",
  },
};

function formatTime(seconds) {
  if (!isFinite(seconds) || seconds < 0) return "00:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m < 10 ? "0" : ""}${m}:${s < 10 ? "0" : ""}${s}`;
}

const BTN = "flex items-center justify-center text-white hover:text-accent transition-colors";

export default function CinemaPlayer({ src, poster, title, lang = "en" }) {
  const L = LABELS[lang === "ar" ? "ar" : "en"];
  const wrapRef = useRef(null);
  const videoRef = useRef(null);
  const idleRef = useRef(null);

  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffering, setBuffering] = useState(false);
  const [visible, setVisible] = useState(true);
  const [ratio, setRatio] = useState("16-9");

  const active = RATIOS.find((r) => r.key === ratio) || RATIOS[0];

  const poke = useCallback(() => {
    setVisible(true);
    clearTimeout(idleRef.current);
    const v = videoRef.current;
    if (v && !v.paused) idleRef.current = setTimeout(() => setVisible(false), 3000);
  }, []);

  const togglePlay = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) v.play().catch(() => {});
    else v.pause();
  }, []);

  const toggleFullscreen = useCallback(() => {
    const el = wrapRef.current;
    if (!el) return;
    if (document.fullscreenElement) document.exitFullscreen?.();
    else el.requestFullscreen?.().catch(() => {});
  }, []);

  const seek = (e) => {
    const v = videoRef.current;
    if (!v || !isFinite(v.duration) || !v.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    v.currentTime = pos * v.duration;
    poke();
  };

  // Load the source (native MP4/WebM, or HLS via hls.js)
  useEffect(() => {
    const v = videoRef.current;
    if (!v || !src) return;
    let hls;
    if (/\.m3u8(\?|$)/i.test(src) && Hls.isSupported()) {
      hls = new Hls();
      hls.loadSource(src);
      hls.attachMedia(v);
    } else {
      v.src = src;
    }
    return () => { if (hls) hls.destroy(); };
  }, [src]);

  // Media events
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onPlay = () => { setPlaying(true); poke(); };
    const onPause = () => { setPlaying(false); clearTimeout(idleRef.current); setVisible(true); };
    const onTime = () => { setCurrent(v.currentTime); if (isFinite(v.duration)) setDuration(v.duration); };
    const onMeta = () => setDuration(v.duration || 0);
    const onVolume = () => { setMuted(v.muted); setVolume(v.volume); };
    const onWaiting = () => setBuffering(true);
    const onReady = () => setBuffering(false);

    v.addEventListener("play", onPlay);
    v.addEventListener("pause", onPause);
    v.addEventListener("timeupdate", onTime);
    v.addEventListener("loadedmetadata", onMeta);
    v.addEventListener("volumechange", onVolume);
    v.addEventListener("waiting", onWaiting);
    v.addEventListener("playing", onReady);
    v.addEventListener("canplay", onReady);
    return () => {
      v.removeEventListener("play", onPlay);
      v.removeEventListener("pause", onPause);
      v.removeEventListener("timeupdate", onTime);
      v.removeEventListener("loadedmetadata", onMeta);
      v.removeEventListener("volumechange", onVolume);
      v.removeEventListener("waiting", onWaiting);
      v.removeEventListener("playing", onReady);
      v.removeEventListener("canplay", onReady);
    };
  }, [poke]);

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e) => {
      const tag = document.activeElement?.tagName;
      if (["INPUT", "SELECT", "TEXTAREA"].includes(tag)) return;
      const v = videoRef.current;
      if (!v) return;
      if (e.code === "Space") { e.preventDefault(); togglePlay(); }
      else if (e.code === "ArrowLeft") { v.currentTime = Math.max(0, v.currentTime - 5); poke(); }
      else if (e.code === "ArrowRight") {
        const t = v.currentTime + 5;
        v.currentTime = isFinite(v.duration) ? Math.min(v.duration, t) : t;
        poke();
      } else if (e.code === "KeyM") { v.muted = !v.muted; }
      else if (e.code === "KeyF") { toggleFullscreen(); }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [togglePlay, toggleFullscreen, poke]);

  useEffect(() => () => clearTimeout(idleRef.current), []);

  const progress = duration ? (current / duration) * 100 : 0;
  const VolIcon = muted || volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2;

  return (
    <div
      ref={wrapRef}
      onMouseMove={poke}
      onTouchStart={poke}
      className={`relative w-full bg-black rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.55)] ${active.cls}`}
    >
      <video
        ref={videoRef}
        poster={poster}
        preload="metadata"
        playsInline
        onClick={togglePlay}
        className={`w-full h-full bg-black ${active.cover ? "object-cover" : "object-contain"}`}
      />

      {buffering && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
        </div>
      )}

      <div
        className={`absolute top-4 right-4 z-10 flex items-center gap-2 max-w-[70%] text-sm font-bold text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] pointer-events-none transition-opacity duration-300 ${visible ? "opacity-100" : "opacity-0"}`}
      >
        <Film className="w-4 h-4 shrink-0 text-accent" />
        <span className="truncate">{title}</span>
      </div>

      <div
        onClick={(e) => { if (e.target === e.currentTarget) togglePlay(); }}
        className={`absolute inset-0 flex flex-col justify-end p-3 sm:p-5 bg-gradient-to-t from-black/90 via-black/20 to-transparent transition-opacity duration-300 ${visible ? "opacity-100" : "opacity-0 pointer-events-none"}`}
      >
        <div
          dir="ltr"
          onClick={seek}
          className="relative w-full h-[7px] hover:h-[10px] bg-white/20 rounded cursor-pointer mb-3 transition-[height]"
        >
          <div className="h-full bg-accent rounded" style={{ width: `${progress}%` }} />
        </div>

        <div className="flex items-center justify-between gap-2 sm:gap-4">
          <div className="flex items-center gap-2.5 sm:gap-4 min-w-0">
            <button onClick={togglePlay} title={L.play} className={BTN}>
              {playing ? <Pause className="w-[18px] h-[18px]" /> : <Play className="w-[18px] h-[18px]" />}
            </button>
            <button onClick={() => { const v = videoRef.current; if (v) v.currentTime = Math.max(0, v.currentTime - 10); poke(); }} title={L.rewind} className={BTN}>
              <RotateCcw className="w-[18px] h-[18px]" />
            </button>
            <button onClick={() => { const v = videoRef.current; if (v) { const t = v.currentTime + 10; v.currentTime = isFinite(v.duration) ? Math.min(v.duration, t) : t; } poke(); }} title={L.forward} className={BTN}>
              <RotateCw className="w-[18px] h-[18px]" />
            </button>

            <div className="flex items-center gap-2">
              <button onClick={() => { const v = videoRef.current; if (v) v.muted = !v.muted; }} title={L.mute} className={BTN}>
                <VolIcon className="w-[18px] h-[18px]" />
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={muted ? 0 : volume}
                onChange={(e) => {
                  const v = videoRef.current;
                  if (!v) return;
                  v.volume = parseFloat(e.target.value);
                  v.muted = v.volume === 0;
                }}
                title={L.volume}
                className="hidden sm:block w-[70px] h-1 accent-primary cursor-pointer"
              />
            </div>

            <div dir="ltr" className="text-[11px] sm:text-[13px] text-white/70 tabular-nums whitespace-nowrap">
              {formatTime(current)} / {formatTime(duration)}
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <select
              value={ratio}
              onChange={(e) => setRatio(e.target.value)}
              title={L.ratio}
              className="bg-black/70 border border-white/20 text-white text-[11px] sm:text-xs rounded-lg px-1.5 sm:px-2 py-1 outline-none cursor-pointer backdrop-blur"
            >
              <option value="16-9" title={L.r169} className="bg-black">16:9</option>
              <option value="21-9" title={L.r219} className="bg-black">21:9</option>
              <option value="4-3" title={L.r43} className="bg-black">4:3</option>
              <option value="cover" title={L.cover} className="bg-black">{lang === "ar" ? "ملء" : "Cover"}</option>
            </select>
            <button onClick={toggleFullscreen} title={L.fullscreen} className={BTN}>
              <Maximize className="w-[18px] h-[18px]" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}