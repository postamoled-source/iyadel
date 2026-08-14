import { useEffect } from "react";
import { useLocation } from "react-router-dom";

// Scrolls to the element matching the URL hash (e.g. #tools) once the page
// has mounted, so the bottom-nav "Tools" item works as clean path navigation
// (a Link to /#tools) instead of an imperative window scroll handler.
export default function HashScroll() {
  const { hash, pathname } = useLocation();
  useEffect(() => {
    if (!hash) return;
    const id = hash.replace("#", "");
    const t = setTimeout(() => {
      const el = document.getElementById(id);
      if (el) {
        const y = el.getBoundingClientRect().top + window.scrollY - 64;
        window.scrollTo({ top: y, behavior: "smooth" });
      }
    }, 300);
    return () => clearTimeout(t);
  }, [hash, pathname]);
  return null;
}