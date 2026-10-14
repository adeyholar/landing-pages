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
  ArrowRight,
  Download,
  ToggleLeft,
  ToggleRight,
  Plus,
  Wind,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet";
import { FlightLoader } from "@/components/flight-loader";
import { LIVERIES, type LoadState } from "@/lib/flight";
const World = dynamic(() => import("./world").then((m) => m.World), {
  ssr: false,
});
class FlightBoundary extends Component<
  { children: ReactNode; onError: () => void },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onError();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}
const CHAPTERS = ["The invitation", "The fold", "The elsewhere", "Your flight"];
export function Aero() {
  const [chapter, setChapter] = useState(0),
    [paused, setPaused] = useState(false),
    [notes, setNotes] = useState(false),
    [kind, setKind] = useState(2),
    [wind, setWind] = useState(45),
    [launch, setLaunch] = useState(0),
    [saved, setSaved] = useState(false),
    [fonts, setFonts] = useState(false),
    [quiet, setQuiet] = useState(false),
    [phase, setPhase] = useState<"loading" | "revealing" | "entered">(
      "loading",
    ),
    [load, setLoad] = useState<LoadState>({
      status: "loading",
      progress: 0,
      stage: "Opening the departure gate",
    });
  const scroll = useRef(0),
    view = useRef(true),
    stage = useRef<HTMLDivElement>(null),
    quietFocus = useRef(false);
  const fallback = useCallback(() => {
    setQuiet(true);
    setLoad({
      status: "fallback",
      progress: 100,
      stage: "Your illustrated flight is ready",
    });
  }, []);
  const onWorldLoad = useCallback(
    (state: LoadState) => {
      if (state.status === "fallback") fallback();
      else setLoad(state);
    },
    [fallback],
  );
  const bypass = useCallback(() => {
    quietFocus.current = true;
    setFonts(true);
    fallback();
  }, [fallback]);
  const complete = fonts && load.status !== "loading";
  const percent = complete
    ? 100
    : Math.min(99, Math.round(load.progress * 0.94 + (fonts ? 6 : 0)));
  useEffect(() => {
    let disposed = false;
    const prepare = async () => {
      try {
        const css = getComputedStyle(document.documentElement);
        await Promise.allSettled([
          document.fonts.load(
            `700 16px ${css.getPropertyValue("--font-space")}`,
          ),
          document.fonts.load(
            `400 16px ${css.getPropertyValue("--font-manrope")}`,
          ),
        ]);
        await document.fonts.ready;
      } finally {
        if (!disposed) setFonts(true);
      }
    };
    void prepare().catch(() => {});
    return () => {
      disposed = true;
    };
  }, []);
  useEffect(() => {
    if (!complete || phase !== "loading") return;
    const timer = setTimeout(() => setPhase("revealing"), 160);
    return () => clearTimeout(timer);
  }, [complete, phase]);
  useEffect(() => {
    if (phase !== "revealing") return;
    const timer = setTimeout(
      () => {
        setPhase("entered");
        if (quietFocus.current)
          requestAnimationFrame(() =>
            document.getElementById("journey")?.focus({ preventScroll: true }),
          );
      },
      paused ? 0 : 850,
    );
    return () => clearTimeout(timer);
  }, [phase, paused]);
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
    let frame = 0;
    const panels = [
      ...document.querySelectorAll<HTMLElement>(".flight-chapter"),
    ];
    const update = () => {
      frame = 0;
      let p = 0;
      for (let i = 0; i < panels.length; i++) {
        const top = panels[i].offsetTop;
        if (scrollY >= top)
          p =
            i +
            (scrollY - top) /
              (panels[i + 1] ? panels[i + 1].offsetTop - top : innerHeight);
      }
      scroll.current = Math.max(0, Math.min(3.6, p));
      window.dispatchEvent(new Event("aero:progress"));
      setChapter(Math.min(3, Math.floor(p)));
      stage.current?.style.setProperty("--journey", String(Math.min(1, p / 3)));
    };
    const queue = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    queue();
    addEventListener("scroll", queue, { passive: true });
    addEventListener("resize", queue);
    const observer = new IntersectionObserver(([entry]) => {
      view.current = entry.isIntersecting;
    });
    const journey = document.getElementById("journey");
    if (journey) observer.observe(journey);
    return () => {
      cancelAnimationFrame(frame);
      removeEventListener("scroll", queue);
      removeEventListener("resize", queue);
      observer.disconnect();
    };
  }, []);
  const toggleMotion = () => {
    const nextPaused = !paused;
    setPaused(nextPaused);
    toast(nextPaused ? "Animations disabled" : "Animations enabled", {
      id: "ambient-motion",
      description: "Scroll to explore at your own pace.",
      icon: nextPaused ? <ToggleLeft size={20} /> : <ToggleRight size={20} />,
    });
  };
  const go = (n: number) =>
    document
      .getElementById(`flight-${n}`)
      ?.scrollIntoView({ behavior: paused ? "instant" : "smooth" });
  const download = () => {
    const l = LIVERIES[kind];
    const code = `AE-${l.code}-${String(wind).padStart(3, "0")}`;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="700" viewBox="0 0 1200 700"><rect width="1200" height="700" fill="#f4f1e7"/><path d="M880 0v700" stroke="#2046ed" stroke-width="2" stroke-dasharray="9 9"/><rect x="32" y="32" width="1136" height="636" rx="16" fill="none" stroke="#2046ed" stroke-width="2"/><g fill="#2046ed" font-family="Arial,sans-serif"><text x="70" y="130" font-size="72" font-weight="700">AÉRO®</text><text x="70" y="200" font-size="20" letter-spacing="4">BUREAU OF PAPER FLIGHTS</text><text x="70" y="340" font-size="78" font-weight="700">HERE → ELSEWHERE</text><text x="70" y="410" font-size="25">${l.name} / Updraft ${wind}% / Flight ${code}</text><text x="70" y="550" font-size="23">A little paper. A lot of elsewhere.</text><text x="70" y="610" font-size="17">A fictional flight. A real daydream. Developed by LN / lndev.me</text><text x="930" y="535" font-size="24" transform="rotate(-90 930 535)">KEEP YOUR HEAD IN THE CLOUDS</text></g><path d="m942 240 180-115-87 195-23-89Z" fill="${l.color === "#f4f1e7" ? "#2046ed" : l.color}"/><path d="m1012 231 110-106-96 139Z" fill="#efd762"/><g stroke="#2046ed" stroke-width="3">${Array.from({ length: 40 }, (_, i) => `<path d="M${925 + i * 5} 570v${i % 3 === 0 ? 55 : 40}"/>`).join("")}</g></svg>`;
    const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `aero-${code.toLowerCase()}.svg`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setSaved(true);
  };
  return (
    <div
      className="aero-shell"
      data-chapter={chapter}
      data-phase={phase}
      data-3d={load.status === "ready" && !quiet}
      ref={stage}
    >
      <div className="airspace" aria-hidden="true">
        <div
          className="illustrated-plane"
          style={
            {
              "--paper": LIVERIES[kind].color,
              "--ink": LIVERIES[kind].ink,
              "--lift": `${wind / 6}px`,
              "--bank": `${launch % 2 === 0 ? -14 : 8}deg`,
            } as React.CSSProperties
          }
        >
          <svg viewBox="0 0 600 450">
            <defs>
              <filter id="paper-shadow">
                <feDropShadow
                  dx="0"
                  dy="25"
                  stdDeviation="15"
                  floodColor="#172567"
                  floodOpacity=".15"
                />
              </filter>
            </defs>
            <g filter="url(#paper-shadow)">
              <path
                d="m55 265 490-215-220 345-75-159Z"
                fill="var(--paper)"
                stroke="var(--ink)"
                strokeWidth="2"
              />
              <path d="m250 236 295-186-254 245Z" fill="var(--ink)" />
              <path d="m291 295 34 100-75-159Z" fill="#ddd9cd" />
              <path
                d="m325 395 220-345-212 255Z"
                fill="var(--paper)"
                stroke="var(--ink)"
                strokeWidth="2"
              />
              <text
                x="340"
                y="230"
                fill="var(--ink)"
                fontSize="19"
                fontFamily="monospace"
                transform="rotate(-32 340 230)"
              >
                AÉRO / 001
              </text>
            </g>
          </svg>
        </div>
        {!quiet && (
          <FlightBoundary onError={fallback}>
            <World
              scroll={scroll}
              inView={view}
              paused={paused || phase !== "entered" || notes}
              kind={kind}
              wind={wind}
              launch={launch}
              onLoad={onWorldLoad}
            />
          </FlightBoundary>
        )}
        <div className="airspace-grain" />
      </div>
      <div
        className="aero-content"
        inert={phase === "revealing"}
        aria-busy={phase !== "entered"}
      >
        <header className="aero-header">
          <a href="#flight-0" className="brand" aria-label="Aéro, beginning">
            AÉRO<span>®</span>
          </a>
          <span className="header-center micro">
            BUREAU OF PAPER FLIGHTS
            <br />
            <span>For the pleasantly elsewhere.</span>
          </span>
          <Button
            variant="unstyled"
            className="info-button"
            onClick={() => setNotes(true)}
          >
            Flight notes <Plus size={18} />
          </Button>
        </header>
        <main id="journey" tabIndex={-1}>
          <section
            className="flight-chapter invitation"
            id="flight-0"
            aria-labelledby="invitation-title"
          >
            <div className="chapter-inner">
              <div className="invitation-meta micro">
                <span className="status-dot" /> NOW BOARDING / IMAGINATION
                REQUIRED
              </div>
              <h1 id="invitation-title">
                A little
                <br />
                paper.
                <br />
                <span>
                  A lot of
                  <br />
                  <em>elsewhere.</em>
                </span>
              </h1>
              <div className="hero-ticket">
                <span className="micro">
                  ONE WAY / NO PARTICULAR DESTINATION
                </span>
                <p>
                  The best trips start
                  <br />
                  with almost nothing.
                </p>
                <Button
                  variant="unstyled"
                  className="round-arrow"
                  aria-label="Begin unfolding the story"
                  onClick={() => go(1)}
                >
                  <ArrowDown size={22} />
                </Button>
              </div>
              <div className="plane-label micro">
                <span>AE—001</span>
                <i /> PAPER / POSSIBILITY / A LITTLE NERVE
              </div>
              <div className="chapter-baseline micro">
                <span>SCROLL TO TAKE THE SCENIC ROUTE ↓</span>
                <span>NO PASSPORT. JUST CURIOSITY.</span>
              </div>
            </div>
          </section>
          <section
            className="flight-chapter folding"
            id="flight-1"
            aria-labelledby="fold-title"
          >
            <div className="chapter-inner">
              <div className="section-number">
                01 <span>THE MAKING OF A MAYBE</span>
              </div>
              <h2 id="fold-title">
                Nothing
                <br />
                fancy.
                <br />
                <span>
                  Just a<br />
                  different
                  <br />
                  angle.
                </span>
              </h2>
              <div className="fold-explainer">
                <span className="micro">ONE SHEET. ENDLESS POTENTIAL.</span>
                <p>
                  A corner meets a corner.
                  <br />
                  An ordinary thing becomes
                  <br />a reason to look up.
                </p>
                <div className="fold-steps" aria-label="Fold sequence">
                  <span>01 / Open</span>
                  <span>02 / Crease</span>
                  <span>03 / Believe</span>
                </div>
              </div>
              <span className="fold-stamp" aria-hidden="true">
                100%
                <br />
                <small>
                  PURE
                  <br />
                  POSSIBILITY
                </small>
              </span>
              <div className="chapter-baseline micro">
                <span>PRECISION IS NICE. PLAY IS BETTER.</span>
                <span>CONTINUE TO FOLD ↓</span>
              </div>
            </div>
          </section>
          <section
            className="flight-chapter passage"
            id="flight-2"
            aria-labelledby="passage-title"
          >
            <div className="chapter-inner">
              <div className="section-number">
                02 <span>A SMALL LEAP OF FAITH</span>
              </div>
              <div className="passage-heading">
                <h2 id="passage-title">
                  Catch
                  <br />a little
                  <br />
                  <em>elsewhere.</em>
                </h2>
                <span className="route-coordinate micro">
                  48° DAYDREAM
                  <br />
                  02° OFF SCRIPT
                </span>
              </div>
              <div className="passage-note">
                <Wind size={25} />
                <p>
                  Follow a current.
                  <br />
                  Miss a turn.
                  <br />
                  Find something good.
                </p>
              </div>
              <div className="flight-instrument micro">
                <span className="instrument-cross" />{" "}
                <div>
                  DESTINATION
                  <br />
                  <strong>WIDE OPEN</strong>
                </div>
              </div>
              <div className="chapter-baseline micro">
                <span>YOU’RE ALLOWED TO WANDER.</span>
                <span>KEEP GOING. THERE’S ROOM.</span>
              </div>
            </div>
          </section>
          <section
            className="flight-chapter cockpit"
            id="flight-3"
            aria-labelledby="cockpit-title"
          >
            <div className="chapter-inner">
              <div className="section-number">
                03 <span>YOUR TURN AT THE CONTROLS</span>
              </div>
              <h2 id="cockpit-title">
                Make it
                <br />
                <em>
                  your kind
                  <br />
                  of flight.
                </em>
              </h2>
              <div className="pilot-card">
                <div className="pilot-card-head">
                  <span className="micro">PERSONAL FLIGHT PLAN</span>
                  <span className="micro">AE—00{launch + 1}</span>
                </div>
                <fieldset>
                  <legend>Pick your paper.</legend>
                  <RadioGroup
                    value={String(kind)}
                    onValueChange={(value) => {
                      setKind(Number(value));
                      setSaved(false);
                    }}
                    aria-label="Paper colour"
                    className="liveries"
                  >
                    {LIVERIES.map((l, i) => (
                      <RadioGroupItem
                        key={l.name}
                        value={String(i)}
                        className="livery"
                      >
                        <span
                          className="livery-swatch"
                          style={{ background: l.color }}
                        />
                        <span>{l.name}</span>
                      </RadioGroupItem>
                    ))}
                  </RadioGroup>
                </fieldset>
                <Slider
                  label="A little more updraft"
                  min={0}
                  max={100}
                  value={wind}
                  onValueChange={(value) => {
                    setWind(value);
                    setSaved(false);
                  }}
                />
                <p className="pilot-hint">
                  Move the current. Watch your plane rise.
                </p>
                <Button
                  className="launch-button"
                  onClick={() => {
                    setLaunch((n) => n + 1);
                    setSaved(false);
                  }}
                >
                  <span>
                    {launch
                      ? "One more little adventure"
                      : "Give it a little throw"}
                  </span>
                  <ArrowUpRight size={24} />
                </Button>
                <div className="flight-status" role="status">
                  {launch
                    ? `Flight ${String(launch).padStart(2, "0")} launched. A good day to go a little further.`
                    : "All systems wonderfully unnecessary. Ready when you are."}
                </div>
                <Button
                  variant="ghost"
                  className="save-flight"
                  onClick={download}
                >
                  <Download size={17} />
                  {saved
                    ? "Download your flight card again"
                    : "Keep your flight card"}
                </Button>
                <p className="micro pilot-footnote">
                  A DIGITAL KEEPSAKE. NO EMAIL REQUIRED.
                </p>
              </div>
              <div className="cockpit-caption micro">
                YOUR PLANE / YOUR PACE
                <br />
                <span>
                  Engineered for absolutely no reason
                  <br />
                  other than a little delight.
                </span>
              </div>
            </div>
          </section>
        </main>
        <nav className="flight-nav" aria-label="Journey chapters">
          <div
            className="nav-track"
            style={{ "--active-step": chapter } as CSSProperties}
          >
            <span className="nav-indicator" aria-hidden="true" />
            {CHAPTERS.map((name, i) => (
              <Button
                variant="unstyled"
                key={name}
                aria-label={`${i + 1}. ${name}`}
                aria-current={chapter === i ? "step" : undefined}
                onClick={() => go(i)}
              >
                <span className="nav-digit">0{i + 1}</span>
                <span className="nav-word">{name}</span>
              </Button>
            ))}
          </div>
          <Button
            variant="unstyled"
            className="motion-button"
            aria-label="Ambient animations"
            aria-description="Controls automatic movement only. Scroll to explore at any time."
            title={
              paused
                ? "Enable ambient animations"
                : "Disable ambient animations"
            }
            aria-pressed={!paused}
            onClick={toggleMotion}
          >
            {paused ? (
              <ToggleLeft size={20} aria-hidden="true" />
            ) : (
              <ToggleRight size={20} aria-hidden="true" />
            )}
          </Button>
        </nav>
        <footer className="aero-footer">
          <div className="footer-top">
            <span className="brand">
              AÉRO<span>®</span>
            </span>
            <p>
              Keep your head
              <br />
              in the <em>clouds.</em>
            </p>
            <Button variant="unstyled" onClick={() => go(0)}>
              Back to the beginning <ArrowUpRight size={18} />
            </Button>
          </div>
          <div className="footer-bottom">
            <span>A fictional flight bureau. A real little escape.</span>
            <a href="https://lndev.me">Developed by LN ↗</a>
            <a href="https://github.com/ln-dev7/landing-pages">
              Open source · MIT ↗
            </a>
            <a href="https://lndev.mychariow.shop/prd_3cu1s0">
              Support the project ↗
            </a>
          </div>
        </footer>
        <Sheet open={notes} onOpenChange={setNotes}>
          <SheetContent className="flight-notes">
            <span className="micro">PLEASE READ BEFORE DAYDREAMING</span>
            <SheetTitle>
              A brief
              <br />
              flight briefing.
            </SheetTitle>
            <SheetDescription>
              AÉRO is an imaginary bureau of paper flights. No tickets, no
              timetable. Just one sheet and a good excuse to see where it goes.
            </SheetDescription>
            <div className="notes-route">
              {CHAPTERS.map((name, i) => (
                <Button
                  key={name}
                  variant="unstyled"
                  onClick={() => {
                    setNotes(false);
                    go(i);
                  }}
                >
                  <span>0{i + 1}</span>
                  {name}
                  <ArrowRight size={19} />
                </Button>
              ))}
            </div>
            <h3>Make yourself comfortable.</h3>
            <p>
              Scroll at your own pace. The sheet unfolds, its hinges fold it
              into a plane, and your journey carries it through real
              three-dimensional airspace. At the end, choose a paper colour and
              change its updraft.
            </p>
            <p>
              Turn off ambient animations for a still view. Scrolling and the
              controls remain active.
            </p>
            <Button variant="outline" onClick={toggleMotion}>
              {paused ? (
                <ToggleLeft size={20} aria-hidden="true" />
              ) : (
                <ToggleRight size={20} aria-hidden="true" />
              )}{" "}
              {paused
                ? "Enable ambient animations"
                : "Disable ambient animations"}
            </Button>
            <p className="notes-small">
              The artwork is original and procedural. Your illustrated flight
              card is generated in your browser. No audio, tracking, account or
              saved personal data.
            </p>
            <a href="https://lndev.me" className="notes-credit">
              Made with curiosity by LN <ArrowUpRight size={18} />
            </a>
          </SheetContent>
        </Sheet>
      </div>
      {phase !== "entered" && (
        <FlightLoader
          progress={percent}
          stage={
            !fonts && load.status !== "loading"
              ? "Setting the final type"
              : load.stage
          }
          leaving={phase === "revealing"}
          onQuiet={bypass}
        />
      )}
    </div>
  );
}
