"use client";

import { type ReactNode } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/prototyper-ui/ui/dialog";
import { XIcon } from "lucide-react";
import { Button } from "./Button";

export interface AccessibleDialogProps {
  open: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  children: ReactNode;
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
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        data-slot="dialog"
      >
        <div className="fixed inset-0 bg-[color:color-mix(in_oklch,var(--foreground)_30%,transparent)] backdrop-blur-sm" />
        <div
          className="relative z-10 w-full max-w-md rounded-[var(--radius-xl)] border border-[color:var(--border)] bg-[color:var(--card)] p-6 text-[color:var(--foreground)] shadow-2xl"
          data-slot="dialog-content"
        >
          <button
            type="button"
            aria-label="Close dialog"
            className="absolute right-4 top-4 inline-flex h-8 w-8 items-center justify-center rounded-[var(--radius-md)] text-[color:var(--muted-foreground)]"
          >
            <XIcon className="h-4 w-4" />
            <span className="sr-only">Close dialog</span>
          </button>
          <h2
            className="text-lg font-semibold tracking-tight text-[color:var(--foreground)]"
            data-slot="dialog-title"
          >
            {title}
          </h2>
          {description ? (
            <p
              className="mt-2 text-sm leading-6 text-[color:var(--muted-foreground)]"
              data-slot="dialog-description"
            >
              {description}
            </p>
          ) : null}
          <div className="mt-4">{children}</div>
        </div>
      </div>
    );
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          onClose();
        }
      }}
    >
      <DialogContent
        showCloseButton={false}
        className="max-w-md gap-0 rounded-[var(--radius-xl)] border border-[color:var(--border)] bg-[color:var(--card)] p-6 text-[color:var(--foreground)] shadow-2xl"
      >
        <DialogClose
          render={
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-4 top-4 h-8 w-8 px-0"
            />
          }
        >
          <XIcon className="h-4 w-4" />
          <span className="sr-only">Close dialog</span>
        </DialogClose>
        <DialogTitle className="text-lg font-semibold tracking-tight text-[color:var(--foreground)]">
          {title}
        </DialogTitle>
        {description ? (
          <DialogDescription className="mt-2 text-sm leading-6 text-[color:var(--muted-foreground)]">
            {description}
          </DialogDescription>
        ) : null}
        <div className="mt-4">{children}</div>
      </DialogContent>
    </Dialog>
  );
}
