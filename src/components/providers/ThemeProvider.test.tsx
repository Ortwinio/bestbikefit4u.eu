/* @vitest-environment jsdom */

import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ThemeProvider, useTheme } from "./ThemeProvider";

const updateProfileMock = vi.fn();
let mockUser: { theme_preference?: "light" | "dark" | "system" } | null = null;
let darkMode = false;
let mediaListeners: Array<(event: MediaQueryListEvent) => void> = [];
let storage = new Map<string, string>();

vi.mock("convex/react", () => ({
  useQuery: () => mockUser,
  useMutation: () => updateProfileMock,
}));

vi.mock("../../../convex/_generated/api", () => ({
  api: {
    users: {
      queries: { getCurrentUser: "getCurrentUser" },
      mutations: { updateProfile: "updateProfile" },
    },
  },
}));

function ThemeProbe() {
  const { theme, resolvedTheme, setTheme } = useTheme();

  return (
    <div>
      <span>{`${theme}:${resolvedTheme}`}</span>
      <button type="button" onClick={() => setTheme("dark")}>
        set dark
      </button>
    </div>
  );
}

beforeEach(() => {
  mockUser = null;
  darkMode = false;
  mediaListeners = [];
  updateProfileMock.mockReset();
  document.documentElement.classList.remove("dark");
  storage = new Map<string, string>();

  Object.defineProperty(window, "localStorage", {
    writable: true,
    value: {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => {
        storage.set(key, value);
      },
      removeItem: (key: string) => {
        storage.delete(key);
      },
      clear: () => {
        storage.clear();
      },
    },
  });

  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation(() => ({
      get matches() {
        return darkMode;
      },
      media: "(prefers-color-scheme: dark)",
      addEventListener: (_: string, listener: (event: MediaQueryListEvent) => void) => {
        mediaListeners.push(listener);
      },
      removeEventListener: (_: string, listener: (event: MediaQueryListEvent) => void) => {
        mediaListeners = mediaListeners.filter((item) => item !== listener);
      },
    })),
  });
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("ThemeProvider", () => {
  it("reads a stored dark preference and applies the dark class", async () => {
    window.localStorage.setItem("theme", "dark");

    render(
      <ThemeProvider>
        <ThemeProbe />
      </ThemeProvider>
    );

    expect(screen.getByText("dark:dark")).toBeTruthy();
    await waitFor(() => {
      expect(document.documentElement.classList.contains("dark")).toBe(true);
    });
  });

  it("tracks system theme changes when preference is system", async () => {
    window.localStorage.setItem("theme", "system");

    render(
      <ThemeProvider>
        <ThemeProbe />
      </ThemeProvider>
    );

    expect(screen.getByText("system:light")).toBeTruthy();
    expect(document.documentElement.classList.contains("dark")).toBe(false);

    darkMode = true;
    mediaListeners.forEach((listener) =>
      listener({ matches: true } as MediaQueryListEvent)
    );

    await waitFor(() => {
      expect(screen.getByText("system:dark")).toBeTruthy();
    });

    await waitFor(() => {
      expect(document.documentElement.classList.contains("dark")).toBe(true);
    });
  });

  it("persists updates and syncs the authenticated user preference", async () => {
    mockUser = {};

    render(
      <ThemeProvider>
        <ThemeProbe />
      </ThemeProvider>
    );

    fireEvent.click(screen.getByText("set dark"));

    await waitFor(() => {
      expect(window.localStorage.getItem("theme")).toBe("dark");
      expect(updateProfileMock).toHaveBeenCalledWith({ theme_preference: "dark" });
      expect(document.documentElement.classList.contains("dark")).toBe(true);
    });
  });
});
