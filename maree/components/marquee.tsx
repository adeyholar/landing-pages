"use client";

import { Fragment, useState } from "react";
import { Pause, Play } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Two identical, viewport-wide groups make the loop seamless at any width. */
export function Marquee({
  items,
  className,
  separator,
}: {
  items: string[];
  className: string;
  separator: string;
}) {
  const [paused, setPaused] = useState(false);

  return (
    <div className={`${className} marquee`} data-paused={paused}>
      <p className="sr-only">{items.join(" · ")}</p>
      <div className="marquee-viewport" aria-hidden="true">
        <div className="marquee-track">
          {[0, 1].map((copy) => (
            <div className="marquee-group" key={copy}>
              {items.map((item) => (
                <Fragment key={item}>
                  <span>{item}</span>
                  <span className="marquee-separator">{separator}</span>
                </Fragment>
              ))}
            </div>
          ))}
        </div>
      </div>
      <Button
        variant="unstyled"
        className="marquee-toggle"
        aria-label="Pause scrolling text"
        aria-pressed={paused}
        title={paused ? "Resume scrolling text" : "Pause scrolling text"}
        onClick={() => setPaused((value) => !value)}
      >
        {paused ? (
          <Play size={15} aria-hidden="true" />
        ) : (
          <Pause size={15} aria-hidden="true" />
        )}
      </Button>
    </div>
  );
}
