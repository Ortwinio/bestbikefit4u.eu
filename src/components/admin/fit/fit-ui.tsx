import type { ReactNode } from "react";
import { AdminStatusPill } from "@/components/admin/layout/AdminUi";
import type { EngineVersionStatus, FitReviewStatus } from "./data";

type AdminStatusTone = "neutral" | "success" | "warning" | "danger" | "info";

export function engineStatusTone(status: EngineVersionStatus): AdminStatusTone {
  if (status === "active") return "success";
  if (status === "qa") return "warning";
  if (status === "draft") return "info";
  return "neutral";
}

export function reviewStatusTone(status: FitReviewStatus): AdminStatusTone {
  if (status === "required") return "warning";
  if (status === "reviewed") return "success";
  if (status === "overridden") return "info";
  return "neutral";
}

export function FitStatusPill({
  status,
  children,
}: {
  status: EngineVersionStatus;
  children?: ReactNode;
}) {
  return <AdminStatusPill tone={engineStatusTone(status)}>{children ?? status}</AdminStatusPill>;
}

export function ReviewStatusPill({
  status,
  children,
}: {
  status: FitReviewStatus;
  children?: ReactNode;
}) {
  return <AdminStatusPill tone={reviewStatusTone(status)}>{children ?? status}</AdminStatusPill>;
}
