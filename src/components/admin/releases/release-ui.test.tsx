import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import {
  ReleaseStatusPill,
  ReleaseTypePill,
  releaseStatusTone,
  releaseTypeLabel,
  releaseTypeTone,
} from "./release-ui";

describe("release admin ui helpers", () => {
  it("maps release statuses to the expected tones", () => {
    expect(releaseStatusTone("live")).toBe("success");
    expect(releaseStatusTone("rolling_out")).toBe("warning");
    expect(releaseStatusTone("approved")).toBe("info");
    expect(releaseStatusTone("rolled_back")).toBe("danger");
    expect(releaseStatusTone("draft")).toBe("neutral");
  });

  it("maps release types to labels and tones", () => {
    expect(releaseTypeLabel("fit_engine")).toBe("Fit engine");
    expect(releaseTypeTone("fit_engine")).toBe("info");
    expect(releaseTypeTone("geometry_data")).toBe("warning");
    expect(releaseTypeTone("internal")).toBe("danger");
  });

  it("renders status and type pills", () => {
    const statusHtml = renderToStaticMarkup(<ReleaseStatusPill status="rolling_out" />);
    expect(statusHtml).toContain("rolling out");

    const typeHtml = renderToStaticMarkup(<ReleaseTypePill type="geometry_data" />);
    expect(typeHtml).toContain("Geometry data");
  });
});
