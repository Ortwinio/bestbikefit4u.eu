import { describe, expect, it } from "vitest";
import { parseHtml } from "../../../scripts/lib/html.mjs";
import {
  benefits, chips, codeBlock, heading, hero, illustration, numberedTips, paragraph,
  primaryButton, renderLayout, safeHref, tipBlock, valueRows, valueTiles,
} from "./index";

const base = {
  locale: "nl" as const, subject: "Je fit", preheader: "Je waarden staan klaar.",
  footerReason: "Je ontvangt deze mail over je fit.", content: paragraph("Hoi Lisa,"),
};

describe("email layout", () => {
  it("sets locale, preheader, readable colors and a correctly sized hosted logo", () => {
    const dom = parseHtml(renderLayout(base));
    const document = dom.window.document;
    expect(document.documentElement.lang).toBe("nl");
    expect(document.body.firstElementChild?.tagName).toBe("SPAN");
    expect(document.body.firstElementChild?.textContent).toContain(base.preheader);
    expect(document.querySelector('meta[name="color-scheme"]')?.getAttribute("content")).toBe("light");
    const logo = document.querySelector('img[alt="BikeFitBoost"]');
    expect(logo?.getAttribute("src")).toBe("https://www.bikefitboost.com/brand/png/logo-horizontaal-960.png");
    expect(logo?.getAttribute("width")).toBe("172");
    expect(logo?.getAttribute("height")).toBe("30");
    expect(document.body.textContent).toContain("Fijne rit,");
    expect(document.body.textContent).not.toContain("Afmelden");
    dom.window.close();
  });

  it.each([ ["nl", "Afmelden", "E-mailvoorkeuren"], ["en", "Unsubscribe", "Email preferences"] ] as const)(
    "localizes optional %s preference links", (locale, unsubscribe, preferences) => {
      const html = renderLayout({ ...base, locale, unsubscribeUrl: "https://www.bikefitboost.com/unsubscribe?t=1&u=2",
        preferencesUrl: "https://www.bikefitboost.com/preferences" });
      expect(html).toContain(unsubscribe);
      expect(html).toContain(preferences);
      expect(html).toContain("?t=1&amp;u=2");
    }
  );

  it("escapes untrusted text in every block and rejects executable URLs", () => {
    const input = '<img src=x onerror="alert(1)">';
    const blocks = [
      chips([input]), heading(input), paragraph(input), hero({ eyebrow: input, heading: input, value: input, detail: input }),
      valueTiles([{ label: input, value: input }]), valueRows([{ label: input, value: input }]),
      benefits([{ title: input, text: input }]), numberedTips([{ title: input, text: input }]),
      tipBlock({ title: input, text: input }), codeBlock(input), illustration("measuring-kit.png", input),
      primaryButton("https://www.bikefitboost.com/fit", input),
    ];
    for (const block of blocks) {
      expect(block).not.toContain(input);
      expect(block).toContain("&lt;img");
    }
    for (const url of ["javascript:alert(1)", "data:text/html,foo", "//example.com", "/relative"]) {
      expect(() => safeHref(url)).toThrow();
    }
    expect(() => illustration("../outside.png", "")).toThrow();
  });

  it("uses tables, inline styles, responsive padding and an Outlook button fallback", () => {
    const html = renderLayout({ ...base, content: hero({ eyebrow: "FIT", heading: "Klaar" })
      + valueTiles([{ label: "Zadel", value: "754", unit: "mm" }])
      + chips(["Je afstelwaarden", "Je bandenspanning", "Je stappenplan"])
      + primaryButton("https://www.bikefitboost.com/fit", "Bekijk mijn stappenplan") });
    expect(html).not.toMatch(/display\s*:\s*(?:flex|grid)/i);
    expect(html).toContain('role="presentation"');
    expect(html).toContain(".email-card{padding:24px!important}");
    expect(html).toContain('<!--[if mso]><v:rect');
    expect(html).toContain("min-height:48px");
    expect(html).toContain("max-width:600px");
    expect(html).not.toMatch(/color:#CFF26A/i);
  });
});
