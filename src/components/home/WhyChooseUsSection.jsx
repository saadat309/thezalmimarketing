import React from "react";
import { Award, ShieldCheck, CheckCircle2, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import content from "@/content/components/why-us.json";

export default function WhyChooseUsSection() {
  const data = content.whyChooseUsSection;
  const highlights = data.highlights;

  return (
    <div className="w-full max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 py-6 sm:py-12 relative">
      <div className="relative rounded-3xl border border-[#D4AF37]/40 shadow-2xl overflow-hidden bg-[#111827]">
        {/* Background Stock Image with Cinematic Overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-40 transform scale-105 transition-transform duration-1000" 
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1600&q=80')" }} 
        />
        <div className="absolute inset-0 bg-[#111827]/90" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#D4AF37]/15 rounded-full blur-[140px] pointer-events-none" />

        <div className="relative z-10 p-4 sm:p-10 lg:p-16 text-white grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center text-left">
          <div className="lg:col-span-7 space-y-6 text-left">
            <Badge variant="outline" className="px-4 py-1.5 text-xs font-semibold tracking-wider text-[#D4AF37] border-[#D4AF37]/40 bg-[#D4AF37]/10 rounded-full uppercase shadow-md backdrop-blur-md">
              {data.badge}
            </Badge>
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold font-display tracking-tight text-white leading-tight text-left">
              {data.headingPre}<span className="gold-text-gradient">{data.headingHighlight}</span>
            </h2>
            <p className="text-sm sm:text-base lg:text-lg text-slate-300 font-sans leading-relaxed font-light text-left">
              At <strong>The Zalmi Marketing</strong>, we transcend conventional brokerage to become your trusted wealth-building partner. Rooted in absolute <strong>transparency</strong>, rigorous market intelligence, and uncompromising client dedication, we curate extraordinary real estate journeys.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-left">
              {highlights.map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 bg-white/5 border border-[#D4AF37]/25 p-4 rounded-2xl backdrop-blur-md text-left shadow-lg">
                  <CheckCircle2 className="w-5 h-5 text-[#D4AF37] shrink-0" />
                  <span className="text-sm font-medium text-slate-200 text-left">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-5 flex flex-col items-center justify-center bg-white/5 border border-[#D4AF37]/35 rounded-3xl p-5 sm:p-8 backdrop-blur-xl text-center space-y-5 shadow-2xl w-full max-w-full overflow-hidden">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#D4AF37]/20 border border-[#D4AF37]/45 flex items-center justify-center text-[#D4AF37] shadow-inner shrink-0">
              <Award size={32} />
            </div>
            <div className="space-y-2 text-center w-full px-2">
              <h3 className="text-xl sm:text-2xl font-bold font-display text-white break-words">{data.ctaTitle}</h3>
              <p className="text-xs sm:text-sm text-slate-300 font-light leading-relaxed break-words">
                {data.ctaDesc}
              </p>
            </div>
            <Button asChild size="lg" className="amber-gradient-vibrant hover:opacity-90 text-slate-950 font-extrabold px-6 sm:px-8 py-5 sm:py-6 rounded-2xl shadow-xl w-full text-sm sm:text-base transition-all duration-300">
              <Link to="/contact" className="flex items-center justify-center gap-2">
                {data.ctaButton} <ArrowRight size={18} />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
