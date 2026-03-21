"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/providers/ThemeProvider";
import {
  SegmentedControl,
  SegmentedControlItem,
} from "./SegmentedControl";

type ThemeToggleLabels = {
  light: string;
  dark: string;
  system: string;
};

type ThemePreference = keyof ThemeToggleLabels;

const themeOptions = [
  { value: "light", labelKey: "light", icon: Sun },
  { value: "dark", labelKey: "dark", icon: Moon },
  { value: "system", labelKey: "system", icon: Monitor },
] as const;

export function ThemeToggle({ labels }: { labels: ThemeToggleLabels }) {
  const { theme, setTheme } = useTheme();

  return (
    <SegmentedControl
      aria-label="Theme selection"
      value={theme}
      onValueChange={(nextTheme) => {
        setTheme(nextTheme as ThemePreference);
      }}
      size="sm"
    >
      {themeOptions.map((option) => {
        const Icon = option.icon;
        const label = labels[option.labelKey];

        return (
          <SegmentedControlItem
            key={option.value}
            value={option.value}
            size="sm"
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span>{label}</span>
          </SegmentedControlItem>
        );
      })}
    </SegmentedControl>
  );
}
