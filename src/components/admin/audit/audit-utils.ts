import type { Id } from "../../../../convex/_generated/dataModel";

export const AUDIT_TARGET_TYPES = [
  "user",
  "organization",
  "release",
  "geometry_record",
  "fit_run",
  "message",
  "engine_version",
  "feature_flag",
  "plan",
] as const;

export type AuditTargetType = (typeof AUDIT_TARGET_TYPES)[number];

export const AUDIT_READ_ROLES = new Set([
  "super_admin",
  "ops_admin",
  "support_admin",
  "qa_manager",
] as const);

const AUDIT_ACTION_LABELS: Record<string, string> = {
  "user.tier_change": "Changed user plan",
  "user.suspend": "Suspended user",
  "user.restore": "Restored user",
  "billing.trial_start": "Started trial",
  "billing.trial_end": "Ended trial",
  "billing.plan_create": "Created plan",
  "billing.plan_update": "Updated plan",
  "geometry.approve": "Approved geometry record",
  "release.status_change": "Changed release status",
  "fit_run.reviewed": "Reviewed fit run",
  "message.create": "Created dashboard message",
  "message.publish": "Published dashboard message",
  "message.pause": "Paused dashboard message",
  "message.expire": "Expired dashboard message",
  "message.delete": "Deleted dashboard message",
  "feature_flag.set": "Changed feature flag",
  "gdpr.export": "Exported user data",
  "gdpr.anonymize": "Anonymized user account",
};

const TARGET_ROUTE_PREFIX: Record<string, string> = {
  user: "/admin/users",
  organization: "/admin/organizations",
  release: "/admin/releases",
  geometry_record: "/admin/geometry",
  fit_run: "/admin/fit-runs",
  message: "/admin/messages",
  engine_version: "/admin/fit-engine",
  feature_flag: "/admin/settings",
  plan: "/admin/settings",
};

function pad(value: number) {
  return String(value).padStart(2, "0");
}

export function formatAuditDateTime(value?: number | null) {
  if (value === null || value === undefined) {
    return "—";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())} ${pad(
    date.getUTCHours()
  )}:${pad(date.getUTCMinutes())}`;
}

export function formatAuditRelativeDate(value?: number | null) {
  if (value === null || value === undefined) {
    return "—";
  }

  const diffDays = Math.round((Date.now() - value) / (1000 * 60 * 60 * 24));
  if (diffDays <= 0) return "Today";
  if (diffDays === 1) return "1 day ago";
  if (diffDays < 30) return `${diffDays} days ago`;
  const months = Math.round(diffDays / 30);
  return months === 1 ? "1 month ago" : `${months} months ago`;
}

export function getAuditActionLabel(action: string) {
  return AUDIT_ACTION_LABELS[action] ?? action.replaceAll(".", " ");
}

export function getAuditTargetLabel(targetType?: string | null) {
  if (!targetType) return "Target";
  return targetType.replaceAll("_", " ");
}

export function getAuditTargetHref(targetType?: string | null, targetId?: string | null) {
  if (!targetType || !targetId) return null;
  const prefix = TARGET_ROUTE_PREFIX[targetType];
  if (!prefix) return null;
  return `${prefix}/${targetId}`;
}

export function parseAuditPayload(payload?: string | null) {
  if (!payload) {
    return null;
  }

  try {
    return JSON.parse(payload) as unknown;
  } catch {
    return payload;
  }
}

export function summarizeAuditPayload(payload?: string | null) {
  const parsed = parseAuditPayload(payload);
  if (parsed === null) {
    return "No payload.";
  }

  if (typeof parsed === "string") {
    return parsed;
  }

  if (Array.isArray(parsed)) {
    return `${parsed.length} entries`;
  }

  if (parsed && typeof parsed === "object") {
    const entries = Object.entries(parsed as Record<string, unknown>).slice(0, 3);
    if (!entries.length) return "Empty payload.";
    return entries.map(([key, value]) => `${key}: ${String(value)}`).join(" · ");
  }

  return String(parsed);
}

export function getAdminName(
  admin:
    | Pick<{ _id: Id<"users">; displayName?: string | null; name?: string | null; email?: string | null }, "_id" | "displayName" | "name" | "email">
    | null
    | undefined
) {
  if (!admin) return "Unknown admin";
  return admin.displayName ?? admin.name ?? admin.email ?? String(admin._id);
}

