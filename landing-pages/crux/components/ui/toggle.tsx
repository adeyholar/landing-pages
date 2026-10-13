"use client";
import { Toggle as TogglePrimitive } from "@base-ui/react/toggle";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "cn";
const toggleVariants = cva("ui-toggle", {
  variants: { variant: { default: "", outline: "toggle-outline" } },
  defaultVariants: { variant: "default" },
});
function Toggle({
  className,
  variant,
  ...props
}: TogglePrimitive.Props & VariantProps<typeof toggleVariants>) {
  return (
    <TogglePrimitive
      data-slot="toggle"
      className={cn(toggleVariants({ variant }), className)}
      {...props}
    />
  );
}
export { Toggle, toggleVariants };
