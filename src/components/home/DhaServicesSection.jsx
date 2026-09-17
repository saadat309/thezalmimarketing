import React from "react";
import { Building2, Compass, ShieldCheck, MapPin, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Link } from "@tanstack/react-router";
import content from "@/content/components/dha-services.json";

export default function DhaServicesSection() {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
      {/* Header */}
      <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-12 sm:mb-16 px-2">
        <div className="inline-block mb-4">
          <Badge variant="outline" className="px-4 py-1.5 text-xs font-semibold tracking-wider text-[#F5A623] dark:text-[#D4AF37] border-[#F5A623]/30 dark:border-[#D4AF37]/30 bg-[#F5A623]/10 dark:bg-[#D4AF37]/10 rounded-full uppercase shadow-sm">
            {content.badge}
          </Badge>
        </div>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold font-display text-foreground tracking-tight">
          <span>{content.headingPre}</span>
          <span className="gold-text-gradient">{content.headingHighlight}</span>
        </h2>
        <p className="mt-4 text-base sm:text-lg text-muted-foreground font-sans leading-relaxed font-light">
          {content.subheading}
        </p>
      </div>

      {/* Dual Feature Grid with Background Stock Imagery */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch text-left">
        
        {/* Card 1 */}
        <div className="relative overflow-hidden rounded-3xl border border-[#D4AF37]/30 shadow-2xl group flex flex-col justify-between min-h-[380px] sm:min-h-[420px]">
          <div 
            className="absolute inset-0 bg-cover bg-center transform group-hover:scale-105 transition-transform duration-1000 opacity-65" 
            style={{ backgroundImage: `url('${content.cards[0].image}')` }} 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/50 to-slate-950/20" />
          
          <div className="relative z-10 p-6 sm:p-10 space-y-4 sm:space-y-6 text-white text-left">
            <div className="w-14 h-14 rounded-2xl bg-[#D4AF37]/20 border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37] shadow-inner backdrop-blur-md">
              <Building2 size={28} />
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold font-display text-white text-left">
              {content.cards[0].title}
            </h3>
            <p className="text-slate-300 font-sans text-sm sm:text-base leading-relaxed font-light text-left">
              {content.cards[0].description}
            </p>
          </div>

          <div className="relative z-10 p-6 sm:p-10 pt-0 flex flex-wrap items-center justify-between gap-2 text-xs sm:text-sm font-semibold text-[#D4AF37]">
            <span className="flex items-center gap-2"><ShieldCheck size={16} /> {content.cards[0].badgeText}</span>
            <Link to={content.cards[0].to} className="hover:underline flex items-center gap-1">{content.cards[0].linkText} <ArrowRight size={14} /></Link>
          </div>
        </div>

        {/* Card 2 */}
        <div className="relative overflow-hidden rounded-3xl border border-[#D4AF37]/30 shadow-2xl group flex flex-col justify-between min-h-[380px] sm:min-h-[420px]">
          <div 
            className="absolute inset-0 bg-cover bg-center transform group-hover:scale-105 transition-transform duration-1000 opacity-65" 
            style={{ backgroundImage: `url('${content.cards[1].image}')` }} 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/50 to-slate-950/20" />
          
          <div className="relative z-10 p-6 sm:p-10 space-y-4 sm:space-y-6 text-white text-left">
            <div className="w-14 h-14 rounded-2xl bg-[#D4AF37]/20 border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37] shadow-inner backdrop-blur-md">
              <Compass size={28} />
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold font-display text-white text-left">
              {content.cards[1].title}
            </h3>
            <p className="text-slate-300 font-sans text-sm sm:text-base leading-relaxed font-light text-left">
              {content.cards[1].description}
            </p>
          </div>

          <div className="relative z-10 p-6 sm:p-10 pt-0 flex flex-wrap items-center justify-between gap-2 text-xs sm:text-sm font-semibold text-[#D4AF37]">
            <span className="flex items-center gap-2"><MapPin size={16} /> {content.cards[1].badgeText}</span>
            <Link to={content.cards[1].to} className="hover:underline flex items-center gap-1">{content.cards[1].linkText} <ArrowRight size={14} /></Link>
          </div>
        </div>

      </div>
    </div>
  );
}
