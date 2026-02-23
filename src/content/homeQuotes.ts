import type { Locale } from "@/i18n/config";

export const HOME_QUOTES_DISPLAY_COUNT = 4;
export type RandomNumberGenerator = () => number;

export const HOME_QUOTES: readonly string[] = [
  "A few millimeters of change, and pedaling suddenly felt smoother and more efficient.",
  "Back pain used to cut my rides short. Now I can ride for hours without thinking about it.",
  "My hands stopped going numb on longer rides.",
  "The comfort difference was immediate, even though the adjustments were small.",
  "A different saddle and the right saddle height brought the fun back into riding.",
  "Seeing the measurements made the choices clear, and I could feel the result right away.",
  "My cleat position was off. Fixing it took pressure off my knees and feet.",
  "What felt like a minor issue became a big problem on long rides. Now it's solved.",
  "The advice was practical: measure, adjust, test, and confirm.",
  "I run slightly different cleat setups for my road shoes and my gravel shoes now.",
  "I can hold a more aerodynamic position without discomfort.",
  "Climbing feels easier because I'm not fighting my posture anymore.",
  "Descents feel more controlled because my weight is better balanced.",
  "No more stiff neck after an hour. I can keep my head up comfortably.",
  "My hips track straighter and my pedal stroke feels more even.",
  "I'd recommend a proper fit to anyone who rides regularly. It's worth it.",
  "I used to guess. Now I know my numbers and I can repeat the setup consistently.",
  "A yearly check makes sense - your body and training change over time.",
  "It was easier to understand than I expected, and I could apply it the same day.",
  "Going into my big ride, I felt ready because the bike finally fit me.",
] as const;

export const HOME_QUOTES_NL: readonly string[] = [
  "Een paar millimeter aanpassing en het trappen voelde meteen soepeler en efficiënter.",
  "Rugpijn maakte mijn ritten vroeger kort. Nu kan ik uren fietsen zonder eraan te denken.",
  "Mijn handen werden niet meer gevoelloos tijdens lange ritten.",
  "Het comfortverschil was direct merkbaar, ook al waren de aanpassingen klein.",
  "Een ander zadel en de juiste zadelhoogte brachten het plezier in fietsen terug.",
  "Door de metingen werden de keuzes duidelijk en ik voelde het resultaat meteen.",
  "Mijn schoenplaatjes stonden verkeerd. Na corrigeren verdween de druk op knieën en voeten.",
  "Wat klein leek, werd op lange ritten een groot probleem. Nu is het opgelost.",
  "Het advies was praktisch: meten, aanpassen, testen en bevestigen.",
  "Ik rijd nu met een iets andere schoenplaatjes-setup op race- en gravelschoenen.",
  "Ik kan een meer aerodynamische positie aanhouden zonder ongemak.",
  "Klimmen voelt makkelijker omdat ik niet meer tegen mijn houding vecht.",
  "Afdalingen voelen gecontroleerder omdat mijn gewicht beter in balans is.",
  "Geen stijve nek meer na een uur. Ik kan mijn hoofd comfortabel omhoog houden.",
  "Mijn heupen bewegen rechter en mijn pedaalslag voelt gelijkmatiger.",
  "Ik raad een goede bikefit aan iedereen aan die regelmatig fietst. Het is het waard.",
  "Vroeger gokte ik. Nu ken ik mijn cijfers en kan ik dezelfde setup steeds herhalen.",
  "Een jaarlijkse check is logisch - je lichaam en training veranderen in de tijd.",
  "Het was makkelijker te begrijpen dan ik dacht en ik kon het dezelfde dag toepassen.",
  "Voor mijn grote rit voelde ik me klaar omdat de fiets eindelijk goed paste.",
] as const;

export const HOME_QUOTES_BY_LOCALE: Record<Locale, readonly string[]> = {
  en: HOME_QUOTES,
  nl: HOME_QUOTES_NL,
};

export const HOME_QUOTES_SECTION_COPY: Record<
  Locale,
  { title: string; subtitle: string; readMoreLabel: string }
> = {
  en: {
    title: "What Riders Say",
    subtitle: "Short quotes from riders after practical fit adjustments.",
    readMoreLabel: "Read more quotes",
  },
  nl: {
    title: "Wat Fietsers Zeggen",
    subtitle: "Korte ervaringen van fietsers na praktische fit-aanpassingen.",
    readMoreLabel: "Lees meer ervaringen",
  },
};

export function shuffleQuotes<T>(
  items: readonly T[],
  random: RandomNumberGenerator = Math.random
): T[] {
  const shuffled = [...items];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(random() * (index + 1));
    [shuffled[index], shuffled[randomIndex]] = [
      shuffled[randomIndex],
      shuffled[index],
    ];
  }

  return shuffled;
}

export function selectRandomHomeQuotes(
  quotes: readonly string[],
  count = HOME_QUOTES_DISPLAY_COUNT,
  random: RandomNumberGenerator = Math.random
): string[] {
  if (count <= 0) {
    return [];
  }

  const boundedCount = Math.min(count, quotes.length);
  return shuffleQuotes(quotes, random).slice(0, boundedCount);
}

export function selectRandomHomeQuotesForLocale(
  locale: Locale,
  count = HOME_QUOTES_DISPLAY_COUNT,
  random: RandomNumberGenerator = Math.random
): string[] {
  return selectRandomHomeQuotes(HOME_QUOTES_BY_LOCALE[locale], count, random);
}
