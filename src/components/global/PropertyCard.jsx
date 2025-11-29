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
  FileText, // Added FileText icon
} from "lucide-react";
import { FaPhone, FaWhatsapp } from "react-icons/fa";
import SmartImage from "@/components/global/SmartImage";

const DEFAULT_PHONE_NUMBER = "+923001234567"; // Fallback phone number
const DEFAULT_WHATSAPP_NUMBER = "923001234567"; // Fallback WhatsApp number (without +)

function PropertyCard(props) {
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
    category,
    property_type,
    badges,
    onClick,
    phone: phoneProp, // Renamed to avoid conflict with local variable
    whatsapp: whatsappProp, // Renamed to avoid conflict with local variable
    // DB-shaped raw fields from schema
    purchase_type,
    is_discounted,
    price_original_amount,
    installment_advance_amount,
    installment_display_mode,
    is_file, // Destructure is_file
    file_type, // Destructure file_type
    phase, // Destructure phase
    societyName, // Destructure societyName
    is_furnished, // Destructure is_furnished
  } = props;


  // Normalize values between existing props and DB-schema fields
  const finalPriceType =
    priceType ||
    (purchase_type
      ? purchase_type === "rent"
        ? "rent"
        : purchase_type === "installment"
        ? "installment"
        : "sale"
      : "sale");

  const finalCurrency = currency || "Rs";
  const finalAreaUnit = areaUnit || "sqft";
  const finalBadges = category
    ? [{ label: category, variant: "default" }, ...(badges || [])]
    : [...(badges || [])]; // Removed default propertyType badge if it's a file
  


  if (property_type) {
    finalBadges.push({ label: property_type, variant: 'outline' });
  }

  const finalInstallmentPeriod = installmentPeriod || "month";

  // Resolve original price (component prop wins, else DB field)
  const resolvedOriginalPrice =
    typeof originalPrice !== "undefined" && originalPrice !== null
      ? originalPrice
      : typeof price_original_amount !== "undefined" && price_original_amount !== null
      ? price_original_amount
      : null;

  // Determine whether we should use installment_advance_amount in place of price
  const hasInstallmentAdvanceDisplay =
    finalPriceType === "installment" && installment_display_mode === "advance" && typeof installment_advance_amount !== "undefined" && installment_advance_amount !== null;

  const displayNumericPrice = hasInstallmentAdvanceDisplay
    ? installment_advance_amount
    : typeof price !== "undefined" && price !== null
    ? price
    : null;

  const isDiscounted = !!is_discounted || finalPriceType === "discounted";

  const formatAmount = (amt) => (amt === 0 ? "Free" : finalCurrency + " " + Number(amt).toLocaleString());

  const pluralize = (count, singular) => {
    return count === 1 ? singular : singular + "s";
  };

  const [isMapOpen, setIsMapOpen] = useState(false);

  const handleMapClick = (e) => {
    e.stopPropagation();
    setIsMapOpen(true);
  };

  const renderPrice = () => {
    // If no price available and not discounted (no original price), render nothing
    if (displayNumericPrice === null && !isDiscounted && resolvedOriginalPrice === null) return null;

    // RENT (per period)
    if (finalPriceType === "rent") {
      const label = displayNumericPrice === 0 ? "Free" : finalCurrency + " " + Number(displayNumericPrice).toLocaleString();
      return (
        <div className="space-y-0.5">
          <div className="text-base font-bold text-amber-600">
            {label}
            <span className="text-xs font-normal text-primary">/{finalInstallmentPeriod}</span>
          </div>
        </div>
      );
    }

    // INSTALLMENT with advance-display-mode: show advance plainly (no per-duration suffix)
    if (finalPriceType === "installment" && hasInstallmentAdvanceDisplay) {
      const advanceLabel = displayNumericPrice === 0 ? "Free" : finalCurrency + " " + Number(displayNumericPrice).toLocaleString();
      return (
        <div className="flex flex-row items-center gap-2 space-y-0.5 justify-between">
          <div className="text-base font-bold text-amber-600">{advanceLabel}</div>
          {installmentDuration && <div className="text-xs text-primary">Time Period: {installmentDuration}</div>}
        </div>
      );
    }

    // DISCOUNTED (schema boolean or priceType === 'discounted')
    if (isDiscounted && resolvedOriginalPrice !== null) {
      const mainLabel = displayNumericPrice === 0 ? "Free" : finalCurrency + " " + Number(displayNumericPrice || 0).toLocaleString();
      const originalLabel = finalCurrency + " " + Number(resolvedOriginalPrice).toLocaleString();
      const saveAmt = Math.max(0, Number(resolvedOriginalPrice) - Number(displayNumericPrice || 0));
      const saveLabel = finalCurrency + " " + Number(saveAmt).toLocaleString();
      return (
        <div className="flex flex-row items-center gap-2 space-y-0.5 justify-between">
          <div className="flex items-center gap-1">
            <div className="text-base font-bold text-amber-600">{mainLabel}</div>
            <div className="text-xs line-through text-[var-(--dark-gray)]">{originalLabel}</div>
          </div>
          <div className="text-xs font-medium text-green-600">Save {saveLabel}</div>
        </div>
      );
    }

    // DEFAULT sale / other
    if (displayNumericPrice !== null) {
      const label = displayNumericPrice === 0 ? "Free" : finalCurrency + " " + Number(displayNumericPrice).toLocaleString();
      return <div className="text-base font-bold text-amber-600">{label}</div>;
    }

    return null;
  };

  const renderBadges = () => {
    if (!finalBadges || finalBadges.length === 0) return null;
    return (
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
    );
  };

  return (
    <Card
      className={`py-0 gap-0 overflow-hidden group shadow-sm shadow-card-foreground/30 border-0 will-change-transform
        ${is_file ? 'cursor-default' : 'cursor-pointer'}
        ${is_file ? '' : 'transition-all duration-300 hover:shadow-2xl active:scale-[0.98]'}
      `}
      onClick={!is_file ? onClick : undefined} // Disable onClick if is_file is true
    >
      <div className="p-3 will-change-transform">
        <div className="relative overflow-hidden rounded-lg aspect-video bg-muted will-change-transform">
          {image ? ( // Display SmartImage if an image is provided (even if it's a file)
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
          ) : is_file && !image ? ( // Display FileText icon if is_file is true and no image is provided
            <div className="flex items-center justify-center w-full h-full bg-white bg-[radial-gradient(#413c58_1px,transparent_1px)] bg-size-[30px_30px]">
              <svg fill="currentColor" stroke="currentColor" stroke-width="1.5" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 60.00 60.00" xml:space="preserve" class="w-24 h-24 text-primary">
                <g> <g> <path d="M13,14c0.6,0,1-0.4,1-1V2h36v14h2V1c0-0.6-0.4-1-1-1H13l0,0c-0.1,0-0.2,0-0.3,0.1h-0.1c-0.1,0.1-0.2,0.1-0.3,0.2l0,0 l-12,12l0,0c-0.1,0.1-0.1,0.2-0.2,0.3v0.1C0.1,12.8,0,12.9,0,13l0,0v47h2V14L13,14L13,14z M3.4,12l4.3-4.3L12,3.4V12H3.4z"/> <path d="M59.6,29.5l-26-19.3c-0.4-0.3-0.8-0.3-1.2,0L7.1,29H7v0.1l-0.6,0.4C6.1,29.7,6,30,6,30.3V34c0,0.6,0.4,1,1,1h3v25h2V35h42 v25h2V35h3c0.6,0,1-0.4,1-1v-3.7C60,30,59.9,29.7,59.6,29.5z M58,33h-3H11H8v-2h40v-2H10.4L33,12.2l25,18.6V33z"/> <rect x="31" y="19" width="4" height="2"/> <rect x="28" y="23" width="10" height="2"/> <rect x="14" y="37" width="2" height="2"/> <rect x="18" y="37" width="2" height="2"/> <rect x="22" y="37" width="2" height="2"/> <rect x="26" y="37" width="2" height="2"/> <rect x="30" y="37" width="2" height="2"/> <rect x="34" y="37" width="2" height="2"/> <rect x="38" y="37" width="2" height="2"/> <rect x="42" y="37" width="2" height="2"/> <rect x="46" y="37" width="2" height="2"/> <rect x="50" y="37" width="2" height="2"/> <polygon points="17,43 14,43 14,45 16,45 16,60 18,60 18,45 27,45 27,60 29,60 29,45 31,45 31,43 28,43 "/> <rect x="23" y="51" width="2" height="2"/> <path d="M50,43H36c-0.6,0-1,0.4-1,1v12h2v-5h5v5h2v-5h5v5h2V44C51,43.4,50.6,43,50,43z M37,49v-4h5v4H37z M44,49v-4h5v4H44z"/> <rect x="41" y="5" width="6" height="2"/> <rect x="38" y="9" width="9" height="2"/> </g> </g>
              </svg>
            </div>
          ) : ( // Fallback for non-file properties without an image
            <div className="flex items-center justify-center w-full h-full bg-muted">
              <ImageOff className="w-12 h-12 text-muted-foreground/50" />
            </div>
          )}

          {renderBadges()}

          {locationMap && !is_file && ( // Hide map button if is_file
            <div className="absolute bottom-3 right-3 will-change-transform">
              <Dialog open={isMapOpen} onOpenChange={setIsMapOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="default"
                    size="sm"
                    className="h-7 px-2.5 gap-1 shrink-0 text-xs will-change-transform"
                    onClick={handleMapClick}
                  >
                    <Map strokeWidth={1.5} className="w-3 h-3 will-change-transform" />
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
        {(title || displayNumericPrice !== null || isDiscounted) && (
          <div className="space-y-1.5 text-left will-change-transform">
            {title && (
              <h3 className="text-base font-semibold text-left line-clamp-2 will-change-transform">{title}</h3>
            )}
            {(displayNumericPrice !== null || isDiscounted) && (
              <div className="will-change-transform">{renderPrice()}</div>
            )}
          </div>
        )}

        {(location || city) && (
          <div className="flex items-center justify-between gap-2 text-left will-change-transform">
            {city && (
              <div className="flex items-center gap-1.5 text-xs font-medium text-primary will-change-transform">
                <Building strokeWidth={1.5} className="shrink-0 w-3.5 h-3.5 will-change-transform" />
                <span className="text-left line-clamp-1 will-change-transform">{city}</span>
              </div>
            )}
            <div className="flex flex-col gap-0.5 text-primary text-xs flex-1 min-w-0 text-left will-change-transform">
              {location && (
                <div className="flex items-center gap-1.5">
                  <MapPin strokeWidth={1.5} className="w-3.5 h-3.5 shrink-0 will-change-transform" />
                  <span className="text-left line-clamp-1 will-change-transform">{location}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {(beds || baths || area) && (
          <div className="space-y-1.5 will-change-transform">
            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 pt-1.5  text-left will-change-transform">
              {!is_file && beds && beds > 0 && (
                <div className="flex items-center gap-1 text-xs text-left will-change-transform">
                  <Bed strokeWidth={1.5} className="w-3.5 h-3.5 text-muted-foreground shrink-0 will-change-transform" />
                  <span className="font-medium will-change-transform">{beds}</span>
                  <span className="text-muted-foreground will-change-transform">{pluralize(beds, "Bed")}</span>
                </div>
              )}

              {!is_file && baths && baths > 0 && (
                <div className="flex items-center gap-1 text-xs text-left will-change-transform">
                  <Bath strokeWidth={1.5} className="w-3.5 h-3.5 text-muted-foreground shrink-0 will-change-transform" />
                  <span className="font-medium will-change-transform">{baths}</span>
                  <span className="text-muted-foreground will-change-transform">{pluralize(baths, "Bath")}</span>
                </div>
              )}

              {area && area > 0 && (
                <div className="flex items-center gap-1 text-xs text-left will-change-transform">
                  <Maximize2 strokeWidth={1.5} className="w-3.5 h-3.5 text-muted-foreground shrink-0 will-change-transform" />
                  <span className="font-medium will-change-transform">{area}</span>
                  <span className="text-muted-foreground will-change-transform">{finalAreaUnit}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {is_file && (
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" size="icon" className="p-0 border-none hover:bg-transparent hover:scale-110 transition-transform duration-300"
              onClick={() => {
                const phoneNumber = phoneProp || DEFAULT_PHONE_NUMBER;
                window.location.href = `tel:${phoneNumber}`;
              }}
            >
              <FaPhone style={{ width: '2rem', height: '2rem' }} className="text-primary" />
            </Button>
            <Button variant="ghost" size="icon" className="p-0 border-none hover:bg-transparent hover:scale-110 transition-transform duration-300"
              onClick={() => {
                const whatsappNumber = whatsappProp || DEFAULT_WHATSAPP_NUMBER;
                const whatsappMessage = `Hello, I'm interested in the property: ${title}.`;
                window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`, '_blank');
              }}
            >
              <FaWhatsapp style={{ width: '2rem', height: '2rem' }} className="text-green-500" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PropertyCard;
