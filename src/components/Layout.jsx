import { useSearchParams } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import MobileNav from "./MobileNav";
import AnimatedOutlet from "./AnimatedOutlet";
import ScrollMemory from "./ScrollMemory";
import HashScroll from "./HashScroll";

export default function Layout() {
  const [searchParams] = useSearchParams();
  const toolOpen = !!searchParams.get("tool");
  return (
    <div className="bg-background text-foreground min-h-screen">
      <div className={toolOpen ? "hidden sm:block" : ""}>
        <Header />
      </div>
      <main className="pb-20 md:pb-0">
        <AnimatedOutlet />
      </main>
      <ScrollMemory />
      <HashScroll />
      <div className="hidden md:block">
        <Footer />
      </div>
      <MobileNav />
    </div>
  );
}