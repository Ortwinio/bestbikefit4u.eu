import type { Locale } from "@/i18n/config";

export const homeRoutes = {
  nl: {
    title: "Kies je route", steps: "stappen", navigation: "Stappen", reportTitle: "Van meten naar je fitplan",
    reportLines: ["Meet lengte, binnenbeen en armlengte met de meetgids.", "Kies je fiets of vul de geometrie zelf in.", "Krijg zadel, reach en cockpit in millimeters."],
    routes: [
      { id: "posture", title: "Mijn houding", description: "Van zadelhoogte tot complete bike fit. Elke stap neemt je maten mee.", start: "Start met zadelhoogte", labels: ["Zadelhoogte", "Framemaat", "Cranklengte", "Zadelbreedte", "Volledige bike fit"] },
      { id: "ride", title: "Mijn rit", description: "Van bandenspanning tot voeding. Je gewicht, fiets en vermogen gaan mee.", start: "Start met bandenspanning", labels: ["Bandenspanning", "Verzet", "Klimplanner", "Vermogen en snelheid", "FTP en W/kg", "Voeding en vocht"] },
    ],
  },
  en: {
    title: "Choose your route", steps: "steps", navigation: "Steps", reportTitle: "From measurements to your fit plan",
    reportLines: ["Measure height, inseam and arm length with the measurement guide.", "Choose your bike or enter its geometry.", "Get saddle, reach and cockpit measurements in millimeters."],
    routes: [
      { id: "posture", title: "My posture", description: "From saddle height to a complete bike fit. Each step carries your measurements forward.", start: "Start with saddle height", labels: ["Saddle height", "Frame size", "Crank length", "Saddle width", "Complete bike fit"] },
      { id: "ride", title: "My ride", description: "From tire pressure to nutrition. Your weight, bike and power carry forward.", start: "Start with tire pressure", labels: ["Tire pressure", "Gearing", "Climb planner", "Power and speed", "FTP and W/kg", "Fuel and hydration"] },
    ],
  },
} satisfies Record<Locale, unknown>;
