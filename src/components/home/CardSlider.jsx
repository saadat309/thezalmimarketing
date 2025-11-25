/**
 * CardSlider - Embla carousel with combined breakpoints + customWidths support
 * - preserves your original imports and file-level names
 * - supports mobile-first (min-width) breakpoints (default, sm, md, lg, xl)
 * - supports customWidths array of objects { width: number, cards: number }
 *   which apply at their min-width (viewport >= width), but only within the
 *   same breakpoint bucket so they don't override larger breakpoint rules.
 *
 * Example usage:
 * <CardSlider
 *   items={data}
 *   customWidths={[{width:300, cards:2}, {width:1100, cards:5}]}
 *   breakpoints={{ default:1, sm:2, md:3, lg:4, xl:5 }}
 * />
 */

import React, { useCallback, useEffect, useRef, useState } from "react";
import AutoScroll from "embla-carousel-auto-scroll";
import useEmblaCarousel from "embla-carousel-react";
import PropertyCard from "../global/PropertyCard";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, MoveRight } from "lucide-react";

export default function CardSlider({
  items = [],
  viewAllHref = "#",
  onViewAll = null,
  autoScrollSpeed = 1,
  loop = true,

  /* === NEW/CHANGED PROPS === */
  heading = "Featured Listings",
  subheading = null,
  showViewAll = true,
  viewAllText = "View all properties",
  CardComponent = PropertyCard,
  breakpoints = {
    default: 1,
    sm: 2,
    md: 3,
    lg: 3,
    xl: 3,
  },

  // customWidths MUST be array of objects: { width: number, cards: number }
  // They are treated as min-width rules and combined with breakpoints.
  customWidths = [{ width: 1441, cards: 4 }],
}) {
  // Create pluginRef but only mount AutoScroll plugin when autoScrollSpeed > 0
  const pluginRef = useRef(null);
  useEffect(() => {
    if (autoScrollSpeed > 0) {
      pluginRef.current = AutoScroll({
        speed: autoScrollSpeed,
        pauseOnHover: false,
        stopOnInteraction: false,
      });
    } else {
      pluginRef.current = null;
    }
    // cleanup when unmount or speed changes
    return () => {
      // AutoScroll plugin doesn't expose a destroy, but ensure ref cleared on unmount/changes
      pluginRef.current = null;
    };
  }, [autoScrollSpeed]);

  // pass plugins conditionally to embla
  const plugins = pluginRef.current ? [pluginRef.current] : [];

  // pass loop prop to embla options
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop, align: "start" },
    plugins
  );
  const [selected, setSelected] = useState(0);
  const [isInViewport, setIsInViewport] = useState(true);

  const isHoveredRef = useRef(false);
  const clickedInsideRef = useRef(false);
  const resumeTimeoutRef = useRef(null);
  const settleTimeoutRef = useRef(null);

  const [cardsPerSlide, setCardsPerSlide] = useState(breakpoints.default || 1);

  const normalizeCustomWidths = useCallback((arr) => {
    if (!Array.isArray(arr)) return [];
    const list = [];
    for (let i = 0; i < arr.length; i++) {
      const entry = arr[i];
      if (!entry || typeof entry !== "object") continue;
      let rawW = entry.width;
      if (typeof rawW === "string")
        rawW = rawW.trim().toLowerCase().replace(/px$/, "");
      const w = Number(rawW);
      const c = Number(entry.cards);
      if (!Number.isFinite(w) || w <= 0 || !Number.isFinite(c) || c <= 0)
        continue;
      list.push({ width: Math.round(w), cards: Math.max(1, Math.floor(c)) });
    }
    return list.sort((a, b) => a.width - b.width);
  }, []);

  // get plugin helper: prefer embla's plugin list, otherwise pluginRef
  const getPlugin = useCallback(() => {
    const pluginsFromEmbla = emblaApi?.plugins?.();
    if (Array.isArray(pluginsFromEmbla)) {
      const found = pluginsFromEmbla.find((p) => p?.play || p?.start);
      if (found) return found;
    }
    return pluginRef.current;
  }, [emblaApi]);

  const stop = useCallback((p) => p && (p.stop?.() || p.pause?.()), []);
  const play = useCallback((p) => p && (p.play?.() || p.start?.()), []);

  const settleAndResume = useCallback(
    (retry = true) => {
      const plugin = getPlugin();
      if (
        !emblaApi ||
        !plugin ||
        isHoveredRef.current ||
        clickedInsideRef.current ||
        !isInViewport
      )
        return;
      emblaApi.scrollTo(emblaApi.selectedScrollSnap());
      if (settleTimeoutRef.current) clearTimeout(settleTimeoutRef.current);
      settleTimeoutRef.current = setTimeout(() => {
        if (!play(plugin) && retry) {
          if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
          resumeTimeoutRef.current = setTimeout(
            () => settleAndResume(false),
            250
          );
        }
      }, 220);
    },
    [getPlugin, emblaApi, isInViewport, play]
  );

  const doPause = useCallback(() => stop(getPlugin()), [getPlugin, stop]);

  // handle arrow click: pause/resume only if plugin exists; manual scroll always works
  const handleArrowClick = useCallback(
    (direction) => {
      const plugin = getPlugin();
      if (plugin) doPause();
      emblaApi?.[direction === "prev" ? "scrollPrev" : "scrollNext"]();
      if (plugin) {
        if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
        resumeTimeoutRef.current = setTimeout(() => settleAndResume(), 350);
      }
    },
    [emblaApi, doPause, settleAndResume, getPlugin]
  );

  useEffect(() => {
    const node = emblaRef?.current;
    if (!node) return;
    const io = new IntersectionObserver(
      ([e]) => setIsInViewport(e.isIntersecting),
      { threshold: 0.1 }
    );
    io.observe(node);
    return () => io.disconnect();
  }, [emblaRef]);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelected(emblaApi.selectedScrollSnap());
    onSelect();
    emblaApi.on("select", onSelect).on("reInit", onSelect);
    return () => emblaApi.off("select", onSelect).off("reInit", onSelect);
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    let attempts = 0;
    const tryStart = () => {
      attempts++;
      const plugin = getPlugin();
      if (
        isInViewport &&
        emblaApi.scrollSnapList().length &&
        plugin &&
        play(plugin)
      ) {
        clearInterval(interval);
      }
      if (attempts >= 8) clearInterval(interval);
    };
    tryStart();
    const interval = setInterval(tryStart, 250);
    return () => clearInterval(interval);
  }, [emblaApi, isInViewport, getPlugin, play]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi
      .on("pointerDown", doPause)
      .on("dragStart", doPause)
      .on("pointerUp", settleAndResume)
      .on("dragEnd", settleAndResume)
      .on("settle", settleAndResume);
    return () =>
      emblaApi
        .off("pointerDown", doPause)
        .off("dragStart", doPause)
        .off("pointerUp", settleAndResume)
        .off("dragEnd", settleAndResume)
        .off("settle", settleAndResume);
  }, [emblaApi, doPause, settleAndResume]);

  useEffect(() => {
    const onDocClick = (e) => {
      if (!emblaRef?.current?.contains(e.target)) {
        clickedInsideRef.current = false;
        settleAndResume();
      }
    };
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, [emblaRef, settleAndResume]);

  useEffect(
    () => () => {
      clearTimeout(resumeTimeoutRef.current);
      clearTimeout(settleTimeoutRef.current);
      stop(getPlugin());
    },
    [getPlugin, stop]
  );

  /*
    Combined breakpoint + customWidths logic (mobile-first / min-width):
    1. Compute base cards from breakpoints (min-width cascade)
    2. Normalize customWidths; determine the "breakpoint bucket" for the current viewport
       (using standard Tailwind min-width thresholds). Only consider customWidths entries
       that fall within the same breakpoint bucket range — this prevents a small customWidth
       (e.g. 380) from overriding a larger breakpoint (e.g. md at 768).
    3. If there's an applicable customWidth in the same bucket whose min-width is satisfied,
       use its cards (pick highest). Otherwise, use the base breakpoint cards.
  */
  useEffect(() => {
    if (typeof window === "undefined") {
      setCardsPerSlide(breakpoints.default || 1);
      return;
    }

    const normalized = normalizeCustomWidths(customWidths);

    // Tailwind-like breakpoint mins (mobile-first)
    const BP_MINS = [
      { name: "default", min: 0 },
      { name: "sm", min: 640 },
      { name: "md", min: 768 },
      { name: "lg", min: 1024 },
      { name: "xl", min: 1280 },
    ];

    const compute = () => {
      const w = window.innerWidth;

      // 1) base from breakpoints (min-width cascade). Use provided breakpoints values
      // but standard min-width thresholds for the cascade.
      let base = breakpoints.default || 1;
      if (breakpoints.xl && w >= 1280) base = breakpoints.xl;
      else if (breakpoints.lg && w >= 1024) base = breakpoints.lg;
      else if (breakpoints.md && w >= 768) base = breakpoints.md;
      else if (breakpoints.sm && w >= 640) base = breakpoints.sm;

      // 2) determine current breakpoint bucket min and next bucket min
      let currentBucket = BP_MINS[0];
      for (let i = BP_MINS.length - 1; i >= 0; i--) {
        if (w >= BP_MINS[i].min) {
          currentBucket = BP_MINS[i];
          break;
        }
      }
      const nextBucketIndex =
        BP_MINS.findIndex((b) => b.name === currentBucket.name) + 1;
      const nextBucket = BP_MINS[nextBucketIndex];
      const bucketMin = currentBucket.min;
      const bucketMax = nextBucket ? nextBucket.min - 1 : Infinity;

      // 3) find custom widths that belong to this bucket (their width is inside [bucketMin, bucketMax])
      const inBucket = normalized.filter(
        (entry) =>
          entry.width >= bucketMin &&
          entry.width <= bucketMax &&
          w >= entry.width
      );
      if (inBucket.length > 0) {
        // pick the highest width among applicable entries
        const best = inBucket[inBucket.length - 1];
        setCardsPerSlide(best.cards);
        return;
      }

      // 4) fallback to base breakpoint
      setCardsPerSlide(Math.max(1, base));
    };

    compute();
    const onResize = () => compute();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [breakpoints, customWidths, normalizeCustomWidths]);

  // Arrow visibility: show arrows when there is manual scroll possible or items > visible
  const [showArrows, setShowArrows] = useState(false);
  useEffect(() => {
    if (!emblaApi) return;

    const updateArrows = () => {
      const itemsCount = items?.length || 0;
      const hasScroll = emblaApi.canScrollPrev() || emblaApi.canScrollNext();
      const moreThanVisible = itemsCount > Math.max(1, cardsPerSlide);

      // Show arrows when manual scroll possible OR there are more items than visible OR loop is enabled with multiple items
      const shouldShow =
        hasScroll || moreThanVisible || (loop && itemsCount > 1);
      setShowArrows(Boolean(shouldShow));
    };

    updateArrows();
    emblaApi
      .on("select", updateArrows)
      .on("reInit", updateArrows)
      .on("resize", updateArrows);
    return () =>
      emblaApi
        .off("select", updateArrows)
        .off("reInit", updateArrows)
        .off("resize", updateArrows);
  }, [emblaApi, cardsPerSlide, items, loop]);

  if (!items?.length) return null;
  const slideWidthPercent = 100 / Math.max(1, cardsPerSlide);

  return (
    <div className="w-full ">
      <div className="max-w-[1440px] mx-auto px-4 md:px-10">
        <div className="flex items-end justify-between mb-2">
          <div className="flex flex-col items-start mb-2 md:px-8">
            {heading && (
              <h3 className="text-2xl font-semibold sm:font-bold">{heading}</h3>
            )}
            {subheading && (
              <div className="mt-1 text-sm text-muted-foreground">
                {subheading}
              </div>
            )}
          </div>

          <div className="flex gap-2">
            {showArrows && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full shadow-md"
                  onClick={() => handleArrowClick("prev")}
                  aria-label="Previous"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full shadow-md"
                  onClick={() => handleArrowClick("next")}
                  aria-label="Next"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="relative">
          <div
            className="overflow-hidden "
            ref={emblaRef}
            onMouseEnter={() => {
              isHoveredRef.current = true;
              const plugin = getPlugin();
              if (plugin) doPause();
            }}
            onMouseLeave={() => {
              isHoveredRef.current = false;
              settleAndResume();
            }}
            onClick={() => {
              clickedInsideRef.current = true;
              const plugin = getPlugin();
              if (plugin) doPause();
            }}
          >
            <div className="flex" style={{ willChange: "transform" }}>
              {items.map((item, idx) => (
                <div
                  key={item.id ?? idx}
                  className="shrink-0 "
                  style={{ width: `${slideWidthPercent}%` }}
                >
                  <div className="p-1">
                    <CardComponent {...item} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-center mt-2">
            {showViewAll && (
              <Button
                variant="ghost"
                className={"shadow-md "}
                onClick={(e) =>
                  onViewAll
                    ? onViewAll(e)
                    : (window.location.href = viewAllHref)
                }
              >
                <span className="text-md">{viewAllText}</span>
                <MoveRight strokeWidth={1.5} />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
