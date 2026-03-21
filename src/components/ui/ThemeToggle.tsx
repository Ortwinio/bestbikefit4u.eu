"use client";

import { RadioGroup } from "@base-ui/react/radio-group";
import { Radio } from "@base-ui/react/radio";
import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/providers/ThemeProvider";
import { cn } from "@/utils/cn";

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
    <RadioGroup<ThemePreference>
      aria-label="Theme selection"
      value={theme}
      onValueChange={(nextTheme) => {
        setTheme(nextTheme);
      }}
      className="inline-flex rounded-[var(--radius-md)] border border-[color:var(--border)] bg-[color:var(--secondary)] p-1"
    >
      {themeOptions.map((option) => {
        const Icon = option.icon;
        const label = labels[option.labelKey];

        return (
          <Radio.Root
            key={option.value}
            value={option.value}
            className={cn(
              "inline-flex items-center gap-2 whitespace-nowrap rounded-[calc(var(--radius-md)-0.2rem)] px-3 py-2 text-sm font-medium",
              "transition-[color,background-color,box-shadow,transform] duration-150 ease-smooth motion-reduce:transition-none",
              "cursor-pointer focus-ring",
              "text-[color:var(--muted-foreground)] hover:text-[color:var(--foreground)]",
              "data-checked:bg-[color:var(--card)] data-checked:text-[color:var(--foreground)] data-checked:shadow-sm"
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span>{label}</span>
          </Radio.Root>
        );
      })}
    </RadioGroup>
  );
}
