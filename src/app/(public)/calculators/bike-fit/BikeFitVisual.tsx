import type { FitOutputs } from "../../../../../convex/lib/fitAlgorithm/types";
import type { BikeFitMessages } from "@/i18n/calculators/bikeFit";

export function BikeFitVisual({ fit, copy }: { fit: FitOutputs; copy: BikeFitMessages }) {
  // Display geometry only: measurements come from the adapter, not these pixel coordinates.
  const saddleX = 222 - fit.saddleSetbackMm * 0.3;
  const saddleY = 174 - ((fit.saddleHeightMm - 473) / (956 - 473)) * 84;
  const barX = saddleX + fit.saddleToBarReachMm * 0.42;
  const barY = saddleY + fit.barDropMm * 0.55;
  const reachY = Math.max(45, Math.min(saddleY, barY) - 28);
  const dropLabelX = Math.min(486, barX + 24);
  const dropArrow = fit.barDropMm < 0 ? "↑" : fit.barDropMm > 0 ? "↓" : "↔";
  return (
    <section className="rounded-[2rem] bg-[var(--bbf-lime)] p-5 text-[var(--bbf-inkt)] sm:p-7">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-display text-2xl font-bold text-[var(--bbf-inkt)]">
          {copy.resultTitle}
        </h2>
        <p className="text-sm">{copy.visualHint}</p>
      </div>
      <svg
        viewBox="0 0 600 380"
        role="img"
        aria-label={copy.visualAlt}
        className="mt-3 h-auto w-full"
        fill="none"
        data-drop={fit.barDropMm}
      >
        <g stroke="var(--bbf-inkt)" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 347 H580" strokeWidth="2" opacity="0.2" />
          <circle cx="130" cy="264" r="82" strokeWidth="7" />
          <circle cx="460" cy="264" r="82" strokeWidth="7" />
          <path
            d={`M130 264 L222 180 L250 287 Z M222 180 L405 166 L250 287 M405 166 L460 264`}
            strokeWidth="7"
          />
          <path d={`M250 287 L${saddleX} ${saddleY}`} strokeWidth="7" />
          <path d={`M${saddleX - 22} ${saddleY} L${saddleX + 36} ${saddleY - 3}`} strokeWidth="9" />
          <path d={`M405 166 L${barX - 15} ${barY} H${barX + 24} V${barY + 20}`} strokeWidth="7" />
          <circle cx="250" cy="287" r="13" strokeWidth="5" />
          <path d="M250 287 L268 320 H290" strokeWidth="6" />
          <path d={`M${saddleX} ${reachY} H${barX}`} strokeWidth="2" strokeDasharray="5 6" />
        </g>
        <g stroke="var(--bbf-petrol)" strokeWidth="3">
          <path d={`M235 287 L${saddleX - 15} ${saddleY}`} strokeDasharray="6 6" />
          <circle cx="235" cy="287" r="4" fill="var(--bbf-petrol)" />
          <circle cx={saddleX - 15} cy={saddleY} r="4" fill="var(--bbf-petrol)" />
          <line x1={barX + 16} y1={saddleY} x2={barX + 16} y2={barY} data-drop-marker="true" />
        </g>
        <g className="font-mono" fontSize="22" textAnchor="middle" aria-hidden="true">
          <rect x="92" y="196" width="114" height="36" rx="10" fill="var(--bbf-petrol)" />
          <text x="149" y="222" fill="var(--bbf-wit)">
            {fit.saddleHeightMm}
            <tspan fontSize="15"> mm</tspan>
          </text>
          <rect
            x={(saddleX + barX) / 2 - 57}
            y={reachY - 38}
            width="114"
            height="36"
            rx="10"
            fill="var(--bbf-inkt)"
          />
          <text x={(saddleX + barX) / 2} y={reachY - 12} fill="var(--bbf-lime)">
            {fit.saddleToBarReachMm}
            <tspan fontSize="15"> mm</tspan>
          </text>
          <rect
            x={dropLabelX}
            y={Math.max(40, (saddleY + barY) / 2 - 17)}
            width="104"
            height="36"
            rx="10"
            fill="var(--bbf-wit)"
          />
          <text
            x={dropLabelX + 52}
            y={Math.max(40, (saddleY + barY) / 2 - 17) + 25}
            fill="var(--bbf-inkt)"
          >
            {dropArrow} {Math.abs(fit.barDropMm)}
            <tspan fontSize="13"> mm</tspan>
          </text>
        </g>
      </svg>
    </section>
  );
}
