"use client";

import { MessageSquarePlus } from "lucide-react";
import { Button } from "@/components/ui";
import { cn } from "@/utils/cn";

export const FEEDBACK_FLOATING_BUTTON_PLACEMENT_CLASSNAME =
  "fixed bottom-4 right-4 z-30 rounded-full px-5 shadow-2xl sm:bottom-6 sm:right-6 lg:bottom-8 lg:right-8";

export interface FeedbackFloatingButtonProps {
  onClick: () => void;
  label: string;
  className?: string;
}

export function FeedbackFloatingButton({
  onClick,
  label,
  className,
}: FeedbackFloatingButtonProps) {
  return (
    <Button
      type="button"
      variant="default"
      size="lg"
      onClick={onClick}
      aria-label={label}
      className={cn(
        FEEDBACK_FLOATING_BUTTON_PLACEMENT_CLASSNAME,
        className
      )}
    >
      <MessageSquarePlus className="h-4 w-4" />
      {label}
    </Button>
  );
}
