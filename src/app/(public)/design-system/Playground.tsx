"use client";

import { useState } from "react";
import { Button, Card, CardTitle, CardDescription, Slider, SegmentedControl, SegmentedControlItem, Progress, MeasurementTile, StatRow } from "@/components/ui";
import { OptionCard } from "@/components/ui/OptionCard";
import { StepCard } from "@/components/ui/StepCard";
import { ResultHero } from "@/components/ui/ResultHero";
import { ResultTile } from "@/components/ui/ResultTile";
import { StatusChip } from "@/components/ui/StatusChip";
import { Gauge } from "@/components/ui/Gauge";
import { SizeScale } from "@/components/ui/SizeScale";
import { AdjustOrder } from "@/components/ui/AdjustOrder";
import { ToolsTabBar } from "@/components/ui/ToolsTabBar";
import { MoreToolsNav } from "@/components/ui/MoreToolsNav";
import { ConfiguratorLayout } from "@/components/ui/ConfiguratorLayout";

export function DesignSystemPlayground() {
  const [inseam, setInseam] = useState(84);
  const [goal, setGoal] = useState("comfort");
  const [bike, setBike] = useState("road");
  const [saved, setSaved] = useState(false);
  return (
    <div className="pb-24">
      <ConfiguratorLayout
        eyebrow="Componenten · Voorbeeldgegevens"
        title="Hoe hoog moet je zadel?"
        description="Voorbeelden van onze invoer en resultaten. De getoonde afstelwaarden zijn voorbeeldgegevens."
        navigation={<div className="space-y-3"><ToolsTabBar activeTool="more" /><MoreToolsNav activeTool="power-speed" /></div>}
        inputs={<>
          <StepCard number={1} title="Jouw lichaam">
            <Slider label="Binnenbeenlengte" valueLabel={inseam.toLocaleString("nl-NL")} value={inseam} onChange={setInseam} min={60} max={100} step={0.5} unit="cm" ticks={[{value:60},{value:80},{value:100}]} helperText="Meet op blote voeten, met een boek tegen je kruis." />
            <Slider label="Lichaamslengte" value={178} onChange={() => {}} min={130} max={210} unit="cm" disabled helperText="Deze schuif is tijdelijk uitgeschakeld." />
            <Slider label="Huidige zadelhoogte" value={740} onChange={() => {}} min={500} max={900} unit="mm" error="Controleer je meting voordat je verdergaat." />
          </StepCard>
          <StepCard number={2} title="Hoe wil je rijden?">
            <SegmentedControl className="flex w-fit max-w-full" value={goal} onValueChange={(value) => setGoal(String(value))} aria-label="Rijdoel">
              <SegmentedControlItem value="comfort">Comfort</SegmentedControlItem><SegmentedControlItem value="balance">Balans</SegmentedControlItem><SegmentedControlItem value="performance">Prestatie</SegmentedControlItem>
            </SegmentedControl>
            <SegmentedControl className="flex w-fit max-w-full" variant="strong" defaultValue="road" aria-label="Fietscategorie">
              <SegmentedControlItem value="road">Race</SegmentedControlItem><SegmentedControlItem value="gravel">Gravel</SegmentedControlItem><SegmentedControlItem value="mtb" disabled>MTB</SegmentedControlItem>
            </SegmentedControl>
          </StepCard>
          <StepCard number={3} title="Kies je fiets">
            <OptionCard label="Racefiets" description="Voor langere ritten op asfalt." selected={bike === "road"} onClick={() => setBike("road")} />
            <OptionCard label="Gravelfiets" description="Voor asfalt en onverharde paden." selected={bike === "gravel"} onClick={() => setBike("gravel")} />
            <OptionCard label="Stadsfiets" description="Tijdelijk niet beschikbaar." disabled />
          </StepCard>
        </>}
        results={<>
          <ResultHero label="Je startpunt" value="742" unit="mm" subtext="Voorbeeld · test dit als startpunt, geen exacte eindpositie." />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <ResultTile label="Testmarge" value="737–747" unit="mm" status="Verfijn tijdens je volgende ritten." />
            <ResultTile label="Verschil met nu" value="−4" unit="mm" status={<StatusChip status="deviation">Iets lager</StatusChip>} />
          </div>
          <Gauge label="Binnen je testmarge" value={74} unit="%" />
          <SizeScale label="Cranklengte" options={[165,170,172.5,175].map(value=>({value}))} recommended={170} borderline={[172.5]} unit="mm" />
          <AdjustOrder steps={[{title:"Stel eerst je zadelhoogte in.",description:"Verander één maat tegelijk."},{title:"Rij twee rustige ritten.",description:"Let op comfort en een soepele trapbeweging."},{title:"Verfijn in kleine stappen.",description:"Bewaar de instelling die het best voelt."}]} />
          <Button onClick={() => setSaved(true)}>{saved ? "Voorbeeld bewaard" : "Bewaar in je account"}</Button>
          {saved && <p role="status" className="text-sm text-muted-foreground">Dit is een voorbeeld; er is niets in je account opgeslagen.</p>}
        </>}
        stickyResult={<div className="flex items-center justify-between gap-4"><span className="font-mono">742 <span className="text-sm">mm</span></span><span className="text-sm">Voorbeeld · je startpunt</span></div>}
      />
      <section aria-labelledby="more-states" className="mx-auto mt-12 max-w-[1312px] space-y-6 px-4 sm:px-8">
        <h2 id="more-states" className="text-3xl font-bold">Resultaten en toestanden</h2>
        <ToolsTabBar activeTool="saddle-height" />
        <ResultHero variant="ink" label="Je aanbevolen bereik" value="737–747" unit="mm" subtext="Voorbeeld · pas één maat tegelijk aan." />
        <div className="flex flex-wrap gap-3"><StatusChip status="ok">Binnen marge</StatusChip><StatusChip status="warn">Controleer je meting</StatusChip><StatusChip status="deviation">Te hoog</StatusChip></div>
        <div className="grid gap-6 md:grid-cols-3">
          <Card><CardTitle>Je voortgang</CardTitle><CardDescription>Je metingen maken het advies persoonlijker.</CardDescription><Progress label="Profiel ingevuld" value={75} max={100} /><dl><StatRow label="Metingen ingevuld" value="3 van 4" /></dl></Card>
          <MeasurementTile label="Huidige zadelhoogte" value={746} unit="mm" />
          <Card variant="bordered"><CardTitle>Begin met één aanpassing</CardTitle><CardDescription>Rij daarna twee ritten voordat je verder verfijnt.</CardDescription></Card>
        </div>
        <div className="flex flex-wrap gap-3"><Button>Start gratis bike fit</Button><Button variant="outline">Bekijk je advies</Button><Button variant="secondary">Meet opnieuw</Button><Button disabled>Niet beschikbaar</Button><Button isLoading>Bewaren</Button><Button variant="destructive">Verwijder voorbeeld</Button></div>
      </section>
    </div>
  );
}
