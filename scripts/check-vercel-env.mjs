#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

function stripQuotes(value) {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }
  return value;
}

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return;
  }

  const content = fs.readFileSync(filePath, "utf8");
  const lines = content.split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex < 1) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    const value = stripQuotes(trimmed.slice(separatorIndex + 1).trim());

    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

loadEnvFile(path.resolve(process.cwd(), ".env.local"));
loadEnvFile(path.resolve(process.cwd(), ".env"));

const requiredEnvVars = ["NEXT_PUBLIC_CONVEX_URL"];

const errors = [];

for (const key of requiredEnvVars) {
  const value = process.env[key];
  if (!value || value.trim().length === 0) {
    errors.push(`Missing required environment variable: ${key}`);
    continue;
  }

  try {
    new URL(value);
  } catch {
    errors.push(`Invalid URL in ${key}: ${value}`);
  }
}

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
if (
  process.env.VERCEL === "1" &&
  convexUrl &&
  (convexUrl.includes("127.0.0.1") || convexUrl.includes("localhost"))
) {
  errors.push(
    "NEXT_PUBLIC_CONVEX_URL points to localhost while running on Vercel."
  );
}

if (errors.length > 0) {
  console.error("Vercel deployment preflight failed:");
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log("Vercel deployment preflight passed.");
