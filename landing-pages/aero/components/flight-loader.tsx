"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
export function FlightLoader({
  progress,
  stage,
  leaving,
  onQuiet,
}: {
  progress: number;
  stage: string;
  leaving: boolean;
  onQuiet: () => void;
}) {
  const [slow, setSlow] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setSlow(true), 10000);
    return () => clearTimeout(timer);
  }, []);
  return (
    <div className="preflight" data-leaving={leaving}>
      <div className="preflight-top">
        <span className="brand">
          AÉRO<span>®</span>
        </span>
        <span className="micro">
          DEPARTURE CONTROL
          <br />
          FLIGHT Nº 001
        </span>
      </div>
      <div className="preflight-center">
        <svg aria-hidden="true" viewBox="0 0 260 160">
          <path d="M8 128 245 15 151 153l-48-59Z" fill="currentColor" />
          <path d="M103 94 245 15 127 119Z" fill="#efd762" />
        </svg>
        <p className="micro">A SMALL DEPARTURE FROM THE EVERYDAY</p>
        <h2>
          Good ideas
          <br />
          are taking <em>off.</em>
        </h2>
      </div>
      <div className="preflight-bottom">
        <div className="preflight-data">
          <span>
            {String(progress).padStart(2, "0")}
            <small> / 100</small>
          </span>
          <p role="status">{stage}</p>
        </div>
        <Progress
          locale="en-US"
          value={progress}
          aria-label="Preparing your departure"
          aria-valuetext={`${progress}% — ${stage}`}
        />
        {slow && (
          <Button variant="ghost" className="preflight-quiet" onClick={onQuiet}>
            Continue with the illustrated flight ↗
          </Button>
        )}
      </div>
    </div>
  );
}
