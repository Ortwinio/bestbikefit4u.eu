export type BikeType =
  | "road"
  | "gravel"
  | "mountain"
  | "hybrid"
  | "tt_triathlon"
  | "cyclocross"
  | "touring"
  | "city";

export type PublicShowcaseBike = {
  showcaseId: string;
  brand: string;
  model: string;
  bikeType: BikeType;
  photoUrl: string | null;
  geometry: {
    stackMm: number | null;
    reachMm: number | null;
    effectiveTopTubeMm: number | null;
    seatTubeAngle: number | null;
    headTubeAngle: number | null;
    wheelbaseMm: number | null;
    sizeLabel: string | null;
    source: "geometry_record" | "manual";
    yearLabel: string | null;
  };
  pressure: {
    frontMinBar: number | null;
    frontMaxBar: number | null;
    rearMinBar: number | null;
    rearMaxBar: number | null;
    tyreWidthMm: number | null;
    tubeless: boolean | null;
    hasData: boolean;
  };
};
