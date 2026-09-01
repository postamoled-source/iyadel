import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Package, Download, ChevronLeft } from "lucide-react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { useI18n } from "@/lib/i18n";
import { Image } from "@/components/ui/image";

// App-store preview shown as a section on the Home page.
export default function AppStoreSection() {
  const { t } = useI18n();
  const [apps, setApps] = useState(null);

  useEffect(() => {
    let alive = true;
    base44.entities.AppStoreApp.list("-created_date", 8)
      .then((rows) => alive && setApps(rows))
      .catch(() => alive && setApps([]));
    return () => { alive = false; };
  }, []);

  const items = (apps || []).slice(0, 8);

  return (
    <section className="bg-[#FFFBEB] dark:bg-[#1E1B4B] transition-colors duration-300 py-16" id="app-store">
      <div className="max-w-5xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "0px 0px 80px 0px" }}
          transition={{ duration: 0.5 }}
          className="flex items-end justify-between gap-4 mb-8"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#6D28D9] to-[#F59E0B] flex items-center justify-center shadow-[0_8px_20px_rgba(109,40,217,0.25)]">
              <Package className="w-6 h-6 text-white" strokeWidth={2.2} />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#111827] dark:text-[#FEF3C7]">{t("App Store")}</h2>
              <p className="text-sm text-[#6B7280] dark:text-[#A8A6C4] mt-1">{t("Download our apps — fast, safe and free")}</p>
            </div>
          </div>
          <Link
            to="/app-store"
            className="shrink-0 inline-flex items-center gap-1 text-sm font-bold text-primary hover:gap-2 transition-all"
          >
            {t("View All")}
            <ChevronLeft className="w-4 h-4" />
          </Link>
        </motion.div>

        {/* Loading skeletons */}
        {apps === null ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-52 animate-pulse rounded-[20px] bg-white/60 dark:bg-[#2D2A5A]/60" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-[2rem] bg-white dark:bg-[#2D2A5A] border border-[#F3F4F6] dark:border-[#4B3F8A] p-10 text-center">
            <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-card-foreground text-lg font-medium">{t("No apps yet")}</p>
            <p className="text-muted-foreground mt-2 text-sm">{t("New apps will appear here soon.")}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {items.map((app, i) => (
              <motion.div
                key={app.id}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "0px 0px 60px 0px" }}
                transition={{ duration: 0.4, delay: Math.min(i * 0.05, 0.3) }}
              >
                <div className="relative h-full flex flex-col items-center text-center rounded-[20px] bg-white dark:bg-[#2D2A5A] border border-[#F3F4F6] dark:border-[#4B3F8A] p-4 transition-all duration-300 shadow-[0_4px_12px_rgba(109,40,217,0.08)] hover:-translate-y-1 hover:shadow-[0_10px_26px_rgba(109,40,217,0.15)]">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden bg-[#F3F4F6] dark:bg-[#1E1B4B] mb-4 shadow-sm">
                    {app.icon_url ? (
                      <Image src={app.icon_url} alt={app.name} fittingType="fill" className="w-full h-full" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        <Package className="w-7 h-7" />
                      </div>
                    )}
                  </div>
                  <h3 className="text-base font-bold text-[#111827] dark:text-[#FEF3C7] mb-0.5 line-clamp-1">{app.name}</h3>
                  {app.category && (
                    <span className="text-[11px] font-semibold text-primary bg-primary/10 rounded-full px-2.5 py-0.5 mb-2">{app.category}</span>
                  )}
                  <p className="text-xs text-[#6B7280] dark:text-[#A8A6C4] line-clamp-2 mb-3">{app.description}</p>
                  {app.apk_url ? (
                    <a
                      href={app.apk_url}
                      download
                      className="mt-auto inline-flex items-center justify-center gap-1.5 rounded-full bg-gradient-to-r from-[#6D28D9] to-[#8B5CF6] text-white px-5 py-2 text-xs font-bold shadow-sm hover:shadow-md transition-all w-full"
                    >
                      <Download className="w-3.5 h-3.5" />
                      {t("Download")}
                    </a>
                  ) : (
                    <span className="mt-auto inline-flex items-center justify-center rounded-full bg-secondary text-muted-foreground px-5 py-2 text-xs font-medium w-full">
                      {t("Coming soon")}
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}