/* @vitest-environment jsdom */

import React from "react";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import CaseStudyPage, { generateMetadata } from "./page";
import { getCaseStudyMessages } from "@/i18n/marketing/caseStudy";

const state = vi.hoisted(() => ({
  locale: "nl" as "nl" | "en",
  submit: vi.fn(),
  success: vi.fn(),
  error: vi.fn(),
  marketing: vi.fn(),
  conversion: vi.fn(),
}));

vi.mock("@/i18n/request", () => ({ getRequestLocale: async () => state.locale }));
vi.mock("convex/react", () => ({ useMutation: () => state.submit }));
vi.mock("@/components/analytics/MarketingEventTracker", () => ({
  TrackMarketingEventOnView: () => null,
  useMarketingEventLogger: () => state.marketing,
}));
vi.mock("@/lib/analytics/conversions", () => ({ trackAdConversion: state.conversion }));
vi.mock("@/lib/telemetry", () => ({ reportClientError: () => "Submission failed" }));
vi.mock("@/components/prototyper-ui/ui/toast", () => ({
  useToast: () => ({ success: state.success, error: state.error }),
}));
vi.mock("next/image", () => ({
  default: ({ priority, alt, ...props }: React.ComponentProps<"img"> & { priority?: boolean }) => {
    void priority;
    return React.createElement("img", { alt, ...props });
  },
}));
vi.mock("next/link", () => ({
  default: ({ children, ...props }: React.ComponentProps<"a">) => <a {...props}>{children}</a>,
}));
vi.mock("@/components/analytics/TrackedCtaLink", () => ({
  TrackedCtaLink: ({ children, href, section, pagePath }: {
    children: React.ReactNode;
    href: string;
    section: string;
    pagePath: string;
  }) => <a href={href} data-section={section} data-source={pagePath}>{children}</a>,
}));

beforeEach(() => {
  vi.clearAllMocks();
  state.locale = "nl";
  state.submit.mockResolvedValue(null);
});
afterEach(cleanup);

async function renderForm(pain = "knee-pain-cycling") {
  const view = render(await CaseStudyPage({ searchParams: Promise.resolve({ pain }) }));
  const copy = getCaseStudyMessages(state.locale);
  fireEvent.change(screen.getByLabelText(copy.form.nameLabel), { target: { value: "Test rider" } });
  fireEvent.change(screen.getByLabelText(copy.form.emailLabel), { target: { value: "rider@example.invalid" } });
  fireEvent.change(screen.getByLabelText(copy.form.ridingGoalLabel), { target: { value: "Long rides" } });
  fireEvent.change(screen.getByLabelText(copy.form.painSummaryLabel), { target: { value: "Discomfort on climbs" } });
  fireEvent.click(screen.getByRole("checkbox"));
  return { ...view, copy, form: view.container.querySelector("form")! };
}

describe("case study presentation and unchanged recruitment form", () => {
  it.each(["nl", "en"] as const)("keeps source attribution, required fields and submit/reset in %s", async (locale) => {
    state.locale = locale;
    const { form, copy } = await renderForm();
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe(copy.title);
    expect(screen.getByRole("link", { name: copy.join }).getAttribute("href")).toBe("#aanmelden");
    expect(screen.getByRole("link", { name: copy.guides }).getAttribute("data-section"))
      .toBe("case_study_sidebar_guides_cta");
    expect(screen.getByLabelText(copy.form.nameLabel).hasAttribute("required")).toBe(true);
    expect(screen.getByLabelText(copy.form.emailLabel).getAttribute("type")).toBe("email");
    expect(screen.getByLabelText(copy.form.ridingGoalLabel).hasAttribute("required")).toBe(false);
    expect(screen.getByRole("checkbox").hasAttribute("required")).toBe(true);
    fireEvent.submit(form);
    await waitFor(() => expect(state.success).toHaveBeenCalledWith({ description: copy.form.success }));
    expect(state.submit).toHaveBeenCalledWith({
      locale,
      sourcePath: `/${locale}/case-study?pain=knee-pain-cycling`,
      painSlug: "knee-pain-cycling",
      name: "Test rider",
      email: "rider@example.invalid",
      ridingGoal: "Long rides",
      painSummary: "Discomfort on climbs",
      consentAccepted: true,
    });
    expect(state.marketing).toHaveBeenCalledWith(expect.objectContaining({
      eventType: "case_study_recruitment_submit", section: "knee-pain-cycling", locale,
    }));
    expect(state.conversion).toHaveBeenCalledWith("case_study_lead", expect.objectContaining({ locale }));
    expect((screen.getByLabelText(copy.form.nameLabel) as HTMLInputElement).value).toBe("");
    expect((screen.getByRole("checkbox") as HTMLInputElement).checked).toBe(false);
  });

  it("keeps values after an error and allows the same payload to retry", async () => {
    state.submit.mockRejectedValueOnce(new Error("offline"));
    const { form, copy } = await renderForm();
    fireEvent.submit(form);
    await waitFor(() => expect(state.error).toHaveBeenCalledWith({
      description: "Je aanmelding is niet verstuurd. Probeer het opnieuw.",
    }));
    expect((screen.getByLabelText(copy.form.nameLabel) as HTMLInputElement).value).toBe("Test rider");
    expect(state.conversion).not.toHaveBeenCalled();
    fireEvent.submit(form);
    await waitFor(() => expect(state.success).toHaveBeenCalled());
    expect(state.submit.mock.calls[0]).toEqual(state.submit.mock.calls[1]);
  });

  it("keeps the existing pending indication until the mutation resolves", async () => {
    let finish: () => void = () => {};
    state.submit.mockImplementationOnce(() => new Promise<void>((resolve) => { finish = resolve; }));
    const { form } = await renderForm();
    fireEvent.submit(form);
    expect(form.querySelector('button[type="submit"]')?.getAttribute("aria-disabled")).toBe("true");
    await act(async () => finish());
    await waitFor(() => expect(state.success).toHaveBeenCalled());
  });

  it("keeps English submission errors unchanged", async () => {
    state.locale = "en";
    state.submit.mockRejectedValueOnce(new Error("offline"));
    const { form } = await renderForm();
    fireEvent.submit(form);
    await waitFor(() => expect(state.error).toHaveBeenCalledWith({ description: "Submission failed" }));
  });

  it("uses Dutch practice-story labels and metadata", async () => {
    await renderForm();
    expect(screen.getByRole("button", { name: "Meld je aan voor een praktijkvoorbeeld" })).toBeTruthy();
    const metadata = await generateMetadata();
    expect(metadata.title).toBe("Deel je praktijkvoorbeeld | BestBikeFit4U");
    expect(metadata.description).toContain("praktijkvoorbeelden van fietsers");
    expect(metadata.openGraph).toMatchObject({ title: metadata.title, description: metadata.description });
    expect(JSON.stringify(getCaseStudyMessages("nl"))).not.toMatch(/case.study|follow-up|rider/);
  });

  it("localizes native validation and clears it when the rider edits", async () => {
    const copy = getCaseStudyMessages("nl");
    render(await CaseStudyPage({ searchParams: Promise.resolve({}) }));
    const name = screen.getByLabelText(copy.form.nameLabel) as HTMLInputElement;
    const email = screen.getByLabelText(copy.form.emailLabel) as HTMLInputElement;
    const summary = screen.getByLabelText(copy.form.painSummaryLabel) as HTMLTextAreaElement;
    const consent = screen.getByRole("checkbox") as HTMLInputElement;
    fireEvent.invalid(name);
    fireEvent.invalid(summary);
    expect(name.validationMessage).toBe("Vul dit veld in.");
    expect(summary.validationMessage).toBe("Vul dit veld in.");
    fireEvent.input(name, { target: { value: "Fietser" } });
    expect(name.validity.customError).toBe(false);
    fireEvent.change(email, { target: { value: "geen-email" } });
    fireEvent.invalid(email);
    expect(email.validationMessage).toBe("Vul een geldig e-mailadres in.");
    fireEvent.invalid(consent);
    expect(consent.validationMessage).toBe("Geef toestemming voordat je je aanmeldt.");
  });

  it("leaves English native validation to the browser", async () => {
    state.locale = "en";
    render(await CaseStudyPage({ searchParams: Promise.resolve({}) }));
    const name = screen.getByLabelText("Name") as HTMLInputElement;
    fireEvent.invalid(name);
    expect(name.validity.customError).toBe(false);
  });

  it.each(["nl", "en"] as const)("preserves metadata and canonical in %s", async (locale) => {
    state.locale = locale;
    const metadata = await generateMetadata();
    expect(metadata.alternates?.canonical).toBe(`https://bestbikefit4u.eu/${locale}/case-study`);
    expect(metadata.openGraph).toMatchObject({
      type: "website", url: `https://bestbikefit4u.eu/${locale}/case-study`,
    });
  });
});
