import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2, AlertTriangle, Film } from "lucide-react";
import useProPlayer from "./useProPlayer";
import useStage from "./useStage";
import ProControls from "./ProControls";
import { proLabels } from "./labels";

const MIN_ZOOM = 0.5;
const MAX_ZOOM = 3;
const IDLE_HIDE_MS = 3200;

export default function ProPlayer({ src, poster, title, lang = "ar", autoPlay = false, subtitles = [] }) {
  const L = proLabels(lang);
  const player = useProPlayer({ src, autoPlay });

  const [fitAspect, setFitAspect] = useState("auto"); // auto | 16:9 | 9:16
  const [zoom, setZoomState] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [fill, setFill] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [visible, setVisible] = useState(true);
  const [tick, setTick] = useState(0);
  const [hint, setHint] = useState("");
  const [activeSub, setActiveSub] = useState("");

  const shellRef = useRef(null);
  const hintTimer = useRef(null);

  const ratio = fitAspect === "auto" ? player.videoAspect : fitAspect === "16:9" ? 16 / 9 : 9 / 16;
  const { ref: areaRef, box } = useStage({ ratio, rotation });

  const setZoom = useCallback((value) => {
    setZoomState(Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, Math.round(value * 20) / 20)));
  }, []);

  const flash = useCallback((text) => {
    setHint(text);
    clearTimeout(hintTimer.current);
    hintTimer.current = setTimeout(() => setHint(""), 1800);
  }, []);

  const poke = useCallback(() => {
    setVisible(true);
    setTick((t) => t + 1);
  }, []);

  useEffect(() => {
    if (!player.playing) {
      setVisible(true);
      return undefined;
    }
    const timer = setTimeout(() => setVisible(false), IDLE_HIDE_MS);
    return () => clearTimeout(timer);
  }, [player.playing, tick]);

  useEffect(() => () => clearTimeout(hintTimer.current), []);

  // Keep the caption track in sync with the chosen language.
  useEffect(() => {
    const video = player.videoRef.current;
    if (!video) return;
    Array.from(video.textTracks || []).forEach((track) => {
      track.mode = track.language === activeSub ? "showing" : "disabled";
    });
  }, [activeSub, player.videoRef, subtitles]);

  const toggleFullscreen = useCallback(() => {
    const el = shellRef.current;
    if (fullscreen) {
      setFullscreen(false);
      if (document.fullscreenElement) document.exitFullscreen?.().catch(() => {});
      return;
    }
    setFullscreen(true);
    try {
      const request = el?.requestFullscreen?.();
      if (request && request.catch) request.catch(() => {});
    } catch (e) { /* iOS keeps the full-screen overlay */ }
  }, [fullscreen]);

  useEffect(() => {
    const onChange = () => {
      if (!document.fullscreenElement) setFullscreen(false);
    };
    document.addEventListener("fullscreenchange", onChange);
    document.addEventListener("webkitfullscreenchange", onChange);
    return () => {
      document.removeEventListener("fullscreenchange", onChange);
      document.removeEventListener("webkitfullscreenchange", onChange);
    };
  }, []);

  useEffect(() => {
    if (!fullscreen) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previous; };
  }, [fullscreen]);

  const view = {
    fitAspect,
    setFitAspect: (next) => { setFitAspect(next); setZoomState(1); setRotation(0); flash(next === "auto" ? L.fitAuto : next); },
    zoom,
    setZoom,
    rotate: () => { setRotation((r) => (r + 90) % 360); flash(`${L.rotate} ${(rotation + 90) % 360}°`); },
    fill,
    toggleStretch: () => { setFill((f) => !f); flash(fill ? L.stretchOff : L.stretchOn); },
    fullscreen,
    toggleFullscreen,
  };

  const playerRef = useRef(player);
  playerRef.current = player;

  useEffect(() => {
    const onKey = (e) => {
      const tag = (e.target.tagName || "").toLowerCase();
      if (tag === "input" || tag === "select" || tag === "textarea") return;
      const p = playerRef.current;
      switch (e.key.toLowerCase()) {
        case " ":
        case "k":
          e.preventDefault();
          p.togglePlay();
          break;
        case "arrowright":
          e.preventDefault();
          p.skip(5);
          break;
        case "arrowleft":
          e.preventDefault();
          p.skip(-5);
          break;
        case "arrowup":
          e.preventDefault();
          p.setVolume(p.volume + 0.1);
          break;
        case "arrowdown":
          e.preventDefault();
          p.setVolume(p.volume - 0.1);
          break;
        case "m":
          p.toggleMute();
          break;
        case "f":
          toggleFullscreen();
          break;
        case "a":
          setFitAspect("auto");
          break;
        case "w":
          setFitAspect("16:9");
          break;
        case "n":
          setFitAspect("9:16");
          break;
        case "r":
          setRotation((r) => (r + 90) % 360);
          break;
        case "s":
          setFill((f) => !f);
          break;
        case "+":
        case "=":
          setZoom(zoom + 0.25);
          break;
        case "-":
          setZoom(zoom - 0.25);
          break;
        case "0":
          setZoom(1);
          break;
        default:
          return;
      }
      poke();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [zoom, toggleFullscreen, setZoom, poke]);

  const shellClass = fullscreen
    ? "fixed inset-0 z-[9999] bg-black"
    : `relative mx-auto w-full overflow-hidden rounded-2xl bg-black shadow-[0_18px_45px_rgba(0,0,0,0.45)] ${ratio < 1 ? "max-w-full" : ""}`;

  const shellStyle = fullscreen
    ? undefined
    : ratio < 1
      ? { aspectRatio: ratio, maxHeight: "86vh", maxWidth: `calc(86vh * ${ratio})` }
      : { aspectRatio: ratio, maxHeight: "86vh" };

  const failed = player.phase === "error" || player.phase === "unsupported";

  return (
    <div
      ref={shellRef}
      className={shellClass}
      style={shellStyle}
      onMouseMove={poke}
      onTouchStart={poke}
      onMouseLeave={() => { if (player.playing) setVisible(false); }}
    >
      <div ref={areaRef} className="absolute inset-0">
        <div
          className="absolute left-1/2 top-1/2"
          style={{
            width: box ? box.width : "100%",
            height: box ? box.height : "100%",
            transform: `translate(-50%, -50%) rotate(${rotation}deg) scale(${zoom})`,
          }}
        >
          <video
            ref={player.videoRef}
            poster={poster}
            preload="metadata"
            playsInline
            onClick={player.togglePlay}
            className="h-full w-full bg-black"
            style={{ objectFit: fill ? "fill" : "contain" }}
          >
            {subtitles.map((s) => (
              <track key={s.label} kind="subtitles" src={s.url} srcLang={s.lang} label={s.label} />
            ))}
          </video>
        </div>
      </div>

      {title && (
        <div className={`pointer-events-none absolute inset-x-3 top-3 z-10 flex items-center gap-2 text-xs font-bold text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] transition-opacity duration-300 ${visible ? "opacity-100" : "opacity-0"}`}>
          <Film className="h-3.5 w-3.5 shrink-0 text-[#F59E0B]" />
          <span className="truncate">{title}</span>
        </div>
      )}

      {!failed && player.phase !== "ready" && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-black/80">
          <Loader2 className="h-7 w-7 animate-spin text-[#F59E0B]" />
          <p className="text-xs text-white/70">{L.loading}</p>
        </div>
      )}

      {failed && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-black/90 px-6 text-center">
          <AlertTriangle className="h-7 w-7 text-[#F59E0B]" />
          <p className="max-w-sm text-xs leading-relaxed text-white/70">
            {player.phase === "unsupported" ? L.unsupported : L.failed}
          </p>
        </div>
      )}

      {hint && (
        <div className="pointer-events-none absolute bottom-20 left-1/2 z-30 -translate-x-1/2 rounded-lg bg-black/85 px-3 py-1.5 text-[11px] font-semibold text-white">
          {hint}
        </div>
      )}

      <div className={`transition-opacity duration-300 ${visible || !player.playing ? "opacity-100" : "pointer-events-none opacity-0"}`}>
        <ProControls
          L={L}
          player={player}
          view={view}
          subtitles={subtitles}
          activeSub={activeSub}
          setActiveSub={setActiveSub}
        />
      </div>
    </div>
  );
}