export function DashboardNumber({ value, unit }: { value: string | number; unit?: string }) {
  const text = String(value);
  const parts = unit ? [text, unit] : text.match(/^(.*?)\s*(mm|cm|kg|bar|psi|%)$/)?.slice(1);
  return <span data-dashboard-number data-dashboard-value={unit ? `${text} ${unit}` : text} className="font-mono">
    {parts ? <>{parts[0]}<span className="ml-1 text-xs text-muted-foreground">{parts[1]}</span></> : text}
  </span>;
}
