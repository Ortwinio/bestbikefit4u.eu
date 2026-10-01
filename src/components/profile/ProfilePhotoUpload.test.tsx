import { renderToStaticMarkup } from "react-dom/server";
import { expect, it, vi } from "vitest";
import { ProfilePhotoUpload } from "./ProfilePhotoUpload";
let source: string | null = null;
vi.mock("@/hooks/useResolvedImageUrl", () => ({ useResolvedImageUrl: () => source }));
vi.mock("@/hooks/useImageUpload", () => ({ useImageUpload: () => ({ uploadImage: vi.fn(), clearError: vi.fn() }) }));
vi.mock("convex/react", () => ({ useMutation: () => vi.fn() }));
vi.mock("@/i18n/useDashboardMessages", () => ({ useDashboardMessages: () => ({
  messages: { profile: { photo: { upload: "Upload photo" } } },
}) }));
it.each(["https://images.example/avatar.webp", "blob:https://bestbikefit4u.eu/123"])(
  "retains storage and file-preview URLs: %s", (url) => {
    source = url;
    expect(renderToStaticMarkup(<ProfilePhotoUpload />)).toContain(`src="${url}"`);
  },
);
it.each(["javascript:alert(1)", "data:text/html,<script>alert(1)</script>", "//evil.example/image", "http://example/image"])(
  "falls back for unsupported image URL schemes: %s", (url) => {
    source = url;
    expect(renderToStaticMarkup(<ProfilePhotoUpload />)).toContain('src="/default-profile.svg"');
  },
);
