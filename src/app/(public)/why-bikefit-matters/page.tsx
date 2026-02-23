import type { Metadata } from "next";
import { Button } from "@/components/ui";
import { TrackedCtaLink } from "@/components/analytics/TrackedCtaLink";
import { HOME_QUOTES } from "@/content/homeQuotes";
import { buildLocaleAlternates } from "@/i18n/metadata";
import { withLocalePrefix } from "@/i18n/navigation";
import { getRequestLocale } from "@/i18n/request";

const PAGE_TITLE = "Why a good bike fit matters (comfort, power, injury prevention)";
const PAGE_DESCRIPTION =
  "Real rider outcomes after a proper bike fit: less pain, fewer numb hands, better control, more efficiency. Learn why millimeters matter and what a fit actually changes.";

type BenefitBlock = {
  title: string;
  paragraphs: readonly string[];
  bullets?: readonly string[];
};

const benefitBlocks: readonly BenefitBlock[] = [
  {
    title: "Reduced pain and overload",
    paragraphs: [
      `Many riders come in with a "tolerance-based" position: it works until it doesn't. A fit reduces unnecessary joint stress by aligning the knee-ankle-hip chain and stabilizing the pelvis.`,
      "Typical wins:",
    ],
    bullets: [
      "Less anterior knee stress from saddle height and cleat changes",
      "Less low-back strain from correcting reach/drop and pelvic control",
      "Fewer numb hands from better weight distribution and hood position",
    ],
  },
  {
    title: "Better power transfer (without forcing an aggressive posture)",
    paragraphs: [
      "Comfort and performance are not opposites. The goal is to keep you stable so you can push power without sliding, rocking, or bracing through the shoulders.",
      "When the pelvis is stable and the feet are supported, the pedal stroke becomes more even and efficient.",
    ],
  },
  {
    title: "Better control and confidence",
    paragraphs: [
      "Handling improves when your center of mass is balanced between saddle and bars. Riders often notice this first on:",
    ],
    bullets: [
      'Descents (more control, less "nervous" steering)',
      "Rough surfaces (less bouncing, more stability)",
      "Long rides (less fatigue-driven wobble)",
    ],
  },
  {
    title: "A position that matches your terrain",
    paragraphs: [
      "A good fit is not one fixed setup for everything. The position should change with your riding style:",
    ],
    bullets: [
      "Mountain/technical: more stability, less aggressive drop, room to move",
      "Endurance: comfort-first, reduced lumbar load, sustainable reach",
      "Performance/race: more aerodynamic while keeping hip angle workable",
      "TT/triathlon: highly aero but very sensitive to saddle position, hip angle, and cockpit length",
    ],
  },
  {
    title: "Clarity: you get numbers you can repeat",
    paragraphs: [
      "Most riders guess their setup. A proper fit produces exact values (mm/degrees) so you can:",
    ],
    bullets: [
      "Rebuild your position after travel or maintenance",
      "Replicate it on a new frame",
      "Fine-tune for different bikes (road vs gravel vs indoor)",
    ],
  },
] as const;

const fitAdjustmentItems = [
  "Saddle height (mm)",
  "Saddle setback (mm)",
  "Saddle tilt (degrees)",
  "Handlebar reach (mm)",
  "Handlebar drop (mm)",
  "Stem length suggestion",
  "Crank length suggestion (where relevant)",
  "Cleat position (fore-aft, angle, stance width)",
  "Frame size range based on stack and reach",
] as const;

const fitMethodItems = [
  "LeMond (inseam-based starting point for saddle height)",
  "Holmes (knee angle ranges as a validation check)",
  "KOPS (a reference point for knee/pedal alignment, not a one-size rule)",
  "Stack and reach (frame selection and cockpit balance)",
] as const;

const considerFitItems = [
  "Recurring discomfort after 60-90 minutes",
  "Numb hands, hot foot, or saddle discomfort",
  "Knee pain, hip tightness, or back fatigue",
  "You changed shoes, cleats, saddle, cranks, or bike",
  "You're training more (or returning after time off)",
  "You want a more aerodynamic position without losing comfort",
] as const;

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();

  return {
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    openGraph: {
      title: PAGE_TITLE,
      description: PAGE_DESCRIPTION,
      type: "website",
    },
    alternates: buildLocaleAlternates("/why-bikefit-matters", locale),
  };
}

export default async function WhyBikeFitMattersPage() {
  const locale = await getRequestLocale();
  const pagePath = withLocalePrefix("/why-bikefit-matters", locale);

  return (
    <div className="py-16">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-900">
          Why so many riders feel the difference after a good bike fit
        </h1>

        <p className="mt-5 text-lg leading-relaxed text-gray-600">
          Most riders do not need a new bike to feel better and ride faster. They need
          a position that matches their body, flexibility, goals, and the terrain they
          ride. A proper bike fit turns vague problems (&quot;something feels off&quot;) into
          measurable adjustments in millimeters and degrees, then confirms those
          changes on the bike.
        </p>
        <p className="mt-4 text-lg leading-relaxed text-gray-600">
          What people often find surprising: small changes create big results,
          especially on longer rides.
        </p>

        <section className="mt-14">
          <h2 className="text-3xl font-semibold text-gray-900">
            What riders notice after a proper fit
          </h2>
          <p className="mt-4 text-gray-600">
            These are typical outcomes riders describe after getting their position
            dialed in:
          </p>
          <div className="mt-6 space-y-3">
            {HOME_QUOTES.map((quote) => (
              <blockquote
                key={quote}
                className="rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-medium italic leading-relaxed text-blue-800"
              >
                &ldquo;{quote}&rdquo;
              </blockquote>
            ))}
          </div>
          <p className="mt-6 text-gray-600">
            These are not nice-to-have improvements. They map directly to the core
            areas a fit influences: comfort, joint load, breathing space, stability,
            and repeatability.
          </p>
        </section>

        <section className="mt-14">
          <h2 className="text-3xl font-semibold text-gray-900">
            Why a bike fit works (and why millimeters matter)
          </h2>
          <p className="mt-4 text-gray-600">
            A bike fit is not magic. It is biomechanics and basic physics applied to
            three contact points:
          </p>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-gray-600">
            <li>Feet (cleats, shoes, pedals)</li>
            <li>Pelvis (saddle height, setback, tilt, saddle choice)</li>
            <li>Hands and upper body (reach, drop, bar shape, hood position)</li>
          </ul>
          <p className="mt-4 text-gray-600">
            If one of these contact points is wrong, your body compensates.
            Compensation is what creates most recurring problems: numb hands, knee
            pain, hot foot, neck tightness, low-back fatigue, unstable descending, and
            dead power on climbs.
          </p>
          <p className="mt-4 text-gray-600">
            Small adjustments matter because the body repeats the same movement
            thousands of times per hour. A minor misalignment can be harmless for 20
            minutes and become a real issue after 2-4 hours.
          </p>
        </section>

        <section className="mt-14">
          <h2 className="text-3xl font-semibold text-gray-900">
            The most common reasons riders feel immediate benefits
          </h2>
          <div className="mt-6 space-y-8">
            {benefitBlocks.map((block, index) => (
              <article key={block.title}>
                <h3 className="text-xl font-semibold text-gray-900">
                  {index + 1}) {block.title}
                </h3>
                {block.paragraphs.map((paragraph) => (
                  <p key={paragraph} className="mt-3 text-gray-600">
                    {paragraph}
                  </p>
                ))}
                {block.bullets ? (
                  <ul className="mt-4 list-disc space-y-2 pl-5 text-gray-600">
                    {block.bullets.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                ) : null}
              </article>
            ))}
          </div>
        </section>

        <section className="mt-14">
          <h2 className="text-3xl font-semibold text-gray-900">
            What actually gets adjusted in a professional bike fit
          </h2>
          <p className="mt-4 text-gray-600">A fit typically covers:</p>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-gray-600">
            {fitAdjustmentItems.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p className="mt-6 text-gray-600">
            Methods and principles commonly used (depending on rider and goal):
          </p>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-gray-600">
            {fitMethodItems.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section className="mt-14">
          <h2 className="text-3xl font-semibold text-gray-900">
            When you should consider a fit
          </h2>
          <p className="mt-4 text-gray-600">
            A fit is worth it if you recognize any of these:
          </p>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-gray-600">
            {considerFitItems.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      </div>

      <section className="mt-16 bg-blue-600 py-16">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white">
            Start your free bike fit today
          </h2>
          <p className="mt-4 text-lg text-blue-100">
            No guesswork. No generic tips. Get fit targets matched to your body and
            riding goals.
          </p>
          <div className="mt-8">
            <TrackedCtaLink
              href={withLocalePrefix("/login", locale)}
              locale={locale}
              pagePath={pagePath}
              section="why_bikefit_matters_final_cta"
              ctaLabel="Start Free Fit"
            >
              <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50">
                Start Free Fit
              </Button>
            </TrackedCtaLink>
          </div>
        </div>
      </section>
    </div>
  );
}
