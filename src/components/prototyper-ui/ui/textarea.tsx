"use client";

import { forwardRef, type TextareaHTMLAttributes } from "react";
import { cn } from "@/utils/cn";

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    data-slot="textarea"
    className={cn(
      "w-full min-w-0 resize-none rounded-[var(--radius-md)] border border-[color:var(--input)] bg-[color:var(--card)] px-3 py-2 text-sm text-[color:var(--foreground)] shadow-sm outline-none transition-[color,background-color,border-color,box-shadow,opacity] duration-150 ease-smooth placeholder:text-[color:var(--muted-foreground)] disabled:cursor-not-allowed disabled:bg-[color:var(--muted)] disabled:text-[color:var(--muted-foreground)] focus-field-ring aria-invalid:border-[color:var(--danger)] aria-invalid:invalid-field-ring",
      className
    )}
    {...props}
  />
));

Textarea.displayName = "Textarea";
