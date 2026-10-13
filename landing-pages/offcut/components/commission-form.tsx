"use client";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel, FieldDescription } from "@/components/ui/field";
import {
  InputGroup,
  InputGroupTextarea,
  InputGroupAddon,
} from "@/components/ui/input-group";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ObjectDrawing } from "@/components/object";
import { finishes } from "@/components/configurator";
const pieces = [
  { id: "stool", name: "Little fellow", price: 185 },
  { id: "table", name: "Side character", price: 240 },
  { id: "chair", name: "Bend the rules", price: 420 },
];
export function CommissionForm({
  initialPiece = "stool",
  initialFinish = "natural",
}: {
  initialPiece?: string;
  initialFinish?: string;
}) {
  const [piece, setPiece] = useState(
    pieces.some((p) => p.id === initialPiece) ? initialPiece : "stool",
  );
  const [finish, setFinish] = useState(
    finishes.some((f) => f.id === initialFinish) ? initialFinish : "natural",
  );
  const [name, setName] = useState("");
  const [note, setNote] = useState("");
  const [complete, setComplete] = useState(false);
  const title = useRef<HTMLHeadingElement>(null);
  const selected = pieces.find((p) => p.id === piece)!;
  const chosen = finishes.find((f) => f.id === finish)!;
  const kind = piece as "stool" | "table" | "chair";
  function save() {
    const content = `OFFCUT — Sample project brief\n\nName: ${name}\nPiece: ${selected.name}\nFinish: ${chosen.name}\nExample starting price: £${selected.price}\n\nThe idea:\n${note || "A little room for something different."}\n\nFictional design concept. This is not an order or quote. No information was submitted.`;
    const url = URL.createObjectURL(
      new Blob([content], { type: "text/plain" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = "offcut-sample-brief.txt";
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  if (complete)
    return (
      <div className="summary completed-brief">
        <p className="eyebrow">A LITTLE IDEA, ALL TOGETHER.</p>
        <h2 ref={title} tabIndex={-1}>
          Looking good, {name}.
        </h2>
        <ObjectDrawing kind={kind} finish={finish} />
        <dl>
          <dt>Your piece</dt>
          <dd>{selected.name}</dd>
          <dt>The finish</dt>
          <dd>{chosen.name}</dd>
          <dt>Example starting price</dt>
          <dd>£{selected.price}</dd>
        </dl>
        <p>{note}</p>
        <p className="form-demo">
          Your sample brief is ready. It has not been sent to anyone, and it is
          not an order.
        </p>
        <div className="summary-actions">
          <Button onClick={save}>Keep my brief ↓</Button>
          <Button
            variant="outline"
            onClick={() => {
              setComplete(false);
              requestAnimationFrame(() =>
                document.getElementById("project-name")?.focus(),
              );
            }}
          >
            A little change…
          </Button>
        </div>
      </div>
    );
  return (
    <div className="commission-layout">
      <div>
        <p className="form-demo">
          This is a fictional studio. Use a sample name. Your brief stays on
          this page; nothing is sent or ordered.
        </p>
        <form
          className="form-panel"
          onSubmit={(e) => {
            e.preventDefault();
            setComplete(true);
            requestAnimationFrame(() => title.current?.focus());
          }}
        >
          <div className="form-grid">
            <fieldset className="full">
              <legend className="eyebrow">WHICH LITTLE CHARACTER?</legend>
              <RadioGroup
                value={piece}
                onValueChange={(v) => setPiece(String(v))}
                className="choice-options"
                aria-label="Choose your piece"
              >
                {pieces.map((p) => (
                  <RadioGroupItem value={p.id} key={p.id}>
                    {p.name}
                  </RadioGroupItem>
                ))}
              </RadioGroup>
            </fieldset>
            <fieldset className="full">
              <legend className="eyebrow">AND ITS MOOD?</legend>
              <RadioGroup
                value={finish}
                onValueChange={(v) => setFinish(String(v))}
                className="choice-options"
                aria-label="Choose your finish"
              >
                {finishes.map((f) => (
                  <RadioGroupItem value={f.id} key={f.id}>
                    {f.name}
                  </RadioGroupItem>
                ))}
              </RadioGroup>
            </fieldset>
            <Field className="field full">
              <FieldLabel htmlFor="project-name">
                What shall we call you?
              </FieldLabel>
              <Input
                id="project-name"
                placeholder="e.g. Alex"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                maxLength={60}
                autoComplete="off"
              />
            </Field>
            <Field className="field full">
              <FieldLabel htmlFor="project-note">
                Tell us about your corner of the world.
              </FieldLabel>
              <InputGroup className="brief-input-group">
                <InputGroupTextarea
                  id="project-note"
                  placeholder="A sunny reading corner, a tiny hallway, a very particular shade of blue…"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  maxLength={1200}
                  aria-describedby="note-help"
                />
                <InputGroupAddon align="block-end">
                  <span>ROOM FOR YOUR ODD IDEA</span>
                  <span>{note.length}/1,200</span>
                </InputGroupAddon>
              </InputGroup>
              <FieldDescription id="note-help">
                Optional. Keep it light; no address or personal information
                needed.
              </FieldDescription>
            </Field>
          </div>
          <Button type="submit">Bring the idea together ↗</Button>
        </form>
      </div>
      <aside className="commission-preview">
        <p className="eyebrow">YOUR LITTLE CHARACTER</p>
        <ObjectDrawing kind={kind} finish={finish} />
        <h2>{selected.name}</h2>
        <p>
          {chosen.name}
          <br />
          From £{selected.price} · illustrative price
        </p>
      </aside>
    </div>
  );
}
