import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
const sans = localFont({
  src: "./fonts/Manrope.ttf",
  variable: "--font-sans",
  display: "swap",
});
const serif = localFont({
  src: [
    { path: "./fonts/CormorantGaramond.ttf", style: "normal" },
    { path: "./fonts/CormorantGaramond-Italic.ttf", style: "italic" },
  ],
  variable: "--font-serif",
  display: "swap",
});
const origin = process.env.NEXT_PUBLIC_SITE_URL;
export const metadata: Metadata = {
  metadataBase: origin ? new URL(origin) : undefined,
  alternates: origin ? { canonical: origin } : undefined,
  title: "FALLOW — A small world, waiting",
  description:
    "An interactive botanical daydream. Wake a seed, follow its roots, and leave something growing.",
  robots: { index: false, follow: true },
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${serif.variable}`}>
      <body>
        <noscript>
          <style>{`.roots{background:#59414d}.garden-loader{display:none!important}.garden-content{visibility:visible!important}html:has(.garden-loader),body:has(.garden-loader){overflow:auto!important}.skip{visibility:visible!important}`}</style>
        </noscript>
        <a className="skip" href="#story">
          Skip to the story
        </a>
        {children}
      </body>
    </html>
  );
}
