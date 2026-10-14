"use client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/date-picker";
import { Field, FieldLabel, FieldDescription } from "@/components/ui/field";
import {
  InputGroup,
  InputGroupTextarea,
  InputGroupAddon,
} from "@/components/ui/input-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { brand } from "@/lib/content";

function localDate() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function GroupInquiry() {
  const [done, setDone] = useState(false);
  const [today, setToday] = useState("");
  const [details, setDetails] = useState({
    name: "",
    email: "",
    guests: "6",
    date: "",
    message: "",
    consent: false,
  });
  const result = useRef<HTMLDivElement>(null);
  const nameField = useRef<HTMLInputElement>(null);
  useEffect(() => setToday(localDate()), []);
  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setDone(true);
    requestAnimationFrame(() => result.current?.focus());
  }
  function edit() {
    setDone(false);
    requestAnimationFrame(() => nameField.current?.focus());
  }
  const summary = `${details.name}, your example enquiry is for ${details.guests} guests, on ${details.date.split("-").reverse().join(" / ")}. The ${brand.slug === "crux" ? "coached group session" : "private bath house ritual"} would start at ${brand.currency}${Number(details.guests) * (brand.slug === "crux" ? 28 : 45)}.`;
  return (
    <section className="group-form" id="enquiry">
      <p className="eyebrow">Make a little room for your people</p>
      <h2>
        {brand.slug === "crux" ? "Bring your crew." : "A gathering, your way."}
      </h2>
      <p className="demo-note">Example enquiry · nothing is sent to a venue.</p>
      {done ? (
        <div ref={result} tabIndex={-1} className="confirmation" role="status">
          <h3>Your enquiry preview</h3>
          <p>{summary}</p>
          <p>
            No request has been sent. This is an interactive design concept.
          </p>
          <Button onClick={edit}>
            Edit enquiry <span aria-hidden="true">↗︎</span>
          </Button>
        </div>
      ) : (
        <form onSubmit={submit}>
          <div className="field-grid">
            <Label className="field">
              Your name
              <Input
                ref={nameField}
                name="name"
                required
                maxLength={80}
                autoComplete="name"
                value={details.name}
                onChange={(e) =>
                  setDetails({ ...details, name: e.target.value })
                }
              />
            </Label>
            <Label className="field">
              Email
              <Input
                name="email"
                required
                type="email"
                maxLength={160}
                autoComplete="email"
                value={details.email}
                onChange={(e) =>
                  setDetails({ ...details, email: e.target.value })
                }
              />
            </Label>
            <Label className="field">
              Number of guests
              <Input
                name="guests"
                type="number"
                required
                min="6"
                max={brand.slug === "crux" ? 20 : 12}
                value={details.guests}
                onChange={(e) =>
                  setDetails({ ...details, guests: e.target.value })
                }
              />
            </Label>
            <DatePicker
              label="Preferred date"
              min={today}
              value={details.date}
              onChange={(date) => setDetails({ ...details, date })}
            />
          </div>
          <Field className="message-field">
            <FieldLabel htmlFor="group-message">
              What brings you together?
            </FieldLabel>
            <InputGroup className="message-composer">
              <InputGroupTextarea
                id="group-message"
                name="message"
                required
                minLength={10}
                maxLength={1200}
                rows={4}
                aria-describedby="message-hint"
                placeholder="A team day, a birthday, or just because…"
                value={details.message}
                onChange={(e) =>
                  setDetails({ ...details, message: e.target.value })
                }
              />
              <InputGroupAddon align="block-end" className="message-toolbar">
                <span aria-hidden="true">
                  A little context goes a long way.
                </span>
                <span className="message-count">
                  {details.message.length} / 1,200
                </span>
              </InputGroupAddon>
            </InputGroup>
            <FieldDescription id="message-hint">
              At least 10 characters. Your ideas stay in this tab.
            </FieldDescription>
          </Field>
          <Label className="check-row">
            <Checkbox
              required
              checked={details.consent}
              onCheckedChange={(checked) =>
                setDetails({ ...details, consent: checked })
              }
            />
            <span>
              I understand this is a demo enquiry. Nothing will be submitted.
            </span>
          </Label>
          <Button type="submit">
            Preview enquiry<span aria-hidden="true">↗︎</span>
          </Button>
        </form>
      )}
    </section>
  );
}
