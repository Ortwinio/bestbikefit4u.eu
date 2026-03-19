"use client";

import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { X } from "lucide-react";
import { Button } from "./Button";
import { cn } from "@/utils/cn";

export interface AccessibleDialogProps {
  open: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  children: React.ReactNode;
}

export function AccessibleDialog({
  open,
  title,
  description,
  onClose,
  children,
}: AccessibleDialogProps) {
  if (typeof window === "undefined") {
    if (!open) {
      return null;
    }

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="fixed inset-0 bg-[color:color-mix(in_oklch,var(--foreground)_30%,transparent)] backdrop-blur-sm" />
        <div className="relative z-10 w-full max-w-md rounded-[var(--radius-xl)] border border-[color:var(--border)] bg-[color:var(--card)] p-6 text-[color:var(--foreground)] shadow-2xl">
          <h2 className="text-lg font-semibold tracking-tight text-[color:var(--foreground)]">
            {title}
          </h2>
          {description ? (
            <p className="mt-2 text-sm leading-6 text-[color:var(--muted-foreground)]">
              {description}
            </p>
          ) : null}
          <div className="mt-4">{children}</div>
        </div>
      </div>
    );
  }

  return (
    <DialogPrimitive.Root
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          onClose();
        }
      }}
    >
      <DialogPrimitive.Portal>
        <DialogPrimitive.Backdrop className="fixed inset-0 z-50 bg-[color:color-mix(in_oklch,var(--foreground)_30%,transparent)] backdrop-blur-sm transition-opacity" />
        <DialogPrimitive.Popup
          className={cn(
            "fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-[var(--radius-xl)] border border-[color:var(--border)] bg-[color:var(--card)] p-6 text-[color:var(--foreground)] shadow-2xl outline-none"
          )}
        >
          <DialogPrimitive.Close
            render={
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-4 top-4 h-8 w-8 px-0"
              />
            }
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close dialog</span>
          </DialogPrimitive.Close>
          <DialogPrimitive.Title className="text-lg font-semibold tracking-tight text-[color:var(--foreground)]">
            {title}
          </DialogPrimitive.Title>
        {description ? (
          <DialogPrimitive.Description className="mt-2 text-sm leading-6 text-[color:var(--muted-foreground)]">
            {description}
          </DialogPrimitive.Description>
        ) : null}
        <div className="mt-4">{children}</div>
        </DialogPrimitive.Popup>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
