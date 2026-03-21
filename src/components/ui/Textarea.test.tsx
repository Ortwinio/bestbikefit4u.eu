import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { Textarea } from "./Textarea";

describe("Textarea", () => {
  it("merges custom, tooltip, and helper descriptions", () => {
    const html = renderToStaticMarkup(
      <Textarea
        id="notes"
        label="Notes"
        tooltip="Write enough context for a follow-up."
        tooltipLabel="Notes help"
        helperText="Add details"
        aria-describedby="custom-note"
        value=""
        onChange={() => {}}
      />
    );

    expect(html).toContain('data-slot="field"');
    expect(html).toContain('data-slot="textarea"');
    expect(html).toContain("Notes");
    expect(html).toContain('aria-label="Notes help"');
    expect(html).toContain(
      'aria-describedby="custom-note notes-tooltip-description notes-helper"'
    );
    expect(html).toContain("Write enough context for a follow-up.");
    expect(html).toContain("Add details");
    expect(html).toContain("<textarea");
  });

  it("marks the textarea invalid when error is present", () => {
    const html = renderToStaticMarkup(
      <Textarea
        id="notes"
        label="Notes"
        error="Required"
        helperText="Add details"
        value=""
        onChange={() => {}}
      />
    );

    expect(html).toContain('aria-invalid="true"');
    expect(html).toContain("Required");
    expect(html).not.toContain("Add details");
  });
});
