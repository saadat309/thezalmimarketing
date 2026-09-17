import React, { useState, useRef } from "react";
import { Building2, TrendingUp, ShieldCheck, Briefcase, FileText, Crown, ArrowUpRight } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import content from "@/content/components/services.json";

const iconMap = {
  Building2: Building2,
  TrendingUp: TrendingUp,
  ShieldCheck: ShieldCheck,
  Briefcase: Briefcase,
  FileText: FileText,
  Crown: Crown,
};

export default function ServicesOverviewSection() {
  const navigate = useNavigate();
  const services = content.services;

  return (
    <section className="relative w-full py-12 sm:py-24 overflow-hidden">
      <div className="relative z-10 w-full">
        {/* Header */}
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-12 sm:mb-16 px-4">
          <div className="inline-block mb-4">
            <Badge variant="outline" className="px-4 py-1.5 text-xs font-semibold tracking-wider text-[#F5A623] dark:text-[#D4AF37] border-[#F5A623]/30 dark:border-[#D4AF37]/30 bg-[#F5A623]/10 dark:bg-[#D4AF37]/10 rounded-full uppercase shadow-sm">
              {content.badge}
            </Badge>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold font-display text-foreground tracking-tight">
            <span>{content.headingPre}</span>
            <span className="gold-text-gradient">{content.headingHighlight}</span>
          </h2>
          <p className="mt-4 text-base sm:text-lg text-muted-foreground font-sans leading-relaxed font-light px-2 sm:px-0">
            {content.subheading}
          </p>
        </div>

        {/* Full-width Marquee Container with Two Opposite Slides */}
        <div className="w-full flex flex-col gap-5 sm:gap-8 group/marquee">
          {/* Row 1: Scrolling Left */}
          <div className="relative flex w-full overflow-hidden [--duration:38s] [--gap:16px] sm:[--gap:24px] [gap:var(--gap)]">
            {Array.from({ length: 4 }).map((_, rIdx) => (
              <div
                key={`row1-${rIdx}`}
                className="flex shrink-0 [gap:var(--gap)] marquee-pause-on-hover marquee-horizontal flex-row items-center"
              >
                {services.map((service, idx) => (
                  <ServiceCard key={`r1-${service.title}-${rIdx}-${idx}`} service={service} navigate={navigate} />
                ))}
              </div>
            ))}
            <div className="pointer-events-none absolute inset-0 z-10 h-full w-full bg-[linear-gradient(90deg,var(--background)_0%,transparent_5%,transparent_95%,var(--background)_100%)]" />
          </div>

          {/* Row 2: Scrolling Right (Opposite Direction) */}
          <div className="relative flex w-full overflow-hidden [--duration:42s] [--gap:16px] sm:[--gap:24px] [gap:var(--gap)]">
            {Array.from({ length: 4 }).map((_, rIdx) => (
              <div
                key={`row2-${rIdx}`}
                className="flex shrink-0 [gap:var(--gap)] marquee-pause-on-hover marquee-horizontal-reverse flex-row items-center"
              >
                {[...services].reverse().map((service, idx) => (
                  <ServiceCard key={`r2-${service.title}-${rIdx}-${idx}`} service={service} navigate={navigate} />
                ))}
              </div>
            ))}
            <div className="pointer-events-none absolute inset-0 z-10 h-full w-full bg-[linear-gradient(90deg,var(--background)_0%,transparent_5%,transparent_95%,var(--background)_100%)]" />
          </div>
        </div>
      </div>
    </section>
  );
}

function ServiceCard({ service, navigate }) {
  const Icon = iconMap[service.icon] || Building2;
  const cardRef = useRef(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => navigate({ to: "/contact" })}
      className="group relative w-[280px] sm:w-[380px] md:w-[420px] bg-card border border-border/80 rounded-3xl overflow-hidden shadow-xl transition-all duration-500 hover:border-[#F5A623]/60 dark:hover:border-[#D4AF37]/60 hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(245,166,35,0.25)] flex flex-col justify-between cursor-pointer select-none active:scale-[0.98]"
    >
      {/* Cursor Tracker / Hover CTA Overlay (Desktop only) */}
      {isHovered && (
        <div
          className="absolute pointer-events-none z-30 transition-transform duration-100 ease-out -translate-x-1/2 -translate-y-1/2 hidden sm:block"
          style={{ left: `${mousePos.x}px`, top: `${mousePos.y}px` }}
        >
          <div className="px-4 py-2 bg-gradient-to-r from-[#F5A623] to-[#D4AF37] text-slate-950 font-bold text-xs uppercase tracking-wider rounded-full shadow-2xl flex items-center gap-1.5 whitespace-nowrap border border-white/40 animate-scale-in">
            <span>Inquire Now</span>
            <ArrowUpRight size={14} strokeWidth={2.5} />
          </div>
        </div>
      )}

      {/* Card thumbnail image */}
      <div className="relative h-40 sm:h-48 overflow-hidden">
        <img src={service.image} alt={service.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent opacity-70" />
        <div className="absolute top-4 right-4 z-10">
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-950/80 text-[#D4AF37] border border-[#D4AF37]/30 backdrop-blur-md">
            {service.tag}
          </span>
        </div>
        <div className="absolute bottom-4 left-4 z-10">
          <div className="w-12 h-12 rounded-2xl bg-[#F5A623]/20 dark:bg-[#D4AF37]/20 border border-[#F5A623]/40 dark:border-[#D4AF37]/40 flex items-center justify-center text-[#F5A623] dark:text-[#D4AF37] backdrop-blur-md shadow-inner">
            <Icon size={24} strokeWidth={2} />
          </div>
        </div>
      </div>

      <div className="p-5 sm:p-8 flex flex-col justify-between flex-grow space-y-3 sm:space-y-4 text-left">
        <div>
          <h3 className="text-lg sm:text-xl font-bold font-display text-foreground group-hover:text-[#F5A623] dark:group-hover:text-[#D4AF37] transition-colors mb-2 text-left">
            {service.title}
          </h3>

          <p className="text-muted-foreground font-sans text-xs sm:text-sm leading-relaxed font-light text-left line-clamp-3">
            {service.description}
          </p>
        </div>
      </div>
    </div>
  );
}
