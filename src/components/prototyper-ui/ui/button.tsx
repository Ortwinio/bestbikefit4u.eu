"use client"

import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/components/lib/utils"

const buttonVariants = cva(
  [
    "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium",
    "transform-gpu transition-[color,background-color,border-color,box-shadow,opacity,transform] duration-150 ease-smooth",
    "motion-reduce:transition-none",
    "disabled:status-disabled",
    "focus-visible:focus-ring",
    "[&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
    "shrink-0 group/button select-none no-highlight",
  ],
  {
    variants: {
      variant: {
        default: [
          // Base styles
          "relative rounded-lg overflow-visible shadow-surface border border-primary dark:border-primary-dark",
          "isolate text-primary-foreground [text-shadow:_0_1px_2px_oklch(0%_0_0_/_30%)]",
          "[&>*]:relative [&>*]:z-[2]",
          // Combined gradient layer with primary colors
          "before:pointer-events-none before:absolute before:inset-[-0.5px] before:rounded-[inherit]",
          "before:bg-gradient-to-br before:from-primary-light before:via-primary-middle before:to-primary-dark",
          "before:dark:from-primary-light before:dark:via-primary-middle before:dark:to-primary-dark",
          "before:z-[-1]",
          // Additional outer border
          "after:pointer-events-none after:absolute after:inset-[0.5px] after:rounded-[inherit]",
          "after:bg-gradient-to-br after:from-primary after:to-primary-dark",
          "after:z-[-1] after:transition-opacity after:duration-200 after:opacity-40 after:motion-reduce:transition-none",
          // Hover state
          "hover-only:after:opacity-100 hover-only:transition-opacity hover-only:duration-200",
        ].join(" "),
        destructive:
          "bg-destructive text-destructive-foreground hover-only:hover:bg-destructive-hover",
        outline: [
          // Base styles
          "relative rounded-lg overflow-visible shadow-field border",
          "isolate text-foreground",
          "[&>*]:relative [&>*]:z-[2]",
          // Background layer
          "before:pointer-events-none before:absolute before:inset-[-0.5px] before:rounded-[inherit]",
          "before:bg-gradient-to-br before:from-border-light before:via-border before:to-border-dark/50",
          "before:dark:from-border-light before:dark:to-border-dark",
          "before:z-[-1]",
          // Inner background layer
          "after:pointer-events-none after:absolute after:inset-[0.5px] after:rounded-[inherit]",
          "after:bg-background",
          "after:z-[-1]",
          "after:transition-colors after:duration-200 after:ease-out after:motion-reduce:transition-none",
          // Hover state
          "hover-only:after:bg-muted",
        ].join(" "),
        secondary:
          "bg-secondary text-secondary-foreground hover-only:hover:bg-accent",
        ghost: "hover-only:bg-accent hover-only:text-accent-foreground motion-safe:active:scale-100",
        "primary-soft":
          "bg-primary-soft text-primary hover-only:hover:bg-primary-soft-hover",
        "destructive-soft":
          "bg-destructive-soft text-destructive hover-only:hover:bg-destructive-soft-hover",
        success:
          "bg-success text-success-foreground hover-only:hover:bg-success-hover",
        warning:
          "bg-warning text-warning-foreground hover-only:hover:bg-warning-hover",
        link: "dark:text-primary-light text-primary-dark underline-offset-4 hover-only:underline motion-safe:active:scale-100",
      },
      size: {
        default: "h-9 gap-2 px-4 py-1 in-data-[slot=button-group]:rounded-md has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2 motion-safe:active:scale-[0.97]",
        xs: "h-6 gap-1 rounded-lg px-2 text-xs in-data-[slot=button-group]:rounded-md has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3 motion-safe:active:scale-[0.985]",
        sm: "h-8 gap-1.5 rounded-lg px-3 text-xs in-data-[slot=button-group]:rounded-md has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 motion-safe:active:scale-[0.98]",
        lg: "h-10 gap-2 rounded-lg px-8 has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3 motion-safe:active:scale-[0.96]",
        icon: "size-9 motion-safe:active:scale-[0.97]",
        "icon-xs": "size-6 rounded-lg in-data-[slot=button-group]:rounded-md motion-safe:active:scale-[0.985]",
        "icon-sm": "size-8 rounded-lg in-data-[slot=button-group]:rounded-md motion-safe:active:scale-[0.98]",
        "icon-lg": "size-10 motion-safe:active:scale-[0.96]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  isPending,
  nativeButton,
  render,
  ...props
}: ButtonPrimitive.Props &
  VariantProps<typeof buttonVariants> & { isPending?: boolean }) {
  return (
    <ButtonPrimitive
      data-slot="button"
      data-pending={isPending || undefined}
      aria-disabled={isPending || undefined}
      nativeButton={nativeButton ?? (render ? false : undefined)}
      render={render}
      className={cn(
        buttonVariants({ variant, size }),
        isPending && "status-pending",
        className
      )}
      {...props}
    />
  )
}

export { Button, buttonVariants }
