import { Marquee } from "@/components/marquee";
import { WaterRipple } from "@/components/water-ripple";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import ocean from "@/public/images/ocean.jpg";
import sauna from "@/public/images/sauna.jpg";
import { RitualExplorer } from "@/components/ritual-explorer";
import { VisitSelector } from "@/components/visit-selector";
import { Pause } from "@/components/pause";
import { FaqPreview } from "@/components/faq-preview";
export default function Home() {
  return (
    <>
      <section className="maree-hero">
        <Image
          src={ocean}
          alt="Blue Atlantic water breaking into soft white foam"
          fill
          preload
          placeholder="blur"
          sizes="100vw"
        />
        <div className="hero-shade" />
        <div className="maree-hero-content">
          <p className="eyebrow">A COASTAL BATH HOUSE · CORNWALL</p>
          <h1>
            Come back
            <br />
            to your <em>senses.</em>
          </h1>
          <p>
            Cedar warmth. Cool water. A little ocean air.
            <br />
            Space to slow down, just as you are.
          </p>
          <Button
            variant="unstyled"
            className="button light"
            nativeButton={false}
            render={<Link href="/book" />}
          >
            Find your quiet hour <span aria-hidden="true">↗︎</span>
          </Button>
        </div>
        <div className="hero-bottom">
          <span>
            A SMALL ESCAPE.
            <br />A DEEPER EXHALE.
          </span>
          <a
            href="#place"
            className="scroll-link"
            aria-label="Explore the bath house"
          >
            Scroll a little slower <span aria-hidden="true">↓</span>
          </a>
          <WaterRipple />
        </div>
      </section>
      <Marquee
        className="maree-strip"
        separator="·"
        items={[
          "WARM UP.",
          "COOL DOWN.",
          "DRIFT A LITTLE.",
          "COME BACK TO YOU.",
        ]}
      />
      <section id="place" className="place-section section-pad" data-reveal>
        <div className="place-lead">
          <p className="eyebrow">Somewhere between the sea and yourself</p>
          <h2>
            The world can wait.
            <br />
            <em>You’re here now.</em>
          </h2>
          <span className="little-sun" aria-hidden="true">
            ☼
          </span>
        </div>
        <div className="place-description">
          <p>
            A bath house on the edge of the everyday. Made for warm shoulders,
            quiet minds, and the simple pleasure of having nowhere else to be.
          </p>
          <p>
            Our imagined home at Stillwater Cove brings an age-old ritual to the
            Cornish coast. Come on your own, come with someone you love. Leave a
            little lighter.
          </p>
          <Button
            variant="link"
            nativeButton={false}
            render={<Link href="/book" />}
          >
            Step out of your day <span aria-hidden="true">↗︎</span>
          </Button>
        </div>
      </section>
      <section id="ritual" className="ritual-section" data-reveal>
        <RitualExplorer />
      </section>
      <section className="small-things section-pad" data-reveal>
        <p className="eyebrow">THE LITTLE THINGS, ALREADY THOUGHT OF</p>
        <div>
          <Card>
            <span className="line-icon" aria-hidden="true">
              ≈
            </span>
            <h3>A towel, waiting.</h3>
            <p>
              Soft linen. A warm welcome.
              <br />A little less to pack.
            </p>
          </Card>
          <Card>
            <span className="line-icon sun" aria-hidden="true">
              ☼
            </span>
            <h3>Room to be.</h3>
            <p>
              Small sessions, unhurried spaces.
              <br />
              Your own corner of quiet.
            </p>
          </Card>
          <Card>
            <span className="line-icon" aria-hidden="true">
              ∿
            </span>
            <h3>One more cup.</h3>
            <p>
              Herbal tea on the terrace.
              <br />
              Stay with the feeling.
            </p>
          </Card>
        </div>
      </section>
      <section id="visits" className="visits-section section-pad" data-reveal>
        <div className="section-heading">
          <div>
            <p className="eyebrow">A LITTLE TIME THAT BELONGS TO YOU</p>
            <h2>
              How will you
              <br />
              <em>spend your tide?</em>
            </h2>
          </div>
          <p>
            An hour to yourself.
            <br />
            Or a morning with no next thing.
          </p>
        </div>
        <VisitSelector />
      </section>
      <section className="pause-section section-pad">
        <Pause />
      </section>
      <section className="gather-section">
        <div className="gather-copy" data-reveal>
          <p className="eyebrow">GOOD COMPANY. NO OCCASION NECESSARY.</p>
          <h2>
            Some things
            <br />
            are better
            <br />
            <em>shared.</em>
          </h2>
          <p>
            A birthday without the bustle. A team day with room to breathe. Or
            simply your favourite people, together somewhere a little different.
          </p>
          <Button nativeButton={false} render={<Link href="/groups" />}>
            Gather by the water <span aria-hidden="true">↗︎</span>
          </Button>
          <span className="micro">PRIVATE RITUALS FOR 6–12 PEOPLE</span>
        </div>
        <div className="gather-image">
          <Image
            src={sauna}
            alt="Warm cedar benches around a circular window overlooking a green landscape"
            fill
            sizes="(max-width:760px) 100vw, 52vw"
            placeholder="blur"
          />
          <div className="gather-note">
            A little warmth.
            <br />A lot of togetherness.
          </div>
        </div>
      </section>
      <FaqPreview />
      <section className="maree-final section-pad" data-reveal>
        <div className="final-waves" aria-hidden="true">
          <i />
          <i />
          <i />
        </div>
        <p className="eyebrow">THE TIDE WILL KEEP ITS OWN TIME.</p>
        <h2>
          You can
          <br />
          <em>take yours.</em>
        </h2>
        <Button nativeButton={false} render={<Link href="/book" />}>
          Make a little room <span aria-hidden="true">↗︎</span>
        </Button>
        <p className="micro">
          STILLWATER COVE · AN IMAGINED PLACE ON THE CORNISH COAST
        </p>
      </section>
    </>
  );
}
