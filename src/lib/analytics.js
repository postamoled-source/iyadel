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

// SEO hook: updates document title, meta description, canonical URL, and
// Open Graph / Twitter tags per page. Pass `noindex: true` for private pages
// (auth, admin) so search engines don't index them.
const SITE_NAME = "iyadel";
const SITE_URL = "https://iyadel.com";

function upsertMeta(selector, attrs) {
  let tag = document.querySelector(selector);
  if (!tag) {
    tag = document.createElement("meta");
    document.head.appendChild(tag);
  }
  for (const [k, v] of Object.entries(attrs)) tag.setAttribute(k, v);
  return tag;
}

export function useSeo({ title, description, image, path, noindex, keywords, rawTitle } = {}) {
  useEffect(() => {
    const fullTitle = title
      ? (rawTitle ? title : `${title} | ${SITE_NAME}`)
      : `${SITE_NAME} — Free Online Calculators, Converters & Image Tools`;
    document.title = fullTitle;

    if (keywords) {
      upsertMeta('meta[name="keywords"]', { name: "keywords", content: keywords });
    }

    if (description) {
      upsertMeta('meta[name="description"]', { name: "description", content: description });
      upsertMeta('meta[property="og:description"]', { property: "og:description", content: description });
      upsertMeta('meta[name="twitter:description"]', { name: "twitter:description", content: description });
    }

    upsertMeta('meta[property="og:title"]', { property: "og:title", content: fullTitle });
    upsertMeta('meta[name="twitter:title"]', { name: "twitter:title", content: fullTitle });

    if (image) {
      upsertMeta('meta[property="og:image"]', { property: "og:image", content: image });
      upsertMeta('meta[name="twitter:image"]', { name: "twitter:image", content: image });
    }

    if (path) {
      const url = `${SITE_URL}${path}`;
      const canon = document.querySelector('link[rel="canonical"]');
      if (canon) canon.href = url;
      upsertMeta('meta[property="og:url"]', { property: "og:url", content: url });
      upsertMeta('meta[name="twitter:url"]', { name: "twitter:url", content: url });
    }

    upsertMeta('meta[name="robots"]', {
      name: "robots",
      content: noindex
        ? "noindex, nofollow"
        : "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
    });
  }, [title, description, image, path, noindex, keywords, rawTitle]);
}