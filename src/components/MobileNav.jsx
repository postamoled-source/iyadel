import { Link, useLocation, useNavigate } from "react-router-dom";
import { useI18n } from "@/lib/i18n";
import { Home as HomeIcon, Wrench, Newspaper, Info } from "lucide-react";

const ITEMS = [
  { to: "/", label: "Home", icon: HomeIcon, target: null },
  { to: "/#tools", label: "Tools", icon: Wrench, target: "tools" },
  { to: "/Blog", label: "Blog", icon: Newspaper, target: null },
  { to: "/About", label: "About", icon: Info, target: null },
];

export default function MobileNav() {
  const { pathname } = useLocation();
  const { t } = useI18n();
  const navigate = useNavigate();

  const scrollToTools = () => {
    const el = document.getElementById("tools");
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - 64;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  const handleClick = (item, e) => {
    if (!item.target) return;
    e.preventDefault();
    if (pathname === "/") {
      scrollToTools();
    } else {
      navigate("/");
      setTimeout(scrollToTools, 350);
    }
  };

  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-card/95 backdrop-blur-md border-t border-border select-none"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex items-stretch justify-around px-1">
        {ITEMS.map(({ to, label, icon: Icon, target }) => {
          const active = to === "/"
            ? pathname === "/" && !target
            : pathname.startsWith(to);
          return (
            <Link
              key={label}
              to={to}
              onClick={(e) => handleClick({ to, label, icon: Icon, target }, e)}
              aria-label={t(label)}
              className="relative flex flex-1 flex-col items-center justify-center gap-1 py-2.5 min-h-[56px] transition-colors active:scale-95"
            >
              <span
                className={`absolute top-1.5 h-1 w-6 rounded-full transition-all duration-300 ${active ? "bg-primary opacity-100" : "opacity-0"}`}
              />
              <Icon
                className={`w-6 h-6 transition-all duration-300 ${active ? "text-primary scale-110" : "text-muted-foreground"}`}
                strokeWidth={active ? 2.5 : 2}
              />
              <span
                className={`text-[11px] font-medium transition-colors ${active ? "text-primary" : "text-muted-foreground"}`}
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