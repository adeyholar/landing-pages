"use client";
import Link from "next/link";
import { useState } from "react";
import { ArrowUpRight, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { brand, nav } from "@/lib/content";
export function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header className="site-header">
      <Link href="/" className="wordmark" aria-label={`${brand.name}, home`}>
        <span className="brand-mark" aria-hidden="true">
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
        {brand.name}
        <sup>®︎</sup>
      </Link>
      <nav className="desktop-nav" aria-label="Main navigation">
        {nav.map(([name, url]) => (
          <Link key={url} href={url}>
            {name}
          </Link>
        ))}
      </nav>
      <Button
        className="header-cta"
        render={<Link href={brand.ctaUrl} />}
        nativeButton={false}
      >
        {brand.cta}
        <ArrowUpRight size={17} />
      </Button>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger
          render={
            <Button
              variant="unstyled"
              className="menu-toggle"
              aria-label="Open menu"
            />
          }
        >
          <Menu />
        </SheetTrigger>
        <SheetContent>
          <SheetTitle>{brand.name}</SheetTitle>
          <SheetDescription>Find your way around.</SheetDescription>
          <nav aria-label="Mobile navigation">
            {[...nav, [brand.cta, brand.ctaUrl]].map(([name, url]) => (
              <Link key={url} href={url} onClick={() => setOpen(false)}>
                {name}
                <ArrowUpRight />
              </Link>
            ))}
          </nav>
        </SheetContent>
      </Sheet>
    </header>
  );
}
