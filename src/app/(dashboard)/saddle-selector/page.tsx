"use client";

import { useDashboardMessages } from "@/i18n/useDashboardMessages";
import { SaddleSelectorForm } from "./SaddleSelectorForm";

export default function SaddleSelectorPage() {
  const { messages } = useDashboardMessages();

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8 space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          {messages.saddleSelector.title}
        </h1>
        <p className="max-w-2xl text-muted-foreground">
          {messages.saddleSelector.subtitle}
        </p>
      </div>
      <SaddleSelectorForm />
    </div>
  );
}
