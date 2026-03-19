"use client";

import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
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

const toastManager = BaseToast.createToastManager<AppToastData>();
const ToastContext = createContext<ToastApi | null>(null);

const toastToneClassMap: Record<AppToastKind, string> = {
  success:
    "border-[color:color-mix(in_oklch,var(--success)_32%,var(--border))] bg-[color:color-mix(in_oklch,var(--card)_92%,var(--success)_8%)]",
  error:
    "border-[color:color-mix(in_oklch,var(--danger)_30%,var(--border))] bg-[color:color-mix(in_oklch,var(--card)_92%,var(--danger)_8%)]",
  info:
    "border-[color:color-mix(in_oklch,var(--primary)_28%,var(--border))] bg-[color:color-mix(in_oklch,var(--card)_92%,var(--primary)_8%)]",
};

const toastIconMap = {
  success: CheckCircle2,
  error: CircleAlert,
  info: Info,
} as const;

function addToast(kind: AppToastKind, options: ShowToastOptions) {
  return toastManager.add({
    title: options.title,
    description: options.description,
    timeout: options.timeout ?? 4200,
    priority: kind === "error" ? "high" : "low",
    data: { kind },
  });
}

function ToastViewport() {
  const { toasts } = BaseToast.useToastManager<AppToastData>();

  return (
    <BaseToast.Portal>
      <BaseToast.Viewport className="pointer-events-none fixed inset-x-0 bottom-0 z-[110] flex max-h-screen flex-col-reverse gap-3 p-4 sm:right-0 sm:left-auto sm:w-full sm:max-w-sm">
        {toasts.map((toast) => {
          const kind = toast.data?.kind ?? "info";
          const Icon = toastIconMap[kind];

          return (
            <BaseToast.Root
              key={toast.id}
              toast={toast}
              swipeDirection={["right", "down"]}
              className="pointer-events-auto"
            >
              <BaseToast.Content
                className={cn(
                  "rounded-[var(--radius-lg)] border p-4 shadow-lg shadow-black/10 backdrop-blur transition data-[starting]:animate-in data-[starting]:fade-in data-[starting]:slide-in-from-bottom-2 data-[ending]:animate-out data-[ending]:fade-out data-[ending]:slide-out-to-right-6",
                  toastToneClassMap[kind]
                )}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-[color:var(--secondary)] text-[color:var(--foreground)]">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    {toast.title ? (
                      <BaseToast.Title className="text-sm font-semibold text-[color:var(--foreground)]">
                        {toast.title}
                      </BaseToast.Title>
                    ) : null}
                    {toast.description ? (
                      <BaseToast.Description className="mt-1 text-sm leading-6 text-[color:var(--muted-foreground)]">
                        {toast.description}
                      </BaseToast.Description>
                    ) : null}
                  </div>
                  <BaseToast.Close
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
      <BaseToast.Provider toastManager={toastManager} timeout={4200} limit={4}>
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
