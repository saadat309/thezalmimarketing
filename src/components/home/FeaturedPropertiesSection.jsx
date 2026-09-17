import React from "react";
import { Building2, ArrowRight, Sparkles } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import PropertyCard from "@/components/global/PropertyCard";

export default function FeaturedPropertiesSection({ heading, subheading, items }) {
  const displayedItems = (items || []).slice(0, 5);
  const row1Items = displayedItems.slice(0, 2);
  const row2Items = displayedItems.slice(2, 5);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 sm:mb-16 gap-6 text-left">
        <div className="space-y-4 max-w-2xl text-left">
          <Badge variant="outline" className="px-4 py-1.5 text-xs font-semibold tracking-wider text-[#F5A623] dark:text-[#D4AF37] border-[#F5A623]/30 dark:border-[#D4AF37]/30 bg-[#F5A623]/10 dark:bg-[#D4AF37]/10 rounded-full uppercase shadow-sm">
            Exclusive Estates
          </Badge>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold font-display text-foreground tracking-tight text-left">
            {heading || <span>Featured <span className="gold-text-gradient">Luxury Properties</span></span>}
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-muted-foreground font-sans leading-relaxed text-left font-light">
            {subheading || "Explore our handpicked selection of premier residential villas, luxury apartments, and elite estates."}
          </p>
        </div>
        <div className="shrink-0">
          <Button asChild className="amber-gradient-vibrant hover:opacity-90 text-slate-950 font-extrabold px-6 sm:px-8 py-5 sm:py-6 rounded-2xl shadow-xl transition-all duration-300 w-full md:w-auto text-sm sm:text-base">
            <Link to="/properties" className="flex items-center justify-center gap-2">
              View All Properties <ArrowRight size={18} />
            </Link>
          </Button>
        </div>
      </div>

      {/* Showcase Grid: Row 1 (2 cards) and Row 2 (3 cards) */}
      <div className="space-y-6 sm:space-y-8">
        {row1Items.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 text-left">
            {row1Items.map((property, idx) => (
              <div key={property.id || idx} className="flex flex-col h-full">
                <Link to={`/properties/${property.slug}`} className="block h-full w-full flex-1">
                  <PropertyCard {...property} className="h-full w-full flex flex-col" />
                </Link>
              </div>
            ))}
          </div>
        )}

        {row2Items.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 text-left">
            {row2Items.map((property, idx) => (
              <div key={property.id || idx} className="flex flex-col h-full">
                <Link to={`/properties/${property.slug}`} className="block h-full w-full flex-1">
                  <PropertyCard {...property} className="h-full w-full flex flex-col" />
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom CTA for View More */}
      <div className="mt-12 sm:mt-16 text-center">
        <Button asChild variant="outline" className="border-[#F5A623]/40 dark:border-[#D4AF37]/40 bg-card hover:bg-card/80 text-foreground px-8 py-6 rounded-2xl shadow-lg transition-all text-sm sm:text-base w-full sm:w-auto">
          <Link to="/properties" className="flex items-center justify-center gap-2">
            Browse All Available Listings <ArrowRight size={16} className="text-[#F5A623] dark:text-[#D4AF37]" />
            </Link>
        </Button>
      </div>
    </div>
  );
}
