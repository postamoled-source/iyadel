import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Sparkles, Menu, Moon, Sun, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export default function Header() {
  const [dark, setDark] = useState(true);
  const [lang, setLang] = useState("en");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? "bg-background/95 backdrop-blur-md border-b border-border" : "bg-background border-b border-border/50"}`}>
      <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-md shadow-primary/30">
            <Sparkles className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-bold text-xl bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">TestPeak</span>
        </Link>

        <nav className="hidden sm:flex items-center gap-6">
          <Link to="/" className="text-sm font-medium text-foreground hover:text-primary transition-colors">Home</Link>
          <Link to="/Blog" className="text-sm font-medium text-foreground hover:text-primary transition-colors">Blog</Link>
          <Link to="/About" className="text-sm font-medium text-foreground hover:text-primary transition-colors">About Us</Link>
        </nav>

        <div className="hidden sm:flex items-center gap-3">
          <button onClick={() => setDark((d) => !d)}
            className="flex items-center gap-2 rounded-full border border-border bg-secondary px-3 py-1.5 text-xs text-secondary-foreground hover:bg-muted transition">
            {dark ? <Moon className="w-3.5 h-3.5 text-accent" /> : <Sun className="w-3.5 h-3.5 text-accent" />}
            Dark Mode
          </button>
          <div className="relative flex items-center gap-1.5 rounded-full border border-border bg-secondary px-3 py-1.5 text-xs text-secondary-foreground">
            <Globe className="w-3.5 h-3.5 text-primary" />
            <select value={lang} onChange={(e) => setLang(e.target.value)} className="bg-transparent focus:outline-none text-secondary-foreground">
              <option value="ar" className="bg-secondary text-secondary-foreground">🇸🇦 العربية</option>
              <option value="en" className="bg-secondary text-secondary-foreground">🇬🇧 English</option>
            </select>
          </div>
        </div>

        <Sheet>
          <SheetTrigger asChild className="sm:hidden">
            <Button variant="ghost" size="icon" className="text-foreground">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="bg-card border-border">
            <nav className="flex flex-col gap-5 mt-10">
              <Link to="/" className="text-lg font-medium text-foreground hover:text-primary transition-colors">Home</Link>
              <Link to="/Blog" className="text-lg font-medium text-foreground hover:text-primary transition-colors">Blog</Link>
              <Link to="/About" className="text-lg font-medium text-foreground hover:text-primary transition-colors">About Us</Link>
              <div className="h-px bg-border my-2" />
              <button onClick={() => setDark((d) => !d)} className="flex items-center gap-2 text-foreground">
                {dark ? <Moon className="w-4 h-4 text-accent" /> : <Sun className="w-4 h-4 text-accent" />} Dark Mode
              </button>
              <select value={lang} onChange={(e) => setLang(e.target.value)} className="rounded-lg border border-border bg-secondary px-3 py-2 text-foreground">
                <option value="ar">🇸🇦 العربية</option>
                <option value="en">🇬🇧 English</option>
              </select>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}