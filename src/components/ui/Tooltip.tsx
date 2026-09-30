"use client";

import { useId } from "react";
import { CircleHelp } from "lucide-react";
import {
  Tooltip as PrototyperTooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/prototyper-ui/ui/tooltip";
import { cn } from "@/utils/cn";

export type TooltipInteraction = "focus" | "mouseenter" | "click" | "blur" | "mouseleave" | "escape";

export function getNextTooltipOpenState(current: boolean, interaction: TooltipInteraction): boolean {
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

export function Tooltip({ content, label = "More information", descriptionId, className }: TooltipProps) {
  const generatedId = useId().replace(/:/g, "");
  const resolvedDescriptionId = descriptionId ?? `tooltip-desc-${generatedId}`;
  const tooltipId = `tooltip-${generatedId}`;

  return (
    <TooltipProvider delay={200} closeDelay={50}>
      <span id={resolvedDescriptionId} className="sr-only">
        {content}
      </span>
      <PrototyperTooltip>
        <TooltipTrigger
          type="button"
          className={cn(
            "inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-full focus-visible:focus-ring",
            className,
          )}
          aria-label={label}
          aria-describedby={resolvedDescriptionId}
        >
          <span
            className={
              "inline-flex h-5 w-5 items-center justify-center rounded-full " +
              "text-muted-foreground transition-colors hover:text-foreground"
            }
          >
            <CircleHelp className="h-4 w-4" />
          </span>
        </TooltipTrigger>
        <TooltipContent
          id={tooltipId}
          sideOffset={8}
          className={
            "max-w-xs rounded-[var(--radius-md)] border border-border bg-popover px-3 py-2 text-xs " +
            "leading-relaxed text-popover-foreground shadow-lg shadow-black/10 dark:shadow-black/30"
          }
        >
          {content}
        </TooltipContent>
      </PrototyperTooltip>
    </TooltipProvider>
  );
}
