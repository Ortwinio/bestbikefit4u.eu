import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { AccessibleDialog } from "./AccessibleDialog";

describe("AccessibleDialog", () => {
  it("renders the opaque panel surface contract during SSR fallback", () => {
    const html = renderToStaticMarkup(
      <AccessibleDialog
        open={true}
        title="Dialog title"
        description="Dialog description"
        onClose={() => {}}
      >
        <div>Dialog content</div>
      </AccessibleDialog>
    );

    expect(html).toContain("panel-backdrop");
    expect(html).toContain("panel-surface-base");
    expect(html).toContain("panel-theme-context");
  });
});
