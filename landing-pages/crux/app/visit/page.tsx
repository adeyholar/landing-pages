import type { Metadata } from "next";
import { VisitPlanner } from "@/components/visit-planner";
import { brand } from "@/lib/content";
export const metadata: Metadata = {
  title: "Plan your visit",
  description:
    "Explore your experience and prepare a sample visit. No real booking or payment.",
};
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ experience?: string }>;
}) {
  const { experience } = await searchParams;
  return (
    <div className="inner-page">
      <header className="page-intro">
        <p className="eyebrow">A little something to look forward to</p>
        <h1>
          {brand.slug === "crux" ? (
            <>
              Your next move
              <br />
              starts here.
            </>
          ) : (
            <>
              Let’s find your
              <br />
              <em>quiet hour.</em>
            </>
          )}
        </h1>
      </header>
      <VisitPlanner initialOffer={experience} />
    </div>
  );
}
