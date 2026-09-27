import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({
  route: vi.fn(), newPage: vi.fn(), close: vi.fn(), setContent: vi.fn(), pdf: vi.fn(),
}));
vi.mock("playwright", () => ({ chromium: { launch: vi.fn(async () => ({
  newPage: mocks.newPage, close: mocks.close,
})) } }));
import { renderPdfFromHtml } from "./htmlPdf";

beforeEach(() => {
  vi.clearAllMocks();
  for (const key of ["VERCEL", "AWS_REGION", "AWS_EXECUTION_ENV", "LAMBDA_TASK_ROOT"]) vi.stubEnv(key, "");
  mocks.newPage.mockResolvedValue({ route: mocks.route, setContent: mocks.setContent, pdf: mocks.pdf });
  mocks.pdf.mockResolvedValue(new Uint8Array([1]));
});

afterEach(() => vi.unstubAllEnvs());

describe("PDF renderer network isolation", () => {
  it("disables JavaScript and rejects redirects without following them", async () => {
    await renderPdfFromHtml({ html: "<p>report</p>" });
    expect(mocks.newPage).toHaveBeenCalledWith({ javaScriptEnabled: false, serviceWorkers: "block" });
    const handleRoute = mocks.route.mock.calls[0][1];
    const fetch = vi.fn(async () => ({ status: () => 302 }));
    const abort = vi.fn();
    const fulfill = vi.fn();
    await handleRoute({
      request: () => ({ url: () => "https://dgalywyr863if.cloudfront.net/avatar.jpg", resourceType: () => "image" }),
      fetch, abort, fulfill,
    });
    expect(fetch).toHaveBeenCalledWith({ maxRedirects: 0, timeout: 5_000 });
    expect(abort).toHaveBeenCalled();
    expect(fulfill).not.toHaveBeenCalled();
    expect(mocks.close).toHaveBeenCalled();
  });

  it("never fetches private addresses", async () => {
    await renderPdfFromHtml({ html: "<p>report</p>" });
    const handleRoute = mocks.route.mock.calls[0][1];
    const fetch = vi.fn();
    const abort = vi.fn();
    await handleRoute({ request: () => ({ url: () => "http://127.0.0.1:3000/", resourceType: () => "image" }), fetch, abort });
    expect(abort).toHaveBeenCalled();
    expect(fetch).not.toHaveBeenCalled();
  });

  it("fulfills uploaded image bytes from the configured storage host", async () => {
    vi.stubEnv("NEXT_PUBLIC_CONVEX_URL", "https://ours.convex.cloud");
    await renderPdfFromHtml({ html: '<img src="https://ours.convex.cloud/api/storage/file">' });
    const response = { status: () => 200 };
    const fetch = vi.fn(async () => response);
    const fulfill = vi.fn();
    const abort = vi.fn();
    await mocks.route.mock.calls[0][1]({
      request: () => ({ url: () => "https://ours.convex.cloud/api/storage/file", resourceType: () => "image" }),
      fetch, fulfill, abort,
    });
    expect(fulfill).toHaveBeenCalledWith({ response });
    expect(abort).not.toHaveBeenCalled();
  });

  it("closes the browser if PDF generation fails", async () => {
    mocks.pdf.mockRejectedValueOnce(new Error("print failed"));
    await expect(renderPdfFromHtml({ html: "<p>report</p>" })).rejects.toThrow("print failed");
    expect(mocks.close).toHaveBeenCalled();
  });

});
