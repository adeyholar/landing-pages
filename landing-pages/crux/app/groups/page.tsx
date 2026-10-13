import { Button } from "@/components/ui/button";
import type { Metadata } from "next";
import Image from "next/image";
import { GroupInquiry } from "@/components/group-inquiry";
import photo from "@/public/images/community.jpg";
export const metadata: Metadata = {
  title: "Bring your crew",
  description:
    "Explore a coached group climb for 6–20 adults. Prepare an example group enquiry.",
};
export default function Groups() {
  return (
    <div className="inner-page">
      <section className="group-intro">
        <div>
          <p className="eyebrow">The best kind of team building</p>
          <h1>
            GOOD PEOPLE.
            <br />
            GREAT <span>PROBLEMS.</span>
          </h1>
          <p>
            Different strengths. One shared wall. Bring your friends or your
            team for a coached session that starts with a little encouragement
            and ends with a lot to talk about.
          </p>
          <Button nativeButton={false} render={<a href="#enquiry" />}>
            Make a crew plan<span aria-hidden="true">↗</span>
          </Button>
        </div>
        <div className="group-photo">
          <Image
            src={photo}
            alt="A climber on a colourful indoor bouldering wall"
            fill
            preload
            sizes="(max-width:760px) 100vw, 45vw"
            placeholder="blur"
          />
        </div>
      </section>
      <div className="group-details">
        <div>
          <strong>6–20</strong>
          <span>ADULT GUESTS</span>
        </div>
        <div>
          <strong>90 min</strong>
          <span>A COACH + A SHARED CHALLENGE</span>
        </div>
        <div>
          <strong>$28</strong>
          <span>PER PERSON · SHOES INCLUDED</span>
        </div>
      </div>
      <GroupInquiry />
    </div>
  );
}
