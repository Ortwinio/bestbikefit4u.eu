"use client";

import { Dialog as BaseDialog } from "@base-ui/react/dialog";
import { X } from "lucide-react";
import { cn } from "@/utils/cn";

interface AccessibleDialogProps {
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
  return (
    <BaseDialog.Root
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          onClose();
        }
      }}
      disablePointerDismissal={false}
    >
      <BaseDialog.Portal>
        <BaseDialog.Backdrop className="fixed inset-0 z-50 bg-slate-950/45 backdrop-blur-sm" />
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <BaseDialog.Popup
            className={cn(
              "relative w-full max-w-md rounded-[var(--radius-xl)] border border-[color:var(--border)] bg-[color:var(--card)] p-6 shadow-2xl shadow-slate-950/15 focus:outline-none"
            )}
          >
            <BaseDialog.Close className="focus-ring absolute right-4 top-4 rounded-full p-1 text-[color:var(--muted-foreground)] hover:text-[color:var(--foreground)]">
              <X className="h-4 w-4" />
            </BaseDialog.Close>
            <BaseDialog.Title className="text-lg font-semibold tracking-tight text-[color:var(--foreground)]">
              {title}
            </BaseDialog.Title>
            {description ? (
              <BaseDialog.Description className="mt-2 text-sm leading-6 text-[color:var(--muted-foreground)]">
                {description}
              </BaseDialog.Description>
            ) : null}
            <div className="mt-4">{children}</div>
          </BaseDialog.Popup>
        </div>
      </BaseDialog.Portal>
    </BaseDialog.Root>
  );
}

export type { AccessibleDialogProps };
