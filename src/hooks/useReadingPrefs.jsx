import { useState, useCallback } from "react";

export const READING_THEMES = {
  light: { bg: "#ffffff", text: "#1c1c1c", label: "Light" },
  sepia: { bg: "#f5ecd9", text: "#5b4636", label: "Sepia" },
  dark: { bg: "#1e1e22", text: "#d4d4d4", label: "Dark" },
};

export const FONT_SIZES = [15, 16, 17, 18, 19, 20, 22, 24];

export function useReadingPrefs() {
  const [fontIndex, setFontIndex] = useState(() => {
    try {
      const v = parseInt(localStorage.getItem("tp_read_font"), 10);
      if (!isNaN(v) && v >= 0 && v < FONT_SIZES.length) return v;
    } catch {}
    return 3;
  });
  const [theme, setTheme] = useState(() => {
    try {
      const v = localStorage.getItem("tp_read_theme");
      if (v && READING_THEMES[v]) return v;
    } catch {}
    return "light";
  });

  const changeFont = useCallback((dir) => {
    setFontIndex((prev) => {
      const next = Math.min(Math.max(prev + dir, 0), FONT_SIZES.length - 1);
      try { localStorage.setItem("tp_read_font", String(next)); } catch {}
      return next;
    });
  }, []);

  const changeTheme = useCallback((th) => {
    setTheme(th);
    try { localStorage.setItem("tp_read_theme", th); } catch {}
  }, []);

  return { fontSize: FONT_SIZES[fontIndex], fontIndex, changeFont, theme, changeTheme };
}