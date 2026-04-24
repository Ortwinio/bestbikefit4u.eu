import type { Id } from "../_generated/dataModel";
import { query } from "../_generated/server";

function buildYearLabel(yearStart?: number, yearEnd?: number): string | null {
  if (yearStart && yearEnd && yearStart !== yearEnd) {
    return `${yearStart}–${yearEnd}`;
  }
  return yearStart ? String(yearStart) : yearEnd ? String(yearEnd) : null;
}

async function resolvePhotoUrl(
  ctx: { storage: { getUrl: (id: Id<"_storage">) => Promise<string | null> } },
  storageId: string | undefined,
  fallbackPhotoUrl: string | undefined
): Promise<string | null> {
  if (storageId) {
    // storageId may be a plain URL string (external photo) rather than a Convex Storage ID
    if (storageId.startsWith("https://") || storageId.startsWith("http://")) {
      return storageId;
    }
    try {
      return await ctx.storage.getUrl(storageId as Id<"_storage">);
    } catch {
      // fall through to fallback
    }
  }
  if (fallbackPhotoUrl) {
    return fallbackPhotoUrl;
  }
  return null;
}

export const getMarketingShowcaseBikes = query({
  args: {},
  handler: async (ctx) => {
    const eligibleBikes = await ctx.db
      .query("bikes")
      .withIndex("by_marketing_eligible", (q) =>
        q.eq("marketingEligible", true)
      )
      .collect();

    // Sort by marketingEligibleAt descending, take top 5
    const sorted = [...eligibleBikes]
      .filter((b) => b.marketingEligible === true)
      .sort((a, b) => (b.marketingEligibleAt ?? 0) - (a.marketingEligibleAt ?? 0))
      .slice(0, 5);

    const results = await Promise.all(
      sorted.map(async (bike) => {
        // Resolve primary photo
        const primaryPhoto = await ctx.db
          .query("bikePhotos")
          .withIndex("by_bike_primary", (q) =>
            q.eq("bikeId", bike._id).eq("isPrimary", true)
          )
          .first();

        const photoUrl = await resolvePhotoUrl(
          ctx,
          primaryPhoto?.storageId,
          bike.photoUrl
        );

        // Resolve geometry
        let geometry: {
          stackMm: number | null;
          reachMm: number | null;
          effectiveTopTubeMm: number | null;
          seatTubeAngle: number | null;
          headTubeAngle: number | null;
          wheelbaseMm: number | null;
          sizeLabel: string | null;
          source: "geometry_record" | "manual";
          yearLabel: string | null;
        } = {
          stackMm: null,
          reachMm: null,
          effectiveTopTubeMm: null,
          seatTubeAngle: null,
          headTubeAngle: null,
          wheelbaseMm: null,
          sizeLabel: null,
          source: "manual",
          yearLabel: null,
        };

        if (bike.geometryRecordId) {
          const record = await ctx.db.get(bike.geometryRecordId);
          if (record && record.status === "active") {
            const model = await ctx.db.get(record.modelId);
            geometry = {
              stackMm: record.stack ?? null,
              reachMm: record.reach ?? null,
              effectiveTopTubeMm: record.effectiveTopTube ?? null,
              seatTubeAngle: record.seatTubeAngle ?? null,
              headTubeAngle: record.headTubeAngle ?? null,
              wheelbaseMm: record.wheelbase ?? null,
              sizeLabel: record.sizeLabel,
              source: "geometry_record",
              yearLabel: buildYearLabel(model?.yearStart, model?.yearEnd),
            };
          }
        } else if (bike.currentGeometry) {
          geometry = {
            stackMm: bike.currentGeometry.stackMm ?? null,
            reachMm: bike.currentGeometry.reachMm ?? null,
            effectiveTopTubeMm: null,
            seatTubeAngle: bike.currentGeometry.seatTubeAngle ?? null,
            headTubeAngle: bike.currentGeometry.headTubeAngle ?? null,
            wheelbaseMm: null,
            sizeLabel: bike.currentGeometry.frameSize ?? null,
            source: "manual",
            yearLabel: null,
          };
        }

        // Resolve pressure — find most recent pressure profile for this bike
        const pressureProfile = await ctx.db
          .query("pressureProfiles")
          .withIndex("by_bike", (q) => q.eq("bikeId", bike._id))
          .order("desc")
          .first();

        let pressure: {
          frontMinBar: number | null;
          frontMaxBar: number | null;
          rearMinBar: number | null;
          rearMaxBar: number | null;
          tyreWidthMm: number | null;
          tubeless: boolean | null;
          hasData: boolean;
        } = {
          frontMinBar: null,
          frontMaxBar: null,
          rearMinBar: null,
          rearMaxBar: null,
          tyreWidthMm: null,
          tubeless: null,
          hasData: false,
        };

        if (pressureProfile) {
          // Build a ±0.3 bar range around the recommended value as an illustrative range
          const frontCenter = pressureProfile.recommendedFrontBar;
          const rearCenter = pressureProfile.recommendedRearBar;
          const delta = 0.3;

          const tireSetup = await ctx.db.get(pressureProfile.tireSetupId);

          pressure = {
            frontMinBar: Math.round((frontCenter - delta) * 10) / 10,
            frontMaxBar: Math.round((frontCenter + delta) * 10) / 10,
            rearMinBar: Math.round((rearCenter - delta) * 10) / 10,
            rearMaxBar: Math.round((rearCenter + delta) * 10) / 10,
            tyreWidthMm: tireSetup?.widthFrontMm ?? null,
            tubeless: tireSetup ? tireSetup.tubeType === "tubeless" : null,
            hasData: true,
          };
        }

        // Convex ids are already opaque enough for this public showcase use case.
        const showcaseId = String(bike._id);

        return {
          showcaseId,
          brand: bike.brand ?? "",
          model: bike.model ?? "",
          bikeType: bike.bikeType,
          photoUrl,
          geometry,
          pressure,
        };
      })
    );

    return results;
  },
});
