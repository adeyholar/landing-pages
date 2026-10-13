"use client";
import { DatePicker } from "@/components/date-picker";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { brand, offers } from "@/lib/content";
function localDate() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
export function VisitPlanner({ initialOffer }: { initialOffer?: string }) {
  const [step, setStep] = useState(0),
    [offer, setOffer] = useState(
      offers.some((o) => o.id === initialOffer) ? initialOffer! : offers[0].id,
    ),
    [guests, setGuests] = useState(1),
    [extra, setExtra] = useState(false),
    [date, setDate] = useState(""),
    [time, setTime] = useState(""),
    [name, setName] = useState(""),
    [email, setEmail] = useState(""),
    [today, setToday] = useState(""),
    [error, setError] = useState("");
  const title = useRef<HTMLHeadingElement>(null);
  useEffect(() => setToday(localDate()), []);
  const chosen = offers.find((o) => o.id === offer)!;
  const included = brand.slug === "crux" ? offer === "first" : offer === "slow";
  const total =
    (chosen.price + (!included && extra ? brand.extraPrice : 0)) * guests;
  const times =
    brand.slug === "maree" && offer === "dusk"
      ? ["17:00", "18:30", "20:00"]
      : brand.slug === "maree"
        ? ["08:00", "10:00", "12:00", "14:00", "16:00"]
        : ["09:00", "11:00", "14:00", "17:00", "19:00"];
  function go(s: number) {
    setError("");
    setStep(s);
    requestAnimationFrame(() => title.current?.focus());
  }
  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (step === 1 && (!date || date < localDate() || !time)) {
      setError("Choose today or a later date, and a session time.");
      return;
    }
    go(step + 1);
  }
  function download() {
    const text = `${brand.name} — SAMPLE VISIT, NOT A RESERVATION\n${chosen.name} · ${chosen.duration}\n${date} at ${time}\n${guests} guest(s) · ${brand.currency}${total} illustrative total\nPrepared for ${name}\nNothing has been booked, charged, or sent.\n`;
    const u = URL.createObjectURL(
      new Blob([text], { type: "text/plain;charset=utf-8" }),
    );
    const a = document.createElement("a");
    a.href = u;
    a.download = `${brand.slug}-sample-visit.txt`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(u), 1000);
  }
  return (
    <div className="planner">
      <div className="planner-main">
        <div
          className="step-track"
          aria-label={`Step ${Math.min(step + 1, 3)} of 3`}
        >
          {["Your experience", "Your moment", "Your details"].map((s, i) => (
            <span key={s} className={i <= step ? "active" : ""}>
              <b>0{i + 1}</b>
              {s}
            </span>
          ))}
        </div>
        <p className="demo-note">
          Interactive concept · no payment or real booking.
        </p>
        <h2 ref={title} tabIndex={-1}>
          {
            [
              "Make it yours.",
              "Pick your moment.",
              "A name for your plan.",
              "Your sample visit is ready.",
            ][step]
          }
        </h2>
        {step < 3 ? (
          <form onSubmit={submit}>
            {step === 0 && (
              <>
                <fieldset>
                  <legend>
                    {brand.slug === "crux"
                      ? "Choose your session"
                      : "Choose your ritual"}
                  </legend>
                  <RadioGroup
                    className="offer-options"
                    name="experience"
                    value={offer}
                    onValueChange={(value) => {
                      setOffer(value);
                      setTime("");
                      setExtra(false);
                    }}
                    aria-label={
                      brand.slug === "crux"
                        ? "Choose your session"
                        : "Choose your ritual"
                    }
                  >
                    {offers.map((o) => (
                      <Label
                        key={o.id}
                        className={`offer-option ${offer === o.id ? "selected" : ""}`}
                      >
                        <RadioGroupItem value={o.id} aria-label={o.name} />
                        <span>
                          <strong>{o.name}</strong>
                          <small>
                            {o.duration} · {o.included}
                          </small>
                        </span>
                        <b>
                          {brand.currency}
                          {o.price}
                        </b>
                      </Label>
                    ))}
                  </RadioGroup>
                </fieldset>
                <div className="guest-row">
                  <Label htmlFor="guests">
                    {brand.slug === "crux" ? "Climbers" : "Guests"}
                  </Label>
                  <div className="stepper">
                    <Button
                      variant="unstyled"
                      type="button"
                      onClick={() => setGuests((g) => Math.max(1, g - 1))}
                      disabled={guests === 1}
                      aria-label="Remove one guest"
                    >
                      −
                    </Button>
                    <Input
                      id="guests"
                      type="number"
                      min="1"
                      max="6"
                      value={guests}
                      onChange={(e) =>
                        setGuests(
                          Math.min(6, Math.max(1, Number(e.target.value) || 1)),
                        )
                      }
                    />
                    <Button
                      variant="unstyled"
                      type="button"
                      onClick={() => setGuests((g) => Math.min(6, g + 1))}
                      disabled={guests === 6}
                      aria-label="Add one guest"
                    >
                      +
                    </Button>
                  </div>
                </div>
                {!included ? (
                  <Label className="check-row">
                    <Checkbox checked={extra} onCheckedChange={setExtra} />
                    <span>
                      {brand.extraLabel}
                      <small>
                        +{brand.currency}
                        {brand.extraPrice} per person
                      </small>
                    </span>
                  </Label>
                ) : (
                  <p className="included-note">
                    ✓{" "}
                    {brand.slug === "crux" ? "Shoe rental" : "Your linen robe"}{" "}
                    is already included.
                  </p>
                )}
              </>
            )}
            {step === 1 && (
              <>
                <DatePicker value={date} min={today} onChange={setDate} />
                <fieldset>
                  <legend>Start time</legend>
                  <RadioGroup
                    className="time-options"
                    name="time"
                    required
                    value={time}
                    onValueChange={setTime}
                    aria-label="Start time"
                  >
                    {times.map((t) => (
                      <RadioGroupItem key={t} value={t} className="time-option">
                        {t}
                      </RadioGroupItem>
                    ))}
                  </RadioGroup>
                </fieldset>
                <p className="small-copy">
                  These are sample times, not live availability. Your visit
                  lasts {chosen.duration.toLowerCase()}.
                </p>
              </>
            )}
            {step === 2 && (
              <>
                <Label className="field">
                  Your name
                  <Input
                    required
                    autoComplete="name"
                    maxLength={80}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Alex Morgan"
                  />
                </Label>
                <Label className="field">
                  Email
                  <Input
                    type="email"
                    required
                    autoComplete="email"
                    maxLength={160}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="alex@example.com"
                  />
                </Label>
                <Label className="check-row">
                  <Checkbox required />
                  <span>
                    I understand this is a demonstration and no reservation will
                    be made.
                  </span>
                </Label>
                <p className="small-copy">
                  Your details stay in this tab. They are not stored or sent.
                </p>
              </>
            )}
            {error && (
              <p role="alert" className="form-error">
                {error}
              </p>
            )}
            <div className="form-actions">
              {step > 0 && (
                <Button
                  variant="unstyled"
                  type="button"
                  className="text-button"
                  onClick={() => go(step - 1)}
                >
                  ← Back
                </Button>
              )}
              <Button type="submit">
                {step === 2 ? "Create my sample plan" : "Continue"}
                <span aria-hidden="true">↗</span>
              </Button>
            </div>
          </form>
        ) : (
          <div className="confirmation" role="status">
            <div className="success-mark" aria-hidden="true">
              ✓
            </div>
            <p>
              {name}, here’s a little preview of your{" "}
              {brand.slug === "crux" ? "next climb" : "time by the sea"}. No
              booking was made and no email was sent.
            </p>
            <Button onClick={download}>
              Download your plan<span aria-hidden="true">↓</span>
            </Button>
            <Button
              variant="unstyled"
              className="text-button"
              onClick={() => go(0)}
            >
              Make another plan
            </Button>
          </div>
        )}
      </div>
      <aside className="booking-summary">
        <p className="eyebrow">
          {brand.slug === "crux"
            ? "Your session ticket"
            : "A moment, set aside"}
        </p>
        <div className="summary-brand">{brand.name}</div>
        <h3>{chosen.name}</h3>
        <p>{chosen.description}</p>
        <dl>
          <div>
            <dt>Duration</dt>
            <dd>{chosen.duration}</dd>
          </div>
          <div>
            <dt>{brand.slug === "crux" ? "Climbers" : "Guests"}</dt>
            <dd>{guests}</dd>
          </div>
          {date && (
            <div>
              <dt>Date</dt>
              <dd>{date.split("-").reverse().join(" / ")}</dd>
            </div>
          )}
          {time && (
            <div>
              <dt>Time</dt>
              <dd>{time}</dd>
            </div>
          )}
          <div>
            <dt>Included</dt>
            <dd>{chosen.included}</dd>
          </div>
          {extra && !included && (
            <div>
              <dt>Extra</dt>
              <dd>
                {brand.currency}
                {brand.extraPrice * guests}
              </dd>
            </div>
          )}
        </dl>
        <div className="summary-total" aria-live="polite">
          <span>Sample total</span>
          <strong>
            {brand.currency}
            {total}
          </strong>
        </div>
        <p className="micro">
          No charge. No reservation. Just an idea of your day.
        </p>
      </aside>
    </div>
  );
}
