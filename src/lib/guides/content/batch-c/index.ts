import type { GuideRewrite } from "../../rewrite-types";
import { bikeSize } from "./bike-size";
import { crankLength } from "./crank-length";
import { fitScience } from "./fit-science";
import { gravelFit } from "./gravel-fit";
import { handNumbness } from "./hand-numbness";
import { hydration } from "./hydration";
import { nutrition } from "./nutrition";
import { onlineLimits } from "./online-limits";
import { raceEndurance } from "./race-endurance";
import { reachStem } from "./reach-stem";
import { saddlePressure } from "./saddle-pressure";
import { shoeCleat } from "./shoe-cleat";

export const batchCGuides = [
  handNumbness, saddlePressure, bikeSize, crankLength, fitScience, gravelFit,
  hydration, nutrition, reachStem, raceEndurance, shoeCleat, onlineLimits,
] as const satisfies readonly GuideRewrite[];
