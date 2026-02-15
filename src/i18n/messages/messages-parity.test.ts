import { describe, expect, it } from "vitest";
import en from "./en";
import nl from "./nl";

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function collectKeyPaths(value: unknown, prefix = ""): string[] {
  if (Array.isArray(value)) {
    const paths = [prefix];
    const first = value[0];
    if (first === undefined) {
      return paths;
    }

    if (isObject(first) || Array.isArray(first)) {
      return paths.concat(
        collectKeyPaths(first, `${prefix}[]`)
      );
    }

    return paths;
  }

  if (!isObject(value)) {
    return [prefix];
  }

  return Object.keys(value).flatMap((key) => {
    const childPath = prefix ? `${prefix}.${key}` : key;
    return collectKeyPaths(value[key], childPath);
  });
}

function collectPrimitiveTypePaths(
  value: unknown,
  prefix = ""
): Array<{ path: string; type: "primitive" | "array" | "object" }> {
  if (Array.isArray(value)) {
    const paths: Array<{ path: string; type: "primitive" | "array" | "object" }> = [
      { path: prefix, type: "array" },
    ];
    const first = value[0];
    if (first === undefined) {
      return paths;
    }
    if (isObject(first) || Array.isArray(first)) {
      return paths.concat(collectPrimitiveTypePaths(first, `${prefix}[]`));
    }
    return paths;
  }

  if (!isObject(value)) {
    return [{ path: prefix, type: "primitive" }];
  }

  return Object.keys(value).flatMap((key) => {
    const childPath = prefix ? `${prefix}.${key}` : key;
    return collectPrimitiveTypePaths(value[key], childPath);
  });
}

describe("translation catalog parity", () => {
  it("keeps identical key paths between english and dutch catalogs", () => {
    const enPaths = collectKeyPaths(en).sort();
    const nlPaths = collectKeyPaths(nl).sort();
    expect(nlPaths).toEqual(enPaths);
  });

  it("keeps compatible value shapes between english and dutch catalogs", () => {
    const enTypes = collectPrimitiveTypePaths(en).sort((a, b) =>
      a.path.localeCompare(b.path)
    );
    const nlTypes = collectPrimitiveTypePaths(nl).sort((a, b) =>
      a.path.localeCompare(b.path)
    );
    expect(nlTypes).toEqual(enTypes);
  });
});
