import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Progress } from "./Progress";

describe("brand progress", () => {
  it("renders named determinate progress with semantic track and fill", () => {
    const html=renderToStaticMarkup(<Progress label="Profiel ingevuld" value={75} max={100} />);
    expect(html).toContain('role="progressbar"');
    expect(html).toContain('aria-label="Profiel ingevuld"');
    expect(html).toContain('aria-valuenow="75"');
    expect(html).toContain('data-fill-pct="75"');
    expect(html).toContain('bg-border');
    expect(html).toContain('bg-primary');
    expect(html).not.toContain('bg-[color:var(');
  });
  it("keeps loading progress indeterminate", () => {
    const html=renderToStaticMarkup(<Progress label="Je advies laden" value={null} />);
    expect(html).toContain('role="progressbar"');
    expect(html).not.toContain('aria-valuenow=');
  });
});
