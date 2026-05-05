"use client";

// Video background for the hero section.
// The <video> element streams progressively so the animation starts playing
// before the file is fully downloaded. The poster shows instantly while the
// video buffers, and acts as the LCP candidate via the preload link Next.js
// emits for the <Image priority> below.

type HeroBackgroundProps = {
  posterSrc: string;
};

export function HeroBackground({ posterSrc }: HeroBackgroundProps) {
  return (
    <>
      {/* Shown immediately — establishes the LCP element before video buffers */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={posterSrc}
        alt=""
        fetchPriority="high"
        className="absolute inset-0 h-full w-full object-cover object-center"
        aria-hidden
      />
      <video
        autoPlay
        muted
        loop
        playsInline
        poster={posterSrc}
        className="absolute inset-0 h-full w-full object-cover object-center"
        aria-hidden
      >
        <source src="/bestbikefit4u-home.webm" type="video/webm" />
        <source src="/bestbikefit4u-home.mp4" type="video/mp4" />
      </video>
    </>
  );
}
