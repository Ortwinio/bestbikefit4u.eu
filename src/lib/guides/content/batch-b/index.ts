import type { GuideRewrite } from "../../rewrite-types";
import { footPain } from "./foot-pain";
import { limitedFlexibility } from "./limited-flexibility";
import { lowerBack } from "./lower-back";
import { climbTime } from "./climb-time";
import { endurance } from "./endurance";
import { ftp } from "./ftp";
import { compareBikes } from "./compare-bikes";
import { mountain } from "./mountain";
import { powerSpeed } from "./power-speed";
import { road } from "./road";
import { setup } from "./setup";
import { triathlon } from "./triathlon";

export const batchBGuides = [
  footPain, limitedFlexibility, lowerBack, climbTime, endurance, ftp,
  compareBikes, mountain, powerSpeed, road, setup, triathlon,
] as const satisfies readonly GuideRewrite[];
