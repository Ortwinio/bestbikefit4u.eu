import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ResultHero } from "./ResultHero";
import { ResultTile } from "./ResultTile";
import { MeasurementTile } from "./MeasurementTile";
import { StatRow } from "./StatRow";
import { StatusChip } from "./StatusChip";
import { Gauge } from "./Gauge";
import { SizeScale } from "./SizeScale";
import { AdjustOrder } from "./AdjustOrder";

describe("ResultHero", () => {
  it.each(["lime", "ink"] as const)("labels the %s result and keeps units and explanation separate", (variant) => {
    const html = renderToStaticMarkup(
      <ResultHero label="Jouw startpunt" value={742} unit="mm" subtext="Meet langs de zadelbuis." variant={variant}>
        <a href="/login">Bewaar je resultaat</a>
      </ResultHero>,
    );
    expect(html).toContain('aria-label="Jouw startpunt"');
    expect(html).toContain("<dt");
    expect(html).toContain(">742</span>");
    expect(html).toContain(">mm</span>");
    expect(html).toContain("Meet langs de zadelbuis.");
    expect(html).toContain('href="/login"');
  });
});

describe("ResultTile / MeasurementTile compatibility", () => {
  it("uses one renderer and preserves zero values, units, and status", () => {
    const props = {
      label: "Verschil",
      value: 0,
      unit: "mm",
      status: <StatusChip status="ok">Binnen marge</StatusChip>,
    };
    const html = renderToStaticMarkup(<ResultTile {...props} />);
    expect(html).toBe(renderToStaticMarkup(<MeasurementTile {...props} />));
    expect(html).toContain(">0</span>");
    expect(html).toContain("Binnen marge");
    expect(html).toContain("<dl>");
    expect(html).toContain("font-mono");
  });
  it.each([null, undefined])("preserves suppression of missing values (%s)", (value) => {
    expect(renderToStaticMarkup(<MeasurementTile label="Zadel" value={value} />)).toBe("");
    expect(renderToStaticMarkup(<ResultTile label="Zadel" value={value} />)).toBe("");
  });
});

describe("StatRow", () => {
  it("keeps definition semantics and leaves descriptive text in the body font", () => {
    const numeric = renderToStaticMarkup(
      <dl>
        <StatRow label="Ritten" value={0} />
      </dl>,
    );
    expect(numeric).toContain("<dt");
    expect(numeric).toContain("<dd");
    expect(numeric).toContain("font-mono");
    expect(renderToStaticMarkup(<StatRow label="Ervaring" value="Beginnende fietser" />)).not.toContain("font-mono");
    expect(renderToStaticMarkup(<StatRow label="Ritten" value={null} />)).toBe("");
  });
});

describe("StatusChip", () => {
  it.each(["ok", "warn", "deviation"] as const)("renders readable %s status with optional live semantics", (status) => {
    const html = renderToStaticMarkup(
      <StatusChip status={status} role="status">
        Controleer je afstelling
      </StatusChip>,
    );
    expect(html).toContain(`data-status="${status}"`);
    expect(html).toContain('role="status"');
    expect(html).toContain("Controleer je afstelling");
    expect(html).toContain("text-[var(--bbf-inkt)]");
  });
});

describe("Gauge", () => {
  it("connects its label and meter range, with a unit-bearing accessible value", () => {
    const html = renderToStaticMarkup(
      <Gauge label="Bandenspanning" value={4.5} min={1} max={8} unit="bar" valueText="4,5 bar" />,
    );
    expect(html).toContain('role="meter"');
    const labelId = html.match(/<p id="([^"]+)"/)?.[1];
    expect(labelId).toBeTruthy();
    expect(html).toContain(`aria-labelledby="${labelId}"`);
    expect(html).toContain('aria-valuemin="1"');
    expect(html).toContain('aria-valuemax="8"');
    expect(html).toContain('aria-valuenow="4.5"');
    expect(html).toContain('aria-valuetext="4,5 bar"');
    expect(html).toContain('stroke-dasharray="50 100"');
  });
  it.each([
    [-5, 0],
    [150, 100],
  ])("clamps %s to %s in both accessible and visual output", (value, bounded) => {
    const html = renderToStaticMarkup(<Gauge label="Meter" value={value} />);
    expect(html).toContain(`aria-valuenow="${bounded}"`);
    if (bounded === 0) expect(html).not.toContain("stroke-dasharray");
    else expect(html).toContain('stroke-dasharray="100 100"');
  });
  it("rejects invalid ranges instead of emitting invalid ARIA or SVG", () => {
    expect(() => renderToStaticMarkup(<Gauge label="Meter" value={1} min={2} max={2} />)).toThrow(RangeError);
    expect(() => renderToStaticMarkup(<Gauge label="Meter" value={NaN} />)).toThrow(RangeError);
  });
});

describe("SizeScale", () => {
  it("marks recommendation and borderline in text, without pretending to be an input", () => {
    const html = renderToStaticMarkup(
      <SizeScale
        label="Cranklengte"
        options={[{ value: 165 }, { value: 170 }, { value: 172.5, label: "172,5" }]}
        recommended={170}
        borderline={[172.5]}
        unit="mm"
      />,
    );
    expect(html).toContain('aria-label="Cranklengte"');
    expect(html.match(/aria-current="true"/g)).toHaveLength(1);
    expect(html).toContain("advies");
    expect(html).toContain("meetgrens");
    expect(html).toContain("172,5");
    expect(html).not.toContain("<button");
    expect(html).not.toContain("tabindex");
  });
  it("uses theme-aware size surfaces and lets narrow rows wrap without fixed minimum widths", () => {
    const html = renderToStaticMarkup(
      <SizeScale
        label="Maten"
        options={[165, 170, 172.5, 175].map((value) => ({ value }))}
        recommended={170}
        borderline={[172.5]}
      />,
    );
    expect(html.match(/bg-card/g)).toHaveLength(3);
    expect(html.match(/bg-\[var\(--bbf-inkt\)\]/g)).toHaveLength(1);
    expect(html).toContain("border-primary");
    expect(html).toContain("dark:bg-primary dark:text-primary-foreground");
    expect(html).toContain("flex-wrap");
    expect(html).toContain("min-w-0");
    expect(html).not.toContain("min-w-16");
  });
});

describe("AdjustOrder", () => {
  it("renders a named section and ordered, caller-supplied advice", () => {
    const html = renderToStaticMarkup(
      <AdjustOrder
        steps={[
          { title: "Controleer je meting." },
          { title: "Verstel je zadel.", description: "Rij er twee ritten mee." },
        ]}
      />,
    );
    expect(html).toContain("Pas in deze volgorde aan");
    expect(html).toContain("<ol");
    expect(html.match(/<li /g)).toHaveLength(2);
    expect(html.indexOf("Controleer je meting.")).toBeLessThan(html.indexOf("Verstel je zadel."));
    expect(html).toContain("Rij er twee ritten mee.");
    const headingId = html.match(/<h2 id="([^"]+)"/)?.[1];
    expect(html).toContain(`aria-labelledby="${headingId}"`);
  });
});
