"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Copy, Lock, Radar } from "lucide-react";
import { useMarketingEventLogger } from "@/components/analytics/MarketingEventTracker";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  useToast,
} from "@/components/ui";
import { useDashboardMessages } from "@/i18n/useDashboardMessages";

export type PublicFitGeometryQuality = "full" | "partial" | "none" | null;

export function shouldShowWeakPublicFitGuidance(geometryQuality: PublicFitGeometryQuality) {
  return geometryQuality === "partial" || geometryQuality === "none";
}

export function getPublicFitToggleLabel({
  hasCode,
  labels,
}: {
  hasCode: boolean;
  labels: {
    enableAction: string;
    reenableAction: string;
  };
}) {
  if (!hasCode) {
    return labels.enableAction;
  }

  return labels.reenableAction;
}

type BikePublicFitControlsProps = {
  bikeId: string;
  publicFitCode: string | null;
  publicFitEnabled: boolean;
  geometryQuality: PublicFitGeometryQuality;
  onEnable: () => Promise<void>;
  onDisable: () => Promise<void>;
};

export function BikePublicFitControls({
  bikeId,
  publicFitCode,
  publicFitEnabled,
  geometryQuality,
  onEnable,
  onDisable,
}: BikePublicFitControlsProps) {
  const pathname = usePathname();
  const { locale, messages } = useDashboardMessages();
  const toast = useToast();
  const logMarketingEvent = useMarketingEventLogger();
  const [actionState, setActionState] = useState<"idle" | "enable" | "disable" | "copy">(
    "idle"
  );

  const t = messages.bikes.publicFit;
  const hasCode = Boolean(publicFitCode);
  const statusLabel = publicFitEnabled ? t.enabledBadge : t.disabledBadge;
  const geometryQualityLabel =
    geometryQuality ? t.geometryQuality[geometryQuality] : t.geometryQuality.none;

  async function handleCopy() {
    if (!publicFitCode) {
      return;
    }

    setActionState("copy");
    try {
      if (typeof navigator === "undefined" || !navigator.clipboard?.writeText) {
        throw new Error("clipboard_unavailable");
      }

      await navigator.clipboard.writeText(publicFitCode);
      toast.success({ description: t.copied });
      logMarketingEvent({
        eventType: "bike_public_fit_code_copied",
        locale,
        pagePath: pathname ?? `/bikes/${bikeId}/edit`,
        section: "bike_public_fit_owner_controls",
        sourceTag: geometryQuality ?? "none",
      });
    } catch {
      toast.error({ description: t.copyFailed });
    } finally {
      setActionState("idle");
    }
  }

  async function handleEnable() {
    setActionState("enable");
    try {
      await onEnable();
      logMarketingEvent({
        eventType: "bike_public_fit_enabled",
        locale,
        pagePath: pathname ?? `/bikes/${bikeId}/edit`,
        section: "bike_public_fit_owner_controls",
        sourceTag: geometryQuality ?? "none",
      });
    } finally {
      setActionState("idle");
    }
  }

  async function handleDisable() {
    setActionState("disable");
    try {
      await onDisable();
      logMarketingEvent({
        eventType: "bike_public_fit_disabled",
        locale,
        pagePath: pathname ?? `/bikes/${bikeId}/edit`,
        section: "bike_public_fit_owner_controls",
        sourceTag: geometryQuality ?? "none",
      });
    } finally {
      setActionState("idle");
    }
  }

  return (
    <Card variant="bordered" className="dashboard-card-surface">
      <CardHeader className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <CardTitle>{t.title}</CardTitle>
            <CardDescription>{t.description}</CardDescription>
          </div>
          <span className="rounded-full border border-[color:var(--border)] bg-[color:var(--secondary)] px-3 py-1 text-xs font-semibold text-[color:var(--secondary-foreground)]">
            {statusLabel}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-[var(--radius-lg)] border border-[color:var(--border)] bg-[color:var(--secondary)]/30 p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--muted-foreground)]">
                {t.codeLabel}
              </p>
              <p className="mt-2 font-mono text-lg font-semibold text-[color:var(--foreground)]">
                {publicFitCode ?? "—"}
              </p>
              <p className="mt-2 text-sm text-[color:var(--muted-foreground)]">{t.codeHint}</p>
            </div>
            {hasCode ? (
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
                isLoading={actionState === "copy"}
              >
                <Copy className="h-4 w-4" />
                {t.copyAction}
              </Button>
            ) : null}
          </div>
        </div>

        <div className="rounded-[var(--radius-lg)] border border-[color:var(--border)] bg-[color:var(--background)] p-4">
          <p className="flex items-center gap-2 text-sm font-medium text-[color:var(--foreground)]">
            <Lock className="h-4 w-4 text-[color:var(--primary)]" />
            {t.privacyNote}
          </p>
        </div>

        <div className="rounded-[var(--radius-lg)] border border-[color:var(--border)] bg-[color:var(--background)] p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--muted-foreground)]">
            {t.geometryQuality[geometryQuality ?? "none"]}
          </p>
          {shouldShowWeakPublicFitGuidance(geometryQuality) ? (
            <div className="mt-3 rounded-[var(--radius-md)] border border-[color:var(--border)] bg-[color:var(--secondary)]/40 p-3">
              <p className="flex items-center gap-2 text-sm font-medium text-[color:var(--foreground)]">
                <Radar className="h-4 w-4 text-[color:var(--warning)]" />
                {t.weakGeometryTitle}
              </p>
              <p className="mt-2 text-sm leading-6 text-[color:var(--muted-foreground)]">
                {t.weakGeometryNote}
              </p>
            </div>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-3">
          {publicFitEnabled ? (
            <Button
              variant="outline"
              onClick={handleDisable}
              isLoading={actionState === "disable"}
            >
              {t.disableAction}
            </Button>
          ) : (
            <Button onClick={handleEnable} isLoading={actionState === "enable"}>
              {getPublicFitToggleLabel({
                hasCode,
                labels: {
                  enableAction: t.enableAction,
                  reenableAction: t.reenableAction,
                },
              })}
            </Button>
          )}
          <p className="self-center text-sm text-[color:var(--muted-foreground)]">
            {geometryQualityLabel}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
