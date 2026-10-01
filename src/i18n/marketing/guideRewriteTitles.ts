import { guideRewriteTitlesA } from "./guideRewriteTitlesA";
import { guideRewriteTitlesB } from "./guideRewriteTitlesB";
import { guideRewriteTitlesC } from "./guideRewriteTitlesC";

import { guideRewriteTitlesD } from "./guideRewriteTitlesD";

/** Lightweight titles shared by navigation and authored article links. */
export const guideRewriteTitles: Readonly<Record<string, { nl: string; en: string }>> = {
  ...guideRewriteTitlesA,
  ...guideRewriteTitlesB,
  ...guideRewriteTitlesC,
  ...guideRewriteTitlesD,
};
