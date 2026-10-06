import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { FeedbackFloatingButton } from "@/components/feedback/FeedbackFloatingButton";
import { accountFeedbackPlacement } from "./account-feedback-placement";

const accountRoutes = [
  "/nl/dashboard", "/en/profile/improve/flexibility", "/nl/bikes/new",
  "/en/gearing", "/nl/shoe-cleat-fit", "/en/app",
];

function buttonMarkup(path: string) {
  return renderToStaticMarkup(createElement(FeedbackFloatingButton, {
    label: "Feedback", onClick: () => {}, flowOnMobile: true,
    className: accountFeedbackPlacement(path),
  }));
}

describe("account feedback launcher clearance", () => {
  it.each(accountRoutes)("keeps the actual button in account flow at every width on %s", (path) => {
    const markup = buttonMarkup(path);
    expect(markup).toContain("92px+env(safe-area-inset-bottom)");
    expect(markup).toContain("md:static");
    expect(markup).toContain("md:w-fit");
    expect(markup).toContain("md:ml-auto");
    expect(markup).not.toContain("md:fixed");
  });
  it.each(["/en", "/nl/login", "/en/calculators/bike-fit", "/en/profile-other"])(
    "preserves public desktop placement on %s", (path) => {
      expect(accountFeedbackPlacement(path)).toBeUndefined();
      expect(buttonMarkup(path)).toContain("md:fixed");
      expect(buttonMarkup(path)).not.toContain("md:static");
    },
  );
});
