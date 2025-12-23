import React from "react";
import useEmblaCarousel from "embla-carousel-react";
import AutoScroll from "embla-carousel-auto-scroll";
import { useNavigate } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";

export default function FileMarquee({ items = [] }) {
  const navigate = useNavigate();
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: "start" },
    [
      AutoScroll({
        speed: 0.7,
        stopOnInteraction: false,
        playOnInit: true,
      }),
    ]
  );

  const onMouseEnter = React.useCallback(() => {
    const autoScroll = emblaApi?.plugins()?.autoScroll;
    if (!autoScroll) return;
    autoScroll.stop();
  }, [emblaApi]);

  const onMouseLeave = React.useCallback(() => {
    const autoScroll = emblaApi?.plugins()?.autoScroll;
    if (!autoScroll) return;
    autoScroll.play();
  }, [emblaApi]);

  const handleItemClick = (item) => {
    navigate({
      to: "/files",
      search: (prev) => ({
        ...prev,
        query: item.title,
        scrollTo: item.id
      })
    });
  };

  if (!items || items.length === 0) return null;

  return (
    <div 
      className="w-full bg-primary py-3 border-y border-white/10 overflow-hidden"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="embla" ref={emblaRef}>
        <div className="flex">
          {/* Duplicate items to ensure smooth looping even with small data sets */}
          {[...items, ...items, ...items].map((item, idx) => {
            const specialBadges = (item.badges || []).filter(b => {
              const label = b.label.toLowerCase();
              return label.includes('hot') || label.includes('new');
            });

            return (
              <div
                key={`${item.id}-${idx}`}
                className="flex items-center gap-4 px-12 whitespace-nowrap border-r border-white/20 last:border-r-0 cursor-pointer transition-colors hover:bg-white/5"
                onClick={() => handleItemClick(item)}
              >
                <div className="flex items-center gap-2">
                  {specialBadges.map((badge, bIdx) => {
                    const label = badge.label.toLowerCase();
                    const variant = label.includes('hot') ? 'hot' : 'new';
                    return (
                      <Badge 
                        key={bIdx} 
                        variant={variant} 
                        className="text-[10px] px-1.5 py-0 uppercase"
                      >
                        {badge.label}
                      </Badge>
                    );
                  })}
                  <span className="text-sm font-bold text-white">
                    {item.title}
                  </span>
                </div>
                <div className="flex items-baseline gap-1">
                <span className="text-xs font-medium text-white/90">
                  {item.currency || "Rs."}
                </span>
                <span className="text-lg font-bold text-white">
                  {item.price?.toLocaleString()}
                </span>
              </div>
            </div>
          )})}
        </div>
      </div>
    </div>
  );
}
