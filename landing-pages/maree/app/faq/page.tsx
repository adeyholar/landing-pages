import type { Metadata } from "next";
import { FaqSearch } from "@/components/faq-search";
export const metadata: Metadata = {
  title: "Questions & answers",
  description: "Everything to know before your first visit.",
};
export default function Page() {
  return (
    <div className="inner-page">
      <header className="page-intro">
        <p className="eyebrow">Questions & answers</p>
        <h1>
          A little less
          <br />
          wondering.
        </h1>
        <p>What to bring, how it works, and everything in between.</p>
      </header>
      <FaqSearch />
    </div>
  );
}
