import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { GuideBodyMarkdown } from "./GuideBodyMarkdown";

describe("guide markdown link localization", () => {
  it("uses the Dutch title for a known guide without changing its destination", () => {
    const html = renderToStaticMarkup(<GuideBodyMarkdown locale="nl"
      content="[Saddle Height Guide](/nl/guides/saddle-height-guide#start)" />);
    expect(html).toContain("Zadelhoogte instellen");
    expect(html).toContain('href="/nl/guides/saddle-height-guide#start"');
    expect(html).not.toContain("Saddle Height Guide");
  });

  it("preserves English, external and non-guide editorial link labels", () => {
    const english = renderToStaticMarkup(<GuideBodyMarkdown locale="en"
      content="[Saddle Height Guide](/en/guides/saddle-height-guide)" />);
    expect(english).toContain("Saddle Height Guide");
    const dutch = renderToStaticMarkup(<GuideBodyMarkdown locale="nl"
      content="[Bron](https://example.com) en [Begin hier](/nl/login)" />);
    expect(dutch).toContain("Bron");
    expect(dutch).toContain("Begin hier");
  });
});
