"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
const Context = createContext({ paused: false, toggle: () => {} });
export function useMotion() {
  return useContext(Context);
}
export function MotionProvider({ children }: { children: React.ReactNode }) {
  const [paused, setPaused] = useState(false);
  const path = usePathname();
  useEffect(() => {
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setPaused(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);
  useEffect(() => {
    document.documentElement.dataset.motion = paused ? "paused" : "on";
    if (paused) return;
    const nodes = [...document.querySelectorAll<HTMLElement>("[data-reveal]")];
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08 },
    );
    nodes.forEach((el, i) => {
      el.style.setProperty("--delay", `${(i % 3) * 70}ms`);
      el.classList.add("will-reveal");
      observer.observe(el);
    });
    const scenes = [...document.querySelectorAll<HTMLElement>("[data-scroll]")];
    let raf = 0;
    const update = () => {
      raf = 0;
      scenes.forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.bottom > 0 && r.top < innerHeight) {
          const p = (innerHeight - r.top) / (innerHeight + r.height);
          el.style.setProperty("--progress", String(p));
          el.style.setProperty("--shift", `${(p - 0.5) * 65}px`);
          el.style.setProperty("--turn", `${(p - 0.5) * 50}deg`);
        }
      });
    };
    const scroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    scroll();
    addEventListener("scroll", scroll, { passive: true });
    addEventListener("resize", scroll);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(raf);
      removeEventListener("scroll", scroll);
      removeEventListener("resize", scroll);
      nodes.forEach((el) => el.classList.remove("will-reveal"));
      scenes.forEach((el) => {
        el.style.removeProperty("--shift");
        el.style.removeProperty("--turn");
      });
    };
  }, [paused, path]);
  return (
    <Context.Provider value={{ paused, toggle: () => setPaused((v) => !v) }}>
      {children}
    </Context.Provider>
  );
}
