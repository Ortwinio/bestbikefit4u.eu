"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/prototyper-ui/ui/button";
import { pushDataLayerEvent } from "@/lib/analytics/marketing";
import type { PublicShowcaseBike } from "./bike-showcase.types";
import { BikeShowcaseCard } from "./BikeShowcaseCard";
import { BikeShowcaseModal } from "./BikeShowcaseModal";
import { buildBikeFitHref } from "./bikeFitHref";

type BikeShowcaseCarouselProps = {
  bikes: PublicShowcaseBike[];
  ctaHref: string;
  copy: {
    prevLabel: string;
    nextLabel: string;
    regionLabel: string;
    geometryVerified: string;
    stackLabel: string;
    reachLabel: string;
    ettLabel: string;
    staLabel: string;
    htaLabel: string;
    wheelbaseLabel: string;
    tyreLabel: string;
    frontLabel: string;
    rearLabel: string;
    pressureUnit: string;
    psiUnit: string;
    pressureDisclaimer: string;
    pressureAvailable: string;
    geometrySection: string;
    tyreSection: string;
    geometrySource: string;
    ctaButton: string;
    viewDetails: string;
    useInFitLabel: string;
    partialGeometry: string;
    mmUnit: string;
    degUnit: string;
    cardAriaLabel: string;
  };
};

export function BikeShowcaseCarousel({ bikes, ctaHref, copy }: BikeShowcaseCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedBike, setSelectedBike] = useState<PublicShowcaseBike | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const viewTracked = useRef(false);

  // Track section view once
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !viewTracked.current) {
          viewTracked.current = true;
          pushDataLayerEvent({ event: "bike_showcase_section_view" });
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const scrollToIndex = useCallback((index: number) => {
    const track = trackRef.current;
    if (!track) return;

    const card = track.children[index] as HTMLElement | undefined;
    if (!card) return;

    track.scrollTo({ left: card.offsetLeft - track.offsetLeft, behavior: "smooth" });
    setActiveIndex(index);
  }, []);

  function handlePrev() {
    pushDataLayerEvent({ event: "bike_showcase_nav_click", direction: "prev" });
    scrollToIndex(Math.max(0, activeIndex - 1));
  }

  function handleNext() {
    pushDataLayerEvent({ event: "bike_showcase_nav_click", direction: "next" });
    scrollToIndex(Math.min(bikes.length - 1, activeIndex + 1));
  }

  function handleCardClick(bike: PublicShowcaseBike) {
    pushDataLayerEvent({ event: "bike_showcase_card_click" });
    pushDataLayerEvent({ event: "bike_showcase_modal_open" });
    setSelectedBike(bike);
    setModalOpen(true);
  }

  // Update active index on scroll
  function handleScroll() {
    const track = trackRef.current;
    if (!track || bikes.length === 0) return;

    const cardWidth = (track.children[0] as HTMLElement | undefined)?.offsetWidth ?? 0;
    if (cardWidth === 0) return;

    const scrollLeft = track.scrollLeft;
    const index = Math.round(scrollLeft / (cardWidth + 16)); // 16px = gap-4
    setActiveIndex(Math.max(0, Math.min(bikes.length - 1, index)));
  }

  const cardCopy = {
    geometryVerified: copy.geometryVerified,
    stackLabel: copy.stackLabel,
    reachLabel: copy.reachLabel,
    pressureUnit: copy.pressureUnit,
    pressureAvailable: copy.pressureAvailable,
    viewDetails: copy.viewDetails,
    useInFitLabel: copy.useInFitLabel,
    cardAriaLabel: copy.cardAriaLabel,
    mmUnit: copy.mmUnit,
  };

  return (
    <div ref={sectionRef} className="relative">
      {/* Carousel track */}
      <div
        ref={trackRef}
        role="region"
        aria-label={copy.regionLabel}
        aria-roledescription="carousel"
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 scrollbar-none"
        onScroll={handleScroll}
      >
        {bikes.map((bike) => (
          <BikeShowcaseCard
            key={bike.showcaseId}
            bike={bike}
            copy={cardCopy}
            onDetailsClick={() => handleCardClick(bike)}
            fitHref={buildBikeFitHref(ctaHref, bike)}
          />
        ))}
      </div>

      {/* Navigation — hidden on lg+ where all bikes fit without scrolling */}
      {bikes.length > 1 && (
        <div className="mt-4 flex items-center justify-center gap-4 lg:hidden">
          <Button
            variant="outline"
            size="icon-sm"
            onClick={handlePrev}
            aria-label={copy.prevLabel}
            disabled={activeIndex === 0}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          {/* Dots */}
          <div className="flex gap-1.5" role="tablist" aria-label={copy.regionLabel}>
            {bikes.map((bike, i) => (
              <button
                key={bike.showcaseId}
                role="tab"
                aria-selected={i === activeIndex}
                aria-label={`${bike.brand} ${bike.model}`}
                onClick={() => {
                  scrollToIndex(i);
                }}
                className={`h-2 w-2 rounded-full transition-colors ${
                  i === activeIndex ? "bg-primary" : "bg-muted hover:bg-muted-foreground/40"
                }`}
              />
            ))}
          </div>

          <Button
            variant="outline"
            size="icon-sm"
            onClick={handleNext}
            aria-label={copy.nextLabel}
            disabled={activeIndex === bikes.length - 1}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Modal */}
      <BikeShowcaseModal
        bike={selectedBike}
        open={modalOpen}
        onOpenChange={setModalOpen}
        ctaHref={ctaHref}
        copy={copy}
      />
    </div>
  );
}
