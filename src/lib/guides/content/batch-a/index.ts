import type { GuideRewrite } from "../../rewrite-types";
import { beginners } from "./beginners";
import { cleatPosition } from "./cleat-position";
import { frameSize } from "./frame-size";
import { handlebarWidth } from "./handlebar-width";
import { insoles } from "./insoles";
import { kneePain } from "./knee-pain";
import { powerPacing } from "./power-pacing";
import { riderProfiles } from "./rider-profiles";
import { saddleHeight } from "./saddle-height";
import { shoeWidth } from "./shoe-width";
import { shortTorso } from "./short-torso";
import { stanceWidth } from "./stance-width";

export const batchAGuides = [
  beginners, shortTorso, kneePain, cleatPosition, shoeWidth, frameSize,
  handlebarWidth, insoles, powerPacing, riderProfiles, saddleHeight, stanceWidth,
] as const satisfies readonly GuideRewrite[];
