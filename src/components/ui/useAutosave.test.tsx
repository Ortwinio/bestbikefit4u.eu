// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, renderHook, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useAutosave } from "./useAutosave";
import { AutosaveField, AutosaveStatus } from "./AutosaveStatus";
import { autosaveMessages } from "@/i18n/account/autosave";

beforeEach(() => vi.useFakeTimers());
afterEach(() => { cleanup(); vi.useRealTimers(); });
const advance = (ms: number) => act(async () => { await vi.advanceTimersByTimeAsync(ms); });

function deferred() {
  let resolve!: () => void;
  const promise = new Promise<void>((done) => { resolve = done; });
  return { promise, resolve };
}

describe("autosave groups", () => {
  it("debounces text, skips initial/unchanged writes and fades saved after two seconds", async () => {
    const save = vi.fn().mockResolvedValue(undefined);
    const { result, rerender } = renderHook(({ value }) => useAutosave({ value, onSave: save }), {
      initialProps: { value: "old" },
    });
    await advance(900);
    expect(save).not.toHaveBeenCalled();
    rerender({ value: "new" });
    await advance(799);
    expect(save).not.toHaveBeenCalled();
    await advance(1);
    expect(save).toHaveBeenCalledExactlyOnceWith("new");
    expect(result.current.state).toBe("saved");
    rerender({ value: "new" });
    await advance(2000);
    expect(result.current.state).toBe("idle");
    expect(save).toHaveBeenCalledTimes(1);
  });

  it("serializes requests and writes only the latest queued value", async () => {
    const first = deferred();
    const save = vi.fn().mockReturnValueOnce(first.promise).mockResolvedValue(undefined);
    const { rerender } = renderHook(({ value }) => useAutosave({ value, onSave: save, debounceMs: 500 }), {
      initialProps: { value: 0 },
    });
    rerender({ value: 1 });
    await advance(500);
    rerender({ value: 2 });
    rerender({ value: 3 });
    await advance(1000);
    expect(save).toHaveBeenCalledTimes(1);
    await act(async () => { first.resolve(); });
    expect(save.mock.calls.map(([value]) => value)).toEqual([1, 3]);
  });

  it("retains failed values, exposes retry and does not retry unchanged rerenders", async () => {
    const save = vi.fn().mockRejectedValueOnce(new Error("offline")).mockResolvedValue(undefined);
    const { result, rerender } = renderHook(({ value }) => useAutosave({ value, onSave: save }), {
      initialProps: { value: 0 },
    });
    rerender({ value: 7 });
    await advance(800);
    expect(result.current.state).toBe("error");
    rerender({ value: 7 });
    await advance(2000);
    expect(save).toHaveBeenCalledTimes(1);
    await act(async () => { await result.current.retry(); });
    expect(save.mock.calls.map(([value]) => value)).toEqual([7, 7]);
    expect(result.current.state).toBe("saved");
  });

  it("blocks invalid input and saves a later correction", async () => {
    const save = vi.fn().mockResolvedValue(undefined);
    const { result, rerender } = renderHook(({ value }) => useAutosave({
      value, onSave: save, validate: (next) => next < 0 ? "Too low" : null,
    }), { initialProps: { value: 1 } });
    rerender({ value: -1 });
    await advance(1000);
    expect(save).not.toHaveBeenCalled();
    expect(result.current.error).toBe("Too low");
    rerender({ value: 2 });
    await advance(800);
    expect(save).toHaveBeenCalledExactlyOnceWith(2);
  });

  it("flushes pending and queued values through unmount", async () => {
    const first = deferred();
    const save = vi.fn().mockReturnValueOnce(first.promise).mockResolvedValue(undefined);
    const { rerender, unmount } = renderHook(({ value }) => useAutosave({ value, onSave: save }), {
      initialProps: { value: 0 },
    });
    rerender({ value: 1 });
    await advance(800);
    rerender({ value: 2 });
    unmount();
    await act(async () => { first.resolve(); });
    expect(save.mock.calls.map(([value]) => value)).toEqual([1, 2]);
  });

  it("flushes on blur/visibility and does not write hydration values", async () => {
    const save = vi.fn().mockResolvedValue(undefined);
    const { result, rerender } = renderHook(({ value, enabled }) => useAutosave({ value, enabled, onSave: save }), {
      initialProps: { value: "", enabled: false },
    });
    rerender({ value: "loaded", enabled: true });
    await advance(900);
    expect(save).not.toHaveBeenCalled();
    rerender({ value: "typed", enabled: true });
    await act(async () => { await result.current.flush(); });
    expect(save).toHaveBeenCalledExactlyOnceWith("typed");
  });
});

it.each(["nl", "en"] as const)("announces localized %s status and retry", (locale) => {
  const messages = autosaveMessages[locale];
  const retry = vi.fn();
  const { rerender } = render(<AutosaveStatus state="saving" messages={messages} onRetry={retry} />);
  expect(screen.getByRole("status").textContent).toBe(messages.saving);
  rerender(<AutosaveStatus state="error" messages={messages} onRetry={retry} />);
  fireEvent.click(screen.getByRole("button", { name: messages.retry }));
  expect(retry).toHaveBeenCalledOnce();
  rerender(<AutosaveStatus state="saved" messages={messages} onRetry={retry} />);
  expect(screen.getByRole("status").textContent).toBe(messages.saved);
});

it("flushes pending text when hidden and on unmount before its debounce", async () => {
  const save = vi.fn().mockResolvedValue(undefined);
  const { rerender, unmount } = renderHook(({ value }) => useAutosave({ value, onSave: save }), {
    initialProps: { value: 0 },
  });
  rerender({ value: 1 });
  const visibility = vi.spyOn(document, "visibilityState", "get").mockReturnValue("hidden");
  await act(async () => { document.dispatchEvent(new Event("visibilitychange")); });
  expect(save).toHaveBeenCalledExactlyOnceWith(1);
  visibility.mockRestore();
  rerender({ value: 2 });
  unmount();
  await advance(0);
  expect(save.mock.calls.map(([value]) => value)).toEqual([1, 2]);
});

it("saves a newer edit after an older in-flight request fails", async () => {
  let reject!: (reason: Error) => void;
  const save = vi.fn().mockReturnValueOnce(new Promise((_, fail) => { reject = fail; }))
    .mockResolvedValue(undefined);
  const { rerender, result } = renderHook(({ value }) => useAutosave({ value, onSave: save }), {
    initialProps: { value: 0 },
  });
  rerender({ value: 1 });
  await advance(800);
  rerender({ value: 2 });
  await act(async () => { reject(new Error("offline")); });
  expect(save.mock.calls.map(([value]) => value)).toEqual([1, 2]);
  expect(result.current.state).toBe("saved");
});

it("commits sliders/options on release but keeps text typing debounced", async () => {
  const flush = vi.fn();
  render(<AutosaveField flush={flush} commitOn="release">
    <input aria-label="Name" /><button>Option</button>
  </AutosaveField>);
  fireEvent.keyUp(screen.getByRole("textbox"), { key: "a" });
  await advance(0);
  expect(flush).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole("button"));
  await advance(0);
  expect(flush).toHaveBeenCalledOnce();
  fireEvent.blur(screen.getByRole("textbox"));
  expect(flush).toHaveBeenCalledTimes(2);
});
