import { expect, it } from "vitest";
import { escapeMarkdownCell } from "./markdown.mjs";
it("escapes backslashes before Markdown cell delimiters, including already escaped pipes", () => {
  expect(escapeMarkdownCell("a|b")).toBe("a\\|b");
  expect(escapeMarkdownCell("a\\|b")).toBe("a\\\\\\|b");
  expect(escapeMarkdownCell("C:\\data\\name\nnext\r\nrow")).toBe("C:\\\\data\\\\name next row");
});
