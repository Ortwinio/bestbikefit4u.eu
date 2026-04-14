"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import { Button, Input, Select, SegmentedControl, SegmentedControlItem, Textarea, useToast } from "@/components/ui";
import {
  AdminPageHeader,
  AdminSectionCard,
  AdminStatusPill,
} from "@/components/admin/layout/AdminUi";
import {
  buildGuidePreviewPath,
  formatGuideStatusLabel,
  GUIDE_CLUSTER_OPTIONS,
  guideStatusTone,
  slugifyGuideTitle,
} from "./guide-admin-shared";

type LocaleKey = "en" | "nl";
type FormTab = "content" | "seo" | "settings";
type SectionType = "prose" | "steps" | "cards" | "table";

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
  return valid ? { tone: "success" as const, label: "Pass" } : { tone: "warning" as const, label: "Warn" };
}

export function GuideCreateView({
  sessionRole,
}: {
  sessionRole: string;
}) {
  const router = useRouter();
  const toast = useToast();
  const createGuide = useMutation(api.guides.mutations.createGuide);
  const submitGuideForReview = useMutation(api.guides.mutations.submitGuideForReview);
  const [formTab, setFormTab] = useState<FormTab>("content");
  const [localeTab, setLocaleTab] = useState<LocaleKey>("en");
  const [cluster, setCluster] = useState<(typeof GUIDE_CLUSTER_OPTIONS)[number]["value"]>("pain-discomfort");
  const [pageTitle, setPageTitle] = useState<BilingualText>(emptyText());
  const [h1, setH1] = useState<BilingualText>(emptyText());
  const [pageBrief, setPageBrief] = useState<BilingualText>(emptyText());
  const [body, setBody] = useState<GuideSectionForm[]>([emptySection()]);
  const [faqs, setFaqs] = useState<GuideFaqForm[]>([emptyFaq()]);
  const [metaTitle, setMetaTitle] = useState<BilingualText>(emptyText());
  const [metaDescription, setMetaDescription] = useState<BilingualText>(emptyText());
  const [ogTitle, setOgTitle] = useState<BilingualText>(emptyText());
  const [ogDescription, setOgDescription] = useState<BilingualText>(emptyText());
  const [primaryCtaLabel, setPrimaryCtaLabel] = useState<BilingualText>({
    en: "Start Free Fit",
    nl: "Start gratis fit",
  });
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [tableOfContents, setTableOfContents] = useState(true);
  const [robotsIndex, setRobotsIndex] = useState(true);
  const [primaryCtaTarget, setPrimaryCtaTarget] = useState("/login?from=guide");
  const [canonicalUrl, setCanonicalUrl] = useState("");
  const [featuredImageUrl, setFeaturedImageUrl] = useState("");
  const [featuredImageAlt, setFeaturedImageAlt] = useState<BilingualText>(emptyText());
  const [ogImageUrl, setOgImageUrl] = useState("");
  const [ogImageAlt, setOgImageAlt] = useState<BilingualText>(emptyText());
  const [tags, setTags] = useState("");
  const [relatedGuides, setRelatedGuides] = useState("");
  const [relatedGuidePaths, setRelatedGuidePaths] = useState("");
  const [relatedKeywords, setRelatedKeywords] = useState("");
  const [libraryBody, setLibraryBody] = useState<BilingualText>(emptyText());
  const [heroImageFileName, setHeroImageFileName] = useState("");
  const [heroImagePublicPath, setHeroImagePublicPath] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const normalizedSlug = useMemo(() => slugifyGuideTitle(slug), [slug]);
  const slugLookup = useQuery(
    api.guides.queries.getGuideBySlug,
    normalizedSlug ? { slug: normalizedSlug } : "skip"
  );

  const metaDescriptionLength = metaDescription[localeTab].trim().length;
  const seoChecklist = [
    {
      title: "H1 is filled",
      detail: "Required before publishing.",
      ...checklistStatus(Boolean(h1.en.trim() && h1.nl.trim())),
    },
    {
      title: "Meta title is filled",
      detail: "Use a clear SERP title in both languages.",
      ...checklistStatus(Boolean(metaTitle.en.trim() && metaTitle.nl.trim())),
    },
    {
      title: "Meta description is in range",
      detail: `${metaDescriptionLength} characters in ${localeTab.toUpperCase()} view.`,
      ...checklistStatus(metaDescriptionLength >= 50 && metaDescriptionLength <= 160),
    },
    {
      title: "Slug is available",
      detail: normalizedSlug ? buildGuidePreviewPath(normalizedSlug) : "Choose a slug.",
      ...checklistStatus(Boolean(normalizedSlug) && !slugLookup),
    },
    {
      title: "Featured image alt text is set when needed",
      detail: featuredImageUrl.trim()
        ? "Add EN and NL alt text for the image."
        : "No featured image set.",
      ...checklistStatus(
        !featuredImageUrl.trim() ||
          Boolean(featuredImageAlt.en.trim() && featuredImageAlt.nl.trim())
      ),
    },
  ];

  const previewPath = buildGuidePreviewPath(normalizedSlug);
  const slugError =
    slugTouched && !normalizedSlug
      ? "Slug is required."
      : slugLookup
        ? "This slug already exists."
        : undefined;

  const contentLocaleLabel = localeTab === "en" ? "English" : "Dutch";

  const syncSlugFromTitle = (nextTitle: string) => {
    if (!slugTouched) {
      setSlug(slugifyGuideTitle(nextTitle));
    }
  };

  const buildMutationPayload = () => ({
    slug: normalizedSlug,
    cluster,
    pageTitle,
    h1,
    metaTitle,
    metaDescription,
    pageBrief,
    body: {
      en: body.map((section) => ({
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
      nl: body.map((section) => ({
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
      en: faqs
        .filter((faq) => faq.q.en.trim() || faq.a.en.trim())
        .map((faq) => ({ q: faq.q.en, a: faq.a.en })),
      nl: faqs
        .filter((faq) => faq.q.nl.trim() || faq.a.nl.trim())
        .map((faq) => ({ q: faq.q.nl, a: faq.a.nl })),
    },
    libraryBody:
      libraryBody.en.trim() || libraryBody.nl.trim()
        ? libraryBody
        : undefined,
    heroImageFileName: heroImageFileName.trim() || undefined,
    heroImagePublicPath: heroImagePublicPath.trim() || undefined,
    relatedGuidePaths: relatedGuidePaths
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean),
    relatedKeywords: relatedKeywords
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean),
    featuredImageUrl: featuredImageUrl.trim() || undefined,
    featuredImageAlt:
      featuredImageAlt.en.trim() || featuredImageAlt.nl.trim()
        ? featuredImageAlt
        : undefined,
    canonicalUrl: canonicalUrl.trim() || undefined,
    ogTitle:
      ogTitle.en.trim() || ogTitle.nl.trim()
        ? ogTitle
        : undefined,
    ogDescription:
      ogDescription.en.trim() || ogDescription.nl.trim()
        ? ogDescription
        : undefined,
    ogImageUrl: ogImageUrl.trim() || undefined,
    ogImageAlt:
      ogImageAlt.en.trim() || ogImageAlt.nl.trim()
        ? ogImageAlt
        : undefined,
    robotsIndex,
    tags: tags
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean),
    relatedGuides: relatedGuides
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean),
    primaryCtaTarget: primaryCtaTarget.trim() || undefined,
    primaryCtaLabel:
      primaryCtaLabel.en.trim() || primaryCtaLabel.nl.trim()
        ? primaryCtaLabel
        : undefined,
    tableOfContents,
  });

  const validateRequiredFields = () => {
    if (!normalizedSlug) {
      return "Set a unique slug before saving.";
    }
    if (slugLookup) {
      return "Choose a different slug. This one already exists.";
    }
    if (!pageTitle.en.trim() || !pageTitle.nl.trim()) {
      return "Page title is required in English and Dutch.";
    }
    if (!metaTitle.en.trim() || !metaTitle.nl.trim()) {
      return "Meta title is required in English and Dutch.";
    }
    if (!metaDescription.en.trim() || !metaDescription.nl.trim()) {
      return "Meta description is required in English and Dutch.";
    }

    return null;
  };

  const handleSave = async (mode: "draft" | "review") => {
    setError(null);
    const validationError = validateRequiredFields();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSaving(true);
    try {
      const guideId = (await createGuide(buildMutationPayload())) as Id<"guidePages">;
      if (mode === "review") {
        await submitGuideForReview({ id: guideId });
      }

      toast.success({
        description:
          mode === "draft"
            ? "Guide draft created."
            : "Guide submitted for review.",
      });
      router.push(`/admin/guides/${String(guideId)}/edit`);
      router.refresh();
    } catch (mutationError) {
      console.error("Failed to create guide:", mutationError);
      setError(
        mutationError instanceof Error
          ? mutationError.message
          : "Could not create the guide."
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <AdminPageHeader
        eyebrow="Product / Guides"
        title="New guide"
        description="Create a bilingual guide draft with structured content, SEO metadata, and review-ready settings."
        actions={
          <>
            <AdminStatusPill tone={guideStatusTone("draft")}>
              {formatGuideStatusLabel("draft")}
            </AdminStatusPill>
            <Button variant="outline" render={<Link href="/admin/guides" />}>
              Back to guides
            </Button>
          </>
        }
      />

      <AdminSectionCard
        title="Workflow"
        description="This create form only supports draft and review states. Publish controls belong to the edit workflow."
      >
        <div className="flex flex-wrap gap-2 text-sm text-[color:var(--muted-foreground)]">
          <AdminStatusPill tone="neutral">Role: {sessionRole}</AdminStatusPill>
          <span>Save as draft to keep working, or submit for review when the content is ready for admin approval.</span>
        </div>
      </AdminSectionCard>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(22rem,0.8fr)]">
        <div className="space-y-6">
          <AdminSectionCard title="Form sections" description="Switch between content, SEO, and settings without leaving the draft.">
            <SegmentedControl
              aria-label="Guide form sections"
              value={formTab}
              onValueChange={(value) => setFormTab(value as FormTab)}
              size="sm"
            >
              {FORM_TABS.map((tab) => (
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

              <AdminSectionCard title="Core content" description={`Editing ${contentLocaleLabel} fields.`}>
                <div className="grid gap-4">
                  <Select
                    label="Cluster"
                    value={cluster}
                    onChange={(event) => setCluster(event.currentTarget.value as (typeof GUIDE_CLUSTER_OPTIONS)[number]["value"])}
                    options={GUIDE_CLUSTER_OPTIONS.map((option) => ({
                      value: option.value,
                      label: option.label,
                    }))}
                  />
                  <Input
                    label="Internal title"
                    value={pageTitle[localeTab]}
                    onChange={(event) => {
                      const next = event.currentTarget.value;
                      setPageTitle((current) => updateLocalizedValue(current, localeTab, next));
                      if (localeTab === "en") {
                        syncSlugFromTitle(next);
                      }
                    }}
                    placeholder={localeTab === "en" ? "Bike fitting for knee pain" : "Bikefitting bij kniepijn"}
                  />
                  <Input
                    label="H1"
                    value={h1[localeTab]}
                    onChange={(event) =>
                      setH1((current) => updateLocalizedValue(current, localeTab, event.currentTarget.value))
                    }
                    placeholder="Public page heading"
                  />
                  <Textarea
                    label="Page brief"
                    value={pageBrief[localeTab]}
                    onChange={(event) =>
                      setPageBrief((current) => updateLocalizedValue(current, localeTab, event.currentTarget.value))
                    }
                    rows={3}
                    helperText="Used in cards, listings, and hub summaries."
                  />
                  <Textarea
                    label="Primary CTA label"
                    value={primaryCtaLabel[localeTab]}
                    onChange={(event) =>
                      setPrimaryCtaLabel((current) => updateLocalizedValue(current, localeTab, event.currentTarget.value))
                    }
                    rows={2}
                  />
                </div>
              </AdminSectionCard>

              <AdminSectionCard title="Body sections" description="Practical v1 editor for H2 sections, list items, and simple tables.">
                <div className="space-y-4">
                  {body.map((section, sectionIndex) => (
                    <div
                      key={`section-${sectionIndex}`}
                      className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--secondary)] p-4"
                    >
                      <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_12rem_auto]">
                        <Input
                          label={`Section title (${contentLocaleLabel})`}
                          value={section.title[localeTab]}
                          onChange={(event) => {
                            const nextSections = [...body];
                            nextSections[sectionIndex] = {
                              ...section,
                              title: updateLocalizedValue(section.title, localeTab, event.currentTarget.value),
                            };
                            setBody(nextSections);
                          }}
                        />
                        <Select
                          label="Section type"
                          value={section.type}
                          onChange={(event) => {
                            const nextSections = [...body];
                            nextSections[sectionIndex] = {
                              ...section,
                              type: event.currentTarget.value as SectionType,
                            };
                            setBody(nextSections);
                          }}
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
                            onClick={() => setBody((current) => current.filter((_, index) => index !== sectionIndex))}
                            disabled={body.length === 1}
                          >
                            Remove section
                          </Button>
                        </div>
                      </div>

                      <div className="mt-4 space-y-3">
                        {section.items.map((item, itemIndex) => (
                          <Textarea
                            key={`section-${sectionIndex}-item-${itemIndex}`}
                            label={`Item ${itemIndex + 1} (${contentLocaleLabel})`}
                            value={item[localeTab]}
                            onChange={(event) => {
                              const nextSections = [...body];
                              const nextItems = [...section.items];
                              nextItems[itemIndex] = updateLocalizedValue(item, localeTab, event.currentTarget.value);
                              nextSections[sectionIndex] = { ...section, items: nextItems };
                              setBody(nextSections);
                            }}
                            rows={3}
                          />
                        ))}
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            const nextSections = [...body];
                            nextSections[sectionIndex] = {
                              ...section,
                              items: [...section.items, emptyText()],
                            };
                            setBody(nextSections);
                          }}
                        >
                          Add body item
                        </Button>
                      </div>

                      {section.type === "table" ? (
                        <div className="mt-4 grid gap-4">
                          <Textarea
                            label={`Table headers (${contentLocaleLabel})`}
                            value={section.tableHeaders.map((header) => header[localeTab]).join("\n")}
                            onChange={(event) => {
                              const headers = event.currentTarget.value
                                .split("\n")
                                .map((value) => value.trim())
                                .filter(Boolean);
                              const nextSections = [...body];
                              nextSections[sectionIndex] = {
                                ...section,
                                tableHeaders: headers.map((header, headerIndex) =>
                                  updateLocalizedValue(
                                    section.tableHeaders[headerIndex] ?? emptyText(),
                                    localeTab,
                                    header
                                  )
                                ),
                              };
                              setBody(nextSections);
                            }}
                            rows={3}
                            helperText="One header per line."
                          />
                          <Textarea
                            label={`Table rows (${contentLocaleLabel})`}
                            value={section.tableRows
                              .map((row) => row.map((cell) => cell[localeTab]).join(" | "))
                              .join("\n")}
                            onChange={(event) => {
                              const rows = event.currentTarget.value
                                .split("\n")
                                .map((line) => line.split("|").map((cell) => cell.trim()).filter(Boolean))
                                .filter((row) => row.length > 0);
                              const nextSections = [...body];
                              nextSections[sectionIndex] = {
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
                              setBody(nextSections);
                            }}
                            rows={4}
                            helperText="Use one row per line and separate columns with |."
                          />
                        </div>
                      ) : null}
                    </div>
                  ))}

                  <Button type="button" variant="secondary" onClick={() => setBody((current) => [...current, emptySection()])}>
                    Add section
                  </Button>
                </div>
              </AdminSectionCard>

              <AdminSectionCard title="FAQs" description="Add practical Q&A pairs for the accordion and FAQ schema.">
                <div className="space-y-4">
                  {faqs.map((faq, faqIndex) => (
                    <div
                      key={`faq-${faqIndex}`}
                      className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--secondary)] p-4"
                    >
                      <div className="grid gap-3">
                        <Input
                          label={`Question ${faqIndex + 1} (${contentLocaleLabel})`}
                          value={faq.q[localeTab]}
                          onChange={(event) => {
                            const nextFaqs = [...faqs];
                            nextFaqs[faqIndex] = {
                              ...faq,
                              q: updateLocalizedValue(faq.q, localeTab, event.currentTarget.value),
                            };
                            setFaqs(nextFaqs);
                          }}
                        />
                        <Textarea
                          label={`Answer ${faqIndex + 1} (${contentLocaleLabel})`}
                          value={faq.a[localeTab]}
                          onChange={(event) => {
                            const nextFaqs = [...faqs];
                            nextFaqs[faqIndex] = {
                              ...faq,
                              a: updateLocalizedValue(faq.a, localeTab, event.currentTarget.value),
                            };
                            setFaqs(nextFaqs);
                          }}
                          rows={4}
                        />
                        <div>
                          <Button
                            type="button"
                            variant="ghost"
                            onClick={() => setFaqs((current) => current.filter((_, index) => index !== faqIndex))}
                            disabled={faqs.length === 1}
                          >
                            Remove FAQ
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                  <Button type="button" variant="secondary" onClick={() => setFaqs((current) => [...current, emptyFaq()])}>
                    Add FAQ
                  </Button>
                </div>
              </AdminSectionCard>
            </>
          ) : null}

          {formTab === "seo" ? (
            <AdminSectionCard title="SEO fields" description={`Editing ${contentLocaleLabel} SEO metadata.`}>
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
                  value={metaTitle[localeTab]}
                  onChange={(event) =>
                    setMetaTitle((current) => updateLocalizedValue(current, localeTab, event.currentTarget.value))
                  }
                />
                <Textarea
                  label="Meta description"
                  value={metaDescription[localeTab]}
                  onChange={(event) =>
                    setMetaDescription((current) => updateLocalizedValue(current, localeTab, event.currentTarget.value))
                  }
                  rows={3}
                  helperText="Target 50–160 characters."
                />
                <Input
                  label="Open Graph title"
                  value={ogTitle[localeTab]}
                  onChange={(event) =>
                    setOgTitle((current) => updateLocalizedValue(current, localeTab, event.currentTarget.value))
                  }
                  helperText="Leave empty to fall back to the meta title."
                />
                <Textarea
                  label="Open Graph description"
                  value={ogDescription[localeTab]}
                  onChange={(event) =>
                    setOgDescription((current) => updateLocalizedValue(current, localeTab, event.currentTarget.value))
                  }
                  rows={3}
                />
                <Input
                  label="Featured image URL"
                  value={featuredImageUrl}
                  onChange={(event) => setFeaturedImageUrl(event.currentTarget.value)}
                />
                <Input
                  label={`Featured image alt (${contentLocaleLabel})`}
                  value={featuredImageAlt[localeTab]}
                  onChange={(event) =>
                    setFeaturedImageAlt((current) => updateLocalizedValue(current, localeTab, event.currentTarget.value))
                  }
                />
                <Input
                  label="Open Graph image URL"
                  value={ogImageUrl}
                  onChange={(event) => setOgImageUrl(event.currentTarget.value)}
                />
                <Input
                  label={`Open Graph image alt (${contentLocaleLabel})`}
                  value={ogImageAlt[localeTab]}
                  onChange={(event) =>
                    setOgImageAlt((current) => updateLocalizedValue(current, localeTab, event.currentTarget.value))
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
                  value={slug}
                  onChange={(event) => {
                    setSlugTouched(true);
                    setSlug(event.currentTarget.value);
                  }}
                  error={slugError}
                  helperText={`URL preview: ${previewPath}`}
                />
                <Input
                  label="Canonical URL"
                  value={canonicalUrl}
                  onChange={(event) => setCanonicalUrl(event.currentTarget.value)}
                />
                <Input
                  label="Primary CTA target"
                  value={primaryCtaTarget}
                  onChange={(event) => setPrimaryCtaTarget(event.currentTarget.value)}
                />
                <Textarea
                  label="Tags"
                  value={tags}
                  onChange={(event) => setTags(event.currentTarget.value)}
                  rows={2}
                  helperText="Comma-separated tags."
                />
                <Textarea
                  label="Related guides"
                  value={relatedGuides}
                  onChange={(event) => setRelatedGuides(event.currentTarget.value)}
                  rows={2}
                  helperText="Comma-separated guide slugs."
                />
                <Textarea
                  label="Related guide paths"
                  value={relatedGuidePaths}
                  onChange={(event) => setRelatedGuidePaths(event.currentTarget.value)}
                  rows={2}
                  helperText="Comma-separated public paths."
                />
                <Textarea
                  label="Related keywords"
                  value={relatedKeywords}
                  onChange={(event) => setRelatedKeywords(event.currentTarget.value)}
                  rows={2}
                />
                <Input
                  label="Hero image filename"
                  value={heroImageFileName}
                  onChange={(event) => setHeroImageFileName(event.currentTarget.value)}
                />
                <Input
                  label="Hero image public path"
                  value={heroImagePublicPath}
                  onChange={(event) => setHeroImagePublicPath(event.currentTarget.value)}
                />
                <Textarea
                  label="Library body (EN)"
                  value={libraryBody.en}
                  onChange={(event) => setLibraryBody((current) => ({ ...current, en: event.currentTarget.value }))}
                  rows={4}
                />
                <Textarea
                  label="Library body (NL)"
                  value={libraryBody.nl}
                  onChange={(event) => setLibraryBody((current) => ({ ...current, nl: event.currentTarget.value }))}
                  rows={4}
                />
                <div className="grid gap-3 sm:grid-cols-2">
                  <Select
                    label="Table of contents"
                    value={tableOfContents ? "on" : "off"}
                    onChange={(event) => setTableOfContents(event.currentTarget.value === "on")}
                    options={[
                      { value: "on", label: "Enabled" },
                      { value: "off", label: "Disabled" },
                    ]}
                  />
                  <Select
                    label="Robots index"
                    value={robotsIndex ? "index" : "noindex"}
                    onChange={(event) => setRobotsIndex(event.currentTarget.value === "index")}
                    options={[
                      { value: "index", label: "Index" },
                      { value: "noindex", label: "Noindex" },
                    ]}
                  />
                </div>
              </div>
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

          <AdminSectionCard title="Actions" description="Create the guide as a draft or move it straight into review.">
            <div className="space-y-4">
              {error ? (
                <div className="rounded-2xl border border-[color:var(--danger)]/30 bg-[color:color-mix(in_oklch,var(--danger)_10%,var(--card)_90%)] p-4 text-sm text-[color:var(--foreground)]">
                  {error}
                </div>
              ) : null}
              <div className="flex flex-wrap gap-3">
                <Button type="button" variant="outline" onClick={() => handleSave("draft")} isLoading={isSaving}>
                  Save as draft
                </Button>
                <Button type="button" onClick={() => handleSave("review")} isLoading={isSaving}>
                  Submit for review
                </Button>
              </div>
              <p className="text-sm text-[color:var(--muted-foreground)]">
                Preview routing, edit workflow, and publish controls are handled in the follow-up admin guide task.
              </p>
            </div>
          </AdminSectionCard>
        </div>
      </div>
    </div>
  );
}
