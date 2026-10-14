"use client";
import Link from "next/link";
import { useState } from "react";
import { brand, nav } from "@/lib/content";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
export function Mark() {
  return brand.slug === "crux" ? (
    <svg viewBox="0 0 36 36" fill="none" aria-hidden="true">
      <path d="M4 30 15 7h8l-4 10h10L18 30H4Z" fill="currentColor" />
      <path d="m22 4 10 0-5 10h-9Z" fill="currentColor" />
    </svg>
  ) : (
    <svg viewBox="0 0 48 40" fill="none" aria-hidden="true">
      <path
        d="M8 21a16 16 0 0 1 32 0M4 26c7-7 13 7 20 0s13 7 20 0M4 34c7-7 13 7 20 0s13 7 20 0"
        stroke="currentColor"
        strokeWidth="2"
      />
    </svg>
  );
}

export function Header() {
  const [open, setOpen] = useState(false);
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <header className="site-header">
        <Link className="wordmark" href="/" aria-label={`${brand.name}, home`}>
          <Mark />
          <span>{brand.name}</span>
        </Link>
        <nav className="desktop-nav" aria-label="Main navigation">
          {nav.map((n) => (
            <Link key={n.href} href={n.href}>
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="header-actions">
          <Button
            className="header-cta"
            nativeButton={false}
            render={<Link href={brand.bookingPath} />}
          >
            {brand.slug === "crux" ? "Let’s climb" : "Book a ritual"}
            <span aria-hidden="true">↗︎</span>
          </Button>
          <SheetTrigger
            render={
              <Button
                variant="unstyled"
                className="menu-toggle"
                aria-label="Open menu"
              />
            }
          >
            <span />
            <span />
          </SheetTrigger>
        </div>
      </header>
      <SheetContent className="mobile-menu" showCloseButton={false}>
        <div className="menu-inner">
          <div className="menu-top">
            <SheetTitle className="wordmark">{brand.name}</SheetTitle>
            <SheetClose
              render={<Button variant="unstyled" aria-label="Close menu" />}
            >
              ×
            </SheetClose>
          </div>
          <nav aria-label="Mobile navigation">
            {[...nav, { label: "Questions & answers", href: "/faq" }].map(
              (n, i) => (
                <Link href={n.href} key={n.href} onClick={() => setOpen(false)}>
                  <small>0{i + 1}</small>
                  {n.label}
                  <span aria-hidden="true">↗︎</span>
                </Link>
              ),
            )}
          </nav>
          <Button
            nativeButton={false}
            render={<Link href={brand.bookingPath} />}
            onClick={() => setOpen(false)}
          >
            {brand.bookingLabel}
            <span aria-hidden="true">↗︎</span>
          </Button>
          <SheetDescription className="micro">
            {brand.location}
          </SheetDescription>
        </div>
      </SheetContent>
    </Sheet>
  );
}
