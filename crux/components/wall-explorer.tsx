"use client";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

import { useState } from "react";
import Link from "next/link";
const circuits = [
  {
    name: "Start",
    level: "V0–V2",
    color: "#d9ef48",
    title: "Big holds. Small victories.",
    text: "Find your feet on friendly angles and generous holds. There’s a first move for everyone.",
    path: "M120 315 205 255 174 190 260 130 225 65",
    points: [
      [120, 315],
      [205, 255],
      [174, 190],
      [260, 130],
      [225, 65],
    ],
  },
  {
    name: "Flow",
    level: "V3–V5",
    color: "#ad9cef",
    title: "A little less force. A little more feel.",
    text: "Balance, footwork, and the satisfaction of a sequence that finally clicks. Find your rhythm.",
    path: "M285 330 330 267 260 207 365 143 320 78",
    points: [
      [285, 330],
      [330, 267],
      [260, 207],
      [365, 143],
      [320, 78],
    ],
  },
  {
    name: "Project",
    level: "V6+",
    color: "#ff744c",
    title: "The one you’ll come back for.",
    text: "A reach that looks impossible. A move worth another try. Bring your curiosity, leave the scoreboard.",
    path: "M410 330 380 260 449 210 397 155 460 80",
    points: [
      [410, 330],
      [380, 260],
      [449, 210],
      [397, 155],
      [460, 80],
    ],
  },
];
export function WallExplorer() {
  const [active, setActive] = useState(0);
  const c = circuits[active];
  return (
    <Tabs
      className="wall-explorer"
      value={active}
      onValueChange={(v) => setActive(Number(v))}
    >
      <div className="wall-copy">
        <p className="eyebrow">01 / A wall for every version of you</p>
        <h2>
          YOUR PACE.
          <br />
          YOUR <span>CIRCUIT.</span>
        </h2>
        <p>
          Some days you fly. Some days you figure it out.
          <br />
          There’s room for both.
        </p>
        <TabsList className="circuit-buttons" aria-label="Explore a circuit">
          {circuits.map((item, i) => (
            <TabsTrigger key={item.name} value={i}>
              <span style={{ background: item.color }} />
              {item.name}
              <small>{item.level}</small>
            </TabsTrigger>
          ))}
        </TabsList>
        {circuits.map((item, i) => (
          <TabsContent
            key={item.name}
            value={i}
            className="circuit-description"
          >
            <h3>{item.title}</h3>
            <p>{item.text}</p>
          </TabsContent>
        ))}
        <Button
          variant="link"
          nativeButton={false}
          render={<Link href="/visit" />}
        >
          Find your first hold <span aria-hidden="true">↗</span>
        </Button>
      </div>
      <div className="wall-canvas">
        <div className="wall-topline">
          <span>THE CIRCUIT BOARD</span>
          <span>EXPLORE / 0{active + 1}</span>
        </div>
        <svg
          viewBox="0 0 560 400"
          role="img"
          aria-label={`Illustration of the ${c.name} circuit, ${c.level}. Five holds connected from bottom to top.`}
        >
          <defs>
            <pattern
              id="bolts"
              width="38"
              height="38"
              patternUnits="userSpaceOnUse"
            >
              <circle cx="19" cy="19" r="1.4" fill="#66685e" />
            </pattern>
          </defs>
          <path d="M0 0H560V400H0Z" fill="url(#bolts)" />
          <path
            d="M0 300 165 0M380 0l180 220M0 360l560-190"
            stroke="#52554c"
            fill="none"
          />
          <path
            d="m80 180 92-40 30 110-82-15Z"
            fill="#3b3e35"
            stroke="#5b5e51"
          />
          <path
            d="m395 85 78 72-43 72-89-35Z"
            fill="#3b3e35"
            stroke="#5b5e51"
          />
          {circuits.map((item, i) => (
            <g
              key={item.name}
              opacity={active === i ? 1 : 0.2}
              className="circuit-route"
            >
              <path
                key={`${item.name}-${active}`}
                className={active === i ? "route-line" : ""}
                d={item.path}
                stroke={item.color}
                strokeWidth="2"
                strokeDasharray="5 7"
                fill="none"
              />
              {item.points.map(([x, y], j) => (
                <g
                  key={j}
                  transform={`translate(${x} ${y}) rotate(${j * 27 - 20})`}
                >
                  <path
                    d="M-16-6Q-10-18 7-13L20 0Q14 15-4 12L-19 5Z"
                    fill={item.color}
                  />
                  <ellipse
                    cx="0"
                    cy="-1"
                    rx="6"
                    ry="3"
                    fill="#282a24"
                    opacity=".4"
                  />
                </g>
              ))}
            </g>
          ))}
          <text
            x="62"
            y="359"
            fill="#c4c6bb"
            fontSize="11"
            fontFamily="monospace"
          >
            START LOW. AIM HIGH.
          </text>
        </svg>
        <div className="wall-bottomline">
          <span className="route-grade" style={{ color: c.color }}>
            {c.level}
          </span>
          <span>
            Different holds.
            <br />
            Same good feeling.
          </span>
          <span className="wall-arrow" aria-hidden="true">
            ↗
          </span>
        </div>
        <p className="micro">Illustrative route map · not a safety guide</p>
      </div>
    </Tabs>
  );
}
