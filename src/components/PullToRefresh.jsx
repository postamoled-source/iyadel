import { useState, useRef, useEffect } from "react";
import { RefreshCw } from "lucide-react";

const THRESHOLD = 70;
const MAX_PULL = 120;

// Basic pull-to-refresh: listens for a downward drag at the top of the page
// and triggers `onRefresh`. The spinner is rendered as a fixed overlay so it
// stays visible at the viewport top regardless of where this component sits.
export default function PullToRefresh({ onRefresh, children }) {
  const [pull, setPull] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [dragging, setDragging] = useState(false);
  const startY = useRef(null);
  const pullRef = useRef(0);
  const refreshingRef = useRef(false);
  const onRefreshRef = useRef(onRefresh);
  onRefreshRef.current = onRefresh;

  useEffect(() => {
    const onStart = (e) => {
      if (refreshingRef.current) return;
      if (window.scrollY > 0) { startY.current = null; return; }
      startY.current = e.touches[0].clientY;
      setDragging(true);
    };
    const onMove = (e) => {
      if (startY.current == null || refreshingRef.current) return;
      const dy = e.touches[0].clientY - startY.current;
      if (dy > 0 && window.scrollY <= 0) {
        const next = Math.min(dy * 0.5, MAX_PULL);
        pullRef.current = next;
        setPull(next);
        if (e.cancelable) e.preventDefault();
      } else if (pullRef.current > 0) {
        pullRef.current = 0;
        setPull(0);
      }
    };
    const onEnd = async () => {
      if (startY.current == null) { setDragging(false); return; }
      if (pullRef.current >= THRESHOLD && !refreshingRef.current) {
        refreshingRef.current = true;
        setRefreshing(true);
        setPull(THRESHOLD);
        pullRef.current = THRESHOLD;
        try { await onRefreshRef.current?.(); } finally {
          refreshingRef.current = false;
          setRefreshing(false);
          setPull(0);
          pullRef.current = 0;
        }
      } else {
        setPull(0);
        pullRef.current = 0;
      }
      startY.current = null;
      setDragging(false);
    };
    window.addEventListener("touchstart", onStart, { passive: true });
    window.addEventListener("touchmove", onMove, { passive: false });
    window.addEventListener("touchend", onEnd, { passive: true });
    return () => {
      window.removeEventListener("touchstart", onStart);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onEnd);
    };
  }, []);

  const pct = Math.min(pull / THRESHOLD, 1);

  return (
    <>
      <div
        className="fixed top-0 left-0 right-0 flex items-center justify-center overflow-hidden pointer-events-none z-[60]"
        style={{ height: pull, transition: dragging ? "none" : "height 250ms ease" }}
      >
        <RefreshCw
          className={`text-primary transition-opacity ${refreshing ? "animate-spin" : ""}`}
          style={{ width: 22, height: 22, opacity: refreshing ? 1 : pct, transform: refreshing ? "none" : `rotate(${pull * 3}deg)` }}
        />
      </div>
      {children}
    </>
  );
}