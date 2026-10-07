#!/usr/bin/env node

import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { require as tsxRequire } from "tsx/cjs/api";
const { billingDeploymentChecks } = tsxRequire("../shared/billing/deploymentConfig.ts", import.meta.url);

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

if (!process.argv.includes("--no-env-files")) {
  loadEnvFile(fileURLToPath(new URL("../.env.local", import.meta.url)));
  loadEnvFile(fileURLToPath(new URL("../.env", import.meta.url)));
}

const requiredEnvVars = ["NEXT_PUBLIC_CONVEX_URL"];
const requiredUrlEnvVars = new Set(["NEXT_PUBLIC_CONVEX_URL"]);

const errors = [];

for (const key of requiredEnvVars) {
  const value = process.env[key];
  if (!value || value.trim().length === 0) {
    errors.push(`Missing required environment variable: ${key}`);
    continue;
  }

  if (requiredUrlEnvVars.has(key)) {
    try {
      new URL(value);
    } catch {
      errors.push(`Invalid URL in ${key}`);
    }
  }
}

for (const [name, valid] of Object.entries(billingDeploymentChecks(process.env))) {
  if (!valid) errors.push(`Missing or invalid environment configuration: ${name}`);
}

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
let convexHost;
try { convexHost = new URL(convexUrl).hostname; } catch { /* Invalid URL reported above. */ }
if (
  process.env.VERCEL === "1" &&
  convexUrl &&
  ["127.0.0.1", "localhost", "[::1]"].includes(convexHost)
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
