"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

type HeroBackgroundProps = {
  posterSrc: string;
  // Pass the GIF (or future WebM/MP4) src to lazy-load it after the poster.
  // When a video file is available, replace animatedSrc with a <video> element.
  animatedSrc: string;
};

export function HeroBackground({ posterSrc, animatedSrc }: HeroBackgroundProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const img = new window.Image();
    img.onload = () => {
      const el = overlayRef.current;
      if (!el) return;
      el.style.backgroundImage = `url(${animatedSrc})`;
      // Trigger reflow so the transition fires on opacity change
      void el.offsetHeight;
      el.style.opacity = "1";
    };
    img.src = animatedSrc;
  }, [animatedSrc]);

  return (
    <>
      {/* Static poster: loads immediately, becomes the LCP candidate */}
      <Image
        src={posterSrc}
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover object-center"
        aria-hidden
      />
      {/* Animated overlay: deferred until after LCP, fades in once loaded */}
      <div
        ref={overlayRef}
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-700"
        style={{ opacity: 0 }}
        aria-hidden
      />
    </>
  );
}
