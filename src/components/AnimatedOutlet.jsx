import { useLocation, useOutlet } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

// Sliding page transitions between routes. Keyed by pathname only so that
// in-page navigation (e.g. selecting a tool via ?tool=) does not re-animate.
export default function AnimatedOutlet() {
  const location = useLocation();
  const outlet = useOutlet();
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, x: 24 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -24 }}
        transition={{ duration: 0.22, ease: "easeOut" }}
      >
        {outlet}
      </motion.div>
    </AnimatePresence>
  );
}