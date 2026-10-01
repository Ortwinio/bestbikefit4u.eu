/** Markdown table text: escape existing escape characters before cell delimiters. */
export function escapeMarkdownCell(value) {
  return String(value ?? "").replace(/\\/g, "\\\\").replace(/\|/g, "\\|").replace(/\r?\n/g, " ");
}
