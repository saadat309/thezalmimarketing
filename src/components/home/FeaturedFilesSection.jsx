import React from "react";
import { FileText, ArrowRight, CheckCircle2 } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import PropertyCard from "@/components/global/PropertyCard";

export default function FeaturedFilesSection({ heading, subheading, items }) {
  const displayedItems = (items || []).slice(0, 3);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 sm:mb-16 gap-6 text-left">
        <div className="space-y-4 max-w-2xl text-left">
          <Badge variant="outline" className="px-4 py-1.5 text-xs font-semibold tracking-wider text-[#F5A623] dark:text-[#D4AF37] border-[#F5A623]/30 dark:border-[#D4AF37]/30 bg-[#F5A623]/10 dark:bg-[#D4AF37]/10 rounded-full uppercase shadow-sm">
            Verified Plot Files
          </Badge>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold font-display text-foreground tracking-tight text-left">
            {heading || <span>Verified <span className="gold-text-gradient">Plot File Portfolio</span></span>}
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-muted-foreground font-sans leading-relaxed text-left font-light">
            {subheading || "Secure 100% verified plot files with instant transfer and guaranteed title safety across DHA phases."}
          </p>
        </div>
        <div className="shrink-0">
          <Button asChild className="amber-gradient-vibrant hover:opacity-90 text-slate-950 font-extrabold px-6 sm:px-8 py-5 sm:py-6 rounded-2xl shadow-xl transition-all duration-300 w-full md:w-auto text-sm sm:text-base">
            <Link to="/files" className="flex items-center justify-center gap-2">
              View All Files <ArrowRight size={18} />
            </Link>
          </Button>
        </div>
      </div>

      {/* Exactly 3 Files Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 text-left">
        {displayedItems.map((file, idx) => (
          <div key={file.id || idx}>
            <PropertyCard {...file} />
          </div>
        ))}
      </div>

      {/* Bottom CTA */}
      <div className="mt-12 sm:mt-16 text-center">
        <Button asChild variant="outline" className="border-[#F5A623]/40 dark:border-[#D4AF37]/40 bg-card hover:bg-card/80 text-foreground px-8 py-6 rounded-2xl shadow-lg transition-all text-sm sm:text-base w-full sm:w-auto">
          <Link to="/files" className="flex items-center justify-center gap-2">
            Browse Full Plot File Inventory <ArrowRight size={16} className="text-[#F5A623] dark:text-[#D4AF37]" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
