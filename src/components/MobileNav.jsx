import { Link, useLocation } from "react-router-dom";
import { useI18n } from "@/lib/i18n";
import { Home as HomeIcon, Wrench, Newspaper, Info } from "lucide-react";

const ITEMS = [
  { to: "/", label: "Home", icon: HomeIcon },
  { to: "/#tools", label: "Tools", icon: Wrench },
  { to: "/Blog", label: "Blog", icon: Newspaper },
  { to: "/About", label: "About", icon: Info },
];

export default function MobileNav() {
  const { pathname, hash } = useLocation();
  const { t } = useI18n();

  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-card/95 backdrop-blur-md border-t border-border select-none"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex items-stretch justify-around px-1">
        {ITEMS.map(({ to, label, icon: Icon }) => {
          const active = to === "/#tools"
            ? pathname === "/" && hash === "#tools"
            : to === "/"
              ? pathname === "/" && !hash
              : pathname.startsWith(to);
          return (
            <Link
              key={label}
              to={to}
              aria-label={t(label)}
              className="relative flex flex-1 flex-col items-center justify-center gap-1 py-2.5 min-h-[56px] transition-colors active:scale-95"
            >
              <span
                className={`absolute top-1.5 h-1 w-6 rounded-full transition-all duration-300 ${active ? "bg-[#6D28D9] opacity-100" : "opacity-0"}`}
              />
              <Icon
                className={`w-6 h-6 transition-all duration-300 ${active ? "text-[#6D28D9] scale-110" : "text-[#6B7280]"}`}
                strokeWidth={active ? 2.5 : 2}
              />
              <span
                className={`text-[11px] font-medium transition-colors ${active ? "text-[#6D28D9]" : "text-[#6B7280]"}`}
              >
                {t(label)}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}