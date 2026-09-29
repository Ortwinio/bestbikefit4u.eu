"use client";

import { useDashboardMessages } from "@/i18n/useDashboardMessages";
import { toolsSaddleMessages } from "@/i18n/account/toolsSaddle";
import { SaddleSelectorForm } from "./SaddleSelectorForm";

export default function SaddleSelectorPage() {
  const { locale } = useDashboardMessages();
  const copy = toolsSaddleMessages[locale];
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-8">
      <header className="mb-8">
        <p className="text-sm font-bold uppercase tracking-[0.08em] text-primary">{copy.eyebrow}</p>
        <h1 className="mt-2 font-display text-4xl font-extrabold tracking-tight sm:text-5xl">{copy.title}</h1>
        <p className="mt-4 max-w-3xl text-muted-foreground">{copy.description}</p>
      </header>
      <SaddleSelectorForm />
    </div>
  );
}
