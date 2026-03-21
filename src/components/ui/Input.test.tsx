import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { Input } from "./Input";

describe("Input", () => {
  it("merges custom, tooltip, and helper descriptions", () => {
    const html = renderToStaticMarkup(
      <Input
        id="email"
        label="Email"
        tooltip="Use the address tied to your account."
        tooltipLabel="Email help"
        helperText="We will send the fit summary here."
        aria-describedby="custom-note"
        value=""
        onChange={() => {}}
      />
    );

    expect(html).toContain('data-slot="field"');
    expect(html).toContain('aria-label="Email help"');
    expect(html).toContain(
      'aria-describedby="custom-note email-tooltip-description email-helper"'
    );
    expect(html).toContain("Use the address tied to your account.");
    expect(html).toContain("We will send the fit summary here.");
  });

  it("marks the input invalid and suppresses helper text when an error is present", () => {
    const html = renderToStaticMarkup(
      <Input
        id="email"
        label="Email"
        error="Email is required."
        helperText="We will send the fit summary here."
        value=""
        onChange={() => {}}
      />
    );

    expect(html).toContain('aria-invalid="true"');
    expect(html).toContain("Email is required.");
    expect(html).not.toContain("We will send the fit summary here.");
  });
});
