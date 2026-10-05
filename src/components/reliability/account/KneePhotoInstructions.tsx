import type { AccountReliabilityCopy } from "@/i18n/account/reliability";
import { Card } from "@/components/ui/Card";

export function KneePhotoInstructions({ copy }: { copy: AccountReliabilityCopy }) {
  return <div className="space-y-4">
    <Card className="p-6">
      <figure>
        <svg viewBox="0 0 380 300" className="w-full rounded-xl bg-muted text-foreground" role="img" aria-label={copy.photoCaption}>
          <g stroke="currentColor" strokeWidth="4" fill="none" strokeLinecap="round">
            <path d="M140 30 L205 165 L175 270" />
            <path d="M205 165 L237 232" strokeDasharray="5 5" strokeWidth="2" />
            <path d="M219 194 A32 32 0 0 1 197 196" strokeWidth="2" />
            <circle cx="140" cy="30" r="8" /><circle cx="205" cy="165" r="8" /><circle cx="175" cy="270" r="8" />
          </g>
          <g fill="currentColor" fontSize="16"><text x="160" y="35">{copy.hip}</text><text x="225" y="160">{copy.kneeJoint}</text><text x="195" y="280">{copy.ankle}</text><text x="245" y="215">{copy.angle}</text></g>
        </svg>
        <figcaption className="mt-3 text-sm text-muted-foreground">{copy.photoCaption}</figcaption>
      </figure>
    </Card>
    <Card className="space-y-3 p-6"><h2 className="text-lg font-semibold">{copy.instructions}</h2><ol className="list-decimal space-y-3 pl-5">{copy.steps.map((step) => <li key={step}>{step}</li>)}</ol></Card>
  </div>;
}
