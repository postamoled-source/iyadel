import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { useI18n } from "@/lib/i18n";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import PullToRefresh from "@/components/PullToRefresh";
import { useIsMobile } from "@/hooks/use-mobile";
import { createPortal } from "react-dom";
import { Image as Img } from "@/components/ui/image";
import Logo from "@/components/Logo";
import GameIcon from "@/components/game-icons";
import ToolCalculator from "@/components/tools/ToolCalculator";
import LanguageSection from "@/components/LanguageSection";
import DomainInspector from "@/components/tools/DomainInspector";
import PrivacyTeaser from "@/components/PrivacyTeaser";
import { CATEGORIES, STATIC_TOOLS, LOGO_URL } from "@/data/tools";
import { Calculator, TrendingUp, LineChart as LineChartIcon, Activity, Flame, DollarSign, Ruler, Weight, Square, Clock, Gauge, Wifi, QrCode, Link2, ShieldCheck, FunctionSquare, Percent, Atom, FlaskConical, HelpCircle, Puzzle, Shuffle, Crop, Eraser, FileImage, ImageDown, ArrowLeft, ArrowLeftRight, ChevronRight, ShieldQuestion, Coins, Layers, Zap, Box, Gift, Smartphone, Ticket, Search, X, Star, Wand2, Palette, Hammer, Crosshair, Swords, Spline, Instagram, Facebook, Image as ImageIcon, Pencil, Maximize2, FileDown, Youtube, Globe } from "lucide-react";
import { useFavorites } from "@/hooks/useFavorites";
import { trackEvent, useSeo } from "@/lib/analytics";

const ToolEntity = base44.entities.Tool;
const BlogPostEntity = base44.entities.BlogPost;

const ICONS = {
  Calculator, TrendingUp, LineChart: LineChartIcon, Activity, Flame, DollarSign, Ruler, Weight,
  Square, Clock, Gauge, Wifi, QrCode, Link2, ShieldCheck, FunctionSquare, Percent, Atom, FlaskConical,
  HelpCircle, Puzzle, Shuffle, Crop, Eraser, FileImage, ImageDown, Ticket, Wand2, Palette, Hammer, Crosshair, Swords, Spline, Maximize2, Youtube
};

function ImageEditIcon() {
  return (
    <span className="relative inline-flex items-center justify-center w-[22px] h-[22px]">
      <ImageIcon className="w-[22px] h-[22px] text-white" strokeWidth={2} />
      <span className="absolute -right-1.5 -bottom-1.5 w-4 h-4 rounded-full bg-white flex items-center justify-center shadow">
        <Pencil className="w-2 h-2 text-[#6D28D9]" strokeWidth={2.5} />
      </span>
    </span>);

}

const CATEGORY_CARDS = [
{ label: "Finance", cat: "Finance", Icon: DollarSign },
{ label: "Health", cat: "Health", Icon: Activity },
{ label: "Converters", cat: "Converters", Icon: ArrowLeftRight },
{ label: "Math", cat: "Math", Icon: Calculator },
{ label: "Brain Games", cat: "Games", Icon: Puzzle },
{ label: "Image Tools", cat: "Image Tools", Icon: ImageEditIcon },
{ label: "PDF Tools", cat: "PDF Tools", Icon: FileDown, route: "/pdf-tools" },
{ label: "All Tools", cat: "All", Icon: Box },
{ label: "Domain Inspector", cat: "Network", Icon: Globe, scrollTo: "domain-inspector", wide: true }];




const STATIC_BLOG = [
{ title: "5 Smart Ways to Pay Off Your Loan Faster", excerpt: "Small changes to your repayment strategy can save you thousands in interest.", category: "Finance", date: "Aug 10, 2026", image_url: "https://media.base44.com/images/public/6a7e76e3396b41955b675542/58374ccbe_generated_5e9014e0.png" },
{ title: "Understanding BMI: What the Numbers Really Mean", excerpt: "Body Mass Index is a starting point, not the full picture.", category: "Health", date: "Aug 5, 2026", image_url: "https://media.base44.com/images/public/6a7e76e3396b41955b675542/091f98734_generated_92bd36b3.png" },
{ title: "Compound Interest: The Eighth Wonder of the World", excerpt: "See how compounding accelerates your savings over time.", category: "Finance", date: "Jul 28, 2026", image_url: "https://media.base44.com/images/public/6a7e76e3396b41955b675542/ff5a36d61_generated_8395a13a.png" }];




// ---------- shared UI ----------
const styles = `
  @keyframes floatA { 0%, 100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-20px) rotate(3deg); } }
  @keyframes floatB { 0%, 100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-15px) rotate(-2deg); } }
  @keyframes floatC { 0%, 100% { transform: translateY(0) scale(1); } 50% { transform: translateY(-10px) scale(1.05); } }
  @keyframes shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
  .animate-gradient-x { background-size: 200% 200%; animation: gradientX 5s ease infinite; }
  @keyframes gradientX { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
`;

function AnimatedElement({ children, className, delay = 0 }) {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight) {setIsVisible(true);return;}
    const fallback = setTimeout(() => setIsVisible(true), 800 + delay);
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {clearTimeout(fallback);setTimeout(() => setIsVisible(true), delay);observer.unobserve(el);}
    }, { threshold: 0.05, rootMargin: "0px 0px 100px 0px" });
    observer.observe(el);
    return () => {observer.disconnect();clearTimeout(fallback);};
  }, [delay]);
  return (
    <div ref={ref} className={`transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"} ${className || ""}`}>
      {children}
    </div>);

}

// Shared tool form atoms live in @/components/tools/ToolUI (used by ToolCalculator).

// ---------- Hero ----------
function HeroSection({ catCount, searchQuery, onSearchChange }) {
  const { t } = useI18n();
  const scrollTo = (id, fallback) => {
    const el = document.getElementById(id) || fallback && document.getElementById(fallback);
    if (!el) return;
    const y = el.getBoundingClientRect().top + window.scrollY - 80;
    try {window.scrollTo({ top: y, behavior: "smooth" });}
    catch {window.scrollTo(0, y);}
  };
  return (
    <section className="relative overflow-hidden bg-[#FFFBEB] dark:bg-[#1E1B4B] transition-colors duration-300 pt-10 pb-16">
      <style>{styles}</style>
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-primary/20 rounded-full blur-[120px] pointer-events-none" style={{ animation: "floatA 9s ease-in-out infinite" }} />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent/15 rounded-full blur-[150px] pointer-events-none" style={{ animation: "floatB 7s ease-in-out 2s infinite" }} />
      
      <div className="max-w-5xl mx-auto px-6 relative z-10">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: "easeOut" }}
        className="bg-[#FFFBEB] dark:bg-[#1E1B4B] p-6 text-center relative overflow-hidden group transition-colors duration-300 shadow-[0_2px_8px_rgba(0,0,0,0.05)] rounded-[40px]">
          
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none" />

          <div className="flex items-center justify-center gap-4 mb-6" style={{ animation: "floatC 6s ease-in-out infinite" }}>
            <Logo />
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-[#6D28D9] to-[#F59E0B] bg-clip-text text-transparent animate-gradient-x">
              iyadel
            </h1>
          </div>
          
          <p className="text-[18px] leading-[1.5] text-[#374151] dark:text-[#FEF3C7]/80 max-w-2xl mx-auto mb-6 font-medium">
            {t("Your all-in-one platform")} — {t("tools in Finance, Health, Converters, Math, Brain Games, and Image Tools")}
          </p>
          
          <div className="flex flex-wrap justify-center gap-2">
            <button onClick={() => scrollTo("tools")} className="flex items-center gap-3 rounded-full bg-white dark:bg-[#2D2A5A] border border-[#E9D5FF] dark:border-[#4B3F8A] px-[14px] py-2 shadow-sm hover:border-primary/50 transition-colors shadow-sm cursor-pointer">
              <Box className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-[#1F2937] dark:text-[#FEF3C7]">{t("Tools")}</span>
            </button>
            <button onClick={() => scrollTo("categories", "tools")} className="flex items-center gap-3 rounded-full bg-white dark:bg-[#2D2A5A] border border-[#E9D5FF] dark:border-[#4B3F8A] px-[14px] py-2 shadow-sm hover:border-accent/50 transition-colors shadow-sm cursor-pointer">
              <Layers className="w-4 h-4 text-accent" />
              <span className="text-sm font-semibold text-[#1F2937] dark:text-[#FEF3C7]"><span className="text-accent">{catCount}</span> {t("Categories")}</span>
            </button>
            <button onClick={() => scrollTo("why")} className="flex items-center gap-3 rounded-full bg-white dark:bg-[#2D2A5A] border border-[#E9D5FF] dark:border-[#4B3F8A] px-[14px] py-2 shadow-sm hover:border-primary/50 transition-colors shadow-sm cursor-pointer">
              <Gift className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-[#1F2937] dark:text-[#FEF3C7]"><span className="text-primary">{t("Free")}</span> {t("for Everyone")}</span>
            </button>
          </div>

          <div className="max-w-xl mx-auto mt-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                value={searchQuery || ""}
                onChange={(e) => {onSearchChange(e.target.value);scrollTo("tools");}}
                onFocus={() => scrollTo("tools")}
                placeholder={t("Search for a tool by name...")}
                className="w-full h-14 rounded-2xl border border-[#E9D5FF] dark:border-[#4B3F8A] bg-white dark:bg-[#2D2A5A] text-[#1E1B4B] dark:text-[#FEF3C7] pl-12 pr-12 focus:outline-none focus:border-[#F59E0B] transition-all shadow-[0_2px_8px_rgba(0,0,0,0.05)] text-base" />
              
              {searchQuery &&
              <button onClick={() => onSearchChange("")} aria-label={t("Clear")} className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
                  <X className="w-4 h-4" />
                </button>
              }
            </div>
          </div>
        </motion.div>
      </div>
    </section>);

}

// ---------- Tool workspace (all calculators) ----------
// Logo drawing + image sharpening helpers live in @/components/tools/ToolCalculator.
function ToolWorkspace({ tool, onBack }) {
  const { t } = useI18n();
  const { isFavorite, toggleFavorite } = useFavorites();

  return (
    <div className="max-w-[480px] mx-auto bg-white dark:bg-[#1E1B4B] transition-colors duration-300 rounded-[20px] p-4 shadow-xl border-0 relative overflow-hidden">
      <button onClick={onBack} className="absolute top-8 left-8 sm:top-10 sm:left-10 flex items-center gap-2 px-4 py-2 rounded-full bg-background border border-border text-sm font-medium text-foreground hover:bg-secondary hover:text-secondary-foreground transition-all duration-300 shadow-sm z-20">
        <ArrowLeft className="w-4 h-4" /> {t("Back")}
      </button>
      <button
        onClick={() => toggleFavorite(tool.slug)}
        aria-label={isFavorite(tool.slug) ? t("Remove from favorites") : t("Add to favorites")}
        className={`absolute top-8 right-8 sm:top-10 sm:right-10 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm z-20 ${isFavorite(tool.slug) ? "bg-accent/15 text-accent border border-accent/30" : "bg-background border border-border text-muted-foreground hover:text-accent hover:border-accent/40"}`}>
        <Star className={`w-5 h-5 ${isFavorite(tool.slug) ? "fill-accent" : ""}`} />
      </button>

      <div className="text-center mb-10 mt-12 sm:mt-8 relative z-10">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-card-foreground mb-3">{t(tool.name)}</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">{t(tool.description)}</p>
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        <ToolCalculator slug={tool.slug} />
        <div className="mt-10 text-center">
          <Link to={`/tools/${tool.slug}`} className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-6 py-3 font-semibold text-sm hover:bg-primary/90 transition-colors shadow-sm">
            {t("Open full page")} <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>);

}

// ---------- Tools Hub ----------
function ToolsHub({ searchQuery = "" }) {
  const { t } = useI18n();
  const [tools, setTools] = useState([]);
  const [activeCategory, setActiveCategory] = useState("Finance");
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { favorites, toggleFavorite, isFavorite } = useFavorites();
  const isMobile = useIsMobile();

  const load = useCallback(async () => {try {setTools(await ToolEntity.list());} catch {}}, []);
  useEffect(() => {load();}, [load]);

  const items = (() => {
    const map = new Map();
    STATIC_TOOLS.forEach((t) => map.set(t.slug, t));
    tools.forEach((t) => {if (!map.has(t.slug)) map.set(t.slug, t);});
    return Array.from(map.values());
  })();
  const toolSlug = searchParams.get("tool");
  const selectedTool = toolSlug ? items.find((t) => t.slug === toolSlug) || null : null;
  const query = (searchQuery || "").trim().toLowerCase();
  const isSearching = query.length > 0;
  const filtered = isSearching ?
  items.filter((t) => `${t.name} ${t.category} ${t.description || ""}`.toLowerCase().includes(query)) :
  activeCategory === "Favorites" ?
  items.filter((t) => isFavorite(t.slug)) :
  activeCategory === "All" ?
  items :
  items.filter((t) => t.category === activeCategory);

  const selectTool = (tool) => {
    setActiveCategory(tool.category);
    setSearchParams({ tool: tool.slug });
    trackEvent("tool_select", { tool_slug: tool.slug, tool_name: tool.name, category: tool.category });
  };
  const clearTool = () => {
    const next = new URLSearchParams(searchParams);
    next.delete("tool");
    setSearchParams(next);
  };

  // The list/grid is always visible on mobile (the workspace slides over it as
  // a full-screen modal) and only hidden on desktop when a tool is open inline.
  const showList = isSearching || !selectedTool || isMobile;

  return (
    <section className="bg-[#FFFBEB] dark:bg-[#1E1B4B] transition-colors duration-300 py-16" id="tools">
      <PullToRefresh onRefresh={load}>
      <div className="max-w-5xl mx-auto px-6">
        
        {showList && !isSearching &&
          <div id="categories" className="mb-8">
            <h2 className="text-left text-[16px] font-bold text-[#111827] dark:text-[#FEF3C7] mb-2">{t("Browse by Category")}</h2>
            <div className="grid grid-cols-4 gap-2">
              {CATEGORY_CARDS.map(({ label, cat, Icon, route, scrollTo, wide }) =>
              <button key={label} onClick={() => {
                if (scrollTo) {
                  const el = document.getElementById(scrollTo);
                  if (el) {const y = el.getBoundingClientRect().top + window.scrollY - 80;try {window.scrollTo({ top: y, behavior: "smooth" });} catch {window.scrollTo(0, y);}}
                  trackEvent("category_select", { category: cat });
                  return;
                }
                if (route) {navigate(route);trackEvent("category_select", { category: cat });return;}
                setActiveCategory(cat);trackEvent("category_select", { category: cat });
              }}
              className={[
              "rounded-[14px] bg-white dark:bg-[#2D2A5A] border shadow-[0_2px_6px_rgba(109,40,217,0.06)] transition-all duration-300",
              wide ?
              "col-span-4 flex flex-row items-center justify-start gap-3 px-4 h-[64px] border-[#C7D2FE] bg-gradient-to-r from-[#4F46E5]/5 to-[#6366F1]/5 text-start shadow-[0_4px_14px_rgba(79,70,229,0.10)]" :
              `flex flex-col items-center justify-center px-1 py-2 h-[84px] ${!route && activeCategory === cat ? "border-[#6D28D9]" : "border-[#F3F4F6] dark:border-[#4B3F8A]"}`].
              join(" ")}>
                  {wide ?
                <>
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#4F46E5] to-[#6366F1] flex items-center justify-center shrink-0 shadow-[0_4px_12px_rgba(79,70,229,0.30)]">
                        <Icon className="w-5 h-5 text-white" strokeWidth={2} />
                      </div>
                      <span className="min-w-0">
                        <span className="block text-[13px] font-bold text-[#1E293B] dark:text-[#E0E7FF]">{t(label)}</span>
                        <span className="block text-[11px] font-medium text-[#475569] dark:text-[#A5B4FC] leading-snug">{t("Check any domain or server: DNS records, hosting location, registration info and live status — all in one scan.")}</span>
                      </span>
                    </> :

                <>
                      <div className="w-[42px] h-[42px] rounded-full bg-gradient-to-br from-[#6D28D9] to-[#F59E0B] flex items-center justify-center">
                        <Icon className="w-[22px] h-[22px] text-white" strokeWidth={2} />
                      </div>
                      <span className="text-[11px] font-bold text-[#111827] dark:text-[#FEF3C7] mt-1.5 text-center leading-[1.1] break-words">
                        {t(label).split(" ").map((w, i) => <span key={i} className="block">{w}</span>)}
                      </span>
                    </>
                }
                </button>
              )}
            </div>
          </div>
          }

        {isSearching &&
          <div className="mb-8 text-center">
            <p className="text-sm text-muted-foreground">
              {filtered.length > 0 ?
              `${filtered.length} ${t("results for")} "${searchQuery}"` :
              t("No tools found. Try another name.")}
            </p>
          </div>
          }
        {showList && filtered.length === 0 && activeCategory === "Favorites" && !isSearching &&
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
              <Star className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-card-foreground text-lg font-medium">{t("No favorites yet")}</p>
            <p className="text-muted-foreground mt-2">{t("Tap the star on any tool to save it here for quick access.")}</p>
            <button onClick={() => setActiveCategory("Finance")} className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-5 py-2.5 font-semibold text-sm hover:bg-primary/90 transition-colors">
              {t("Browse Tools")}
            </button>
          </div>
          }
        {showList && filtered.length > 0 &&
          <>
        <h2 className="mt-6 mb-4 text-left text-[20px] font-bold text-[#111827] dark:text-[#FEF3C7]">{activeCategory === "Favorites" ? t("Favorites") : activeCategory === "All" ? t("All Tools") : `${t("Popular")} ${t(activeCategory)}`}</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((tool, index) => {
                const Icon = ICONS[tool.icon] || Calculator;
                const fav = isFavorite(tool.slug);
                return (
                  <AnimatedElement key={tool.slug || index} delay={index * 80}>
                <div onClick={() => {navigate(`/tools/${tool.slug}`);trackEvent("tool_open_page", { tool_slug: tool.slug, tool_name: tool.name });}}
                    className="relative w-full h-full text-center rounded-[20px] bg-white dark:bg-[#2D2A5A] border border-[#F3F4F6] dark:border-[#4B3F8A] p-4 transition-all duration-300 shadow-[0_4px_12px_rgba(109,40,217,0.08)] hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(109,40,217,0.15)] group flex flex-col items-center justify-center cursor-pointer">
                  
                  <button
                        onClick={(e) => {e.stopPropagation();toggleFavorite(tool.slug);trackEvent("tool_favorite", { tool_slug: tool.slug, action: fav ? "remove" : "add" });}}
                        aria-label={fav ? t("Remove from favorites") : t("Add to favorites")}
                        className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 z-10 ${fav ? "bg-accent/15 text-accent border border-accent/30" : "bg-white dark:bg-[#1E1B4B] border border-[#E5E7EB] dark:border-[#4B3F8A] text-[#6B7280] hover:text-accent hover:border-accent/40"}`}>
                    <Star className={`w-5 h-5 ${fav ? "fill-accent" : ""}`} />
                  </button>
                  
                  {tool.category === "Games" ?
                      <div className="w-16 h-16 mb-5 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                      <GameIcon slug={tool.slug} className="w-16 h-16" />
                    </div> :

                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#6D28D9] to-[#F59E0B] flex items-center justify-center mb-4 shadow-[0_8px_20px_rgba(109,40,217,0.25)] group-hover:scale-110 transition-all duration-500 overflow-hidden">
                      {tool.logo ?
                        <img src={tool.logo} alt={t(tool.name)} className="w-full h-full object-cover" /> :

                        <Icon className="w-7 h-7 text-primary-foreground" strokeWidth={2.2} />
                        }
                    </div>
                      }
                  
                  <h3 className="text-base font-bold text-[#111827] dark:text-[#FEF3C7] mb-0.5">{t(tool.name)}</h3>
                  <span className="text-xs font-medium text-[#6B7280] dark:text-[#A8A6C4]">{t(tool.category)}</span>
                  
                </div>
              </AnimatedElement>);

              })}
        </div>
        </>
          }

        {/* Desktop: inline workspace with a subtle slide-up */}
        <AnimatePresence mode="wait">
          {selectedTool && !isSearching && !isMobile &&
            <motion.div
              key={`ws-${selectedTool.slug}`}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 24 }}
              transition={{ duration: 0.26, ease: "easeOut" }}>
              
              <ToolWorkspace tool={selectedTool} onBack={clearTool} />
            </motion.div>
            }
        </AnimatePresence>
      </div>
      </PullToRefresh>

      {/* Mobile: full-screen slide-up modal workspace (ported to body to escape page-transition transforms) */}
      {createPortal(
        <AnimatePresence>
          {selectedTool && !isSearching && isMobile &&
          <motion.div
            key="ws-mobile"
            className="fixed inset-0 z-[60] bg-card overflow-y-auto overscroll-contain"
            style={{ paddingTop: "env(safe-area-inset-top)", paddingBottom: "env(safe-area-inset-bottom)" }}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.34, ease: [0.32, 0.72, 0, 1] }}>
            
              <ToolWorkspace tool={selectedTool} onBack={clearTool} />
            </motion.div>
          }
        </AnimatePresence>,
        document.body
      )}
    </section>);

}

// ---------- App Store Banner & Quick Links (Footer block from screenshot) ----------
function AppStoreSection() {
  const { t } = useI18n();
  return (
    <section className="bg-background pb-16">
      <div className="max-w-5xl mx-auto px-6">
        <AnimatedElement delay={100}>
          <div className="rounded-[3rem] bg-card border border-border p-10 md:p-14 shadow-2xl relative overflow-hidden flex flex-col md:flex-row gap-10 md:gap-16">
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 to-transparent pointer-events-none" />
            
            <div className="flex-1 relative z-10">
              <h3 className="text-2xl font-bold text-card-foreground mb-4">{t("iyadel Platform")}</h3>
              <p className="text-muted-foreground mb-6 text-sm leading-relaxed max-w-sm">
                {t("Interactive and accurate tools in one place. Finance, health, converters, math, brain games, and image processing — completely free and secure.")}
              </p>
              <p className="text-xs text-muted-foreground/60 mt-auto pt-6">{t("© 2026 iyadel — All Rights Reserved")}</p>
            </div>
            
            <div className="flex-1 relative z-10 grid grid-cols-2 gap-8">
              <div>
                <h4 className="font-bold text-card-foreground mb-4">{t("Quick Links")}</h4>
                <ul className="space-y-3 text-sm">
                  <li><Link to="/About" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"><Square className="w-3 h-3" /> {t("About Us")}</Link></li>
                  <li><Link to="/Privacy" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"><Square className="w-3 h-3" /> {t("Privacy Policy")}</Link></li>
                  <li><Link to="/Dashboard" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"><ShieldCheck className="w-3 h-3" /> {t("Admin")}</Link></li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-bold text-card-foreground mb-4">{t("Social")}</h4>
                <div className="flex items-center gap-3">
                  <a href="https://www.instagram.com/stories/iyadelpost/3970303208071622669?utm_source=ig_story_item_share&igsi=MWZkOGNuam5nbXlkMQ==" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="w-10 h-10 rounded-full bg-background border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/50 transition-all"><Instagram className="w-4 h-4" /></a>
                  <a href="https://www.facebook.com/share/14mMyMHd6h4/" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="w-10 h-10 rounded-full bg-background border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/50 transition-all"><Facebook className="w-4 h-4" /></a>
                </div>
                
                <div className="mt-8 space-y-3">
                  <button className="flex items-center gap-3 w-full max-w-[160px] bg-background border border-border rounded-xl p-2.5 hover:border-primary/50 transition-all">
                    <Smartphone className="w-6 h-6 text-foreground" />
                    <div className="text-left">
                      <div className="text-[10px] text-muted-foreground uppercase leading-none mb-1">{t("Get it on")}</div>
                      <div className="text-sm font-bold text-foreground leading-none">{t("Google Play")}</div>
                    </div>
                  </button>
                  <button className="flex items-center gap-3 w-full max-w-[160px] bg-background border border-border rounded-xl p-2.5 hover:border-primary/50 transition-all">
                    <Smartphone className="w-6 h-6 text-foreground" />
                    <div className="text-left">
                      <div className="text-[10px] text-muted-foreground uppercase leading-none mb-1">{t("Download on the")}</div>
                      <div className="text-sm font-bold text-foreground leading-none">{t("App Store")}</div>
                    </div>
                  </button>
                </div>
              </div>
            </div>

            <div className="sr-only" aria-hidden="true">
              <a href="https://fazier.com/launches/iyadel.com" target="_blank" rel="noopener noreferrer">
                <img src="https://fazier.com/api/v1//public/badges/launch_badges.svg?badge_type=launched&theme=light" width={120} alt="Fazier badge" />
              </a>
            </div>

          </div>
        </AnimatedElement>
      </div>
    </section>);

}

// ---------- Why iyadel & About Content ----------
function WhySection() {
  const { t } = useI18n();
  const features = [
  { icon: Coins, title: "Completely free", desc: "no registration or payment required." },
  { icon: ShieldQuestion, title: "Secure & private", desc: "all processing happens in your browser, no data is uploaded to any server." },
  { icon: Layers, title: "Works on all devices", desc: "mobile, tablet, or desktop." },
  { icon: Zap, title: "Tools", desc: "Finance, Health, Converters, Math, Brain Games, and Image Tools." }];

  return (
    <section id="why" className="bg-background pb-16">
      <div className="max-w-5xl mx-auto px-6">
        <AnimatedElement>
          <div className="rounded-[3rem] bg-card border border-border p-10 md:p-14 shadow-2xl relative overflow-hidden">
            <div className="flex items-center gap-3 mb-6">
              <Square className="w-6 h-6 text-primary stroke-[2.5]" />
              <h2 className="text-2xl sm:text-3xl font-extrabold text-card-foreground">{t("About Us")}</h2>
            </div>
            
            <p className="text-card-foreground/80 mb-10 text-lg">
              <strong className="text-foreground">iyadel</strong> {t("is an")} <strong className="text-foreground">{t("integrated tools platform")}</strong> {t("that provides a wide range of free and interactive tools covering users' daily needs across various domains.")}
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {features.map((f, i) =>
              <div key={f.title} className="rounded-2xl bg-background border border-border p-6 hover:-translate-y-1 hover:border-primary/30 transition-all duration-300">
                  <div className="flex items-start gap-3">
                    <f.icon className="w-5 h-5 text-accent mt-0.5 shrink-0" />
                    <div>
                      <strong className="text-sm text-foreground block mb-1">{t(f.title)} —</strong>
                      <span className="text-sm text-muted-foreground leading-snug block">{t(f.desc)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <p className="text-sm text-muted-foreground mt-10 italic">
              "{t("The iyadel team works passionately to deliver the best digital experience.")}"
            </p>
          </div>
        </AnimatedElement>
      </div>
    </section>);

}

// ---------- Blog teaser ----------
function BlogTeaser() {
  const { t } = useI18n();
  const [posts, setPosts] = useState([]);
  useEffect(() => {BlogPostEntity.list("-created_date", 3).then(setPosts).catch(() => {});}, []);
  const published = posts.filter((p) => (p.status || "published") === "published");
  const items = (published.length > 0 ? published : STATIC_BLOG).slice(0, 3);

  return (
    <section className="bg-background pb-16">
      <div className="max-w-5xl mx-auto px-6">
        <AnimatedElement>
          <div className="rounded-[3rem] bg-card border border-border p-10 md:p-14 shadow-2xl">
            <div className="flex flex-wrap items-end justify-between gap-6 mb-10">
              <div>
                <h2 className="text-3xl font-extrabold text-card-foreground">{t("From the Blog")}</h2>
                <p className="text-muted-foreground mt-2 font-medium">{t("Read the latest articles and tips")}</p>
              </div>
              <Link to="/Blog"><Button className="bg-primary text-primary-foreground rounded-2xl px-6 py-5 hover:scale-105 transition-transform font-bold">{t("View All Posts")}</Button></Link>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {items.map((post, i) =>
              <Link key={post.title} to="/Blog" className="block h-full rounded-[2rem] bg-background border border-border overflow-hidden hover:-translate-y-2 hover:shadow-xl hover:border-primary/30 transition-all duration-400 group">
                  <div className="aspect-[16/9] overflow-hidden">
                    <img src={post.image_url} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  </div>
                  <div className="p-6">
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-secondary text-secondary-foreground uppercase tracking-wide">{post.category}</span>
                    <h3 className="font-bold text-lg text-foreground mt-4 mb-3 leading-tight group-hover:text-primary transition-colors">{post.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">{post.excerpt}</p>
                    <span className="text-xs font-medium text-muted-foreground/70 mt-5 block uppercase tracking-wider">{post.date}</span>
                  </div>
                </Link>
              )}
            </div>
          </div>
        </AnimatedElement>
      </div>
    </section>);

}



export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  useSeo({
    title: "Free Online Calculators, Converters & Image Tools",
    description: "Free online tools: loan & interest calculators, BMI & calorie trackers, unit converters, QR generator, image cropper, compressor & background remover. Fast, private, no signup.",
    path: "/"
  });
  return (
    <div className="min-h-screen bg-[#FFFBEB] dark:bg-[#1E1B4B] transition-colors duration-300 selection:bg-primary/30 selection:text-primary">
      <HeroSection catCount={7} searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      <LanguageSection />
      <ToolsHub searchQuery={searchQuery} />
      <DomainInspector />
      <WhySection />
      <PrivacyTeaser />
      <BlogTeaser />
    </div>);

}