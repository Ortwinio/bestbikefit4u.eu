import type { Doc } from "../../../../convex/_generated/dataModel";

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function toDate(value: number | string | Date) {
  return value instanceof Date ? value : new Date(value);
}

export function formatAdminDateTime(
  value: number | string | Date | null | undefined
) {
  if (value === null || value === undefined || value === "") {
    return "—";
  }

  const date = toDate(value);
  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(
    date.getUTCDate()
  )} ${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}`;
}

export function formatAdminDate(value: number | string | Date | null | undefined) {
  if (value === null || value === undefined || value === "") {
    return "—";
  }

  const date = toDate(value);
  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(
    date.getUTCDate()
  )}`;
}

export function formatAdminRelativeDate(value: number | string | Date | null | undefined) {
  if (value === null || value === undefined || value === "") {
    return "—";
  }

  const date = toDate(value);
  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  const diffDays = Math.round((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays <= 0) {
    return "Today";
  }
  if (diffDays === 1) {
    return "1 day ago";
  }
  if (diffDays < 30) {
    return `${diffDays} days ago`;
  }

  const months = Math.round(diffDays / 30);
  return months === 1 ? "1 month ago" : `${months} months ago`;
}

export function formatAdminPercent(value: number | null | undefined) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "—";
  }

  return `${Math.round(value * 100)}%`;
}

export function getAdminDisplayName(
  user:
    | Pick<Doc<"users">, "_id" | "name" | "displayName" | "email">
    | null
    | undefined
) {
  if (!user) {
    return "Unknown";
  }

  return user.displayName ?? user.name ?? user.email ?? "Unknown";
}

export function getBikeDisplayName(
  bike:
    | Pick<Doc<"bikes">, "_id" | "name" | "brand" | "model" | "bikeType">
    | null
    | undefined
) {
  if (!bike) {
    return "Unknown bike";
  }

  const brandedName = [bike.brand, bike.model].filter(Boolean).join(" ");
  if (bike.name && brandedName) {
    return `${bike.name} · ${brandedName}`;
  }

  return bike.name ?? brandedName ?? bike.bikeType ?? "Unknown bike";
}

export function summarizeJsonText(value: string | undefined | null) {
  if (!value) {
    return "Not provided.";
  }

  try {
    const parsed = JSON.parse(value) as unknown;
    if (Array.isArray(parsed)) {
      return `${parsed.length} entries recorded.`;
    }
    if (parsed && typeof parsed === "object") {
      const entries = Object.entries(parsed as Record<string, unknown>).slice(0, 3);
      if (!entries.length) {
        return "Empty payload.";
      }
      return entries
        .map(([key, entryValue]) => `${key}: ${String(entryValue)}`)
        .join(" · ");
    }
    return String(parsed);
  } catch {
    return value;
  }
}
