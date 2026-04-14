"use client";

import { useMemo, useState } from "react";
import { useMutation } from "convex/react";
import { useRouter } from "next/navigation";
import type { Doc } from "../../../../convex/_generated/dataModel";
import { api } from "../../../../convex/_generated/api";
import {
  AccessibleDialog,
  Button,
  Input,
  Select,
  Textarea,
  useToast,
} from "@/components/ui";
import {
  AdminPageHeader,
  AdminSectionCard,
  AdminStatusPill,
  AdminTable,
  AdminTableCell,
  AdminTableHead,
  AdminTableRow,
} from "@/components/admin/layout/AdminUi";
import { formatGuideDateTime } from "./guide-admin-shared";

type RedirectRow = Doc<"redirects">;

export function GuideRedirectsView({
  redirects,
  createdByLabels,
}: {
  redirects: RedirectRow[];
  createdByLabels: Record<string, string>;
}) {
  const toast = useToast();
  const router = useRouter();
  const addRedirect = useMutation(api.guides.mutations.addRedirect);
  const deleteRedirect = useMutation(api.guides.mutations.deleteRedirect);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [statusCode, setStatusCode] = useState<301 | 302>(301);
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<RedirectRow | null>(null);

  const redirectCountLabel = useMemo(
    () => `${redirects.length} redirect${redirects.length === 1 ? "" : "s"}`,
    [redirects.length]
  );

  const handleAddRedirect = async () => {
    setError(null);
    const normalizedFrom = from.trim();
    const normalizedTo = to.trim();

    if (!normalizedFrom || !normalizedTo) {
      setError("Both from and to paths are required.");
      return;
    }

    setIsSaving(true);
    try {
      await addRedirect({
        from: normalizedFrom,
        to: normalizedTo,
        statusCode,
        reason: reason.trim() || undefined,
      });
      toast.success({ description: "Redirect added." });
      setFrom("");
      setTo("");
      setReason("");
      setStatusCode(301);
      router.refresh();
    } catch (mutationError) {
      console.error("Failed to add redirect:", mutationError);
      setError(
        mutationError instanceof Error
          ? mutationError.message
          : "Could not add the redirect."
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteRedirect = async () => {
    if (!deleteTarget) {
      return;
    }

    setIsSaving(true);
    try {
      await deleteRedirect({ id: deleteTarget._id });
      toast.success({ description: "Redirect deleted." });
      setDeleteTarget(null);
      router.refresh();
    } catch (mutationError) {
      console.error("Failed to delete redirect:", mutationError);
      setError(
        mutationError instanceof Error
          ? mutationError.message
          : "Could not delete the redirect."
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <AccessibleDialog
        open={deleteTarget !== null}
        title="Delete redirect"
        description={
          deleteTarget
            ? `Delete the redirect from ${deleteTarget.from} to ${deleteTarget.to}? This removes the mapping immediately.`
            : undefined
        }
        onClose={() => setDeleteTarget(null)}
      >
        <div className="flex flex-wrap justify-end gap-3">
          <Button variant="ghost" type="button" onClick={() => setDeleteTarget(null)}>
            Cancel
          </Button>
          <Button type="button" onClick={handleDeleteRedirect} isLoading={isSaving}>
            Delete
          </Button>
        </div>
      </AccessibleDialog>

      <AdminPageHeader
        eyebrow="Product / Guides"
        title="Redirects"
        description="Manage guide redirect mappings and review auto-created slug-change redirects."
        actions={
          <>
            <AdminStatusPill tone="neutral">{redirectCountLabel}</AdminStatusPill>
            <Button
              type="button"
              onClick={() => {
                const target = document.getElementById("guide-redirect-form");
                target?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
            >
              Add redirect
            </Button>
          </>
        }
      />

      <AdminSectionCard
        title="Redirect manager"
        description="Create permanent or temporary redirects for legacy guide routes."
      >
        <div id="guide-redirect-form" className="grid gap-4">
          {error ? (
            <div className="rounded-2xl border border-[color:var(--danger)]/30 bg-[color:color-mix(in_oklch,var(--danger)_10%,var(--card)_90%)] p-4 text-sm text-[color:var(--foreground)]">
              {error}
            </div>
          ) : null}
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              label="From path"
              value={from}
              onChange={(event) => setFrom(event.currentTarget.value)}
              placeholder="/use-cases/back-pain-cycling"
            />
            <Input
              label="To path"
              value={to}
              onChange={(event) => setTo(event.currentTarget.value)}
              placeholder="/guides/bike-fitting-for-lower-back-pain"
            />
          </div>
          <div className="grid gap-4 md:grid-cols-[12rem_minmax(0,1fr)]">
            <Select
              label="Status code"
              value={String(statusCode)}
              onChange={(event) => setStatusCode(Number(event.currentTarget.value) as 301 | 302)}
              options={[
                { value: "301", label: "301 permanent" },
                { value: "302", label: "302 temporary" },
              ]}
            />
            <Textarea
              label="Reason"
              value={reason}
              onChange={(event) => setReason(event.currentTarget.value)}
              rows={2}
              helperText="Optional note for admins."
            />
          </div>
          <div className="flex flex-wrap gap-3">
            <Button type="button" onClick={handleAddRedirect} isLoading={isSaving}>
              Add redirect
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setFrom("");
                setTo("");
                setReason("");
                setStatusCode(301);
                setError(null);
              }}
            >
              Clear
            </Button>
          </div>
        </div>
      </AdminSectionCard>

      <AdminSectionCard
        title="Existing redirects"
        description="Auto-created slug-change redirects appear here with their recorded reason."
      >
        {redirects.length === 0 ? (
          <p className="text-sm text-[color:var(--muted-foreground)]">No redirects yet.</p>
        ) : (
          <AdminTable>
            <AdminTableHead
              columns={["From", "To", "Status", "Created by", "Created at", "Reason", "Action"]}
            />
            <tbody>
              {redirects.map((redirect) => (
                <AdminTableRow key={String(redirect._id)}>
                  <AdminTableCell>
                    <code className="text-xs">{redirect.from}</code>
                  </AdminTableCell>
                  <AdminTableCell>
                    <code className="text-xs">{redirect.to}</code>
                  </AdminTableCell>
                  <AdminTableCell>
                    <AdminStatusPill tone={redirect.statusCode === 301 ? "success" : "warning"}>
                      {redirect.statusCode}
                    </AdminStatusPill>
                  </AdminTableCell>
                  <AdminTableCell>
                    {createdByLabels[String(redirect.createdBy)] ?? String(redirect.createdBy)}
                  </AdminTableCell>
                  <AdminTableCell>{formatGuideDateTime(redirect.createdAt)}</AdminTableCell>
                  <AdminTableCell className="max-w-md">
                    <span className="text-sm text-[color:var(--muted-foreground)]">
                      {redirect.reason ?? "No reason provided"}
                    </span>
                  </AdminTableCell>
                  <AdminTableCell>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteTarget(redirect)}
                    >
                      Delete
                    </Button>
                  </AdminTableCell>
                </AdminTableRow>
              ))}
            </tbody>
          </AdminTable>
        )}
      </AdminSectionCard>
    </div>
  );
}
