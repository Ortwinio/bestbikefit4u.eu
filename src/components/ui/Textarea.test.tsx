import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { Textarea } from "./Textarea";

describe("Textarea", () => {
  it("renders field semantics and helper text", () => {
    const html = renderToStaticMarkup(
      <Textarea
        label="Notes"
        helperText="Add details"
        value=""
        onChange={() => {}}
      />
    );

    expect(html).toContain('data-slot="field"');
    expect(html).toContain("Notes");
    expect(html).toContain("Add details");
    expect(html).toContain("<textarea");
  });

  it("marks the textarea invalid when error is present", () => {
    const html = renderToStaticMarkup(
      <Textarea
        label="Notes"
        error="Required"
        value=""
        onChange={() => {}}
      />
    );

    expect(html).toContain('aria-invalid="true"');
    expect(html).toContain("Required");
  });
});
