import { Button } from "@/components/ui/button";
import type { Metadata } from "next";
import Image from "next/image";
import { GroupInquiry } from "@/components/group-inquiry";
import photo from "@/public/images/sauna.jpg";
export const metadata: Metadata = {
  title: "Private gatherings",
  description:
    "A private bath house ritual for 6–12 people. Explore an example gathering.",
};
export default function Groups() {
  return (
    <div className="inner-page">
      <section className="group-intro">
        <div>
          <p className="eyebrow">A little closer, together</p>
          <h1>
            Your people.
            <br />
            Your little
            <br />
            <em>escape.</em>
          </h1>
          <p>
            Some days deserve a little more space. Gather your favourite people
            for a private ritual, with the bath house all to yourselves. No
            rush. No one else’s agenda.
          </p>
          <Button nativeButton={false} render={<a href="#enquiry" />}>
            Imagine your gathering<span aria-hidden="true">↗︎</span>
          </Button>
        </div>
        <div className="group-photo">
          <Image
            src={photo}
            alt="Warm wooden sauna benches beside a circular window"
            fill
            preload
            sizes="(max-width:760px) 100vw, 45vw"
            placeholder="blur"
          />
        </div>
      </section>
      <div className="group-details">
        <div>
          <strong>6–12</strong>
          <span>ADULT GUESTS</span>
        </div>
        <div>
          <strong>90 min</strong>
          <span>YOUR OWN UNHURRIED RITUAL</span>
        </div>
        <div>
          <strong>£45</strong>
          <span>PER PERSON · ROBES & TEA INCLUDED</span>
        </div>
      </div>
      <GroupInquiry />
    </div>
  );
}
