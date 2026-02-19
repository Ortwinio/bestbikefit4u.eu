import type { ReactNode } from "react";
import { AlertCircle, Inbox, Loader2 } from "lucide-react";

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
    <div className={`flex items-center justify-center py-12 ${className ?? ""}`}>
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>{label}</span>
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
    <div className={`rounded-lg border border-gray-200 bg-white p-8 text-center ${className ?? ""}`}>
      <Inbox className="mx-auto h-8 w-8 text-gray-300" />
      <h2 className="mt-3 text-lg font-semibold text-gray-900">{title}</h2>
      {description ? <p className="mt-2 text-sm text-gray-600">{description}</p> : null}
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
      className={`rounded-lg border border-red-200 bg-red-50 p-4 ${className ?? ""}`}
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
