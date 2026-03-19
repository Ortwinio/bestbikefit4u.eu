"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/components/lib/utils"

const cardVariants = cva(
  [
    "relative flex flex-col gap-3 overflow-hidden rounded-xl p-4",
    "text-foreground",
    "transition-[transform,box-shadow,border-color] duration-200 ease-out-fluid motion-reduce:transition-none",
  ],
  {
    variants: {
      variant: {
        default: "bg-surface shadow-surface",
        secondary: "bg-surface-secondary shadow-surface",
        tertiary: "bg-surface-tertiary shadow-surface",
        elevated: "bg-surface shadow-overlay",
        transparent: "bg-transparent shadow-none",
      },
      interactive: {
        true: "cursor-pointer hover-only:hover:-translate-y-0.5 hover-only:hover:shadow-overlay motion-safe:active:scale-[0.99]",
      },
    },
    defaultVariants: { variant: "default" },
  }
)

function Card({
  className,
  variant,
  interactive,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof cardVariants>) {
  return (
    <div
      data-slot="card"
      className={cn(cardVariants({ variant, interactive }), className)}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn("flex flex-col", className)}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: React.ComponentProps<"h3">) {
  return (
    <h3
      data-slot="card-title"
      className={cn("text-sm font-medium", className)}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="card-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("flex flex-1 flex-col gap-1", className)}
      {...props}
    />
  )
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center gap-2", className)}
      {...props}
    />
  )
}

export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  cardVariants,
}
