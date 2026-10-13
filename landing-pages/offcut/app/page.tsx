import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowUpRight, MoveUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Collection } from "@/components/collection";
import { Configurator } from "@/components/configurator";
import { ObjectDrawing } from "@/components/object";
import { Faq } from "@/components/faq";
export default function Home() {
  return (
    <>
      <section className="offcut-hero">
        <div className="hero-copy" data-reveal>
          <p className="eyebrow">
            <span className="status-dot" /> FURNITURE WITH A SECOND STORY
          </p>
          <h1>
            Good wood.
            <br />
            <em>New moods.</em>
            <span className="hero-star" aria-hidden="true">
              ✳
            </span>
          </h1>
          <div className="hero-bottom-copy">
            <p>
              A little character goes a long way.
              <br />
              Thoughtful objects for homes
              <br />
              that feel like you.
            </p>
            <Button render={<Link href="#collection" />} nativeButton={false}>
              Meet your next favourite <ArrowUpRight size={19} />
            </Button>
          </div>
        </div>
        <div className="hero-photo" data-scroll data-reveal>
          <Image
            src="/images/atelier.jpg"
            alt="Sculptural ash stool, walnut side table and folded plywood chair in a sunny yellow studio — concept furniture"
            fill
            priority
            sizes="(max-width: 760px) 100vw, 60vw"
          />
          <span className="photo-caption">
            THREE GOOD REASONS
            <br />
            TO STAY A LITTLE LONGER.
          </span>
          <Link href="#collection" className="round-note">
            <span>
              NOT QUITE
              <br />
              LIKE THE REST.
            </span>
            <ArrowDown size={24} />
          </Link>
        </div>
        <div className="hero-foot">
          <span>
            SMALL BATCH MINDSET.
            <br />
            BIG EVERYDAY ENERGY.
          </span>
          <span>
            OBJECTS TO LIVE WITH,
            <br />
            NOT JUST LOOK AT.
          </span>
          <Link href="#our-way">A LITTLE ABOUT US ↓</Link>
        </div>
      </section>
      <div className="offcut-marquee" aria-hidden="true">
        <div className="marquee-track">
          {[0, 1].map((group) => (
            <div className="marquee-group" key={group}>
              {[0, 1].map((repeat) => (
                <span className="marquee-phrase" key={repeat}>
                  GOOD BONES <i>✳</i> LITTLE QUIRKS <i>✳</i> LONG STORIES{" "}
                  <i>✳</i>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
      <Collection />
      <section className="story section-pad" id="our-way">
        <div className="story-illustration" data-scroll>
          <ObjectDrawing kind="offcuts" />
          <div className="story-stamp">
            STILL
            <br />
            <em>good.</em>
            <span>LOOK AGAIN ↗</span>
          </div>
          <span className="eyebrow">A DIFFERENT WAY TO SEE WHAT’S LEFT.</span>
        </div>
        <div className="story-copy">
          <p className="eyebrow" data-reveal>
            NOT PERFECT. ALL THE BETTER.
          </p>
          <h2 data-reveal>
            We like wood
            <br />
            with a <em>past.</em>
          </h2>
          <p data-reveal>
            A curious grain. An awkward corner. A piece that didn’t quite fit.
            Where others see the end of a story, we like to see the beginning.
          </p>
          <p data-reveal>
            OFFCUT imagines a slower kind of furniture studio. Small
            collections, thoughtful shapes and just enough unexpected detail to
            make you smile.
          </p>
          <Link href="/commission" className="text-link" data-reveal>
            Let’s make something yours <MoveUpRight size={17} />
          </Link>
        </div>
      </section>
      <section className="making section-pad">
        <div className="section-top" data-reveal>
          <p className="eyebrow">FROM “WHAT IF” TO “THAT’S IT”.</p>
          <span className="eyebrow">THREE LITTLE STEPS</span>
        </div>
        <div className="making-steps">
          {[
            {
              n: "01",
              name: "Look a little closer.",
              text: "Every piece starts with the material. Its grain, its shape, its good little imperfections.",
              glyph: "◒",
            },
            {
              n: "02",
              name: "Find the good shape.",
              text: "A sketch becomes a curve. A curve becomes a place to sit, set something down, or stay awhile.",
              glyph: "⌁",
            },
            {
              n: "03",
              name: "Let life happen.",
              text: "The best finish is a life well lived. Coffee, conversation and a few stories of your own.",
              glyph: "✳",
            },
          ].map((x) => (
            <article key={x.n} data-reveal data-scroll>
              <span className="step-glyph" aria-hidden="true">
                {x.glyph}
              </span>
              <span className="eyebrow">{x.n} / THE OFFCUT WAY</span>
              <h3>{x.name}</h3>
              <p>{x.text}</p>
            </article>
          ))}
        </div>
      </section>
      <Configurator />
      <section className="studio-note section-pad" data-scroll>
        <div data-reveal>
          <p className="eyebrow">A PLACE FOR YOUR ODD IDEA.</p>
          <h2>
            Something
            <br />
            <em>on your mind?</em>
          </h2>
          <p>
            A particular corner. A very specific colour.
            <br />A “wouldn’t it be nice if…”. We like those.
          </p>
          <Button render={<Link href="/commission" />} nativeButton={false}>
            Let’s sketch it out <ArrowUpRight size={18} />
          </Button>
        </div>
        <div className="note-object" aria-hidden="true" data-reveal>
          <ObjectDrawing kind="chair" />
          <span>
            THERE’S ROOM
            <br />
            FOR A LITTLE
            <br />
            <em>different.</em>
          </span>
        </div>
      </section>
      <section className="faq-section section-pad">
        <div data-reveal>
          <p className="eyebrow">A FEW THINGS YOU MIGHT WONDER</p>
          <h2>
            Wood you
            <br />
            <em>like to know?</em>
          </h2>
          <Link href="/faq" className="text-link">
            More good questions ↗
          </Link>
        </div>
        <Faq />
      </section>
      <section className="offcut-final section-pad">
        <p className="eyebrow" data-reveal>
          MAKE ROOM FOR A LITTLE CHARACTER.
        </p>
        <Link href="#collection" className="final-title" data-reveal>
          Find your
          <br />
          <em>kind of odd.</em>
          <span aria-hidden="true">↗</span>
        </Link>
        <span className="final-flower" aria-hidden="true" data-scroll>
          ✳
        </span>
      </section>
    </>
  );
}
