"use client"

import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/components/lib/utils"

const buttonVariants = cva(
  [
    "inline-flex items-center justify-center whitespace-nowrap rounded-full text-base font-bold",
    "transform-gpu transition-[color,background-color,border-color,box-shadow,opacity,transform] duration-150 ease-smooth",
    "motion-reduce:transition-none",
    "disabled:status-disabled",
    "focus-visible:focus-ring",
    "[&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
    "shrink-0 group/button select-none no-highlight",
    "hover-only:hover:-translate-y-px hover-only:hover:shadow-[0_14px_30px_-18px_rgba(15,23,42,0.42)]",
  ],
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover-only:hover:bg-primary-hover",
        destructive:
          "bg-destructive text-destructive-foreground hover-only:hover:bg-destructive-hover",
        outline:
          "border-2 border-foreground bg-background text-foreground hover-only:hover:bg-muted",
        secondary:
          "bg-secondary text-secondary-foreground hover-only:hover:bg-muted",
        ghost: "hover-only:bg-accent hover-only:text-accent-foreground motion-safe:active:scale-100",
        "primary-soft":
          "bg-primary-soft text-primary hover-only:hover:bg-primary-soft-hover",
        "destructive-soft":
          "bg-destructive-soft text-destructive-text hover-only:hover:bg-destructive-soft-hover",
        success:
          "bg-success text-success-foreground hover-only:hover:bg-success-hover",
        warning:
          "bg-warning text-warning-foreground hover-only:hover:bg-warning-hover",
        link: "dark:text-primary-light text-primary-dark underline-offset-4 hover-only:underline motion-safe:active:scale-100",
      },
      size: {
        default: "min-h-12 gap-2 px-4 py-1 in-data-[slot=button-group]:rounded-md has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2 motion-safe:active:scale-[0.97]",
        xs: "min-h-11 gap-1 rounded-full px-2 text-xs in-data-[slot=button-group]:rounded-md has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3 motion-safe:active:scale-[0.985]",
        sm: "min-h-11 gap-1.5 rounded-full px-3 text-xs in-data-[slot=button-group]:rounded-md has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 motion-safe:active:scale-[0.98]",
        lg: "min-h-14 gap-2 rounded-full px-8 has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3 motion-safe:active:scale-[0.96]",
        icon: "size-12 motion-safe:active:scale-[0.97]",
        "icon-xs": "size-11 rounded-full in-data-[slot=button-group]:rounded-md motion-safe:active:scale-[0.985]",
        "icon-sm": "size-11 rounded-full in-data-[slot=button-group]:rounded-md motion-safe:active:scale-[0.98]",
        "icon-lg": "size-14 motion-safe:active:scale-[0.96]",
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
