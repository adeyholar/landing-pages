"use client";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Button } from "@/components/ui/button";

import { useState } from "react";
import Link from "next/link";
import { offers } from "@/lib/content";
export function VisitSelector() {
  const [active, setActive] = useState(0);
  const o = offers[active];
  return (
    <div className="visit-selector">
      <ToggleGroup
        className="visit-choices"
        orientation="vertical"
        aria-label="Choose a bath house visit"
        value={[String(active)]}
        onValueChange={(v) => {
          if (v.length) setActive(Number(v[0]));
        }}
      >
        {offers.map((item, i) => (
          <ToggleGroupItem value={String(i)} key={item.id}>
            <span className="visit-number">0{i + 1}</span>
            <span>
              <strong>{item.name}</strong>
              <small>
                {item.duration} ·{" "}
                {i === 0
                  ? "A little pause"
                  : i === 1
                    ? "Room to linger"
                    : "A softer ending"}
              </small>
            </span>
            <span className="visit-choice-price">£{item.price}</span>
            <span className="visit-indicator" aria-hidden="true">
              ↗︎
            </span>
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
      <div className="visit-detail" aria-live="polite">
        <div className="sun-dial" aria-hidden="true">
          <div />
          <span>
            slow
            <br />
            is good.
          </span>
        </div>
        <p className="eyebrow">Your time, beautifully spent</p>
        <h3>{o.name}</h3>
        <p>{o.description}</p>
        <div className="visit-meta">
          <span>{o.duration}</span>
          <span>{o.included}</span>
        </div>
        <Button
          nativeButton={false}
          render={<Link href={`/book?experience=${o.id}`} />}
        >
          Make time for this <span aria-hidden="true">↗︎</span>
        </Button>
        <span className="micro">
          £{o.price} per person · example experience
        </span>
      </div>
    </div>
  );
}
