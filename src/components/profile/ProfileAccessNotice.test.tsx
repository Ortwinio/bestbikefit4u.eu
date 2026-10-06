/* @vitest-environment jsdom */

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { getPricingAccessCopy } from "@/i18n/account/pricingAccess";
import { ProfileAccessNotice } from "./ProfileAccessNotice";

afterEach(cleanup);

describe.each(["en", "nl"] as const)("ProfileAccessNotice %s", (locale) => {
  it.each([true, false])("uses inverse text tokens for capped=%s", (capped) => {
    const copy = getPricingAccessCopy(locale);
    render(<ProfileAccessNotice locale={locale} capped={capped} inverse />);
    expect(screen.getByText(capped ? copy.cap : copy.uncapped).className).toBe("text-[var(--bbf-op-donker)]");
    if (capped) {
      expect(document.querySelector('[data-boundary="profile-score"]')).toBeTruthy();
      expect(screen.getAllByRole("link")[0].getAttribute("href")).toBe(`/${locale}/checkout?product=single`);
    } else {
      expect(screen.queryByRole("link")).toBeNull();
    }
  });

  it("preserves the default light-surface tokens", () => {
    render(<ProfileAccessNotice locale={locale} capped />);
    expect(screen.getByText(getPricingAccessCopy(locale).cap).className).toBe("text-muted-foreground");
    expect(screen.getAllByRole("link")[0].className).toContain("text-primary-foreground");
  });
});
