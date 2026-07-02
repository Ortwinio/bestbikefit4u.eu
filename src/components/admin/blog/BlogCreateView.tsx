"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { Button, Input, Select, useToast } from "@/components/ui";
import {
  AdminPageHeader,
  AdminSectionCard,
  AdminStatusPill,
} from "@/components/admin/layout/AdminUi";
import {
  BLOG_CATEGORY_OPTIONS,
  blogApi,
  buildBlogPreviewPath,
  emptyText,
  slugifyBlogTitle,
  type BilingualText,
} from "./blog-admin-shared";

function updateText(value: BilingualText, locale: keyof BilingualText, next: string) {
  return { ...value, [locale]: next };
}

export function BlogCreateView({ sessionRole }: { sessionRole: string }) {
  const router = useRouter();
  const toast = useToast();
  const createPost = useMutation(blogApi.mutations.createPost);
  const [title, setTitle] = useState<BilingualText>(emptyText());
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [category, setCategory] = useState("bike-fitting");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const normalizedSlug = useMemo(() => slugifyBlogTitle(slug), [slug]);
  const previewPath = buildBlogPreviewPath(normalizedSlug);

  const syncSlugFromTitle = (nextTitle: string) => {
    if (!slugTouched) {
      setSlug(slugifyBlogTitle(nextTitle));
    }
  };

  const handleSubmit = async () => {
    setError(null);
    if (!title.en.trim() || !title.nl.trim()) {
      setError("Title EN and Title NL are required.");
      return;
    }
    if (!normalizedSlug) {
      setError("Slug is required.");
      return;
    }

    setIsSaving(true);
    try {
      const postId = await createPost({
        slug: normalizedSlug,
        title,
        body: emptyText(),
        category,
        metaTitle: title,
        metaDescription: emptyText(),
        robotsIndex: true,
        tableOfContents: true,
      });

      toast.success({ description: "Blog draft created." });
      router.push(`/admin/blog/${String(postId)}/edit`);
      router.refresh();
    } catch (mutationError) {
      console.error("Failed to create blog post:", mutationError);
      setError(
        mutationError instanceof Error
          ? mutationError.message
          : "Could not create the blog post."
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <AdminPageHeader
        eyebrow="Product / Blog"
        title="New blog post"
        description="Create a draft with the essential routing fields first, then add content, SEO metadata, and publishing details in the editor."
        actions={
          <>
            <AdminStatusPill tone="neutral">Draft</AdminStatusPill>
            <Button variant="outline" render={<Link href="/admin/blog" />}>
              Back to blog
            </Button>
          </>
        }
      />

      <AdminSectionCard title="Draft setup" description={`Role: ${sessionRole}`}>
        <div className="grid gap-4 lg:grid-cols-2">
          <Input
            label="Title EN"
            value={title.en}
            onChange={(event) => {
              const next = event.currentTarget.value;
              setTitle((current) => updateText(current, "en", next));
              syncSlugFromTitle(next);
            }}
            required
          />
          <Input
            label="Title NL"
            value={title.nl}
            onChange={(event) => {
              setTitle((current) => updateText(current, "nl", event.currentTarget.value));
            }}
            required
          />
          <Input
            label="Slug"
            value={slug}
            onChange={(event) => {
              setSlugTouched(true);
              setSlug(event.currentTarget.value);
            }}
            onBlur={() => setSlug(normalizedSlug)}
            helperText={previewPath}
            required
          />
          <Select
            label="Category"
            value={category}
            onChange={(event) => setCategory(event.currentTarget.value)}
            options={BLOG_CATEGORY_OPTIONS.map((option) => ({
              value: option.value,
              label: option.label,
            }))}
          />
        </div>
        {error ? <p className="mt-4 text-sm text-[color:var(--danger)]">{error}</p> : null}
        <div className="mt-6 flex justify-end">
          <Button type="button" isLoading={isSaving} onClick={() => void handleSubmit()}>
            Create draft
          </Button>
        </div>
      </AdminSectionCard>
    </div>
  );
}

