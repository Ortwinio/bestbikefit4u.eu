"use client";

import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type BlogBodyMarkdownProps = {
  content: string;
};

function slugifyHeading(value: string) {
  return value
    .toLowerCase()
    .replace(/[`*_#[\]()]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getNodeText(node: React.ReactNode): string {
  if (typeof node === "string" || typeof node === "number") {
    return String(node);
  }

  if (Array.isArray(node)) {
    return node.map(getNodeText).join("");
  }

  if (node && typeof node === "object" && "props" in node) {
    const props = node.props as { children?: React.ReactNode };
    return getNodeText(props.children);
  }

  return "";
}

function MarkdownAnchor({
  href,
  children,
}: {
  href?: string;
  children?: React.ReactNode;
}) {
  const resolvedHref = href ?? "#";

  if (resolvedHref.startsWith("/")) {
    return (
      <Link
        href={resolvedHref}
        className="font-medium text-primary underline underline-offset-4 transition-colors hover:text-primary/80"
      >
        {children}
      </Link>
    );
  }

  return (
    <a
      href={resolvedHref}
      target="_blank"
      rel="noopener noreferrer"
      className="font-medium text-primary underline underline-offset-4 transition-colors hover:text-primary/80"
    >
      {children}
    </a>
  );
}

export function BlogBodyMarkdown({ content }: BlogBodyMarkdownProps) {
  const usedHeadingIds = new Map<string, number>();

  function buildHeadingId(children: React.ReactNode) {
    const text = getNodeText(children);
    const baseId = slugifyHeading(text) || "section";
    const count = usedHeadingIds.get(baseId) ?? 0;
    usedHeadingIds.set(baseId, count + 1);
    return count === 0 ? baseId : `${baseId}-${count + 1}`;
  }

  return (
    <div className="space-y-6 text-base leading-8 text-muted-foreground">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h2: ({ children }) => (
            <h2
              id={buildHeadingId(children)}
              className="scroll-mt-24 mt-10 text-2xl font-semibold tracking-tight text-foreground first:mt-0"
            >
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="mt-8 text-xl font-semibold tracking-tight text-foreground">
              {children}
            </h3>
          ),
          p: ({ children }) => (
            <p className="text-base leading-8 text-muted-foreground">{children}</p>
          ),
          ul: ({ children }) => (
            <ul className="list-disc space-y-3 pl-5 text-base leading-8 text-muted-foreground">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal space-y-3 pl-5 text-base leading-8 text-muted-foreground">
              {children}
            </ol>
          ),
          li: ({ children }) => <li className="pl-1">{children}</li>,
          table: ({ children }) => (
            <div className="overflow-x-auto rounded-[var(--radius-xl)] border border-border/70 bg-card">
              <table className="w-full min-w-[640px] border-collapse text-sm">{children}</table>
            </div>
          ),
          thead: ({ children }) => <thead className="bg-muted/50">{children}</thead>,
          tbody: ({ children }) => <tbody className="divide-y divide-border/60">{children}</tbody>,
          tr: ({ children }) => <tr className="align-top">{children}</tr>,
          th: ({ children }) => (
            <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-4 py-3 text-sm leading-6 text-muted-foreground">
              {children}
            </td>
          ),
          a: ({ href, children }) => <MarkdownAnchor href={href}>{children}</MarkdownAnchor>,
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-primary/50 bg-muted/40 px-4 py-3 text-sm text-foreground">
              {children}
            </blockquote>
          ),
          strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
          em: ({ children }) => <em className="italic text-foreground">{children}</em>,
          code: ({ children }) => (
            <code className="rounded-md bg-muted px-1.5 py-0.5 text-[0.925em] text-foreground">
              {children}
            </code>
          ),
          hr: () => <hr className="my-8 border-border/70" />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
