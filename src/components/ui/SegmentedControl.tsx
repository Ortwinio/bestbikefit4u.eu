"use client";

import { forwardRef, type ComponentPropsWithoutRef, type ReactNode } from "react";
import { Radio } from "@base-ui/react/radio";
import { RadioGroup } from "@base-ui/react/radio-group";
import { cn } from "@/utils/cn";

type SegmentedControlSize = "sm" | "md";

type SegmentedControlGroupProps = Omit<ComponentPropsWithoutRef<typeof RadioGroup>, "className" | "children"> & {
  size?: SegmentedControlSize;
  variant?: "default" | "strong";
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

export const SegmentedControl = forwardRef<HTMLDivElement, SegmentedControlGroupProps>(
  ({ className, size = "md", variant = "default", children, ...props }, ref) => {
    return (
      <RadioGroup
        ref={ref as never}
        data-slot="segmented-control"
        data-size={size}
        data-variant={variant}
        className={cn(
          "group/segments inline-flex items-stretch gap-1 rounded-2xl bg-muted",
          controlSizeClassMap[size],
          className,
        )}
        {...props}
      >
        {children}
      </RadioGroup>
    );
  },
);

SegmentedControl.displayName = "SegmentedControl";

export const SegmentedControlItem = forwardRef<HTMLButtonElement, SegmentedControlItemProps>(
  ({ className, size = "md", children, ...props }, ref) => {
    return (
      <Radio.Root
        ref={ref as never}
        data-slot="segmented-control-item"
        className={cn(
          "inline-flex min-h-11 min-w-11 flex-1 items-center justify-center gap-2 whitespace-nowrap font-semibold",
          "cursor-pointer select-none transition-[color,background-color,box-shadow,transform] " +
            "duration-150 ease-smooth motion-reduce:transition-none",
          "text-muted-foreground hover:text-foreground",
          "focus-visible:focus-ring data-checked:bg-card data-checked:text-foreground " +
            "data-checked:shadow-sm dark:data-checked:bg-primary dark:data-checked:text-primary-foreground " +
            "group-data-[variant=strong]/segments:data-checked:bg-[var(--bbf-inkt)] " +
            "group-data-[variant=strong]/segments:data-checked:text-[var(--bbf-wit)] " +
            "dark:group-data-[variant=strong]/segments:data-checked:bg-primary " +
            "dark:group-data-[variant=strong]/segments:data-checked:text-primary-foreground",
          "data-disabled:cursor-not-allowed data-disabled:opacity-50",
          itemSizeClassMap[size],
          className,
        )}
        {...props}
      >
        {children}
      </Radio.Root>
    );
  },
);

SegmentedControlItem.displayName = "SegmentedControlItem";
