import { useCallback, useEffect, useRef, useState } from "react";
import { formatTime } from "./labels";

export default function ProProgress({ current, duration, buffered, onSeek }) {
  const barRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [hover, setHover] = useState(null);

  const ratioAt = useCallback((clientX) => {
    const rect = barRef.current?.getBoundingClientRect();
    if (!rect || !rect.width) return 0;
    return Math.min(Math.max((clientX - rect.left) / rect.width, 0), 1);
  }, []);

  useEffect(() => {
    if (!dragging) return;
    const move = (e) => onSeek(ratioAt(e.clientX));
    const stop = () => setDragging(false);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", stop);
    window.addEventListener("pointercancel", stop);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", stop);
      window.removeEventListener("pointercancel", stop);
    };
  }, [dragging, onSeek, ratioAt]);

  const played = duration ? (current / duration) * 100 : 0;

  return (
    <div
      ref={barRef}
      dir="ltr"
      onPointerDown={(e) => {
        setDragging(true);
        onSeek(ratioAt(e.clientX));
      }}
      onPointerMove={(e) => setHover(ratioAt(e.clientX))}
      onPointerLeave={() => setHover(null)}
      className="group relative h-1.5 w-full cursor-pointer rounded-full bg-white/25 transition-[height] hover:h-2.5"
      style={{ touchAction: "none" }}
    >
      <div className="absolute inset-y-0 left-0 rounded-full bg-white/35" style={{ width: `${buffered}%` }} />
      <div className="absolute inset-y-0 left-0 rounded-full bg-[#F59E0B]" style={{ width: `${played}%` }} />
      {hover !== null && duration > 0 && (
        <span
          className="pointer-events-none absolute bottom-4 -translate-x-1/2 whitespace-nowrap rounded bg-black/90 px-1.5 py-0.5 text-[11px] tabular-nums text-white"
          style={{ left: `${hover * 100}%` }}
        >
          {formatTime(hover * duration)}
        </span>
      )}
    </div>
  );
}