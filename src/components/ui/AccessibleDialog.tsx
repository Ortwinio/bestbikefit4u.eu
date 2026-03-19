"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/prototyper-ui/ui/dialog";

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
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          onClose();
        }
      }}
    >
      <DialogContent
        showCloseButton
        className="w-full max-w-md rounded-[var(--radius-xl)] border border-[color:var(--border)] bg-[color:var(--card)] p-6 text-[color:var(--foreground)] shadow-2xl"
      >
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
