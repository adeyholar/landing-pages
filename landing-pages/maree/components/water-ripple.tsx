"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
export function WaterRipple() {
  const [ripple, setRipple] = useState(0);
  return (
    <Button
      variant="unstyled"
      className="hero-seal ripple-seal"
      aria-label="Make a little ripple"
      onClick={() => setRipple((n) => n + 1)}
    >
      <svg viewBox="0 0 64 60" aria-hidden="true">
        <path
          d="M10 30a22 22 0 0 1 44 0M4 37c10-12 20 12 28 0s20 12 28 0M4 48c10-12 20 12 28 0s20 12 28 0"
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
        />
      </svg>
      <span>
        MAKE A LITTLE
        <br />
        RIPPLE.
      </span>
      {ripple > 0 && (
        <span key={ripple} className="water-rings" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
      )}
    </Button>
  );
}
