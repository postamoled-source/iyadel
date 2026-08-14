// Google Analytics 4 helpers.
// Replace this Measurement ID with your real GA4 ID (G-XXXXXXXXXX) in:
//   src/lib/analytics.js AND index.html
export const GA_MEASUREMENT_ID = "G-XXXXXXXXXX";

export function trackPageView(path) {
  if (typeof window !== "undefined" && typeof window.gtag === "function" && path) {
    window.gtag("config", GA_MEASUREMENT_ID, { page_path: path });
  }
}

export function trackEvent(eventName, params = {}) {
  if (typeof window !== "undefined" && typeof window.gtag === "function") {
    window.gtag("event", eventName, params);
  }
}