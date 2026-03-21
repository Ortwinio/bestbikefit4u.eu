"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import { Toast as BaseToast } from "@base-ui/react/toast";
import { CheckCircle2, CircleAlert, Info, X } from "lucide-react";
import { cn } from "@/utils/cn";

type AppToastKind = "success" | "error" | "info";

type AppToastData = {
  kind: AppToastKind;
};

type ShowToastOptions = {
  title?: string;
  description: string;
  timeout?: number;
};

type ToastApi = {
  success: (options: ShowToastOptions) => string;
  error: (options: ShowToastOptions) => string;
  info: (options: ShowToastOptions) => string;
  close: (toastId?: string) => void;
};

const TOAST_TIMEOUT_MS = 4_200;
const TOAST_LIMIT = 4;

const toastManager = BaseToast.createToastManager<AppToastData>();
const ToastContext = createContext<ToastApi | null>(null);

const toastToneClassMap: Record<
  AppToastKind,
  { border: string; surface: string; icon: string }
> = {
  success: {
    border:
      "border-[color:color-mix(in_oklch,var(--success)_32%,var(--border))]",
    surface:
      "bg-[color:color-mix(in_oklch,var(--card)_92%,var(--success)_8%)]",
    icon: "bg-[color:color-mix(in_oklch,var(--success)_15%,var(--secondary))]",
  },
  error: {
    border:
      "border-[color:color-mix(in_oklch,var(--danger)_30%,var(--border))]",
    surface:
      "bg-[color:color-mix(in_oklch,var(--card)_92%,var(--danger)_8%)]",
    icon: "bg-[color:color-mix(in_oklch,var(--danger)_15%,var(--secondary))]",
  },
  info: {
    border: "border-[color:color-mix(in_oklch,var(--primary)_28%,var(--border))]",
    surface:
      "bg-[color:color-mix(in_oklch,var(--card)_92%,var(--primary)_8%)]",
    icon: "bg-[color:color-mix(in_oklch,var(--primary)_15%,var(--secondary))]",
  },
};

const toastIconMap = {
  success: CheckCircle2,
  error: CircleAlert,
  info: Info,
} as const;

function isAppToastKind(value: string | undefined): value is AppToastKind {
  return value === "success" || value === "error" || value === "info";
}

function getToastKind(toast: { type?: string; data?: AppToastData }) {
  if (isAppToastKind(toast.type)) {
    return toast.type;
  }

  return toast.data?.kind ?? "info";
}

function addToast(kind: AppToastKind, options: ShowToastOptions) {
  return toastManager.add({
    title: options.title,
    description: options.description,
    timeout: kind === "error" ? 0 : options.timeout ?? TOAST_TIMEOUT_MS,
    priority: kind === "error" ? "high" : "low",
    type: kind,
    data: { kind },
  });
}

function ToastViewport() {
  const { toasts } = BaseToast.useToastManager<AppToastData>();

  return (
    <BaseToast.Portal>
      <BaseToast.Viewport
        data-slot="toast-viewport"
        className="pointer-events-none fixed inset-x-0 bottom-0 z-[110] flex max-h-screen flex-col-reverse gap-3 p-4 sm:right-0 sm:left-auto sm:w-full sm:max-w-sm"
      >
        {toasts.map((toast) => {
          const kind = getToastKind(toast);
          const Icon = toastIconMap[kind];
          const toneClasses = toastToneClassMap[kind];

          return (
            <BaseToast.Root
              key={toast.id}
              toast={toast}
              swipeDirection={["right", "down"]}
              role={kind === "error" ? "alert" : "status"}
              data-slot="toast"
              data-kind={kind}
              className="pointer-events-auto"
            >
              <BaseToast.Content
                data-slot="toast-content"
                className={cn(
                  "rounded-[var(--radius-lg)] border p-4 shadow-lg shadow-black/10 backdrop-blur transition data-[starting]:animate-in data-[starting]:fade-in data-[starting]:slide-in-from-bottom-2 data-[ending]:animate-out data-[ending]:fade-out data-[ending]:slide-out-to-right-6",
                  toneClasses.border,
                  toneClasses.surface
                )}
              >
                <div
                  data-slot="toast-body"
                  className="flex items-start gap-3"
                >
                  <div
                    data-slot="toast-icon"
                    aria-hidden="true"
                    className={cn(
                      "mt-0.5 flex h-8 w-8 items-center justify-center rounded-full text-[color:var(--foreground)]",
                      toneClasses.icon
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div data-slot="toast-text" className="min-w-0 flex-1">
                    {toast.title ? (
                      <BaseToast.Title
                        data-slot="toast-title"
                        className="text-sm font-semibold text-[color:var(--foreground)]"
                      >
                        {toast.title}
                      </BaseToast.Title>
                    ) : null}
                    {toast.description ? (
                      <BaseToast.Description
                        data-slot="toast-description"
                        className={cn(
                          "text-sm leading-6 text-[color:var(--muted-foreground)]",
                          toast.title ? "mt-1" : null
                        )}
                      >
                        {toast.description}
                      </BaseToast.Description>
                    ) : null}
                  </div>
                  <BaseToast.Close
                    data-slot="toast-close"
                    aria-label="Dismiss notification"
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full text-[color:var(--muted-foreground)] transition-colors hover:bg-[color:var(--accent)] hover:text-[color:var(--foreground)]"
                  >
                    <X className="h-4 w-4" />
                  </BaseToast.Close>
                </div>
              </BaseToast.Content>
            </BaseToast.Root>
          );
        })}
      </BaseToast.Viewport>
    </BaseToast.Portal>
  );
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const value = useMemo<ToastApi>(
    () => ({
      success: (options) => addToast("success", options),
      error: (options) => addToast("error", options),
      info: (options) => addToast("info", options),
      close: (toastId) => toastManager.close(toastId),
    }),
    []
  );

  return (
    <ToastContext.Provider value={value}>
      <BaseToast.Provider
        toastManager={toastManager}
        timeout={TOAST_TIMEOUT_MS}
        limit={TOAST_LIMIT}
      >
        {children}
        <ToastViewport />
      </BaseToast.Provider>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }

  return context;
}
