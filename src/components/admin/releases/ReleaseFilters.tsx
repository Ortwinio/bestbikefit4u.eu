import Link from "next/link";
import { Button } from "@/components/ui";
import type { ReleaseStatus, ReleaseType } from "./data";
import { releaseTypeLabel } from "./release-ui";

const statusOptions: Array<{ label: string; value: "all" | ReleaseStatus }> = [
  { label: "All statuses", value: "all" },
  { label: "Draft", value: "draft" },
  { label: "QA", value: "in_qa" },
  { label: "Approved", value: "approved" },
  { label: "Scheduled", value: "scheduled" },
  { label: "Rolling out", value: "rolling_out" },
  { label: "Live", value: "live" },
  { label: "Rolled back", value: "rolled_back" },
];

const typeOptions: Array<{ label: string; value: "all" | ReleaseType }> = [
  { label: "All types", value: "all" },
  { label: "App", value: "app" },
  { label: "Fit engine", value: "fit_engine" },
  { label: "Geometry", value: "geometry_data" },
  { label: "Content", value: "content" },
  { label: "Integration", value: "integration" },
  { label: "Internal", value: "internal" },
];

function buildHref({
  status,
  type,
  nextStatus,
  nextType,
}: {
  status: string;
  type: string;
  nextStatus?: string;
  nextType?: string;
}) {
  const params = new URLSearchParams();
  const resolvedStatus = nextStatus ?? status;
  const resolvedType = nextType ?? type;

  if (resolvedStatus && resolvedStatus !== "all") {
    params.set("status", resolvedStatus);
  }

  if (resolvedType && resolvedType !== "all") {
    params.set("type", resolvedType);
  }

  const query = params.toString();
  return query ? `/admin/releases?${query}` : "/admin/releases";
}

export function ReleaseFilters({
  status,
  type,
}: {
  status: string;
  type: string;
}) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-[color:var(--muted-foreground)]">
          Status
        </p>
        <div className="flex flex-wrap gap-2">
          {statusOptions.map((option) => {
            const active = status === option.value;
            return (
              <Button
                key={option.value}
                size="sm"
                variant={active ? "primary" : "outline"}
                render={<Link href={buildHref({ status, type, nextStatus: option.value })} />}
              >
                {option.label}
              </Button>
            );
          })}
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-[color:var(--muted-foreground)]">
          Type
        </p>
        <div className="flex flex-wrap gap-2">
          {typeOptions.map((option) => {
            const active = type === option.value;
            return (
              <Button
                key={option.value}
                size="sm"
                variant={active ? "primary" : "outline"}
                render={<Link href={buildHref({ status, type, nextType: option.value })} />}
              >
                {option.value === "all" ? option.label : releaseTypeLabel(option.value)}
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
