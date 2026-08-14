import Header from "./Header";
import Footer from "./Footer";
import MobileNav from "./MobileNav";
import AnimatedOutlet from "./AnimatedOutlet";
import ScrollMemory from "./ScrollMemory";

export default function Layout() {
  return (
    <div className="bg-background text-foreground min-h-screen">
      <Header />
      <main className="pb-20 md:pb-0">
        <AnimatedOutlet />
      </main>
      <ScrollMemory />
      <div className="hidden md:block">
        <Footer />
      </div>
      <MobileNav />
    </div>
  );
}