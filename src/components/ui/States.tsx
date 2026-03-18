import type { ReactNode } from "react";
import { AlertCircle, Inbox, Loader2 } from "lucide-react";
import { cn } from "@/utils/cn";
import { Progress } from "./Progress";

type LoadingStateProps = {
  label?: string;
  className?: string;
};

type EmptyStateProps = {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
};

type ErrorStateProps = {
  title?: string;
  description?: string;
  action?: ReactNode;
  className?: string;
};

export function LoadingState({ label = "Loading...", className }: LoadingStateProps) {
  return (
    <div className={cn("flex items-center justify-center py-12", className)}>
      <div className="w-full max-w-xs space-y-3">
        <div className="flex items-center justify-center gap-2 text-sm text-[color:var(--muted-foreground)]">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>{label}</span>
        </div>
        <Progress value={null} label={label} />
      </div>
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "rounded-[var(--radius-lg)] border border-[color:var(--border)] bg-[color:var(--card)] p-8 text-center shadow-sm",
        className
      )}
    >
      <Inbox className="mx-auto h-8 w-8 text-[color:var(--muted-foreground)] opacity-60" />
      <h2 className="mt-3 text-lg font-semibold text-[color:var(--foreground)]">{title}</h2>
      {description ? (
        <p className="mt-2 text-sm text-[color:var(--muted-foreground)]">{description}</p>
      ) : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

export function ErrorState({
  title = "Something went wrong",
  description,
  action,
  className,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        "rounded-[var(--radius-lg)] border border-red-200 bg-red-50/90 p-4",
        className
      )}
      role="alert"
    >
      <div className="flex items-start gap-2">
        <AlertCircle className="mt-0.5 h-4 w-4 text-red-600" />
        <div>
          <p className="text-sm font-medium text-red-800">{title}</p>
          {description ? <p className="mt-1 text-sm text-red-700">{description}</p> : null}
          {action ? <div className="mt-3">{action}</div> : null}
        </div>
      </div>
    </div>
  );
}

export type { LoadingStateProps, EmptyStateProps, ErrorStateProps };
