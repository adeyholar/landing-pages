import { Button } from "@/components/ui/button";
import Link from "next/link";
import { brand } from "@/lib/content";
export default function NotFound() {
  return (
    <section className="not-found inner-page">
      <p className="eyebrow">404 · A little off the path</p>
      <h1>
        {brand.slug === "crux"
          ? "Wrong route. Right attitude."
          : "Drifted a little too far."}
      </h1>
      <p>This page isn’t here. Let’s take you back to somewhere familiar.</p>
      <Button nativeButton={false} render={<Link href="/" />}>
        Back to the beginning <span aria-hidden="true">↗</span>
      </Button>
    </section>
  );
}
