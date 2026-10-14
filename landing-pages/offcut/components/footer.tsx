"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useMotion } from "@/components/motion";
import { brand } from "@/lib/content";
export function Footer() {
  const { paused, toggle } = useMotion();
  return (
    <footer className="site-footer">
      <div className="footer-top">
        <Link className="footer-logo" href="/">
          {brand.name}
          <span aria-hidden="true">
            <svg
              viewBox="0 0 32 32"
              width="30"
              height="30"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M2 2h11v17h17v11H2V2Z" />
              <path d="M19 2h11v11H19z" />
            </svg>
          </span>
        </Link>
        <p>
          {brand.tagline}
          <br />
          <span className="muted">An independent idea. A fictional brand.</span>
        </p>
      </div>
      <div className="footer-links">
        <nav aria-label="Information">
          {["FAQ", "Privacy", "Terms", "Accessibility", "Credits"].map((x) => (
            <Link href={`/${x.toLowerCase()}`} key={x}>
              {x}
            </Link>
          ))}
        </nav>
        <Button variant="ghost" onClick={toggle} aria-pressed={paused}>
          {paused ? "Resume motion ↗︎" : "Pause motion Ⅱ"}
        </Button>
      </div>
      <div className="footer-credit">
        <span>
          Developed by{" "}
          <a href="https://lndev.me" target="_blank" rel="noopener">
            LN
          </a>
        </span>
        <a
          href="https://github.com/ln-dev7/landing-pages"
          target="_blank"
          rel="noopener"
        >
          Open-source code · MIT ↗︎
        </a>
        <a
          href="https://lndev.mychariow.shop/prd_3cu1s0"
          target="_blank"
          rel="noopener"
        >
          Support the project ♡
        </a>
      </div>
    </footer>
  );
}
