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

function readSystemTheme() {
  if (typeof window === "undefined") {
    return "light" as const;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? ("dark" as const)
    : ("light" as const);
}

function resolveTheme(theme: ThemePreference, systemTheme = readSystemTheme()) {
  return theme === "system" ? systemTheme : theme;
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

function applyThemePreference(
  nextTheme: ThemePreference,
  setThemeState: (theme: ThemePreference) => void
) {
  setThemeState(nextTheme);

  if (typeof window !== "undefined") {
    window.localStorage.setItem("theme", nextTheme);
    document.documentElement.classList.toggle(
      "dark",
      resolveTheme(nextTheme) === "dark"
    );
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const user = useQuery(api.users.queries.getCurrentUser);
  const updateProfile = useMutation(api.users.mutations.updateProfile);
  const [theme, setThemeState] = useState<ThemePreference>(readStoredTheme);
  const [systemTheme, setSystemTheme] = useState<"light" | "dark">(
    readSystemTheme
  );
  const resolvedTheme = useMemo(
    () => resolveTheme(theme, systemTheme),
    [systemTheme, theme]
  );

  useEffect(() => {
    if (theme !== "system") {
      return undefined;
    }

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const syncTheme = (event?: MediaQueryListEvent) => {
      setSystemTheme(event?.matches ?? mediaQuery.matches ? "dark" : "light");
    };

    syncTheme();
    mediaQuery.addEventListener("change", syncTheme);
    return () => mediaQuery.removeEventListener("change", syncTheme);
  }, [theme]);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", resolvedTheme === "dark");

    return undefined;
  }, [resolvedTheme]);

  const setTheme = (nextTheme: ThemePreference) => {
    applyThemePreference(nextTheme, setThemeState);
    if (user) {
      void updateProfile({ theme_preference: nextTheme });
    }
  };

  useEffect(() => {
    if (user?.theme_preference && user.theme_preference !== theme) {
      applyThemePreference(user.theme_preference, setThemeState);
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
