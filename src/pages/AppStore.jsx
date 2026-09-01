import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Download, Package, Settings, Search, X, Images } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Image } from "@/components/ui/image";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";

export default function AppStore() {
  const [apps, setApps] = useState(null);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    let alive = true;
    base44.entities.AppStoreApp.list("-created_date", 100)
      .then((rows) => alive && setApps(rows))
      .catch(() => alive && setApps([]));
    return () => { alive = false; };
  }, []);

  const filtered = (apps || []).filter((a) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      (a.name || "").toLowerCase().includes(q) ||
      (a.description || "").toLowerCase().includes(q) ||
      (a.category || "").toLowerCase().includes(q)
    );
  });

  return (
    <div dir="rtl" className="min-h-screen bg-background px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Package className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-foreground sm:text-3xl">متجر التطبيقات</h1>
              <p className="text-sm text-muted-foreground">حمّل أحدث تطبيقاتنا بأمان وسهولة</p>
            </div>
          </div>
          <Link
            to="/app-store/admin"
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90"
          >
            <Settings className="h-4 w-4" />
            لوحة الإدارة
          </Link>
        </div>

        {/* Search */}
        <div className="relative mb-8 max-w-md">
          <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ابحث عن تطبيق..."
            className="pr-10"
          />
        </div>

        {/* Body */}
        {apps === null ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 sm:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-64 animate-pulse rounded-3xl bg-muted/60" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl bg-card px-6 py-20 text-center shadow-sm">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-muted text-muted-foreground">
              <Package className="h-8 w-8" />
            </div>
            <h2 className="text-lg font-bold text-foreground">
              {query ? "لا توجد نتائج مطابقة" : "لا توجد تطبيقات حالياً"}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {query
                ? "جرّب كلمات بحث مختلفة"
                : "زر لوحة الإدارة لإضافة أول تطبيق لك."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 sm:gap-6">
            {filtered.map((app, i) => (
              <motion.div
              key={app.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: Math.min(i * 0.04, 0.3) }}
              className="flex flex-col rounded-3xl bg-card p-4 text-center shadow-sm ring-1 ring-border transition hover:-translate-y-1 hover:shadow-lg sm:p-5 cursor-pointer"
              onClick={() => setSelected(app)}
              >
              <div className="mx-auto mb-4 h-20 w-20 overflow-hidden rounded-2xl bg-muted">
                {app.icon_url ? (
                  <Image
                    src={app.icon_url}
                    alt={app.name}
                    fittingType="fill"
                    className="h-full w-full"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                    <Package className="h-8 w-8" />
                  </div>
                )}
              </div>
              <h3 className="line-clamp-1 text-base font-bold text-foreground sm:text-lg">{app.name}</h3>
              {app.version && (
                <span className="mt-1 inline-block text-xs text-muted-foreground">
                  الإصدار {app.version}
                </span>
              )}
              {app.category && (
                <span className="mt-2 inline-block w-fit mx-auto rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                  {app.category}
                </span>
              )}
              <p className="mt-3 line-clamp-2 flex-1 text-sm text-muted-foreground">
                {app.description || "—"}
              </p>
              {app.images && app.images.length > 0 && (
                <span className="mt-3 inline-flex items-center justify-center gap-1 text-[11px] text-muted-foreground">
                  <Images className="h-3.5 w-3.5" /> {app.images.length} صور
                </span>
              )}
              {app.apk_url ? (
                <a
                  href={app.apk_url}
                  download
                  onClick={(e) => e.stopPropagation()}
                  className="mt-4 inline-flex items-center justify-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground transition hover:brightness-95"
                >
                  <Download className="h-4 w-4" />
                  تحميل
                </a>
              ) : (
                <span className="mt-4 inline-flex items-center justify-center gap-2 rounded-full bg-muted px-5 py-2.5 text-sm font-medium text-muted-foreground">
                  غير متوفر
                </span>
              )}
              </motion.div>
            ))}
          </div>
        )}

        <div className="mt-12 text-center text-sm text-muted-foreground">
          جميع الحقوق محفوظة © 2026
        </div>
      </div>

      {/* App detail modal */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 p-0 sm:p-6"
          onClick={() => setSelected(null)}
        >
          <div
            className="relative w-full max-w-lg max-h-[88vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl bg-card shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelected(null)}
              className="absolute top-3 left-3 z-10 w-9 h-9 rounded-full bg-background/80 border border-border flex items-center justify-center text-foreground hover:bg-muted"
            >
              <X className="w-4 h-4" />
            </button>

            {selected.images && selected.images.length > 0 ? (
              <div className="grid grid-cols-1 gap-1">
                {selected.images.map((url, i) => (
                  <div key={i} className="aspect-video w-full overflow-hidden bg-muted">
                    <img src={url} alt={`${selected.name}-${i}`} className="h-full w-full object-cover" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-40 bg-muted">
                <Package className="w-10 h-10 text-muted-foreground" />
              </div>
            )}

            <div className="p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-14 w-14 rounded-2xl overflow-hidden bg-muted shrink-0">
                  {selected.icon_url ? (
                    <img src={selected.icon_url} alt={selected.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                      <Package className="w-6 h-6" />
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <h2 className="text-xl font-extrabold text-foreground truncate">{selected.name}</h2>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                    {selected.version && <span>الإصدار {selected.version}</span>}
                    {selected.category && (
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-primary font-medium">{selected.category}</span>
                    )}
                  </div>
                </div>
              </div>

              {selected.description && (
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{selected.description}</p>
              )}

              {selected.apk_url && (
                <a
                  href={selected.apk_url}
                  download
                  className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-accent px-5 py-3 text-sm font-bold text-accent-foreground transition hover:brightness-95"
                >
                  <Download className="h-4 w-4" />
                  تحميل التطبيق
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}