"use client";

import { useEffect, useState } from "react";

type ConnectionPreferences = EventTarget & {
  saveData?: boolean;
  effectiveType?: string;
};

type HeroBackgroundProps = {
  posterSrc: string;
};

export function HeroBackground({ posterSrc }: HeroBackgroundProps) {
  const [showVideo, setShowVideo] = useState(false);

  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const connection = (
      navigator as Navigator & { connection?: ConnectionPreferences }
    ).connection;
    let timer: ReturnType<typeof setTimeout> | undefined;

    function updatePlayback() {
      clearTimeout(timer);
      const usePosterOnly =
        motion.matches ||
        connection?.saveData === true ||
        connection?.effectiveType === "slow-2g" ||
        connection?.effectiveType === "2g";

      if (usePosterOnly) {
        setShowVideo(false);
      } else if (document.readyState === "complete") {
        // Keep decorative media off the initial image/script download path.
        timer = setTimeout(() => setShowVideo(true), 200);
      }
    }

    updatePlayback();
    window.addEventListener("load", updatePlayback);
    motion.addEventListener("change", updatePlayback);
    connection?.addEventListener("change", updatePlayback);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("load", updatePlayback);
      motion.removeEventListener("change", updatePlayback);
      connection?.removeEventListener("change", updatePlayback);
    };
  }, []);

  return (
    <>
      {/* Rendered on the server so the hero stays visible without JavaScript. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={posterSrc}
        alt=""
        fetchPriority="high"
        className="absolute inset-0 h-full w-full object-cover object-center"
        aria-hidden
      />
      {showVideo ? (
        <video
          autoPlay
          muted
          loop
          playsInline
          poster={posterSrc}
          className="absolute inset-0 h-full w-full object-cover object-center"
          aria-hidden
        >
          {/* The existing MP4 is about half the size of the WebM. */}
          <source src="/bestbikefit4u-home.mp4" type="video/mp4" />
          <source src="/bestbikefit4u-home.webm" type="video/webm" />
        </video>
      ) : null}
    </>
  );
}
