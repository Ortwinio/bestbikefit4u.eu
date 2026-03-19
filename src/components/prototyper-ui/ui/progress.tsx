"use client"

import { Progress as ProgressPrimitive } from "@base-ui/react/progress"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/components/lib/utils"

const progressTrackVariants = cva(
  "relative w-full overflow-hidden rounded-full",
  {
    variants: {
      color: {
        default: "bg-primary/20",
        success: "bg-success/20",
        warning: "bg-warning/20",
        destructive: "bg-destructive/20",
        info: "bg-info/20",
      },
      size: {
        sm: "h-1",
        md: "h-2",
        lg: "h-3",
        xl: "h-4",
      },
    },
    defaultVariants: {
      color: "default",
      size: "md",
    },
  }
)

const progressIndicatorVariants = cva(
  "h-full rounded-full transition-[width,background-color] duration-300 ease-smooth motion-reduce:transition-none data-[indeterminate]:w-full data-[indeterminate]:[transform-origin:left] data-[indeterminate]:animate-progress-indeterminate motion-reduce:animate-none",
  {
    variants: {
      color: {
        default: "bg-primary data-[complete]:bg-success",
        success: "bg-success data-[complete]:bg-success",
        warning: "bg-warning data-[complete]:bg-success",
        destructive: "bg-destructive data-[complete]:bg-success",
        info: "bg-info data-[complete]:bg-success",
      },
    },
    defaultVariants: {
      color: "default",
    },
  }
)

function Progress({
  className,
  children,
  value,
  color,
  size,
  ...props
}: ProgressPrimitive.Root.Props &
  VariantProps<typeof progressIndicatorVariants> &
  VariantProps<typeof progressTrackVariants>) {
  return (
    <ProgressPrimitive.Root
      value={value}
      data-slot="progress"
      className={cn("relative w-full", className)}
      {...props}
    >
      {children}
      <ProgressTrack color={color} size={size}>
        <ProgressIndicator color={color} />
      </ProgressTrack>
    </ProgressPrimitive.Root>
  )
}

function ProgressTrack({
  className,
  color,
  size,
  ...props
}: ProgressPrimitive.Track.Props &
  VariantProps<typeof progressTrackVariants>) {
  return (
    <ProgressPrimitive.Track
      className={cn(progressTrackVariants({ color, size }), className)}
      data-slot="progress-track"
      {...props}
    />
  )
}

function ProgressIndicator({
  className,
  color,
  ...props
}: ProgressPrimitive.Indicator.Props &
  VariantProps<typeof progressIndicatorVariants>) {
  return (
    <ProgressPrimitive.Indicator
      data-slot="progress-indicator"
      className={cn(progressIndicatorVariants({ color }), className)}
      {...props}
    />
  )
}

function ProgressLabel({ className, ...props }: ProgressPrimitive.Label.Props) {
  return (
    <ProgressPrimitive.Label
      className={cn("text-sm font-medium leading-none", className)}
      data-slot="progress-label"
      {...props}
    />
  )
}

function ProgressValue({ className, ...props }: ProgressPrimitive.Value.Props) {
  return (
    <ProgressPrimitive.Value
      className={cn("text-sm tabular-nums text-muted-foreground", className)}
      data-slot="progress-value"
      {...props}
    />
  )
}

export {
  Progress,
  ProgressTrack,
  ProgressIndicator,
  ProgressLabel,
  ProgressValue,
  progressIndicatorVariants,
  progressTrackVariants,
}
