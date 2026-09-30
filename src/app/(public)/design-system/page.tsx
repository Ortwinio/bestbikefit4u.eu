import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DesignSystemPlayground } from "./Playground";

export const metadata: Metadata = {
  title: "Componenten | BestBikeFit4U",
  robots: { index: false, follow: false },
};

export default function DesignSystemPage() {
  if (
    process.env.VERCEL_ENV === "production" ||
    (process.env.NODE_ENV === "production" && process.env.DESIGN_SYSTEM_PREVIEW !== "true")
  ) {
    notFound();
  }
  return <DesignSystemPlayground />;
}
