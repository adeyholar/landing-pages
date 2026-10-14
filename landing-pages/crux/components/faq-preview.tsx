import Link from "next/link";
import { faq } from "@/lib/content";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
export function FaqPreview() {
  return (
    <section className="faq-section section-pad" data-reveal>
      <div>
        <p className="eyebrow">Good to know</p>
        <h2>
          A few things
          <br />
          before you come.
        </h2>
        <Button
          variant="link"
          nativeButton={false}
          render={<Link href="/faq" />}
        >
          All your questions <span aria-hidden="true">↗︎</span>
        </Button>
      </div>
      <Accordion className="faq-list" multiple>
        {faq.slice(0, 4).map((f) => (
          <AccordionItem key={f.id} value={f.id}>
            <AccordionTrigger>{f.q}</AccordionTrigger>
            <AccordionContent>
              <p>{f.a}</p>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}
