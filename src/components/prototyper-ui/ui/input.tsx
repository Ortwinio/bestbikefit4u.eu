"use client"

import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"

import { cn } from "@/components/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "border-field-border bg-field-background h-9 rounded-md border px-3 py-1 text-base shadow-field md:text-sm placeholder:text-muted-foreground w-full min-w-0 outline-none",
        "file:h-7 file:text-sm file:font-medium file:text-foreground file:inline-flex file:border-0 file:bg-transparent",
        "hover-only:hover:border-field-border-hover",
        "focus-visible:border-field-border-focus focus-visible:focus-field-ring",
        "aria-invalid:border-field-border-invalid aria-invalid:ring-1 aria-invalid:ring-destructive/30 aria-invalid:focus-visible:invalid-field-ring aria-invalid:focus-visible:ring-0",
        "disabled:status-disabled",
        "transition-[color,background-color,border-color,box-shadow,opacity] duration-150 ease-smooth",
        "motion-reduce:transition-none",
        className
      )}
      {...props}
    />
  )
}

export { Input }
