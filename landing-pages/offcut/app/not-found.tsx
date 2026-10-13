import Link from "next/link";
import { Button } from "@/components/ui/button";
export default function NotFound() {
  return (
    <section className="inner-page not-found">
      <p className="eyebrow">404 / A small detour</p>
      <h1>
        Somewhere
        <br />
        <em>else entirely.</em>
      </h1>
      <p>This page doesn’t exist. Let’s take you back.</p>
      <Button render={<Link href="/" />} nativeButton={false}>
        Back to the beginning ↗
      </Button>
    </section>
  );
}
