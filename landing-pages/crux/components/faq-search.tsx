"use client";
import { useState } from "react";
import { faq } from "@/lib/content";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
export function FaqSearch() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [expanded, setExpanded] = useState<string[]>([]);
  const categories = ["All", ...new Set(faq.map((f) => f.category))];
  const result = faq.filter(
    (f) =>
      (category === "All" || f.category === category) &&
      `${f.q} ${f.a}`.toLowerCase().includes(query.trim().toLowerCase()),
  );
  function search(value: string) {
    setQuery(value);
    setExpanded(
      value.trim()
        ? faq
            .filter((f) =>
              `${f.q} ${f.a}`
                .toLowerCase()
                .includes(value.trim().toLowerCase()),
            )
            .map((f) => f.id)
        : [],
    );
  }
  return (
    <div className="faq-browser">
      <Label className="search-label" htmlFor="faq-search">
        Find your answer
      </Label>
      <div className="search-wrap">
        <Input
          id="faq-search"
          type="search"
          value={query}
          onChange={(e) => search(e.target.value)}
          placeholder="Try ‘first visit’ or ‘price’"
        />
        <span aria-hidden="true">↗</span>
      </div>
      <ToggleGroup
        className="filter-row"
        aria-label="Question categories"
        value={[category]}
        onValueChange={(v) => {
          if (v.length) setCategory(v[0]);
        }}
      >
        {categories.map((c) => (
          <ToggleGroupItem key={c} value={c}>
            {c}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
      <p className="micro" aria-live="polite">
        {result.length} {result.length === 1 ? "answer" : "answers"}
        {query ? " found" : ""}
      </p>
      <Accordion
        className="faq-list"
        multiple
        value={expanded}
        onValueChange={setExpanded}
      >
        {result.map((f) => (
          <AccordionItem key={f.id} value={f.id} id={f.id}>
            <AccordionTrigger>{f.q}</AccordionTrigger>
            <AccordionContent>
              <p>{f.a}</p>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
      {result.length === 0 && (
        <div className="no-results">
          <h2>Let’s try another word.</h2>
          <p>No answer matches this search.</p>
          <Button
            onClick={() => {
              search("");
              setCategory("All");
            }}
          >
            Show every answer
          </Button>
        </div>
      )}
    </div>
  );
}
