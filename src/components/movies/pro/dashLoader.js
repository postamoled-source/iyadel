const DASH_CDN = "https://cdn.dashjs.org/latest/dash.all.min.js";

let pending = null;

// dash.js is only fetched the first time a DASH (mpd) stream is opened.
export function loadDash() {
  if (typeof window === "undefined") return Promise.reject(new Error("no window"));
  if (window.dashjs) return Promise.resolve(window.dashjs);
  if (!pending) {
    pending = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = DASH_CDN;
      script.async = true;
      script.onload = () => (window.dashjs ? resolve(window.dashjs) : reject(new Error("dashjs missing")));
      script.onerror = () => reject(new Error("dashjs failed to load"));
      document.head.appendChild(script);
    });
  }
  return pending;
}