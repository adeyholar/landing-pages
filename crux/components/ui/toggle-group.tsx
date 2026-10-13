"use client";
import { Toggle as TogglePrimitive } from "@base-ui/react/toggle";
import { ToggleGroup as ToggleGroupPrimitive } from "@base-ui/react/toggle-group";
import { cn } from "cn";
import { toggleVariants } from "@/components/ui/toggle";
function ToggleGroup({ className, ...props }: ToggleGroupPrimitive.Props) {
  return (
    <ToggleGroupPrimitive
      data-slot="toggle-group"
      className={cn("ui-toggle-group", className)}
      {...props}
    />
  );
}
function ToggleGroupItem({ className, ...props }: TogglePrimitive.Props) {
  return (
    <TogglePrimitive
      data-slot="toggle-group-item"
      className={cn(toggleVariants(), className)}
      {...props}
    />
  );
}
export { ToggleGroup, ToggleGroupItem };
