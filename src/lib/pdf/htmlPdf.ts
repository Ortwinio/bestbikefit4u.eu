type RenderPdfFromHtmlParams = {
  html: string;
  headerTemplate?: string;
  footerTemplate?: string;
};

export type PdfRenderStrategy = "playwright" | "serverless-chromium";

export type RenderPdfFromHtmlResult = {
  pdf: Uint8Array;
  strategy: PdfRenderStrategy;
};

function isServerlessRuntime() {
  return Boolean(
    process.env.VERCEL ||
      process.env.AWS_REGION ||
      process.env.AWS_EXECUTION_ENV ||
      process.env.LAMBDA_TASK_ROOT
  );
}

async function launchBrowser() {
  if (isServerlessRuntime()) {
    const [{ chromium }, chromiumPackage] = await Promise.all([
      import("playwright-core"),
      import("@sparticuz/chromium"),
    ]);
    const chromiumBinary = chromiumPackage.default;

    return {
      strategy: "serverless-chromium" as const,
      browser: await chromium.launch({
        headless: true,
        executablePath: await chromiumBinary.executablePath(),
        args: [...chromiumBinary.args, "--hide-scrollbars", "--font-render-hinting=none"],
      }),
    };
  }

  const { chromium } = await import("playwright");
  return {
    strategy: "playwright" as const,
    browser: await chromium.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    }),
  };
}

export async function renderPdfFromHtml(
  params: RenderPdfFromHtmlParams
): Promise<RenderPdfFromHtmlResult> {
  const { html, headerTemplate, footerTemplate } = params;

  const { browser, strategy } = await launchBrowser();

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle" });
    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      displayHeaderFooter: Boolean(headerTemplate || footerTemplate),
      headerTemplate: headerTemplate ?? "<div></div>",
      footerTemplate: footerTemplate ?? "<div></div>",
      margin: {
        top: headerTemplate ? "28mm" : "18mm",
        right: "18mm",
        bottom: footerTemplate ? "24mm" : "16mm",
        left: "18mm",
      },
    });

    return {
      pdf: new Uint8Array(pdf),
      strategy,
    };
  } finally {
    await browser.close();
  }
}
