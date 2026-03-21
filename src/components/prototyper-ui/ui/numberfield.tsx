"use client";

import { forwardRef, type ReactNode } from "react";
import { NumberField as BaseNumberField } from "@base-ui/react/number-field";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/utils/cn";

export const NumberFieldRoot = forwardRef<
  HTMLDivElement,
  BaseNumberField.Root.Props
>(({ className, ...props }, ref) => (
  <BaseNumberField.Root
    ref={ref}
    data-slot="number-field"
    className={cn("relative flex w-full flex-col gap-2", className)}
    {...props}
  />
));

NumberFieldRoot.displayName = "NumberFieldRoot";

export const NumberFieldGroup = forwardRef<
  HTMLDivElement,
  BaseNumberField.Group.Props
>(({ className, ...props }, ref) => (
  <BaseNumberField.Group
    ref={ref}
    data-slot="number-field-group"
    className={cn(
      "flex items-stretch overflow-hidden rounded-[var(--radius-md)] border border-[color:var(--input)] bg-[color:var(--card)] transition-colors focus-within:border-[color:var(--ring)] focus-within:focus-field-ring",
      className
    )}
    {...props}
  />
));

NumberFieldGroup.displayName = "NumberFieldGroup";

export const NumberFieldInput = forwardRef<
  HTMLInputElement,
  BaseNumberField.Input.Props
>(({ className, ...props }, ref) => (
  <BaseNumberField.Input
    ref={ref}
    data-slot="number-field-input"
    className={cn(
      "h-11 w-full min-w-0 bg-transparent px-3 text-sm text-[color:var(--foreground)] outline-none placeholder:text-[color:var(--muted-foreground)] disabled:cursor-not-allowed disabled:text-[color:var(--muted-foreground)]",
      className
    )}
    {...props}
  />
));

NumberFieldInput.displayName = "NumberFieldInput";

export const NumberFieldIncrement = forwardRef<
  HTMLButtonElement,
  BaseNumberField.Increment.Props & { children?: ReactNode }
>(({ className, children, ...props }, ref) => (
  <BaseNumberField.Increment
    ref={ref}
    data-slot="number-field-increment"
    className={cn(
      "flex flex-1 items-center justify-center text-[color:var(--secondary-foreground)] transition-colors hover:bg-[color:var(--accent)] focus-visible:z-10 focus-visible:focus-ring disabled:status-disabled",
      className
    )}
    {...props}
  >
    {children ?? <ChevronUp className="h-4 w-4" />}
  </BaseNumberField.Increment>
));

NumberFieldIncrement.displayName = "NumberFieldIncrement";

export const NumberFieldDecrement = forwardRef<
  HTMLButtonElement,
  BaseNumberField.Decrement.Props & { children?: ReactNode }
>(({ className, children, ...props }, ref) => (
  <BaseNumberField.Decrement
    ref={ref}
    data-slot="number-field-decrement"
    className={cn(
      "flex flex-1 items-center justify-center border-t border-[color:var(--border)] text-[color:var(--secondary-foreground)] transition-colors hover:bg-[color:var(--accent)] focus-visible:z-10 focus-visible:focus-ring disabled:status-disabled",
      className
    )}
    {...props}
  >
    {children ?? <ChevronDown className="h-4 w-4" />}
  </BaseNumberField.Decrement>
));

NumberFieldDecrement.displayName = "NumberFieldDecrement";

export function NumberFieldSteppers({
  label,
  className,
}: {
  label?: string;
  className?: string;
}) {
  const incrementLabel = label ? `Increase ${label}` : "Increase value";
  const decrementLabel = label ? `Decrease ${label}` : "Decrease value";

  return (
    <div
      data-slot="number-field-steppers"
      className={cn(
        "flex h-11 w-11 flex-col border-l border-[color:var(--border)] bg-[color:var(--secondary)]",
        className
      )}
    >
      <NumberFieldIncrement aria-label={incrementLabel} />
      <NumberFieldDecrement aria-label={decrementLabel} />
    </div>
  );
}

export const NumberFieldScrubArea = forwardRef<
  HTMLSpanElement,
  BaseNumberField.ScrubArea.Props
>(({ className, ...props }, ref) => (
  <BaseNumberField.ScrubArea
    ref={ref}
    data-slot="number-field-scrub-area"
    className={cn("absolute inset-y-0 right-0 flex items-center justify-center", className)}
    {...props}
  />
));

NumberFieldScrubArea.displayName = "NumberFieldScrubArea";

export const NumberFieldScrubAreaCursor = forwardRef<
  HTMLSpanElement,
  BaseNumberField.ScrubAreaCursor.Props
>(({ className, ...props }, ref) => (
  <BaseNumberField.ScrubAreaCursor
    ref={ref}
    data-slot="number-field-scrub-area-cursor"
    className={cn("pointer-events-none", className)}
    {...props}
  />
));

NumberFieldScrubAreaCursor.displayName = "NumberFieldScrubAreaCursor";
