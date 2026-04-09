"use client";

import { type ReactNode } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/prototyper-ui/ui/dialog";
import { XIcon } from "lucide-react";
import { Button } from "./Button";

export interface AccessibleDialogProps {
  open: boolean;
  title: string;
  description?: ReactNode;
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
        <div className="panel-backdrop fixed inset-0" />
        <div
          className="panel-surface-base panel-theme-context relative z-10 w-full max-w-md rounded-[var(--radius-xl)] border p-6 shadow-2xl"
          data-slot="dialog-content"
        >
          <DialogHeader className="relative pr-10">
            <button
              type="button"
              aria-label="Close dialog"
              onClick={onClose}
              className="absolute right-0 top-0 inline-flex h-8 w-8 items-center justify-center rounded-[var(--radius-md)] text-[color:var(--muted-foreground)] transition-colors hover:bg-[color:var(--accent)] hover:text-[color:var(--foreground)]"
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
          </DialogHeader>
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
        className="max-w-md gap-0 rounded-[var(--radius-xl)] border p-6 shadow-2xl"
      >
        <DialogHeader className="relative pr-10">
          <DialogClose
            render={
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-8 w-8 px-0"
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
        </DialogHeader>
        <div className="mt-4">{children}</div>
      </DialogContent>
    </Dialog>
  );
}
