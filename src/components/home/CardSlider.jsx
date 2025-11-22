
/**
 prompt to make it reuseable:
hi, do you have access to CardSlider.jsx file from the files i uploaded in this project? if yes then read and understand its logic, need to make it dynamic, in term of autoscroll on or off, view all button render or not, dynamic heading and sub heading text of section, using PropertyCard any other card to render the data of items in cards of slides, and no. of cards per slide at different screens
 */

/**
 * CardSlider - adapted from Embla Shadcn Carousel sandbox
 * - preserves your original imports and file-level names
 * - embeds robust embla-auto-scroll behavior with pause/resume/settle logic
 *
 * Props:
 * - items: array of property objects (same shape as your PropertyCard expects)
 * - viewAllHref: href for view-all button (defaults to '#')
 * - onViewAll: optional callback
 * - autoScrollSpeed: numeric speed for AutoScroll plugin (defaults to 1)
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import AutoScroll from 'embla-carousel-auto-scroll';
import useEmblaCarousel from 'embla-carousel-react';
import PropertyCard from './PropertyCard';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, MoveRight } from 'lucide-react';

export default function CardSlider({ items = [], viewAllHref = '#', onViewAll = null, autoScrollSpeed = 0 }) {
  
  const autoScrollRef = useRef(AutoScroll({ speed: autoScrollSpeed, pauseOnHover: false, stopOnInteraction: false }));
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: 'start' }, [autoScrollRef.current]);
  const [selected, setSelected] = useState(0);
  const [isInViewport, setIsInViewport] = useState(true);
  
  const isHoveredRef = useRef(false);
  const clickedInsideRef = useRef(false);
  const resumeTimeoutRef = useRef(null);
  const settleTimeoutRef = useRef(null);

  const getPlugin = useCallback(() => {
  const plugins = emblaApi?.plugins?.();
  return Array.isArray(plugins)
    ? plugins.find(p => p?.play || p?.start) || autoScrollRef.current
    : autoScrollRef.current;
}, [emblaApi, autoScrollRef]);

  const stop = useCallback((p) => p && (p.stop?.() || p.pause?.()), []);
  const play = useCallback((p) => p && (p.play?.() || p.start?.()), []);

  const settleAndResume = useCallback((retry = true) => {
    const plugin = getPlugin();
    if (!emblaApi || !plugin || isHoveredRef.current || clickedInsideRef.current || !isInViewport) return;

    emblaApi.scrollTo(emblaApi.selectedScrollSnap());
    if (settleTimeoutRef.current) clearTimeout(settleTimeoutRef.current);
    
    settleTimeoutRef.current = setTimeout(() => {
      if (!play(plugin) && retry) {
        if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
        resumeTimeoutRef.current = setTimeout(() => settleAndResume(false), 250);
      }
    }, 220);
  }, [getPlugin, emblaApi, isInViewport, play]);

  const doPause = useCallback(() => stop(getPlugin()), [getPlugin, stop]);

  const handleArrowClick = useCallback((direction) => {
    doPause();
    emblaApi?.[direction === 'prev' ? 'scrollPrev' : 'scrollNext']();
    if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
    resumeTimeoutRef.current = setTimeout(() => settleAndResume(), 350);
  }, [emblaApi, doPause, settleAndResume]);

  // Viewport observer
  useEffect(() => {
    const node = emblaRef?.current;
    if (!node) return;
    const io = new IntersectionObserver(([e]) => setIsInViewport(e.isIntersecting), { threshold: 0.1 });
    io.observe(node);
    return () => io.disconnect();
  }, [emblaRef]);

  // Select handler
  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelected(emblaApi.selectedScrollSnap());
    onSelect();
    emblaApi.on('select', onSelect).on('reInit', onSelect);
    return () => emblaApi.off('select', onSelect).off('reInit', onSelect);
  }, [emblaApi]);

  // Auto-start with retry
  useEffect(() => {
    if (!emblaApi) return;
    let attempts = 0;
    const tryStart = () => {
      attempts++;
      const plugin = getPlugin();
      if (isInViewport && emblaApi.scrollSnapList().length && plugin && play(plugin)) {
        clearInterval(interval);
      }
      if (attempts >= 8) clearInterval(interval);
    };
    tryStart();
    const interval = setInterval(tryStart, 250);
    return () => clearInterval(interval);
  }, [emblaApi, isInViewport, getPlugin, play]);

  // Embla interaction listeners
  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on('pointerDown', doPause).on('dragStart', doPause)
      .on('pointerUp', settleAndResume).on('dragEnd', settleAndResume).on('settle', settleAndResume);
    return () => emblaApi.off('pointerDown', doPause).off('dragStart', doPause)
      .off('pointerUp', settleAndResume).off('dragEnd', settleAndResume).off('settle', settleAndResume);
  }, [emblaApi, doPause, settleAndResume]);

  // Click outside handler
  useEffect(() => {
    const onDocClick = (e) => {
      if (!emblaRef?.current?.contains(e.target)) {
        clickedInsideRef.current = false;
        settleAndResume();
      }
    };
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, [emblaRef, settleAndResume]);

  // Cleanup
  useEffect(() => () => {
    clearTimeout(resumeTimeoutRef.current);
    clearTimeout(settleTimeoutRef.current);
    stop(getPlugin());
  }, [getPlugin, stop]);

  if (!items?.length) return null;

  return (
    <div className="w-full">
      <div className="max-w-[1440px] mx-auto px-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xl font-semibold">Featured Listings</h3>
          <div className="flex gap-2">
              <Button variant="ghost" size="icon" className="rounded-full shadow-md" onClick={() => handleArrowClick('prev')} aria-label="Previous">
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full shadow-md" onClick={() => handleArrowClick('next')} aria-label="Next">
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
        </div>

        <div className="relative">
          <div className="overflow-hidden" ref={emblaRef} 
            onMouseEnter={() => { isHoveredRef.current = true; doPause(); }}
            onMouseLeave={() => { isHoveredRef.current = false; settleAndResume(); }}
            onClick={() => { clickedInsideRef.current = true; doPause(); }}>
            <div className="flex gap-4" style={{ willChange: 'transform' }}>
              {items.map((item) => (
                <div key={item.id} className="w-full shrink-0 sm:w-1/2 md:w-1/3">
                  <div className="p-1">
                    <PropertyCard {...item} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-center mt-2">
            
            
            <Button variant="ghost" className={"shadow-md "} onClick={(e) => onViewAll ? onViewAll(e) : window.location.href = viewAllHref}>
              <span className="text-md">View all properties</span>
              <MoveRight strokeWidth={1.5} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}