import { renderToStaticMarkup } from "react-dom/server";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/components/prototyper-ui/ui/dialog", () => ({
  Dialog: ({ children }: { children?: ReactNode }) => (
    <div data-slot="dialog">{children}</div>
  ),
  DialogClose: ({ children, render: _render, ...props }: { children?: ReactNode; render?: unknown; [key: string]: unknown }) => (
    <button data-slot="dialog-close" {...props}>
      {children}
    </button>
  ),
  DialogContent: ({
    children,
    showCloseButton: _showCloseButton,
    ...props
  }: {
    children?: ReactNode;
    showCloseButton?: boolean;
    [key: string]: unknown;
  }) => (
    <div data-slot="dialog-content" {...props}>
      {children}
    </div>
  ),
  DialogDescription: ({ children, ...props }: { children?: ReactNode; [key: string]: unknown }) => (
    <div data-slot="dialog-description" {...props}>
      {children}
    </div>
  ),
  DialogTitle: ({ children, ...props }: { children?: ReactNode; [key: string]: unknown }) => (
    <div data-slot="dialog-title" {...props}>
      {children}
    </div>
  ),
  DialogHeader: ({ children, ...props }: { children?: ReactNode; [key: string]: unknown }) => (
    <div data-slot="dialog-header" {...props}>
      {children}
    </div>
  ),
}));

import { AccessibleDialog } from "./AccessibleDialog";

describe("AccessibleDialog", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("renders the server fallback when no browser globals exist", () => {
    const html = renderToStaticMarkup(
      <AccessibleDialog
        open={true}
        title="Confirm action"
        description="This action cannot be undone."
        onClose={() => {}}
      >
        <p>Dialog content</p>
      </AccessibleDialog>
    );

    expect(html).toContain('data-slot="dialog"');
    expect(html).toContain('data-slot="dialog-content"');
    expect(html).toContain('data-slot="dialog-title"');
    expect(html).toContain('data-slot="dialog-description"');
    expect(html).toContain("Confirm action");
    expect(html).toContain("This action cannot be undone.");
    expect(html).toContain("Dialog content");
    expect(html).toContain("Close dialog");
  });

  it("renders the browser branch when window exists", () => {
    vi.stubGlobal("window", {});

    const html = renderToStaticMarkup(
      <AccessibleDialog
        open={true}
        title="Confirm action"
        description="This action cannot be undone."
        onClose={() => {}}
      >
        <p>Dialog content</p>
      </AccessibleDialog>
    );

    expect(html).toContain('data-slot="dialog-content"');
    expect(html).toContain('data-slot="dialog-title"');
    expect(html).toContain('data-slot="dialog-description"');
    expect(html).toContain("Dialog content");
  });
});
