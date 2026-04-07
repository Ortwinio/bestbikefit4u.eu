import { renderToStaticMarkup } from "react-dom/server";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/components/prototyper-ui/ui/button", () => ({
  Button: ({
    children,
    className,
    ...props
  }: {
    children?: ReactNode;
    className?: string;
    [key: string]: unknown;
  }) => (
    <button className={className} {...props}>
      {children}
    </button>
  ),
}));

import {
  FEEDBACK_FLOATING_BUTTON_PLACEMENT_CLASSNAME,
  FeedbackFloatingButton,
} from "./FeedbackFloatingButton";

describe("FeedbackFloatingButton", () => {
  it("renders an accessible label and the responsive placement contract", () => {
    const html = renderToStaticMarkup(
      <FeedbackFloatingButton onClick={() => {}} label="Share feedback" />
    );

    expect(html).toContain('aria-label="Share feedback"');
    expect(html).toContain("Share feedback");
    expect(html).toContain(FEEDBACK_FLOATING_BUTTON_PLACEMENT_CLASSNAME);
  });
});
