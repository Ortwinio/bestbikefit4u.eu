import type { Locale } from "@/i18n/config";
import { scienceExtras } from "@/i18n/marketing/science";
import styles from "./editorial.module.css";

export function StackReachFigure({ locale }: { locale: Locale }) {
  const copy = scienceExtras[locale];
  return (
    <figure className="my-8">
      <svg viewBox="0 0 760 340" role="img" aria-label={copy.diagram} className={styles.diagram}>
        <g fill="none" stroke="var(--marketing-foreground)" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M90 255 160 55 445 100 460 170 235 270 90 255M160 55 235 270" />
        </g>
        <g stroke="var(--marketing-muted)" strokeDasharray="3 3" fill="none">
          <path d="M235 270V100H445V270" />
        </g>
        <g stroke="var(--marketing-link)" strokeWidth="2" fill="none">
          <path d="M505 100V270m-7-170h14m-14 170h14M235 302H445m-210-7v14m210-14v14" />
        </g>
        <g fill="var(--bbf-lime)" stroke="var(--marketing-foreground)" strokeWidth="3">
          <circle cx="235" cy="270" r="5" />
          <circle cx="445" cy="100" r="5" />
        </g>
        <g fill="var(--marketing-link)" fontSize="16" fontWeight="700">
          <text x="525" y="190">
            Stack
          </text>
          <text x="310" y="328">
            Reach
          </text>
        </g>
      </svg>
      <figcaption className="mt-3 text-sm leading-relaxed text-muted-foreground">
        {copy.diagramCaption}
      </figcaption>
    </figure>
  );
}
