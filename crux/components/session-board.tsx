"use client";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

import { useState } from "react";
import Link from "next/link";
const sessions = [
  {
    day: "MON",
    time: "07:30",
    title: "Before the inbox",
    type: "Open climb",
    tag: "Early birds",
    offer: "day",
  },
  {
    day: "TUE",
    time: "18:00",
    title: "Start somewhere",
    type: "First-timer intro",
    tag: "First timers",
    offer: "first",
  },
  {
    day: "WED",
    time: "19:00",
    title: "Less power. More flow.",
    type: "Technique club",
    tag: "Level up",
    offer: "coached",
  },
  {
    day: "THU",
    time: "18:30",
    title: "A little beta, a lot of laughs",
    type: "Social climb",
    tag: "After hours",
    offer: "day",
  },
  {
    day: "SAT",
    time: "10:00",
    title: "Your first good send",
    type: "First-timer intro",
    tag: "First timers",
    offer: "first",
  },
];
export function SessionBoard() {
  const [filter, setFilter] = useState("All sessions");
  const visible = sessions.filter(
    (s) => filter === "All sessions" || s.tag === filter,
  );
  return (
    <div>
      <ToggleGroup
        className="session-filters"
        aria-label="Filter example sessions"
        value={[filter]}
        onValueChange={(v) => {
          if (v.length) setFilter(v[0]);
        }}
      >
        {["All sessions", "First timers", "Level up", "After hours"].map(
          (f) => (
            <ToggleGroupItem value={f} key={f}>
              {f}
            </ToggleGroupItem>
          ),
        )}
      </ToggleGroup>
      <div className="session-list" aria-live="polite">
        {visible.map((s) => (
          <Link
            href={`/visit?experience=${s.offer}`}
            className="session-row"
            key={s.title}
          >
            <span className="session-day">
              {s.day}
              <small>{s.time}</small>
            </span>
            <span>
              <strong>{s.title}</strong>
              <small>{s.type}</small>
            </span>
            <span className="session-tag">{s.tag}</span>
            <span className="row-arrow" aria-hidden="true">
              ↗
            </span>
          </Link>
        ))}
      </div>
      <p className="micro">
        A sample week at CRUX. Choose a session to explore your visit.
      </p>
    </div>
  );
}
