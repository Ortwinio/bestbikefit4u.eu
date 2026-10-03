/* @vitest-environment jsdom */
import type { ComponentProps } from "react";
import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { profileSectionsCopy } from "@/i18n/account/profileSections";
import { ProfileSectionTabs } from "./ProfileSectionTabs";

vi.mock("next/link", () => ({ default: (props: ComponentProps<"a">) => <a {...props} /> }));
afterEach(cleanup);

describe("profile section navigation", () => {
  for (const locale of ["nl", "en"] as const) {
    it.each(["data", "advice", "bikes"] as const)(`localizes ${locale} links and marks only %s active`, active => {
      const copy = profileSectionsCopy[locale];
      render(<ProfileSectionTabs locale={locale} active={active} />);
      const navigation = screen.getByRole("navigation", { name: copy.navigation });
      const links = within(navigation).getAllByRole("link");
      expect(links).toHaveLength(3);
      for (const [key, path] of [["data", "/profile"], ["advice", "/profile/advice"], ["bikes", "/bikes"]] as const) {
        const link = within(navigation).getByRole("link", { name: copy[key] });
        expect(link.getAttribute("href")).toBe(`/${locale}${path}`);
        expect(link.getAttribute("aria-current")).toBe(key === active ? "page" : null);
      }
      expect(links.filter(link => link.getAttribute("aria-current") === "page")).toHaveLength(1);
    });
  }
});
