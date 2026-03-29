import { beforeEach, describe, expect, it, vi } from "vitest";

type TestHandler = (ctx: unknown, args: unknown) => Promise<unknown>;

const { getAuthUserIdMock } = vi.hoisted(() => ({
  getAuthUserIdMock: vi.fn(),
}));

vi.mock("@convex-dev/auth/server", () => ({
  getAuthUserId: getAuthUserIdMock,
}));

import { previewBikeImport } from "../actions";

describe("marktplaats preview action", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getAuthUserIdMock.mockResolvedValue("user_1");
  });

  it("returns raw advert text and derived signals in the preview payload", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        new Response(
          `
            <html>
              <head>
                <title>Canyon Aeroad maat M Ultegra</title>
                <meta property="og:title" content="Canyon Aeroad maat M Ultegra" />
                <meta property="og:image" content="//images.marktplaats.nl/api/v1/listing/aeroad.jpg" />
              </head>
              <body>
                <div data-testid="description">
                  Nette fiets in goede staat. Maat M met Shimano Ultegra, carbon frame en onderhoudshistorie.
                </div>
              </body>
            </html>
          `,
          { status: 200, headers: { "content-type": "text/html" } }
        )
      )
    );

    const runQuery = vi.fn(async () => null);
    const runMutation = vi.fn(async () => "import_1");
    const handler = (previewBikeImport as unknown as { _handler: TestHandler })._handler;

    const result = (await handler(
      {
        runQuery,
        runMutation,
      },
      {
        sourceUrl: "https://www.marktplaats.nl/v/fietsen/m123-canyon-aeroad",
      }
    )) as {
      rawDescription?: string;
      derivedSignals: {
        sizeMentions: string[];
        componentMentions: string[];
        conditionMentions: string[];
        maintenanceMentions: string[];
        previewWarnings: string[];
      };
      imageUrls: string[];
    };

    expect(result.rawDescription).toContain("onderhoudshistorie");
    expect(result.derivedSignals.sizeMentions).toContain("maat M");
    expect(result.derivedSignals.componentMentions).toEqual(
      expect.arrayContaining(["Shimano Ultegra", "Carbon frame"])
    );
    expect(result.derivedSignals.conditionMentions).toContain("Good condition");
    expect(result.derivedSignals.maintenanceMentions).toContain(
      "Maintenance history included"
    );
    expect(result.imageUrls[0]).toBe(
      "https://images.marktplaats.nl/api/v1/listing/aeroad.jpg"
    );
    expect(runMutation).toHaveBeenCalled();
  });
});
