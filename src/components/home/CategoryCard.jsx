import { Card } from "@/components/ui/card";
import SmartImage from "../global/SmartImage";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button"; // Added Button import
import { Map } from "lucide-react"; // Import Map icon
import { Link } from "@tanstack/react-router";

export default function CategoryCard({
  id,
  title = "Category",
  count = 0,
  src,
  thumb = null,
  ratio = 3 / 4,
  className = "",
  onClick = undefined,
  titleClassName = "",
  disableLink = false,
}) {
  // basic runtime validation
  if (!src) {
    console.warn("CategoryCard: `src` prop is required.");
  }

  const cardContent = (
    <Card
      onClick={onClick}
      className={`overflow-hidden rounded-2xl shadow-md p-0 cursor-pointer group ${className}`}
    >
      <div
        className="relative w-full"
        style={{ paddingBottom: `${100 / (ratio || 1)}%` }}
      >
        <SmartImage
          src={src || "/lahore-city-pic.webp"}
          thumb={thumb || "/lahore-city-pic.webp"}
          alt={title}
          className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
          style={{ position: "absolute", inset: 0 }}
          priority={false}
        />

        <div
          className="absolute top-0 left-0 right-0 h-48 pointer-events-none"
          style={{
            background: "linear-gradient(180deg, rgba(0,0,0,0.6), transparent)",
          }}
        />

        <div className="absolute left-8 top-6 ">
          <div className={"flex flex-col items-start"}>
            <div
              className={`text-3xl min-[425px]:text-2xl font-semibold leading-tight text-white ${titleClassName}`}
              style={{ textShadow: "0 1px 0 rgba(255,255,255,0.6)" }}
            >
              {title}
            </div>
            <Badge
              variant={"featured"}
              className="mt-2 text-sm min-[425px]:text-xs"
            >
              {count} {count === 1 ? "Property" : "Properties"}
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
    >
      {cardContent}
    </Link>
  );
}
