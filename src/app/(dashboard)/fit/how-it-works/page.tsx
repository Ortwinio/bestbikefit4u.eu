import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { getDashboardMessages } from "@/i18n/dashboardMessages";
import { getRequestLocale } from "@/i18n/request";
import { withLocalePrefix } from "@/i18n/navigation";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const messages = getDashboardMessages(locale);
  return { title: messages.fit.algorithm.title };
}

export default async function HowItWorksPage() {
  const locale = await getRequestLocale();
  const messages = getDashboardMessages(locale);
  const t = messages.fit.algorithm;
  const isNl = locale === "nl";

  const inputs = isNl ? [
    {
      title: "Lichaamsmetingen",
      description:
        "Lengte, binnenbeenlengte, romplengte, armlengte, schouderbreedte en femurlengte vormen de geometrische basis. Binnenbeenlengte is de meest bepalende maat en stuurt vooral de zadelhoogte. Romp- en armlengte bepalen reach en drop van de cockpit.",
    },
    {
      title: "Fysiek profiel",
      description:
        "Flexibiliteit, core stability en comfortniveau werken als modifiers op de basisgeometrie. Lage flexibiliteit beperkt haalbare drop. Lage core stability beperkt duurzame reach. Pijn- en comfortdata markeren posities die vermeden moeten worden en activeren beschermende aanpassingen.",
    },
    {
      title: "Rijstijl",
      description:
        "Ervaringsniveau, trainingsvolume, typische ritduur en houdingprioriteit (comfort versus performance) bepalen hoe agressief of ontspannen de eindpositie moet zijn. Een wedstrijdrijder en een recreatieve toerder op dezelfde fiets hebben een heel andere fit nodig.",
    },
    {
      title: "Vragenlijstantwoorden",
      description:
        "Fietstype, terrein, rijdoelen, gevoel in de huidige positie en pijngeschiedenis geven de engine context die ruwe metingen alleen niet kunnen bieden. Deze antwoorden activeren specifieke takken van het rekenmodel.",
    },
  ] : [
    {
      title: "Body measurements",
      description:
        "Height, inseam, torso length, arm length, shoulder width, and femur length form the geometric foundation. Inseam is the single most influential measurement — it drives saddle height. Torso and arm length determine the cockpit reach and drop.",
    },
    {
      title: "Physical profile",
      description:
        "Flexibility, core stability, and comfort level act as modifiers on the base geometry. Low flexibility limits achievable bar drop. Low core stability limits sustainable reach. Pain and discomfort data flags positions to avoid and triggers protective adjustments.",
    },
    {
      title: "Riding style",
      description:
        "Experience level, weekly training volume, typical ride distance, and position priority (comfort vs. performance) define how aggressive or relaxed the final position should be. A club racer and a weekend tourist on identical bikes need very different fits.",
    },
    {
      title: "Questionnaire responses",
      description:
        "Bike type, terrain, riding goals, current position feeling, and pain history give the engine context that raw measurements cannot capture. These answers activate specific branches of the calculation model.",
    },
  ];

  const steps = isNl ? [
    {
      title: "1. Basis zadelhoogte",
      description:
        "Wordt berekend vanuit de binnenbeenlengte met gevalideerde methodes zoals LeMond, Holmes en Hamley. Daarna wordt gecorrigeerd voor schoenstapelhoogte en cleatpositie om tot een precieze bottom-bracket-tot-zadeltopmeting te komen.",
    },
    {
      title: "2. Cockpitgeometrie",
      description:
        "Reach en stuurdrop worden afgeleid uit romp- en armlengte en daarna aangepast op basis van flexibiliteit en core stability. Lage flexibiliteit verhoogt het stuur; hoge core stability maakt een langere en lagere positie mogelijk.",
    },
    {
      title: "3. Modifiers vanuit rijstijl",
      description:
        "Positieprioriteit en ritcontext verschuiven de fit richting endurance-, sportive- of performance-presets. Een rijder die comfort prioriteert krijgt een rechtere positie met kortere reach dan iemand die performance vooropzet.",
    },
    {
      title: "4. Comfortaanpassingen",
      description:
        "Pijn- en ongemaksdata activeren gerichte beschermende aanpassingen. Kniepijn beïnvloedt zadelhoogte en cleat fore-aft; lage rugpijn past reach en stuurhoogte aan; zadelongemak beïnvloedt setback en tiltadvies.",
    },
    {
      title: "5. Validatie",
      description:
        "Alle uitkomsten worden gecontroleerd op anatomische grenzen, interne consistentie en kruislings afhankelijke waarden voordat ze worden getoond. Als een waarde buiten veilige grenzen valt, wordt die gemarkeerd en vervangen door een conservatieve fallback.",
    },
  ] : [
    {
      title: "1. Base saddle height",
      description:
        "Calculated from inseam using validated methods (LeMond, Holmes, Hamley). The result is then adjusted for shoe stack height and cleat position to produce a precise bottom-bracket-to-saddle-top measurement.",
    },
    {
      title: "2. Cockpit geometry",
      description:
        "Reach and bar drop are derived from torso and arm length, then modified by your flexibility and core stability scores. Low flexibility raises the bars; high core stability unlocks a longer, lower position.",
    },
    {
      title: "3. Riding style modifiers",
      description:
        "Position priority and ride context shift the fit toward endurance, sportive, or performance presets. A rider who prioritises comfort receives a more upright position with shorter reach than one who prioritises performance.",
    },
    {
      title: "4. Comfort adjustments",
      description:
        "Pain and discomfort data triggers targeted protective adjustments. Knee pain influences saddle height and cleat fore-aft position; lower back pain adjusts reach and bar height; saddle discomfort affects saddle setback and tilt guidance.",
    },
    {
      title: "5. Validation",
      description:
        "All outputs are checked against anatomical limits, internal consistency rules, and cross-parameter constraints before being presented. If any value falls outside safe bounds, it is flagged and a conservative fallback is applied.",
    },
  ];

  const outputs = isNl ? [
    { title: "Zadelhoogte", description: "Afstand van het midden van de bottom bracket tot de bovenkant van het zadel, gemeten langs de zitbuis." },
    { title: "Zadel setback", description: "Horizontale afstand van de bottom bracket tot de neus van het zadel, bepalend voor kniepositie boven het pedaal." },
    { title: "Stuurdrop", description: "Hoogteverschil tussen de bovenkant van het zadel en de bovenkant van het stuur, bepalend voor de romphoek." },
    { title: "Reach", description: "Horizontale afstand van de zadelneus tot het midden van het stuur, die bepaalt hoe ver je naar voren reikt." },
    { title: "Stuurpenlengte en hoek", description: "Aanbevolen stuurpendimensies om de doel-reach te halen met de specifieke balhoofdbuisgeometrie van de fiets." },
    { title: "Cleatpositie-notities", description: "Advies voor fore-aft en rotatie van de schoenplaatjes wanneer pijn- of biomechanische data daarom vragen." },
  ] : [
    { title: "Saddle height", description: "Distance from bottom bracket centre to the top of the saddle, measured along the seat tube." },
    { title: "Saddle setback", description: "Horizontal distance from the bottom bracket to the saddle nose, governing knee-over-pedal alignment." },
    { title: "Handlebar drop", description: "Height difference between the top of the saddle and the top of the handlebar, controlling torso angle." },
    { title: "Reach", description: "Horizontal distance from the saddle nose to the centre of the handlebar, determining how far you stretch forward." },
    { title: "Stem length and angle", description: "Suggested stem dimensions to achieve the target reach with the specific bike's head tube geometry." },
    { title: "Cleat position notes", description: "Fore-aft and rotational cleat guidance where pain data or biomechanics indicate adjustment is beneficial." },
  ];

  const tips = isNl ? [
    "Doe je fit opnieuw na duidelijke veranderingen in gewicht, flexibiliteit of rijdoelen - je optimale positie verschuift mee met je lichaam en training.",
    "Werk je flexibiliteits- en core-stabilityscores bij naarmate je fitter wordt. Hogere scores maken agressievere posities mogelijk die eerder nog niet logisch waren.",
    "Wees zo specifiek mogelijk over pijn. Hoe duidelijker je beschrijft waar en wanneer ongemak optreedt, hoe gerichter de beschermende aanpassingen kunnen zijn.",
    "Geef elke nieuwe positie 3-5 ritten voordat je conclusies trekt. Je lichaam heeft tijd nodig om zich aan te passen.",
    "Nauwkeurige metingen maken het grootste verschil. Meet binnenbeenlengte en romplengte opnieuw als je resultaten vreemd aanvoelen - kleine meetfouten werken door in de hele berekening.",
  ] : [
    "Re-run your fit after significant changes to your weight, flexibility, or riding goals — your optimal position shifts as your body and training evolve.",
    "Update your flexibility and core stability scores as your fitness improves. Higher scores unlock more aggressive positions that the algorithm would not recommend before.",
    "Be specific about pain. The more detail you provide about where and when discomfort occurs, the more targeted the protective adjustments become.",
    "Give each new position 3–5 rides before drawing conclusions. Adaptation takes time, and early discomfort often resolves once your body adjusts.",
    "Accurate measurements make the biggest difference. Re-measure inseam and torso length if your results feel off — small errors compound through the calculation chain.",
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <Link
        href={withLocalePrefix("/fit", locale)}
        className="inline-flex text-sm font-semibold text-[color:var(--primary)] hover:opacity-80"
      >
        {t.backLink}
      </Link>

      {/* Header */}
      <section className="rounded-[var(--radius-xl)] border border-[color:var(--border)] bg-[color:var(--card)] p-6 shadow-sm">
        <h1 className="text-3xl font-bold text-[color:var(--foreground)]">{t.title}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[color:var(--muted-foreground)]">
          {t.subtitle}
        </p>
      </section>

      {/* Inputs */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-[color:var(--foreground)]">{t.inputsTitle}</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {inputs.map((item) => (
            <Card key={item.title} variant="bordered">
              <CardHeader>
                <CardTitle>{item.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-6 text-[color:var(--muted-foreground)]">
                  {item.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Calculation process */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-[color:var(--foreground)]">{t.processTitle}</h2>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {steps.map((step) => (
            <Card key={step.title} variant="bordered">
              <CardHeader>
                <CardTitle>{step.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-6 text-[color:var(--muted-foreground)]">
                  {step.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Outputs */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-[color:var(--foreground)]">{t.outputsTitle}</h2>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {outputs.map((item) => (
            <Card key={item.title} variant="bordered">
              <CardHeader>
                <CardTitle>{item.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-6 text-[color:var(--muted-foreground)]">
                  {item.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Tips */}
      <section className="rounded-[var(--radius-xl)] border border-[color:var(--border)] bg-[color:var(--card)] p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-[color:var(--foreground)]">{t.tipsTitle}</h2>
        <ul className="mt-4 space-y-2 text-sm leading-6 text-[color:var(--muted-foreground)]">
          {tips.map((tip) => (
            <li key={tip}>• {tip}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}
