import type { GuideRewrite } from "../../rewrite-types";
import { guide as guide0 } from "./bike-fit-for-neck-and-shoulder-pain";
import { guide as guide1 } from "./bike-fit-for-tall-riders";
import { guide as guide2 } from "./carbs-per-hour-guide";
import { guide as guide3 } from "./cycling-fueling-basics";
import { guide as guide4 } from "./foot-measurement-guide-for-cyclists";
import { guide as guide5 } from "./handlebar-drop-guide";
import { guide as guide6 } from "./indoor-trainer-bike-fit-guide";
import { guide as guide7 } from "./pain-and-discomfort";
import { guide as guide8 } from "./ride-types";
import { guide as guide9 } from "./saddle-fore-aft-and-tilt-guide";
import { guide as guide10 } from "./sodium-and-electrolytes-guide";
import { guide as guide11 } from "./wkg-and-power-zones-guide";

export const batchDGuides = [
  guide0, guide1, guide2, guide3, guide4, guide5, guide6, guide7, guide8, guide9, guide10, guide11,
] as const satisfies readonly GuideRewrite[];
