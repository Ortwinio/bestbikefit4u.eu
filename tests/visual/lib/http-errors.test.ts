import { expect, it, vi } from "vitest";
import { sendFixtureError } from "./http-errors.mjs";

it("logs diagnostic detail only to stderr and returns generic HTTP bodies", () => {
  const stderr = vi.spyOn(console, "error").mockImplementation(() => {});
  try {
    const error = new Error("private path /secret/token");
    const response = { statusCode: 200, setHeader: vi.fn(), end: vi.fn() };
    sendFixtureError(response, error);
    expect(stderr).toHaveBeenCalledWith(error);
    expect(response.statusCode).toBe(500);
    expect(response.end).toHaveBeenLastCalledWith("Internal server error");
    sendFixtureError(response, Object.assign(error, { code: "ENOENT" }));
    expect(response.statusCode).toBe(404);
    expect(response.end).toHaveBeenLastCalledWith("Not found");
  } finally { stderr.mockRestore(); }
});
