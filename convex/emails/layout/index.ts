import { BRAND } from "../../lib/brand";
import { emailCopy, type EmailLocale } from "../i18n";

const colors = {
  lime: "#CFF26A", petrol: "#0A7263", mint: "#E1F2EE", ink: "#0F2420",
  body: "#3B4F4A", muted: "#4A5F5A", border: "#DCE6E1", paper: "#F5F8F3",
};
const font = "Figtree, Helvetica, Arial, sans-serif";
const displayFont = "'Bricolage Grotesque', Arial, sans-serif";
const mono = "'DM Mono', 'Courier New', monospace";
const table = 'role="presentation" border="0" cellpadding="0" cellspacing="0"';

export function escapeHtml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

/** Only absolute HTTP(S) links may enter email href attributes. */
export function safeHref(value: string): string {
  const url = new URL(value);
  if (url.protocol !== "https:" && url.protocol !== "http:") {
    throw new Error("Email links must use HTTP or HTTPS");
  }
  return escapeHtml(url.href);
}

function asset(name: string): string {
  if (!/^[a-z0-9-]+\.png$/.test(name)) throw new Error("Invalid email asset name");
  return `${BRAND.siteUrl}/email/${name}`;
}

export function heading(text: string): string {
  return `<h1 style="margin:0 0 24px;font-family:${displayFont};font-size:30px;line-height:1.15;`
    + `font-weight:800;color:${colors.ink};">${escapeHtml(text)}</h1>`;
}

export function paragraph(text: string, options: { small?: boolean; bold?: boolean } = {}): string {
  return `<p style="margin:0 0 20px;font-family:${font};font-size:${options.small ? 13 : 16}px;`
    + `line-height:1.55;color:${options.small ? colors.muted : colors.body};`
    + `font-weight:${options.bold ? 700 : 400};">${escapeHtml(text)}</p>`;
}

export function hero(data: {
  eyebrow: string; heading: string; value?: string; unit?: string; detail?: string;
}): string {
  return `<table ${table} width="100%" style="margin:0 0 28px;"><tr>`
    + `<td bgcolor="${colors.lime}" style="padding:28px 24px;background:${colors.lime};border-radius:16px;color:${colors.ink};">`
    + `<p style="margin:0 0 12px;font-size:12px;font-weight:700;letter-spacing:0.08em;`
    + `text-transform:uppercase;color:${colors.ink};">${escapeHtml(data.eyebrow)}</p>`
    + `<h1 style="margin:0;font-family:${displayFont};font-size:30px;line-height:1.15;`
    + `font-weight:800;color:${colors.ink};">${escapeHtml(data.heading)}</h1>`
    + (data.value === undefined ? "" : `<p style="margin:20px 0 0;font-family:${mono};font-size:56px;`
      + `line-height:1.15;color:${colors.ink};">${escapeHtml(data.value)} <span style="font-size:18px;color:${colors.ink};">`
      + `${escapeHtml(data.unit ?? "")}</span></p>`)
    + (data.detail ? `<p style="margin:12px 0 0;font-size:14px;line-height:1.55;color:${colors.ink};">`
      + `${escapeHtml(data.detail)}</p>` : "")
    + "</td></tr></table>";
}

export interface EmailValue { label: string; value: string; unit?: string }
function measurement(item: EmailValue, size: number): string {
  return `<span style="font-family:${mono};font-size:${size}px;color:${colors.ink};">`
    + `${escapeHtml(item.value)}</span>`
    + (item.unit ? ` <span style="font-size:13px;color:${colors.muted};">${escapeHtml(item.unit)}</span>` : "");
}

export function valueTiles(values: readonly EmailValue[]): string {
  const rows: string[] = [];
  for (let index = 0; index < values.length; index += 2) {
    rows.push("<tr>" + values.slice(index, index + 2).map((item) =>
      `<td width="50%" valign="top" style="padding:4px;"><table ${table} width="100%"><tr>`
      + `<td style="padding:16px 12px;background:${colors.paper};border:1px solid ${colors.border};`
      + `border-radius:16px;overflow-wrap:anywhere;"><p style="margin:0 0 8px;font-size:13px;`
      + `color:${colors.body};">${escapeHtml(item.label)}</p>${measurement(item, 28)}</td></tr></table></td>`
    ).join("") + (index + 1 === values.length ? '<td width="50%"></td>' : "") + "</tr>");
  }
  return `<table ${table} width="100%" style="table-layout:fixed;margin:0 0 24px;">${rows.join("")}</table>`;
}

export function valueRows(values: readonly EmailValue[]): string {
  return `<table ${table} width="100%" style="margin:0 0 24px;">`
    + values.map((item) => `<tr><td style="padding:13px 8px 13px 0;font-size:14px;`
      + `border-bottom:1px solid ${colors.border};color:${colors.body};">${escapeHtml(item.label)}</td>`
      + `<td align="right" style="padding:13px 0 13px 8px;border-bottom:1px solid ${colors.border};">`
      + measurement(item, 18) + "</td></tr>").join("") + "</table>";
}

export function benefits(items: readonly { title?: string; text: string; icon?: string }[],
  options: { firstLime?: boolean } = {}): string {
  return `<table ${table} width="100%" style="margin:0 0 24px;">`
    + items.map((item, index) => `<tr><td width="56" valign="top" style="padding:0 12px 16px 0;">`
      + `<table ${table}><tr><td width="44" height="44" align="center" valign="middle" `
      + `style="background:${index === 0 && options.firstLime ? colors.lime : colors.mint};border-radius:12px;">`
      + `<img src="${asset(item.icon ?? "icon-check.png")}" alt="" width="24" height="24" `
      + `style="display:block;border:0;"></td></tr></table></td>`
      + `<td valign="top" style="padding:0 0 16px;font-size:16px;line-height:1.55;color:${colors.body};">`
      + (item.title ? `<strong style="color:${colors.ink};">${escapeHtml(item.title)}</strong><br>` : "")
      + `${escapeHtml(item.text)}</td></tr>`).join("") + "</table>";
}

export function numberedTips(items: readonly { title: string; text: string }[]): string {
  return items.map((item, index) => `<table ${table} width="100%" style="margin:0 0 12px;">`
    + `<tr><td style="padding:20px;background:${colors.paper};border-radius:16px;">`
    + `<table ${table} width="100%"><tr><td width="40" valign="top" style="padding-right:12px;">`
    + `<table ${table}><tr><td align="center" width="28" height="28" style="background:${colors.lime};`
    + `color:${colors.ink};font-family:${mono};font-size:16px;border-radius:50%;">${index + 1}</td></tr></table></td>`
    + `<td style="font-size:16px;line-height:1.55;color:${colors.body};"><strong style="color:${colors.ink};">`
    + `${escapeHtml(item.title)}</strong><br>${escapeHtml(item.text)}</td></tr></table></td></tr></table>`).join("");
}

/** content is trusted HTML produced by these building blocks, never user input. */
export function tipBlock(data: { title?: string; text?: string; content?: string }): string {
  return `<table ${table} width="100%" style="margin:24px 0;"><tr><td style="padding:24px;`
    + `background:${colors.mint};border-radius:16px;">`
    + `<img src="${asset("icon-tip.png")}" alt="" width="24" height="24" style="display:block;margin:0 0 12px;">`
    + (data.title ? paragraph(data.title, { bold: true }) : "")
    + (data.text ? paragraph(data.text) : "") + (data.content ?? "") + "</td></tr></table>";
}

export function chips(items: readonly string[]): string {
  return `<p style="margin:0 0 20px;font-family:${font};line-height:2.6;">`
    + items.map((item) => `<span style="display:inline-block;margin:0 6px 6px 0;padding:3px 10px;`
      + `max-width:100%;box-sizing:border-box;background:${colors.paper};color:${colors.ink};`
      + `border:1px solid ${colors.border};border-radius:999px;font-size:12px;line-height:1.55;`
      + `overflow-wrap:anywhere;">${escapeHtml(item)}</span>`).join("") + "</p>";
}

export function codeBlock(code: string): string {
  return `<table ${table} width="100%" style="margin:24px 0;"><tr><td align="center" `
    + `style="padding:24px 8px;background:${colors.mint};border-radius:16px;color:${colors.ink};`
    + `font-family:${mono};font-size:44px;letter-spacing:0.06em;line-height:1.3;overflow-wrap:anywhere;">`
    + `${escapeHtml(code)}</td></tr></table>`;
}

export function illustration(filename: string, alt: string): string {
  return `<table ${table} width="100%" style="margin:24px 0;"><tr><td align="center">`
    + `<img src="${asset(filename)}" alt="${escapeHtml(alt)}" width="360" `
    + `style="display:block;width:100%;max-width:360px;height:auto;border:0;"></td></tr></table>`;
}

export function primaryButton(href: string, label: string): string {
  const url = safeHref(href);
  return `<table ${table} width="100%" style="margin:28px 0;"><tr><td align="left">`
    + `<!--[if mso]><v:rect xmlns:v="urn:schemas-microsoft-com:vml" `
    + `xmlns:w="urn:schemas-microsoft-com:office:word" href="${url}" `
    + `style="height:52px;v-text-anchor:middle;width:279px;" strokecolor="${colors.petrol}" `
    + `fillcolor="${colors.petrol}"><w:anchorlock/><center style="color:#FFFFFF;`
    + `font-family:Arial,sans-serif;font-size:16px;font-weight:bold;">${escapeHtml(label)}</center>`
    + `</v:rect><![endif]--><!--[if !mso]><!--><a href="${url}" `
    + `style="display:inline-block;box-sizing:border-box;max-width:100%;min-height:48px;`
    + `padding:14px 22px;background:${colors.petrol};color:#FFFFFF;border-radius:999px;`
    + `font-family:${font};font-size:16px;line-height:24px;font-weight:700;text-align:center;`
    + `text-decoration:none;overflow-wrap:anywhere;">${escapeHtml(label)}</a><!--<![endif]-->`
    + "</td></tr></table>";
}

export function signOff(locale: EmailLocale): string {
  const copy = emailCopy[locale].common;
  return `<p style="margin:28px 0 0;font-size:16px;line-height:1.55;color:${colors.body};">`
    + `${escapeHtml(copy.signoff)}<br>`
    + `<strong style="color:${colors.ink};">${escapeHtml(copy.team)}</strong></p>`;
}

export interface EmailLayoutData {
  locale: EmailLocale; subject: string; preheader: string; content: string; footerReason: string;
  footerExtra?: string; unsubscribeUrl?: string; preferencesUrl?: string; signOff?: boolean;
}

export function renderLayout(data: EmailLayoutData): string {
  const copy = emailCopy[data.locale].common;
  const footerLinks = [
    data.unsubscribeUrl ? `<a href="${safeHref(data.unsubscribeUrl)}" style="color:${colors.muted};">`
      + `${escapeHtml(copy.unsubscribe)}</a>` : "",
    data.preferencesUrl ? `<a href="${safeHref(data.preferencesUrl)}" style="color:${colors.muted};">`
      + `${escapeHtml(copy.preferences)}</a>` : "",
  ].filter(Boolean).join(" &middot; ");
  return `<!DOCTYPE html><html lang="${data.locale}" xmlns="http://www.w3.org/1999/xhtml">`
    + `<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">`
    + `<meta name="color-scheme" content="light"><meta name="supported-color-schemes" content="light">`
    + `<title>${escapeHtml(data.subject)}</title><style>`
    + `:root{color-scheme:light;supported-color-schemes:light}table{border-collapse:separate}`
    + `@media only screen and (max-width:600px){.email-outer{padding:12px 0!important}}`
    + `@media only screen and (max-width:480px){.email-card{padding:24px!important}`
    + `.email-footer{padding:24px!important}}`
    + `</style></head><body style="margin:0;padding:0;background:${colors.paper};color:${colors.body};`
    + `font-family:${font};font-size:16px;line-height:1.55;-webkit-text-size-adjust:100%;">`
    + `<span aria-hidden="true" style="display:none!important;visibility:hidden;opacity:0;color:transparent;`
    + `height:0;width:0;max-height:0;max-width:0;overflow:hidden;mso-hide:all;">${escapeHtml(data.preheader)}`
    + `${"&#847; &zwnj; &nbsp; ".repeat(90)}</span>`
    + `<table ${table} width="100%" style="background:${colors.paper};"><tr>`
    + `<td class="email-outer" align="center" style="padding:32px 16px;">`
    + `<!--[if mso]><table role="presentation" width="600"><tr><td><![endif]-->`
    + `<table ${table} width="100%" style="width:100%;max-width:600px;table-layout:fixed;">`
    + `<tr><td class="email-card" style="padding:40px;background:#FFFFFF;border-radius:24px;`
    + `overflow-wrap:anywhere;word-wrap:break-word;">`
    + `<table ${table} width="100%" style="margin:0 0 28px;"><tr><td style="padding-bottom:24px;">`
    + `<a href="${BRAND.siteUrl}" style="text-decoration:none;"><img src="${BRAND.siteUrl}/brand/png/logo-horizontaal-960.png" `
    + `alt="BikeFitBoost" width="172" height="30" style="display:block;border:0;"></a></td></tr>`
    + `<tr><td height="4" style="height:4px;background:${colors.lime};font-size:0;line-height:4px;">`
    + `&nbsp;</td></tr></table>${data.content}${data.signOff === false ? "" : signOff(data.locale)}</td></tr>`
    + `<tr><td class="email-footer" align="center" style="padding:24px 40px;font-size:12px;`
    + `line-height:1.55;color:${colors.muted};">${escapeHtml(data.footerReason)}`
    + (data.footerExtra ? `<br>${escapeHtml(data.footerExtra)}` : "")
    + `<br><a href="${BRAND.siteUrl}" style="color:${colors.muted};">${BRAND.host}</a>`
    + (footerLinks ? `<br>${footerLinks}` : "")
    + `</td></tr></table><!--[if mso]></td></tr></table><![endif]--></td></tr></table></body></html>`;
}
