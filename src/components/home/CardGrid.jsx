import React from "react";
import { Button } from "@/components/ui/button";
import { MoveRight } from "lucide-react";
import PropertyCard from "../global/PropertyCard";

export default function CardGrid({
  items = [],
  heading = "Featured Listings",
  subheading = null,
  showViewAll = true,
  viewAllText = "View all",
  viewAllHref = "#",
  onViewAll = null,
  CardComponent = PropertyCard,
  maxItems = 6,
}) {
  const visibleItems = items.slice(0, maxItems);

  if (!visibleItems.length) return null;

  return (
    <div className="w-full">
      <div className="max-w-[1440px] mx-auto px-4 md:px-10">
        <div className="flex flex-col items-center justify-center mb-6 text-center">
          {heading && (
            <h3 className="text-2xl font-semibold sm:font-bold">{heading}</h3>
          )}
          {subheading && (
            <div className="mt-1 text-sm text-muted-foreground">
              {subheading}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          {visibleItems.map((item, idx) => (
            <div key={item.id ?? idx} className="p-1">
              <CardComponent {...item} />
            </div>
          ))}
        </div>

        <div className="flex items-center justify-center mt-6">
          {showViewAll && (
            <Button
              variant="ghost"
              className={"shadow-md"}
              onClick={(e) =>
                onViewAll ? onViewAll(e) : (window.location.href = viewAllHref)
              }
            >
              <span className="text-md">{viewAllText}</span>
              <MoveRight strokeWidth={1.5} />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
