export type AdminRiderFlag =
  | "measurement_outlier"
  | "missing_measurement"
  | "injury_follow_up"
  | "needs_manual_review";

export type AdminRiderRecord = {
  userId: string;
  name: string;
  email: string;
  plan: "free" | "pro" | "premium";
  heightCm: number;
  inseamCm: number;
  armLengthCm: number;
  torsoLengthCm: number;
  shoulderWidthCm: number;
  weightKg: number;
  lastFitAt: string;
  bikeCount: number;
  fitRunCount: number;
  reviewStatus: "queue" | "reviewed" | "flagged";
  flags: AdminRiderFlag[];
  notes: string;
  profileSummary: string;
};

export type AdminBikeRecord = {
  bikeId: string;
  ownerUserId: string;
  ownerName: string;
  ownerEmail: string;
  brand: string;
  model: string;
  size: string;
  category: "road" | "gravel" | "mtb" | "hybrid" | "tt" | "city";
  geometryRecordId?: string;
  geometryLabel?: string;
  createdAt: string;
  notes: string;
};

export type AdminGeometryBrand = {
  brandId: string;
  name: string;
  slug: string;
  website: string;
  modelCount: number;
  activeRecordCount: number;
  recordCoverage: number;
};

export type AdminGeometryModel = {
  modelId: string;
  brandId: string;
  name: string;
  category: "road" | "gravel" | "mtb" | "tt" | "endurance" | "city" | "other";
  yearStart: number;
  yearEnd: number;
  activeSizeCount: number;
  recordCount: number;
  notes: string;
};

export type AdminGeometryRecord = {
  recordId: string;
  brandId: string;
  modelId: string;
  modelName: string;
  sizeLabel: string;
  version: number;
  status: "draft" | "active" | "superseded" | "rejected";
  source: "manufacturer" | "admin_import" | "admin_manual" | "user_entered";
  sourceUrl?: string;
  changeReason?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  stack: number;
  reach: number;
  seatTubeAngle: number;
  headTubeAngle: number;
  wheelbase: number;
  chainstay: number;
  bbDrop: number;
  effectiveTopTube: number;
  standover: number;
  forkRake: number;
  headTubeLength: number;
};

export const adminRiderRecords: AdminRiderRecord[] = [
  {
    userId: "user_ellie",
    name: "Ellie Vermeer",
    email: "ellie@example.com",
    plan: "premium",
    heightCm: 172,
    inseamCm: 79,
    armLengthCm: 60,
    torsoLengthCm: 58,
    shoulderWidthCm: 39,
    weightKg: 64,
    lastFitAt: "2026-03-20",
    bikeCount: 3,
    fitRunCount: 5,
    reviewStatus: "queue",
    flags: ["measurement_outlier", "needs_manual_review"],
    notes: "Check inseam ratio against recent fit trace.",
    profileSummary: "Long torso, moderately flexible rider with a new gravel bike.",
  },
  {
    userId: "user_omar",
    name: "Omar de Wit",
    email: "omar@example.com",
    plan: "pro",
    heightCm: 184,
    inseamCm: 85,
    armLengthCm: 66,
    torsoLengthCm: 62,
    shoulderWidthCm: 42,
    weightKg: 76,
    lastFitAt: "2026-03-18",
    bikeCount: 2,
    fitRunCount: 2,
    reviewStatus: "reviewed",
    flags: ["injury_follow_up"],
    notes: "Knee pain follow-up already completed.",
    profileSummary: "Endurance focus with an ongoing recovery note.",
  },
  {
    userId: "user_sara",
    name: "Sara Jansen",
    email: "sara@example.com",
    plan: "free",
    heightCm: 168,
    inseamCm: 76,
    armLengthCm: 58,
    torsoLengthCm: 57,
    shoulderWidthCm: 38,
    weightKg: 59,
    lastFitAt: "2026-03-12",
    bikeCount: 1,
    fitRunCount: 1,
    reviewStatus: "flagged",
    flags: ["missing_measurement"],
    notes: "Missing flexibility entry, needs manual review.",
    profileSummary: "Initial onboarding incomplete.",
  },
];

export const adminBikeRecords: AdminBikeRecord[] = [
  {
    bikeId: "bike_road_01",
    ownerUserId: "user_ellie",
    ownerName: "Ellie Vermeer",
    ownerEmail: "ellie@example.com",
    brand: "Canyon",
    model: "Endurace CF SLX",
    size: "S",
    category: "road",
    geometryRecordId: "geom_road_54_v3",
    geometryLabel: "54 / active",
    createdAt: "2026-03-02",
    notes: "Main endurance bike, linked to active geometry record.",
  },
  {
    bikeId: "bike_gravel_02",
    ownerUserId: "user_ellie",
    ownerName: "Ellie Vermeer",
    ownerEmail: "ellie@example.com",
    brand: "Orbea",
    model: "Terra",
    size: "M",
    category: "gravel",
    createdAt: "2026-02-18",
    notes: "New gravel setup awaiting geometry link.",
  },
  {
    bikeId: "bike_city_03",
    ownerUserId: "user_sara",
    ownerName: "Sara Jansen",
    ownerEmail: "sara@example.com",
    brand: "Gazelle",
    model: "Ultimate C8",
    size: "L",
    category: "city",
    geometryRecordId: "geom_city_l_v1",
    geometryLabel: "L / draft",
    createdAt: "2026-01-21",
    notes: "Comfort commuter with upright position.",
  },
];

export const adminGeometryBrands: AdminGeometryBrand[] = [
  {
    brandId: "brand_canyon",
    name: "Canyon",
    slug: "canyon",
    website: "https://www.canyon.com",
    modelCount: 4,
    activeRecordCount: 18,
    recordCoverage: 0.9,
  },
  {
    brandId: "brand_orbea",
    name: "Orbea",
    slug: "orbea",
    website: "https://www.orbea.com",
    modelCount: 3,
    activeRecordCount: 12,
    recordCoverage: 0.75,
  },
  {
    brandId: "brand_gazelle",
    name: "Gazelle",
    slug: "gazelle",
    website: "https://www.gazelle.nl",
    modelCount: 2,
    activeRecordCount: 6,
    recordCoverage: 0.6,
  },
];

export const adminGeometryModels: AdminGeometryModel[] = [
  {
    modelId: "model_endurace",
    brandId: "brand_canyon",
    name: "Endurace CF SLX",
    category: "endurance",
    yearStart: 2024,
    yearEnd: 2026,
    activeSizeCount: 6,
    recordCount: 7,
    notes: "Road endurance platform with stable fit geometry.",
  },
  {
    modelId: "model_terra",
    brandId: "brand_orbea",
    name: "Terra",
    category: "gravel",
    yearStart: 2023,
    yearEnd: 2026,
    activeSizeCount: 4,
    recordCount: 5,
    notes: "All-road geometry with moderate stack.",
  },
  {
    modelId: "model_ultimate",
    brandId: "brand_gazelle",
    name: "Ultimate C8",
    category: "city",
    yearStart: 2022,
    yearEnd: 2025,
    activeSizeCount: 3,
    recordCount: 4,
    notes: "Comfort-first urban geometry.",
  },
];

export const adminGeometryRecords: AdminGeometryRecord[] = [
  {
    recordId: "geom_road_54_v3",
    brandId: "brand_canyon",
    modelId: "model_endurace",
    modelName: "Endurace CF SLX",
    sizeLabel: "54",
    version: 3,
    status: "active",
    source: "manufacturer",
    sourceUrl: "https://www.canyon.com",
    changeReason: "Imported from manufacturer update",
    reviewedBy: "geometry_manager",
    reviewedAt: "2026-03-08",
    stack: 571,
    reach: 387,
    seatTubeAngle: 73.5,
    headTubeAngle: 73.25,
    wheelbase: 987,
    chainstay: 410,
    bbDrop: 72,
    effectiveTopTube: 542,
    standover: 790,
    forkRake: 50,
    headTubeLength: 151,
  },
  {
    recordId: "geom_terra_m_v2",
    brandId: "brand_orbea",
    modelId: "model_terra",
    modelName: "Terra",
    sizeLabel: "M",
    version: 2,
    status: "draft",
    source: "admin_manual",
    changeReason: "Manual correction for revised stack value",
    stack: 581,
    reach: 392,
    seatTubeAngle: 73,
    headTubeAngle: 72.5,
    wheelbase: 1001,
    chainstay: 425,
    bbDrop: 70,
    effectiveTopTube: 548,
    standover: 801,
    forkRake: 51,
    headTubeLength: 152,
  },
  {
    recordId: "geom_city_l_v1",
    brandId: "brand_gazelle",
    modelId: "model_ultimate",
    modelName: "Ultimate C8",
    sizeLabel: "L",
    version: 1,
    status: "draft",
    source: "admin_import",
    changeReason: "Imported from CSV preview",
    stack: 615,
    reach: 406,
    seatTubeAngle: 72.5,
    headTubeAngle: 71.5,
    wheelbase: 1072,
    chainstay: 460,
    bbDrop: 62,
    effectiveTopTube: 569,
    standover: 826,
    forkRake: 47,
    headTubeLength: 186,
  },
];

export function getGeometryRecord(recordId: string) {
  return adminGeometryRecords.find((record) => record.recordId === recordId) ?? null;
}

export function getGeometryModel(modelId: string) {
  return adminGeometryModels.find((model) => model.modelId === modelId) ?? null;
}

export function getGeometryBrand(brandId: string) {
  return adminGeometryBrands.find((brand) => brand.brandId === brandId) ?? null;
}
