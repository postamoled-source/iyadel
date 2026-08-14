import { useState, useEffect, useCallback } from "react";

const KEY = "tp_favorites";

function read() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function write(list) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch {}
}

export function useFavorites() {
  const [favorites, setFavorites] = useState(read);

  useEffect(() => {
    const onStorage = (e) => { if (e.key === KEY) setFavorites(read()); };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const toggleFavorite = useCallback((slug) => {
    setFavorites((prev) => {
      const next = prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug];
      write(next);
      return next;
    });
  }, []);

  const isFavorite = useCallback((slug) => favorites.includes(slug), [favorites]);
  const clearFavorites = useCallback(() => { write([]); setFavorites([]); }, []);

  return { favorites, toggleFavorite, isFavorite, clearFavorites };
}