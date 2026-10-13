"use client";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

import { useState } from "react";
import Image from "next/image";
import sauna from "@/public/images/sauna.jpg";
import ocean from "@/public/images/ocean.jpg";
const rituals = [
  {
    title: "Warm",
    sub: "Let the outside world soften.",
    text: "Cedar under your feet. A gentle hush. Settle into the warmth and let the day take a different shape.",
    note: "THE CEDAR ROOM",
    image: sauna,
    alt: "A warm wooden sauna with a round window looking onto trees",
  },
  {
    title: "Cool",
    sub: "A fresh kind of presence.",
    text: "A cool pool, an open sky, and that unmistakable feeling of being right here. Take your time. Every part of the ritual is optional.",
    note: "THE COOL WATER",
    image: ocean,
    alt: "Clear blue ocean water moving into white sea foam",
  },
  {
    title: "Rest",
    sub: "The loveliest part is doing less.",
    text: "Wrap up in a soft towel. Find a sunny corner. A cup of herbal tea and absolutely nowhere else you need to be.",
    note: "THE QUIET IN BETWEEN",
    image: sauna,
    alt: "Quiet wooden benches in a naturally lit sauna",
  },
];
export function RitualExplorer() {
  const [active, setActive] = useState(0);
  const r = rituals[active];
  return (
    <Tabs
      className={`ritual-explorer ritual-${active}`}
      value={active}
      onValueChange={(v) => setActive(Number(v))}
    >
      <div className="ritual-visual">
        <Image
          key={r.title}
          src={r.image}
          alt={r.alt}
          fill
          placeholder="blur"
          sizes="(max-width:760px) 100vw, 50vw"
        />
        <span className="image-note">
          {r.note}
          <span>0{active + 1} / 03</span>
        </span>
        {active === 2 && (
          <div className="rest-seal" aria-hidden="true">
            <span>
              nothing
              <br />
              to do.
            </span>
          </div>
        )}
      </div>
      <div className="ritual-content">
        <p className="eyebrow">An old ritual. A little more room.</p>
        <h2>
          Follow your
          <br />
          <em>own rhythm.</em>
        </h2>
        <TabsList className="ritual-tabs" aria-label="Explore the ritual">
          {rituals.map((item, i) => (
            <TabsTrigger value={i} key={item.title}>
              <small>0{i + 1}</small>
              {item.title}
              <span aria-hidden="true">{i < 2 ? "→" : "↺"}</span>
            </TabsTrigger>
          ))}
        </TabsList>
        {rituals.map((item, i) => (
          <TabsContent
            className="ritual-description"
            key={item.title}
            value={i}
          >
            <h3>{item.sub}</h3>
            <p>{item.text}</p>
          </TabsContent>
        ))}
        <p className="ritual-footnote">
          No right order. No finish line.
          <br />
          Just a little closer to yourself.
        </p>
      </div>
    </Tabs>
  );
}
