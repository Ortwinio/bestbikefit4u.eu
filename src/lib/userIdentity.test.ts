import { describe, expect, it } from "vitest";
import {
  getEffectiveDisplayName,
  getEffectiveProfileImageSource,
} from "./userIdentity";

describe("userIdentity", () => {
  it("prefers the app-owned display name", () => {
    expect(
      getEffectiveDisplayName({
        displayName: "Manual Name",
        googleName: "Google Name",
        name: "Auth Name",
        email: "rider@example.com",
      } as never)
    ).toBe("Manual Name");
  });

  it("falls back to google name and then email local part", () => {
    expect(
      getEffectiveDisplayName({
        googleName: "Google Rider",
        email: "rider@example.com",
      } as never)
    ).toBe("Google Rider");

    expect(
      getEffectiveDisplayName(
        {
          email: "rider@example.com",
        } as never,
        "Fallback Rider"
      )
    ).toBe("rider");
  });

  it("prefers custom profile image over google and auth image", () => {
    expect(
      getEffectiveProfileImageSource({
        profile_image_url: "storage-id",
        googleProfileImageUrl: "https://google.example/avatar.png",
        image: "https://auth.example/avatar.png",
      } as never)
    ).toBe("storage-id");
  });

  it("falls back to google image and then auth image", () => {
    expect(
      getEffectiveProfileImageSource({
        googleProfileImageUrl: "https://google.example/avatar.png",
      } as never)
    ).toBe("https://google.example/avatar.png");

    expect(
      getEffectiveProfileImageSource({
        image: "https://auth.example/avatar.png",
      } as never)
    ).toBe("https://auth.example/avatar.png");
  });
});
