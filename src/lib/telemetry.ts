export interface ClientErrorContext {
  area: string;
  action: string;
  operationType?: "query" | "mutation" | "action" | "client";
  subjectId?: string;
  metadata?: Record<string, unknown>;
}

export function getErrorMessage(
  error: unknown,
  fallback = "Something went wrong. Please try again."
): string {
  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }
  if (typeof error === "string" && error.trim().length > 0) {
    return error;
  }
  return fallback;
}

export function reportClientError(
  error: unknown,
  context: ClientErrorContext
): string {
  const message = getErrorMessage(error);
  console.error("[convex-communication-error]", {
    event: "convex_communication_error",
    area: context.area,
    action: context.action,
    operationType: context.operationType ?? "client",
    subjectId: context.subjectId,
    message,
    metadata: context.metadata,
    error,
  });
  return message;
}
