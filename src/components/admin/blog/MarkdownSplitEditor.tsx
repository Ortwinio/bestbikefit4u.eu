"use client";

import { useRef } from "react";
import type { ComponentType } from "react";
import {
  Bold,
  Heading2,
  Heading3,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
} from "lucide-react";
import { Button, Textarea } from "@/components/ui";
import { GuideBodyMarkdown } from "@/components/content/GuideBodyMarkdown";

type MarkdownSplitEditorProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
};

type ToolbarAction = {
  label: string;
  icon: ComponentType<{ className?: string }>;
  before: string;
  after?: string;
  placeholder: string;
};

const TOOLBAR_ACTIONS: ToolbarAction[] = [
  { label: "Bold", icon: Bold, before: "**", after: "**", placeholder: "bold text" },
  { label: "Italic", icon: Italic, before: "*", after: "*", placeholder: "italic text" },
  { label: "Heading 2", icon: Heading2, before: "## ", placeholder: "Section heading" },
  { label: "Heading 3", icon: Heading3, before: "### ", placeholder: "Subsection heading" },
  { label: "Bulleted list", icon: List, before: "- ", placeholder: "List item" },
  { label: "Numbered list", icon: ListOrdered, before: "1. ", placeholder: "List item" },
  { label: "Link", icon: LinkIcon, before: "[", after: "](https://)", placeholder: "link text" },
];

export function MarkdownSplitEditor({
  label,
  value,
  onChange,
}: MarkdownSplitEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const insertMarkdown = (action: ToolbarAction) => {
    const textarea = textareaRef.current;
    if (!textarea) {
      onChange(`${value}${action.before}${action.placeholder}${action.after ?? ""}`);
      return;
    }

    const selectionStart = textarea.selectionStart;
    const selectionEnd = textarea.selectionEnd;
    const selected = value.slice(selectionStart, selectionEnd);
    const inserted = `${action.before}${selected || action.placeholder}${action.after ?? ""}`;
    const nextValue = `${value.slice(0, selectionStart)}${inserted}${value.slice(selectionEnd)}`;
    onChange(nextValue);

    window.requestAnimationFrame(() => {
      textarea.focus();
      const cursorStart = selectionStart + action.before.length;
      const cursorEnd = cursorStart + (selected || action.placeholder).length;
      textarea.setSelectionRange(cursorStart, cursorEnd);
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-sm font-medium text-[color:var(--foreground)]">{label}</h3>
        <div className="flex flex-wrap gap-1.5">
          {TOOLBAR_ACTIONS.map((action) => {
            const Icon = action.icon;

            return (
              <Button
                key={action.label}
                type="button"
                variant="outline"
                size="sm"
                aria-label={action.label}
                title={action.label}
                className="h-8 w-8 p-0"
                onClick={() => insertMarkdown(action)}
              >
                <Icon className="h-4 w-4" />
              </Button>
            );
          })}
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Textarea
          ref={textareaRef}
          aria-label={`${label} markdown`}
          value={value}
          onChange={(event) => onChange(event.currentTarget.value)}
          rows={18}
          className="min-h-[28rem] font-mono text-sm leading-6"
        />
        <div className="min-h-[28rem] overflow-auto rounded-[var(--radius-lg)] border border-[color:var(--border)] bg-[color:var(--card)] p-5">
          {value.trim() ? (
            <GuideBodyMarkdown content={value} />
          ) : (
            <p className="text-sm text-[color:var(--muted-foreground)]">Preview</p>
          )}
        </div>
      </div>
    </div>
  );
}
