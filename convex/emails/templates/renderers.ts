import { BRAND } from "../../lib/brand";
import { emailCopy } from "../i18n";
import { formatDate, formatNumber, formatPrice } from "../format";
import {
  renderLayout, heading, paragraph, hero, valueTiles, valueRows, benefits, numberedTips,
  tipBlock, illustration, primaryButton, codeBlock, chips,
} from "../layout";
import type {
  EmailLocale, RenderedEmail, PreferenceLinks, FitValues, LoginCodeData, ResultsSummaryData, FitReportData,
  FitPassWelcomeData, CaseStudyLeadData, CaseStudyConfirmationData, FitReminderData, UpgradeNudgeData,
  WinbackData, ProExplainerData, Day1TipsData,
} from "./index";

function fill(copy: string, values: Record<string, string | number>): string {
  return copy.replace(/\{(\w+)\}/g, (_, key: string) => {
    if (!(key in values)) throw new Error(`Missing email value: ${key}`);
    return String(values[key]);
  });
}

function greeting(firstName: string | undefined, locale: EmailLocale): string {
  const copy = emailCopy[locale].common;
  const name = firstName?.trim();
  return name ? fill(copy.greeting, { firstName: name }) : copy.genericGreeting;
}

function createEmail(
  locale: EmailLocale, subject: string, preheader: string, links?: PreferenceLinks, internal = false,
) {
  const parts: string[] = [];
  const text: string[] = [];
  const common = emailCopy[locale].common;
  const reason = common.footer[internal ? "internal" : links ? "service" : "transactional"];
  return {
    add(html: string, plain: string) { parts.push(html); if (plain) text.push(plain); },
    paragraph(value: string, small = false) {
      parts.push(paragraph(value, { small }));
      text.push(value);
    },
    heading(value: string) { parts.push(heading(value)); text.push(value); },
    button(url: string, label: string) {
      parts.push(primaryButton(url, label));
      text.push(`${label}: ${url}`);
    },
    finish(footerExtra?: string): RenderedEmail {
      const footer = [
        common.signoff, common.team, reason, footerExtra, BRAND.host,
        links ? `${common.unsubscribe}: ${links.unsubscribeUrl}` : undefined,
        links ? `${common.preferences}: ${links.preferencesUrl}` : undefined,
      ].filter(Boolean).join("\n");
      return {
        subject, preheader,
        html: renderLayout({
          locale, subject, preheader, content: parts.join(""), footerReason: reason,
          footerExtra, unsubscribeUrl: links?.unsubscribeUrl, preferencesUrl: links?.preferencesUrl,
        }),
        text: [...text, footer].join("\n\n"),
      };
    },
  };
}

type Value = { label: string; value: string; unit?: string };
type ValueKey = Exclude<keyof FitValues, "stemAngleRecommendation">;

function fitRows(data: FitValues, locale: EmailLocale, keys: ValueKey[]): Value[] {
  const labels = emailCopy[locale].common.labels;
  const labelKeys = {
    saddleHeightMm: "saddleHeight", saddleSetbackMm: "setback", handlebarDropMm: "drop",
    stemLengthMm: "stem", crankLengthMm: "crankLength", handlebarWidthMm: "handlebarWidth",
    recommendedStackMm: "stack", recommendedReachMm: "reach", effectiveTopTubeMm: "topTube",
  } as const;
  return keys.flatMap((key) => {
    const value = data[key];
    if (value === undefined || !Number.isFinite(value)) return [];
    if (key === "stemLengthMm" && data.stemAngleRecommendation?.trim()) {
      return [{
        label: labels[labelKeys[key]],
        value: `${formatNumber(value, locale)} mm · ${data.stemAngleRecommendation.trim()}`,
      }];
    }
    return [{ label: labels[labelKeys[key]], value: formatNumber(value, locale), unit: "mm" }];
  });
}
function plainRows(rows: Value[]) {
  return rows.map(({ label, value, unit }) => `${label}: ${value}${unit ? ` ${unit}` : ""}`).join("\n");
}
function plainBenefits(items: readonly { title?: string; text: string }[]) {
  return items.map(({ title, text }) => `${title ? `${title} ` : ""}${text}`).join("\n");
}
function checkItems(items: readonly string[]) {
  return items.map((text) => ({ text, icon: "icon-check.png" }));
}

export function renderLoginCode(data: LoginCodeData, locale: EmailLocale): RenderedEmail {
  const copy = emailCopy[locale].loginCode;
  const mail = createEmail(locale, fill(copy.subject, { code: data.code }), copy.preheader);
  mail.heading(copy.heading);
  mail.add(codeBlock(data.code), data.code);
  mail.paragraph(copy.body);
  mail.paragraph(copy.small, true);
  return mail.finish();
}

export function renderResultsSummary(data: ResultsSummaryData, locale: EmailLocale): RenderedEmail {
  const copy = emailCopy[locale].resultsSummary;
  const height = formatNumber(data.saddleHeightMm, locale);
  const mail = createEmail(locale, fill(copy.subject, { saddleHeight: height }), copy.preheader);
  const range = data.testRange
    ? fill(copy.range, { min: formatNumber(data.testRange.min, locale), max: formatNumber(data.testRange.max, locale) })
    : "";
  const detail = [copy.caption, range].filter(Boolean).join(", ");
  mail.add(hero({ eyebrow: copy.eyebrow, heading: copy.heading, value: height, unit: "mm", detail }),
    `${copy.eyebrow}\n${copy.heading}\n${height} mm\n${detail}`);
  const intro = data.bikeName ? fill(copy.intro, { bike: data.bikeName }) : copy.introWithoutBike;
  mail.paragraph(`${greeting(data.firstName, locale)} ${intro}`);
  const rows = fitRows({ ...data, stemAngleRecommendation: undefined }, locale, [
    "saddleHeightMm", "handlebarDropMm", "stemLengthMm", "crankLengthMm",
  ]);
  const tiles = rows.map((row) => row.label === emailCopy[locale].common.labels.stem
    ? { ...row, label: emailCopy[locale].common.labels.stemShort } : row);
  mail.add(valueTiles(tiles), plainRows(tiles));
  mail.paragraph(copy.body);
  mail.button(data.actionUrl, copy.button);
  return mail.finish();
}

export function renderFitReport(data: FitReportData, locale: EmailLocale): RenderedEmail {
  const copy = emailCopy[locale].fitReport;
  const subject = data.frameSize ? fill(copy.subject, { frameSize: data.frameSize }) : copy.subjectWithoutFrame;
  const title = data.frameSize ? fill(copy.heading, { frameSize: data.frameSize }) : copy.headingWithoutFrame;
  const detail = !data.frameSize || data.confidenceScore === undefined ? undefined
    : fill(copy.confidence, { confidence: formatNumber(data.confidenceScore, locale) });
  const mail = createEmail(locale, subject, copy.preheader);
  mail.add(hero({ eyebrow: copy.eyebrow, heading: title, detail }),
    [copy.eyebrow, title, detail].filter(Boolean).join("\n"));
  mail.paragraph(`${greeting(data.firstName, locale)} ${copy.intro}`);
  const rows = fitRows(data, locale, [
    "saddleHeightMm", "saddleSetbackMm", "handlebarDropMm", "stemLengthMm", "crankLengthMm", "handlebarWidthMm",
  ]);
  if (rows.length) {
    mail.heading(copy.valuesHeading);
    mail.add(valueRows(rows), plainRows(rows));
  }
  const geometry = fitRows(data, locale, ["recommendedStackMm", "recommendedReachMm", "effectiveTopTubeMm"]);
  if (geometry.length) {
    mail.heading(copy.geometryHeading);
    mail.add(valueRows(geometry), plainRows(geometry));
  }
  const notes = data.fitNotes?.filter((note) => note.trim());
  if (notes?.length) {
    mail.heading(copy.tipsHeading);
    mail.add(benefits(checkItems(notes)), notes.join("\n"));
  }
  mail.button(data.actionUrl, copy.button);
  return mail.finish(data.algorithmVersion ? fill(copy.version, { version: data.algorithmVersion }) : undefined);
}

export function renderFitPassWelcome(data: FitPassWelcomeData, locale: EmailLocale): RenderedEmail {
  const copy = emailCopy[locale].fitPassWelcome;
  const eyebrow = data.firstName?.trim()
    ? fill(copy.eyebrow, { firstName: data.firstName.trim().toLocaleUpperCase(locale) }) : copy.eyebrowWithoutName;
  const mail = createEmail(locale, copy.subject, copy.preheader);
  mail.add(hero({ eyebrow, heading: copy.heading }), `${eyebrow}\n${copy.heading}`);
  mail.add(benefits(copy.benefits.map((item, index) => ({
    ...item, icon: ["icon-report.png", "icon-plan.png", "icon-bike.png"][index],
  }))), plainBenefits(copy.benefits));
  mail.button(data.actionUrl, copy.button);
  mail.paragraph(emailCopy[locale].common.reply, true);
  return mail.finish();
}

export function renderCaseStudyLead(data: CaseStudyLeadData, _locale: EmailLocale): RenderedEmail {
  // The internal notification is intentionally Dutch in both preview sets.
  const locale = "nl";
  const copy = emailCopy[locale].caseStudyLead;
  const mail = createEmail(locale, fill(copy.subject, { name: data.name }), copy.preheader, undefined, true);
  mail.heading(copy.heading);
  const rows = [
    { label: copy.labels.name, value: data.name },
    { label: copy.labels.email, value: data.email },
    { label: copy.labels.ridingGoal, value: data.ridingGoal || "—" },
    { label: copy.labels.painSummary, value: data.painSummary },
    { label: copy.labels.sourcePath, value: data.sourcePath },
    { label: copy.labels.createdAt, value: formatDate(data.createdAt, locale) },
  ];
  mail.add(valueRows(rows), plainRows(rows));
  return mail.finish();
}

export function renderCaseStudyConfirmation(data: CaseStudyConfirmationData, locale: EmailLocale): RenderedEmail {
  const copy = emailCopy[locale].caseStudyConfirmation;
  const mail = createEmail(locale, copy.subject, copy.preheader);
  mail.heading(copy.heading);
  mail.paragraph(`${greeting(data.name, locale)} ${copy.intro}`);
  mail.add(benefits(checkItems(copy.benefits)), copy.benefits.join("\n"));
  mail.add(tipBlock({ text: copy.tip }), copy.tip);
  mail.button(data.actionUrl, copy.button);
  mail.paragraph(copy.small, true);
  return mail.finish();
}

export function renderFitReminder(data: FitReminderData, locale: EmailLocale): RenderedEmail {
  const copy = emailCopy[locale].fitReminder;
  const mail = createEmail(locale, copy.subject, copy.preheader, data);
  mail.add(hero({ eyebrow: copy.eyebrow, heading: copy.heading }), `${copy.eyebrow}\n${copy.heading}`);
  mail.paragraph(`${greeting(data.firstName, locale)} ${copy.intro}`);
  mail.add(benefits(checkItems(copy.requirements)), copy.requirements.join("\n"));
  mail.heading(copy.benefitsHeading);
  mail.add(benefits(checkItems(copy.benefits)), copy.benefits.join("\n"));
  mail.button(data.actionUrl, copy.button);
  return mail.finish();
}

export function renderUpgradeNudge(data: UpgradeNudgeData, locale: EmailLocale): RenderedEmail {
  const copy = emailCopy[locale].upgradeNudge;
  const mail = createEmail(locale, copy.subject, copy.preheader, data);
  mail.heading(copy.heading);
  mail.paragraph(`${greeting(data.firstName, locale)} ${copy.intro}`);
  mail.add(benefits(copy.benefits.map((item, index) => ({
    ...item, icon: ["icon-report.png", "icon-bike.png", "icon-plan.png"][index],
  }))), plainBenefits(copy.benefits));
  const price = `${formatPrice(9, locale)} · ${copy.cancel}`;
  mail.add(tipBlock({ text: price }), price);
  mail.button(data.actionUrl, copy.button);
  mail.paragraph(emailCopy[locale].common.reply, true);
  return mail.finish();
}

export function renderWinback(data: WinbackData, locale: EmailLocale): RenderedEmail {
  const copy = emailCopy[locale].winback;
  const mail = createEmail(locale, copy.subject, copy.preheader, data);
  mail.add(hero({ eyebrow: copy.eyebrow, heading: copy.heading }), `${copy.eyebrow}\n${copy.heading}`);
  mail.paragraph(`${greeting(data.firstName, locale)} ${copy.intro}`);
  const rows = fitRows(data, locale, ["saddleHeightMm", "handlebarDropMm"]);
  if (rows.length) {
    mail.heading(copy.valuesHeading);
    mail.add(valueTiles(rows), plainRows(rows));
    if (data.recordedAt !== undefined) {
      mail.paragraph(fill(data.bikeName ? copy.recorded : copy.recordedWithoutBike, {
        date: formatDate(data.recordedAt, locale), bike: data.bikeName ?? "",
      }), true);
    } else if (data.bikeName) {
      mail.paragraph(fill(copy.recordedWithoutDate, { bike: data.bikeName }), true);
    }
  }
  mail.paragraph(copy.body);
  mail.button(data.actionUrl, copy.button);
  return mail.finish();
}

export function renderProExplainer(data: ProExplainerData, locale: EmailLocale): RenderedEmail {
  const copy = emailCopy[locale].proExplainer;
  const mail = createEmail(locale, copy.subject, copy.preheader, data);
  mail.heading(copy.heading);
  mail.paragraph(`${greeting(data.firstName, locale)} ${copy.intro}`);
  const rows = fitRows(data, locale, ["saddleHeightMm", "saddleSetbackMm", "handlebarDropMm"]);
  if (rows.length) mail.add(valueRows(rows), plainRows(rows));
  mail.add(illustration("stack-reach.png", copy.illustrationAlt), "");
  mail.add(benefits(checkItems(copy.tips)), copy.tips.join("\n"));
  mail.paragraph(copy.body);
  mail.button(data.actionUrl, copy.button);
  return mail.finish();
}

export function renderDay1Tips(data: Day1TipsData, locale: EmailLocale): RenderedEmail {
  const copy = emailCopy[locale].day1Tips;
  const mail = createEmail(locale, copy.subject, copy.preheader, data);
  mail.heading(copy.heading);
  mail.paragraph(`${greeting(data.firstName, locale)} ${copy.intro}`);
  mail.add(illustration("measuring-kit.png", copy.illustrationAlt), "");
  mail.add(numberedTips(copy.tips),
    copy.tips.map((tip, index) => `${index + 1}. ${tip.title} ${tip.text}`).join("\n\n"));
  mail.button(data.actionUrl, data.hasFit ? copy.buttonExisting : copy.button);
  const install = (steps: readonly string[]) => steps.map((step, index) => `${index + 1}. ${step}`);
  const appHtml = [
    paragraph(copy.appBody),
    chips(copy.chips),
    paragraph("iPhone:", { bold: true }), ...install(copy.iphone).map((step) => paragraph(step)),
    paragraph("Android:", { bold: true }), ...install(copy.android).map((step) => paragraph(step)),
  ].join("");
  const appText = [
    copy.appEyebrow, copy.appHeading, copy.appBody, copy.chips.join(" · "),
    "iPhone:", ...install(copy.iphone), "Android:", ...install(copy.android),
  ].join("\n");
  mail.add(tipBlock({ title: `${copy.appEyebrow} · ${copy.appHeading}`, text: "", content: appHtml }), appText);
  return mail.finish();
}
