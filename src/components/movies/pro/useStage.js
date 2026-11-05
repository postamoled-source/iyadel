import { useEffect, useLayoutEffect, useRef, useState } from "react";

// Fits `ratio` inside the box, then shrinks so a rotated picture still fits.
export function stageBox(boxW, boxH, ratio, rotation) {
  if (!boxW || !boxH || !ratio) return null;
  let width = boxW;
  let height = boxW / ratio;
  if (height > boxH) {
    height = boxH;
    width = boxH * ratio;
  }
  const rotated = rotation % 180 === 90;
  const boundsW = rotated ? height : width;
  const boundsH = rotated ? width : height;
  const scale = Math.min(boxW / boundsW, boxH / boundsH, 1);
  return { width: width * scale, height: height * scale };
}

// Measures the player area so the video can be sized to any screen.
export default function useStage({ ratio, rotation }) {
  const ref = useRef(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => setSize({ width: el.clientWidth, height: el.clientHeight });
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const onWindowChange = () => {
      const el = ref.current;
      if (el) setSize({ width: el.clientWidth, height: el.clientHeight });
    };
    window.addEventListener("orientationchange", onWindowChange);
    return () => window.removeEventListener("orientationchange", onWindowChange);
  }, []);

  return { ref, box: stageBox(size.width, size.height, ratio, rotation) };
}