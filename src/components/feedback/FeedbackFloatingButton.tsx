"use client";

import { MessageSquarePlus } from "lucide-react";
import { Button } from "@/components/prototyper-ui/ui/button";
import { cn } from "@/utils/cn";

export const FEEDBACK_FLOATING_BUTTON_PLACEMENT_CLASSNAME =
  "fixed bottom-4 right-4 z-30 rounded-full px-5 shadow-2xl sm:bottom-6 sm:right-6 " +
  "lg:bottom-8 lg:right-8";

export interface FeedbackFloatingButtonProps {
  onClick: () => void;
  label: string;
  className?: string;
  flowOnMobile?: boolean;
}

export function FeedbackFloatingButton({ onClick, label, className, flowOnMobile = false }: FeedbackFloatingButtonProps) {
  return (
    <Button
      data-feedback-launcher="true"
      type="button"
      variant="default"
      size="lg"
      onClick={onClick}
      aria-label={label}
      className={cn(flowOnMobile
        ? "relative m-4 rounded-full px-5 shadow-2xl md:fixed md:bottom-6 md:right-6 md:z-30 md:m-0 lg:bottom-8 lg:right-8"
        : FEEDBACK_FLOATING_BUTTON_PLACEMENT_CLASSNAME, className)}
    >
      <MessageSquarePlus className="h-4 w-4" />
      {label}
    </Button>
  );
}
