"use client";

import { forwardRef, type ComponentPropsWithoutRef, type ReactNode } from "react";
import { Radio } from "@base-ui/react/radio";
import { RadioGroup } from "@base-ui/react/radio-group";
import { cn } from "@/utils/cn";

type SegmentedControlSize = "sm" | "md";

type SegmentedControlProps = Omit<
  ComponentPropsWithoutRef<typeof RadioGroup>,
  "className" | "children"
> & {
  size?: SegmentedControlSize;
  className?: string;
  children: ReactNode;
};

type SegmentedControlItemProps = {
  value: string;
  disabled?: boolean;
  size?: SegmentedControlSize;
  className?: string;
  children: ReactNode;
};

const controlSizeClassMap: Record<SegmentedControlSize, string> = {
  sm: "p-1",
  md: "p-1.5",
};

const itemSizeClassMap: Record<SegmentedControlSize, string> = {
  sm: "rounded-[calc(var(--radius-md)-0.2rem)] px-3 py-1.5 text-sm",
  md: "rounded-[calc(var(--radius-md)-0.2rem)] px-4 py-2 text-sm",
};

export const SegmentedControl = forwardRef<HTMLDivElement, SegmentedControlProps>(
  ({ className, size = "md", children, ...props }, ref) => (
    <RadioGroup
      ref={ref as never}
      data-slot="segmented-control"
      data-size={size}
      className={cn(
        "inline-flex items-stretch gap-1 rounded-[var(--radius-md)] border border-[color:var(--border)] bg-[color:var(--secondary)]",
        controlSizeClassMap[size],
        className
      )}
      {...props}
    >
      {children}
    </RadioGroup>
  )
);

SegmentedControl.displayName = "SegmentedControl";

export const SegmentedControlItem = forwardRef<HTMLButtonElement, SegmentedControlItemProps>(
  ({ className, size = "md", children, ...props }, ref) => (
    <Radio.Root
      ref={ref as never}
      data-slot="segmented-control-item"
      className={cn(
        "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium",
        "cursor-pointer select-none transition-[color,background-color,box-shadow,transform] duration-150 ease-smooth motion-reduce:transition-none",
        "text-[color:var(--muted-foreground)] hover:text-[color:var(--foreground)]",
        "focus-ring data-checked:bg-[color:var(--card)] data-checked:text-[color:var(--foreground)] data-checked:shadow-sm",
        "data-disabled:cursor-not-allowed data-disabled:opacity-50",
        itemSizeClassMap[size],
        className
      )}
      {...props}
    >
      {children}
    </Radio.Root>
  )
);

SegmentedControlItem.displayName = "SegmentedControlItem";
