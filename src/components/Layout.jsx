import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import MobileNav from "./MobileNav";

export default function Layout() {
  return (
    <div className="bg-background text-foreground min-h-screen">
      <Header />
      <main className="pb-20 md:pb-0">
        <Outlet />
      </main>
      <div className="hidden md:block">
        <Footer />
      </div>
      <MobileNav />
    </div>
  );
}