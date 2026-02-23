export interface ClientErrorContext {
  area: string;
  action: string;
  operationType?: "query" | "mutation" | "action" | "client";
  subjectId?: string;
  metadata?: Record<string, unknown>;
  userMessage?: string;
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
  const fallback = context.userMessage ?? "Something went wrong. Please try again.";
  const message = getErrorMessage(error, fallback);

  let safeMessage = fallback;
  if (message === "Not authenticated") {
    safeMessage = "Please sign in to continue.";
  } else if (message === "Not authorized") {
    safeMessage = "You are not allowed to perform this action.";
  } else if (message.includes("Too many")) {
    safeMessage = "Too many requests. Please wait and try again.";
  } else if (message.startsWith("Invalid ") || message.includes("must be")) {
    safeMessage = "Please check your input and try again.";
  }

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
  return safeMessage;
}
