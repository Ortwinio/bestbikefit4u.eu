import { describe, expect, it } from "vitest";
import {
  DIALOG_OVERLAY_CLASSNAME,
  DIALOG_PANEL_CLASSNAME,
} from "./dialog";

describe("dialog panel contrast contract", () => {
  it("uses the shared opaque panel surface classes", () => {
    expect(DIALOG_PANEL_CLASSNAME).toContain("panel-surface-base");
    expect(DIALOG_PANEL_CLASSNAME).toContain("panel-theme-context");
  });

  it("keeps translucency limited to the backdrop layer", () => {
    expect(DIALOG_OVERLAY_CLASSNAME).toContain("panel-backdrop");
    expect(DIALOG_OVERLAY_CLASSNAME).not.toContain("backdrop-blur");
  });
});
