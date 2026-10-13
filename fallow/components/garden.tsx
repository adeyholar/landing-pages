"use client";
import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import {
  ArrowDown,
  ArrowUpRight,
  Check,
  Pause,
  Play,
  Plus,
  Sprout,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
const World = dynamic(() => import("./world").then((m) => m.World), {
  ssr: false,
});
export const species = [
  {
    name: "Moon orchid",
    latin: "Lunaria somnia",
    color: "#c26376",
    note: "For the things you haven’t begun yet.",
    habit: "Opens slowly. Keeps a little moonlight.",
  },
  {
    name: "Golden hour",
    latin: "Solara quieta",
    color: "#df9b3b",
    note: "For the good things worth waiting for.",
    habit: "Turns toward the warmth. Never in a hurry.",
  },
  {
    name: "Blue reverie",
    latin: "Caerula vaga",
    color: "#7689bf",
    note: "For the places your mind wanders.",
    habit: "Grows in the space between two thoughts.",
  },
];
const chapters = ["The seed", "The unseen", "The becoming", "The garden"];
export function Garden() {
  const [awake, setAwake] = useState(false),
    [kind, setKind] = useState(0),
    [paused, setPaused] = useState(false),
    [chapter, setChapter] = useState(0),
    [journal, setJournal] = useState(false),
    [saved, setSaved] = useState(false),
    [inView, setInView] = useState(true),
    [ready, setReady] = useState(false);
  const progress = useRef(0);
  const story = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setPaused(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);
  useEffect(() => {
    document.documentElement.dataset.motion = paused ? "paused" : "on";
    return () => {
      delete document.documentElement.dataset.motion;
    };
  }, [paused]);
  useEffect(() => {
    const element = story.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => {
      setInView(entry.isIntersecting);
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    let frame = 0;
    const panels = [...document.querySelectorAll<HTMLElement>(".story-panel")];
    const update = () => {
      frame = 0;
      const y = scrollY;
      let v = 0;
      panels.forEach((p, i) => {
        if (y >= p.offsetTop)
          v = i + Math.min(1, (y - p.offsetTop) / p.offsetHeight);
      });
      progress.current = Math.min(3.6, v);
      setChapter(Math.min(3, Math.floor(v + 0.16)));
      panels.forEach((p) => {
        const t = p.getBoundingClientRect().top / innerHeight;
        p.style.setProperty(
          "--presence",
          String(Math.min(1, Math.max(0, 1 - Math.max(0, -t - 0.2) * 1.7))),
        );
      });
    };
    const queue = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    queue();
    addEventListener("scroll", queue, { passive: true });
    addEventListener("resize", queue);
    return () => {
      cancelAnimationFrame(frame);
      removeEventListener("scroll", queue);
      removeEventListener("resize", queue);
    };
  }, []);
  const go = (i: number) => {
    document
      .getElementById(`chapter-${i}`)
      ?.scrollIntoView({ behavior: paused ? "instant" : "smooth" });
  };
  const download = () => {
    const flower = species[kind];
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="1200" viewBox="0 0 900 1200"><rect width="900" height="1200" fill="#eee5df"/><rect x="38" y="38" width="824" height="1124" fill="none" stroke="#543c43"/><text x="80" y="115" font-family="Georgia" font-size="42" fill="#543c43">FALLOW</text><text x="80" y="158" font-family="sans-serif" font-size="14" fill="#543c43">A SPECIMEN FROM AN IMPOSSIBLE GARDEN</text><path d="M450 850Q350 660 450 460" fill="none" stroke="#586348" stroke-width="8"/>${Array.from({ length: 9 }, (_, i) => `<ellipse cx="450" cy="370" rx="63" ry="145" fill="${flower.color}" opacity=".7" transform="rotate(${i * 40} 450 510)"/>`).join("")}<circle cx="450" cy="510" r="43" fill="#dcaf66"/><text x="80" y="950" font-family="Georgia" font-size="70" fill="#543c43">${flower.name}</text><text x="80" y="1000" font-family="Georgia" font-style="italic" font-size="27" fill="#543c43">${flower.latin}</text><text x="80" y="1060" font-family="sans-serif" font-size="21" fill="#543c43">${flower.note}</text><text x="80" y="1120" font-family="sans-serif" font-size="14" fill="#543c43">Fictional botanical specimen · Developed by LN · lndev.me</text></svg>`;
    const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `fallow-${flower.name.toLowerCase().replaceAll(" ", "-")}.svg`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setSaved(true);
  };
  return (
    <>
      <div
        className="world-wrap"
        data-chapter={chapter}
        data-awake={awake}
        style={{ "--flower-color": species[kind].color } as React.CSSProperties}
        aria-hidden="true"
      >
        <div className="world-fallback">
          <span />
          <span />
          <span />
          <i />
        </div>
        <World
          progress={progress}
          awake={awake}
          kind={kind}
          paused={paused}
          active={inView && !journal}
          onReady={setReady}
        />
        <div className="grain" />
      </div>
      <header className={`garden-header ${chapter === 1 ? "over-roots" : ""}`}>
        <a
          href="#chapter-0"
          className="wordmark"
          aria-label="Fallow, beginning"
        >
          fallow<span>®</span>
        </a>
        <span className="header-caption">An exercise in becoming.</span>
        <Button
          variant="unstyled"
          className="journal-button"
          onClick={() => setJournal(true)}
        >
          Field notes <Plus size={15} />
        </Button>
      </header>
      <main id="story" ref={story}>
        <section
          className="story-panel first"
          id="chapter-0"
          aria-labelledby="title"
        >
          <div className="panel-inside">
            <div className="hero-kicker">
              <span className="live-dot" /> An imaginary botanical world
            </div>
            <h1 id="title">
              Small things.
              <br />
              <em>Other worlds.</em>
            </h1>
            <p className="hero-copy">
              A seed is a quiet kind of possibility.
              <br />
              Give this one a little attention.
            </p>
            <div className="wake-wrap">
              <Button
                variant="unstyled"
                className={`wake-button ${awake ? "is-awake" : ""}`}
                onClick={() => setAwake((v) => !v)}
                aria-pressed={awake}
              >
                <span className="seed-glyph">✳</span>
                {awake ? "The seed is awake" : "Wake the seed"}
                <span className="wake-plus">{awake ? "−" : "+"}</span>
              </Button>
              <span className="wake-status" aria-live="polite">
                {awake
                  ? "Something good has started. Keep going."
                  : "One small gesture. A whole new beginning."}
              </span>
            </div>
            <div className="hero-bottom">
              <span>Specimen 001 / Unhurried by nature</span>
              <Button
                variant="unstyled"
                className="scroll-link"
                onClick={() => go(1)}
              >
                Follow the roots <ArrowDown size={16} />
              </Button>
              <span className="webgl-status">
                {ready ? "Living study · 01—04" : "Botanical study · 01—04"}
              </span>
            </div>
          </div>
        </section>
        <section
          className="story-panel roots"
          id="chapter-1"
          aria-labelledby="roots-title"
        >
          <div className="panel-inside">
            <div className="chapter-copy">
              <span className="eyebrow">01 / Beneath the surface</span>
              <h2 id="roots-title">
                Before there
                <br />
                is <em>anything,</em>
                <br />
                there is this.
              </h2>
              <p>
                A little reaching. A little trusting.
                <br />
                The most important part of growing
                <br />
                is the part you don’t see.
              </p>
              <span className="annotation">
                <i /> Root system / forming connections
              </span>
            </div>
            <span className="giant-whisper" aria-hidden="true">
              begin.
            </span>
          </div>
        </section>
        <section
          className="story-panel bloom"
          id="chapter-2"
          aria-labelledby="bloom-title"
        >
          <div className="panel-inside">
            <div className="chapter-copy">
              <span className="eyebrow">02 / A change of heart</span>
              <h2 id="bloom-title">
                You don’t have
                <br />
                to become
                <br />
                <em>everything.</em>
              </h2>
              <p>
                Just something entirely your own.
                <br />
                Choose what you’d like to grow.
              </p>
              <RadioGroup
                className="species-options"
                aria-label="Choose a flower"
                value={String(kind)}
                onValueChange={(v) => {
                  setKind(Number(v));
                  setSaved(false);
                  setAwake(true);
                }}
              >
                {species.map((s, i) => (
                  <RadioGroupItem
                    key={s.name}
                    value={String(i)}
                    className="species-choice"
                    style={{ "--swatch": s.color } as React.CSSProperties}
                  >
                    <span />
                    {s.name}
                  </RadioGroupItem>
                ))}
              </RadioGroup>
              <div className="species-note" aria-live="polite">
                <em>{species[kind].latin}</em>
                <span>{species[kind].habit}</span>
              </div>
            </div>
          </div>
        </section>
        <section
          className="story-panel final"
          id="chapter-3"
          aria-labelledby="garden-title"
        >
          <div className="panel-inside">
            <span className="eyebrow">03 / Room for possibility</span>
            <h2 id="garden-title">
              Leave a little
              <br />
              <em>more alive.</em>
            </h2>
            <p>
              Take a small reminder with you.
              <br />
              Good things have their own pace.
            </p>
            <Button className="collect-button" onClick={download}>
              {saved ? <Check size={17} /> : <Sprout size={17} />}{" "}
              {saved ? "Save your specimen again" : "Keep this little world"}
              <ArrowUpRight size={17} />
            </Button>
            <span className="download-note" role="status">
              {saved
                ? "Your illustrated specimen is ready to download."
                : "An illustrated specimen. Yours to keep."}
            </span>
          </div>
        </section>
      </main>
      <nav className="chapter-dock" aria-label="Story chapters">
        {chapters.map((c, i) => (
          <Button
            variant="unstyled"
            key={c}
            className={chapter === i ? "active" : ""}
            aria-current={chapter === i ? "step" : undefined}
            aria-label={`${i + 1}. ${c}`}
            onClick={() => go(i)}
          >
            <span>0{i + 1}</span>
            <span className="dock-label">{c}</span>
            <i />
          </Button>
        ))}
        <Button
          variant="unstyled"
          className="motion-button"
          aria-label={paused ? "Resume ambient motion" : "Pause ambient motion"}
          aria-pressed={paused}
          onClick={() => setPaused((v) => !v)}
        >
          {paused ? <Play size={14} /> : <Pause size={14} />}
        </Button>
      </nav>
      <footer className="garden-footer">
        <a className="wordmark" href="#chapter-0">
          fallow<span>®</span>
        </a>
        <p>A fictional garden. A real invitation to slow down.</p>
        <div>
          <span>
            Developed by <a href="https://lndev.me">LN ↗</a>
          </span>
          <a href="https://github.com/ln-dev7/landing-pages">
            Open source · MIT ↗
          </a>
          <a href="https://lndev.mychariow.shop/prd_3cu1s0">
            Support the project ↗
          </a>
          <Button variant="unstyled" onClick={() => setJournal(true)}>
            About this garden
          </Button>
        </div>
      </footer>
      <Sheet open={journal} onOpenChange={setJournal}>
        <SheetContent className="field-notes">
          <span className="eyebrow">Fallow / Field notes № 001</span>
          <SheetTitle>
            A place to
            <br />
            <em>begin again.</em>
          </SheetTitle>
          <SheetDescription>
            FALLOW is an imaginary seed library. A short, interactive story
            about attention, patience, and the worlds hidden in small
            beginnings.
          </SheetDescription>
          <div className="notes-specimen">
            <span>✳</span>
            <em>{species[kind].name}</em>
            <p>{species[kind].note}</p>
          </div>
          <h3>Make yourself at home</h3>
          <p>
            Scroll to travel through four chapters. Wake the seed, choose a
            bloom, then save your own illustrated specimen. Everything happens
            here in your browser.
          </p>
          <h3>A fictional world, made with care</h3>
          <p>
            The plants, names and botanical details are imagined. No data is
            collected or submitted. The 3D world is original procedural artwork,
            created with Three.js. The source is open under MIT.
          </p>
          <p>Fonts: Cormorant Garamond and Manrope, SIL Open Font License.</p>
          <Button variant="outline" onClick={() => setPaused((v) => !v)}>
            {paused ? "Enable ambient motion" : "Use still view"}
          </Button>
          <a className="notes-credit" href="https://lndev.me">
            Made by LN <ArrowUpRight size={14} />
          </a>
        </SheetContent>
      </Sheet>
    </>
  );
}
