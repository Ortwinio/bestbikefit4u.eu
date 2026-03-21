"use client";

import { forwardRef, type ComponentPropsWithoutRef } from "react";
import { CheckboxGroup as BaseCheckboxGroup } from "@base-ui/react/checkbox-group";
import { Checkbox } from "@base-ui/react/checkbox";
import { cn } from "@/utils/cn";

const checkboxGroupClassName = "grid gap-3";
const checkboxGroupItemClassName =
  "group no-highlight transition-[color,background-color,border-color,box-shadow,opacity] duration-150 ease-smooth motion-reduce:transition-none focus-visible:focus-ring motion-safe:active:scale-[0.98]";

export interface CheckboxGroupProps
  extends ComponentPropsWithoutRef<typeof BaseCheckboxGroup> {}

export const CheckboxGroup = forwardRef<HTMLDivElement, CheckboxGroupProps>(
  ({ className, ...props }, ref) => (
    <BaseCheckboxGroup
      ref={ref as never}
      data-slot="checkbox-group"
      className={cn(checkboxGroupClassName, className)}
      {...props}
    />
  )
);

CheckboxGroup.displayName = "CheckboxGroup";

export interface CheckboxGroupItemProps
  extends ComponentPropsWithoutRef<typeof Checkbox.Root> {}

export const CheckboxGroupItem = forwardRef<HTMLButtonElement, CheckboxGroupItemProps>(
  ({ className, ...props }, ref) => (
    <Checkbox.Root
      ref={ref as never}
      data-slot="checkbox-group-item"
      className={cn(checkboxGroupItemClassName, className)}
      {...props}
    />
  )
);

CheckboxGroupItem.displayName = "CheckboxGroupItem";
