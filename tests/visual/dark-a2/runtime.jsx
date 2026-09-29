import { getFunctionName } from "convex/server";
import * as baseline from "../final-sweep/account-fixture-bikes-runtime";

export * from "../final-sweep/account-fixture-bikes-runtime";

export function useQuery(reference, args) {
  const value = baseline.useQuery(reference, args);
  if (args !== "skip" && baseline.fixture === "gallery" &&
    getFunctionName(reference) === "bikes/queries:getDetail") {
    return {
      ...value,
      photos: [
        { id: "photo-one", storageId: `${location.origin}/illustrations/03-cockpit-afstellen.webp`,
          isPrimary: true, isLegacy: false },
        { id: "photo-two", storageId: `${location.origin}/illustrations/03-cockpit-afstellen.webp`,
          isPrimary: false, isLegacy: false },
      ],
    };
  }
  return value;
}
