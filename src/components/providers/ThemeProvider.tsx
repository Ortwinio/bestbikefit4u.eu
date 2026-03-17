"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

type ThemePreference = "light" | "dark" | "system";

type ThemeContextValue = {
  theme: ThemePreference;
  resolvedTheme: "light" | "dark";
  setTheme: (theme: ThemePreference) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function resolveTheme(theme: ThemePreference) {
  if (
    theme === "dark" ||
    (theme === "system" &&
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches)
  ) {
    return "dark" as const;
  }
  return "light" as const;
}

function readStoredTheme(): ThemePreference {
  if (typeof window === "undefined") {
    return "system";
  }

  const theme = window.localStorage.getItem("theme");
  if (theme === "light" || theme === "dark" || theme === "system") {
    return theme;
  }

  return "system";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const user = useQuery(api.users.queries.getCurrentUser);
  const updateProfile = useMutation(api.users.mutations.updateProfile);
  const [theme, setThemeState] = useState<ThemePreference>(readStoredTheme);
  const resolvedTheme = useMemo(() => resolveTheme(theme), [theme]);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", resolvedTheme === "dark");

    if (theme === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const syncTheme = () => {
        root.classList.toggle("dark", mediaQuery.matches);
      };
      mediaQuery.addEventListener("change", syncTheme);
      return () => mediaQuery.removeEventListener("change", syncTheme);
    }

    return undefined;
  }, [resolvedTheme, theme]);

  const setTheme = (nextTheme: ThemePreference) => {
    setThemeState(nextTheme);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("theme", nextTheme);
      document.documentElement.classList.toggle(
        "dark",
        resolveTheme(nextTheme) === "dark"
      );
    }
    if (user) {
      void updateProfile({ theme_preference: nextTheme });
    }
  };

  useEffect(() => {
    if (user?.theme_preference && user.theme_preference !== theme) {
      if (typeof window !== "undefined") {
        window.localStorage.setItem("theme", user.theme_preference);
      }
    }
  }, [theme, user?.theme_preference]);

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}
