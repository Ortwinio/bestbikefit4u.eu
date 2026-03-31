export function FitDisclaimer({ locale }: { locale: string }) {
  const isNl = locale === "nl";
  return (
    <aside className="mt-10 rounded-2xl border border-border bg-secondary p-6 text-sm text-muted-foreground">
      <p className="font-semibold text-foreground">
        {isNl ? "Een noot over pijn en passing" : "A note on pain and fitting"}
      </p>
      <p className="mt-2">
        {isNl
          ? "Positieaanpassingen lossen veel voorkomende rijklachten op. Ze diagnosticeren of behandelen geen blessures. Bij acute, verergerende of aanhoudende pijn na aanpassing, raadpleeg een fysiotherapeut of sportarts."
          : "Position adjustments address many common riding discomforts. They cannot diagnose or treat injury. If pain is acute, worsening, or does not improve after a few rides with the adjusted position, see a physiotherapist or sports medicine specialist."}
      </p>
    </aside>
  );
}
