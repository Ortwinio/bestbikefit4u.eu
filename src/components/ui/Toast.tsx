"use client";

import {
  createContext,
  isValidElement,
  useContext,
  useMemo,
  type ComponentPropsWithoutRef,
  type ReactNode,
} from "react";
import {
  Toast as BaseToast,
  type ToastManagerAddOptions,
  type ToastManagerUpdateOptions,
} from "@base-ui/react/toast";
import { CheckCircle2, CircleAlert, Info, TriangleAlert, X } from "lucide-react";
import { cn } from "@/utils/cn";

type AppToastKind = "success" | "error" | "info" | "warning";

type AppToastData = {
  kind: AppToastKind;
};

export type ToastActionOptions = Omit<
  ComponentPropsWithoutRef<"button">,
  "children"
> & {
  label: ReactNode;
};

export type ToastOptions = {
  title?: ReactNode;
  description?: ReactNode;
  timeout?: number;
  action?: ToastActionOptions;
};

export type ShowToastOptions = ToastOptions & {
  description: ReactNode;
};

export type ToastPromiseOptions<Value> = {
  loading: string | ToastOptions;
  success: ToastPromiseEntry<Value>;
  error: ToastPromiseEntry<unknown>;
};

type ToastPromiseEntry<Value> =
  | string
  | ToastOptions
  | ((value: Value) => string | ToastOptions);

export type ToastApi = {
  toast: (
    titleOrOptions: ReactNode | ToastOptions,
    options?: Omit<ToastOptions, "title">
  ) => string;
  success: (options: ShowToastOptions) => string;
  error: (options: ShowToastOptions) => string;
  info: (options: ShowToastOptions) => string;
  warning: (options: ShowToastOptions) => string;
  promise: <Value>(
    promiseValue: Promise<Value>,
    options: ToastPromiseOptions<Value>
  ) => Promise<Value>;
  close: (toastId?: string) => void;
};

export type ToastFunction = ToastApi & {
  (
    titleOrOptions: ReactNode | ToastOptions,
    options?: Omit<ToastOptions, "title">
  ): string;
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
  warning: {
    border:
      "border-[color:color-mix(in_oklch,var(--warning)_30%,var(--border))]",
    surface:
      "bg-[color:color-mix(in_oklch,var(--card)_92%,var(--warning)_8%)]",
    icon: "bg-[color:color-mix(in_oklch,var(--warning)_15%,var(--secondary))]",
  },
};

const toastIconMap = {
  success: CheckCircle2,
  error: CircleAlert,
  info: Info,
  warning: TriangleAlert,
} as const;

function isAppToastKind(value: string | undefined): value is AppToastKind {
  return (
    value === "success" ||
    value === "error" ||
    value === "info" ||
    value === "warning"
  );
}

export function getToastKind(toast: { type?: string; data?: AppToastData }) {
  if (isAppToastKind(toast.type)) {
    return toast.type;
  }

  return toast.data?.kind ?? "info";
}

function toToastActionProps(action?: ToastActionOptions) {
  if (!action) {
    return undefined;
  }

  const { label, ...actionProps } = action;

  return {
    ...actionProps,
    children: label,
  };
}

function isToastOptions(value: ReactNode | ToastOptions): value is ToastOptions {
  return typeof value === "object" && value !== null && !isValidElement(value);
}

export function buildToastManagerOptions(
  kind: AppToastKind,
  options: ToastOptions
): ToastManagerAddOptions<AppToastData> {
  return {
    title: options.title,
    description: options.description,
    timeout: kind === "error" ? 0 : options.timeout ?? TOAST_TIMEOUT_MS,
    priority: kind === "error" ? "high" : "low",
    type: kind,
    data: { kind },
    actionProps: toToastActionProps(options.action),
  };
}

export function normalizeToastInput(
  titleOrOptions: ReactNode | ToastOptions,
  options?: Omit<ToastOptions, "title">
): ToastOptions {
  if (isToastOptions(titleOrOptions)) {
    return titleOrOptions;
  }

  return {
    ...options,
    title: titleOrOptions,
  };
}

export function normalizeToastPromiseEntry(
  entry: string | ToastOptions,
  kind: AppToastKind = "info"
): string | ToastManagerUpdateOptions<AppToastData> {
  if (typeof entry === "string") {
    return entry;
  }

  return buildToastManagerOptions(kind, entry);
}

function resolveToastPromiseEntry<Value>(
  entry: ToastPromiseEntry<Value>,
  value?: Value
): string | ToastManagerUpdateOptions<AppToastData> {
  const resolved =
    typeof entry === "function"
      ? (entry as (value: Value) => string | ToastOptions)(value as Value)
      : entry;

  return normalizeToastPromiseEntry(resolved);
}

function addToast(kind: AppToastKind, options: ToastOptions) {
  return toastManager.add(buildToastManagerOptions(kind, options));
}

function buildToastApi(): ToastApi {
  const baseToast = (titleOrOptions: ReactNode | ToastOptions, options?: Omit<ToastOptions, "title">) =>
    addToast("info", normalizeToastInput(titleOrOptions, options));

  return {
    toast: baseToast,
    success: (options) => addToast("success", options),
    error: (options) => addToast("error", options),
    info: (options) => addToast("info", options),
    warning: (options) => addToast("warning", options),
    promise: (promiseValue, options) =>
      toastManager.promise(promiseValue, {
        loading: normalizeToastPromiseEntry(options.loading),
        success: (result) => resolveToastPromiseEntry(options.success, result),
        error: (error) => resolveToastPromiseEntry(options.error, error),
      }),
    close: (toastId) => toastManager.close(toastId),
  };
}

export const toast = Object.assign(
  (titleOrOptions: ReactNode | ToastOptions, options?: Omit<ToastOptions, "title">) =>
    addToast("info", normalizeToastInput(titleOrOptions, options)),
  {
    success: (options: ShowToastOptions) => addToast("success", options),
    error: (options: ShowToastOptions) => addToast("error", options),
    info: (options: ShowToastOptions) => addToast("info", options),
    warning: (options: ShowToastOptions) => addToast("warning", options),
    close: (toastId?: string) => toastManager.close(toastId),
    promise: <Value,>(
      promiseValue: Promise<Value>,
      options: ToastPromiseOptions<Value>
    ) =>
      toastManager.promise(promiseValue, {
        loading: normalizeToastPromiseEntry(options.loading),
        success: (result) => resolveToastPromiseEntry(options.success, result),
        error: (error) => resolveToastPromiseEntry(options.error, error),
      }),
  }
) as ToastFunction;

function Toaster(
  props: Omit<ComponentPropsWithoutRef<typeof BaseToast.Viewport>, "children">
) {
  const { toasts } = BaseToast.useToastManager<AppToastData>();
  const { className, ...viewportProps } = props;

  return (
    <BaseToast.Portal>
      <BaseToast.Viewport
        data-slot="toaster"
        className={cn(
          "pointer-events-none fixed inset-x-0 bottom-0 z-[110] flex max-h-screen flex-col-reverse gap-3 p-4 sm:right-0 sm:left-auto sm:w-full sm:max-w-sm",
          className
        )}
        {...viewportProps}
      >
        {toasts.map((toastItem) => {
          const kind = getToastKind(toastItem);
          const Icon = toastIconMap[kind];
          const toneClasses = toastToneClassMap[kind];

          return (
            <BaseToast.Root
              key={toastItem.id}
              toast={toastItem}
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
                <div data-slot="toast-body" className="flex items-start gap-3">
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
                    {toastItem.title ? (
                      <BaseToast.Title
                        data-slot="toast-title"
                        className="text-sm font-semibold text-[color:var(--foreground)]"
                      >
                        {toastItem.title}
                      </BaseToast.Title>
                    ) : null}
                    {toastItem.description ? (
                      <BaseToast.Description
                        data-slot="toast-description"
                        className={cn(
                          "text-sm leading-6 text-[color:var(--muted-foreground)]",
                          toastItem.title ? "mt-1" : null
                        )}
                      >
                        {toastItem.description}
                      </BaseToast.Description>
                    ) : null}
                  </div>
                  {toastItem.actionProps ? (
                    <BaseToast.Action
                      data-slot="toast-action"
                      className="inline-flex h-8 items-center justify-center rounded-full border border-[color:var(--border)] px-3 text-xs font-medium text-[color:var(--foreground)] transition-colors hover:bg-[color:var(--accent)]"
                    />
                  ) : null}
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

export { Toaster };
export { Toaster as ToastViewport };

export function ToastProvider({ children }: { children: ReactNode }) {
  const value = useMemo<ToastApi>(() => buildToastApi(), []);

  return (
    <ToastContext.Provider value={value}>
      <BaseToast.Provider
        toastManager={toastManager}
        timeout={TOAST_TIMEOUT_MS}
        limit={TOAST_LIMIT}
      >
        {children}
        <Toaster />
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
