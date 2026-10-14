"use client";
import { Slider as Primitive } from "@base-ui/react/slider";
// shadcn/ui Base UI composition. Native range semantics, custom flight instrumentation.
export function Slider({
  label,
  value,
  onValueChange,
  ...props
}: Primitive.Root.Props<number> & { label: string }) {
  return (
    <Primitive.Root
      data-slot="slider"
      className="ui-slider"
      value={value}
      onValueChange={onValueChange}
      {...props}
    >
      <div className="slider-heading">
        <Primitive.Label>{label}</Primitive.Label>
        <Primitive.Value>
          {() => (
            <span>
              {String(value ?? 0).padStart(2, "0")}
              <small> / 100</small>
            </span>
          )}
        </Primitive.Value>
      </div>
      <Primitive.Control className="ui-slider-control">
        <Primitive.Track className="ui-slider-track">
          <Primitive.Indicator className="ui-slider-indicator" />
          <Primitive.Thumb className="ui-slider-thumb" aria-label={label} />
        </Primitive.Track>
      </Primitive.Control>
    </Primitive.Root>
  );
}
