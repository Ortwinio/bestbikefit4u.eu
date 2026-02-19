import { BRAND } from "@/config/brand";

const DEFAULT_FONT_SIZE = 10;
const DEFAULT_LINE_HEIGHT = 14;
const DEFAULT_LEFT_X = 50;
const DEFAULT_TOP_Y = 760;
const DEFAULT_LINES_PER_PAGE = 46;

function escapePdfText(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");
}

function buildPageContent(lines: string[]): string {
  const commands: string[] = [
    "BT",
    `/F1 ${DEFAULT_FONT_SIZE} Tf`,
    `${DEFAULT_LINE_HEIGHT} TL`,
    `${DEFAULT_LEFT_X} ${DEFAULT_TOP_Y} Td`,
  ];

  lines.forEach((line, index) => {
    const trimmed = line.length > 110 ? `${line.slice(0, 107)}...` : line;
    commands.push(`(${escapePdfText(trimmed)}) Tj`);
    if (index < lines.length - 1) {
      commands.push("T*");
    }
  });

  commands.push("ET");
  return commands.join("\n");
}

export function paginateLines(
  lines: string[],
  linesPerPage = DEFAULT_LINES_PER_PAGE
): string[][] {
  if (lines.length === 0) {
    return [[`${BRAND.name} Report`]];
  }

  const pages: string[][] = [];
  for (let index = 0; index < lines.length; index += linesPerPage) {
    pages.push(lines.slice(index, index + linesPerPage));
  }
  return pages;
}

export function createSimplePdfFromLines(lines: string[]): Uint8Array {
  const pages = paginateLines(lines);
  return createSimplePdf(pages);
}

export function createSimplePdf(pages: string[][]): Uint8Array {
  const safePages = pages.length > 0 ? pages : [[`${BRAND.name} Report`]];
  const objects: string[] = [];

  const pageObjectNumbers: number[] = [];
  for (let index = 0; index < safePages.length; index += 1) {
    pageObjectNumbers.push(4 + index * 2);
  }

  objects.push("<< /Type /Catalog /Pages 2 0 R >>");
  objects.push(
    `<< /Type /Pages /Kids [${pageObjectNumbers
      .map((id) => `${id} 0 R`)
      .join(" ")}] /Count ${safePages.length} >>`
  );
  objects.push("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>");

  safePages.forEach((pageLines, index) => {
    const pageObjectNumber = 4 + index * 2;
    const contentObjectNumber = pageObjectNumber + 1;
    const content = buildPageContent(pageLines);
    const contentLength = new TextEncoder().encode(content).length;

    objects.push(
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 3 0 R >> >> /Contents ${contentObjectNumber} 0 R >>`
    );
    objects.push(
      `<< /Length ${contentLength} >>\nstream\n${content}\nendstream`
    );
  });

  const encoder = new TextEncoder();
  const chunks: Uint8Array[] = [];
  let offset = 0;

  const append = (value: string) => {
    const bytes = encoder.encode(value);
    chunks.push(bytes);
    offset += bytes.length;
  };

  append("%PDF-1.4\n");

  const offsets: number[] = [0];
  objects.forEach((objectBody, index) => {
    const objectNumber = index + 1;
    offsets[objectNumber] = offset;
    append(`${objectNumber} 0 obj\n${objectBody}\nendobj\n`);
  });

  const xrefOffset = offset;
  append(`xref\n0 ${objects.length + 1}\n`);
  append("0000000000 65535 f \n");
  for (let objectNumber = 1; objectNumber <= objects.length; objectNumber += 1) {
    append(`${String(offsets[objectNumber]).padStart(10, "0")} 00000 n \n`);
  }

  append(
    `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`
  );

  const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
  const result = new Uint8Array(totalLength);
  let cursor = 0;
  chunks.forEach((chunk) => {
    result.set(chunk, cursor);
    cursor += chunk.length;
  });

  return result;
}
