import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import climb from "@/public/images/climbing.jpg";
import crew from "@/public/images/community.jpg";
import { WallExplorer } from "@/components/wall-explorer";
import { SessionBoard } from "@/components/session-board";
import { FaqPreview } from "@/components/faq-preview";
import { offers } from "@/lib/content";
export default function Home() {
  return (
    <>
      <section className="crux-hero">
        <div className="hero-copy">
          <p className="eyebrow">
            <span className="status-dot" /> BOULDERING. BELONGING. A BIT OF
            BOTH.
          </p>
          <h1>
            LESS SCROLL.
            <br />
            <span>MORE SEND.</span>
          </h1>
          <div className="hero-copy-bottom">
            <p>
              A good problem. A new perspective.
              <br />
              Your kind of people.
              <br />
              Find your way up at CRUX.
            </p>
            <Button nativeButton={false} render={<Link href="/visit" />}>
              Make your first move <span aria-hidden="true">↗</span>
            </Button>
          </div>
          <div className="hero-coordinates">
            <span>INDEPENDENT CLIMBING CLUB</span>
            <span>NORTHBRIDGE / EST. 2026</span>
          </div>
        </div>
        <div className="hero-photo">
          <Image
            src={climb}
            alt="A climber finding his next hold on an indoor bouldering wall"
            fill
            preload
            placeholder="blur"
            sizes="(max-width: 760px) 100vw, 48vw"
          />
          <div className="photo-grid" aria-hidden="true" />
          <div className="hero-photo-caption">
            <span>
              NO EGO.
              <br />
              JUST GO.
            </span>
            <span aria-hidden="true">↗</span>
          </div>
          <div className="hero-sticker">
            <strong>
              FIRST
              <br />
              TIME?
            </strong>
            <span>
              GOOD.
              <br />
              START HERE.
            </span>
            <Link
              href="/visit?experience=first"
              aria-label="Explore your first-time session"
            >
              ↗
            </Link>
          </div>
          <div className="vertical-note">
            FIND YOUR NEXT MOVE / CRUX CLIMBING CLUB
          </div>
        </div>
      </section>
      <div className="club-strip">
        <span>COME AS YOU ARE</span>
        <span aria-hidden="true">✳</span>
        <span>FALL. LAUGH. TRY AGAIN.</span>
        <span aria-hidden="true">✳</span>
        <span>THE GOOD KIND OF STUCK</span>
        <span aria-hidden="true">✳</span>
      </div>
      <section className="intro-section section-pad" data-reveal>
        <p className="eyebrow">MORE THAN A WAY UP</p>
        <h2>
          NOT ANOTHER GYM.
          <br />
          YOUR NEW <span className="underline-scribble">HANGOUT.</span>
        </h2>
        <div className="intro-bottom">
          <p>
            We’re here for the first-time jitters. The one-more-try people. The
            post-climb coffee that turns into a two-hour conversation.
          </p>
          <p>
            Fresh routes, a little encouragement, and space to surprise
            yourself. That’s our idea of a good time.
          </p>
          <span className="asterisk" aria-hidden="true">
            ✳
          </span>
        </div>
      </section>
      <section id="wall" className="wall-section section-pad" data-reveal>
        <WallExplorer />
      </section>
      <section id="passes" className="passes-section section-pad" data-reveal>
        <div className="section-heading">
          <div>
            <p className="eyebrow">02 / LESS COMMITMENT. MORE CLIMBING.</p>
            <h2>
              GET ON
              <br />
              THE <span>WALL.</span>
            </h2>
          </div>
          <p>
            Your first visit or your fifth this week.
            <br />
            There’s a pass for that.
          </p>
        </div>
        <div className="pass-grid">
          {offers.map((o, i) => (
            <Card className={`pass-card pass-${i}`} key={o.id}>
              <div className="pass-top">
                <span className="micro">
                  0{i + 1} /{" "}
                  {i === 0
                    ? "NEW HERE"
                    : i === 1
                      ? "DO YOUR THING"
                      : "FIND YOUR EDGE"}
                </span>
                <span aria-hidden="true">↗</span>
              </div>
              <h3>{o.name}</h3>
              <p>{o.description}</p>
              <div className="pass-price">
                <strong>${o.price}</strong>
                <span>
                  per person
                  <br />
                  {o.duration}
                </span>
              </div>
              <div className="pass-included">{o.included}</div>
              <Button
                nativeButton={false}
                render={<Link href={`/visit?experience=${o.id}`} />}
              >
                {i === 0
                  ? "Start here"
                  : i === 1
                    ? "Grab a day pass"
                    : "Find your flow"}
                <span aria-hidden="true">↗</span>
              </Button>
            </Card>
          ))}
        </div>
        <p className="micro">
          No membership required. Shoe rental +$5 where not included.
          Illustrative prices for a fictional club.
        </p>
      </section>
      <section
        id="sessions"
        className="sessions-section section-pad"
        data-reveal
      >
        <div className="section-heading">
          <div>
            <p className="eyebrow">03 / MAKE A LITTLE ROOM IN YOUR WEEK</p>
            <h2>
              SAME WALL.
              <br />
              NEW <span>ENERGY.</span>
            </h2>
          </div>
          <p>
            Early starts. After-work resets.
            <br />
            And people who get it.
          </p>
        </div>
        <SessionBoard />
      </section>
      <section className="crew-section">
        <div className="crew-photo">
          <Image
            src={crew}
            alt="Climber moving across a wall of colourful holds"
            fill
            sizes="(max-width:760px) 100vw, 55vw"
            placeholder="blur"
          />
          <span className="crew-photo-label">
            GOOD COMPANY. GREAT PROBLEMS.
          </span>
        </div>
        <div className="crew-copy" data-reveal>
          <p className="eyebrow">04 / BETTER WITH YOUR PEOPLE</p>
          <h2>
            BRING
            <br />
            YOUR
            <br />
            <span>CREW.</span>
          </h2>
          <p>
            Trade the usual team outing for a shared challenge. We’ll bring the
            coach and the shoes. You bring the people who cheer a little too
            loudly.
          </p>
          <Button nativeButton={false} render={<Link href="/groups" />}>
            Plan a group climb <span aria-hidden="true">↗</span>
          </Button>
          <span className="micro">6–20 PEOPLE / NO EXPERIENCE NECESSARY</span>
        </div>
      </section>
      <FaqPreview />
      <section className="crux-final section-pad" data-reveal>
        <p className="eyebrow">YOUR NEXT GOOD DAY STARTS WITH ONE MOVE.</p>
        <h2>
          SEE YOU
          <br />
          <span>UP THERE.</span>
        </h2>
        <Button
          variant="unstyled"
          className="circle-cta"
          aria-label="Plan your visit"
          nativeButton={false}
          render={<Link href="/visit" aria-label="Plan your visit" />}
        >
          <span aria-hidden="true">↗</span>
        </Button>
        <div className="final-details">
          <span>
            MON–FRI 07–22
            <br />
            SAT–SUN 09–20
          </span>
          <span>
            THE FOUNDRY QUARTER
            <br />
            NORTHBRIDGE
          </span>
          <span>
            A FICTIONAL CLUB.
            <br />A VERY REAL LOVE OF DESIGN.
          </span>
        </div>
      </section>
    </>
  );
}
