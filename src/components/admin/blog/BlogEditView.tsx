"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { Button, AccessibleDialog, Input, Select, SegmentedControl, SegmentedControlItem, Textarea, useToast } from "@/components/ui";
import {
  AdminPageHeader,
  AdminSectionCard,
  AdminStatusPill,
  AdminTable,
  AdminTableCell,
  AdminTableHead,
  AdminTableRow,
} from "@/components/admin/layout/AdminUi";
import { MarkdownSplitEditor } from "./MarkdownSplitEditor";
import {
  BLOG_CATEGORY_OPTIONS,
  blogApi,
  blogStatusTone,
  buildBlogPreviewPath,
  emptyText,
  formatBlogDateTime,
  formatBlogStatus,
  joinCommaList,
  optionalBilingual,
  slugifyBlogTitle,
  splitCommaList,
  type BilingualText,
  type BlogPostPayload,
  type BlogPostRecord,
  type BlogRevisionRecord,
  type BlogStatus,
  type BlogTab,
} from "./blog-admin-shared";

type BlogFormState = {
  slug: string;
  title: BilingualText;
  h1: BilingualText;
  body: BilingualText;
  excerpt: BilingualText;
  category: string;
  tags: string;
  featuredImageUrl: string;
  featuredImageAlt: BilingualText;
  authorName: string;
  metaTitle: BilingualText;
  metaDescription: BilingualText;
  canonicalUrl: string;
  ogTitle: BilingualText;
  ogDescription: BilingualText;
  ogImageUrl: string;
  ogImageAlt: BilingualText;
  robotsIndex: boolean;
  relatedPostSlugs: string;
  relatedGuidePaths: string;
  tableOfContents: boolean;
};

function fromPost(post: BlogPostRecord): BlogFormState {
  return {
    slug: post.slug,
    title: post.title,
    h1: post.h1 ?? emptyText(),
    body: post.body,
    excerpt: post.excerpt ?? emptyText(),
    category: post.category,
    tags: joinCommaList(post.tags),
    featuredImageUrl: post.featuredImageUrl ?? "",
    featuredImageAlt: post.featuredImageAlt ?? emptyText(),
    authorName: post.authorName ?? "",
    metaTitle: post.metaTitle,
    metaDescription: post.metaDescription,
    canonicalUrl: post.canonicalUrl ?? "",
    ogTitle: post.ogTitle ?? emptyText(),
    ogDescription: post.ogDescription ?? emptyText(),
    ogImageUrl: post.ogImageUrl ?? "",
    ogImageAlt: post.ogImageAlt ?? emptyText(),
    robotsIndex: post.robotsIndex,
    relatedPostSlugs: joinCommaList(post.relatedPostSlugs),
    relatedGuidePaths: joinCommaList(post.relatedGuidePaths),
    tableOfContents: post.tableOfContents,
  };
}

function updateText(value: BilingualText, locale: keyof BilingualText, next: string) {
  return { ...value, [locale]: next };
}

function buildPayload(state: BlogFormState): BlogPostPayload {
  return {
    slug: slugifyBlogTitle(state.slug),
    title: state.title,
    h1: optionalBilingual(state.h1),
    body: state.body,
    excerpt: optionalBilingual(state.excerpt),
    category: state.category,
    tags: splitCommaList(state.tags),
    featuredImageUrl: state.featuredImageUrl.trim() || undefined,
    featuredImageAlt: optionalBilingual(state.featuredImageAlt),
    authorName: state.authorName.trim() || undefined,
    metaTitle: state.metaTitle,
    metaDescription: state.metaDescription,
    canonicalUrl: state.canonicalUrl.trim() || undefined,
    ogTitle: optionalBilingual(state.ogTitle),
    ogDescription: optionalBilingual(state.ogDescription),
    ogImageUrl: state.ogImageUrl.trim() || undefined,
    ogImageAlt: optionalBilingual(state.ogImageAlt),
    robotsIndex: state.robotsIndex,
    relatedPostSlugs: splitCommaList(state.relatedPostSlugs),
    relatedGuidePaths: splitCommaList(state.relatedGuidePaths),
    tableOfContents: state.tableOfContents,
  };
}

function CharacterCounter({ value, target }: { value: string; target: number }) {
  const length = value.trim().length;
  const tone = length <= target ? "text-[color:var(--muted-foreground)]" : "text-[color:var(--warning)]";

  return <p className={`mt-1 text-xs ${tone}`}>{length}/{target}</p>;
}

export function BlogEditView({ post }: { post: BlogPostRecord }) {
  const router = useRouter();
  const toast = useToast();
  const updatePost = useMutation(blogApi.mutations.updatePost);
  const publishPost = useMutation(blogApi.mutations.publishPost);
  const unpublishPost = useMutation(blogApi.mutations.unpublishPost);
  const deletePost = useMutation(blogApi.mutations.deletePost);
  const revisions = (useQuery(blogApi.queries.listBlogRevisions, { postId: post._id }) ?? []) as BlogRevisionRecord[];
  const [activeTab, setActiveTab] = useState<BlogTab>("content");
  const [state, setState] = useState<BlogFormState>(() => fromPost(post));
  const [status, setStatus] = useState<BlogStatus>(post.status);
  const [publishedAt, setPublishedAt] = useState<number | undefined>(post.publishedAt);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const normalizedSlug = useMemo(() => slugifyBlogTitle(state.slug), [state.slug]);
  const previewPath = buildBlogPreviewPath(normalizedSlug);

  const updateState = (next: Partial<BlogFormState>) => {
    setState((current) => ({ ...current, ...next }));
  };

  const validate = () => {
    if (!state.title.en.trim() || !state.title.nl.trim()) {
      return "Title EN and Title NL are required.";
    }
    if (!normalizedSlug) {
      return "Slug is required.";
    }
    return null;
  };

  const validateReadyToPublish = () => {
    const validationError = validate();
    if (validationError) {
      return validationError;
    }

    const missingLocalizedRequired = ["en", "nl"].some((locale) => {
      const key = locale as keyof BilingualText;
      return (
        !state.body[key].trim() ||
        !state.metaTitle[key].trim() ||
        !state.metaDescription[key].trim()
      );
    });

    if (missingLocalizedRequired) {
      return "English and Dutch body, meta title, and meta description are required before publishing.";
    }

    if (
      state.featuredImageUrl.trim() &&
      (!state.featuredImageAlt.en.trim() || !state.featuredImageAlt.nl.trim())
    ) {
      return "Featured image alt text EN and NL are required before publishing.";
    }

    return null;
  };

  const handleSave = async () => {
    setError(null);
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSaving(true);
    try {
      await updatePost({ id: post._id, ...buildPayload(state) });
      toast.success({ description: "Blog post saved." });
      router.refresh();
    } catch (mutationError) {
      console.error("Failed to save blog post:", mutationError);
      setError(mutationError instanceof Error ? mutationError.message : "Could not save the blog post.");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublishState = async (nextStatus: BlogStatus) => {
    if (nextStatus === status) {
      return;
    }

    setError(null);
    if (nextStatus === "published") {
      const validationError = validateReadyToPublish();
      if (validationError) {
        setError(validationError);
        return;
      }
    }

    setIsPublishing(true);
    try {
      if (nextStatus === "published") {
        await updatePost({ id: post._id, ...buildPayload(state) });
        await publishPost({ id: post._id });
        setStatus("published");
        setPublishedAt((current) => current ?? Date.now());
        toast.success({ description: "Blog post saved and published." });
      } else {
        await unpublishPost({ id: post._id });
        setStatus("draft");
        toast.success({ description: "Blog post unpublished." });
      }
      router.refresh();
    } catch (mutationError) {
      console.error("Failed to update publishing state:", mutationError);
      setError(mutationError instanceof Error ? mutationError.message : "Could not update publishing state.");
    } finally {
      setIsPublishing(false);
    }
  };

  const handleDelete = async () => {
    setIsPublishing(true);
    try {
      await deletePost({ id: post._id });
      toast.success({ description: "Blog draft deleted." });
      router.push("/admin/blog");
      router.refresh();
    } catch (mutationError) {
      console.error("Failed to delete blog post:", mutationError);
      setError(mutationError instanceof Error ? mutationError.message : "Could not delete the blog post.");
    } finally {
      setIsPublishing(false);
      setDeleteOpen(false);
    }
  };

  return (
    <div className="space-y-8">
      <AccessibleDialog
        open={deleteOpen}
        title="Delete blog draft"
        description={`Delete ${state.title.en || state.slug}? This is only available for draft posts.`}
        onClose={() => setDeleteOpen(false)}
      >
        <div className="flex justify-end gap-3">
          <Button type="button" variant="ghost" onClick={() => setDeleteOpen(false)}>
            Cancel
          </Button>
          <Button type="button" isLoading={isPublishing} onClick={() => void handleDelete()}>
            Delete
          </Button>
        </div>
      </AccessibleDialog>

      <AdminPageHeader
        eyebrow="Product / Blog"
        title={state.title.en || "Untitled blog post"}
        description={`Version ${post.version}. ${previewPath}`}
        actions={
          <>
            <AdminStatusPill tone={blogStatusTone(status)}>{formatBlogStatus(status)}</AdminStatusPill>
            <Button variant="outline" render={<Link href={`/admin/blog/${post._id}`} />}>
              Preview
            </Button>
            <Button variant="outline" render={<Link href="/admin/blog" />}>
              Back to blog
            </Button>
            <Button type="button" isLoading={isSaving} onClick={() => void handleSave()}>
              Save draft
            </Button>
          </>
        }
      />

      <AdminSectionCard title="Editor sections" description="Use the tabs to move between article content, SEO, publishing controls, and revision history.">
        <SegmentedControl
          aria-label="Blog editor sections"
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as BlogTab)}
          size="sm"
        >
          <SegmentedControlItem value="content">Content</SegmentedControlItem>
          <SegmentedControlItem value="seo">SEO</SegmentedControlItem>
          <SegmentedControlItem value="publishing">Publishing</SegmentedControlItem>
          <SegmentedControlItem value="history">History</SegmentedControlItem>
        </SegmentedControl>
      </AdminSectionCard>

      {error ? <p className="text-sm text-[color:var(--danger)]">{error}</p> : null}

      {activeTab === "content" ? (
        <div className="space-y-6">
          <AdminSectionCard title="Article content" description="Core bilingual article fields.">
            <div className="grid gap-4 lg:grid-cols-2">
              <Input label="Title EN" value={state.title.en} onChange={(event) => updateState({ title: updateText(state.title, "en", event.currentTarget.value) })} />
              <Input label="Title NL" value={state.title.nl} onChange={(event) => updateState({ title: updateText(state.title, "nl", event.currentTarget.value) })} />
              <Input label="H1 override EN" placeholder="Leave blank to use title" value={state.h1.en} onChange={(event) => updateState({ h1: updateText(state.h1, "en", event.currentTarget.value) })} />
              <Input label="H1 override NL" placeholder="Leave blank to use title" value={state.h1.nl} onChange={(event) => updateState({ h1: updateText(state.h1, "nl", event.currentTarget.value) })} />
              <Select label="Category" value={state.category} onChange={(event) => updateState({ category: event.currentTarget.value })} options={BLOG_CATEGORY_OPTIONS.map((option) => ({ value: option.value, label: option.label }))} />
              <Input label="Tags" value={state.tags} onChange={(event) => updateState({ tags: event.currentTarget.value })} helperText="Comma-separated tags" />
            </div>
          </AdminSectionCard>

          <AdminSectionCard title="Body EN" description="Markdown editor with live preview.">
            <MarkdownSplitEditor label="Body EN" value={state.body.en} onChange={(value) => updateState({ body: updateText(state.body, "en", value) })} />
          </AdminSectionCard>

          <AdminSectionCard title="Body NL" description="Markdown editor with live preview.">
            <MarkdownSplitEditor label="Body NL" value={state.body.nl} onChange={(value) => updateState({ body: updateText(state.body, "nl", value) })} />
          </AdminSectionCard>

          <AdminSectionCard title="Listing and media" description="Summary text, cover image, table of contents, and related content.">
            <div className="grid gap-4 lg:grid-cols-2">
              <Textarea label="Excerpt EN" rows={4} value={state.excerpt.en} onChange={(event) => updateState({ excerpt: updateText(state.excerpt, "en", event.currentTarget.value) })} />
              <Textarea label="Excerpt NL" rows={4} value={state.excerpt.nl} onChange={(event) => updateState({ excerpt: updateText(state.excerpt, "nl", event.currentTarget.value) })} />
              <Input label="Featured image URL" value={state.featuredImageUrl} onChange={(event) => updateState({ featuredImageUrl: event.currentTarget.value })} />
              <div className="flex items-center gap-3 pt-7">
                <input id="blog-toc" type="checkbox" checked={state.tableOfContents} onChange={(event) => updateState({ tableOfContents: event.currentTarget.checked })} />
                <label htmlFor="blog-toc" className="text-sm font-medium text-[color:var(--foreground)]">Table of contents</label>
              </div>
              <Input label="Featured image alt EN" value={state.featuredImageAlt.en} onChange={(event) => updateState({ featuredImageAlt: updateText(state.featuredImageAlt, "en", event.currentTarget.value) })} />
              <Input label="Featured image alt NL" value={state.featuredImageAlt.nl} onChange={(event) => updateState({ featuredImageAlt: updateText(state.featuredImageAlt, "nl", event.currentTarget.value) })} />
              <Input label="Related post slugs" value={state.relatedPostSlugs} onChange={(event) => updateState({ relatedPostSlugs: event.currentTarget.value })} helperText="Comma-separated slugs" />
              <Input label="Related guide paths" value={state.relatedGuidePaths} onChange={(event) => updateState({ relatedGuidePaths: event.currentTarget.value })} helperText="Comma-separated paths, for example /guides/saddle-height-guide" />
            </div>
          </AdminSectionCard>
        </div>
      ) : null}

      {activeTab === "seo" ? (
        <AdminSectionCard title="SEO metadata" description="Search, canonical, Open Graph, and robots controls.">
          <div className="grid gap-4 lg:grid-cols-2">
            <div>
              <Input label="Meta title EN" value={state.metaTitle.en} onChange={(event) => updateState({ metaTitle: updateText(state.metaTitle, "en", event.currentTarget.value) })} />
              <CharacterCounter value={state.metaTitle.en} target={60} />
            </div>
            <div>
              <Input label="Meta title NL" value={state.metaTitle.nl} onChange={(event) => updateState({ metaTitle: updateText(state.metaTitle, "nl", event.currentTarget.value) })} />
              <CharacterCounter value={state.metaTitle.nl} target={60} />
            </div>
            <div>
              <Textarea label="Meta description EN" rows={4} value={state.metaDescription.en} onChange={(event) => updateState({ metaDescription: updateText(state.metaDescription, "en", event.currentTarget.value) })} />
              <CharacterCounter value={state.metaDescription.en} target={160} />
            </div>
            <div>
              <Textarea label="Meta description NL" rows={4} value={state.metaDescription.nl} onChange={(event) => updateState({ metaDescription: updateText(state.metaDescription, "nl", event.currentTarget.value) })} />
              <CharacterCounter value={state.metaDescription.nl} target={160} />
            </div>
            <Input label="Canonical URL override" placeholder="auto - /blog/[slug]" value={state.canonicalUrl} onChange={(event) => updateState({ canonicalUrl: event.currentTarget.value })} />
            <div className="flex items-center gap-3 pt-7">
              <input id="blog-robots-index" type="checkbox" checked={state.robotsIndex} onChange={(event) => updateState({ robotsIndex: event.currentTarget.checked })} />
              <label htmlFor="blog-robots-index" className="text-sm font-medium text-[color:var(--foreground)]">Robots index</label>
            </div>
            <Input label="OG title EN" value={state.ogTitle.en} onChange={(event) => updateState({ ogTitle: updateText(state.ogTitle, "en", event.currentTarget.value) })} />
            <Input label="OG title NL" value={state.ogTitle.nl} onChange={(event) => updateState({ ogTitle: updateText(state.ogTitle, "nl", event.currentTarget.value) })} />
            <Textarea label="OG description EN" rows={4} value={state.ogDescription.en} onChange={(event) => updateState({ ogDescription: updateText(state.ogDescription, "en", event.currentTarget.value) })} />
            <Textarea label="OG description NL" rows={4} value={state.ogDescription.nl} onChange={(event) => updateState({ ogDescription: updateText(state.ogDescription, "nl", event.currentTarget.value) })} />
            <Input label="OG image URL" value={state.ogImageUrl} onChange={(event) => updateState({ ogImageUrl: event.currentTarget.value })} />
            <div />
            <Input label="OG image alt EN" value={state.ogImageAlt.en} onChange={(event) => updateState({ ogImageAlt: updateText(state.ogImageAlt, "en", event.currentTarget.value) })} />
            <Input label="OG image alt NL" value={state.ogImageAlt.nl} onChange={(event) => updateState({ ogImageAlt: updateText(state.ogImageAlt, "nl", event.currentTarget.value) })} />
          </div>
        </AdminSectionCard>
      ) : null}

      {activeTab === "publishing" ? (
        <AdminSectionCard title="Publishing" description="Slug, author, public state, and destructive draft actions.">
          <div className="grid gap-4 lg:grid-cols-2">
            <Input label="Slug" value={state.slug} onChange={(event) => updateState({ slug: event.currentTarget.value })} onBlur={() => updateState({ slug: normalizedSlug })} helperText={previewPath} />
            <Input label="Author name" value={state.authorName} onChange={(event) => updateState({ authorName: event.currentTarget.value })} />
            <Select
              label="Status"
              value={status}
              disabled={isPublishing}
              onChange={(event) => void handlePublishState(event.currentTarget.value as BlogStatus)}
              options={[
                { value: "draft", label: "Draft" },
                { value: "published", label: "Published" },
              ]}
            />
            <Input label="Published at" value={formatBlogDateTime(publishedAt)} readOnly />
          </div>
          <div className="mt-6 flex flex-wrap justify-end gap-3">
            {status === "published" ? (
              <Button type="button" variant="outline" isLoading={isPublishing} onClick={() => void handlePublishState("draft")}>
                Unpublish
              </Button>
            ) : (
              <Button type="button" variant="outline" isLoading={isPublishing} onClick={() => void handlePublishState("published")}>
                Publish
              </Button>
            )}
            <Button type="button" variant="ghost" disabled={status === "published"} onClick={() => setDeleteOpen(true)}>
              Delete
            </Button>
          </div>
        </AdminSectionCard>
      ) : null}

      {activeTab === "history" ? (
        <AdminSectionCard title="Revision history" description="Saved snapshots for this blog post.">
          {revisions.length === 0 ? (
            <p className="text-sm text-[color:var(--muted-foreground)]">No revisions saved yet.</p>
          ) : (
            <AdminTable>
              <AdminTableHead columns={["Version", "Saved by", "Saved at"]} />
              <tbody>
                {revisions.map((revision) => (
                  <AdminTableRow key={revision._id}>
                    <AdminTableCell>v{revision.version}</AdminTableCell>
                    <AdminTableCell>
                      <div className="space-y-1">
                        <div>{revision.savedByDetail?.displayName ?? revision.savedBy}</div>
                        {revision.savedByDetail?.email ? (
                          <div className="text-xs text-[color:var(--muted-foreground)]">
                            {revision.savedByDetail.email}
                          </div>
                        ) : null}
                      </div>
                    </AdminTableCell>
                    <AdminTableCell>{formatBlogDateTime(revision.savedAt)}</AdminTableCell>
                  </AdminTableRow>
                ))}
              </tbody>
            </AdminTable>
          )}
        </AdminSectionCard>
      ) : null}
    </div>
  );
}
