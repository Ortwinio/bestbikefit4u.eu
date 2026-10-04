import { EventEmitter } from "node:events";
import { readFileSync } from "node:fs";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const harness = vi.hoisted(() => ({
  readFile: vi.fn(), writeFile: vi.fn(), mkdir: vi.fn(), readdir: vi.fn(),
  copyFile: vi.fn(), mkdtemp: vi.fn(), spawn: vi.fn(), browser: vi.fn(),
}));
vi.mock("node:fs/promises", () => harness);
vi.mock("node:child_process", () => ({ spawn: harness.spawn }));
vi.mock("./browser.mjs", () => ({ findPerformanceBrowser: harness.browser }));

const config = JSON.parse(readFileSync(new URL("../../lighthouserc.json", import.meta.url), "utf8"));
const originalArgv = process.argv;
const originalExitCode = process.exitCode;
const work = "/tmp/performance-test-work";
const chromePath = "/tmp/performance-test-chrome";

function mockCommands(codes: number[]) {
  harness.spawn.mockImplementation(() => {
    const child = Object.assign(new EventEmitter(), {
      stdout: new EventEmitter(), stderr: new EventEmitter(),
    });
    queueMicrotask(() => {
      child.stdout.emit("data", "phase output\n");
      child.stderr.emit("data", "phase diagnostic\n");
      child.emit("close", codes.shift());
    });
    return child;
  });
}

beforeEach(() => {
  vi.resetModules();
  vi.resetAllMocks();
  process.argv = [process.execPath, "/tmp/run.mjs", "--base=https://localhost:3197", "--label=test"];
  process.exitCode = 0;
  harness.readFile.mockResolvedValue(JSON.stringify(config));
  harness.mkdtemp.mockResolvedValue(work);
  harness.readdir.mockResolvedValue([]);
  harness.browser.mockResolvedValue(chromePath);
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ status: 200 }));
  vi.spyOn(process.stdout, "write").mockReturnValue(true);
  vi.spyOn(console, "log").mockImplementation(() => {});
});

afterEach(() => {
  process.argv = originalArgv;
  process.exitCode = originalExitCode;
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("on-demand Lighthouse runner", () => {
  it("runs pinned collection and assertions with the existing settings and logs", async () => {
    mockCommands([0, 0]);
    await import("./run.mjs");
    expect(harness.spawn).toHaveBeenCalledTimes(2);
    for (const [index, phase] of ["collect", "assert"].entries()) {
      expect(harness.spawn).toHaveBeenNthCalledWith(index + 1, "npx",
        ["-y", "@lhci/cli@0.15.1", phase, `--config=${work}/config.json`], {
          cwd: work, env: { ...process.env, CHROME_PATH: chromePath },
          stdio: ["ignore", "pipe", "pipe"],
        });
      expect(harness.writeFile).toHaveBeenCalledWith(expect.stringContaining(`/${phase}.log`),
        "phase output\nphase diagnostic\n");
    }
    const writtenConfig = JSON.parse(harness.writeFile.mock.calls.find(([path]) => path === `${work}/config.json`)![1]);
    expect(writtenConfig.ci.assert).toEqual(config.ci.assert);
    expect(writtenConfig.ci.collect).toEqual({ ...config.ci.collect,
      url: config.ci.collect.url.map((url: string) => new URL(new URL(url).pathname, "https://localhost:3197").href),
      settings: { ...config.ci.collect.settings,
        chromeFlags: `${config.ci.collect.settings.chromeFlags} --ignore-certificate-errors` },
    });
    expect(fetch).toHaveBeenCalledTimes(config.ci.collect.url.length);
    expect(process.exitCode).toBe(1);
  });

  it("skips assertions and preserves the collection failure exit code", async () => {
    mockCommands([7]);
    await import("./run.mjs");
    expect(harness.spawn).toHaveBeenCalledTimes(1);
    expect(process.exitCode).toBe(7);
    const summary = JSON.parse(harness.writeFile.mock.calls.find(([path]) => path.endsWith("/summary.json"))![1]);
    expect(summary.collectCode).toBe(7);
    expect(summary.assertCode).toBeNull();
  });

  it("preserves assertion failure exit codes", async () => {
    mockCommands([0, 9]);
    await import("./run.mjs");
    expect(harness.spawn).toHaveBeenCalledTimes(2);
    expect(process.exitCode).toBe(9);
  });

  it("rejects failed preflights before invoking npx", async () => {
    vi.mocked(fetch).mockResolvedValue({ status: 503 } as Response);
    await expect(import("./run.mjs")).rejects.toThrow("HTTP 503");
    expect(harness.spawn).not.toHaveBeenCalled();
  });
});
