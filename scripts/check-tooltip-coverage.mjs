#!/usr/bin/env node

import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";

const SRC_ROOT = path.resolve("src");
const FORM_CONTROL_REGEX = /<(Input|Select)\b|<input\b|<select\b|<textarea\b/;
const TEST_FILE_REGEX = /\.test\.(ts|tsx)$/;
const SUPPORTED_EXTENSIONS = new Set([".ts", ".tsx"]);

const PRIMITIVE_FILES = new Set([
  "src/components/ui/Input.tsx",
  "src/components/ui/Select.tsx",
]);

const INPUT_SELECT_ENFORCED_FILES = new Set([
  "src/app/(auth)/login/page.tsx",
  "src/app/(dashboard)/fit/[sessionId]/results/page.tsx",
  "src/components/bikes/BikeForm.tsx",
  "src/components/measurements/StepAdvancedMeasurements.tsx",
  "src/components/measurements/StepBodyMeasurements.tsx",
]);

const NATIVE_CONTROL_ENFORCED_FILES = new Set([
  "src/app/(public)/contact/page.tsx",
  "src/app/(public)/calculators/saddle-height/page.tsx",
  "src/app/(public)/calculators/frame-size/page.tsx",
  "src/app/(public)/calculators/crank-length/page.tsx",
  "src/components/questionnaire/questions/NumericQuestion.tsx",
  "src/components/questionnaire/questions/TextQuestion.tsx",
]);

async function walkFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walkFiles(fullPath)));
      continue;
    }

    const ext = path.extname(entry.name);
    if (!SUPPORTED_EXTENSIONS.has(ext)) {
      continue;
    }
    if (TEST_FILE_REGEX.test(entry.name)) {
      continue;
    }

    files.push(fullPath);
  }

  return files;
}

function normalizePath(filePath) {
  return filePath.split(path.sep).join("/");
}

function validateInputSelectCoverage(filePath, content, errors) {
  const inputTags = content.match(/<Input\b[\s\S]*?\/>/g) || [];
  const selectTags = content.match(/<Select\b[\s\S]*?\/>/g) || [];

  inputTags.forEach((tag, index) => {
    if (!/\btooltip=/.test(tag)) {
      errors.push(`${filePath}: <Input> #${index + 1} is missing tooltip prop.`);
    }
  });

  selectTags.forEach((tag, index) => {
    if (!/\btooltip=/.test(tag)) {
      errors.push(`${filePath}: <Select> #${index + 1} is missing tooltip prop.`);
    }
  });
}

function validateNativeControlCoverage(filePath, content, errors) {
  const controls = content.match(/<(input|select|textarea)\b[^>]*>/g) || [];
  const controlsMissingId = controls.filter((tag) => !/\bid=/.test(tag));
  if (controlsMissingId.length > 0) {
    errors.push(`${filePath}: ${controlsMissingId.length} native control(s) missing id attribute.`);
  }

  const fieldLabelsWithTooltip = content.match(/<FieldLabel[^>]*\btooltip=/g) || [];
  if (fieldLabelsWithTooltip.length !== controls.length) {
    errors.push(
      `${filePath}: native controls (${controls.length}) do not match FieldLabel+tooltip count (${fieldLabelsWithTooltip.length}).`
    );
  }
}

async function main() {
  await stat(SRC_ROOT);
  const files = await walkFiles(SRC_ROOT);
  const filesWithControls = [];

  for (const absoluteFilePath of files) {
    const content = await readFile(absoluteFilePath, "utf8");
    if (!FORM_CONTROL_REGEX.test(content)) {
      continue;
    }

    const relativePath = normalizePath(path.relative(process.cwd(), absoluteFilePath));
    filesWithControls.push({ path: relativePath, content });
  }

  const errors = [];

  for (const file of filesWithControls) {
    if (PRIMITIVE_FILES.has(file.path)) {
      continue;
    }

    const isInputSelectFile = INPUT_SELECT_ENFORCED_FILES.has(file.path);
    const isNativeFile = NATIVE_CONTROL_ENFORCED_FILES.has(file.path);

    if (!isInputSelectFile && !isNativeFile) {
      errors.push(
        `${file.path}: contains form controls but is not tracked in tooltip coverage guardrail lists.`
      );
      continue;
    }

    if (isInputSelectFile) {
      validateInputSelectCoverage(file.path, file.content, errors);
    }

    if (isNativeFile) {
      validateNativeControlCoverage(file.path, file.content, errors);
    }
  }

  if (errors.length > 0) {
    console.error("[tooltip-coverage] FAILED");
    errors.forEach((error) => console.error(`- ${error}`));
    process.exit(1);
  }

  const trackedFileCount = filesWithControls.filter(
    (file) => !PRIMITIVE_FILES.has(file.path)
  ).length;
  console.log(
    `[tooltip-coverage] OK: ${trackedFileCount} form-control files verified with tooltip guardrails.`
  );
}

main().catch((error) => {
  console.error("[tooltip-coverage] FAILED with unexpected error.");
  console.error(error);
  process.exit(1);
});
