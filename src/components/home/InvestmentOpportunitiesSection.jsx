import React from "react";
import { TrendingUp, ShieldCheck, Building2, FileCheck, Briefcase, Sparkles, ArrowUpRight, PhoneCall } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import content from "@/content/components/investment.json";

export default function InvestmentOpportunitiesSection() {
  const whatsappNumber = "+923218446496";
  const whatsappUrl = `https://wa.me/${whatsappNumber.replace(/\D/g, '')}`;

  return (
    <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
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

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left">
        
        {/* Card 1: High-Growth Corridors (Span 2) */}
        <div className="lg:col-span-2 group relative bg-slate-950 dark:bg-slate-950 border border-[#D4AF37]/30 rounded-3xl p-6 sm:p-10 shadow-2xl overflow-hidden flex flex-col justify-between">
          <div className="absolute inset-0 bg-cover bg-center opacity-55 group-hover:scale-105 transition-transform duration-700 pointer-events-none" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=1000')` }} />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/50 to-slate-950/20 pointer-events-none" />
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#D4AF37]/10 rounded-full blur-[100px] pointer-events-none" />
          
          <div className="relative z-10 space-y-4 text-left">
            <div className="flex items-center justify-between">
              <div className="w-14 h-14 rounded-2xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] shadow-inner group-hover:scale-110 transition-transform">
                <TrendingUp size={28} />
              </div>
              <Badge className="bg-[#D4AF37] text-slate-950 font-bold px-3 py-1">High Growth</Badge>
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold font-display text-white text-left">
              {content.opportunities[0].title}
            </h3>
            <p className="text-slate-300 font-sans text-sm sm:text-base leading-relaxed font-light max-w-xl text-left">
              {content.opportunities[0].description}
            </p>
          </div>
          
          <div className="relative z-10 pt-8 mt-8 border-t border-white/10 flex items-center justify-between text-xs sm:text-sm font-semibold text-[#D4AF37]">
            <span>Verified High Return Potential</span>
            <Link to={content.opportunities[0].to} className="hover:underline flex items-center gap-1.5">
              {content.opportunities[0].linkText} <ArrowUpRight size={14} />
            </Link>
          </div>
        </div>

        {/* Card 2: Prime DHA Portfolios (Span 1) */}
        <div className="lg:col-span-1 group relative bg-card border border-border/80 rounded-3xl p-6 sm:p-8 shadow-xl overflow-hidden flex flex-col justify-between hover:border-[#F5A623]/60 dark:hover:border-[#D4AF37]/60 transition-all duration-300">
          <div className="relative z-10 space-y-4 text-left">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-[#F5A623]/10 dark:bg-[#D4AF37]/10 border border-[#F5A623]/20 dark:border-[#D4AF37]/20 flex items-center justify-center text-[#F5A623] dark:text-[#D4AF37]">
                <ShieldCheck size={24} />
              </div>
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-secondary text-secondary-foreground border border-border">Elite Assets</span>
            </div>
            <h3 className="text-xl font-bold font-display text-foreground group-hover:text-[#F5A623] dark:group-hover:text-[#D4AF37] transition-colors text-left">
              {content.opportunities[1].title}
            </h3>
            <p className="text-muted-foreground font-sans text-sm leading-relaxed font-light text-left">
              {content.opportunities[1].description}
            </p>
          </div>
          
          <div className="relative z-10 pt-6 mt-6 border-t border-border">
            <Link to={content.opportunities[1].to} className="text-xs sm:text-sm font-semibold text-[#F5A623] dark:text-[#D4AF37] flex items-center gap-1 hover:underline">
              {content.opportunities[1].linkText} <ArrowUpRight size={14} />
            </Link>
          </div>
        </div>

        {/* Card 3: Commercial Flagships (Span 1) */}
        <div className="lg:col-span-1 group relative bg-card border border-border/80 rounded-3xl p-6 sm:p-8 shadow-xl overflow-hidden flex flex-col justify-between hover:border-[#F5A623]/60 dark:hover:border-[#D4AF37]/60 transition-all duration-300">
          <div className="relative z-10 space-y-4 text-left">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-[#F5A623]/10 dark:bg-[#D4AF37]/10 border border-[#F5A623]/20 dark:border-[#D4AF37]/20 flex items-center justify-center text-[#F5A623] dark:text-[#D4AF37]">
                <Building2 size={24} />
              </div>
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-secondary text-secondary-foreground border border-border">Commercial</span>
            </div>
            <h3 className="text-xl font-bold font-display text-foreground group-hover:text-[#F5A623] dark:group-hover:text-[#D4AF37] transition-colors text-left">
              {content.opportunities[2].title}
            </h3>
            <p className="text-muted-foreground font-sans text-sm leading-relaxed font-light text-left">
              {content.opportunities[2].description}
            </p>
          </div>
          
          <div className="relative z-10 pt-6 mt-6 border-t border-border">
            <Link to={content.opportunities[2].to} className="text-xs sm:text-sm font-semibold text-[#F5A623] dark:text-[#D4AF37] flex items-center gap-1 hover:underline">
              {content.opportunities[2].linkText} <ArrowUpRight size={14} />
            </Link>
          </div>
        </div>

        {/* Card 4: Verified Plot Files (Span 2) */}
        <div className="lg:col-span-2 group relative bg-slate-950 dark:bg-slate-950 border border-[#D4AF37]/30 rounded-3xl p-6 sm:p-10 shadow-2xl overflow-hidden flex flex-col justify-between">
          <div className="absolute inset-0 bg-cover bg-center opacity-55 group-hover:scale-105 transition-transform duration-700 pointer-events-none" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&q=80&w=1000')` }} />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/50 to-slate-950/20 pointer-events-none" />
          
          <div className="relative z-10 space-y-4 text-left">
            <div className="flex items-center justify-between">
              <div className="w-14 h-14 rounded-2xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] shadow-inner group-hover:scale-110 transition-transform">
                <FileCheck size={28} />
              </div>
              <Badge className="bg-[#D4AF37] text-slate-950 font-bold px-3 py-1">100% Verified</Badge>
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold font-display text-white text-left">
              {content.opportunities[3].title}
            </h3>
            <p className="text-slate-300 font-sans text-sm sm:text-base leading-relaxed font-light max-w-xl text-left">
              {content.opportunities[3].description}
            </p>
          </div>
          
          <div className="relative z-10 pt-8 mt-8 border-t border-white/10 flex items-center justify-between text-xs sm:text-sm font-semibold text-[#D4AF37]">
            <span>Zero Risk Title Guarantee</span>
            <Link to={content.opportunities[3].to} className="hover:underline flex items-center gap-1.5">
              {content.opportunities[3].linkText} <ArrowUpRight size={14} />
            </Link>
          </div>
        </div>

        {/* Card 5: Bespoke Advisory (Span 1) */}
        <div className="lg:col-span-1 group relative bg-card border border-border/80 rounded-3xl p-6 sm:p-8 shadow-xl overflow-hidden flex flex-col justify-between hover:border-[#F5A623]/60 dark:hover:border-[#D4AF37]/60 transition-all duration-300">
          <div className="relative z-10 space-y-4 text-left">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-[#F5A623]/10 dark:bg-[#D4AF37]/10 border border-[#F5A623]/20 dark:border-[#D4AF37]/20 flex items-center justify-center text-[#F5A623] dark:text-[#D4AF37]">
                <Briefcase size={24} />
              </div>
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-secondary text-secondary-foreground border border-border">Expert Guidance</span>
            </div>
            <h3 className="text-xl font-bold font-display text-foreground group-hover:text-[#F5A623] dark:group-hover:text-[#D4AF37] transition-colors text-left">
              {content.opportunities[4].title}
            </h3>
            <p className="text-muted-foreground font-sans text-sm leading-relaxed font-light text-left">
              {content.opportunities[4].description}
            </p>
          </div>
          
          <div className="relative z-10 pt-6 mt-6 border-t border-border">
            <Link to={content.opportunities[4].to} className="text-xs sm:text-sm font-semibold text-[#F5A623] dark:text-[#D4AF37] flex items-center gap-1 hover:underline">
              {content.opportunities[4].linkText} <ArrowUpRight size={14} />
            </Link>
          </div>
        </div>

        {/* Card 6: Diversified Assets (Span 1) */}
        <div className="lg:col-span-1 group relative bg-card border border-border/80 rounded-3xl p-6 sm:p-8 shadow-xl overflow-hidden flex flex-col justify-between hover:border-[#F5A623]/60 dark:hover:border-[#D4AF37]/60 transition-all duration-300">
          <div className="relative z-10 space-y-4 text-left">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-[#F5A623]/10 dark:bg-[#D4AF37]/10 border border-[#F5A623]/20 dark:border-[#D4AF37]/20 flex items-center justify-center text-[#F5A623] dark:text-[#D4AF37]">
                <Sparkles size={24} />
              </div>
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-secondary text-secondary-foreground border border-border">Balance</span>
            </div>
            <h3 className="text-xl font-bold font-display text-foreground group-hover:text-[#F5A623] dark:group-hover:text-[#D4AF37] transition-colors text-left">
              {content.opportunities[5].title}
            </h3>
            <p className="text-muted-foreground font-sans text-sm leading-relaxed font-light text-left">
              {content.opportunities[5].description}
            </p>
          </div>
          
          <div className="relative z-10 pt-6 mt-6 border-t border-border">
            <Link to={content.opportunities[5].to} className="text-xs sm:text-sm font-semibold text-[#F5A623] dark:text-[#D4AF37] flex items-center gap-1 hover:underline">
              {content.opportunities[5].linkText} <ArrowUpRight size={14} />
            </Link>
          </div>
        </div>

        {/* Card 7: Instant WhatsApp Consultation CTA (Span 1) */}
        <div className="lg:col-span-1 group relative bg-gradient-to-br from-[#F5A623] to-[#D4AF37] text-slate-950 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden flex flex-col justify-between">
          <div className="relative z-10 space-y-4 text-left">
            <div className="w-12 h-12 rounded-2xl bg-slate-950/10 border border-slate-950/20 flex items-center justify-center text-slate-950">
              <PhoneCall size={24} />
            </div>
            <h3 className="text-xl font-bold font-display text-slate-950 text-left">
              {content.opportunities[6].title}
            </h3>
            <p className="text-slate-900 font-sans text-sm leading-relaxed font-medium text-left">
              {content.opportunities[6].description}
            </p>
          </div>
          
          <div className="relative z-10 pt-6 mt-6 border-t border-slate-950/20">
            <Button asChild className="w-full bg-slate-950 hover:bg-slate-900 text-white font-bold rounded-xl py-3 shadow-lg transition-all text-sm sm:text-base">
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                {content.opportunities[6].buttonText}
              </a>
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
}
