"use client";

import { useState } from "react";
import { Button, Card, CardContent, Slider } from "@/components/ui";
import { useDashboardMessages } from "@/i18n/useDashboardMessages";
import { getBikesPreviewCopy } from "@/i18n/account/bikesPreview";

type Fit = { saddleHeightMm: number; handlebarDropMm: number; handlebarReachMm: number };

export function BikeFitPreview({ saddleHeightMm, target }: { saddleHeightMm?: number; target: Fit }) {
  const { locale } = useDashboardMessages();
  const copy = getBikesPreviewCopy(locale);
  const initial = { ...target, saddleHeightMm: saddleHeightMm ?? target.saddleHeightMm };
  const [preview, setPreview] = useState(initial);
  const fields = [
    { key: "saddleHeightMm", label: copy.saddle, min: 400, max: 1000 },
    { key: "handlebarDropMm", label: copy.drop, min: -100, max: 250 },
    { key: "handlebarReachMm", label: copy.reach, min: 250, max: 800 },
  ] as const;
  const saddleY = (value: number) => 190 - (value - 400) * 0.14;
  const barX = (value: number) => 160 + (value - 250) * 0.25;
  const targetY = saddleY(target.saddleHeightMm);
  const previewY = saddleY(preview.saddleHeightMm);
  return (
    <Card variant="bordered">
      <CardContent className="grid gap-6 p-6 lg:grid-cols-2">
        <div className="space-y-4">
          <h2 className="font-display text-2xl font-bold">{copy.title}</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">{copy.description}</p>
          <svg
            viewBox="0 0 400 280"
            role="img"
            aria-label={copy.diagram}
            className="w-full rounded-2xl bg-muted/40"
          >
            <g fill="none" stroke="currentColor" strokeWidth="3" className="text-muted-foreground">
              <circle cx="85" cy="200" r="55" />
              <circle cx="315" cy="200" r="55" />
              <path d="M85 200 145 110 195 200 85 200M145 110 275 110 195 200M275 110 315 200" />
            </g>
            <g fill="none" strokeWidth="5" className="text-primary" stroke="currentColor">
              <path d={`M195 200 145 ${targetY}m-22 0h44`} />
              <path
                d={`M275 110 ${barX(target.handlebarReachMm)} ${targetY + target.handlebarDropMm * 0.2}h25`}
              />
            </g>
            <g
              fill="none"
              strokeWidth="3"
              strokeDasharray="6 4"
              className="text-foreground"
              stroke="currentColor"
            >
              <path d={`M195 200 145 ${previewY}m-22 0h44`} />
              <path
                d={`M275 110 ${barX(preview.handlebarReachMm)} ${previewY + preview.handlebarDropMm * 0.2}h25`}
              />
            </g>
          </svg>
          <p className="text-sm text-muted-foreground">{copy.legend}</p>
          <Button variant="outline" onClick={() => setPreview(initial)}>
            {copy.reset}
          </Button>
        </div>
        <div className="space-y-5">
          {fields.map(({ key, label, min, max }) => (
            <div key={key} className="space-y-2 rounded-2xl border border-border p-4">
              <Slider
                label={label}
                min={Math.min(min, preview[key], target[key])}
                max={Math.max(max, preview[key], target[key])}
                step={1}
                unit="mm"
                value={preview[key]}
                onChange={(value) => setPreview((current) => ({ ...current, [key]: value }))}
              />
              <p className="text-sm text-muted-foreground">
                {copy.target}: <span className="font-mono text-foreground">{target[key]} mm</span>
                {" · "}
                {copy.difference}:{" "}
                <span className="font-mono text-foreground">
                  {Math.round((preview[key] - target[key]) * 10) / 10} mm
                </span>
              </p>
              <p className="text-xs text-muted-foreground">
                {copy.saved}:{" "}
                {key === "saddleHeightMm" && saddleHeightMm != null ? `${saddleHeightMm} mm` : copy.unknown}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
