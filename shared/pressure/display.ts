/** One presentation for calculator, account and printed report. Never infers a safe tyre limit. */
export interface PressureDisplayData {
  frontBar: number;
  rearBar: number;
  frontPsi?: number;
  rearPsi?: number;
  locale: "nl" | "en";
  compact?: boolean;
  /** Display scale, not a pressure recommendation or safety limit. */
  maxBar?: number;
  /** Only pass the actual tyre/rim manufacturer's minimum and maximum together. */
  safeRange?: { minBar: number; maxBar: number };
}

const labels = {
  nl: { front: "Voorband", rear: "Achterband", scale: "Schaal", safe: "Veilige marge" },
  en: { front: "Front tyre", rear: "Rear tyre", scale: "Scale", safe: "Safe range" },
};

export function pressureText(bar: number, locale: "nl" | "en", psi = Math.round(bar * 14.5038)): string {
  const number = new Intl.NumberFormat(locale, { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  return `${number.format(bar)} bar · ${Math.round(psi)} psi`;
}

export function renderPressureDisplay(data: PressureDisplayData): string {
  if (![data.frontBar, data.rearBar].every(value => Number.isFinite(value) && value > 0)) return "";
  const copy = labels[data.locale];
  const number = new Intl.NumberFormat(data.locale, { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  const tick = new Intl.NumberFormat(data.locale, { maximumFractionDigits: 1 });
  const maximum = data.maxBar && Number.isFinite(data.maxBar) && data.maxBar > 0
    ? Math.max(data.maxBar, data.frontBar, data.rearBar) : Math.max(8, Math.ceil(Math.max(data.frontBar, data.rearBar)));
  const safe = data.safeRange && Number.isFinite(data.safeRange.minBar) && Number.isFinite(data.safeRange.maxBar)
    && data.safeRange.minBar > 0 && data.safeRange.maxBar >= data.safeRange.minBar ? data.safeRange : null;
  return `<div data-usability="tire-pressure" data-component="PressureDisplay" class="pressure-display${
    data.compact ? " pressure-display-compact" : ""
  }">${[
    { label: copy.front, bar: data.frontBar, psi: data.frontPsi, side: "front" },
    { label: copy.rear, bar: data.rearBar, psi: data.rearPsi, side: "rear" },
  ].map(wheel => {
    const psi = Number.isFinite(wheel.psi) && (wheel.psi ?? 0) > 0 ? wheel.psi : undefined;
    return `<section class="pressure-wheel pressure-wheel-${wheel.side}" aria-label="${wheel.label}">
      <h3>${wheel.label}</h3>
      <div class="pressure-dial"><svg viewBox="0 0 220 128" fill="none" aria-hidden="true">
        <path d="M20 118A90 90 0 0 1 200 118" class="pressure-track" />
        <path d="M20 118A90 90 0 0 1 200 118" class="pressure-arc" pathLength="100"
          stroke-dasharray="${Math.min(100, wheel.bar / maximum * 100)} 100" />
      </svg>
      <div class="pressure-number">${number.format(wheel.bar)}</div></div>
      <div class="pressure-unit">bar · ${
        psi === undefined ? Math.round(wheel.bar * 14.5038) : Math.round(psi)
      } psi</div>
      <div class="pressure-scale">${copy.scale} 0–${tick.format(maximum)} bar${safe
        ? `<br>${copy.safe} ${tick.format(safe.minBar)}–${tick.format(safe.maxBar)} bar` : ""}</div>
    </section>`;
  }).join("")}</div>`;
}

export const pressureDisplayStyles = `
.pressure-display{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;width:100%}
.pressure-wheel{display:flex;flex-direction:column;align-items:center;min-width:0;padding:20px 14px;
 container-type:inline-size;border-radius:22px;background:var(--bbf-lime);color:var(--bbf-inkt)}
.pressure-wheel-rear{background:var(--bbf-inkt);color:var(--bbf-wit)}
.pressure-wheel h3{align-self:flex-start;max-width:100%;overflow-wrap:anywhere;margin:0;font-size:clamp(11px,10cqw,14px);font-weight:700;color:inherit}
.pressure-dial{position:relative;width:100%;max-width:220px;margin-top:4px}
.pressure-wheel svg{display:block;width:100%;height:auto}
.pressure-track,.pressure-arc{stroke-width:16;stroke-linecap:round}
.pressure-track{stroke:var(--bbf-inkt);opacity:.18}
.pressure-arc{stroke:var(--bbf-inkt)}
.pressure-wheel-rear .pressure-track{stroke:var(--bbf-wit)}
.pressure-wheel-rear .pressure-arc{stroke:var(--bbf-lime)}
.pressure-number{position:absolute;bottom:0;left:0;right:0;text-align:center;
 font-family:var(--font-mono,monospace);font-size:clamp(20px,25cqw,52px);line-height:1;color:inherit}
.pressure-unit{margin-top:6px;font-size:13px;font-weight:600;color:inherit;text-align:center}
.pressure-scale{margin-top:6px;font-size:11px;text-align:center;color:inherit}
.pressure-display-compact .pressure-wheel{padding:14px 10px}
.pressure-display-compact .pressure-number{font-size:clamp(18px,25cqw,36px)}
`;
