"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/providers/ThemeProvider";
import { cn } from "@/utils/cn";

type ThemeToggleLabels = {
  light: string;
  dark: string;
  system: string;
};

export function ThemeToggle({ labels }: { labels: ThemeToggleLabels }) {
  const { theme, setTheme } = useTheme();

  const options = [
    { value: "light" as const, label: labels.light, icon: Sun },
    { value: "dark" as const, label: labels.dark, icon: Moon },
    { value: "system" as const, label: labels.system, icon: Monitor },
  ];

  return (
    <div className="inline-flex rounded-[var(--radius-md)] border border-[color:var(--border)] bg-[color:var(--secondary)] p-1">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => setTheme(option.value)}
          className={cn(
            "inline-flex items-center gap-2 rounded-[calc(var(--radius-md)-0.2rem)] px-3 py-2 text-sm font-medium transition-colors",
            theme === option.value
              ? "bg-[color:var(--card)] text-[color:var(--foreground)] shadow-sm"
              : "text-[color:var(--muted-foreground)] hover:text-[color:var(--foreground)]"
          )}
        >
          <option.icon className="h-4 w-4" />
          {option.label}
        </button>
      ))}
    </div>
  );
}
