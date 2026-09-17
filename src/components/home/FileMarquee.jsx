import React from "react";
import { useNavigate } from "@tanstack/react-router";
import { MapPin, Maximize2, Tag } from "lucide-react";

export default function FileMarquee({ items = [] }) {
  const navigate = useNavigate();

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
    <div className="group/marquee relative flex w-full overflow-hidden [--duration:45s] [--gap:16px] sm:[--gap:24px] [gap:var(--gap)] py-4 sm:py-6 bg-transparent border-0 shadow-none backdrop-blur-none">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={`marquee-item-${index}`}
          className="flex shrink-0 [gap:var(--gap)] marquee-pause-on-hover marquee-horizontal flex-row items-center"
        >
          {items.map((item, idx) => {
            const specialBadges = (item.badges || []).filter(b => {
              const label = b.label.toLowerCase();
              return label.includes('hot') || label.includes('new') || label.includes('featured');
            });

            const areaDisplay = item.area ? `${item.area.toLocaleString()} ${item.unit || 'Sq.Ft.'}` : null;
            const locationDisplay = [item.society_name, item.phase, item.block].filter(Boolean).join(', ');

            return (
              <div
                key={`${item.id}-${index}-${idx}`}
                onClick={() => handleItemClick(item)}
                className="flex flex-col justify-between p-3.5 sm:p-5 rounded-2xl bg-gradient-to-r from-[#F5A623] via-[#D4AF37] to-[#C5A059] border border-[#F3E5AB]/60 hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(212,175,55,0.45)] cursor-pointer transition-all duration-300 group min-w-[280px] sm:min-w-[340px] md:min-w-[400px] h-[125px] sm:h-[135px] shadow-xl text-slate-950"
              >
                {/* Top Row: Sale / Offer Token Badges & Area */}
                <div className="flex items-center justify-between gap-2 w-full">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {specialBadges.map((badge, bIdx) => {
                      const labelLower = badge.label.toLowerCase();
                      const isHot = labelLower.includes('hot') || labelLower.includes('featured');
                      
                      // Sale token / offer badge styling (not capsule rounded-full)
                      const badgeStyle = isHot
                        ? "bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white border-red-300 shadow-red-600/40"
                        : "bg-gradient-to-r from-emerald-600 via-green-600 to-emerald-700 text-white border-emerald-300 shadow-emerald-600/40";

                      return (
                        <div
                          key={bIdx}
                          className={`inline-flex items-center gap-1 text-[9px] sm:text-[10px] px-2.5 py-0.5 uppercase font-black tracking-wider shadow-md transform -skew-x-6 border rounded-sm ${badgeStyle}`}
                        >
                          <Tag className="w-2.5 h-2.5 shrink-0" />
                          <span>{badge.label}</span>
                        </div>
                      );
                    })}
                  </div>
                  {areaDisplay && (
                    <span className="inline-flex items-center text-[10px] sm:text-[11px] font-bold text-slate-950 bg-white/40 px-2 sm:px-2.5 py-0.5 rounded-md border border-white/60 whitespace-nowrap">
                      <Maximize2 className="w-3 h-3 mr-1 text-slate-950" />
                      {areaDisplay}
                    </span>
                  )}
                </div>

                {/* Middle: Title & Location */}
                <div className="flex flex-col items-start text-left w-full my-1">
                  <span className="text-xs sm:text-base font-extrabold text-slate-950 group-hover:text-black transition-colors font-display line-clamp-1 w-full">
                    {item.title}
                  </span>
                  {locationDisplay && (
                    <span className="text-[11px] sm:text-xs text-slate-950/90 font-medium flex items-center line-clamp-1 w-full mt-0.5">
                      <MapPin className="w-3 h-3 mr-1 shrink-0 text-slate-950" />
                      {locationDisplay}
                    </span>
                  )}
                </div>

                {/* Bottom Row: Price */}
                <div className="flex items-center justify-between w-full pt-1.5 sm:pt-2 border-t border-slate-950/20">
                  <span className="text-[10px] sm:text-[11px] font-semibold text-slate-900/90">
                    Investment Price
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-[11px] sm:text-xs font-bold text-slate-900">
                      {item.currency || "Rs."}
                    </span>
                    <span className="text-sm sm:text-lg font-extrabold text-slate-950 font-display">
                      {item.price?.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ))}

      {/* Tighter gradient mask on edges for minimal side fade */}
      <div 
        className="pointer-events-none absolute inset-0 z-10 h-full w-full"
        style={{
          background: "linear-gradient(90deg, #0B0F19 0%, transparent 6%, transparent 94%, #0B0F19 100%)"
        }}
      />
    </div>
  );
}
