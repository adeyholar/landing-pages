"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ObjectDrawing } from "@/components/object";
export const finishes = [
  {
    id: "natural",
    name: "Sunday oak",
    color: "#bc9155",
    mood: "Warm, easy, goes with everything.",
  },
  {
    id: "cherry",
    name: "Cherry on top",
    color: "#904832",
    mood: "A little richer. A little unexpected.",
  },
  {
    id: "ink",
    name: "After midnight",
    color: "#4b5364",
    mood: "Quietly bold. Very good company.",
  },
];
export function Configurator() {
  const [finish, setFinish] = useState("natural");
  const [turned, setTurned] = useState(false);
  const picked = finishes.find((f) => f.id === finish)!;
  return (
    <section className="configurator section-pad" id="make-it-yours">
      <div className="config-object" data-finish={finish}>
        <span className="eyebrow">LITTLE FELLOW / YOUR EDITION</span>
        <div className="config-stage">
          <ObjectDrawing finish={finish} turned={turned} />
        </div>
        <Button
          variant="ghost"
          onClick={() => setTurned((v) => !v)}
          aria-pressed={turned}
        >
          <RotateCcw size={17} /> Another angle
        </Button>
        <span className="dimension">H 42 × W 38 CM</span>
      </div>
      <div className="config-copy" data-reveal>
        <p className="eyebrow">SAME LITTLE FELLOW. DIFFERENT MOOD.</p>
        <h2>
          Make yourself
          <br />
          <em>at home.</em>
        </h2>
        <p>
          Your room has a personality.
          <br />
          Your furniture should, too.
        </p>
        <fieldset>
          <legend className="eyebrow">PICK A FINISH</legend>
          <RadioGroup
            value={finish}
            onValueChange={(v) => setFinish(String(v))}
            className="finish-options"
            aria-label="Choose a finish"
          >
            {finishes.map((f) => (
              <RadioGroupItem
                key={f.id}
                value={f.id}
                className="finish-option"
                aria-label={f.name}
              >
                <span style={{ background: f.color }} />
                {f.name}
              </RadioGroupItem>
            ))}
          </RadioGroup>
        </fieldset>
        <p className="finish-mood" role="status">
          {picked.mood}
        </p>
        <Button
          nativeButton={false}
          render={<Link href={`/commission?piece=stool&finish=${finish}`} />}
        >
          That’s my kind of thing <ArrowUpRight size={19} />
        </Button>
        <p className="small muted">
          Original 3D concept. Your choice goes into a sample brief.
        </p>
      </div>
    </section>
  );
}
