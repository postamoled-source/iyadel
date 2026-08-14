import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useI18n } from "@/lib/i18n";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight, Calendar, Tag, LayoutGrid, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Image } from "@/components/ui/image";
import { STATIC_BLOG } from "@/data/blog-posts";

const BlogPostEntity = base44.entities.BlogPost;

function AnimatedElement({ children, className, delay = 0 }) {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight) { setIsVisible(true); return; }
    const fallback = setTimeout(() => setIsVisible(true), 800 + delay);
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { clearTimeout(fallback); setTimeout(() => setIsVisible(true), delay); observer.unobserve(el); }
    }, { threshold: 0.05, rootMargin: "0px 0px 200px 0px" });
    observer.observe(el);
    return () => { observer.disconnect(); clearTimeout(fallback); };
  }, [delay]);
  return (
    <div ref={ref} className={`transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"} ${className || ""}`}>
      {children}
    </div>
  );
}

function HeroSection() {
  const { t } = useI18n();
  return (
    <section className="relative bg-background pt-20 pb-14 sm:pt-24 sm:pb-16">
      <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-primary/20 rounded-full blur-[100px] pointer-events-none" style={{ animation: "floatA 9s ease-in-out infinite" }} />
      <div className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-accent/10 rounded-full blur-[100px] pointer-events-none" style={{ animation: "floatB 7s ease-in-out 2s infinite" }} />
      <div className="max-w-5xl mx-auto px-6 relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: "easeOut" }}
          className="flex flex-wrap items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-secondary border border-border px-4 py-1.5 mb-5">
              <Sparkles className="w-4 h-4 text-accent" />
              <span className="text-sm text-muted-foreground">{t("TestPeak Blog")}</span>
            </div>
            <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-foreground mb-4">
              {t("Read the latest")} <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-gradient-x">{t("articles & tips")}</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl">{t("Practical guides on finance, health and productivity — powered by the same tools you use every day.")}</p>
          </div>
          <a href="#"><Button variant="outline" className="rounded-xl border-border text-foreground hover:bg-secondary">{t("Admin Panel")}</Button></a>
        </motion.div>
      </div>
    </section>
  );
}

function BlogGrid() {
  const { t } = useI18n();
  const [posts, setPosts] = useState([]);
  const [activeCategory, setActiveCategory] = useState("All");

  useEffect(() => { BlogPostEntity.list("-created_date", 20).then(setPosts).catch(() => {}); }, []);
  const items = (() => {
    const map = new Map();
    STATIC_BLOG.forEach((p) => map.set(p.title, p));
    posts.forEach((p) => { if (!map.has(p.title)) map.set(p.title, p); });
    return Array.from(map.values());
  })();
  const categories = ["All", ...Array.from(new Set(items.map((p) => p.category)))];
  const filtered = activeCategory === "All" ? items : items.filter((p) => p.category === activeCategory);

  return (
    <section className="bg-secondary py-14 sm:py-20">
      <div className="max-w-6xl mx-auto px-6">
        <AnimatedElement>
          <div className="flex flex-wrap gap-3 mb-10">
            {categories.map((cat) => (
              <button key={cat} onClick={() => setActiveCategory(cat)}
                className={`px-5 py-2 rounded-full font-semibold text-sm transition-all duration-300 hover:scale-105 ${activeCategory === cat ? "bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-lg shadow-primary/30" : "bg-card text-card-foreground border border-border hover:bg-muted"}`}>
                {t(cat)}
              </button>
            ))}
          </div>
        </AnimatedElement>

        <div className={filtered.length === 0 ? "hidden" : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"}>
          {filtered.map((post, i) => (
            <AnimatedElement key={post.title} delay={i * 90}>
              <Link to={`/Blog/post?slug=${encodeURIComponent(post.slug || "")}&title=${encodeURIComponent(post.title || "")}`} className="block h-full">
                <article className="h-full flex flex-col rounded-[1.75rem] bg-card border border-border overflow-hidden hover:-translate-y-2 hover:shadow-[0_24px_64px_-18px_hsl(var(--primary)/0.35)] hover:border-primary/40 transition-all duration-400 group">
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <Image src={post.image_url} alt={t(post.title)} fittingType="fill" className="w-full h-full group-hover:scale-110 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-card/90 via-card/10 to-transparent" />
                    <span className="absolute top-4 left-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-background/80 backdrop-blur-md border border-border text-xs font-bold text-primary uppercase tracking-wide">
                      <Tag className="w-3 h-3" />{t(post.category)}
                    </span>
                    <div className="absolute bottom-4 left-4 right-4 flex items-center gap-2 text-xs font-medium text-foreground/90">
                      <span className="inline-flex items-center gap-1 rounded-full bg-background/70 backdrop-blur-md px-2.5 py-1">
                        <Clock className="w-3 h-3 text-accent" />{t("5 min read")}
                      </span>
                    </div>
                  </div>
                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                      <Calendar className="w-3.5 h-3.5" />{post.date}
                    </div>
                    <h3 className="font-bold text-lg text-foreground mb-3 leading-snug group-hover:text-primary transition-colors duration-300 line-clamp-2">{t(post.title)}</h3>
                    <p className="text-sm text-muted-foreground flex-1 leading-relaxed line-clamp-3">{t(post.excerpt)}</p>
                    <span className="inline-flex items-center gap-1.5 text-primary text-sm font-semibold mt-5 group-hover:gap-3 transition-all duration-300">
                      {t("Read more")} <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </article>
              </Link>
            </AnimatedElement>
          ))}
        </div>
      </div>
    </section>
  );
}

function NewsletterSection() {
  const { t } = useI18n();
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const handleSubmit = (e) => { e.preventDefault(); if (email) setSubmitted(true); };
  return (
    <section className="bg-background py-16 sm:py-24 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[220px] bg-accent/15 rounded-full blur-[100px] pointer-events-none" />
      <div className="max-w-2xl mx-auto px-6 text-center relative z-10">
        <AnimatedElement>
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto mb-6 shadow-lg shadow-primary/30">
            <LayoutGrid className="w-7 h-7 text-primary-foreground" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">{t("Never miss an update")}</h2>
          <p className="text-muted-foreground mb-8">{t("Be the first to know when we publish new articles and launch new tools.")}</p>
          {submitted ? (
            <div className="rounded-xl bg-card border border-primary/30 px-6 py-4 text-card-foreground">{t("Thanks for subscribing — check your inbox soon!")}</div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com"
                className="flex-1 rounded-xl border border-border bg-card text-card-foreground px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary transition" />
              <Button type="submit" className="relative overflow-hidden rounded-xl px-6 py-3 bg-accent text-accent-foreground hover:scale-105 transition-transform duration-300">
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-accent-foreground/20 to-transparent animate-[shimmer_3s_ease-in-out_infinite] bg-[length:200%_100%]" />
                <span className="relative z-10">{t("Subscribe")}</span>
              </Button>
            </form>
          )}
        </AnimatedElement>
      </div>
    </section>
  );
}

export default function Blog() {
  return (
    <div>
      <HeroSection />
      <BlogGrid />
      <NewsletterSection />
    </div>
  );
}