import { Minus, Plus, Type, Sun, Moon, BookOpen } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { READING_THEMES, FONT_SIZES } from "@/hooks/useReadingPrefs";

export default function ReadingControls({ fontSize, fontIndex, changeFont, theme, changeTheme }) {
  const { t } = useI18n();
  const themeKeys = Object.keys(READING_THEMES);
  const themeIcons = { light: <Sun className="w-4 h-4" />, sepia: <BookOpen className="w-4 h-4" />, dark: <Moon className="w-4 h-4" /> };

  return (
    <div className="sticky top-2 z-30 mx-auto max-w-3xl mb-6">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card/90 backdrop-blur px-4 py-2.5 shadow-lg">
        <div className="flex items-center gap-2">
          <Type className="w-4 h-4 text-primary shrink-0" />
          <span className="text-xs font-semibold text-muted-foreground hidden sm:inline">{t("Font Size")}</span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => changeFont(-1)}
              disabled={fontIndex === 0}
              aria-label={t("Decrease font")}
              className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-foreground hover:bg-secondary disabled:opacity-40 transition-colors"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-8 text-center text-xs font-bold text-foreground">{fontSize}px</span>
            <button
              onClick={() => changeFont(1)}
              disabled={fontIndex === FONT_SIZES.length - 1}
              aria-label={t("Increase font")}
              className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-foreground hover:bg-secondary disabled:opacity-40 transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-muted-foreground hidden sm:inline">{t("Background")}</span>
          <div className="flex items-center gap-1.5">
            {themeKeys.map((key) => (
              <button
                key={key}
                onClick={() => changeTheme(key)}
                aria-label={t(READING_THEMES[key].label)}
                title={t(READING_THEMES[key].label)}
                className={`relative w-8 h-8 rounded-lg border flex items-center justify-center transition-all ${theme === key ? "border-primary ring-2 ring-primary/30 scale-105" : "border-border hover:border-primary/40"}`}
                style={{ background: READING_THEMES[key].bg, color: READING_THEMES[key].text }}
              >
                {themeIcons[key]}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}