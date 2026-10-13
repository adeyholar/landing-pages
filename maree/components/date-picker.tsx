"use client";
import { useId, useState } from "react";
import { CalendarDays, ChevronDown } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverTitle,
} from "@/components/ui/popover";

function parseDate(value: string) {
  if (!value) return undefined;
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}
function formatDate(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
export function DatePicker({
  value,
  onChange,
  min,
  label = "Date",
  name = "date",
}: {
  value: string;
  onChange: (value: string) => void;
  min: string;
  label?: string;
  name?: string;
}) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [invalid, setInvalid] = useState(false);
  const selected = parseDate(value);
  const earliest = parseDate(min) ?? new Date(new Date().setHours(0, 0, 0, 0));
  return (
    <Field className="field date-field" data-invalid={invalid}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={
            <Button
              variant="unstyled"
              id={id}
              className="date-trigger"
              aria-invalid={invalid}
              aria-label={`${label}, ${selected ? selected.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) : "choose a date"}`}
              aria-describedby={invalid ? `${id}-error` : undefined}
            />
          }
        >
          <CalendarDays size={19} aria-hidden="true" />
          <span>
            {selected
              ? selected.toLocaleDateString("en-GB", {
                  weekday: "short",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })
              : "Find your day"}
          </span>
          <ChevronDown size={16} aria-hidden="true" />
        </PopoverTrigger>
        <PopoverContent align="start" sideOffset={8} className="date-popover">
          <PopoverTitle className="calendar-title">
            A day to look forward to.
          </PopoverTitle>
          <Calendar
            mode="single"
            selected={selected}
            defaultMonth={selected ?? earliest}
            startMonth={earliest}
            disabled={{ before: earliest }}
            autoFocus
            onSelect={(day) => {
              if (day) {
                onChange(formatDate(day));
                setInvalid(false);
                setOpen(false);
              }
            }}
          />
          <p className="calendar-note">Sample dates · no live availability</p>
        </PopoverContent>
      </Popover>
      <Input
        className="date-validation"
        tabIndex={-1}
        aria-hidden="true"
        name={name}
        value={value}
        required
        onChange={() => {}}
        onInvalid={(event) => {
          event.preventDefault();
          setInvalid(true);
          setOpen(true);
        }}
      />
      {invalid && (
        <FieldError id={`${id}-error`}>Choose a date to continue.</FieldError>
      )}
    </Field>
  );
}
