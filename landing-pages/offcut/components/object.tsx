"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { ObjectFallback } from "@/components/object-fallback";
import { useMotion } from "@/components/motion";

const ObjectWorld = dynamic(() => import("@/components/object-world"), {
  ssr: false,
});

export type ObjectKind = "stool" | "table" | "chair" | "offcuts";

export function ObjectDrawing({
  kind = "stool",
  finish = "natural",
  turned = false,
}: {
  kind?: ObjectKind;
  finish?: string;
  turned?: boolean;
}) {
  const host = useRef<HTMLDivElement>(null);
  const [nearby, setNearby] = useState(false);
  const { paused } = useMotion();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setNearby(entry.isIntersecting),
      { rootMargin: "160px" },
    );
    if (host.current) observer.observe(host.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={host}
      className={`object-drawing object-${kind}`}
      role="img"
      aria-label={
        kind === "offcuts"
          ? "Three sculptural pieces of reclaimed wood"
          : `${finish} ${kind}, original three-dimensional concept`
      }
    >
      <div className="object-alternative" aria-hidden="true">
        <ObjectFallback kind={kind} finish={finish} />
      </div>
      {nearby ? (
        <ObjectWorld
          kind={kind}
          finish={finish}
          turned={turned}
          paused={paused}
        />
      ) : null}
    </div>
  );
}
