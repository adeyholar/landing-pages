import Link from "next/link";
import { brand } from "@/lib/content";
export function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-top">
        <Link className="footer-wordmark" href="/">
          {brand.name}
          <span aria-hidden="true">↗</span>
        </Link>
        <p>
          {brand.tagline}
          <br />
          {brand.location}
        </p>
        <div>
          <Link href={brand.bookingPath}>{brand.bookingLabel}</Link>
          <Link href="/groups">
            {brand.slug === "crux" ? "Bring your crew" : "Private gatherings"}
          </Link>
          <Link href="/faq">Questions & answers</Link>
        </div>
      </div>
      <div className="footer-bottom">
        <p>© 2026 {brand.name} · A fictional brand, thoughtfully imagined.</p>
        <nav aria-label="Information">
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
          <Link href="/accessibility">Accessibility</Link>
          <Link href="/credits">Credits</Link>
        </nav>
      </div>
      <div className="footer-project">
        <p>
          Developed by <a href="https://lndev.me">LN</a>.
        </p>
        <a href="https://github.com/ln-dev7/landing-pages">
          Open-source code · MIT License
        </a>
        <a href="https://lndev.mychariow.shop/prd_3cu1s0">
          Support the project <span aria-hidden="true">↗</span>
        </a>
      </div>
    </footer>
  );
}
