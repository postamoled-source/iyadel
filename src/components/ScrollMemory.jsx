import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

// Remembers the scroll position of each tab/route and restores it when the
// user returns, so switching tabs preserves their place in the list.
const store = new Map();
const RESTORE_DELAY = 260; // matches the AnimatedOutlet transition (~220ms) + buffer

export default function ScrollMemory() {
  const { pathname } = useLocation();
  const prevPath = useRef(pathname);

  useEffect(() => {
    // Save where we were on the page we are leaving.
    store.set(prevPath.current, window.scrollY);
    const target = store.get(pathname) ?? 0;
    prevPath.current = pathname;
    // Restore after the new page has mounted (post exit animation).
    const t = setTimeout(() => window.scrollTo(0, target), RESTORE_DELAY);
    return () => clearTimeout(t);
  }, [pathname]);

  return null;
}