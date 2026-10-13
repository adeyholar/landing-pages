// Vercel Web Analytics for the static showcase. Enable Analytics in Vercel
// and redeploy www/ to make /_vercel/insights/script.js available.
(() => {
  window.va = window.va || function () {
    (window.vaq = window.vaq || []).push(arguments);
  };

  // Local previews have no Vercel endpoint and must not count as visits.
  if (location.protocol === "file:" || ["localhost", "127.0.0.1", "[::1]"].includes(location.hostname)) return;
  if (document.querySelector('script[src="/_vercel/insights/script.js"]')) return;

  const script = document.createElement("script");
  script.defer = true;
  script.src = "/_vercel/insights/script.js";
  document.head.appendChild(script);
})();
