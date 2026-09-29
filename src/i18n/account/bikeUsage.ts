import type { Locale } from "@/i18n/config";

type BikeUsageCopy = {
  experience: Record<string, string>;
  weeklyHours: Record<string, string>;
  rideLength: Record<string, string>;
  positionPriority: Record<string, string>;
  roadRiding: Record<string, string>;
  terrain: Record<string, string>;
  painAreas: Record<string, string>;
  climbing: Record<string, string>;
  otherDiscomfort: string;
};

const bikeUsage: Record<Locale, BikeUsageCopy> = {
  nl: {
    experience: { beginner: "Beginner", intermediate: "Enige ervaring", advanced: "Gevorderd" },
    weeklyHours: { "0-3": "0–3 uur/week", "3-6": "3–6 uur/week", "6-10": "6–10 uur/week", "10-15": "10–15 uur/week", "15+": "15+ uur/week" },
    rideLength: { short: "Kort (<30 km)", medium: "Gemiddeld (30–80 km)", long: "Lang (80–150 km)", ultra: "Zeer lang (150+ km)" },
    positionPriority: { comfort: "Maximaal comfort", balanced: "Gebalanceerd", performance: "Prestatiegericht" },
    roadRiding: { casual: "Ontspannen / conditie", group: "Groepsritten", training: "Gerichte training", racing: "Wedstrijden", tt: "Tijdrit / triatlon" },
    terrain: { asphalt: "Alleen asfalt", paved: "Verhard + licht gravel", xc: "Crosscountry", trail: "Trails", enduro: "Enduro", dh: "Downhill / bikepark" },
    painAreas: { knee_front: "Voorkant knie", knee_back: "Achterkant knie", lower_back: "Onderrug", neck: "Nek / schouders", hands: "Handen", saddle: "Zadelgebied", feet: "Voeten" },
    climbing: { rarely: "Zelden klimmen", occasional: "Af en toe klimmen", regular: "Regelmatig klimmen", climbing_focused: "Gericht op klimmen" },
    otherDiscomfort: "Overig ongemak",
  },
  en: {
    experience: { beginner: "Beginner", intermediate: "Intermediate", advanced: "Advanced" },
    weeklyHours: { "0-3": "0–3 hrs/week", "3-6": "3–6 hrs/week", "6-10": "6–10 hrs/week", "10-15": "10–15 hrs/week", "15+": "15+ hrs/week" },
    rideLength: { short: "Short (<30 km)", medium: "Medium (30–80 km)", long: "Long (80–150 km)", ultra: "Ultra (150+ km)" },
    positionPriority: { comfort: "Maximum comfort", balanced: "Balanced", performance: "Performance" },
    roadRiding: { casual: "Casual / fitness", group: "Group rides", training: "Structured training", racing: "Racing", tt: "Time trial / triathlon" },
    terrain: { asphalt: "Asphalt only", paved: "Paved + light gravel", xc: "Cross-country", trail: "Trail", enduro: "Enduro", dh: "Downhill / bike park" },
    painAreas: { knee_front: "Front of knee", knee_back: "Back of knee", lower_back: "Lower back", neck: "Neck / shoulders", hands: "Hands", saddle: "Saddle area", feet: "Feet" },
    climbing: { rarely: "Rarely climbs", occasional: "Occasional climbs", regular: "Regular climbing", climbing_focused: "Climbing-focused" },
    otherDiscomfort: "Other discomfort",
  },
};

export function getBikeUsageCopy(locale: Locale): BikeUsageCopy {
  return bikeUsage[locale];
}
