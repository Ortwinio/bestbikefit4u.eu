"use client";

import { forwardRef } from "react";
import { Selectable, type SelectableProps } from "./Selectable";

export interface OptionCardProps extends Omit<SelectableProps, "variant"> {
  /** Show the selection check; custom trailing content takes precedence. */
  showCheck?: boolean;
}

/** The card form of Selectable; supports its button, radio and checkbox modes. */
export const OptionCard = forwardRef<HTMLButtonElement, OptionCardProps>(
  ({ showCheck = true, trailing, ...props }, ref) => (
    <Selectable
      {...props}
      ref={ref}
      variant="card"
      trailing={trailing ?? (showCheck ? undefined : false)}
    />
  )
);
OptionCard.displayName = "OptionCard";
