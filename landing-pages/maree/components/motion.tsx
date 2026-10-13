"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { brand } from "@/lib/content";

/** Progressive enhancement: no hidden content until observers are ready. */
export function MotionSetup() {
  const path = usePathname();
  useEffect(() => {
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    let dispose = () => {};
    const start = () => {
      dispose();
      if (media.matches || !("IntersectionObserver" in window)) return;
      const crux = brand.slug === "crux";
      const targets = Array.from(
        document.querySelectorAll<HTMLElement>(
          [
            "[data-reveal] h2",
            "[data-reveal] .eyebrow",
            "[data-reveal] > p:not(.eyebrow)",
            ".intro-bottom > p",
            ".place-description > *",
            ".pass-card",
            ".small-things [data-slot=card]",
            ".wall-canvas",
            ".ritual-visual",
            ".gather-image",
            ".crew-photo",
            ".crew-copy > p:not(.eyebrow)",
            ".crew-copy > .button",
            ".gather-copy > p:not(.eyebrow)",
            ".gather-copy > .button",
            ".faq-section [data-slot=accordion-item]",
            ".crux-final > .circle-cta",
            ".maree-final > .button",
            ".pause-section",
            ".booking-summary",
            ".group-form",
            ".session-row",
            ".visit-selector",
          ].join(","),
        ),
      );
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach(({ target, isIntersecting }) => {
            if (isIntersecting) {
              target.classList.add("motion-in");
              observer.unobserve(target);
            }
          });
        },
        { threshold: 0.12, rootMargin: "0px 0px -32px 0px" },
      );
      targets.forEach((node) => {
        const rect = node.getBoundingClientRect();
        // Never hide content above the viewport after restored scroll/navigation.
        if (rect.top < innerHeight * 0.92) return;
        node.classList.add("motion-ready");
        const siblings = Array.from(node.parentElement?.children ?? []).filter(
          (n) => targets.includes(n as HTMLElement),
        );
        node.style.setProperty(
          "--reveal-delay",
          `${Math.min(siblings.indexOf(node), 3) * (crux ? 90 : 130)}ms`,
        );
        observer.observe(node);
      });
      // Scroll work is coalesced into one frame; only visible scenes are updated.
      const scenes = Array.from(
        document.querySelectorAll<HTMLElement>(
          crux
            ? ".crux-hero, .club-strip, .intro-section, .crew-section, .crux-final"
            : ".maree-hero, .place-section, .ritual-section, .gather-section, .maree-final",
        ),
      );
      const visible = new Set<HTMLElement>();
      const sceneObserver = new IntersectionObserver(
        (entries) =>
          entries.forEach((e) => {
            if (e.isIntersecting) visible.add(e.target as HTMLElement);
            else visible.delete(e.target as HTMLElement);
            schedule();
          }),
        { rootMargin: "100px" },
      );
      let frame = 0;
      const update = () => {
        frame = 0;
        visible.forEach((node) => {
          const rect = node.getBoundingClientRect();
          const progress = Math.max(
            -1,
            Math.min(
              1,
              (innerHeight / 2 - rect.top - rect.height / 2) /
                (innerHeight / 2 + rect.height / 2),
            ),
          );
          node.style.setProperty(
            "--scroll-shift",
            `${progress * (crux ? 65 : 38)}px`,
          );
          node.style.setProperty(
            "--scroll-turn",
            `${progress * (crux ? 150 : 45)}deg`,
          );
        });
        const available = document.documentElement.scrollHeight - innerHeight;
        document.documentElement.style.setProperty(
          "--page-progress",
          String(available > 0 ? scrollY / available : 0),
        );
      };
      function schedule() {
        if (!frame) frame = requestAnimationFrame(update);
      }
      scenes.forEach((node) => sceneObserver.observe(node));
      document.documentElement.classList.add("motion-enabled");
      window.addEventListener("scroll", schedule, { passive: true });
      window.addEventListener("resize", schedule, { passive: true });
      schedule();
      // A small physical response, only for precise pointers. Never move hit targets.
      const tilts = Array.from(
        document.querySelectorAll<HTMLElement>(
          crux ? ".wall-canvas, .pass-card" : ".gather-note, .visit-detail",
        ),
      );
      const fine = matchMedia("(hover: hover) and (pointer: fine)");
      const move = (event: PointerEvent) => {
        if (!fine.matches || event.pointerType === "touch") return;
        const node = event.currentTarget as HTMLElement;
        const rect = node.getBoundingClientRect();
        node.style.setProperty(
          "--tilt-x",
          `${((event.clientX - rect.left - rect.width / 2) / rect.width) * 3}deg`,
        );
        node.style.setProperty(
          "--tilt-y",
          `${(-(event.clientY - rect.top - rect.height / 2) / rect.height) * 3}deg`,
        );
      };
      const reset = (event: PointerEvent) => {
        const node = event.currentTarget as HTMLElement;
        node.style.removeProperty("--tilt-x");
        node.style.removeProperty("--tilt-y");
      };
      tilts.forEach((node) => {
        node.classList.add("motion-tilt");
        node.addEventListener("pointermove", move);
        node.addEventListener("pointerleave", reset);
      });
      dispose = () => {
        observer.disconnect();
        sceneObserver.disconnect();
        cancelAnimationFrame(frame);
        window.removeEventListener("scroll", schedule);
        window.removeEventListener("resize", schedule);
        document.documentElement.classList.remove("motion-enabled");
        document.documentElement.style.removeProperty("--page-progress");
        targets.forEach((node) => {
          node.classList.remove("motion-ready", "motion-in");
          node.style.removeProperty("--reveal-delay");
        });
        scenes.forEach((node) => {
          node.style.removeProperty("--scroll-shift");
          node.style.removeProperty("--scroll-turn");
        });
        tilts.forEach((node) => {
          node.classList.remove("motion-tilt");
          node.style.removeProperty("--tilt-x");
          node.style.removeProperty("--tilt-y");
          node.removeEventListener("pointermove", move);
          node.removeEventListener("pointerleave", reset);
        });
      };
    };
    start();
    media.addEventListener("change", start);
    return () => {
      dispose();
      media.removeEventListener("change", start);
    };
  }, [path]);
  return <div className="reading-progress" aria-hidden="true" />;
}
