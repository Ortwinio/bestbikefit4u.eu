import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchMarktplaats, readLimitedBytes, validateMarktplaatsUrl } from "../marktplaatsFetch";

afterEach(() => vi.unstubAllGlobals());

describe("Marktplaats remote requests", () => {
  it.each([
    "http://www.marktplaats.nl/ad", "https://marktplaats.nl.attacker.test/ad",
    "https://127.0.0.1/ad", "https://user:password@marktplaats.nl/ad",
    "https://www.marktplaats.nl:8443/ad",
  ])("blocks unsupported destinations: %s", (url) => {
    expect(() => validateMarktplaatsUrl(url)).toThrow();
  });

  it("never requests a redirect to a private address", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, {
      status: 302, headers: { location: "http://169.254.169.254/latest/meta-data" },
    }));
    vi.stubGlobal("fetch", fetchMock);
    await expect(fetchMarktplaats("https://www.marktplaats.nl/ad")).rejects.toThrow();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][1]).toMatchObject({ redirect: "manual" });
  });

  it("follows relative and approved CDN redirects", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(null, { status: 301, headers: { location: "/new" } }))
      .mockResolvedValueOnce(new Response(null, { status: 302, headers: { location: "https://images.marktplaats.com/photo.jpg" } }))
      .mockResolvedValueOnce(new Response("photo"));
    vi.stubGlobal("fetch", fetchMock);
    const response = await fetchMarktplaats("https://www.marktplaats.nl/ad");
    expect(await response.text()).toBe("photo");
    expect(String(fetchMock.mock.calls[1][0])).toBe("https://www.marktplaats.nl/new");
    expect(String(fetchMock.mock.calls[2][0])).toBe("https://images.marktplaats.com/photo.jpg");
  });

  it("caps redirect loops", async () => {
    const fetchMock = vi.fn().mockImplementation(async () => new Response(null, {
      status: 302, headers: { location: "/again" },
    }));
    vi.stubGlobal("fetch", fetchMock);
    await expect(fetchMarktplaats("https://www.marktplaats.nl/ad")).rejects.toThrow();
    expect(fetchMock).toHaveBeenCalledTimes(5);
  });

  it("stops an oversized streamed body without trusting its claimed length", async () => {
    const cancel = vi.fn();
    let chunk = 0;
    const stream = new ReadableStream({
      pull(controller) { controller.enqueue(new Uint8Array(4).fill(++chunk)); },
      cancel,
    });
    const response = new Response(stream, { headers: { "content-length": "1" } });
    await expect(readLimitedBytes(response, 6)).rejects.toThrow("too large");
    expect(cancel).toHaveBeenCalled();
  });

  it("preserves allowed bytes", async () => {
    const bytes = await readLimitedBytes(new Response("image"), 10);
    expect(new TextDecoder().decode(bytes)).toBe("image");
  });
});
