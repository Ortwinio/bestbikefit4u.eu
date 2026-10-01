import { describe, expect, it } from "vitest";
import { aboutCopy, aboutTrustPoints } from "./about";
import { fitPassCopy } from "./fitPass";
import { homeMarketing } from "./home";
import { measurementGuideCopy } from "./measurementGuide";
import { pricingCopy } from "./pricing";
import { getPainPageCopy, PAIN_PAGES } from "@/content/painPages";
import { HOME_GUIDE_LINKS, HOME_SCENARIO_LINKS } from "@/components/home/homeGuideContent";
import { getDutchGuideTitle } from "./guideTitles";

describe("Dutch marketing terminology", () => {
  it("names every Dutch home guide card with its canonical title", () => {
    for (const card of [...HOME_GUIDE_LINKS.nl, ...HOME_SCENARIO_LINKS.nl]) {
      expect(card.title).toBeTruthy();
      expect(card.title).toBe(getDutchGuideTitle(card.href.slice("/guides/".length)));
    }
    expect(HOME_GUIDE_LINKS.en[2].title).toBe("Road Bike Fit Guide");
    expect(HOME_SCENARIO_LINKS.en[1].title).toBe("Bike Fit for Gravel Riding");
  });
  it("uses Dutch wording for measurements, results and body stability", () => {
    expect(homeMarketing.nl.tools[0].title).toBe("Volledige bikefit");
    expect(homeMarketing.en.tools[0].title).toBe("Complete bike fit");
    expect(measurementGuideCopy.nl.rangeLabel).toBe("Gebruikelijk bereik");
    expect(measurementGuideCopy.nl.ctaBody).toContain("persoonlijke afstelling");
    expect(pricingCopy.nl.proofItems[1].title).toBe("Concrete afstelwaarden");
    expect(homeMarketing.nl.pains[3].description).toContain("zadelterugstand");
    expect(aboutCopy.nl.saddleBullets).toContain("Rompstabiliteit en houdingscontrole");
    expect(aboutTrustPoints.nl[1].description).toContain("fietsafstellingen");
    expect(JSON.stringify(fitPassCopy.nl)).not.toContain("setup");
  });

  it("localizes pain advice and metadata without changing English", () => {
    const dutch = JSON.stringify(
      PAIN_PAGES.map((page) => getPainPageCopy(page, "nl")),
      (key, value) => key === "href" ? undefined : value,
    );
    expect(dutch).not.toMatch(/setback|core-ondersteuning/);
    expect(dutch).not.toMatch(/case.study|"FAQ"/);
    expect(dutch).toContain("Veelgestelde vragen");
    expect(dutch).toContain("Deel je praktijkvoorbeeld");
    expect(dutch).toContain("rompstabiliteit");
    expect(dutch).toContain("zadelterugstand");
    const english = JSON.stringify(PAIN_PAGES.map((page) => getPainPageCopy(page, "en")));
    expect(english).toContain("saddle setback");
    expect(english).toContain("core support");
  });
});
