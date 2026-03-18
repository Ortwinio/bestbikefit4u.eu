"use client";

import { useId } from "react";
import { Tooltip as BaseTooltip } from "@base-ui/react/tooltip";
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
  const resolvedDescriptionId = descriptionId ?? `tooltip-desc-${generatedId}`;
  const tooltipId = `tooltip-${generatedId}`;

  return (
    <BaseTooltip.Provider delay={200} closeDelay={50}>
      <span id={resolvedDescriptionId} className="sr-only">
        {content}
      </span>
      <BaseTooltip.Root>
        <BaseTooltip.Trigger
          className={cn("inline-flex items-center", className)}
          aria-label={label}
          aria-describedby={resolvedDescriptionId}
        >
          <span className="focus-ring inline-flex h-5 w-5 items-center justify-center rounded-full text-[color:var(--muted-foreground)] transition-colors hover:text-[color:var(--foreground)]">
            <CircleHelp className="h-4 w-4" />
          </span>
        </BaseTooltip.Trigger>
        <BaseTooltip.Portal>
          <BaseTooltip.Positioner sideOffset={8} className="z-50">
            <BaseTooltip.Popup
              id={tooltipId}
              className="max-w-xs rounded-[var(--radius-md)] bg-slate-950 px-3 py-2 text-xs leading-relaxed text-white shadow-lg"
            >
              {content}
              <BaseTooltip.Arrow className="size-2 rotate-45 bg-slate-950" />
            </BaseTooltip.Popup>
          </BaseTooltip.Positioner>
        </BaseTooltip.Portal>
      </BaseTooltip.Root>
    </BaseTooltip.Provider>
  );
}
