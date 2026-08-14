import { useState, useEffect, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useI18n } from "@/lib/i18n";
import { motion } from "framer-motion";
import { ArrowLeft, Calendar, Tag, Sparkles } from "lucide-react";
import { Image } from "@/components/ui/image";
import { STATIC_BLOG } from "@/data/blog-posts";

const BlogPostEntity = base44.entities.BlogPost;

function AnimatedElement({ children, className, delay = 0 }) {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    setIsVisible(true);
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setTimeout(() => setIsVisible(true), delay); observer.unobserve(el); }
    }, { threshold: 0.05 });
    observer.observe(el);
    return () => observer.disconnect();
  }, [delay]);
  return (
    <div ref={ref} className={`transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"} ${className || ""}`}>
      {children}
    </div>
  );
}

export default function BlogPostPage() {
  const { t } = useI18n();
  const [searchParams] = useSearchParams();
  const slug = searchParams.get("slug");
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      let found = STATIC_BLOG.find((p) => p.slug === slug) || null;
      if (!found) {
        try {
          const all = await BlogPostEntity.list("-created_date", 50);
          found = (all || []).find((p) => p.slug === slug) || null;
        } catch { found = null; }
      }
      if (active) { setPost(found); setLoading(false); }
    })();
    return () => { active = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-5 px-6 text-center">
        <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center">
          <Sparkles className="w-7 h-7 text-muted-foreground" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">{t("Article not found")}</h1>
        <Link to="/Blog" className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-5 py-2.5 font-semibold text-sm hover:bg-primary/90 transition-colors">
          <ArrowLeft className="w-4 h-4" /> {t("Back to Blog")}
        </Link>
      </div>
    );
  }

  const paragraphs = (post.content || "").split("\n").filter((p) => p.trim().length > 0);

  return (
    <div className="bg-background pb-20">
      <section className="relative bg-secondary pt-16 pb-12">
        <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="max-w-3xl mx-auto px-6 relative z-10">
          <Link to="/Blog" className="inline-flex items-center gap-2 rounded-full bg-background border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted hover:border-primary/30 transition-all mb-8">
            <ArrowLeft className="w-4 h-4" /> {t("Back to Blog")}
          </Link>
          <div className="flex items-center gap-3 text-xs text-muted-foreground mb-4">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-background border border-border"><Tag className="w-3 h-3" />{t(post.category)}</span>
            <span className="inline-flex items-center gap-1"><Calendar className="w-3 h-3" />{post.date}</span>
          </div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}
            className="text-3xl sm:text-5xl font-bold tracking-tight text-foreground leading-tight"
          >
            {t(post.title)}
          </motion.h1>
          {post.excerpt && <p className="text-lg text-muted-foreground mt-5 leading-relaxed">{t(post.excerpt)}</p>}
        </div>
      </section>

      {post.image_url && (
        <div className="max-w-3xl mx-auto px-6 -mt-6 relative z-10">
          <AnimatedElement>
            <div className="rounded-3xl overflow-hidden border border-border shadow-xl">
              <Image src={post.image_url} alt={post.title} fittingType="fill" className="w-full aspect-[16/9]" />
            </div>
          </AnimatedElement>
        </div>
      )}

      <article className="max-w-3xl mx-auto px-6 mt-12">
        <div className="prose-content space-y-5">
          {paragraphs.map((p, i) => (
            <p key={i} className="text-base sm:text-lg leading-relaxed text-card-foreground/90">{p}</p>
          ))}
        </div>

        <div className="mt-14 rounded-3xl bg-gradient-to-br from-primary/10 to-accent/5 border border-primary/20 p-8 text-center">
          <h3 className="text-xl font-bold text-foreground mb-2">{t("Enjoyed this article?")}</h3>
          <p className="text-muted-foreground mb-6">{t("Explore 31+ free tools that make everyday tasks effortless.")}</p>
          <Link to="/" className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-6 py-3 font-semibold text-sm hover:bg-primary/90 transition-colors">
            {t("Browse Tools")}
          </Link>
        </div>
      </article>
    </div>
  );
}