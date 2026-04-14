"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import type { Doc } from "../../../../convex/_generated/dataModel";
import { api } from "../../../../convex/_generated/api";
import {
  AccessibleDialog,
  Button,
  Input,
  Select,
  SegmentedControl,
  SegmentedControlItem,
  Textarea,
  useToast,
} from "@/components/ui";
import {
  AdminPageHeader,
  AdminSectionCard,
  AdminStatusPill,
} from "@/components/admin/layout/AdminUi";
import { formatAdminDateTime } from "@/components/admin/shared/admin-format";
import {
  buildGuidePreviewPath,
  formatGuideStatusLabel,
  GUIDE_CLUSTER_OPTIONS,
  guideStatusTone,
  isGuideAdminRole,
  slugifyGuideTitle,
} from "./guide-admin-shared";

type LocaleKey = "en" | "nl";
type FormTab = "content" | "seo" | "settings" | "activity";
type SectionType = "prose" | "steps" | "cards" | "table";
type AuditEntry = Doc<"guideAuditLog">;

type BilingualText = { en: string; nl: string };
type GuideSectionForm = {
  title: BilingualText;
  type: SectionType;
  items: BilingualText[];
  tableHeaders: BilingualText[];
  tableRows: BilingualText[][];
};
type GuideFaqForm = { q: BilingualText; a: BilingualText };

const FORM_TABS: { value: FormTab; label: string }[] = [
  { value: "content", label: "Content" },
  { value: "seo", label: "SEO" },
  { value: "settings", label: "Settings" },
  { value: "activity", label: "Activity" },
];

function emptyText(): BilingualText {
  return { en: "", nl: "" };
}

function emptySection(): GuideSectionForm {
  return {
    title: emptyText(),
    type: "prose",
    items: [emptyText()],
    tableHeaders: [],
    tableRows: [],
  };
}

function emptyFaq(): GuideFaqForm {
  return { q: emptyText(), a: emptyText() };
}

function updateLocalizedValue(
  value: BilingualText,
  locale: LocaleKey,
  next: string
): BilingualText {
  return { ...value, [locale]: next };
}

function checklistStatus(valid: boolean) {
  return valid
    ? { tone: "success" as const, label: "Pass" }
    : { tone: "warning" as const, label: "Warn" };
}

function checklistInfo(label = "Info") {
  return { tone: "info" as const, label };
}

function mergeText(en?: string | null, nl?: string | null) {
  return {
    en: en ?? "",
    nl: nl ?? "",
  };
}

function formatChecklistCount(value: string) {
  return `${value.trim().length} characters`;
}

function formatAuditAction(action: string) {
  switch (action) {
    case "create":
      return "created this guide";
    case "update":
      return "updated this guide";
    case "publish":
      return "published this guide";
    case "unpublish":
      return "unpublished this guide";
    case "submit_for_review":
      return "submitted this guide for review";
    case "request_changes":
      return "requested changes";
    case "slug_change":
      return "changed the guide slug";
    case "redirect_create":
      return "created a redirect";
    case "redirect_delete":
      return "deleted a redirect";
    default:
      return action.replaceAll("_", " ");
  }
}

function formatAuditValue(value: unknown) {
  if (value === undefined || value === null || value === "") {
    return "empty";
  }

  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  return JSON.stringify(value);
}

function summarizeAuditEntry(entry: AuditEntry) {
  if (entry.fieldChanges.length > 0) {
    return entry.fieldChanges.slice(0, 3).map((change) => ({
      field: change.field,
      oldValue: formatAuditValue(change.oldValue),
      newValue: formatAuditValue(change.newValue),
    }));
  }

  return [];
}

function mergeSections(
  enSections: NonNullable<Doc<"guidePages">["body"]>["en"] = [],
  nlSections: NonNullable<Doc<"guidePages">["body"]>["nl"] = []
): GuideSectionForm[] {
  const total = Math.max(enSections.length, nlSections.length, 1);
  return Array.from({ length: total }, (_, sectionIndex) => {
    const enSection = enSections[sectionIndex];
    const nlSection = nlSections[sectionIndex];
    const type = (enSection?.type ?? nlSection?.type ?? "prose") as SectionType;
    const enItems = enSection?.items ?? [];
    const nlItems = nlSection?.items ?? [];
    const maxItems = Math.max(enItems.length, nlItems.length, 1);
    const enHeaders = enSection?.tableHeaders ?? [];
    const nlHeaders = nlSection?.tableHeaders ?? [];
    const maxHeaders = Math.max(enHeaders.length, nlHeaders.length);
    const enRows = enSection?.tableRows ?? [];
    const nlRows = nlSection?.tableRows ?? [];
    const maxRows = Math.max(enRows.length, nlRows.length);

    return {
      title: mergeText(enSection?.title, nlSection?.title),
      type,
      items: Array.from({ length: maxItems }, (_, itemIndex) =>
        mergeText(enItems[itemIndex], nlItems[itemIndex])
      ),
      tableHeaders: Array.from({ length: maxHeaders }, (_, headerIndex) =>
        mergeText(enHeaders[headerIndex], nlHeaders[headerIndex])
      ),
      tableRows: Array.from({ length: maxRows }, (_, rowIndex) => {
        const enRow = enRows[rowIndex] ?? [];
        const nlRow = nlRows[rowIndex] ?? [];
        const maxCells = Math.max(enRow.length, nlRow.length, 1);
        return Array.from({ length: maxCells }, (_, cellIndex) =>
          mergeText(enRow[cellIndex], nlRow[cellIndex])
        );
      }),
    };
  });
}

function mergeFaqs(
  enFaqs: NonNullable<Doc<"guidePages">["faqs"]>["en"] = [],
  nlFaqs: NonNullable<Doc<"guidePages">["faqs"]>["nl"] = []
): GuideFaqForm[] {
  const total = Math.max(enFaqs.length, nlFaqs.length, 1);
  return Array.from({ length: total }, (_, index) => ({
    q: mergeText(enFaqs[index]?.q, nlFaqs[index]?.q),
    a: mergeText(enFaqs[index]?.a, nlFaqs[index]?.a),
  }));
}

function buildInitialState(guide: Doc<"guidePages">) {
  return {
    slug: guide.slug ?? "",
    cluster: guide.cluster ?? "pain-discomfort",
    primaryCtaTarget: guide.primaryCtaTarget ?? "/login?from=guide",
    featuredImageUrl: guide.featuredImageUrl ?? "",
    ogImageUrl: guide.ogImageUrl ?? "",
    canonicalUrl: guide.canonicalUrl ?? "",
    tags: guide.tags?.join(", ") ?? "",
    relatedGuides: guide.relatedGuides?.join(", ") ?? "",
    relatedGuidePaths: guide.relatedGuidePaths?.join(", ") ?? "",
    relatedKeywords: guide.relatedKeywords?.join(", ") ?? "",
    robotsIndex: guide.robotsIndex ?? true,
    tableOfContents: guide.tableOfContents ?? false,
    heroImageFileName: guide.heroImageFileName ?? "",
    heroImagePublicPath: guide.heroImagePublicPath ?? "",
    pageTitle: mergeText(guide.pageTitle?.en, guide.pageTitle?.nl),
    h1: mergeText(guide.h1?.en, guide.h1?.nl),
    pageBrief: mergeText(guide.pageBrief?.en, guide.pageBrief?.nl),
    body: {
      en: mergeSections(guide.body?.en ?? [], guide.body?.nl ?? []),
      nl: mergeSections(guide.body?.en ?? [], guide.body?.nl ?? []),
    },
    faqs: {
      en: mergeFaqs(guide.faqs?.en ?? [], guide.faqs?.nl ?? []),
      nl: mergeFaqs(guide.faqs?.en ?? [], guide.faqs?.nl ?? []),
    },
    metaTitle: mergeText(guide.metaTitle?.en, guide.metaTitle?.nl),
    metaDescription: mergeText(guide.metaDescription?.en, guide.metaDescription?.nl),
    ogTitle: mergeText(guide.ogTitle?.en, guide.ogTitle?.nl),
    ogDescription: mergeText(guide.ogDescription?.en, guide.ogDescription?.nl),
    primaryCtaLabel: mergeText(
      guide.primaryCtaLabel?.en ?? "Start Free Fit",
      guide.primaryCtaLabel?.nl ?? "Start gratis fit"
    ),
    featuredImageAlt: mergeText(guide.featuredImageAlt?.en, guide.featuredImageAlt?.nl),
    ogImageAlt: mergeText(guide.ogImageAlt?.en, guide.ogImageAlt?.nl),
    libraryBody: mergeText(guide.libraryBody?.en, guide.libraryBody?.nl),
  };
}

type EditState = ReturnType<typeof buildInitialState>;

type ConfirmAction =
  | { kind: "save-slug-change"; oldSlug: string; newSlug: string }
  | { kind: "publish" }
  | { kind: "unpublish" }
  | null;

export function GuideEditView({
  guide,
  sessionRole,
}: {
  guide: Doc<"guidePages">;
  sessionRole: string;
}) {
  const router = useRouter();
  const toast = useToast();
  const updateGuide = useMutation(api.guides.mutations.updateGuide);
  const changeSlug = useMutation(api.guides.mutations.changeSlug);
  const publishGuide = useMutation(api.guides.mutations.publishGuide);
  const unpublishGuide = useMutation(api.guides.mutations.unpublishGuide);
  const submitGuideForReview = useMutation(api.guides.mutations.submitGuideForReview);
  const requestGuideChanges = useMutation(api.guides.mutations.requestGuideChanges);
  const [formTab, setFormTab] = useState<FormTab>("content");
  const [localeTab, setLocaleTab] = useState<LocaleKey>("en");
  const [state, setState] = useState<EditState>(() => buildInitialState(guide));
  const [isSaving, setIsSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);

  const isPublishAdmin = isGuideAdminRole(sessionRole);
  const activityLog = useQuery(
    api.guides.queries.getGuideAuditLog,
    isPublishAdmin ? { guideId: guide._id } : "skip"
  );
  const normalizedSlug = useMemo(() => slugifyGuideTitle(state.slug), [state.slug]);
  const slugLookup = useQuery(
    api.guides.queries.getGuideBySlug,
    normalizedSlug && normalizedSlug !== guide.slug ? { slug: normalizedSlug } : "skip"
  );

  const previewPath = buildGuidePreviewPath(normalizedSlug);
  const lastSavedAt = guide.lastUpdatedAt ?? guide.updatedAt;
  const slugReadOnly = guide.status === "published" && !isPublishAdmin;
  const previewDisabled = dirty;
  const previewReason = dirty
    ? "Save first to preview"
    : "Open the draft preview in a new tab";
  const slugError =
    !normalizedSlug
      ? "Slug is required."
      : slugLookup
        ? "This slug already exists."
        : undefined;

  const hasFeaturedImage = Boolean(
    state.featuredImageUrl.trim() || state.heroImagePublicPath.trim()
  );
  const hasFaqs = state.faqs.en.some((faq) => faq.q.en.trim() || faq.a.en.trim())
    || state.faqs.nl.some((faq) => faq.q.nl.trim() || faq.a.nl.trim());
  const formTabs = isPublishAdmin
    ? FORM_TABS
    : FORM_TABS.filter((tab) => tab.value !== "activity");

  const seoChecklist = [
    {
      title: "H1 (EN)",
      detail: state.h1.en.trim() ? "Ready for publishing." : "Required before publishing.",
      ...checklistStatus(Boolean(state.h1.en.trim())),
    },
    {
      title: "H1 (NL)",
      detail: state.h1.nl.trim() ? "Ready for publishing." : "Required before publishing.",
      ...checklistStatus(Boolean(state.h1.nl.trim())),
    },
    {
      title: "Meta title (EN)",
      detail: `${formatChecklistCount(state.metaTitle.en)}. Keep this at 60 characters or fewer.`,
      ...checklistStatus(
        Boolean(state.metaTitle.en.trim()) && state.metaTitle.en.trim().length <= 60
      ),
    },
    {
      title: "Meta title (NL)",
      detail: `${formatChecklistCount(state.metaTitle.nl)}. Keep this at 60 characters or fewer.`,
      ...checklistStatus(
        Boolean(state.metaTitle.nl.trim()) && state.metaTitle.nl.trim().length <= 60
      ),
    },
    {
      title: "Meta description (EN)",
      detail: `${formatChecklistCount(state.metaDescription.en)}. Target 50-160 characters.`,
      ...checklistStatus(
        state.metaDescription.en.trim().length >= 50 &&
          state.metaDescription.en.trim().length <= 160
      ),
    },
    {
      title: "Meta description (NL)",
      detail: `${formatChecklistCount(state.metaDescription.nl)}. Target 50-160 characters.`,
      ...checklistStatus(
        state.metaDescription.nl.trim().length >= 50 &&
          state.metaDescription.nl.trim().length <= 160
      ),
    },
    {
      title: "Slug is available",
      detail: normalizedSlug ? previewPath : "Choose a slug.",
      ...checklistStatus(Boolean(normalizedSlug) && !slugLookup),
    },
    {
      title: "Featured image alt text is set when needed",
      detail: hasFeaturedImage
        ? "Add EN and NL alt text for the image."
        : "No featured image set.",
      ...checklistStatus(
        !hasFeaturedImage ||
          Boolean(state.featuredImageAlt.en.trim() && state.featuredImageAlt.nl.trim())
      ),
    },
    {
      title: "Robots index",
      detail: state.robotsIndex
        ? "Search engines can index this page."
        : "Noindex is intentional and will be rendered in metadata.",
      ...(state.robotsIndex ? checklistStatus(true) : checklistInfo()),
    },
    {
      title: "FAQs",
      detail: hasFaqs
        ? "FAQ schema can be generated for this guide."
        : "Add at least one FAQ item if you want FAQ schema.",
      ...(hasFaqs ? checklistStatus(true) : checklistInfo("Nudge")),
    },
  ];

  const updateState = (updater: (current: EditState) => EditState) => {
    setState((current) => updater(current));
    setDirty(true);
  };

  const validateRequiredFields = () => {
    if (!normalizedSlug) {
      return "Set a unique slug before saving.";
    }
    if (slugLookup) {
      return "Choose a different slug. This one already exists.";
    }
    if (!state.pageTitle.en.trim() || !state.pageTitle.nl.trim()) {
      return "Page title is required in English and Dutch.";
    }
    if (!state.metaTitle.en.trim() || !state.metaTitle.nl.trim()) {
      return "Meta title is required in English and Dutch.";
    }
    if (!state.metaDescription.en.trim() || !state.metaDescription.nl.trim()) {
      return "Meta description is required in English and Dutch.";
    }

    return null;
  };

  const buildMutationPayload = () => ({
    slug: normalizedSlug,
    cluster: state.cluster,
    pageTitle: state.pageTitle,
    h1: state.h1,
    metaTitle: state.metaTitle,
    metaDescription: state.metaDescription,
    pageBrief: state.pageBrief,
    body: {
      en: state.body.en.map((section) => ({
        title: section.title.en,
        type: section.type,
        items: section.items.map((item) => item.en).filter(Boolean),
        tableHeaders:
          section.type === "table"
            ? section.tableHeaders.map((header) => header.en).filter(Boolean)
            : undefined,
        tableRows:
          section.type === "table"
            ? section.tableRows
                .map((row) => row.map((cell) => cell.en))
                .filter((row) => row.some((cell) => cell.trim().length > 0))
            : undefined,
      })),
      nl: state.body.nl.map((section) => ({
        title: section.title.nl,
        type: section.type,
        items: section.items.map((item) => item.nl).filter(Boolean),
        tableHeaders:
          section.type === "table"
            ? section.tableHeaders.map((header) => header.nl).filter(Boolean)
            : undefined,
        tableRows:
          section.type === "table"
            ? section.tableRows
                .map((row) => row.map((cell) => cell.nl))
                .filter((row) => row.some((cell) => cell.trim().length > 0))
            : undefined,
      })),
    },
    faqs: {
      en: state.faqs.en
        .filter((faq) => faq.q.en.trim() || faq.a.en.trim())
        .map((faq) => ({ q: faq.q.en, a: faq.a.en })),
      nl: state.faqs.nl
        .filter((faq) => faq.q.nl.trim() || faq.a.nl.trim())
        .map((faq) => ({ q: faq.q.nl, a: faq.a.nl })),
    },
    libraryBody:
      state.libraryBody.en.trim() || state.libraryBody.nl.trim()
        ? state.libraryBody
        : undefined,
    heroImageFileName: state.heroImageFileName.trim() || undefined,
    heroImagePublicPath: state.heroImagePublicPath.trim() || undefined,
    relatedGuidePaths: state.relatedGuidePaths
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean),
    relatedKeywords: state.relatedKeywords
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean),
    featuredImageUrl: state.featuredImageUrl.trim() || undefined,
    featuredImageAlt:
      state.featuredImageAlt.en.trim() || state.featuredImageAlt.nl.trim()
        ? state.featuredImageAlt
        : undefined,
    canonicalUrl: state.canonicalUrl.trim() || undefined,
    ogTitle:
      state.ogTitle.en.trim() || state.ogTitle.nl.trim()
        ? state.ogTitle
        : undefined,
    ogDescription:
      state.ogDescription.en.trim() || state.ogDescription.nl.trim()
        ? state.ogDescription
        : undefined,
    ogImageUrl: state.ogImageUrl.trim() || undefined,
    ogImageAlt:
      state.ogImageAlt.en.trim() || state.ogImageAlt.nl.trim()
        ? state.ogImageAlt
        : undefined,
    robotsIndex: state.robotsIndex,
    tags: state.tags
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean),
    relatedGuides: state.relatedGuides
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean),
    primaryCtaTarget: state.primaryCtaTarget.trim() || undefined,
    primaryCtaLabel:
      state.primaryCtaLabel.en.trim() || state.primaryCtaLabel.nl.trim()
        ? state.primaryCtaLabel
        : undefined,
    tableOfContents: state.tableOfContents,
  });

  const saveGuide = async (allowSlugChangeConfirm = false) => {
    setError(null);
    const validationError = validateRequiredFields();
    if (validationError) {
      setError(validationError);
      return false;
    }

    setIsSaving(true);
    try {
      const payload = buildMutationPayload();
      const slugChanged = payload.slug !== guide.slug;

      if (guide.status === "published" && slugChanged && !allowSlugChangeConfirm) {
        setConfirmAction({
          kind: "save-slug-change",
          oldSlug: guide.path ?? `/guides/${guide.slug}`,
          newSlug: `/guides/${payload.slug}`,
        });
        return false;
      }

      await updateGuide({
        id: guide._id,
        ...(guide.status === "published" && slugChanged
          ? {
              cluster: payload.cluster,
              pageTitle: payload.pageTitle,
              h1: payload.h1,
              metaTitle: payload.metaTitle,
              metaDescription: payload.metaDescription,
              pageBrief: payload.pageBrief,
              body: payload.body,
              faqs: payload.faqs,
              libraryBody: payload.libraryBody,
              heroImageFileName: payload.heroImageFileName,
              heroImagePublicPath: payload.heroImagePublicPath,
              relatedGuidePaths: payload.relatedGuidePaths,
              relatedKeywords: payload.relatedKeywords,
              featuredImageUrl: payload.featuredImageUrl,
              featuredImageAlt: payload.featuredImageAlt,
              canonicalUrl: payload.canonicalUrl,
              ogTitle: payload.ogTitle,
              ogDescription: payload.ogDescription,
              ogImageUrl: payload.ogImageUrl,
              ogImageAlt: payload.ogImageAlt,
              robotsIndex: payload.robotsIndex,
              tags: payload.tags,
              relatedGuides: payload.relatedGuides,
              primaryCtaTarget: payload.primaryCtaTarget,
              primaryCtaLabel: payload.primaryCtaLabel,
              tableOfContents: payload.tableOfContents,
            }
          : payload),
      });

      if (guide.status === "published" && slugChanged) {
        await changeSlug({ id: guide._id, slug: payload.slug });
      }

      toast.success({ description: "Guide saved." });
      setDirty(false);
      router.refresh();
      return true;
    } catch (mutationError) {
      console.error("Failed to save guide:", mutationError);
      setError(
        mutationError instanceof Error
          ? mutationError.message
          : "Could not save the guide."
      );
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async () => {
    setError(null);
    if (!state.h1.en.trim() || !state.h1.nl.trim()) {
      setError("Fill the H1 in English and Dutch before publishing.");
      return;
    }

    setConfirmAction({ kind: "publish" });
  };

  const handleUnpublish = async () => {
    setConfirmAction({ kind: "unpublish" });
  };

  const handleSubmitForReview = async () => {
    setError(null);
    setIsSaving(true);
    try {
      await submitGuideForReview({ id: guide._id });
      toast.success({ description: "Guide submitted for review." });
      router.refresh();
    } catch (mutationError) {
      console.error("Failed to submit guide for review:", mutationError);
      setError(
        mutationError instanceof Error
          ? mutationError.message
          : "Could not submit the guide for review."
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleRequestChanges = async () => {
    setError(null);
    setIsSaving(true);
    try {
      await requestGuideChanges({ id: guide._id });
      toast.success({ description: "Changes requested." });
      router.refresh();
    } catch (mutationError) {
      console.error("Failed to request guide changes:", mutationError);
      setError(
        mutationError instanceof Error
          ? mutationError.message
          : "Could not request changes."
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handlePreview = () => {
    if (previewDisabled) {
      return;
    }

    void (async () => {
      try {
        const response = await fetch("/api/preview", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: String(guide._id),
            locale: localeTab,
          }),
        });

        if (!response.ok) {
          throw new Error("preview_request_failed");
        }

        const data = (await response.json()) as { redirectTo?: string };
        if (!data.redirectTo) {
          throw new Error("preview_redirect_missing");
        }

        window.open(data.redirectTo, "_blank", "noopener,noreferrer");
      } catch (previewError) {
        console.error("Failed to open preview:", previewError);
        setError("Could not open preview.");
      }
    })();
  };

  const handleDialogConfirm = async () => {
    if (!confirmAction) {
      return;
    }

    const nextAction = confirmAction;
    setConfirmAction(null);

    if (nextAction.kind === "save-slug-change") {
      await saveGuide(true);
      return;
    }

    if (nextAction.kind === "publish") {
      setIsSaving(true);
      try {
        await publishGuide({ id: guide._id });
        toast.success({ description: "Guide published." });
        router.refresh();
      } catch (mutationError) {
        console.error("Failed to publish guide:", mutationError);
        setError(
          mutationError instanceof Error
            ? mutationError.message
            : "Could not publish the guide."
        );
      } finally {
        setIsSaving(false);
      }
      return;
    }

    if (nextAction.kind === "unpublish") {
      setIsSaving(true);
      try {
        await unpublishGuide({ id: guide._id });
        toast.success({ description: "Guide unpublished." });
        router.refresh();
      } catch (mutationError) {
        console.error("Failed to unpublish guide:", mutationError);
        setError(
          mutationError instanceof Error
            ? mutationError.message
            : "Could not unpublish the guide."
        );
      } finally {
        setIsSaving(false);
      }
    }
  };

  const saveButtonLabel =
    guide.status === "published" && normalizedSlug !== guide.slug
      ? "Save and confirm slug change"
      : "Save changes";

  const publishButtonVisible = isPublishAdmin && guide.status !== "published";
  const unpublishButtonVisible = isPublishAdmin && guide.status === "published";
  const requestChangesVisible = isPublishAdmin && guide.status === "in_review";
  const submitForReviewVisible = guide.status === "draft";

  return (
    <div className="space-y-8">
      <AccessibleDialog
        open={confirmAction !== null}
        title={
          confirmAction?.kind === "publish"
            ? "Publish guide"
            : confirmAction?.kind === "unpublish"
              ? "Unpublish guide"
              : "Confirm slug change"
        }
        description={
          confirmAction?.kind === "publish"
            ? "Publish this guide? It will be visible on the public site immediately."
            : confirmAction?.kind === "unpublish"
              ? "Unpublish this guide? It will be removed from the public site."
              : confirmAction?.kind === "save-slug-change"
                ? `This guide is published. Changing the slug will create a 301 redirect from ${confirmAction.oldSlug} to ${confirmAction.newSlug}. Confirm?`
                : undefined
        }
        onClose={() => setConfirmAction(null)}
      >
        <div className="flex flex-wrap justify-end gap-3">
          <Button variant="ghost" type="button" onClick={() => setConfirmAction(null)}>
            Cancel
          </Button>
          <Button type="button" onClick={handleDialogConfirm} isLoading={isSaving}>
            Confirm
          </Button>
        </div>
      </AccessibleDialog>

      <AdminPageHeader
        eyebrow="Product / Guides"
        title={`Edit guide: ${guide.pageTitle?.en ?? guide.slug}`}
        description="Update bilingual content, SEO fields, publishing status, and redirect-aware slugs."
        actions={
          <>
            <AdminStatusPill tone={guideStatusTone(guide.status)}>
              {formatGuideStatusLabel(guide.status)}
            </AdminStatusPill>
            <Button
              variant="outline"
              onClick={handlePreview}
              disabled={previewDisabled}
              title={previewReason}
            >
              Preview
            </Button>
            <Button variant="outline" render={<Link href="/admin/guides" />}>
              Back to guides
            </Button>
          </>
        }
      />

      <AdminSectionCard
        title="Workflow"
        description="Save first, preview the draft in a new tab, then use the publish controls when the content is ready."
      >
        <div className="flex flex-wrap items-center gap-3 text-sm text-[color:var(--muted-foreground)]">
          <AdminStatusPill tone="neutral">Role: {sessionRole}</AdminStatusPill>
          <span>Last saved: {formatAdminDateTime(lastSavedAt)}</span>
          {guide.publishedAt ? <span>Published: {formatAdminDateTime(guide.publishedAt)}</span> : null}
        </div>
      </AdminSectionCard>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(22rem,0.8fr)]">
        <div className="space-y-6">
          <AdminSectionCard title="Form sections" description="Switch between content, SEO, and settings without leaving the record.">
            <SegmentedControl
              aria-label="Guide form sections"
              value={formTab}
              onValueChange={(value) => setFormTab(value as FormTab)}
              size="sm"
            >
              {formTabs.map((tab) => (
                <SegmentedControlItem key={tab.value} value={tab.value}>
                  {tab.label}
                </SegmentedControlItem>
              ))}
            </SegmentedControl>
          </AdminSectionCard>

          {formTab === "content" ? (
            <>
              <AdminSectionCard title="Locale" description="Edit English and Dutch content side by side through one form state.">
                <SegmentedControl
                  aria-label="Guide content locale"
                  value={localeTab}
                  onValueChange={(value) => setLocaleTab(value as LocaleKey)}
                  size="sm"
                >
                  <SegmentedControlItem value="en">English</SegmentedControlItem>
                  <SegmentedControlItem value="nl">Dutch</SegmentedControlItem>
                </SegmentedControl>
              </AdminSectionCard>

              <AdminSectionCard title="Core content" description={`Editing ${localeTab === "en" ? "English" : "Dutch"} fields.`}>
                <div className="grid gap-4">
                  <Select
                    label="Cluster"
                    value={state.cluster}
                    onChange={(event) =>
                      updateState((current) => ({ ...current, cluster: event.currentTarget.value }))
                    }
                    options={GUIDE_CLUSTER_OPTIONS.map((option) => ({
                      value: option.value,
                      label: option.label,
                    }))}
                  />
                  <Input
                    label="Internal title"
                    value={state.pageTitle[localeTab]}
                    onChange={(event) =>
                      updateState((current) => ({
                        ...current,
                        pageTitle: updateLocalizedValue(
                          current.pageTitle,
                          localeTab,
                          event.currentTarget.value
                        ),
                      }))
                    }
                  />
                  <Input
                    label="H1"
                    value={state.h1[localeTab]}
                    onChange={(event) =>
                      updateState((current) => ({
                        ...current,
                        h1: updateLocalizedValue(current.h1, localeTab, event.currentTarget.value),
                      }))
                    }
                    placeholder="Public page heading"
                  />
                  <Textarea
                    label="Page brief"
                    value={state.pageBrief[localeTab]}
                    onChange={(event) =>
                      updateState((current) => ({
                        ...current,
                        pageBrief: updateLocalizedValue(
                          current.pageBrief,
                          localeTab,
                          event.currentTarget.value
                        ),
                      }))
                    }
                    rows={3}
                    helperText="Used in cards, listings, and hub summaries."
                  />
                  <Textarea
                    label="Primary CTA label"
                    value={state.primaryCtaLabel[localeTab]}
                    onChange={(event) =>
                      updateState((current) => ({
                        ...current,
                        primaryCtaLabel: updateLocalizedValue(
                          current.primaryCtaLabel,
                          localeTab,
                          event.currentTarget.value
                        ),
                      }))
                    }
                    rows={2}
                  />
                </div>
              </AdminSectionCard>

              <AdminSectionCard title="Body sections" description="Practical v1 editor for H2 sections, list items, and simple tables.">
                <div className="space-y-4">
                  {state.body[localeTab].map((section, sectionIndex) => (
                    <div
                      key={`section-${sectionIndex}`}
                      className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--secondary)] p-4"
                    >
                      <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_12rem_auto]">
                        <Input
                          label={`Section title (${localeTab === "en" ? "English" : "Dutch"})`}
                          value={section.title[localeTab]}
                          onChange={(event) =>
                            updateState((current) => {
                              const nextBody = [...current.body[localeTab]];
                              nextBody[sectionIndex] = {
                                ...section,
                                title: updateLocalizedValue(
                                  section.title,
                                  localeTab,
                                  event.currentTarget.value
                                ),
                              };
                              return {
                                ...current,
                                body: {
                                  ...current.body,
                                  [localeTab]: nextBody,
                                },
                              };
                            })
                          }
                        />
                        <Select
                          label="Section type"
                          value={section.type}
                          onChange={(event) =>
                            updateState((current) => {
                              const nextBody = [...current.body[localeTab]];
                              nextBody[sectionIndex] = {
                                ...section,
                                type: event.currentTarget.value as SectionType,
                              };
                              return {
                                ...current,
                                body: {
                                  ...current.body,
                                  [localeTab]: nextBody,
                                },
                              };
                            })
                          }
                          options={[
                            { value: "prose", label: "Prose" },
                            { value: "steps", label: "Steps" },
                            { value: "cards", label: "Cards" },
                            { value: "table", label: "Table" },
                          ]}
                        />
                        <div className="flex items-end">
                          <Button
                            type="button"
                            variant="ghost"
                            onClick={() =>
                              updateState((current) => ({
                                ...current,
                                body: {
                                  ...current.body,
                                  [localeTab]: current.body[localeTab].filter(
                                    (_, index) => index !== sectionIndex
                                  ),
                                },
                              }))
                            }
                            disabled={state.body[localeTab].length === 1}
                          >
                            Remove section
                          </Button>
                        </div>
                      </div>

                      <div className="mt-4 space-y-3">
                        {section.items.map((item, itemIndex) => (
                          <Textarea
                            key={`section-${sectionIndex}-item-${itemIndex}`}
                            label={`Item ${itemIndex + 1} (${localeTab === "en" ? "English" : "Dutch"})`}
                            value={item[localeTab]}
                            onChange={(event) =>
                              updateState((current) => {
                                const nextBody = [...current.body[localeTab]];
                                const nextItems = [...section.items];
                                nextItems[itemIndex] = updateLocalizedValue(
                                  item,
                                  localeTab,
                                  event.currentTarget.value
                                );
                                nextBody[sectionIndex] = { ...section, items: nextItems };
                                return {
                                  ...current,
                                  body: {
                                    ...current.body,
                                    [localeTab]: nextBody,
                                  },
                                };
                              })
                            }
                            rows={3}
                          />
                        ))}
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() =>
                            updateState((current) => {
                              const nextBody = [...current.body[localeTab]];
                              nextBody[sectionIndex] = {
                                ...section,
                                items: [...section.items, emptyText()],
                              };
                              return {
                                ...current,
                                body: {
                                  ...current.body,
                                  [localeTab]: nextBody,
                                },
                              };
                            })
                          }
                        >
                          Add body item
                        </Button>
                      </div>

                      {section.type === "table" ? (
                        <div className="mt-4 grid gap-4">
                          <Textarea
                            label={`Table headers (${localeTab === "en" ? "English" : "Dutch"})`}
                            value={section.tableHeaders.map((header) => header[localeTab]).join("\n")}
                            onChange={(event) => {
                              const headers = event.currentTarget.value
                                .split("\n")
                                .map((value) => value.trim())
                                .filter(Boolean);
                              updateState((current) => {
                                const nextBody = [...current.body[localeTab]];
                                nextBody[sectionIndex] = {
                                  ...section,
                                  tableHeaders: headers.map((header, headerIndex) =>
                                    updateLocalizedValue(
                                      section.tableHeaders[headerIndex] ?? emptyText(),
                                      localeTab,
                                      header
                                    )
                                  ),
                                };
                                return {
                                  ...current,
                                  body: {
                                    ...current.body,
                                    [localeTab]: nextBody,
                                  },
                                };
                              });
                            }}
                            rows={3}
                            helperText="One header per line."
                          />
                          <Textarea
                            label={`Table rows (${localeTab === "en" ? "English" : "Dutch"})`}
                            value={section.tableRows
                              .map((row) => row.map((cell) => cell[localeTab]).join(" | "))
                              .join("\n")}
                            onChange={(event) => {
                              const rows = event.currentTarget.value
                                .split("\n")
                                .map((line) => line.split("|").map((cell) => cell.trim()).filter(Boolean))
                                .filter((row) => row.length > 0);
                              updateState((current) => {
                                const nextBody = [...current.body[localeTab]];
                                nextBody[sectionIndex] = {
                                  ...section,
                                  tableRows: rows.map((row, rowIndex) =>
                                    row.map((cell, cellIndex) =>
                                      updateLocalizedValue(
                                        section.tableRows[rowIndex]?.[cellIndex] ?? emptyText(),
                                        localeTab,
                                        cell
                                      )
                                    )
                                  ),
                                };
                                return {
                                  ...current,
                                  body: {
                                    ...current.body,
                                    [localeTab]: nextBody,
                                  },
                                };
                              });
                            }}
                            rows={4}
                            helperText="Use one row per line and separate columns with |."
                          />
                        </div>
                      ) : null}
                    </div>
                  ))}

                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() =>
                      updateState((current) => ({
                        ...current,
                        body: {
                          ...current.body,
                          [localeTab]: [...current.body[localeTab], emptySection()],
                        },
                      }))
                    }
                  >
                    Add section
                  </Button>
                </div>
              </AdminSectionCard>

              <AdminSectionCard title="FAQs" description="Add practical Q&A pairs for the accordion and FAQ schema.">
                <div className="space-y-4">
                  {state.faqs[localeTab].map((faq, faqIndex) => (
                    <div
                      key={`faq-${faqIndex}`}
                      className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--secondary)] p-4"
                    >
                      <div className="grid gap-3">
                        <Input
                          label={`Question ${faqIndex + 1} (${localeTab === "en" ? "English" : "Dutch"})`}
                          value={faq.q[localeTab]}
                          onChange={(event) =>
                            updateState((current) => {
                              const nextFaqs = [...current.faqs[localeTab]];
                              nextFaqs[faqIndex] = {
                                ...faq,
                                q: updateLocalizedValue(
                                  faq.q,
                                  localeTab,
                                  event.currentTarget.value
                                ),
                              };
                              return {
                                ...current,
                                faqs: {
                                  ...current.faqs,
                                  [localeTab]: nextFaqs,
                                },
                              };
                            })
                          }
                        />
                        <Textarea
                          label={`Answer ${faqIndex + 1} (${localeTab === "en" ? "English" : "Dutch"})`}
                          value={faq.a[localeTab]}
                          onChange={(event) =>
                            updateState((current) => {
                              const nextFaqs = [...current.faqs[localeTab]];
                              nextFaqs[faqIndex] = {
                                ...faq,
                                a: updateLocalizedValue(
                                  faq.a,
                                  localeTab,
                                  event.currentTarget.value
                                ),
                              };
                              return {
                                ...current,
                                faqs: {
                                  ...current.faqs,
                                  [localeTab]: nextFaqs,
                                },
                              };
                            })
                          }
                          rows={4}
                        />
                        <div>
                          <Button
                            type="button"
                            variant="ghost"
                            onClick={() =>
                              updateState((current) => ({
                                ...current,
                                faqs: {
                                  ...current.faqs,
                                  [localeTab]: current.faqs[localeTab].filter(
                                    (_, index) => index !== faqIndex
                                  ),
                                },
                              }))
                            }
                            disabled={state.faqs[localeTab].length === 1}
                          >
                            Remove FAQ
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() =>
                      updateState((current) => ({
                        ...current,
                        faqs: {
                          ...current.faqs,
                          [localeTab]: [...current.faqs[localeTab], emptyFaq()],
                        },
                      }))
                    }
                  >
                    Add FAQ
                  </Button>
                </div>
              </AdminSectionCard>
            </>
          ) : null}

          {formTab === "seo" ? (
            <AdminSectionCard title="SEO fields" description={`Editing ${localeTab === "en" ? "English" : "Dutch"} SEO metadata.`}>
              <div className="space-y-4">
                <SegmentedControl
                  aria-label="Guide SEO locale"
                  value={localeTab}
                  onValueChange={(value) => setLocaleTab(value as LocaleKey)}
                  size="sm"
                >
                  <SegmentedControlItem value="en">English</SegmentedControlItem>
                  <SegmentedControlItem value="nl">Dutch</SegmentedControlItem>
                </SegmentedControl>
                <Input
                  label="Meta title"
                  value={state.metaTitle[localeTab]}
                  onChange={(event) =>
                    updateState((current) => ({
                      ...current,
                      metaTitle: updateLocalizedValue(
                        current.metaTitle,
                        localeTab,
                        event.currentTarget.value
                      ),
                    }))
                  }
                />
                <Textarea
                  label="Meta description"
                  value={state.metaDescription[localeTab]}
                  onChange={(event) =>
                    updateState((current) => ({
                      ...current,
                      metaDescription: updateLocalizedValue(
                        current.metaDescription,
                        localeTab,
                        event.currentTarget.value
                      ),
                    }))
                  }
                  rows={3}
                  helperText="Target 50–160 characters."
                />
                <Input
                  label="Open Graph title"
                  value={state.ogTitle[localeTab]}
                  onChange={(event) =>
                    updateState((current) => ({
                      ...current,
                      ogTitle: updateLocalizedValue(
                        current.ogTitle,
                        localeTab,
                        event.currentTarget.value
                      ),
                    }))
                  }
                  helperText="Leave empty to fall back to the meta title."
                />
                <Textarea
                  label="Open Graph description"
                  value={state.ogDescription[localeTab]}
                  onChange={(event) =>
                    updateState((current) => ({
                      ...current,
                      ogDescription: updateLocalizedValue(
                        current.ogDescription,
                        localeTab,
                        event.currentTarget.value
                      ),
                    }))
                  }
                  rows={3}
                />
                <Input
                  label="Featured image URL"
                  value={state.featuredImageUrl}
                  onChange={(event) =>
                    updateState((current) => ({ ...current, featuredImageUrl: event.currentTarget.value }))
                  }
                />
                <Input
                  label={`Featured image alt (${localeTab === "en" ? "English" : "Dutch"})`}
                  value={state.featuredImageAlt[localeTab]}
                  onChange={(event) =>
                    updateState((current) => ({
                      ...current,
                      featuredImageAlt: updateLocalizedValue(
                        current.featuredImageAlt,
                        localeTab,
                        event.currentTarget.value
                      ),
                    }))
                  }
                />
                <Input
                  label="Open Graph image URL"
                  value={state.ogImageUrl}
                  onChange={(event) =>
                    updateState((current) => ({ ...current, ogImageUrl: event.currentTarget.value }))
                  }
                />
                <Input
                  label={`Open Graph image alt (${localeTab === "en" ? "English" : "Dutch"})`}
                  value={state.ogImageAlt[localeTab]}
                  onChange={(event) =>
                    updateState((current) => ({
                      ...current,
                      ogImageAlt: updateLocalizedValue(
                        current.ogImageAlt,
                        localeTab,
                        event.currentTarget.value
                      ),
                    }))
                  }
                />
              </div>
            </AdminSectionCard>
          ) : null}

          {formTab === "settings" ? (
            <AdminSectionCard title="Settings" description="Slug, indexing, CTA target, and import-side metadata.">
              <div className="space-y-4">
                <Input
                  label="Slug"
                  value={state.slug}
                  onChange={(event) =>
                    updateState((current) => ({ ...current, slug: event.currentTarget.value }))
                  }
                  readOnly={slugReadOnly}
                  error={slugError}
                  helperText={`URL preview: ${previewPath}`}
                />
                <Input
                  label="Canonical URL"
                  value={state.canonicalUrl}
                  onChange={(event) =>
                    updateState((current) => ({ ...current, canonicalUrl: event.currentTarget.value }))
                  }
                />
                <Input
                  label="Primary CTA target"
                  value={state.primaryCtaTarget}
                  onChange={(event) =>
                    updateState((current) => ({ ...current, primaryCtaTarget: event.currentTarget.value }))
                  }
                />
                <Textarea
                  label="Tags"
                  value={state.tags}
                  onChange={(event) => updateState((current) => ({ ...current, tags: event.currentTarget.value }))}
                  rows={2}
                  helperText="Comma-separated tags."
                />
                <Textarea
                  label="Related guides"
                  value={state.relatedGuides}
                  onChange={(event) =>
                    updateState((current) => ({ ...current, relatedGuides: event.currentTarget.value }))
                  }
                  rows={2}
                  helperText="Comma-separated guide slugs."
                />
                <Textarea
                  label="Related guide paths"
                  value={state.relatedGuidePaths}
                  onChange={(event) =>
                    updateState((current) => ({ ...current, relatedGuidePaths: event.currentTarget.value }))
                  }
                  rows={2}
                  helperText="Comma-separated public paths."
                />
                <Textarea
                  label="Related keywords"
                  value={state.relatedKeywords}
                  onChange={(event) =>
                    updateState((current) => ({ ...current, relatedKeywords: event.currentTarget.value }))
                  }
                  rows={2}
                />
                <Input
                  label="Hero image filename"
                  value={state.heroImageFileName}
                  onChange={(event) =>
                    updateState((current) => ({ ...current, heroImageFileName: event.currentTarget.value }))
                  }
                />
                <Input
                  label="Hero image public path"
                  value={state.heroImagePublicPath}
                  onChange={(event) =>
                    updateState((current) => ({ ...current, heroImagePublicPath: event.currentTarget.value }))
                  }
                />
                <Textarea
                  label="Library body (EN)"
                  value={state.libraryBody.en}
                  onChange={(event) =>
                    updateState((current) => ({
                      ...current,
                      libraryBody: { ...current.libraryBody, en: event.currentTarget.value },
                    }))
                  }
                  rows={4}
                />
                <Textarea
                  label="Library body (NL)"
                  value={state.libraryBody.nl}
                  onChange={(event) =>
                    updateState((current) => ({
                      ...current,
                      libraryBody: { ...current.libraryBody, nl: event.currentTarget.value },
                    }))
                  }
                  rows={4}
                />
                <div className="grid gap-3 sm:grid-cols-2">
                  <Select
                    label="Table of contents"
                    value={state.tableOfContents ? "on" : "off"}
                    onChange={(event) =>
                      updateState((current) => ({ ...current, tableOfContents: event.currentTarget.value === "on" }))
                    }
                    options={[
                      { value: "on", label: "Enabled" },
                      { value: "off", label: "Disabled" },
                    ]}
                  />
                  <Select
                    label="Robots index"
                    value={state.robotsIndex ? "index" : "noindex"}
                    onChange={(event) =>
                      updateState((current) => ({ ...current, robotsIndex: event.currentTarget.value === "index" }))
                    }
                    options={[
                      { value: "index", label: "Index" },
                      { value: "noindex", label: "Noindex" },
                    ]}
                  />
                </div>
              </div>
            </AdminSectionCard>
          ) : null}

          {formTab === "activity" && isPublishAdmin ? (
            <AdminSectionCard
              title="Activity"
              description="Latest audit entries for this guide, including field changes and publishing events."
            >
              {activityLog === undefined ? (
                <p className="text-sm text-[color:var(--muted-foreground)]">Loading activity…</p>
              ) : activityLog.length === 0 ? (
                <p className="text-sm text-[color:var(--muted-foreground)]">No activity recorded yet.</p>
              ) : (
                <div className="space-y-4">
                  {activityLog.map((entry) => {
                    const summary = summarizeAuditEntry(entry);
                    return (
                      <div
                        key={String(entry._id)}
                        className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--secondary)] p-4"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div className="space-y-1">
                            <p className="font-medium">
                              {entry.userEmail} {formatAuditAction(entry.action)}
                            </p>
                            <p className="text-sm text-[color:var(--muted-foreground)]">
                              {formatAdminDateTime(entry.timestamp)}
                            </p>
                          </div>
                          <AdminStatusPill tone="neutral">
                            {entry.action.replaceAll("_", " ")}
                          </AdminStatusPill>
                        </div>
                        {summary.length > 0 ? (
                          <div className="mt-4 space-y-2">
                            {summary.map((change) => (
                              <div
                                key={`${String(entry._id)}-${change.field}`}
                                className="rounded-xl border border-[color:var(--border)] bg-[color:var(--card)] px-3 py-2 text-sm"
                              >
                                <span className="font-medium">{change.field}</span>
                                <span className="text-[color:var(--muted-foreground)]">
                                  {" "}
                                  {change.oldValue} {"->"} {change.newValue}
                                </span>
                              </div>
                            ))}
                            {entry.fieldChanges.length > 3 ? (
                              <p className="text-xs text-[color:var(--muted-foreground)]">
                                +{entry.fieldChanges.length - 3} more field changes
                              </p>
                            ) : null}
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              )}
            </AdminSectionCard>
          ) : null}
        </div>

        <div className="space-y-6">
          <AdminSectionCard title="SEO checklist" description="Warnings update live before you save.">
            <div className="space-y-3">
              {seoChecklist.map((item) => (
                <div
                  key={item.title}
                  className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--secondary)] p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">{item.title}</p>
                      <p className="mt-1 text-sm text-[color:var(--muted-foreground)]">{item.detail}</p>
                    </div>
                    <AdminStatusPill tone={item.tone}>{item.label}</AdminStatusPill>
                  </div>
                </div>
              ))}
            </div>
          </AdminSectionCard>

          <AdminSectionCard
            title="Actions"
            description="Save the guide first, then use the workflow controls for review and publishing."
          >
            <div className="space-y-4">
              {error ? (
                <div className="rounded-2xl border border-[color:var(--danger)]/30 bg-[color:color-mix(in_oklch,var(--danger)_10%,var(--card)_90%)] p-4 text-sm text-[color:var(--foreground)]">
                  {error}
                </div>
              ) : null}
              <div className="flex flex-wrap gap-3">
                <Button type="button" variant="outline" onClick={() => void saveGuide()} isLoading={isSaving}>
                  {saveButtonLabel}
                </Button>
                {submitForReviewVisible ? (
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      void handleSubmitForReview();
                    }}
                    isLoading={isSaving}
                  >
                    Submit for review
                  </Button>
                ) : null}
                {requestChangesVisible ? (
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      void handleRequestChanges();
                    }}
                    isLoading={isSaving}
                  >
                    Request changes
                  </Button>
                ) : null}
                {publishButtonVisible ? (
                  <Button
                    type="button"
                    onClick={() => {
                      void handlePublish();
                    }}
                    isLoading={isSaving}
                  >
                    Publish
                  </Button>
                ) : null}
                {unpublishButtonVisible ? (
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      void handleUnpublish();
                    }}
                    isLoading={isSaving}
                  >
                    Unpublish
                  </Button>
                ) : null}
              </div>
              <div className="space-y-1 text-sm text-[color:var(--muted-foreground)]">
                <p>Preview opens the current draft state in a new tab once the record is saved.</p>
                <p>{previewReason}</p>
                <p>Slug changes on published guides create a redirect automatically.</p>
              </div>
            </div>
          </AdminSectionCard>
        </div>
      </div>
    </div>
  );
}
