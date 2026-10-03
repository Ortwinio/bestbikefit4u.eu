import type { ScoreRule } from "./types";

export const RIDER_RULES = [
  { key: "inseam", group: "measurements", weight: 20, fields: ["inseamCm"], body: true },
  { key: "height", group: "measurements", weight: 10, fields: ["heightCm"], body: true },
  { key: "torso", group: "measurements", weight: 8, fields: ["torsoLengthCm"], body: true },
  { key: "arm", group: "measurements", weight: 8, fields: ["armLengthCm"], body: true },
  { key: "flexibility", group: "mobility", weight: 8, fields: ["flexibilityScore"] },
  { key: "weight", group: "performance", weight: 6, fields: ["weightKg"], body: true },
  { key: "riderQuestions", group: "riding", weight: 6, fields: ["experienceLevel", "weeklyHours", "typicalRideLength"] },
  { key: "complaints", group: "comfort", weight: 6, fields: ["hasPain", "painAreas"], sensitive: true },
  { key: "shoulders", group: "measurements", weight: 5, fields: ["shoulderWidthCm"], body: true },
  { key: "ftp", group: "performance", weight: 5, fields: ["ftpWatts"] },
  { key: "sitBones", group: "measurements", weight: 5, fields: ["sitBoneWidthMm"], body: true },
  { key: "core", group: "mobility", weight: 4, fields: ["coreStabilityScore"] },
  { key: "goal", group: "riding", weight: 3, fields: ["positionPriority"] },
  { key: "femur", group: "measurements", weight: 3, fields: ["femurLengthCm"], body: true },
  { key: "footwear", group: "comfort", weight: 3, fields: ["shoeSizeEu", "cleatSystem"] },
] as const satisfies readonly ScoreRule[];

export const REFINEMENT_RULES = [
  { key: "femur", group: "measurements", weight: 5, fields: ["femurLengthCm"], body: true },
  { key: "foot", group: "measurements", weight: 4, fields: ["footLengthCm"], body: true },
  { key: "sitBones", group: "measurements", weight: 4, fields: ["sitBoneWidthMm"], body: true },
  { key: "hand", group: "measurements", weight: 2, fields: ["handSpanCm"], body: true },
  { key: "flexibilityTest", group: "mobility", weight: 3, fields: ["flexibilityTestCm"], body: true, zeroAllowed: true },
  { key: "coreTest", group: "mobility", weight: 2, fields: ["coreTestSeconds"], body: true, zeroAllowed: true },
] as const satisfies readonly ScoreRule[];

const baseRules = RIDER_RULES.filter(rule => !REFINEMENT_RULES.some(refinement => refinement.key === rule.key));
const baseTotal = baseRules.reduce((total, rule) => total + rule.weight, 0);
export const BASE_RIDER_RULES: readonly ScoreRule[] = baseRules.map(rule => ({ ...rule, weight: rule.weight * 80 / baseTotal }));

export const BIKE_RULES = [
  { key: "saddleHeight", group: "setup", weight: 10, fields: ["currentSetup.saddleHeightMm"] },
  { key: "saddleSetback", group: "setup", weight: 6, fields: ["currentSetup.saddleSetbackMm"], zeroAllowed: true },
  { key: "barReach", group: "setup", weight: 6, fields: ["currentSetup.handlebarReachMm"] },
  { key: "barDrop", group: "setup", weight: 6, fields: ["currentSetup.handlebarDropMm"], zeroAllowed: true },
  { key: "stem", group: "setup", weight: 5, fields: ["currentSetup.stemLengthMm", "currentSetup.stemAngle"], zeroAllowed: true },
  { key: "barWidth", group: "setup", weight: 3, fields: ["currentSetup.handlebarWidthMm"] },
  { key: "spacers", group: "setup", weight: 2, fields: ["currentSetup.spacersMm"], zeroAllowed: true },
  { key: "stack", group: "geometry", weight: 8, fields: ["currentGeometry.stackMm"] },
  { key: "reach", group: "geometry", weight: 8, fields: ["currentGeometry.reachMm"] },
  { key: "seatAngle", group: "geometry", weight: 4, fields: ["currentGeometry.seatTubeAngle"] },
  { key: "headAngle", group: "geometry", weight: 2, fields: ["currentGeometry.headTubeAngle"] },
  { key: "bikeType", group: "identity", weight: 5, fields: ["bikeType"] },
  { key: "model", group: "identity", weight: 5, fields: ["brand", "model", "year"] },
  { key: "frameSize", group: "identity", weight: 5, fields: ["currentGeometry.frameSize"] },
  { key: "crank", group: "drivetrain", weight: 4, fields: ["currentSetup.crankLengthMm"] },
  { key: "gears", group: "drivetrain", weight: 4, fields: ["gearing.chainrings", "gearing.cassetteTeeth"] },
  { key: "wheel", group: "drivetrain", weight: 2, fields: ["gearing.wheelCircumferenceMm"] },
  { key: "adjustment", group: "adjustment", weight: 3, fields: ["maxSeatpostMm", "maxSpacerStackMm"], zeroAllowed: true },
  { key: "bikeGoal", group: "adjustment", weight: 3, fields: ["primaryGoal"] },
  { key: "saddle", group: "contact", weight: 3, fields: ["saddleModel", "saddleWidthMm"] },
  { key: "pedals", group: "contact", weight: 2, fields: ["pedalModel", "cleatSystem"] },
  { key: "tires", group: "tires", weight: 4, fields: ["tires.widthFrontMm", "tires.widthRearMm", "tires.tubeType"] },
] as const satisfies readonly ScoreRule[];

export const BIKE_REFINEMENT_RULES = [
  { key: "barReach", group: "setup", weight: 6, fields: ["currentSetup.handlebarReachMm"] },
  { key: "barDrop", group: "setup", weight: 6, fields: ["currentSetup.handlebarDropMm"], zeroAllowed: true },
  { key: "seatAngle", group: "geometry", weight: 2, fields: ["currentGeometry.seatTubeAngle"] },
  { key: "headAngle", group: "geometry", weight: 2, fields: ["currentGeometry.headTubeAngle"] },
  { key: "gears", group: "drivetrain", weight: 4, fields: ["gearing.chainrings", "gearing.cassetteTeeth"] },
] as const satisfies readonly ScoreRule[];
const bikeBaseRules = BIKE_RULES.filter(rule => !BIKE_REFINEMENT_RULES.some(refinement => refinement.key === rule.key));
const bikeBaseTotal = bikeBaseRules.reduce((total, rule) => total + rule.weight, 0);
export const BASE_BIKE_RULES: readonly ScoreRule[] = bikeBaseRules.map(rule => ({ ...rule, weight: rule.weight * 80 / bikeBaseTotal }));
