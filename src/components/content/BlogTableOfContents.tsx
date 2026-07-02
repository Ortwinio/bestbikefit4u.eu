"use client";

type BlogTableOfContentsProps = {
  content: string;
  title: string;
};

type TocHeading = {
  id: string;
  text: string;
};

function slugifyHeading(value: string) {
  return value
    .toLowerCase()
    .replace(/[`*_#[\]()]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function extractHeadings(content: string): TocHeading[] {
  const headings: TocHeading[] = [];
  const usedIds = new Map<string, number>();
  const pattern = /^##\s+(.+)$/gm;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(content)) !== null) {
    const text = match[1].replace(/\s+#+$/, "").trim();
    if (!text) {
      continue;
    }

    const baseId = slugifyHeading(text) || `section-${headings.length + 1}`;
    const count = usedIds.get(baseId) ?? 0;
    usedIds.set(baseId, count + 1);

    headings.push({
      id: count === 0 ? baseId : `${baseId}-${count + 1}`,
      text,
    });
  }

  return headings;
}

export function BlogTableOfContents({ content, title }: BlogTableOfContentsProps) {
  const headings = extractHeadings(content);

  if (headings.length === 0) {
    return null;
  }

  return (
    <nav
      aria-label={title}
      className="rounded-[var(--radius-xl)] border border-border/70 bg-card p-5"
    >
      <p className="text-sm font-semibold text-foreground">{title}</p>
      <ol className="mt-4 space-y-2">
        {headings.map((heading) => (
          <li key={heading.id}>
            <a
              href={`#${heading.id}`}
              className="text-sm leading-6 text-muted-foreground transition-colors hover:text-primary"
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
