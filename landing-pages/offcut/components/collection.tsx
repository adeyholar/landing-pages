"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { ObjectDrawing } from "@/components/object";
const pieces = [
  {
    name: "Little fellow",
    kind: "stool" as const,
    category: "seating",
    finish: "natural",
    text: "A little seat. A lot of personality.",
    price: "£185",
    number: "01",
  },
  {
    name: "Side character",
    kind: "table" as const,
    category: "tables",
    finish: "cherry",
    text: "For books, coffee, and good company.",
    price: "£240",
    number: "02",
  },
  {
    name: "Bend the rules",
    kind: "chair" as const,
    category: "seating",
    finish: "natural",
    text: "One lovely line, all the way around.",
    price: "£420",
    number: "03",
  },
];
export function Collection() {
  const [filter, setFilter] = useState("all");
  return (
    <section className="collection section-pad" id="collection">
      <div className="section-top" data-reveal>
        <div>
          <p className="eyebrow">SMALL COLLECTION. BIG PERSONALITIES.</p>
          <h2>
            Meet the <em>odd ones.</em>
          </h2>
        </div>
        <span className="collection-count">
          01—03
          <br />
          THE FIRST EDITION
        </span>
      </div>
      <Tabs value={filter} onValueChange={(v) => setFilter(String(v))}>
        <TabsList aria-label="Filter the collection">
          {[
            ["all", "All the good stuff"],
            ["seating", "Take a seat"],
            ["tables", "On the side"],
          ].map(([v, t]) => (
            <TabsTrigger key={v} value={v}>
              {t}
            </TabsTrigger>
          ))}
        </TabsList>
        {["all", "seating", "tables"].map((tab) => (
          <TabsContent key={tab} value={tab}>
            <div className="product-grid">
              {pieces
                .filter((p) => tab === "all" || p.category === tab)
                .map((p) => (
                  <Card
                    className={`product-card ${p.kind}`}
                    key={p.name}
                    data-reveal
                  >
                    <Link
                      className="product-picture"
                      href={`/commission?piece=${p.kind}`}
                      aria-label={`Explore ${p.name}`}
                    >
                      <span className="product-number">O/{p.number}</span>
                      <ObjectDrawing kind={p.kind} finish={p.finish} />
                      <span className="product-peek">
                        Hello, you. <ArrowUpRight size={16} />
                      </span>
                    </Link>
                    <div className="product-info">
                      <h3>
                        <Link href={`/commission?piece=${p.kind}`}>
                          {p.name}
                        </Link>
                      </h3>
                      <span>{p.price}</span>
                      <p>{p.text}</p>
                    </div>
                  </Card>
                ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
      <p className="small muted collection-note">
        An imagined collection. Example prices, not items for sale.
      </p>
    </section>
  );
}
