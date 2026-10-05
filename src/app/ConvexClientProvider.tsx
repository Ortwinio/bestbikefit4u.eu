"use client";

import { ConvexAuthNextjsProvider } from "@convex-dev/auth/nextjs";
import { ConvexReactClient } from "convex/react";
import { ReactNode } from "react";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { LoginLocaleBackfill } from "@/components/providers/LoginLocaleBackfill";
import { CalculatorDataProvider } from "@/lib/calculatorData/CalculatorDataProvider";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  return (
    <ConvexAuthNextjsProvider client={convex}>
      <LoginLocaleBackfill />
      <ThemeProvider><CalculatorDataProvider>{children}</CalculatorDataProvider></ThemeProvider>
    </ConvexAuthNextjsProvider>
  );
}

export { convex };
