"use client";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { faq } from "@/lib/content";
export function Faq({ search = false }: { search?: boolean }) {
  const [q, setQ] = useState("");
  const items = faq.filter((x) =>
    (x[0] + x[1]).toLowerCase().includes(q.toLowerCase()),
  );
  return (
    <div className="faq-list">
      {search && (
        <>
          <label htmlFor="faq-search" className="eyebrow">
            Find an answer
          </label>
          <Input
            id="faq-search"
            placeholder="Try “visit”, “materials” or “demo”…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <p className="muted small" role="status">
            {items.length} {items.length === 1 ? "answer" : "answers"}
          </p>
        </>
      )}
      <Accordion multiple>
        {(search ? items : items.slice(0, 4)).map(([q, a]) => (
          <AccordionItem key={q} value={q}>
            <AccordionTrigger>{q}</AccordionTrigger>
            <AccordionContent>{a}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
      {items.length === 0 && <p>No match yet. Try another word.</p>}
    </div>
  );
}
