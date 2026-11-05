import {
  Play, Pause, RotateCcw, RotateCw, VolumeX, Volume1, Volume2,
  Maximize, Minimize, PictureInPicture, ZoomIn, ZoomOut, Wand2, Expand, Shrink,
} from "lucide-react";
import ProProgress from "./ProProgress";
import { formatTime } from "./labels";

const BTN = "inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-white/90 transition-colors hover:bg-white/15 hover:text-white";
const GROUP = "inline-flex shrink-0 items-center gap-0.5 rounded-lg bg-white/10 p-0.5";
const SELECT = "h-7 rounded-lg border border-white/15 bg-black/60 px-1 text-[11px] font-semibold text-white/90 outline-none";

export default function ProControls({ L, player, view, subtitles = [], activeSub, setActiveSub }) {
  const {
    playing, muted, volume, current, duration, buffered, levels, level, selectLevel,
    speed, setSpeed, togglePlay, restart, skip, seek, toggleMute, setVolume, togglePip, pipSupported,
  } = player;

  const VolIcon = muted || volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2;
  const ratioBtn = (active) => `${BTN} px-1.5 text-[10px] font-bold ${active ? "bg-[#F59E0B] text-black hover:bg-[#F59E0B] hover:text-black" : ""}`;

  return (
    <div
      dir="ltr"
      className="absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black/95 via-black/70 to-transparent px-2 pb-2 pt-8 sm:px-4"
    >
      <ProProgress current={current} duration={duration} buffered={buffered} onSeek={seek} />

      <div className="mt-1.5 flex flex-wrap items-center gap-x-1 gap-y-1 sm:gap-x-1.5">
        <button type="button" className={BTN} onClick={togglePlay} title={L.play}>
          {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </button>
        <button type="button" className={BTN} onClick={restart} title={L.restart}>
          <RotateCcw className="h-4 w-4" />
        </button>
        <button type="button" className={`${BTN} hidden sm:inline-flex`} onClick={() => skip(-10)} title="-10s">
          <RotateCw className="h-4 w-4 -scale-x-100" />
        </button>
        <span className="px-1 text-[11px] tabular-nums text-white/75 sm:text-xs">
          {formatTime(current)} / {formatTime(duration)}
        </span>

        <div className="ms-auto flex flex-wrap items-center justify-end gap-x-1 gap-y-1 sm:gap-x-1.5">
          <button type="button" className={BTN} onClick={toggleMute} title={L.mute}>
            <VolIcon className="h-4 w-4" />
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={muted ? 0 : volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            title={L.volume}
            className="hidden h-1 w-16 cursor-pointer accent-[#F59E0B] md:block"
          />

          {subtitles.length > 0 && (
            <select
              value={activeSub}
              onChange={(e) => setActiveSub(e.target.value)}
              title={L.subtitles}
              className={SELECT}
            >
              <option value="">{L.subtitles}: {L.off}</option>
              {subtitles.map((s) => (
                <option key={s.label} value={s.lang} className="bg-[#111827] text-white">
                  {s.label}
                </option>
              ))}
            </select>
          )}

          <select value={speed} onChange={(e) => setSpeed(parseFloat(e.target.value))} title={L.speed} className={SELECT}>
            {[0.5, 0.75, 1, 1.25, 1.5, 2].map((v) => (
              <option key={v} value={v} className="bg-[#111827] text-white">{v}x</option>
            ))}
          </select>

          {levels.length > 1 && (
            <select value={level} onChange={(e) => selectLevel(e.target.value)} title={L.quality} className={SELECT}>
              <option value="auto">{L.quality}: {L.auto}</option>
              {levels.map((l) => (
                <option key={l.label} value={l.value} className="bg-[#111827] text-white">{l.label}</option>
              ))}
            </select>
          )}

          <div className={GROUP}>
            <button type="button" className={ratioBtn(view.fitAspect === "auto")} onClick={() => view.setFitAspect("auto")} title={L.fitAuto}>
              <Wand2 className="h-3.5 w-3.5" />
            </button>
            <button type="button" className={ratioBtn(view.fitAspect === "16:9")} onClick={() => view.setFitAspect("16:9")} title={L.fit169}>
              16:9
            </button>
            <button type="button" className={ratioBtn(view.fitAspect === "9:16")} onClick={() => view.setFitAspect("9:16")} title={L.fit916}>
              9:16
            </button>
            <button type="button" className={BTN} onClick={view.rotate} title={L.rotate}>
              <RotateCw className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className={`${GROUP} hidden md:inline-flex`}>
            <button type="button" className={BTN} onClick={() => view.setZoom(view.zoom - 0.25)} title={L.zoomOut}>
              <ZoomOut className="h-3.5 w-3.5" />
            </button>
            <button type="button" className={`${BTN} px-1 text-[10px] font-bold tabular-nums`} onClick={() => view.setZoom(1)}>
              {Math.round(view.zoom * 100)}%
            </button>
            <button type="button" className={BTN} onClick={() => view.setZoom(view.zoom + 0.25)} title={L.zoomIn}>
              <ZoomIn className="h-3.5 w-3.5" />
            </button>
          </div>

          <button
            type="button"
            className={`${BTN} hidden sm:inline-flex ${view.fill ? "bg-[#F59E0B]/20 text-[#F59E0B]" : ""}`}
            onClick={view.toggleStretch}
            title={view.fill ? L.stretchOff : L.stretchOn}
          >
            {view.fill ? <Shrink className="h-4 w-4" /> : <Expand className="h-4 w-4" />}
          </button>

          {pipSupported && (
            <button type="button" className={`${BTN} hidden sm:inline-flex`} onClick={togglePip} title={L.pip}>
              <PictureInPicture className="h-4 w-4" />
            </button>
          )}

          <button type="button" className={`${BTN} ${view.fullscreen ? "text-[#F59E0B]" : ""}`} onClick={view.toggleFullscreen} title={view.fullscreen ? L.exitFullscreen : L.fullscreen}>
            {view.fullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}