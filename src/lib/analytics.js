// Google Analytics 4 helpers.
// Replace this Measurement ID with your real GA4 ID (G-XXXXXXXXXX) in:
//   src/lib/analytics.js AND index.html
import { useEffect } from "react";

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

// SEO hook: updates document title, meta description, and canonical URL per page.
export function useSeo({ title, description, image, path } = {}) {
  useEffect(() => {
    const base = "TestPeak";
    if (title) document.title = `${title} | ${base}`;

    if (description) {
      let tag = document.querySelector('meta[name="description"]');
      if (!tag) {
        tag = document.createElement("meta");
        tag.name = "description";
        document.head.appendChild(tag);
      }
      tag.content = description;
    }

    if (image) {
      let og = document.querySelector('meta[property="og:image"]');
      if (og) og.content = image;
    }

    if (path) {
      const url = `https://testpeak.net${path}`;
      const canon = document.querySelector('link[rel="canonical"]');
      if (canon) canon.href = url;
      const ogUrl = document.querySelector('meta[property="og:url"]');
      if (ogUrl) ogUrl.content = url;
    }
  }, [title, description, image, path]);
}