import React from "react";
import { Link } from "@tanstack/react-router";
import CategoryCard from "./CategoryCard";
import { Badge } from "@/components/ui/badge";

export default function CategoriesSection({
  items = [],
  heading = "Explore Categories",
  subheading = "Browse our exclusive collection of properties by category",
  className = "",
}) {
  if (!items || items.length === 0) return null;

  // Take max 5 items for the bento grid
  const bentoItems = items.slice(0, 5);

  return (
    <div className={`w-full py-16 sm:py-24 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
        {/* Section Header */}
        {(heading || subheading) && (
          <div className="flex flex-col items-center text-center mb-12 px-2">
            <div className="inline-block mb-4">
              <Badge variant="outline" className="px-4 py-1.5 text-xs font-semibold tracking-wider text-[#F5A623] dark:text-[#D4AF37] border-[#F5A623]/30 dark:border-[#D4AF37]/30 bg-[#F5A623]/10 dark:bg-[#D4AF37]/10 rounded-full uppercase shadow-sm">
                Curated Collections
              </Badge>
            </div>
            {heading && (
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold font-display text-foreground tracking-tight">
                <span className="gold-text-gradient">{heading}</span>
              </h2>
            )}
            {subheading && (
              <p className="mt-4 text-base sm:text-lg text-muted-foreground font-sans max-w-2xl leading-relaxed font-light">
                {subheading}
              </p>
            )}
          </div>
        )}

        {/* Responsive Bento Grid Layout (Max 5 items) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
          {bentoItems.map((item, index) => {
            let spanClass = "col-span-1 min-h-[260px] sm:min-h-[280px]";
            if (index === 0) {
              spanClass = "col-span-1 sm:col-span-2 lg:col-span-2 min-h-[320px] sm:min-h-[360px] lg:min-h-[420px]";
            } else if (index === 3 || index === 4) {
              spanClass = "col-span-1 sm:col-span-1 lg:col-span-1 min-h-[260px] sm:min-h-[280px]";
            } else {
              spanClass = "col-span-1 sm:col-span-1 lg:col-span-1 min-h-[260px] sm:min-h-[280px]";
            }

            return (
              <div key={item.id || index} className={`relative group ${spanClass} flex flex-col`}>
                <Link
                  to="/properties"
                  search={{
                    category: item.title,
                    categoryName: item.title,
                    image: item.src,
                  }}
                  className="block h-full w-full flex-1"
                >
                  <CategoryCard
                    {...item}
                    disableLink={true}
                    className="h-full w-full flex flex-col shadow-2xl transition-all duration-500 hover:shadow-[0_20px_50px_rgba(245,166,35,0.25)] hover:border-[#F5A623]/50 dark:hover:border-[#D4AF37]/50"
                    titleClassName={index === 0 ? "text-2xl sm:text-3xl md:text-4xl font-extrabold" : "text-xl sm:text-2xl font-bold"}
                  />
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
