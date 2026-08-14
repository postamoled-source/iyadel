import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight, Calendar, Tag, LayoutGrid } from "lucide-react";
import { Button } from "@/components/ui/button";

const BlogPostEntity = base44.entities.BlogPost;

const STATIC_BLOG = [
  { title: "5 Smart Ways to Pay Off Your Loan Faster", excerpt: "Small changes to your repayment strategy can save you thousands in interest. Here's how to use the Loan Calculator to your advantage.", category: "Finance", date: "Aug 10, 2026", image_url: "https://media.base44.com/images/public/6a7e76e3396b41955b675542/58374ccbe_generated_5e9014e0.png" },
  { title: "Understanding BMI: What the Numbers Really Mean", excerpt: "Body Mass Index is a starting point, not the full picture. Learn how to read your BMI result the right way.", category: "Health", date: "Aug 5, 2026", image_url: "https://media.base44.com/images/public/6a7e76e3396b41955b675542/091f98734_generated_92bd36b3.png" },
  { title: "Compound Interest: The Eighth Wonder of the World", excerpt: "Einstein allegedly called it the most powerful force in the universe. See how compounding accelerates your savings.", category: "Finance", date: "Jul 28, 2026", image_url: "https://media.base44.com/images/public/6a7e76e3396b41955b675542/ff5a36d61_generated_8395a13a.png" },
  { title: "Boost Your Productivity with Free Online Tools", excerpt: "From unit converters to QR generators, discover how everyday tools quietly save you hours every week.", category: "Technology", date: "Jul 20, 2026", image_url: "https://media.base44.com/images/public/6a7e76e3396b41955b675542/4637cebde_generated_ac5c1dd1.png" },
];

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
  return (
    <section className="relative overflow-hidden bg-background pt-20 pb-14 sm:pt-24 sm:pb-16">
      <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-primary/20 rounded-full blur-[100px] pointer-events-none" style={{ animation: "floatA 9s ease-in-out infinite" }} />
      <div className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-accent/10 rounded-full blur-[100px] pointer-events-none" style={{ animation: "floatB 7s ease-in-out 2s infinite" }} />
      <div className="max-w-5xl mx-auto px-6 relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: "easeOut" }}
          className="flex flex-wrap items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-secondary border border-border px-4 py-1.5 mb-5">
              <Sparkles className="w-4 h-4 text-accent" />
              <span className="text-sm text-muted-foreground">TestPeak Blog</span>
            </div>
            <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-foreground mb-4">
              Read the latest <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-gradient-x">articles &amp; tips</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl">Practical guides on finance, health and productivity — powered by the same tools you use every day.</p>
          </div>
          <a href="#"><Button variant="outline" className="rounded-xl border-border text-foreground hover:bg-secondary">Admin Panel</Button></a>
        </motion.div>
      </div>
    </section>
  );
}

function BlogGrid() {
  const [posts, setPosts] = useState([]);
  const [activeCategory, setActiveCategory] = useState("All");

  useEffect(() => { BlogPostEntity.list("-created_date", 20).then(setPosts).catch(() => {}); }, []);
  const items = posts.length > 0 ? posts : STATIC_BLOG;
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
                {cat}
              </button>
            ))}
          </div>
        </AnimatedElement>

        <div className={filtered.length === 0 ? "hidden" : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"}>
          {filtered.map((post, i) => (
            <AnimatedElement key={post.title} delay={i * 90}>
              <article className="h-full flex flex-col rounded-2xl bg-card border border-border overflow-hidden hover:-translate-y-1.5 hover:shadow-[0_20px_60px_-15px_hsl(var(--primary)/0.3)] transition-all duration-300 group">
                <div className="aspect-[16/9] overflow-hidden">
                  <img src={post.image_url} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-secondary"><Tag className="w-3 h-3" />{post.category}</span>
                    <span className="inline-flex items-center gap-1"><Calendar className="w-3 h-3" />{post.date}</span>
                  </div>
                  <h3 className="font-bold text-lg text-foreground mb-2 leading-snug">{post.title}</h3>
                  <p className="text-sm text-muted-foreground flex-1">{post.excerpt}</p>
                  <a href="#" className="inline-flex items-center gap-1 text-primary text-sm font-semibold mt-4 hover:gap-2 transition-all">
                    Read more <ArrowRight className="w-4 h-4" />
                  </a>
                </div>
              </article>
            </AnimatedElement>
          ))}
        </div>
      </div>
    </section>
  );
}

function NewsletterSection() {
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
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">Never miss an update</h2>
          <p className="text-muted-foreground mb-8">Be the first to know when we publish new articles and launch new tools.</p>
          {submitted ? (
            <div className="rounded-xl bg-card border border-primary/30 px-6 py-4 text-foreground">Thanks for subscribing — check your inbox soon!</div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com"
                className="flex-1 rounded-xl border border-border bg-card text-foreground px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary transition" />
              <Button type="submit" className="relative overflow-hidden rounded-xl px-6 py-3 bg-accent text-accent-foreground hover:scale-105 transition-transform duration-300">
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-accent-foreground/20 to-transparent animate-[shimmer_3s_ease-in-out_infinite] bg-[length:200%_100%]" />
                <span className="relative z-10">Subscribe</span>
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