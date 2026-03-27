import type { Metadata } from "next";
import { getDashboardMessages } from "@/i18n/dashboardMessages";
import { getRequestLocale } from "@/i18n/request";
import { ProfileImproveGuideClient } from "@/components/profile/ProfileImproveGuideClient";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const messages = getDashboardMessages(locale);

  return {
    title: messages.profile.improve.coreStability.title,
  };
}

export default async function ImproveCoreStabilityPage() {
  const locale = await getRequestLocale();
  const isNl = locale === "nl";

  return (
    <ProfileImproveGuideClient
      variant="coreStability"
      exercises={isNl ? [
        {
          name: "Front plank",
          detail: "Je referentie-oefening om stabiel te blijven onder belasting in een agressieve fietshouding.",
          cadence: "3 sets, 3x per week",
          steps: [
            "Ga op je onderarmen en tenen staan met een rechte lijn van hoofd tot hielen.",
            "Span je buikspieren aan en knijp je bilspieren samen.",
            "Stop de set zodra de heupen gaan hangen of juist te hoog komen.",
          ],
        },
        {
          name: "Dead bug",
          detail: "Bouwt anti-extensiecontrole op zodat je onderrug rustig blijft tijdens langere ritten.",
          cadence: "3 sets van 10 herhalingen per kant, 3x per week",
          steps: [
            "Ga op je rug liggen met knieën in 90 graden en armen recht omhoog.",
            "Laat langzaam de tegenoverliggende arm en het been zakken zonder je onderrug hol te trekken.",
            "Kom terug naar het midden en wissel van kant.",
          ],
        },
        {
          name: "Bird dog",
          detail: "Verbetert kruislingse stabiliteit, wat helpt wanneer je hard trapt of beweegt op ruwer terrein.",
          cadence: "3 sets van 10 herhalingen per kant, 3x per week",
          steps: [
            "Begin op handen en knieën met een neutrale wervelkolom.",
            "Strek één arm naar voren en het tegenoverliggende been naar achteren.",
            "Houd 2-3 seconden vast en kom gecontroleerd terug.",
          ],
        },
        {
          name: "Side plank",
          detail: "Richt zich op de laterale core zodat je minder door je romp gaat wiebelen wanneer je vermogen levert.",
          cadence: "30 seconden per kant, 2x per week",
          steps: [
            "Houd schouders en heupen in één lijn.",
            "Duw de vloer weg via je onderarm.",
            "Blijf rustig ademen zonder dat je heupen wegzakken.",
          ],
        },
        {
          name: "Glute bridge",
          detail: "Versterkt de achterste keten die je bekken en onderrug op de fiets ondersteunt.",
          cadence: "3 sets van 15 herhalingen, 3x per week",
          steps: [
            "Ga op je rug liggen met platte voeten op de grond en gebogen knieën.",
            "Duw via de hielen en til je heupen op tot je lichaam een rechte lijn vormt.",
            "Pauzeer kort bovenin en zak langzaam terug.",
          ],
        },
      ] : [
        {
          name: "Front plank",
          detail: "Your benchmark exercise for staying stable under load in an aggressive riding posture.",
          cadence: "3 sets, 3x/week",
          steps: [
            "Set up on forearms and toes with a straight line from head to heels.",
            "Brace the abs and squeeze the glutes.",
            "Stop the set when the hips sag or lift too high.",
          ],
        },
        {
          name: "Dead bug",
          detail: "Builds anti-extension control so your lower back stays quiet on longer rides.",
          cadence: "3 sets of 10 reps per side, 3x/week",
          steps: [
            "Lie on your back with knees bent to 90 degrees and arms straight up.",
            "Lower the opposite arm and leg slowly without arching the lower back.",
            "Return to center and switch sides.",
          ],
        },
        {
          name: "Bird dog",
          detail: "Improves cross-body stability, which helps when you pedal hard and move around on rough roads.",
          cadence: "3 sets of 10 reps per side, 3x/week",
          steps: [
            "Start on hands and knees with a neutral spine.",
            "Reach one arm forward and the opposite leg back.",
            "Pause for 2-3 seconds before returning under control.",
          ],
        },
        {
          name: "Side plank",
          detail: "Targets the lateral core so you can resist rocking through the torso when producing power.",
          cadence: "30 seconds per side, 2x/week",
          steps: [
            "Stack shoulders and hips in one line.",
            "Push the floor away through the forearm.",
            "Hold steady breathing without letting the hips drop.",
          ],
        },
        {
          name: "Glute bridge",
          detail: "Strengthens the posterior chain that supports your pelvis and lower back on the bike.",
          cadence: "3 sets of 15 reps, 3x/week",
          steps: [
            "Lie on your back with feet flat and knees bent.",
            "Drive through the heels and lift the hips until the body forms a straight line.",
            "Pause briefly at the top before lowering slowly.",
          ],
        },
      ]}
      progressTips={isNl ? [
        "Train je core 3 keer per week op niet-opeenvolgende dagen voor gestage vooruitgang.",
        "Test je front plank elke 4 weken opnieuw met strakke vorm, niet op maximale tijd met compensaties.",
        "Werk je score in je profiel bij zodra je de volgende categorie consistent haalt.",
      ] : [
        "Train core strength 3 times per week on non-consecutive days for steady progress.",
        "Retest your front plank every 4 weeks using strict form, not max time with compensation.",
        "When your hold time consistently reaches the next tier, update your score in the profile.",
      ]}
    />
  );
}
