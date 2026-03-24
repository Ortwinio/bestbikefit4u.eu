import type { Doc, Id } from "../../../../../convex/_generated/dataModel";

export type GeometryRecordSource = Doc<"geometry_records">["source"];

export type GeometryRecordDraft = {
  source: GeometryRecordSource;
  sourceUrl: string;
  changeReason: string;
  stack: number | null;
  reach: number | null;
  seatTubeAngle: number | null;
  headTubeAngle: number | null;
  wheelbase: number | null;
  chainstay: number | null;
  bbDrop: number | null;
  effectiveTopTube: number | null;
  standover: number | null;
  forkRake: number | null;
  headTubeLength: number | null;
};

export type GeometryMeasurementFieldKey =
  | "stack"
  | "reach"
  | "seatTubeAngle"
  | "headTubeAngle"
  | "wheelbase"
  | "chainstay"
  | "bbDrop"
  | "effectiveTopTube"
  | "standover"
  | "forkRake"
  | "headTubeLength";

export const geometryMeasurementFields: Array<{
  key: GeometryMeasurementFieldKey;
  label: string;
  unit: string;
}> = [
  { key: "stack", label: "Stack", unit: "mm" },
  { key: "reach", label: "Reach", unit: "mm" },
  { key: "seatTubeAngle", label: "Seat tube angle", unit: "°" },
  { key: "headTubeAngle", label: "Head tube angle", unit: "°" },
  { key: "wheelbase", label: "Wheelbase", unit: "mm" },
  { key: "chainstay", label: "Chainstay", unit: "mm" },
  { key: "bbDrop", label: "BB drop", unit: "mm" },
  { key: "effectiveTopTube", label: "Effective top tube", unit: "mm" },
  { key: "standover", label: "Standover", unit: "mm" },
  { key: "forkRake", label: "Fork rake", unit: "mm" },
  { key: "headTubeLength", label: "Head tube length", unit: "mm" },
];

export function createGeometryRecordDraft(
  record: {
    source: GeometryRecordSource;
    sourceUrl?: string | null;
    changeReason?: string | null;
    stack?: number | null;
    reach?: number | null;
    seatTubeAngle?: number | null;
    headTubeAngle?: number | null;
    wheelbase?: number | null;
    chainstay?: number | null;
    bbDrop?: number | null;
    effectiveTopTube?: number | null;
    standover?: number | null;
    forkRake?: number | null;
    headTubeLength?: number | null;
  }
): GeometryRecordDraft {
  return {
    source: record.source,
    sourceUrl: record.sourceUrl ?? "",
    changeReason: record.changeReason ?? "",
    stack: record.stack ?? null,
    reach: record.reach ?? null,
    seatTubeAngle: record.seatTubeAngle ?? null,
    headTubeAngle: record.headTubeAngle ?? null,
    wheelbase: record.wheelbase ?? null,
    chainstay: record.chainstay ?? null,
    bbDrop: record.bbDrop ?? null,
    effectiveTopTube: record.effectiveTopTube ?? null,
    standover: record.standover ?? null,
    forkRake: record.forkRake ?? null,
    headTubeLength: record.headTubeLength ?? null,
  };
}

export function buildGeometryRecordCreateArgs({
  brandId,
  modelId,
  sizeLabel,
  draft,
}: {
  brandId: Id<"geometry_brands">;
  modelId: Id<"geometry_models">;
  sizeLabel: string;
  draft: GeometryRecordDraft;
}) {
  return {
    brandId,
    modelId,
    sizeLabel: sizeLabel.trim(),
    source: draft.source,
    sourceUrl: draft.sourceUrl.trim() || undefined,
    changeReason: draft.changeReason.trim() || undefined,
    stack: draft.stack ?? undefined,
    reach: draft.reach ?? undefined,
    seatTubeAngle: draft.seatTubeAngle ?? undefined,
    headTubeAngle: draft.headTubeAngle ?? undefined,
    wheelbase: draft.wheelbase ?? undefined,
    chainstay: draft.chainstay ?? undefined,
    bbDrop: draft.bbDrop ?? undefined,
    effectiveTopTube: draft.effectiveTopTube ?? undefined,
    standover: draft.standover ?? undefined,
    forkRake: draft.forkRake ?? undefined,
    headTubeLength: draft.headTubeLength ?? undefined,
  };
}

export function getNextGeometryVersion(
  versionHistory: Array<Pick<Doc<"geometry_records">, "version">>
) {
  return versionHistory.reduce((maxVersion, item) => Math.max(maxVersion, item.version), 0) + 1;
}
