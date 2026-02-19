type RenderPdfFromHtmlParams = {
  html: string;
};

export async function renderPdfFromHtml(
  params: RenderPdfFromHtmlParams
): Promise<Uint8Array> {
  const { html } = params;

  const { chromium } = await import("playwright");

  const browser = await chromium.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle" });
    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "18mm", right: "18mm", bottom: "16mm", left: "18mm" },
    });

    return new Uint8Array(pdf);
  } finally {
    await browser.close();
  }
}
