"use client";

import { forwardRef, type ComponentPropsWithoutRef } from "react";
import { RadioGroup as BaseRadioGroup } from "@base-ui/react/radio-group";
import { Radio } from "@base-ui/react/radio";
import { cn } from "@/utils/cn";

const radioGroupClassName = "grid gap-3";
const radioGroupItemClassName =
  "group no-highlight transition-[color,background-color,border-color,box-shadow,opacity] duration-150 ease-smooth motion-reduce:transition-none focus-visible:focus-ring motion-safe:active:scale-[0.98]";

export interface RadioGroupProps
  extends ComponentPropsWithoutRef<typeof BaseRadioGroup> {}

export const RadioGroup = forwardRef<HTMLDivElement, RadioGroupProps>(
  ({ className, ...props }, ref) => (
    <BaseRadioGroup
      ref={ref as never}
      data-slot="radio-group"
      className={cn(radioGroupClassName, className)}
      {...props}
    />
  )
);

RadioGroup.displayName = "RadioGroup";

export interface RadioGroupItemProps
  extends ComponentPropsWithoutRef<typeof Radio.Root> {}

export const RadioGroupItem = forwardRef<HTMLButtonElement, RadioGroupItemProps>(
  ({ className, ...props }, ref) => (
    <Radio.Root
      ref={ref as never}
      data-slot="radio-group-item"
      className={cn(radioGroupItemClassName, className)}
      {...props}
    />
  )
);

RadioGroupItem.displayName = "RadioGroupItem";
