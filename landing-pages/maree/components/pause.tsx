"use client";
import { Toggle } from "@/components/ui/toggle";

import { useEffect, useState } from "react";
export function Pause() {
  const [running, setRunning] = useState(false);
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setSeconds((s) => (s + 1) % 10), 1000);
    return () => clearInterval(id);
  }, [running]);
  return (
    <div className={`pause-widget ${running ? "running" : ""}`}>
      <div className="breathing-orbit" aria-hidden="true">
        <i />
        <i />
        <i />
      </div>
      <div className="pause-widget-copy">
        <p className="eyebrow">Before you go any further</p>
        <h2>
          {running
            ? seconds < 4
              ? "Breathe in."
              : "Breathe out."
            : "Take a little pause."}
        </h2>
        <p>
          {running
            ? "Follow the rhythm, only if it feels comfortable."
            : "Nothing to achieve. Nothing to keep up with."}
        </p>
        <Toggle
          className="text-link"
          pressed={running}
          onPressedChange={(value) => {
            setRunning(value);
            setSeconds(0);
          }}
        >
          {running ? "End the pause" : "Find a slower rhythm"}{" "}
          <span aria-hidden="true">{running ? "Ⅱ" : "↗"}</span>
        </Toggle>
        <span className="sr-only" role="status">
          {running
            ? "Optional breathing animation started. Breathe in for four seconds, out for six. Stop whenever you like."
            : "Breathing animation stopped."}
        </span>
      </div>
    </div>
  );
}
