import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Bed,
  Bath,
  MapPin,
  Maximize2,
  ImageOff,
  Map,
  Building,
} from "lucide-react";
import SmartImage from "@/components/global/SmartImage";

const PropertyCard = (props) => {
  const {
    image,
    title,
    price,
    priceType,
    originalPrice,
    currency,
    installmentPeriod,
    installmentDuration,
    location,
    city,
    locationMap,
    beds,
    baths,
    area,
    areaUnit,
    propertyType,
    badges,
    onClick,
  } = props;

  const finalPriceType = priceType || "sale";
  const finalCurrency = currency || "Rs";
  const finalAreaUnit = areaUnit || "sqft";
  const finalBadges = propertyType
    ? [{ label: propertyType, variant: "default" }, ...(badges || [])]
    : badges || [];
  const finalInstallmentPeriod = installmentPeriod || "month";

  const [isMapOpen, setIsMapOpen] = useState(false);

  const handleMapClick = (e) => {
    e.stopPropagation();
    setIsMapOpen(true);
  };

  const pluralize = (count, singular) => {
    return count === 1 ? singular : singular + "s";
  };

  const renderPrice = () => {
    if (!price) return null;

    const formattedPrice = finalCurrency + " " + price.toLocaleString();

    if (finalPriceType === "rent") {
      return (
        <div className="space-y-0.5">
          <div className="text-base font-bold text-amber-600">
            {formattedPrice}
            <span className="text-xs font-normal text-primary">/month</span>
          </div>
        </div>
      );
    }

    if (finalPriceType === "installment") {
      const periodText = finalInstallmentPeriod
        ? `/${finalInstallmentPeriod}`
        : "/month";

      return (
        <div className="flex flex-row items-center gap-2 space-y-0.5 justify-between">
          <div className="text-base font-bold text-amber-600">
            {formattedPrice}
            <span className="text-xs font-normal text-primary">
              {periodText}
            </span>
          </div>
          {installmentDuration && (
            <div className="text-xs text-primary">
              Time Period: {installmentDuration}
            </div>
          )}
        </div>
      );
    }

    if (finalPriceType === "discounted" && originalPrice) {
      return (
        <div className="flex flex-row items-center gap-2 space-y-0.5 justify-between">
          <div className="flex items-center gap-1">
            <div className="text-base font-bold text-amber-600">
              {formattedPrice}
            </div>
            <div className="text-xs line-through text-[var-(--dark-gray)]">
              {finalCurrency + " " + originalPrice.toLocaleString()}
            </div>
          </div>
          <div className="text-xs font-medium text-green-600">
            Save{" "}
            {finalCurrency + " " + (originalPrice - price).toLocaleString()}
          </div>
        </div>
      );
    }

    return (
      <div className="text-base font-bold text-amber-600">{formattedPrice}</div>
    );
  };

  return (
    <Card
      className="py-0 gap-0 overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-2xl active:scale-[0.98] group shadow-sm shadow-card-foreground/30 border-0 will-change-transform"
      onClick={onClick}
    >
      <div className="p-3 will-change-transform">
        <div className="relative overflow-hidden rounded-lg aspect-video bg-muted will-change-transform">
          <SmartImage
            src={image}
            alt={title || "Property"}
            thumb="/lahore-city-pic.webp"
            className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110 will-change-transform"
            errorPlaceholder={
              <div className="flex items-center justify-center w-full h-full bg-muted">
                <ImageOff className="w-12 h-12 text-muted-foreground/50" />
              </div>
            }
          />

          {finalBadges.length > 0 && (
            <div className="absolute flex flex-wrap gap-2 top-3 left-3 will-change-transform">
              {finalBadges.map((badge, index) => (
                <Badge
                  key={index}
                  variant={badge.variant || "default"}
                  className="text-xs font-semibold shadow-md will-change-transform"
                >
                  {badge.label}
                </Badge>
              ))}
            </div>
          )}

          {locationMap && (
            <div className="absolute bottom-3 right-3 will-change-transform">
              <Dialog open={isMapOpen} onOpenChange={setIsMapOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="default"
                    size="sm"
                    className="h-7 px-2.5 gap-1 flex-shrink-0 text-xs will-change-transform"
                    onClick={handleMapClick}
                  >
                    <Map
                      strokeWidth={1.5}
                      className="w-3 h-3 will-change-transform"
                    />
                    <span className="will-change-transform">View Map</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl">
                  <DialogHeader>
                    <DialogTitle>{title || "Location"}</DialogTitle>
                  </DialogHeader>
                  <div className="w-full h-[400px] sm:h-[500px] rounded-lg overflow-hidden">
                    <iframe
                      src={locationMap}
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      title="Property Location Map"
                    />
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          )}
        </div>
      </div>

      <CardContent className="px-3 pt-2 pb-3 space-y-2 text-left will-change-transform">
        {(title || price) && (
          <div className="space-y-1.5 text-left will-change-transform">
            {title && (
              <h3 className="text-base font-semibold text-left line-clamp-2 will-change-transform">
                {title}
              </h3>
            )}
            {price && (
              <div className="will-change-transform">{renderPrice()}</div>
            )}
          </div>
        )}

        {(location || city) && (
          <div className="flex items-center justify-between gap-2 text-left will-change-transform">
            {city && (
              <div className="flex items-center gap-1.5 text-xs font-medium text-primary will-change-transform">
                <Building
                  strokeWidth={1.5}
                  className="flex-shrink-0 w-3.5 h-3.5 will-change-transform"
                />
                <span className="text-left line-clamp-1 will-change-transform">
                  {city}
                </span>
              </div>
            )}
            <div className="flex flex-col gap-0.5 text-primary text-xs flex-1 min-w-0 text-left will-change-transform">
              {location && (
                <div className="flex items-center gap-1.5">
                  <MapPin
                    strokeWidth={1.5}
                    className="w-3.5 h-3.5 flex-shrink-0 will-change-transform"
                  />
                  <span className="text-left line-clamp-1 will-change-transform">
                    {location}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {(beds || baths || area || propertyType) && (
          <div className="space-y-1.5 will-change-transform">
            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 pt-1.5  text-left will-change-transform">
              {beds && beds > 0 && (
                <div className="flex items-center gap-1 text-xs text-left will-change-transform">
                  <Bed
                    strokeWidth={1.5}
                    className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0 will-change-transform"
                  />
                  <span className="font-medium will-change-transform">
                    {beds}
                  </span>
                  <span className="text-muted-foreground will-change-transform">
                    {pluralize(beds, "Bed")}
                  </span>
                </div>
              )}

              {baths && baths > 0 && (
                <div className="flex items-center gap-1 text-xs text-left will-change-transform">
                  <Bath
                    strokeWidth={1.5}
                    className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0 will-change-transform"
                  />
                  <span className="font-medium will-change-transform">
                    {baths}
                  </span>
                  <span className="text-muted-foreground will-change-transform">
                    {pluralize(baths, "Bath")}
                  </span>
                </div>
              )}

              {area && area > 0 && (
                <div className="flex items-center gap-1 text-xs text-left will-change-transform">
                  <Maximize2
                    strokeWidth={1.5}
                    className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0 will-change-transform"
                  />
                  <span className="font-medium will-change-transform">
                    {area}
                  </span>
                  <span className="text-muted-foreground will-change-transform">
                    {finalAreaUnit}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PropertyCard;
