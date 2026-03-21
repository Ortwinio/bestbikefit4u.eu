import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { FieldLabel } from "./FieldLabel";

describe("FieldLabel", () => {
  it("renders the label association and tooltip wiring", () => {
    const html = renderToStaticMarkup(
      <FieldLabel
        label="Email"
        htmlFor="email"
        tooltip="Use the account address."
        tooltipLabel="Email help"
        tooltipDescriptionId="email-tooltip-description"
      />
    );

    expect(html).toContain('for="email"');
    expect(html).toContain("Email");
    expect(html).toContain('aria-label="Email help"');
    expect(html).toContain('aria-describedby="email-tooltip-description"');
    expect(html).toContain("Use the account address.");
  });
});
