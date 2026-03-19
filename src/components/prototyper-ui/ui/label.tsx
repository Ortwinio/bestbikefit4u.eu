"use client"

import * as React from "react"

import { cn } from "@/components/lib/utils"

function Label({ className, ...props }: React.ComponentProps<"label">) {
  return (
    <label
      data-slot="label"
      className={cn(
        "gap-2 text-sm leading-none font-medium group-data-[disabled=true]:status-disabled peer-disabled:status-disabled group-data-[invalid]:text-destructive flex items-center select-none",
        className
      )}
      {...props}
    />
  )
}

export { Label }
