(() => {
  const projects = window.PROJECTS || [];

  // ---------- Render ----------
  const esc = (value) =>
    String(value ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const pad = (n) => String(n).padStart(2, "0");
  const host = (url) => url.replace(/^https?:\/\//, "").replace(/\/$/, "");
  const ext = 'target="_blank" rel="noopener"';

  const spec = (label, value) => (value ? `<div><dt>${label}</dt><dd>${value}</dd></div>` : "");

  const card = (p, i) => {
    const swatches = (p.colors || [])
      .map((c) => `<i style="--c: ${esc(c)}" title="${esc(c)}"></i>`)
      .join("");
    const logo = p.logo ? `<img src="${esc(p.logo)}" alt="" width="28" height="28" />` : "";

    return `
      <article class="project reveal" id="${esc(p.slug)}">
        <a class="media" href="${esc(p.url)}" ${ext} aria-label="Open the ${esc(p.name)} live site">
          <img src="${esc(p.image)}" alt="${esc(p.name)} landing page" width="1600" height="900"
            loading="${i === 0 ? "eager" : "lazy"}" decoding="async" />
          <span class="media__cta">Visit site <span aria-hidden="true">↗</span></span>
        </a>
        <div class="project__body">
          <div class="project__id">
            <span class="project__num">${pad(i + 1)}</span>
            <h3 class="project__name">${logo}${esc(p.name)}</h3>
            ${p.direction ? `<p class="project__kind" data-subject="${esc(p.category)}">${esc(p.direction)}</p>` : ""}
          </div>
          ${p.description ? `<p class="project__desc">${esc(p.description)}</p>` : "<span></span>"}
          <dl class="specs">
            ${spec("Subject", esc(p.category))}
            ${spec("Type", esc(p.type))}
            ${spec("Stack", esc((p.stack || []).join(", ")))}
            ${swatches ? spec("Palette", `<span class="swatches">${swatches}</span>`) : ""}
          </dl>
          <a class="link" href="${esc(p.url)}" ${ext}>${esc(host(p.url))} <span aria-hidden="true">↗</span></a>
        </div>
      </article>`;
  };

  const row = (p, i) => `
    <tr>
      <th scope="row"><a href="#${esc(p.slug)}"><span class="num">${pad(i + 1)}</span>${esc(p.name)}</a></th>
      <td>${esc(p.category)}</td>
      <td>${esc(p.direction)}</td>
      <td>${esc(p.type)}</td>
      <td><a class="go" href="${esc(p.url)}" ${ext} aria-label="Visit ${esc(p.name)}">↗</a></td>
    </tr>`;

  const list = document.getElementById("projects");
  if (projects.length) list.innerHTML = projects.map(card).join("");
  document.getElementById("index-rows").innerHTML = projects.map(row).join("");

  const directions = new Set(projects.map((p) => p.direction).filter(Boolean)).size;
  document.querySelectorAll("[data-count]").forEach((el) => (el.textContent = pad(projects.length)));
  document.querySelectorAll("[data-directions]").forEach((el) => (el.textContent = pad(directions)));
  document.querySelectorAll("[data-year]").forEach((el) => (el.textContent = new Date().getFullYear()));

  // ---------- Preferences (theme, layout) ----------
  const root = document.documentElement;
  // Saved choices are read back by the inline script in <head>, before paint.
  const save = (key, value) => {
    try {
      localStorage.setItem(key, value);
    } catch {}
  };

  const systemDark = window.matchMedia("(prefers-color-scheme: dark)");
  const themeToggle = document.querySelector(".theme-toggle");
  const currentTheme = () => root.dataset.theme || (systemDark.matches ? "dark" : "light");
  const syncThemeLabel = () => {
    const next = currentTheme() === "dark" ? "light" : "dark";
    themeToggle.setAttribute("aria-label", `Switch to ${next} mode`);
  };
  themeToggle.addEventListener("click", () => {
    const next = currentTheme() === "dark" ? "light" : "dark";
    root.dataset.theme = next;
    save("theme", next);
    syncThemeLabel();
  });
  systemDark.addEventListener("change", syncThemeLabel);
  syncThemeLabel();

  const viewButtons = document.querySelectorAll(".view-switch button");
  const setView = (view) => {
    if (view === "grid") root.dataset.view = "grid";
    else delete root.dataset.view;
    viewButtons.forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.view === view)));
  };
  viewButtons.forEach((button) =>
    button.addEventListener("click", () => {
      setView(button.dataset.view);
      save("view", button.dataset.view);
    })
  );
  setView(root.dataset.view === "grid" ? "grid" : "list");

  // ---------- Nav border once the page scrolls ----------
  const nav = document.querySelector(".nav");
  const onScroll = () => nav.classList.toggle("is-scrolled", window.scrollY > 8);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  // ---------- Reveal on scroll ----------
  const reveals = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window)) {
    reveals.forEach((el) => el.classList.add("is-in"));
    return;
  }

  const revealer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-in");
        revealer.unobserve(entry.target);
      });
    },
    { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
  );
  reveals.forEach((el) => revealer.observe(el));
})();
