"use client";
import {
  Component,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type CSSProperties,
} from "react";
import dynamic from "next/dynamic";
import { toast } from "sonner";
import {
  ArrowDown,
  ArrowUpRight,
  Check,
  Download,
  Menu,
  ToggleLeft,
  ToggleRight,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { alignmentName, constellation, presets } from "@/lib/journey";
import { initialLoad, type LoadState } from "@/lib/loading";

function Unavailable({ onLoad }: { onLoad: (value: LoadState) => void }) {
  useEffect(
    () =>
      onLoad({
        status: "fallback",
        progress: 100,
        stage: "A still view of the universe",
      }),
    [onLoad],
  );
  return null;
}
const World = dynamic(
  () => import("./scene").then((m) => m.Scene).catch(() => Unavailable),
  { ssr: false },
);
class SceneBoundary extends Component<
  { children: ReactNode; onFailure: () => void },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onFailure();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}
const chapters = [
  "The eclipse",
  "The instrument",
  "The passage",
  "Your alignment",
];

export function Observatory() {
  const [load, setLoad] = useState(initialLoad),
    [fonts, setFonts] = useState(false),
    [entered, setEntered] = useState(false),
    [revealing, setRevealing] = useState(false),
    [still, setStill] = useState(false),
    [slow, setSlow] = useState(false),
    [paused, setPaused] = useState(false),
    [notes, setNotes] = useState(false),
    [chapter, setChapter] = useState(0),
    [alignment, setAlignment] = useState(50),
    [saved, setSaved] = useState(false),
    [active, setActive] = useState(true);
  const progress = useRef(0),
    main = useRef<HTMLElement>(null),
    acceptedStill = useRef(false),
    lastChapter = useRef(0);
  const onLoad = useCallback((next: LoadState) => {
    if (!acceptedStill.current) setLoad(next);
  }, []);
  const useStill = useCallback(() => {
    acceptedStill.current = true;
    setStill(true);
    setFonts(true);
    setLoad({
      status: "fallback",
      progress: 100,
      stage: "A still view of the universe",
    });
  }, []);
  useEffect(() => {
    let alive = true;
    document.fonts.ready
      .then(() => {
        if (alive) setFonts(true);
      })
      .catch(() => {
        if (alive) setFonts(true);
      });
    const timeout = setTimeout(() => {
      if (alive) setSlow(true);
    }, 9000);
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setPaused(motion.matches);
    sync();
    motion.addEventListener("change", sync);
    return () => {
      alive = false;
      clearTimeout(timeout);
      motion.removeEventListener("change", sync);
    };
  }, []);
  useEffect(() => {
    if (load.status === "loading" || !fonts) return;
    setRevealing(true);
    const timer = setTimeout(() => setEntered(true), paused ? 0 : 800);
    return () => clearTimeout(timer);
  }, [load.status, fonts, paused]);
  useEffect(() => {
    if (entered) return;
    const previous = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = previous;
    };
  }, [entered]);
  useEffect(() => {
    document.documentElement.dataset.motion = paused ? "paused" : "on";
    return () => {
      delete document.documentElement.dataset.motion;
    };
  }, [paused]);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) =>
      setActive(entry.isIntersecting),
    );
    if (main.current) observer.observe(main.current);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    let frame = 0;
    const panels = [...document.querySelectorAll<HTMLElement>(".chapter")];
    const update = () => {
      frame = 0;
      let value = 0;
      panels.forEach((panel, index) => {
        const local = (scrollY - panel.offsetTop) / panel.offsetHeight;
        if (local >= 0) value = index + Math.min(1, local);
        const visible = local >= -0.55 && (index === 3 || local < 0.88);
        panel.dataset.visible = String(visible);
        panel.style.setProperty(
          "--presence",
          String(
            index === 3
              ? 1
              : Math.max(0, Math.min(1, 1 - Math.max(0, local - 0.45) * 3.4)),
          ),
        );
      });
      progress.current = Math.min(3, value);
      window.dispatchEvent(new Event("umbra:progress"));
      const next = Math.min(3, Math.floor(value + 0.001));
      if (lastChapter.current !== next) {
        setChapter(next);
        lastChapter.current = next;
      }
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
  const toggleMotion = () => {
    const nextPaused = !paused;
    setPaused(nextPaused);
    toast(
      <span key={String(nextPaused)} className="motion-toast-message">
        {nextPaused ? "Animations disabled" : "Animations enabled"}
      </span>,
      {
        id: "ambient-motion",
        description: "Scroll to explore at your own pace.",
        icon: nextPaused ? <ToggleLeft size={20} /> : <ToggleRight size={20} />,
      },
    );
  };
  const go = (index: number) => {
    setNotes(false);
    document
      .getElementById(`chapter-${index}`)
      ?.scrollIntoView({ behavior: paused ? "instant" : "smooth" });
  };
  const select = (value: number) => {
    setAlignment(value);
    setSaved(false);
  };
  const exportCard = () => {
    const stars = constellation(alignment),
      name = alignmentName(alignment);
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="1200" viewBox="0 0 900 1200"><defs><radialGradient id="glow"><stop offset="0" stop-color="#edbd8a"/><stop offset=".7" stop-color="#b77a4b" stop-opacity=".25"/><stop offset="1" stop-color="#080d16" stop-opacity="0"/></radialGradient></defs><rect width="900" height="1200" fill="#080d16"/><rect x="40" y="40" width="820" height="1120" fill="none" stroke="#4b443d"/><text x="82" y="128" fill="#f0e8db" font-family="sans-serif" font-size="54" letter-spacing="-3">UMBRA</text><text x="82" y="171" fill="#bfae98" font-family="monospace" font-size="13">A PERSONAL ALIGNMENT / STUDY 001</text><circle cx="450" cy="490" r="255" fill="url(#glow)"/><circle cx="450" cy="490" r="146" fill="none" stroke="#eed2ab" stroke-width="2"/><circle cx="${450 + (alignment - 50) * 2.4}" cy="490" r="140" fill="#0b1019"/><circle cx="450" cy="490" r="246" fill="none" stroke="#675341"/><polyline points="${stars.map((star) => `${star.x},${star.y}`).join(" ")}" fill="none" stroke="#b88e67" stroke-width="1"/>${stars.map((star) => `<circle cx="${star.x}" cy="${star.y}" r="${star.r}" fill="#ece0ce"/>`).join("")}<text x="82" y="900" fill="#f0e8db" font-family="sans-serif" font-size="64">${name}</text><text x="82" y="962" fill="#bda17f" font-family="monospace" font-size="19">ALIGNMENT ${alignment.toFixed(0).padStart(3, "0")} / 100</text><text x="82" y="1054" fill="#b5b5ae" font-family="sans-serif" font-size="21">A moment that belongs to you.</text><text x="82" y="1110" fill="#868980" font-family="monospace" font-size="13">IMAGINARY OBSERVATORY · MADE BY LN · LNDEV.ME</text></svg>`;
    const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `umbra-alignment-${Math.round(alignment)}.svg`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
    setSaved(true);
  };
  const percent = Math.min(
    100,
    Math.round(load.progress * 0.9 + (fonts ? 10 : 0)),
  );
  return (
    <>
      <div
        className="universe"
        aria-hidden="true"
        data-chapter={chapter}
        style={
          {
            "--alignment": `${(alignment - 50) * 0.4}px`,
          } as React.CSSProperties
        }
      >
        <div className="still-universe">
          <div className="still-orbit" />
          <div className="still-eclipse" />
          <div className="still-crosshair" />
        </div>
        {!still && (
          <SceneBoundary onFailure={useStill}>
            <World
              progress={progress}
              alignment={alignment}
              paused={paused}
              active={active && !notes}
              onLoad={onLoad}
            />
          </SceneBoundary>
        )}
        <div className="universe-vignette" />
      </div>
      {!entered && (
        <div
          className="loading-screen"
          data-leaving={revealing}
          role="status"
          aria-live="polite"
          aria-label="Preparing the observatory"
        >
          <div className="loading-meta">
            <span>UMBRA®</span>
            <span>OBSERVATORY / 001</span>
          </div>
          <div className="loader-aperture" aria-hidden="true">
            <i />
            <i />
            <i />
            <span />
          </div>
          <div className="loading-copy">
            <span className="eyebrow">ALLOW YOUR EYES TO ADJUST</span>
            <p>
              A little darkness.
              <br />
              <span>A different light.</span>
            </p>
          </div>
          <div className="loading-bottom">
            <span>
              {load.progress === 100 && !fonts
                ? "Setting the type"
                : load.stage}
            </span>
            <span aria-hidden="true">
              {String(percent).padStart(3, "0")}
              <small> / 100</small>
            </span>
            <Progress
              value={percent}
              locale="en-US"
              aria-label="Observatory preparation"
            />
          </div>
          {slow && (
            <Button
              variant="unstyled"
              className="loader-skip"
              onClick={useStill}
            >
              Continue with the still view <ArrowUpRight size={15} />
            </Button>
          )}
        </div>
      )}
      <div
        className="observatory-content"
        data-entered={entered || revealing}
        inert={revealing && !entered}
      >
        <header className="observatory-header">
          <a
            className="wordmark"
            href="#chapter-0"
            aria-label="Umbra, beginning"
          >
            <span className="brand-eclipse" /> UMBRA<sup>®</sup>
          </a>
          <span className="header-center">
            <i /> AN OBSERVATORY OF THE UNSEEN
          </span>
          <Button
            variant="unstyled"
            className="notes-button"
            onClick={() => setNotes(true)}
          >
            <span>Field guide</span>
            <Menu size={19} />
          </Button>
        </header>
        <main id="observatory" ref={main}>
          <section
            className="chapter hero"
            id="chapter-0"
            aria-labelledby="hero-title"
            data-visible="true"
          >
            <div className="chapter-inner">
              <div className="chapter-copy">
                <div className="eyebrow">
                  <span className="tiny-cross">+</span> AN IMAGINARY OBSERVATORY
                </div>
                <h1 id="hero-title">
                  BEYOND
                  <br />
                  THE <span className="outline-word">VISIBLE.</span>
                </h1>
                <p>
                  There is a moment when the light steps aside.
                  <br />
                  And everything else comes into view.
                </p>
                <Button
                  variant="unstyled"
                  className="journey-button"
                  onClick={() => go(1)}
                >
                  <span>Enter the penumbra</span>
                  <span className="button-orbit">
                    <ArrowDown size={18} />
                  </span>
                </Button>
              </div>
              <div className="specimen-tag">
                <span>FIG. 001</span>
                <i />
                <span>
                  THE ART OF
                  <br />
                  LOOKING CLOSER
                </span>
              </div>
              <div className="chapter-bottom">
                <span>
                  NOTHING TO RUSH.
                  <br />
                  EVERYTHING TO NOTICE.
                </span>
                <span>
                  SCROLL TO OBSERVE <ArrowDown size={14} />
                </span>
                <span className="coordinate">00° 00′ / INWARD</span>
              </div>
            </div>
          </section>
          <section
            className="chapter instrument-chapter"
            id="chapter-1"
            aria-labelledby="instrument-title"
          >
            <div className="chapter-inner">
              <div className="chapter-copy">
                <span className="eyebrow">01 / A DIFFERENT KIND OF FOCUS</span>
                <h2 id="instrument-title">
                  TAKE THE
                  <br />
                  LIGHT
                  <br />
                  <em>APART.</em>
                </h2>
                <p>
                  Not to explain the mystery.
                  <br />
                  To make a little more room for it.
                </p>
                <div className="instrument-key">
                  <span>
                    <i /> Aperture
                  </span>
                  <span>
                    <i /> Refraction
                  </span>
                  <span>
                    <i /> Possibility
                  </span>
                </div>
              </div>
              <div className="floating-caption">
                <span>OPTICAL ASSEMBLY</span>
                <strong>
                  3 elements.
                  <br />
                  Infinite ways to see.
                </strong>
              </div>
              <div className="chapter-bottom">
                <span>STUDY / 002</span>
                <span>
                  KEEP LOOKING <ArrowDown size={14} />
                </span>
                <span className="coordinate">THE SPACE BETWEEN</span>
              </div>
            </div>
          </section>
          <section
            className="chapter passage-chapter"
            id="chapter-2"
            aria-labelledby="passage-title"
          >
            <div className="chapter-inner">
              <div className="chapter-copy">
                <span className="eyebrow">02 / THE DISTANCE DISAPPEARS</span>
                <h2 id="passage-title">
                  LESS
                  <br />
                  <em>BETWEEN</em>
                  <br />
                  US.
                </h2>
                <p>
                  A point of light. An open door.
                  <br />
                  Sometimes distance is just an invitation.
                </p>
                <Button
                  variant="unstyled"
                  className="text-action"
                  onClick={() => go(3)}
                >
                  Find your alignment <ArrowUpRight size={18} />
                </Button>
              </div>
              <span className="passage-word" aria-hidden="true">
                ∞
              </span>
              <div className="chapter-bottom">
                <span>STUDY / 003</span>
                <span>
                  THROUGH, NOT TOWARD <ArrowDown size={14} />
                </span>
                <span className="coordinate">A QUIETER INFINITY</span>
              </div>
            </div>
          </section>
          <section
            className="chapter alignment-chapter"
            id="chapter-3"
            aria-labelledby="alignment-title"
          >
            <div className="chapter-inner">
              <div className="chapter-copy">
                <span className="eyebrow">03 / YOUR OWN SMALL PHENOMENON</span>
                <h2 id="alignment-title">
                  MAKE IT
                  <br />
                  <em>YOUR</em>
                  <br />
                  MOMENT.
                </h2>
                <p>
                  Move the light. Find a feeling.
                  <br />
                  Keep a little piece of the impossible.
                </p>
                <div className="alignment-controls">
                  <RadioGroup
                    value={String(alignment)}
                    onValueChange={(value) => select(Number(value))}
                    aria-label="Alignment presets"
                    className="preset-group"
                  >
                    {presets.map((preset, i) => (
                      <RadioGroupItem
                        key={preset.name}
                        value={String(preset.value)}
                        className="preset"
                      >
                        <span>0{i + 1}</span>
                        {preset.name}
                        <i />
                      </RadioGroupItem>
                    ))}
                  </RadioGroup>
                  <div className="slider-label">
                    <label id="alignment-label">LUNAR OFFSET</label>
                    <output>{((alignment - 50) * 0.024).toFixed(2)}°</output>
                  </div>
                  <Slider
                    value={alignment}
                    onValueChange={(value) =>
                      select(Array.isArray(value) ? value[0] : value)
                    }
                    min={0}
                    max={100}
                    step={1}
                    aria-labelledby="alignment-label"
                    thumbLabel="Lunar offset"
                    getAriaValueText={(_formatted, value) =>
                      `${alignmentName(value)} at ${value} percent`
                    }
                  />
                  <div className="slider-scale">
                    <span>FIRST CONTACT</span>
                    <span>TOTALITY</span>
                    <span>AFTERGLOW</span>
                  </div>
                  <Button
                    variant="unstyled"
                    className="export-button"
                    onClick={exportCard}
                  >
                    <span>
                      {saved ? "Your moment is saved" : "Keep this alignment"}
                    </span>
                    {saved ? <Check size={17} /> : <Download size={17} />}
                  </Button>
                  <span className="export-note" aria-live="polite">
                    {saved
                      ? "Your SVG observation card has been downloaded."
                      : "A personal observation card. Yours to keep."}
                  </span>
                </div>
              </div>
              <div className="alignment-readout">
                <span>YOUR OBSERVATION</span>
                <strong>{alignmentName(alignment)}</strong>
                <i />{" "}
                <span>
                  ALIGNMENT {Math.round(alignment).toString().padStart(3, "0")}{" "}
                  / 100
                </span>
              </div>
            </div>
          </section>
        </main>
        <nav className="chapter-navigation" aria-label="Observatory chapters">
          <div
            className="chapter-track"
            style={{ "--active-step": chapter } as CSSProperties}
          >
            <span className="chapter-indicator" aria-hidden="true" />
            {chapters.map((name, index) => (
              <Button
                key={name}
                variant="unstyled"
                className={
                  chapter === index ? "chapter-dot active" : "chapter-dot"
                }
                aria-label={`${index + 1}. ${name}`}
                aria-current={chapter === index ? "step" : undefined}
                onClick={() => go(index)}
              >
                <span>0{index + 1}</span>
                <i />
                <span className="chapter-label">{name}</span>
              </Button>
            ))}
          </div>
        </nav>
        <div className="motion-controls">
          <span>
            {load.status === "ready" ? "LIVE OBSERVATION" : "STILL OBSERVATION"}
          </span>
          <Button
            variant="unstyled"
            className="motion-button"
            onClick={toggleMotion}
            aria-pressed={!paused}
            aria-label="Ambient animations"
            aria-description="Controls automatic movement only. Scroll to explore at any time."
            title={
              paused
                ? "Enable ambient animations"
                : "Disable ambient animations"
            }
          >
            {paused ? (
              <ToggleLeft size={20} aria-hidden="true" />
            ) : (
              <ToggleRight size={20} aria-hidden="true" />
            )}
          </Button>
        </div>
        <footer className="observatory-footer">
          <div className="footer-top">
            <span className="eyebrow">EVERY END IS ANOTHER BEGINNING</span>
            <Button
              variant="unstyled"
              className="return-button"
              onClick={() => go(0)}
            >
              LOOK AGAIN. <ArrowUpRight />
            </Button>
          </div>
          <div className="footer-bottom">
            <a className="wordmark" href="#chapter-0">
              UMBRA<sup>®</sup>
            </a>
            <p>
              An imaginary observatory.
              <br />A real invitation to wonder.
            </p>
            <div>
              <span>
                Developed by{" "}
                <a href="https://lndev.me" target="_blank" rel="noreferrer">
                  LN ↗
                </a>
              </span>
              <a
                href="https://github.com/ln-dev7/landing-pages"
                target="_blank"
                rel="noreferrer"
              >
                Open source · MIT ↗
              </a>
              <a
                href="https://lndev.mychariow.shop/prd_3cu1s0"
                target="_blank"
                rel="noreferrer"
              >
                Support the project ↗
              </a>
            </div>
          </div>
        </footer>
        <Sheet open={notes} onOpenChange={setNotes}>
          <SheetContent className="field-guide">
            <span className="eyebrow">UMBRA / OBSERVER’S NOTES</span>
            <div className="guide-emblem" aria-hidden="true">
              <i />
            </div>
            <SheetTitle>
              A place to
              <br />
              look a little longer.
            </SheetTitle>
            <SheetDescription>
              Four observations at the edge of light. A fictional instrument for
              a very human curiosity.
            </SheetDescription>
            <nav className="guide-chapters" aria-label="Jump to a chapter">
              {chapters.map((name, i) => (
                <Button key={name} variant="unstyled" onClick={() => go(i)}>
                  <span>0{i + 1}</span>
                  {name}
                  <ArrowUpRight size={17} />
                </Button>
              ))}
            </nav>
            <h3>A note on the universe</h3>
            <p>
              UMBRA is an interactive design study, not an astronomical
              simulation. Its eclipse, coordinates and instruments are imagined.
              Nothing is booked or submitted, and your observation card is
              generated on your device.
            </p>
            <h3>At your own pace</h3>
            <p>
              Scroll naturally in either direction. Turn off ambient animations
              for a still view; the chapters and alignment controls remain yours
              to explore.
            </p>
            <Button variant="outline" onClick={toggleMotion}>
              {paused ? (
                <ToggleLeft size={20} aria-hidden="true" />
              ) : (
                <ToggleRight size={20} aria-hidden="true" />
              )}
              {paused
                ? "Enable ambient animations"
                : "Disable ambient animations"}
            </Button>
            <a className="guide-credit" href="https://lndev.me">
              An experiment by LN <ArrowUpRight size={17} />
            </a>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
