// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { ProfileWizardGuide } from "./ProfileWizardGuide";
import { profileWizardGuideImageAlt } from "@/i18n/account/profileWizardGuide";

afterEach(cleanup);

describe("profile wizard illustration alternatives", () => {
  it.each(["nl", "en"] as const)("describes the actual saddle measurement illustration in %s", (locale) => {
    const view = render(<ProfileWizardGuide step={1} locale={locale} />);
    const image = screen.getByRole("img", { name: profileWizardGuideImageAlt[locale] });
    expect(image.getAttribute("src")).toContain("02-zadelhoogte-meten.webp");
    expect(image.getAttribute("width")).toBe("420");
    expect(image.getAttribute("height")).toBe("280");
    view.rerender(<ProfileWizardGuide step={2} locale={locale} />);
    expect(screen.getByRole("img", { name: profileWizardGuideImageAlt[locale] })).toBeTruthy();
    view.rerender(<ProfileWizardGuide step={3} locale={locale} />);
    expect(screen.queryByRole("img")).toBeNull();
  });
});
