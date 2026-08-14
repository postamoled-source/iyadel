import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "next-themes";
import { useI18n } from "@/lib/i18n";
import { Moon, Sun, Globe } from "lucide-react";
import { LOGO_URL } from "@/data/tools";
import MobileSelect from "./MobileSelect";
import ProfileSheet from "./ProfileSheet";

const LANG_OPTIONS = [
  { value: "en", label: "🇬🇧 English" },
  { value: "ar", label: "🇸🇦 العربية" },
];

export default function Header() {
  const { theme, setTheme } = useTheme();
  const { lang, setLang, t } = useI18n();
  const [scrolled, setScrolled] = useState(false);
  const isDark = (theme ?? "dark") === "dark";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const toggleTheme = () => setTheme(isDark ? "light" : "dark");

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 select-none ${
        scrolled
          ? "bg-background/95 backdrop-blur-md border-b border-border shadow-sm"
          : "bg-transparent"
      }`}
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
        {/* Left: Navigation (desktop) */}
        <nav className="hidden sm:flex items-center gap-6 select-none">
          <Link to="/" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">{t("Home")}</Link>
          <Link to="/Blog" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">{t("Blog")}</Link>
          <Link to="/About" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">{t("About Us")}</Link>
        </nav>

        {/* Right: Tools (desktop) */}
        <div className="hidden sm:flex items-center justify-end gap-3 ml-auto">
          <button
            onClick={toggleTheme}
            className="flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-xs font-medium text-card-foreground hover:bg-muted transition-all duration-300 hover:border-primary/50 select-none"
          >
            {isDark ? <Moon className="w-4 h-4 text-primary" /> : <Sun className="w-4 h-4 text-accent" />}
            {isDark ? t("Dark Mode") : t("Light Mode")}
          </button>

          <MobileSelect
            value={lang}
            onChange={(v) => setLang(v)}
            options={LANG_OPTIONS}
            placeholder="🇬🇧 English"
            leading={<Globe className="w-4 h-4 text-muted-foreground" />}
            triggerClassName="flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 h-auto w-auto min-w-0 text-xs font-medium text-card-foreground shadow-none focus:ring-0 hover:border-primary/50 transition-all duration-300"
          />

          <ProfileSheet />
        </div>

        {/* Mobile */}
        <div className="sm:hidden flex items-center justify-between w-full">
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <img src={LOGO_URL} alt="TestPeak" className="w-8 h-8 rounded-lg object-cover" />
            <span className="font-bold text-lg bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">TestPeak</span>
          </Link>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="flex items-center justify-center w-9 h-9 rounded-full bg-card border border-border text-muted-foreground hover:text-primary hover:border-primary/50 transition-all duration-300 select-none"
              aria-label={t("Toggle theme")}
            >
              {isDark ? <Moon className="w-4 h-4 text-primary" /> : <Sun className="w-4 h-4 text-accent" />}
            </button>
            <MobileSelect
              value={lang}
              onChange={(v) => setLang(v)}
              options={LANG_OPTIONS}
              placeholder="🇬🇧 English"
              showLabel={false}
              leading={<Globe className="w-4 h-4 text-muted-foreground" />}
              triggerClassName="flex items-center justify-center w-9 h-9 rounded-full bg-card border border-border text-muted-foreground hover:text-primary hover:border-primary/50 transition-all duration-300 shadow-none focus:ring-0"
            />
            <ProfileSheet />
          </div>
        </div>
      </div>
    </header>
  );
}