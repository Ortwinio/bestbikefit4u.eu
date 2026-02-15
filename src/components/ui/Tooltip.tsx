"use client";

import { useId, useState } from "react";
import { CircleHelp } from "lucide-react";
import { cn } from "@/utils/cn";

export type TooltipInteraction =
  | "focus"
  | "mouseenter"
  | "click"
  | "blur"
  | "mouseleave"
  | "escape";

export function getNextTooltipOpenState(
  current: boolean,
  interaction: TooltipInteraction
): boolean {
  if (interaction === "focus" || interaction === "mouseenter") {
    return true;
  }
  if (interaction === "blur" || interaction === "mouseleave" || interaction === "escape") {
    return false;
  }
  return !current;
}

export interface TooltipProps {
  content: string;
  label?: string;
  descriptionId?: string;
  className?: string;
}

export function Tooltip({
  content,
  label = "More information",
  descriptionId,
  className,
}: TooltipProps) {
  const generatedId = useId().replace(/:/g, "");
  const tooltipId = `tooltip-${generatedId}`;
  const resolvedDescriptionId = descriptionId ?? `tooltip-desc-${generatedId}`;
  const [open, setOpen] = useState(false);

  return (
    <span className={cn("relative inline-flex items-center", className)}>
      <span id={resolvedDescriptionId} className="sr-only">
        {content}
      </span>
      <button
        type="button"
        className="inline-flex h-4 w-4 items-center justify-center rounded-full text-gray-400 transition-colors hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
        aria-label={label}
        aria-describedby={resolvedDescriptionId}
        aria-expanded={open}
        aria-controls={tooltipId}
        onMouseEnter={() =>
          setOpen((current) => getNextTooltipOpenState(current, "mouseenter"))
        }
        onMouseLeave={() =>
          setOpen((current) => getNextTooltipOpenState(current, "mouseleave"))
        }
        onFocus={() => setOpen((current) => getNextTooltipOpenState(current, "focus"))}
        onBlur={() => setOpen((current) => getNextTooltipOpenState(current, "blur"))}
        onClick={() => setOpen((current) => getNextTooltipOpenState(current, "click"))}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            setOpen((current) => getNextTooltipOpenState(current, "escape"));
            event.currentTarget.blur();
          }
        }}
      >
        <CircleHelp className="h-4 w-4" />
      </button>
      <span
        id={tooltipId}
        role="tooltip"
        aria-hidden={!open}
        className={cn(
          "pointer-events-none absolute bottom-full left-0 z-50 mb-2 w-max max-w-[min(20rem,calc(100vw-1rem))] rounded-md bg-gray-900 px-2.5 py-1.5 text-xs leading-relaxed text-white shadow-lg transition-opacity break-words sm:left-1/2 sm:-translate-x-1/2",
          open ? "opacity-100" : "opacity-0"
        )}
      >
        {content}
      </span>
    </span>
  );
}
