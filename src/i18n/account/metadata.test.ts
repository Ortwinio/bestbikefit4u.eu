import { describe, expect, it } from "vitest";
import { getAccountMetadata } from "./metadata";

describe("account metadata language", () => {
  it.each([
    ["dashboard", "Je fietsoverzicht"], ["profile", "Je fietsersprofiel"],
    ["fit", "Je fietsafstelling"], ["fit-history", "Je afstellingsgeschiedenis"],
    ["settings", "Je instellingen"], ["feedback", "Je feedback"],
  ] as const)("localizes %s metadata and preserves English inheritance", (page, title) => {
    const metadata = getAccountMetadata("nl", page);
    expect(metadata.title).toBe(`${title} | BikeFitBoost`);
    expect(metadata.description).toBe("Fietsafstelling voor comfort, een goede houding en betere prestaties.");
    expect(metadata.openGraph).toMatchObject({ title: metadata.title, description: metadata.description });
    expect(metadata.twitter).toMatchObject({ title: metadata.title, description: metadata.description });
    expect(getAccountMetadata("en", page)).toEqual({});
  });
});
