import { Link } from "react-router-dom";
import { useI18n } from "@/lib/i18n";
import { Mail, Facebook, Twitter, Instagram } from "lucide-react";
import { LOGO_URL } from "@/data/tools";

export default function Footer() {
  const { t } = useI18n();

  return (
    <footer className="bg-foreground text-background border-t border-border/20">
      <div className="max-w-6xl mx-auto px-6 py-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <img src={LOGO_URL} alt="iyadel" className="w-9 h-9 rounded-xl object-cover" />
            <span className="font-bold text-lg text-background">{t("iyadel Platform")}</span>
          </div>
          <p className="text-sm text-background/70 mb-6 leading-relaxed">
            {t("31+ interactive and accurate tools in one place — designed to simplify your daily life.")}
          </p>
          <div className="flex flex-col gap-3">
            <a href="https://play.google.com/store/apps/details?id=com.iyadel.app" target="_blank" rel="noopener noreferrer" aria-label="Download on Google Play">
              <img src="https://media.base44.com/images/public/6a7e76e3396b41955b675542/bb97dab8b_upload_wikimedia_org_Google_Play_Store_badge_EN_71dd6782.svg" alt="Google Play" className="h-10 w-auto" />
            </a>
            <a href="https://apps.apple.com/app/iyadel/id123456789" target="_blank" rel="noopener noreferrer" aria-label="Download on the App Store">
              <img src="https://media.base44.com/images/public/6a7e76e3396b41955b675542/3b49c5788_upload_wikimedia_org_Download_on_the_App_Store_Badge_136769b5.svg" alt="App Store" className="h-10 w-auto" />
            </a>
            <a href="https://fazier.com/launches/iyadel.com" target="_blank" rel="noopener noreferrer" className="mt-2 inline-block">
              <img src="https://fazier.com/api/v1//public/badges/launch_badges.svg?badge_type=launched&theme=light" width={120} alt="Fazier badge" className="h-10 w-auto" />
            </a>
            <a href="https://submitaitools.org" target="_blank" rel="noopener noreferrer" className="mt-2 inline-block">
              <img src="https://submitaitools.org/static_submitaitools/images/submitaitools.png" alt="Submit AI Tools" style={{ borderRadius: "10px", width: "200px", height: "60px" }} />
            </a>
          </div>
        </div>

        <div>
          <h4 className="font-bold text-background mb-4">{t("Quick Links")}</h4>
          <ul className="space-y-3 text-sm">
            <li><Link to="/About" className="text-background/70 hover:text-accent transition-colors">{t("About Us")}</Link></li>
            <li><Link to="/About" className="text-background/70 hover:text-accent transition-colors">{t("Privacy Policy")}</Link></li>
            <li><a href="mailto:support@iyadel.net" className="text-background/70 hover:text-accent transition-colors">{t("Contact Us")}</a></li>
            <li><Link to="/Blog" className="text-background/70 hover:text-accent transition-colors">{t("Blog")}</Link></li>
            <li><Link to="/Dashboard" className="text-background/70 hover:text-accent transition-colors">{t("Usage Dashboard")}</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-background mb-4">{t("Categories")}</h4>
          <ul className="space-y-3 text-sm">
            <li><Link to="/" className="text-background/70 hover:text-accent transition-colors">{t("Finance Tools")}</Link></li>
            <li><Link to="/" className="text-background/70 hover:text-accent transition-colors">{t("Health Tools")}</Link></li>
            <li><Link to="/" className="text-background/70 hover:text-accent transition-colors">{t("Converters")}</Link></li>
            <li><Link to="/" className="text-background/70 hover:text-accent transition-colors">{t("Brain Games")}</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-background mb-4">{t("Social")}</h4>
          <div className="flex gap-3 mb-5">
            <a href="#" aria-label="Facebook" className="w-9 h-9 rounded-full bg-background/10 flex items-center justify-center hover:bg-primary transition-colors"><Facebook className="w-4 h-4 text-background" /></a>
            <a href="#" aria-label="Twitter" className="w-9 h-9 rounded-full bg-background/10 flex items-center justify-center hover:bg-primary transition-colors"><Twitter className="w-4 h-4 text-background" /></a>
            <a href="#" aria-label="Instagram" className="w-9 h-9 rounded-full bg-background/10 flex items-center justify-center hover:bg-primary transition-colors"><Instagram className="w-4 h-4 text-background" /></a>
          </div>
          <a href="mailto:support@iyadel.net" className="flex items-center gap-2 text-sm text-background/70 hover:text-accent transition-colors">
            <Mail className="w-4 h-4" /> support@iyadel.net
          </a>
        </div>
      </div>
      <div className="border-t border-background/10">
        <div className="max-w-6xl mx-auto px-6 py-5 text-center text-xs text-background/60">
          {t("2026 iyadel — All Rights Reserved")}
        </div>
      </div>
    </footer>
  );
}