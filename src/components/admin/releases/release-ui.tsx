import type { ReactNode } from "react";
import { AdminStatusPill } from "@/components/admin/layout/AdminUi";
import type { ReleaseStatus, ReleaseType } from "./data";

type AdminStatusTone = "neutral" | "success" | "warning" | "danger" | "info";

const releaseTypeLabelMap: Record<ReleaseType, string> = {
  app: "App",
  fit_engine: "Fit engine",
  geometry_data: "Geometry data",
  content: "Content",
  integration: "Integration",
  internal: "Internal",
};

export function releaseStatusTone(status: ReleaseStatus): AdminStatusTone {
  if (status === "live") return "success";
  if (status === "rolling_out") return "warning";
  if (status === "approved" || status === "scheduled") return "info";
  if (status === "rolled_back") return "danger";
  return "neutral";
}

export function releaseTypeTone(type: ReleaseType): AdminStatusTone {
  if (type === "fit_engine" || type === "integration") return "info";
  if (type === "geometry_data") return "warning";
  if (type === "content") return "neutral";
  if (type === "internal") return "danger";
  return "success";
}

export function releaseTypeLabel(type: ReleaseType) {
  return releaseTypeLabelMap[type];
}

export function ReleaseStatusPill({
  status,
  children,
}: {
  status: ReleaseStatus;
  children?: ReactNode;
}) {
  return <AdminStatusPill tone={releaseStatusTone(status)}>{children ?? status.replaceAll("_", " ")}</AdminStatusPill>;
}

export function ReleaseTypePill({
  type,
  children,
}: {
  type: ReleaseType;
  children?: ReactNode;
}) {
  return <AdminStatusPill tone={releaseTypeTone(type)}>{children ?? releaseTypeLabel(type)}</AdminStatusPill>;
}
