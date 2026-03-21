import { describe, expect, it } from "vitest";
import {
  buildToastManagerOptions,
  getToastKind,
  normalizeToastInput,
  normalizeToastPromiseEntry,
  toast,
} from "./Toast";

describe("toast helpers", () => {
  it("normalizes generic toast input", () => {
    expect(
      normalizeToastInput("Saved", {
        description: "The bike has been stored.",
      })
    ).toEqual({
      title: "Saved",
      description: "The bike has been stored.",
    });

    expect(
      normalizeToastInput({
        title: "Updated",
        description: "Changes were applied.",
      })
    ).toEqual({
      title: "Updated",
      description: "Changes were applied.",
    });
  });

  it("maps toast manager options with warning tone and action props", () => {
    const options = buildToastManagerOptions("warning", {
      title: "Heads up",
      description: "Check this setting before continuing.",
      action: {
        label: "Undo",
        onClick: () => {},
        disabled: true,
      },
    });

    expect(options.type).toBe("warning");
    expect(options.priority).toBe("low");
    expect(options.data).toEqual({ kind: "warning" });
    expect(options.actionProps).toMatchObject({
      children: "Undo",
      disabled: true,
    });
  });

  it("normalizes promise entries for toast.promise", () => {
    expect(normalizeToastPromiseEntry("Loading")).toBe("Loading");

    expect(
      normalizeToastPromiseEntry(
        {
          title: "Loaded",
          description: "The value is ready.",
        },
        "info"
      )
    ).toMatchObject({
      title: "Loaded",
      description: "The value is ready.",
      type: "info",
    });
  });

  it("reads the effective toast kind from type or custom data", () => {
    expect(getToastKind({ type: "warning" })).toBe("warning");
    expect(getToastKind({ data: { kind: "success" } })).toBe("success");
    expect(getToastKind({})).toBe("info");
  });

  it("exposes the Prototyper-style helper shape", () => {
    expect(typeof toast).toBe("function");
    expect(typeof toast.success).toBe("function");
    expect(typeof toast.error).toBe("function");
    expect(typeof toast.info).toBe("function");
    expect(typeof toast.warning).toBe("function");
    expect(typeof toast.promise).toBe("function");
    expect(typeof toast.close).toBe("function");
  });
});
