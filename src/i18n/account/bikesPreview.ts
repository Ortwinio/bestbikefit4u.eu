import type { Locale } from "@/i18n/config";

const en = {
  title: "Current position and target",
  description:
    "Explore changes in this preview. Sliders do not change your saved measurements or fit report.",
  diagram: "Illustrative bike position comparison; differences are exaggerated",
  legend: "Solid petrol: target. Dashed ink: preview. Illustration is not to scale.",
  saddle: "Saddle height",
  drop: "Handlebar drop",
  reach: "Handlebar reach",
  target: "Target",
  saved: "Saved",
  difference: "Difference",
  unknown: "Not entered",
  reset: "Reset preview",
};
const nl: typeof en = {
  title: "Nu en je doelpositie",
  description:
    "Verken veranderingen in deze voorvertoning. De schuiven wijzigen je opgeslagen maten en fitrapport niet.",
  diagram: "Illustratieve vergelijking van fietsposities; verschillen zijn uitvergroot",
  legend: "Petrol lijn: doel. Gestippelde inktlijn: voorvertoning. Illustratie is niet op schaal.",
  saddle: "Zadelhoogte",
  drop: "Stuurdrop",
  reach: "Stuurreach",
  target: "Doel",
  saved: "Opgeslagen",
  difference: "Verschil",
  unknown: "Niet ingevuld",
  reset: "Herstel voorvertoning",
};
export const getBikesPreviewCopy = (locale: Locale) => (locale === "nl" ? nl : en);
