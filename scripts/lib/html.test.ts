import { describe, expect, it } from "vitest";
import { boardMarkup, htmlText, parseHtml, withoutElements } from "./html.mjs";

describe("inert HTML parsing for local QA", () => {
  it("extracts actual text including decoded entities and literal angle brackets", () => {
    expect(htmlText('<p>One &amp; two <b>three</b> &lt;script&gt;</p>')).toBe("One & two three <script>");
    expect(htmlText('<svg><path d="M0 0"/></svg>')).toBe("");
  });
  it("handles case, whitespace end tags and script-like quoted content without executing code", () => {
    const source = '<SCRIPT data-dc-script type="text/x-dc">class Component {}</SCRIPT >'
      + '<script>throw new Error("never run")</script ><p data-x=">">Kept</p>';
    const { scripts, markup } = boardMarkup(source);
    expect(scripts).toEqual(["class Component {}"]);
    const dom = parseHtml(markup);
    expect(dom.window.document.querySelector("script")).toBeNull();
    expect(dom.window.document.querySelector("p")?.textContent).toBe("Kept");
    dom.window.close();
  });
  it("blanks ranges without joining text into new tags or normalizing mismatched markup", () => {
    const source = '<SCRIPT>ignored</SCRIPT > <STYLE>x {color:red}</STYLE ><div><b></div>';
    const result = withoutElements(source, "script, style");
    expect(result).not.toContain("ignored");
    expect(result).not.toContain("color:red");
    expect(result).toContain("<div><b></div>");
    expect(result.length).toBe(source.length);
  });
});
