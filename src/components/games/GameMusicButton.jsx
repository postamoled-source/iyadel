import { useState, useEffect } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { startMusic, stopMusic, isPlaying, resumeMusicAudio } from "@/lib/game-music";

// Shared music toggle for every game. Pass the game's theme key.
// Music auto-stops when the game unmounts so two themes never overlap.
export default function GameMusicButton({ theme, className = "" }) {
  const { t } = useI18n();
  const [on, setOn] = useState(false);

  useEffect(() => {
    return () => { if (isPlaying(theme)) stopMusic(); };
  }, [theme]);

  const toggle = () => {
    resumeMusicAudio();
    if (isPlaying(theme)) { stopMusic(); setOn(false); }
    else { startMusic(theme); setOn(true); }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={t("Music")}
      title={t("Music")}
      className={`shrink-0 h-9 w-9 rounded-2xl flex items-center justify-center border transition-colors ${
        on
          ? "bg-primary/15 border-primary/40 text-primary"
          : "bg-card border-border text-muted-foreground hover:text-foreground"
      } ${className}`}
    >
      {on ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
    </button>
  );
}