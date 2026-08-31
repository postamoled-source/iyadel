import { Link } from "react-router-dom";
import { useI18n } from "@/lib/i18n";
import { Square, ChevronRight } from "lucide-react";

export default function PrivacyTeaser() {
  const { t } = useI18n();
  return (
    <section className="bg-background pb-20">
      <div className="max-w-5xl mx-auto px-6">
        <div className="rounded-[3rem] bg-card border border-border p-10 md:p-14 shadow-2xl relative overflow-hidden">
          <div className="flex items-center gap-3 mb-2">
            <Square className="w-6 h-6 text-primary stroke-[2.5]" />
            <h2 className="text-2xl sm:text-3xl font-extrabold text-card-foreground">{t("Privacy Policy")}</h2>
          </div>
          <p className="text-xs text-muted-foreground mb-8 uppercase tracking-wider">{t("Last Updated: August 15, 2026")}</p>
          <div className="space-y-6 text-sm text-muted-foreground">
            <p>{t("At iyadel, your privacy comes first. We don't track you, we don't profile you, and most tools run entirely in your browser. This policy explains how the platform handles data.")}</p>
            <div>
              <strong className="text-foreground text-base block mb-1">{t("1. We Don't Track You")}</strong>
              <p>{t("iyadel uses no Google Analytics or third-party trackers. We do not record which tools you use or set tracking cookies.")}</p>
            </div>
            <div>
              <strong className="text-foreground text-base block mb-1">{t("2. Local-First Processing")}</strong>
              <p>{t("Calculators, converters, and image tools run in your browser. Only the AI Logo Maker and admin blog uploads use our servers, and only when you actively use them.")}</p>
            </div>
            <div className="pt-4">
              <Link to="/Privacy" className="inline-flex items-center text-primary font-bold hover:text-primary/80 transition-colors">
                {t("Read full policy")} <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}