import { Link, useLocation } from "react-router-dom";
import { Home as HomeIcon, Newspaper, Info } from "lucide-react";

const ITEMS = [
  { to: "/", label: "Home", icon: HomeIcon },
  { to: "/Blog", label: "Blog", icon: Newspaper },
  { to: "/About", label: "About", icon: Info },
];

export default function MobileNav() {
  const { pathname } = useLocation();

  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-card/95 backdrop-blur-md border-t border-border select-none"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex items-stretch justify-around">
        {ITEMS.map(({ to, label, icon: Icon }) => {
          const active = to === "/" ? pathname === "/" : pathname.startsWith(to);
          return (
            <Link
              key={to}
              to={to}
              className="flex flex-1 flex-col items-center gap-1 py-2.5 transition-colors"
            >
              <Icon className={`w-5 h-5 ${active ? "text-primary" : "text-muted-foreground"}`} />
              <span className={`text-[11px] font-medium ${active ? "text-primary" : "text-muted-foreground"}`}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}