export type BikeType =
  | "road"
  | "gravel"
  | "mountain"
  | "hybrid"
  | "tt_triathlon"
  | "cyclocross"
  | "touring"
  | "city";

export const BIKE_TYPE_OPTIONS: Array<{
  value: BikeType;
  label: string;
  description: string;
}> = [
  {
    value: "road",
    label: "Road Bike",
    description: "Drop bars, endurance or race geometry",
  },
  {
    value: "gravel",
    label: "Gravel Bike",
    description: "Drop bars, relaxed geometry for mixed terrain",
  },
  {
    value: "mountain",
    label: "Mountain Bike",
    description: "Flat bars, trail or XC geometry",
  },
  {
    value: "hybrid",
    label: "Hybrid Bike",
    description: "Flat bars, road + comfort mixed use",
  },
  {
    value: "tt_triathlon",
    label: "TT / Triathlon",
    description: "Aerodynamic setup for time trials and triathlon",
  },
  {
    value: "cyclocross",
    label: "Cyclocross Bike",
    description: "Drop bars for CX courses and mixed conditions",
  },
  {
    value: "touring",
    label: "Touring Bike",
    description: "Long-distance stability with loaded comfort",
  },
  {
    value: "city",
    label: "City / Commute",
    description: "Upright position for daily comfort",
  },
];

export const BIKE_TYPE_LABELS: Record<BikeType, string> = {
  road: "Road",
  gravel: "Gravel",
  mountain: "Mountain",
  hybrid: "Hybrid",
  tt_triathlon: "TT / Triathlon",
  cyclocross: "Cyclocross",
  touring: "Touring",
  city: "City",
};

export function isAeroCompatibleBikeType(bikeType: BikeType | ""): boolean {
  return bikeType === "road" || bikeType === "tt_triathlon" || bikeType === "";
}
