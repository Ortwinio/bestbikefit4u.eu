import Image from "next/image";
import type { ReactNode } from "react";
import styles from "./Guides.module.css";

export function GuideHero({ eyebrow, title, description, image, imageAlt, illustration = false, children }: {
  eyebrow: string;
  title: string;
  description: string;
  image: string;
  imageAlt: string;
  illustration?: boolean;
  children?: ReactNode;
}) {
  return (
    <header className={styles.hero}>
      <div>
        <p className={styles.eyebrow}>{eyebrow}</p>
        <h1>{title}</h1>
        <p>{description}</p>
        {children}
      </div>
      <Image src={image} alt={imageAlt} width={600} height={440} className={illustration ? styles.illustration : undefined} />
    </header>
  );
}
