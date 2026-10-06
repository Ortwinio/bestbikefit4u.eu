import Image from "next/image";
import { ShortAnswer } from "@/components/calculators/CalculatorAnswerSection";
import type { Locale } from "@/i18n/config";
import type { ReactNode } from "react";
import styles from "./Guides.module.css";

export function GuideHero({ eyebrow, title, description, image, imageAlt, illustration = false, children, answerLocale }: {
  eyebrow: string;
  title: string;
  description: string;
  image: string;
  imageAlt: string;
  illustration?: boolean;
  children?: ReactNode;
  answerLocale?: Locale;
}) {
  return (
    <header className={styles.hero}>
      <div>
        <p className={styles.eyebrow}>{eyebrow}</p>
        <h1>{title}</h1>
        {answerLocale ? <ShortAnswer text={description} locale={answerLocale} /> : <p>{description}</p>}
        {children}
      </div>
      <Image
        src={image} alt={imageAlt} width={600} height={440}
        sizes={
          "(max-width: 700px) calc(100vw - 40px), (max-width: 1000px) calc(43.48vw - 31.31px), "
          + "(max-width: 1248px) calc(43.48vw - 41.74px), 501px"
        }
        className={illustration ? styles.illustration : undefined}
      />
    </header>
  );
}
