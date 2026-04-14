import type { Doc } from "../../../../convex/_generated/dataModel";

export const GUIDE_CLUSTER_OPTIONS = [
  { value: "pain-discomfort", label: "Pain & discomfort" },
  { value: "ride-types", label: "Ride types" },
  { value: "geometry", label: "Geometry" },
  { value: "setup", label: "Setup parameters" },
  { value: "performance", label: "Performance" },
  { value: "maintenance", label: "Maintenance" },
  { value: "equipment", label: "Equipment" },
  { value: "training", label: "Training" },
  { value: "nutrition", label: "Nutrition" },
] as const;

export const GUIDE_STATUS_OPTIONS = [
  { value: "all", label: "All statuses" },
  { value: "draft", label: "Draft" },
  { value: "in_review", label: "In review" },
  { value: "published", label: "Published" },
  { value: "unpublished", label: "Unpublished" },
] as const;

export type GuideStatusFilter = (typeof GUIDE_STATUS_OPTIONS)[number]["value"];
export type GuideStatus = Doc<"guidePages">["status"];
export type GuideCluster = (typeof GUIDE_CLUSTER_OPTIONS)[number]["value"];

const GUIDE_ADMIN_ROLES = [
  "super_admin",
  "ops_admin",
  "fit_specialist",
  "qa_manager",
] as const;

export function guideStatusTone(status: GuideStatus) {
  switch (status) {
    case "published":
      return "success";
    case "in_review":
      return "info";
    case "unpublished":
      return "warning";
    case "draft":
    default:
      return "neutral";
  }
}

export function formatGuideStatusLabel(status: GuideStatus) {
  switch (status) {
    case "in_review":
      return "In review";
    case "published":
      return "Published";
    case "unpublished":
      return "Unpublished";
    case "draft":
    default:
      return "Draft";
  }
}

export function formatGuideDate(value?: number | null) {
  if (!value) {
    return "Not set";
  }

  return new Date(value).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatGuideDateTime(value?: number | null) {
  if (!value) {
    return "Not set";
  }

  return new Date(value).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function slugifyGuideTitle(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function buildGuidePreviewPath(slug: string) {
  const normalized = slug.trim().toLowerCase();
  return normalized ? `bestbikefit4u.eu/guides/${normalized}` : "bestbikefit4u.eu/guides/{slug}";
}

export function isGuideAdminRole(role: string) {
  return GUIDE_ADMIN_ROLES.includes(role as (typeof GUIDE_ADMIN_ROLES)[number]);
}
