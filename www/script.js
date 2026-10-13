(() => {
  "use strict";
  const projects = window.PROJECTS || [];
  const root = document.documentElement;
  const repo =
    "https://github.com/ln-dev7/landing-pages/tree/master/landing-pages/";
  const ext = 'target="_blank" rel="noopener"';
  const esc = (value) =>
    String(value ?? "").replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c],
    );
  const pad = (n) => String(n).padStart(2, "0");
  const cards = projects.map((p, i) => {
    const source = p.source || repo + p.slug;
    const destination = p.url || `https://${p.slug}-lndev.vercel.app`;
    return `<article class="project reveal" id="${esc(p.slug)}" data-group="${esc(p.group)}">
      <a class="project__media" href="${esc(destination)}" ${ext} aria-label="Visit ${esc(p.name)}"><img src="${esc(p.image)}" alt="${esc(p.name)} homepage — ${esc(p.direction)}" width="1600" height="900" loading="lazy" decoding="async"><span class="media__cta">Visit site ↗</span></a>
      <div class="project__body"><div class="project__top"><h3><span class="project__num">${pad(i + 1)}</span>${esc(p.name)}</h3><span class="project__category">${esc(p.category)}</span></div><p class="project__desc">${esc(p.short)}</p></div>
      <div class="project__links"><a href="${esc(destination)}" ${ext}>Live preview <span aria-hidden="true">↗</span></a><a href="${esc(source)}" ${ext} aria-label="${esc(p.name)} source code">Source code <span aria-hidden="true">↗</span></a></div>
      <details><summary>Behind the design</summary><div class="project__details"><p>${esc(p.description)}</p><dl><div><dt>Type</dt><dd>${esc(p.type)}</dd></div><div><dt>Stack</dt><dd>${esc(p.stack.join(" · "))}</dd></div><div><dt>Palette</dt><dd class="swatches" aria-label="Color palette">${p.colors.map((c) => `<i style="--c:${esc(c)}" title="${esc(c)}"></i>`).join("")}</dd></div></dl></div></details></article>`;
  });
  document.querySelector("#projects").innerHTML = cards.join("");
  document
    .querySelectorAll("[data-year]")
    .forEach((el) => (el.textContent = new Date().getFullYear()));
  const filterButtons = document.querySelectorAll("[data-filter]");
  function filterProjects(group) {
    filterButtons.forEach((b) =>
      b.setAttribute("aria-pressed", String(b.dataset.filter === group)),
    );
    let count = 0;
    document.querySelectorAll(".project").forEach((card) => {
      card.hidden = group !== "all" && card.dataset.group !== group;
      if (!card.hidden) {
        count++;
        card.classList.add("is-in");
      }
    });
    document.querySelector("#filter-status").textContent =
      `${count} ${group === "all" ? "" : group + " "}projects`;
  }
  filterButtons.forEach((b) =>
    b.addEventListener("click", () => filterProjects(b.dataset.filter)),
  );
  const viewButton = document.querySelector(".view-toggle");
  viewButton.addEventListener("click", () => {
    const index = document
      .querySelector("#projects")
      .classList.toggle("is-index");
    viewButton.setAttribute("aria-pressed", String(index));
    viewButton.innerHTML = index
      ? '<span aria-hidden="true">⊞</span> Gallery view'
      : '<span aria-hidden="true">☷</span> Index view';
  });
  const themeButton = document.querySelector(".theme-toggle");
  function syncTheme() {
    themeButton.setAttribute(
      "aria-label",
      `Switch to ${root.dataset.theme === "dark" ? "light" : "dark"} mode`,
    );
  }
  themeButton.addEventListener("click", () => {
    root.dataset.theme = root.dataset.theme === "dark" ? "light" : "dark";
    try {
      localStorage.setItem("theme", root.dataset.theme);
    } catch {}
    syncTheme();
  });
  syncTheme();
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  let paused = false;
  const featureStage = document.querySelector(".hero__display");
  const featuredCards = [...featureStage.querySelectorAll(".feature-card")];
  const featurePositions = ["front", "next", "back"];
  let featureIndex = 0;
  let featureTimer;
  let featureVisible = false;
  let featureHovered = false;

  function scheduleFeature() {
    clearTimeout(featureTimer);
    if (
      paused ||
      reduced.matches ||
      document.hidden ||
      !featureVisible ||
      featureHovered ||
      featureStage.contains(document.activeElement) ||
      featuredCards.length < 2
    )
      return;
    featureTimer = setTimeout(() => {
      featuredCards[featureIndex].classList.add("is-departing");
      featureIndex = (featureIndex + 1) % featuredCards.length;
      featuredCards.forEach((card, index) => {
        const position =
          (index - featureIndex + featuredCards.length) % featuredCards.length;
        card.dataset.featurePosition = featurePositions[position];
        card.inert = position !== 0;
        card.tabIndex = position === 0 ? 0 : -1;
        if (position === 0) card.removeAttribute("aria-hidden");
        else card.setAttribute("aria-hidden", "true");
      });
      scheduleFeature();
    }, 5000);
  }

  featureStage.addEventListener("animationend", (event) => {
    if (event.animationName === "feature-depart") {
      event.target.classList.remove("is-departing");
    }
  });
  featureStage.addEventListener("pointerenter", (event) => {
    if (event.pointerType === "touch") return;
    featureHovered = true;
    scheduleFeature();
  });
  featureStage.addEventListener("pointerleave", () => {
    featureHovered = false;
    scheduleFeature();
  });
  featureStage.addEventListener("focusin", scheduleFeature);
  featureStage.addEventListener("focusout", () => {
    queueMicrotask(scheduleFeature);
  });
  featureStage.addEventListener("click", (event) => {
    if (event.target.closest(".feature-card")) filterProjects("all");
  });
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(
      ([entry]) => {
        featureVisible = entry.isIntersecting && entry.intersectionRatio >= 0.2;
        scheduleFeature();
      },
      { threshold: 0.2 },
    ).observe(featureStage);
  } else {
    featureVisible = true;
  }
  addEventListener("pagehide", () => clearTimeout(featureTimer));
  addEventListener("pageshow", scheduleFeature);
  addEventListener("hashchange", scheduleFeature);
  const motionButton = document.querySelector(".motion-toggle");
  function syncMotion() {
    const still = paused || reduced.matches;
    root.dataset.motion = still ? "still" : "full";
    if (still)
      featuredCards.forEach((card) => card.classList.remove("is-departing"));
    motionButton.setAttribute("aria-pressed", String(still));
    motionButton.setAttribute(
      "aria-label",
      reduced.matches
        ? "Reduced motion is enabled in your system"
        : still
          ? "Resume animations"
          : "Pause animations",
    );
    motionButton.title = reduced.matches
      ? "System reduced motion is enabled"
      : still
        ? "Resume animations"
        : "Pause animations";
    motionButton.textContent = still ? "▷" : "Ⅱ";
    motionButton.disabled = reduced.matches;
    scheduleFeature();
  }
  motionButton.addEventListener("click", () => {
    paused = !paused;
    syncMotion();
  });
  reduced.addEventListener("change", syncMotion);
  syncMotion();
  document.addEventListener("visibilitychange", () => {
    scheduleFeature();
    document.querySelector(".ticker__track").style.animationPlayState =
      document.hidden ? "paused" : "";
  });
  const nav = document.querySelector(".nav");
  let queued = false;
  addEventListener(
    "scroll",
    () => {
      if (!queued) {
        queued = true;
        requestAnimationFrame(() => {
          nav.classList.toggle("is-scrolled", scrollY > 8);
          queued = false;
        });
      }
    },
    { passive: true },
  );
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            observer.unobserve(e.target);
          }
        }),
      { threshold: 0.04 },
    );
    root.classList.add("motion-ready");
    document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
  }
  const copy = document.querySelector(".copy-button");
  let copyTimer;
  copy.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(
        "git clone https://github.com/ln-dev7/landing-pages.git\ncd landing-pages\ncd landing-pages/fallow\npnpm install\npnpm dev",
      );
      copy.textContent = "Copied ✓";
      document.querySelector("#copy-status").textContent = "Commands copied";
    } catch {
      document.querySelector("#copy-status").textContent =
        "Select the commands to copy them.";
    }
    clearTimeout(copyTimer);
    copyTimer = setTimeout(() => {
      copy.textContent = "Copy ↗";
      document.querySelector("#copy-status").textContent = "";
    }, 3000);
  });
})();
