import { Card } from "@/components/ui/card";
import SmartImage from "../global/SmartImage";
import { Badge } from "@/components/ui/badge";
import { Link } from "@tanstack/react-router";

export default function CategoryCard({
  id,
  title = "Category",
  count = 0,
  src,
  thumb = null,
  className = "",
  onClick = undefined,
  titleClassName = "",
  disableLink = false,
}) {
  if (!src) {
    console.warn("CategoryCard: `src` prop is required.");
  }

  const cardContent = (
    <Card
      onClick={onClick}
      className={`overflow-hidden rounded-3xl shadow-2xl p-0 cursor-pointer group bg-card border border-border hover:border-[#F5A623]/60 dark:hover:border-[#D4AF37]/60 transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_20px_50px_rgba(245,166,35,0.15)] dark:hover:shadow-[0_20px_50px_rgba(212,175,55,0.15)] flex flex-col h-full w-full ${className}`}
    >
      <div className="relative w-full h-full flex-1 overflow-hidden min-h-[220px]">
        <SmartImage
          src={src || "/lahore-city-pic.webp"}
          thumb={thumb || "/lahore-city-pic.webp"}
          alt={title}
          className="absolute inset-0 object-cover w-full h-full transition-transform duration-700 ease-out group-hover:scale-105"
          priority={false}
        />

        {/* Cinematic Gradient Overlays */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "linear-gradient(180deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.1) 40%, rgba(0,0,0,0.85) 100%)",
          }}
        />

        <div className="absolute left-6 top-6 right-6 flex items-start justify-between z-10">
          <span className="text-xs font-semibold backdrop-blur-md bg-slate-950/80 border border-[#F5A623]/30 dark:border-[#D4AF37]/30 text-[#F5A623] dark:text-[#D4AF37] shadow-lg rounded-full px-3.5 py-1">
            Category
          </span>
        </div>

        <div className="absolute left-6 bottom-6 right-6 z-10">
          <div className="flex flex-col items-start gap-2.5">
            <div
              className={`text-2xl sm:text-3xl font-extrabold leading-tight text-white font-display group-hover:text-[#F5A623] dark:group-hover:text-[#D4AF37] transition-colors ${titleClassName}`}
              style={{ textShadow: "0 2px 4px rgba(0,0,0,0.8)" }}
            >
              {title}
            </div>
            <Badge
              variant="featured"
              className="text-xs backdrop-blur-md bg-slate-950/80 border border-[#F5A623]/30 dark:border-[#D4AF37]/30 text-white px-3.5 py-1 rounded-full shadow-lg font-medium"
            >
              {count} {count === 1 ? "Property" : "Properties"} Available
            </Badge>
          </div>
        </div>
      </div>
    </Card>
  );

  if (disableLink) {
    return cardContent;
  }

  return (
    <Link 
      to="/properties" 
      search={{ 
        category: title, 
        categoryName: title, 
        image: src 
      }}
      className="flex flex-col h-full w-full"
    >
      {cardContent}
    </Link>
  );
}
