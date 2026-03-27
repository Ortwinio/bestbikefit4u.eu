import type { Metadata } from "next";
import { getDashboardMessages } from "@/i18n/dashboardMessages";
import { getRequestLocale } from "@/i18n/request";
import { ProfileImproveGuideClient } from "@/components/profile/ProfileImproveGuideClient";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const messages = getDashboardMessages(locale);

  return {
    title: messages.profile.improve.bodyMeasurements.title,
  };
}

export default async function ImproveBodyMeasurementsPage() {
  const locale = await getRequestLocale();
  const isNl = locale === "nl";

  return (
    <ProfileImproveGuideClient
      variant="bmi"
      exercises={isNl ? [
        {
          name: "Bouw een aerobe basis op",
          detail:
            "Lange, rustige ritten aan praattempo zijn de meest effectieve manier om vet te verbranden en tegelijk spiermassa te behouden. Fietsen is hiervoor ideaal omdat het weinig impact heeft en lang vol te houden is.",
          cadence: "3-5 ritten per week, 60-90 minuten in zone 2",
          steps: [
            "Rijd op een tempo waarbij je nog een volledig gesprek kunt voeren zonder te hijgen.",
            "Gebruik bij voorkeur een hartslagmeter: zone 2 ligt meestal rond 60-70% van je maximale hartslag.",
            "Verleng je ritduur geleidelijk met maximaal 10% per week.",
          ],
        },
        {
          name: "Voeg krachttraining toe",
          detail:
            "Krachttraining bouwt vetvrije spiermassa op, verhoogt je ruststofwisseling en verbetert je vermogen op de fiets. Twee sessies per week is al genoeg om resultaat te zien.",
          cadence: "2 sessies per week op niet-opeenvolgende dagen",
          steps: [
            "Focus op samengestelde oefeningen zoals squats, deadlifts, step-ups en split squats.",
            "Kies een gewicht waarmee 3 sets van 8-12 herhalingen uitdagend zijn.",
            "Consistentie is belangrijker dan maximale intensiteit.",
          ],
        },
        {
          name: "Verminder geraffineerde koolhydraten",
          detail:
            "Geraffineerde koolhydraten zorgen voor snelle pieken en dalen in je bloedsuiker, wat honger en vetopslag bevordert. Door ze te vervangen door volwaardige voeding houd je je energie stabieler en verbeter je je lichaamssamenstelling.",
          cadence: "Dagelijkse gewoonte - streef naar vooruitgang, niet perfectie",
          steps: [
            "Vervang wit brood, pasta en rijst door volkoren alternatieven.",
            "Ruil suikerhoudende dranken in voor water, bruiswater of ongezoete koffie of thee.",
            "Bouw maaltijden op rond eiwitten en groenten, en stem koolhydraten af op je trainingsbelasting.",
          ],
        },
        {
          name: "Voed lange ritten goed",
          detail:
            "Chronisch te weinig eten op lange ritten zorgt ervoor dat je lichaam spiermassa afbreekt voor energie. Voldoende eten op de fiets beschermt je spiermassa en houdt je trainingskwaliteit hoog.",
          cadence: "Bij ritten langer dan 90 minuten",
          steps: [
            "Neem na het eerste uur 30-60 g koolhydraten per uur.",
            "Kies licht verteerbare bronnen zoals gels, dadels, bananen of rice cakes.",
            "Herstel met een maaltijd met eiwitten en koolhydraten binnen 30-60 minuten na afloop.",
          ],
        },
        {
          name: "Verbeter je slaapkwaliteit",
          detail:
            "Slechte slaap verhoogt hongerhormonen en verlaagt de anabole hormonen die nodig zijn voor spierherstel. Zelfs één extra uur slaap per nacht kan al merkbaar helpen bij je lichaamssamenstelling.",
          cadence: "Streef consistent naar 7-9 uur per nacht",
          steps: [
            "Houd een vaste bedtijd en opstaantijd aan, ook in het weekend.",
            "Houd je slaapkamer koel (16-19 °C) en donker.",
            "Vermijd schermen 30-60 minuten voor het slapen.",
          ],
        },
      ] : [
        {
          name: "Build an aerobic base",
          detail:
            "Long, steady rides at a conversational pace are the most effective way to burn fat while preserving muscle. Cycling is ideal because it is low-impact and can be sustained for hours.",
          cadence: "3–5 rides per week, 60–90 minutes each at zone 2 intensity",
          steps: [
            "Ride at a pace where you can hold a full conversation without gasping.",
            "Use a heart rate monitor: zone 2 is typically 60–70% of your max heart rate.",
            "Gradually extend ride duration by no more than 10% per week.",
          ],
        },
        {
          name: "Add strength training",
          detail:
            "Resistance training builds lean muscle mass, which raises your resting metabolic rate and improves power output on the bike. Two sessions per week is enough to see results.",
          cadence: "2 sessions per week on non-consecutive days",
          steps: [
            "Focus on compound movements: squats, deadlifts, step-ups, and split squats.",
            "Use a weight that challenges you for 3 sets of 8–12 reps.",
            "Prioritise consistency over intensity — show up regularly.",
          ],
        },
        {
          name: "Reduce refined carbohydrates",
          detail:
            "Refined carbs cause blood sugar spikes and crashes that drive hunger and fat storage. Replacing them with whole foods supports steady energy levels and body composition.",
          cadence: "Daily habit — aim for progress over perfection",
          steps: [
            "Swap white bread, pasta, and rice for whole grain alternatives.",
            "Replace sugary drinks with water, sparkling water, or unsweetened coffee or tea.",
            "Build meals around protein and vegetables, with carbs scaled to your training load.",
          ],
        },
        {
          name: "Fuel rides correctly",
          detail:
            "Chronic under-fueling on long rides causes your body to break down muscle for energy. Eating enough on the bike protects lean mass and keeps training quality high.",
          cadence: "On rides longer than 90 minutes",
          steps: [
            "Eat 30–60 g of carbohydrate per hour after the first 60 minutes.",
            "Use easily digestible sources: gels, dates, bananas, or rice cakes.",
            "Recover with a meal containing protein and carbs within 30–60 minutes of finishing.",
          ],
        },
        {
          name: "Improve sleep quality",
          detail:
            "Poor sleep increases hunger hormones and reduces the anabolic hormones needed for muscle recovery. Even one extra hour per night can meaningfully support body composition goals.",
          cadence: "Aim for 7–9 hours per night consistently",
          steps: [
            "Set a consistent bedtime and wake time, even on weekends.",
            "Keep your bedroom cool (16–19 °C) and dark.",
            "Avoid screens for 30–60 minutes before bed.",
          ],
        },
      ]}
      progressTips={isNl ? [
        "Streef naar 0,5-1 kg gewichtsverlies per maand - sneller betekent vaak ook spierverlies.",
        "Weeg jezelf wekelijks op hetzelfde moment (ochtend, na toiletbezoek) en volg vooral de trend over meerdere maanden.",
        "Werk je gewicht in je profiel bij na elke duidelijke verandering, zodat de bandenspanningsberekeningen accuraat blijven.",
        "Zit je BMI al in de normale range, focus dan meer op lichaamssamenstelling (spier-vetverhouding) dan alleen op het getal.",
      ] : [
        "Aim for 0.5–1 kg of weight loss per month — faster than this typically means losing muscle alongside fat.",
        "Weigh yourself weekly at the same time (morning, after bathroom) to reduce day-to-day variation, then track the trend over months.",
        "Update your weight in your profile after any significant change to keep tire pressure calculations accurate.",
        "If your BMI is already in the normal range, focus on body composition (muscle vs. fat ratio) rather than the number on the scale.",
      ]}
    />
  );
}
