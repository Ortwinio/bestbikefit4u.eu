import type { Metadata } from "next";
import { getDashboardMessages } from "@/i18n/dashboardMessages";
import { getRequestLocale } from "@/i18n/request";
import { ProfileImproveGuideClient } from "@/components/profile/ProfileImproveGuideClient";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const messages = getDashboardMessages(locale);

  return {
    title: messages.profile.improve.flexibility.title,
  };
}

export default async function ImproveFlexibilityPage() {
  const locale = await getRequestLocale();
  const isNl = locale === "nl";

  return (
    <ProfileImproveGuideClient
      variant="flexibility"
      exercises={isNl ? [
        {
          name: "Zittende hamstring stretch",
          detail: "Verbetert direct de hamstringmobiliteit die bar drop en bekkenkanteling op de fiets beperkt.",
          cadence: "3 sets van 30 seconden, dagelijks",
          steps: [
            "Ga rechtop zitten met beide benen gestrekt voor je.",
            "Beweeg vanuit de heupen naar voren in plaats van direct je rug rond te maken.",
            "Houd de stretch vast op spanning, niet op pijn.",
          ],
        },
        {
          name: "Staande vooroverbuiging",
          detail: "Vergroot je tolerantie om vanuit de heupen te scharnieren terwijl de rug ontspannen blijft.",
          cadence: "30-60 seconden, dagelijks",
          steps: [
            "Sta met voeten op heupbreedte en ontspan je knieën licht.",
            "Buig vanuit de heupen naar voren en laat je armen zwaar hangen.",
            "Adem rustig en laat de hamstrings bij elke uitademing verder ontspannen.",
          ],
        },
        {
          name: "Hamstring stretch liggend met band",
          detail: "Laat je elk been apart trainen zonder je onderrug te belasten.",
          cadence: "3 sets per kant, 3x per week",
          steps: [
            "Ga op je rug liggen en leg een band of strap om één voet.",
            "Strek het been richting plafond terwijl het andere been ontspannen blijft.",
            "Trek rustig tot je rek voelt aan de achterkant van het bovenbeen.",
          ],
        },
        {
          name: "Pigeon pose",
          detail: "Opent de heupen zodat je je bekken vrijer kunt kantelen in een agressieve rijpositie.",
          cadence: "60 seconden per kant, 3x per week",
          steps: [
            "Breng één scheenbeen schuin voor je op de mat en strek het andere been naar achteren.",
            "Houd je heupen zo recht mogelijk.",
            "Blijf rechtop of buig voorover, afhankelijk van wat comfortabel voelt.",
          ],
        },
        {
          name: "Hip hinge drill",
          detail: "Leert het bewegingspatroon dat je nodig hebt om je romp te verlagen zonder door de rug in te zakken.",
          cadence: "3 sets van 10 herhalingen, 2x per week",
          steps: [
            "Sta rechtop met je handen op je heupplooien.",
            "Duw je heupen naar achteren terwijl je je wervelkolom neutraal houdt.",
            "Kom terug overeind zodra je voelt dat de hamstrings op spanning komen.",
          ],
        },
      ] : [
        {
          name: "Seated hamstring stretch",
          detail: "Directly improves the hamstring range that limits bar drop and pelvic rotation on the bike.",
          cadence: "3 sets of 30 seconds, daily",
          steps: [
            "Sit tall with both legs straight in front of you.",
            "Reach forward from the hips instead of rounding the spine first.",
            "Hold the stretch where you feel tension, not pain.",
          ],
        },
        {
          name: "Standing forward fold",
          detail: "Builds tolerance for hinging from the hips while keeping the back relaxed.",
          cadence: "30-60 seconds, daily",
          steps: [
            "Stand with feet hip-width apart and soften the knees slightly.",
            "Fold forward from the hips and let the arms hang heavy.",
            "Breathe slowly and let the hamstrings relax deeper with each exhale.",
          ],
        },
        {
          name: "Supine hamstring stretch with strap",
          detail: "Lets you isolate each leg without loading the lower back.",
          cadence: "3 sets per side, 3x/week",
          steps: [
            "Lie on your back and loop a strap around one foot.",
            "Straighten the leg toward the ceiling while keeping the other leg relaxed.",
            "Gently pull until you feel a stretch behind the thigh.",
          ],
        },
        {
          name: "Pigeon pose",
          detail: "Opens the hips so you can rotate the pelvis more freely in an aggressive riding position.",
          cadence: "60 seconds per side, 3x/week",
          steps: [
            "Bring one shin across the front of your mat and extend the other leg back.",
            "Square your hips as much as possible.",
            "Stay tall or fold forward depending on comfort.",
          ],
        },
        {
          name: "Hip hinge drill",
          detail: "Teaches the movement pattern you need to lower the torso without collapsing through the spine.",
          cadence: "3 sets of 10 reps, 2x/week",
          steps: [
            "Stand tall with hands on the hip creases.",
            "Push the hips back while keeping the spine neutral.",
            "Return to standing once you feel the hamstrings load.",
          ],
        },
      ]}
      progressTips={isNl ? [
        "Stretch de meeste dagen gedurende 6-8 weken voordat je beoordeelt of je score echt is veranderd.",
        "Test jezelf elke 4 weken opnieuw met dezelfde zit-en-reiktest uit je profiel.",
        "Verhoog je score pas wanneer het volgende niveau duidelijk en duurzaam haalbaar voelt, niet na één goede dag.",
      ] : [
        "Stretch most days for 6-8 weeks before judging whether the score has changed.",
        "Retest every 4 weeks using the same seated reach test from your profile.",
        "Move your score up only when the next level feels clearly sustainable, not on a single good day.",
      ]}
    />
  );
}
