import { Faq } from "@/components/faq";
import { brand } from "@/lib/content";
export const metadata = { title: "Questions & answers" };
export default function Page() {
  return (
    <section className="inner-page">
      <p className="eyebrow">A little clarity / {brand.name}</p>
      <h1>
        Good questions.
        <br />
        <em>Honest answers.</em>
      </h1>
      <Faq search />
    </section>
  );
}
