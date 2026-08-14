import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Square, Menu, Moon, Sun, Globe, User } from "lucide-react";
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
    <header className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? "bg-background/95 backdrop-blur-md border-b border-border shadow-sm" : "bg-transparent"}`}>
      <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
        
        {/* Left: Navigation (Hidden on mobile, matching visual intent while preserving user links) */}
        <nav className="hidden sm:flex items-center gap-6">
          <Link to="/" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Home</Link>
          <Link to="/Blog" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Blog</Link>
          <Link to="/About" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">About Us</Link>
        </nav>

        {/* Right: Tools (Matching Screenshot Top Right) */}
        <div className="hidden sm:flex items-center justify-end gap-3 ml-auto">
          <button onClick={() => setDark((d) => !d)}
            className="flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-xs font-medium text-card-foreground hover:bg-muted transition-all duration-300 hover:border-primary/50">
            {dark ? <Moon className="w-4 h-4 text-primary" /> : <Sun className="w-4 h-4 text-accent" />}
            Dark Mode
          </button>
          
          <div className="relative flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-xs font-medium text-card-foreground hover:border-primary/50 transition-all duration-300">
            <Globe className="w-4 h-4 text-muted-foreground" />
            <select value={lang} onChange={(e) => setLang(e.target.value)} className="bg-transparent focus:outline-none text-card-foreground cursor-pointer appearance-none pr-2">
              <option value="en" className="bg-card text-card-foreground">🇬🇧 English</option>
              <option value="ar" className="bg-card text-card-foreground">🇸🇦 العربية</option>
            </select>
          </div>

          <button className="flex items-center justify-center w-8 h-8 rounded-full bg-card border border-border text-muted-foreground hover:text-primary hover:border-primary/50 transition-all duration-300">
            <User className="w-4 h-4" />
          </button>
        </div>

        {/* Mobile Menu */}
        <div className="sm:hidden flex items-center justify-between w-full">
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <Square className="w-6 h-6 text-accent" />
            <span className="font-bold text-lg bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">TestPeak</span>
          </Link>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-foreground">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-card border-border">
              <nav className="flex flex-col gap-5 mt-10">
                <Link to="/" className="text-lg font-medium text-foreground hover:text-primary transition-colors">Home</Link>
                <Link to="/Blog" className="text-lg font-medium text-foreground hover:text-primary transition-colors">Blog</Link>
                <Link to="/About" className="text-lg font-medium text-foreground hover:text-primary transition-colors">About Us</Link>
                <div className="h-px bg-border my-2" />
                <button onClick={() => setDark((d) => !d)} className="flex items-center gap-2 text-foreground font-medium">
                  {dark ? <Moon className="w-5 h-5 text-primary" /> : <Sun className="w-5 h-5 text-accent" />} Dark Mode
                </button>
                <select value={lang} onChange={(e) => setLang(e.target.value)} className="rounded-xl border border-border bg-secondary px-4 py-3 text-foreground font-medium">
                  <option value="en">🇬🇧 English</option>
                  <option value="ar">🇸🇦 العربية</option>
                </select>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}