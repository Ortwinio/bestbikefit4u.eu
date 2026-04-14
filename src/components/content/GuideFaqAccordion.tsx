"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";
import type { GuideFaqItem } from "@/lib/guides/markdown-utils";
import { cn } from "@/utils/cn";
import { GuideBodyMarkdown } from "./GuideBodyMarkdown";

type GuideFaqAccordionProps = {
  faqs: GuideFaqItem[];
};

export function GuideFaqAccordion({ faqs }: GuideFaqAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="space-y-3">
      {faqs.map((faq, index) => {
        const isOpen = openIndex === index;

        return (
          <div
            key={faq.q}
            className="overflow-hidden rounded-[var(--radius-xl)] border border-border/70 bg-card"
          >
            <button
              type="button"
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
              aria-expanded={isOpen}
              onClick={() => setOpenIndex(isOpen ? null : index)}
            >
              <span className="text-base font-semibold text-foreground">{faq.q}</span>
              <ChevronDown
                className={cn(
                  "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
                  isOpen ? "rotate-180" : null
                )}
              />
            </button>
            {isOpen ? (
              <div className="border-t border-border/60 px-5 py-4">
                <GuideBodyMarkdown content={faq.a} />
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
