"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

type Props = {
  progress: number;
  stage: string;
  complete: boolean;
  reduced: boolean;
  onReveal: () => void;
  onComplete: () => void;
  onQuiet: () => void;
};

export function GardenLoader({
  progress,
  stage,
  complete,
  reduced,
  onReveal,
  onComplete,
  onQuiet,
}: Props) {
  const [display, setDisplay] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const [slow, setSlow] = useState(false);
  const current = useRef(0);

  // Ease only toward work already completed; never invent loading progress.
  useEffect(() => {
    const from = current.current;
    const started = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const t = reduced ? 1 : Math.min(1, (now - started) / 460);
      const value =
        t === 1 ? progress : from + (progress - from) * (1 - (1 - t) ** 3);
      current.current = value;
      setDisplay(Math.floor(value));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [progress, reduced]);

  useEffect(() => {
    const timer = setTimeout(() => setSlow(true), 12000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!complete || display < 100) return;
    const timer = setTimeout(
      () => {
        setLeaving(true);
        onReveal();
      },
      reduced ? 0 : 180,
    );
    return () => clearTimeout(timer);
  }, [complete, display, onReveal, reduced]);

  useEffect(() => {
    if (!leaving) return;
    // Also settles if the tab is backgrounded during the curtain transition.
    const timer = setTimeout(onComplete, reduced ? 0 : 1150);
    return () => clearTimeout(timer);
  }, [leaving, reduced, onComplete]);

  return (
    <div
      className="garden-loader"
      data-leaving={leaving}
      aria-label="Fallow is preparing your garden"
      style={{ "--loaded": display / 100 } as React.CSSProperties}
    >
      <div className="loader-grain" aria-hidden="true" />
      <div className="loader-topline">
        <span className="wordmark">
          fallow<span>®</span>
        </span>
        <span className="loader-edition">
          A small world, waiting.
          <br />
          Botanical study № 001
        </span>
      </div>

      <div className="loader-center">
        <div className="loader-specimen" aria-hidden="true">
          <span className="loader-orbit-label">UNHURRIED BY NATURE</span>
          <svg className="loader-orbit" viewBox="0 0 320 320" fill="none">
            <circle cx="160" cy="160" r="146" className="loader-orbit-guide" />
            <circle
              cx="160"
              cy="160"
              r="146"
              pathLength="1"
              className="loader-orbit-progress"
            />
            <path
              d="M160 4v20M160 296v20M4 160h20M296 160h20"
              className="loader-ticks"
            />
            <circle cx="160" cy="14" r="3" fill="currentColor" />
          </svg>
          <svg className="loader-seed" viewBox="0 0 180 220" fill="none">
            <defs>
              <radialGradient id="fallow-seed-light" cx=".3" cy=".22" r=".8">
                <stop stopColor="#f6dad3" />
                <stop offset=".4" stopColor="#c8959b" />
                <stop offset=".78" stopColor="#8c566c" />
                <stop offset="1" stopColor="#553547" />
              </radialGradient>
              <linearGradient
                id="fallow-seed-vein"
                x1="54"
                y1="28"
                x2="123"
                y2="162"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#fff2db" />
                <stop offset="1" stopColor="#8c566c" />
              </linearGradient>
            </defs>
            <g className="loader-root-lines" pathLength="1">
              <path d="M91 161c0 17-9 25-5 43M89 175c-11 3-14 12-26 14M87 187c11 4 11 11 20 17" />
              <path d="M78 186l-4-8M97 195l9-5" />
            </g>
            <g className="loader-seed-body">
              <path
                d="M93 24C70 36 43 65 46 102c2 33 19 53 45 65 25-13 43-34 43-66 0-34-21-60-41-77Z"
                fill="url(#fallow-seed-light)"
              />
              <path
                d="M93 27c-10 42-7 88-2 135"
                stroke="url(#fallow-seed-vein)"
                strokeWidth="1.4"
                opacity=".8"
              />
              <path
                d="M83 53c-19 28-24 53-10 82M105 49c19 29 25 55 9 82"
                stroke="#f9dfd5"
                strokeWidth=".7"
                opacity=".28"
              />
            </g>
          </svg>
          <span className="loader-specimen-id">01 / A beginning</span>
        </div>
        <p className="loader-title">
          Good things
          <br />
          <em>take a little time.</em>
        </p>
        <p className="loader-subtitle">Yours is taking root.</p>
      </div>

      <div className="loader-bottom">
        <Progress
          value={display}
          aria-label="Preparing your garden"
          aria-valuetext={`${display}% — ${stage}`}
        >
          <div className="loader-readout" aria-hidden="true">
            <span className="loader-number">
              {String(display).padStart(2, "0")}
              <span>%</span>
            </span>
            <span className="loader-stage">
              <span className="loader-dot" />
              {stage}
            </span>
            <span className="loader-footnote">
              A little attention.
              <br />
              An entirely new world.
            </span>
          </div>
        </Progress>
        <p className="sr-only" role="status">
          {stage}
        </p>
        {slow && !complete && (
          <div className="loader-slow">
            <span>A slower connection? The quiet garden is ready.</span>
            <Button variant="unstyled" onClick={onQuiet}>
              Enter without 3D <span aria-hidden="true">↗</span>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
