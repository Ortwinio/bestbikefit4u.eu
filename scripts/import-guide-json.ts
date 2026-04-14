import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { ConvexHttpClient } from "convex/browser";
import { internal } from "../convex/_generated/api.js";
import { stripGuidePrefix, stripLocalePrefix } from "./lib/locale-strip";

type Locale = "en" | "nl";

type ImportJsonRecord = {
  backlogOrder: number;
  slug: string;
  path: string;
  locale: Locale;
  cluster: string;
  status: string;
  pageTitle: string;
  metaTitle: string;
  h1: string;
  pageBrief: string;
  primaryCtaLabel: string;
  primaryCtaTarget: string;
  internalLinkTargets: string[];
  notesOrRedirects: string;
  libraryBody: string;
  metaDescription: string;
  relatedKeywords?: string[];
  alternateLocalePath?: string;
  backlogSeoHints?: unknown;
  heroImageFileName?: string;
  heroImagePublicPath?: string;
};

type ImportPayload = {
  slug: string;
  path: string;
  cluster: string;
  backlogOrder?: number;
  importStatus?: string;
  importNotes?: string;
  pageTitle: { en: string; nl: string };
  h1: { en: string; nl: string };
  metaTitle: { en: string; nl: string };
  metaDescription: { en: string; nl: string };
  pageBrief: { en: string; nl: string };
  libraryBody: { en: string; nl: string };
  heroImageFileName?: string;
  heroImagePublicPath?: string;
  relatedGuidePaths?: string[];
  relatedKeywords?: string[];
  seoHints?: unknown;
  primaryCtaTarget: string;
  primaryCtaLabel: { en: string; nl: string };
  relatedGuides?: string[];
  robotsIndex: true;
  tableOfContents: false;
  publishedAt: number;
  lastUpdatedAt: number;
  overwrite?: boolean;
};

function parseArgs(argv: string[]) {
  let slug: string | undefined;

  for (let index = 2; index < argv.length; index += 1) {
    if (argv[index] === "--slug") {
      slug = argv[index + 1];
      index += 1;
    }
  }

  return {
    dryRun: argv.includes("--dry-run"),
    overwrite: argv.includes("--overwrite"),
    copyImages: argv.includes("--copy-images"),
    verbose: argv.includes("--verbose"),
    slug,
  };
}

function getImportDir(locale: Locale) {
  return path.join(process.cwd(), "docs", "cms-import", locale);
}

function getImagesDir() {
  return path.join(process.cwd(), "docs", "cms-import", "images");
}

function getPublicMediaDir() {
  return path.join(process.cwd(), "public", "guides", "media");
}

function readJsonFile(filePath: string) {
  return JSON.parse(readFileSync(filePath, "utf8")) as ImportJsonRecord;
}

function listJsonFiles(locale: Locale) {
  return readdirSync(getImportDir(locale))
    .filter((fileName) => fileName.endsWith(".json"))
    .sort();
}

function getBareSlug(slug: string) {
  return stripGuidePrefix(slug.trim());
}

function buildLocaleMap(locale: Locale) {
  const files = listJsonFiles(locale);
  const map = new Map<string, ImportJsonRecord>();

  for (const fileName of files) {
    const record = readJsonFile(path.join(getImportDir(locale), fileName));
    map.set(getBareSlug(record.slug), record);
  }

  return map;
}

function ensureBilingualRecord(
  slug: string,
  enRecord: ImportJsonRecord | undefined,
  nlRecord: ImportJsonRecord | undefined
) {
  if (!enRecord || !nlRecord) {
    throw new Error(`Missing EN/NL pair for slug: ${slug}`);
  }

  return { enRecord, nlRecord };
}

function cleanStringArray(values: string[] | undefined) {
  return values?.map((value) => value.trim()).filter(Boolean);
}

function buildImportPayload(
  enRecord: ImportJsonRecord,
  nlRecord: ImportJsonRecord,
  now: number,
  overwrite: boolean
): ImportPayload {
  const slug = getBareSlug(enRecord.slug);
  const relatedGuidePaths = cleanStringArray(
    enRecord.internalLinkTargets.map((item) => stripLocalePrefix(item))
  );

  return {
    slug,
    path: stripLocalePrefix(enRecord.path),
    cluster: enRecord.cluster,
    backlogOrder: enRecord.backlogOrder,
    importStatus: enRecord.status,
    importNotes: enRecord.notesOrRedirects || undefined,
    pageTitle: {
      en: enRecord.pageTitle,
      nl: nlRecord.pageTitle,
    },
    h1: {
      en: enRecord.h1,
      nl: nlRecord.h1,
    },
    metaTitle: {
      en: enRecord.metaTitle,
      nl: nlRecord.metaTitle,
    },
    metaDescription: {
      en: enRecord.metaDescription,
      nl: nlRecord.metaDescription,
    },
    pageBrief: {
      en: enRecord.pageBrief,
      nl: nlRecord.pageBrief,
    },
    libraryBody: {
      en: enRecord.libraryBody,
      nl: nlRecord.libraryBody,
    },
    heroImageFileName: enRecord.heroImageFileName,
    heroImagePublicPath: enRecord.heroImagePublicPath,
    relatedGuidePaths,
    relatedKeywords: cleanStringArray(enRecord.relatedKeywords),
    seoHints: enRecord.backlogSeoHints,
    primaryCtaTarget: stripLocalePrefix(enRecord.primaryCtaTarget),
    primaryCtaLabel: {
      en: enRecord.primaryCtaLabel,
      nl: nlRecord.primaryCtaLabel,
    },
    relatedGuides: relatedGuidePaths?.map((item) => stripGuidePrefix(item)),
    robotsIndex: true,
    tableOfContents: false,
    publishedAt: now,
    lastUpdatedAt: now,
    overwrite,
  };
}

function requireConvexClient() {
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  const adminKey = process.env.CONVEX_ADMIN_KEY;

  if (!convexUrl) {
    throw new Error("Missing NEXT_PUBLIC_CONVEX_URL for Convex import");
  }

  if (!adminKey) {
    throw new Error("Missing CONVEX_ADMIN_KEY for Convex import");
  }

  const client = new ConvexHttpClient(convexUrl);
  (client as ConvexHttpClient & { setAdminAuth: (token: string) => void }).setAdminAuth(
    adminKey
  );
  return client;
}

function pickSmokeCheckSlugs(slugs: string[]) {
  if (slugs.length <= 5) {
    return slugs;
  }

  const first = slugs[0];
  const middle = slugs[Math.floor(slugs.length / 2)];
  const last = slugs[slugs.length - 1];
  const quarter = slugs[Math.floor(slugs.length / 4)];
  const threeQuarter = slugs[Math.floor((slugs.length * 3) / 4)];
  return Array.from(new Set([first, quarter, middle, threeQuarter, last]));
}

async function runSmokeCheck(client: ConvexHttpClient, slugs: string[]) {
  const checkSlugs = pickSmokeCheckSlugs(slugs);
  const typedClient = client as any;
  const results = (await Promise.all(
    checkSlugs.map((slug) => {
      return typedClient.query(internal.guides.queries.getGuideImportRecord, {
        slug,
      });
    }),
  )) as any[];

  const nonNull = results.filter(Boolean);
  const hasLibraryBody = results.some(
    (record) =>
      Boolean(
        record &&
          "libraryBody" in record &&
          record.libraryBody &&
          typeof record.libraryBody.en === "string" &&
          record.libraryBody.en.length > 0
      )
  );
  const hasHeroImage = results.some(
    (record) =>
      Boolean(
        record &&
          "heroImagePublicPath" in record &&
          typeof record.heroImagePublicPath === "string" &&
          record.heroImagePublicPath.length > 0
      )
  );

  const passed =
    results.length === checkSlugs.length &&
    nonNull.length === checkSlugs.length &&
    hasLibraryBody &&
    hasHeroImage;

  console.log(
    JSON.stringify({
      smokeCheck: passed ? "passed" : "failed",
      checked: checkSlugs,
      found: nonNull.length,
      hasLibraryBody,
      hasHeroImage,
    })
  );

  return passed;
}

function copyHeroImages(
  fileNames: string[],
  overwrite: boolean,
  verbose: boolean
) {
  mkdirSync(getPublicMediaDir(), { recursive: true });
  let copied = 0;
  let skipped = 0;

  for (const fileName of fileNames) {
    const source = path.join(getImagesDir(), fileName);
    const target = path.join(getPublicMediaDir(), fileName);

    if (!existsSync(source)) {
      throw new Error(`Missing hero image source: ${fileName}`);
    }

    if (existsSync(target) && !overwrite) {
      skipped += 1;
      continue;
    }

    copyFileSync(source, target);
    copied += 1;
    if (verbose) {
      console.log(JSON.stringify({ copiedImage: fileName }));
    }
  }

  console.log(JSON.stringify({ copiedImages: copied, skippedImages: skipped }));
}

async function main() {
  const args = parseArgs(process.argv);
  const now = Date.now();
  const enMap = buildLocaleMap("en");
  const nlMap = buildLocaleMap("nl");
  const slugs = Array.from(new Set([...enMap.keys(), ...nlMap.keys()])).sort();
  const filteredSlugs = args.slug ? slugs.filter((slug) => slug === args.slug) : slugs;

  if (args.slug && filteredSlugs.length === 0) {
    throw new Error(`Slug not found in docs/cms-import: ${args.slug}`);
  }

  const payloads = filteredSlugs.map((slug) => {
    const { enRecord, nlRecord } = ensureBilingualRecord(slug, enMap.get(slug), nlMap.get(slug));
    return buildImportPayload(enRecord, nlRecord, now, args.overwrite);
  });

  if (args.copyImages) {
    const fileNames = Array.from(
      new Set(payloads.map((payload) => payload.heroImageFileName).filter((value): value is string => Boolean(value)))
    );
    copyHeroImages(fileNames, args.overwrite, args.verbose);
  }

  let imported = 0;
  let updated = 0;
  let skipped = 0;
  let errors = 0;

  if (args.dryRun) {
    for (const payload of payloads) {
      const summary = {
        slug: payload.slug,
        cluster: payload.cluster,
        path: payload.path,
        relatedGuidePaths: payload.relatedGuidePaths?.length ?? 0,
        heroImageFileName: payload.heroImageFileName,
        libraryBodyEnLength: payload.libraryBody.en.length,
        libraryBodyNlLength: payload.libraryBody.nl.length,
        mode: "dry-run",
      };
      console.log(JSON.stringify(summary));
    }

    console.log(
      JSON.stringify({
        total: payloads.length,
        imported,
        skipped,
        errors,
        dryRun: true,
      })
    );
    return;
  }

  const client = requireConvexClient();
  const typedClient = client as any;

  for (const payload of payloads) {
    try {
      const result = (await typedClient.mutation(
        internal.guides.mutations.importGuide,
        payload
      )) as any;
      if (result.outcome === "created") {
        imported += 1;
      } else if (result.outcome === "updated") {
        updated += 1;
      } else {
        skipped += 1;
      }

      if (args.verbose) {
        console.log(
          JSON.stringify({
            slug: payload.slug,
            outcome: result.outcome,
            primaryCtaTarget: payload.primaryCtaTarget,
            heroImagePublicPath: payload.heroImagePublicPath,
            libraryBodyEnLength: payload.libraryBody.en.length,
          })
        );
      }
    } catch (error: unknown) {
      errors += 1;
      console.error(
        JSON.stringify({
          slug: payload.slug,
          error: error instanceof Error ? error.message : String(error),
        })
      );
    }
  }

  await runSmokeCheck(client, payloads.map((payload) => payload.slug));

  console.log(
    JSON.stringify({
      total: payloads.length,
      imported,
      updated,
      skipped,
      errors,
      overwrite: args.overwrite,
      slug: args.slug ?? null,
    })
  );
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(message);
  process.exitCode = 1;
});
