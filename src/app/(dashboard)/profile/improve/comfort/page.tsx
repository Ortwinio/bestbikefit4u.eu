import type { Metadata } from "next";
import { getDashboardMessages } from "@/i18n/dashboardMessages";
import { getRequestLocale } from "@/i18n/request";
import { ProfileImproveGuideClient } from "@/components/profile/ProfileImproveGuideClient";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const messages = getDashboardMessages(locale);

  return {
    title: messages.profile.improve.comfort.title,
  };
}

export default async function ImproveComfortPage() {
  const locale = await getRequestLocale();
  const isNl = locale === "nl";

  return (
    <ProfileImproveGuideClient
      variant="comfort"
      exercises={isNl ? [
        {
          name: "Controleer je zadelhoogte",
          detail:
            "Zadelhoogte is de meest voorkomende oorzaak van fietsongemak. Te hoog geeft heupwiebelen en druk; te laag belast de knie extra.",
          cadence: "Controleer elke keer wanneer je van fiets of schoenen wisselt",
          steps: [
            "Ga op de fiets zitten met het pedaal op 6 uur en je hak op het pedaal.",
            "Je been moet dan volledig gestrekt zijn zonder dat je heupen wiebelen.",
            "Met de bal van je voet op het pedaal hoort er een lichte kniebuiging te zijn (25-35°).",
          ],
        },
        {
          name: "Verhoog het zadel bij pijn vóór de knie",
          detail:
            "Pijn aan de voorkant van de knie ontstaat vrijwel altijd door een te laag zadel, waardoor de kniepees overbelast raakt.",
          cadence: "Verhoog 2-3 mm per keer, wacht 2 ritten voor de volgende aanpassing",
          steps: [
            "Verhoog het zadel 2 mm en maak een testrit van 30 minuten.",
            "Blijf in stapjes van 2 mm verhogen tot de pijn vermindert.",
            "Stop zodra je heupen gaan wiebelen.",
          ],
        },
        {
          name: "Verlaag het zadel bij pijn achter de knie",
          detail:
            "Pijn aan de achterkant van de knie komt door een te hoog zadel, waardoor de hamstringaanhechting te veel op rek komt.",
          cadence: "Verlaag 2-3 mm per keer, wacht 2 ritten voor de volgende aanpassing",
          steps: [
            "Verlaag het zadel 2 mm en maak een testrit van 30 minuten.",
            "Blijf in stapjes van 2 mm verlagen tot de pijn vermindert.",
            "Stop als de heuphoek bovenin de trapbeweging te klein wordt.",
          ],
        },
        {
          name: "Verkort of verhoog je cockpit",
          detail:
            "Lage rugpijn wordt vaak veroorzaakt door te veel reach of drop, waardoor de onderrug te veel moet overstrekken.",
          cadence: "Pas maximaal één keer per week aan en geef jezelf 2 ritten om te wennen",
          steps: [
            "Probeer een kortere stuurpen (10-20 mm korter) of verhoog de stack met spacers.",
            "Controleer op de fiets of je onderrug neutraal blijft - niet bol en niet overdreven hol.",
            "Werk parallel aan je core-stability (zie de Core Stability-kaart) om de positie beter te ondersteunen.",
          ],
        },
        {
          name: "Verhoog het stuur bij nek- en schouderklachten",
          detail:
            "Nek- en schouderspanning ontstaat wanneer het stuur te laag of te ver weg staat, waardoor je langdurig je nek omhoog moet houden.",
          cadence: "Verhoog 5-10 mm per keer en test een week voordat je verder aanpast",
          steps: [
            "Voeg een spacer toe onder de stuurpen of draai de stuurpen naar een positievere hoek.",
            "Zorg dat je ellebogen licht gebogen zijn in je natuurlijke rijhouding.",
            "Overweeg een kortere stuurpen als de reach te groot voelt.",
          ],
        },
        {
          name: "Haal gewicht van je handen af",
          detail:
            "Tintelingen of pijn in de handen betekent meestal dat er te veel gewicht op het stuur rust - vaak door een te lage, te lange of slecht ondersteunde houding.",
          cadence: "Evalueer over 2-3 ritten na elke wijziging",
          steps: [
            "Verhoog het stuur om de vooroverhouding te verkleinen.",
            "Verkort de stuurpen als de reach te lang aanvoelt.",
            "Gebruik als tijdelijke maatregel handschoenen met padding en ergonomisch stuurlint.",
          ],
        },
        {
          name: "Zet je schoenplaatjes verder naar achter",
          detail:
            "Brandende voeten of gevoelloosheid in de voorvoet ontstaan vaak door schoenplaatjes die te ver naar voren staan.",
          cadence: "Verplaats 2-3 mm per keer en geef jezelf een week om te wennen",
          steps: [
            "Draai de cleat-bouten los en schuif het plaatje richting de hak.",
            "De bal van je voet hoort net voor of direct boven de pedaalas te zitten.",
            "Controleer ook of je schoen breed genoeg is; smalle schoenen drukken de voorvoet extra samen.",
          ],
        },
      ] : [
        {
          name: "Saddle height adjustment check",
          detail:
            "Saddle height is the single most common cause of cycling discomfort. Too high causes rocking and perineal pressure; too low overloads the knee.",
          cadence: "Check every time you change bikes or shoes",
          steps: [
            "Sit on the bike with the pedal at the 6 o'clock position and your heel on it.",
            "Your leg should be fully extended without hip rocking.",
            "With the ball of your foot on the pedal, you should have a slight bend (25–35°).",
          ],
        },
        {
          name: "Lower your saddle for front knee pain",
          detail:
            "Front knee pain (anterior) is almost always caused by a saddle that is too low, overloading the patellar tendon.",
          cadence: "Raise saddle 2–3 mm at a time, wait 2 rides before adjusting again",
          steps: [
            "Raise the saddle 2 mm and do a 30-minute test ride.",
            "Continue raising in 2 mm increments until the pain reduces.",
            "Stop before hip rocking appears.",
          ],
        },
        {
          name: "Raise your saddle for back knee pain",
          detail:
            "Posterior knee pain is caused by a saddle that is too high, overstretching the hamstring attachment at the back of the knee.",
          cadence: "Lower saddle 2–3 mm at a time, wait 2 rides before adjusting again",
          steps: [
            "Lower the saddle 2 mm and do a 30-minute test ride.",
            "Continue lowering in 2 mm increments until the pain reduces.",
            "Stop if hip closure becomes too great at the top of the pedal stroke.",
          ],
        },
        {
          name: "Shorten or raise your handlebar setup",
          detail:
            "Lower back pain is typically caused by excessive reach or excessive drop, forcing the lumbar spine to overextend.",
          cadence: "Adjust once per week maximum; allow 2 rides to adapt after each change",
          steps: [
            "Try a shorter stem (10–20 mm shorter) or raise the bar stack with spacers.",
            "On the bike, check that your lower back remains neutral — not rounded and not over-arched.",
            "Strengthen the core in parallel (see Core Stability card) to support the position.",
          ],
        },
        {
          name: "Raise handlebar height for neck and shoulders",
          detail:
            "Neck and shoulder tension arises when bars are too low or too far away, forcing you to crane your neck upward for long periods.",
          cadence: "Raise bars 5–10 mm at a time and ride for a week before adjusting again",
          steps: [
            "Add a spacer beneath the stem or flip the stem to a positive rise.",
            "Ensure your elbows are slightly bent (not locked) in your natural riding position.",
            "Consider a shorter stem if reach feels excessive.",
          ],
        },
        {
          name: "Redistribute weight off the hands",
          detail:
            "Hand numbness and pain usually means too much weight is loaded onto the bars — often caused by bars that are too low, too far away, or a weak core that cannot support the torso.",
          cadence: "Assess over 2–3 rides after each change",
          steps: [
            "Raise the bars to reduce the amount of forward lean.",
            "Shorten the stem if reach is excessive.",
            "Use padded gloves and ergonomic bar tape as a short-term measure.",
          ],
        },
        {
          name: "Move cleats back toward the heel",
          detail:
            "Hot foot and forefoot numbness is caused by cleats positioned too far forward, compressing the metatarsal nerves under load.",
          cadence: "Move 2–3 mm at a time; allow a full week to adapt",
          steps: [
            "Loosen the cleat bolts and slide the cleat toward the heel.",
            "The ball of your foot should sit just in front of or directly over the pedal axle.",
            "Check that the shoe is wide enough — narrow shoes compress the forefoot under power.",
          ],
        },
      ]}
      progressTips={isNl ? [
        "De meeste fitproblemen verbeteren binnen 2-4 ritten na één aanpassing - verander dus niet meerdere dingen tegelijk.",
        "Houd een simpel ritlogboek bij: noteer wat je hebt veranderd, hoe ver je reed en of het ongemak veranderde.",
        "Als pijn na 3-4 weken geleidelijke aanpassingen blijft, overweeg dan een professionele bike fit.",
        "Werk je comfortscore in je profiel bij na een duidelijke fit-verandering.",
      ] : [
        "Most fit issues improve within 2–4 rides after a single adjustment — avoid changing multiple things at once.",
        "Keep a simple ride log: note what you changed, how far you rode, and whether discomfort changed.",
        "If pain persists after 3–4 weeks of incremental adjustments, consider a professional bike fit.",
        "Re-rate your comfort level in your profile after any significant fit change.",
      ]}
    />
  );
}
