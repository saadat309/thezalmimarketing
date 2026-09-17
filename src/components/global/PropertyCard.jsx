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
  FileText,
} from "lucide-react";
import { FaPhone, FaWhatsapp } from "react-icons/fa";
import SmartImage from "@/components/global/SmartImage";
import { Skeleton } from "@/components/ui/skeleton";

const DEFAULT_PHONE_NUMBER = "+923218446496";
const DEFAULT_WHATSAPP_NUMBER = "923218446496";

function PropertyCard(props) {
  const {
    id,
    image,
    imageThumb,
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
    phone: phoneProp,
    whatsapp: whatsappProp,
    purchase_type,
    is_discounted,
    price_original_amount,
    installment_advance_amount,
    installment_amount,
    installment_total_period_text,
    installment_display_mode,
    price_period_unit,
    is_file,
    file_type,
    short_desc,
    phase,
    societyName,
    is_furnished,
    isLoading,
  } = props;

  if (isLoading) {
    return (
      <Card className="py-0 gap-0 overflow-hidden group shadow-sm bg-card border border-border rounded-3xl">
        <div className="p-3">
          <Skeleton className="relative overflow-hidden rounded-2xl aspect-video bg-muted" />
        </div>
        <CardContent className="px-4 pt-2 pb-4 space-y-3 text-left">
          <Skeleton className="h-5 w-3/4 bg-muted" />
          <Skeleton className="h-4 w-1/2 bg-muted" />
          <Skeleton className="h-4 w-full bg-muted" />
          <Skeleton className="h-4 w-full bg-muted" />
        </CardContent>
      </Card>
    );
  }

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
    ? [{ label: category, variant: "default" }, ...(badges || []).filter(b => b.is_badge)]
    : [...(badges || []).filter(b => b.is_badge)];
  
  if (property_type) {
    finalBadges.push({ label: property_type, variant: 'outline' });
  }

  if (is_file && file_type) {
    finalBadges.push({ label: file_type, variant: 'secondary' });
  }

  if (!!is_furnished) {
    finalBadges.push({ label: "Furnished", variant: "default" });
  }

  const finalInstallmentPeriod = installmentPeriod || price_period_unit || "month";
  const finalInstallmentDuration = installmentDuration || installment_total_period_text;

  const resolvedOriginalPrice =
    typeof originalPrice !== "undefined" && originalPrice !== null
      ? originalPrice
      : typeof price_original_amount !== "undefined" && price_original_amount !== null
      ? price_original_amount
      : null;

  const hasInstallmentAdvanceDisplay =
    finalPriceType === "installment" && installment_display_mode === "advance" && typeof installment_advance_amount !== "undefined" && installment_advance_amount !== null;

  const hasInstallmentAmountDisplay = 
    finalPriceType === "installment" && (installment_display_mode === "installment" || !installment_display_mode) && typeof installment_amount !== "undefined" && installment_amount !== null;

  const displayNumericPrice = hasInstallmentAdvanceDisplay
    ? installment_advance_amount
    : hasInstallmentAmountDisplay
    ? installment_amount
    : typeof price !== "undefined" && price !== null
    ? price
    : null;

  const isDiscounted = !!is_discounted || finalPriceType === "discounted";

  const [isMapOpen, setIsMapOpen] = useState(false);

  const handleMapClick = (e) => {
    e.stopPropagation();
    setIsMapOpen(true);
  };

  const renderPrice = () => {
    if (displayNumericPrice === null && !isDiscounted && resolvedOriginalPrice === null) return null;

    if (finalPriceType === "rent") {
      const label = displayNumericPrice === 0 ? "Free" : finalCurrency + " " + Number(displayNumericPrice).toLocaleString();
      return (
        <div className="space-y-0.5">
          <div className="text-lg font-bold text-[#F5A623] dark:text-[#D4AF37] font-display">
            {label}
            <span className="text-xs font-normal text-muted-foreground ml-1">/{finalInstallmentPeriod}</span>
          </div>
        </div>
      );
    }

    if (finalPriceType === "installment") {
      const label = displayNumericPrice === 0 ? "Free" : finalCurrency + " " + Number(displayNumericPrice).toLocaleString();
      return (
        <div className="flex flex-row items-center gap-2 space-y-0.5 justify-between">
          <div className="text-lg font-bold text-[#F5A623] dark:text-[#D4AF37] font-display">
            {label}
            {hasInstallmentAmountDisplay && <span className="text-xs font-normal text-muted-foreground ml-1">/{finalInstallmentPeriod}</span>}
            {hasInstallmentAdvanceDisplay && <span className="ml-1 text-xs font-normal text-muted-foreground">(Advance)</span>}
          </div>
          {finalInstallmentDuration && <div className="text-xs text-muted-foreground">Period: {finalInstallmentDuration}</div>}
        </div>
      );
    }

    if (isDiscounted && resolvedOriginalPrice !== null) {
      const mainLabel = displayNumericPrice === 0 ? "Free" : finalCurrency + " " + Number(displayNumericPrice || 0).toLocaleString();
      const originalLabel = finalCurrency + " " + Number(resolvedOriginalPrice).toLocaleString();
      const saveAmt = Math.max(0, Number(resolvedOriginalPrice) - Number(displayNumericPrice || 0));
      const saveLabel = finalCurrency + " " + Number(saveAmt).toLocaleString();
      return (
        <div className="flex flex-row items-center gap-2 space-y-0.5 justify-between">
          <div className="flex items-center gap-2">
            <div className="text-lg font-bold text-[#F5A623] dark:text-[#D4AF37] font-display">{mainLabel}</div>
            <div className="text-xs line-through text-muted-foreground">{originalLabel}</div>
          </div>
          <div className="text-xs font-semibold text-emerald-500">Save {saveLabel}</div>
        </div>
      );
    }

    if (displayNumericPrice !== null) {
      const label = displayNumericPrice === 0 ? "Free" : finalCurrency + " " + Number(displayNumericPrice).toLocaleString();
      return <div className="text-lg font-bold text-[#F5A623] dark:text-[#D4AF37] font-display">{label}</div>;
    }

    return null;
  };

  const renderBadges = () => {
    if (!finalBadges || finalBadges.length === 0) return null;
    return (
      <div className="absolute flex flex-wrap gap-2 top-3 left-3 z-10">
        {finalBadges.map((badge, index) => {
          const labelLower = badge.label?.toLowerCase() || "";
          const isHot = labelLower.includes("hot") || labelLower.includes("featured");
          const isNew = labelLower.includes("new") || labelLower.includes("latest");

          let badgeClass = "text-xs font-bold px-3.5 py-1 rounded-full shadow-lg border-0";
          if (isHot) {
            badgeClass += " bg-gradient-to-r from-red-600 via-rose-500 to-orange-500 text-white animate-pulse shadow-red-500/50 border border-red-400/40";
          } else if (isNew) {
            badgeClass += " bg-gradient-to-r from-emerald-600 via-green-500 to-teal-500 text-white animate-pulse shadow-emerald-500/50 border border-emerald-400/40";
          } else {
            badgeClass += " bg-[#F5A623] dark:bg-[#D4AF37] text-white dark:text-slate-950 font-bold";
          }

          return (
            <Badge key={index} className={badgeClass}>
              {badge.label}
            </Badge>
          );
        })}
      </div>
    );
  };

  return (
    <Card
      id={id}
      className={`py-0 gap-0 overflow-hidden group bg-card border border-border rounded-3xl shadow-xl transition-all duration-500 flex flex-col h-full
        ${is_file ? "cursor-default" : "cursor-pointer hover:border-[#F5A623]/60 dark:hover:border-[#D4AF37]/60 hover:shadow-[0_20px_50px_rgba(245,166,35,0.15)] dark:hover:shadow-[0_20px_50px_rgba(212,175,55,0.15)] hover:-translate-y-1.5 active:scale-[0.98]"}
      `}
      onClick={!is_file ? onClick : undefined}
    >
      <div className="p-3">
        <div className="relative overflow-hidden rounded-2xl aspect-[16/10] bg-muted">
          {image ? (
            <SmartImage
              src={image}
              alt={title || "Property"}
              thumb={imageThumb}
              className="object-cover w-full h-full transition-transform duration-700 ease-out group-hover:scale-105"
              errorPlaceholder={
                <div className="flex items-center justify-center w-full h-full bg-muted">
                  <ImageOff className="w-12 h-12 text-muted-foreground/50" />
                </div>
              }
            />
          ) : is_file ? (
            <div className="flex items-center justify-center w-full h-full bg-muted">
              <img
                src="/files.svg"
                alt="File Icon"
                className="w-20 h-20 text-[#F5A623] dark:text-[#D4AF37]"
              />
            </div>
          ) : (
            <div className="flex items-center justify-center w-full h-full bg-muted">
              <ImageOff className="w-12 h-12 text-muted-foreground/50" />
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-slate-950/20 pointer-events-none opacity-75 group-hover:opacity-85 transition-opacity" />

          {renderBadges()}

          {locationMap &&
            !is_file && (
              <div className="absolute bottom-3 right-3 z-10">
                <Dialog open={isMapOpen} onOpenChange={setIsMapOpen}>
                  <DialogTrigger asChild>
                    <Button
                      variant="default"
                      size="sm"
                      className="h-8 px-3.5 gap-1.5 shrink-0 text-xs backdrop-blur-md bg-slate-950/80 border border-[#F5A623]/30 dark:border-[#D4AF37]/30 text-white hover:bg-[#F5A623] dark:hover:bg-[#D4AF37] hover:text-slate-950 transition-all shadow-lg rounded-full font-medium"
                      onClick={handleMapClick}
                    >
                      <Map strokeWidth={1.5} className="w-3.5 h-3.5 text-[#F5A623] dark:text-[#D4AF37] group-hover:text-slate-950" />
                      <span>View Map</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl bg-card border border-border text-foreground rounded-3xl p-6">
                    <DialogHeader>
                      <DialogTitle className="text-[#F5A623] dark:text-[#D4AF37]">{title || "Location"}</DialogTitle>
                    </DialogHeader>
                    <div className="w-full h-[400px] sm:h-[500px] rounded-2xl overflow-hidden border border-border">
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

      <CardContent className="px-5 pt-1 pb-5 space-y-3.5 text-left flex flex-col flex-grow justify-between">
        <div className="space-y-3.5">
          {(title || displayNumericPrice !== null || isDiscounted) && (
            <div className="space-y-1.5 text-left">
              {title && (
                <h3 className="text-base font-bold text-foreground group-hover:text-[#F5A623] dark:group-hover:text-[#D4AF37] transition-colors line-clamp-2 font-display">
                  {title}
                </h3>
              )}
              {(displayNumericPrice !== null || isDiscounted) && (
                <div>{renderPrice()}</div>
              )}
              {!!is_file && short_desc && (
                <p className="text-sm text-muted-foreground line-clamp-3 mt-1 font-light">
                  {short_desc}
                </p>
              )}
            </div>
          )}
        </div>

        <div className="space-y-3 mt-auto pt-3">
          {(location || city) && (
            <div className="flex items-center justify-between gap-2 text-left pt-2 border-t border-border">
              {city && (
                <div className="flex items-center gap-1.5 text-xs font-semibold text-[#F5A623] dark:text-[#D4AF37]">
                  <Building strokeWidth={1.5} className="shrink-0 w-3.5 h-3.5" />
                  <span className="text-left line-clamp-1">
                    {city}
                  </span>
                </div>
              )}
              <div className="flex flex-col gap-0.5 text-muted-foreground text-xs flex-1 min-w-0 text-right">
                {location && (
                  <div className="flex items-center justify-end gap-1.5">
                    <MapPin strokeWidth={1.5} className="w-3.5 h-3.5 shrink-0 text-[#F5A623] dark:text-[#D4AF37]" />
                    <span className="text-right line-clamp-1 font-light">
                      {location}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {(beds > 0 || baths > 0 || area > 0) ? (
            <div className="pt-2 border-t border-border">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground bg-muted/50 p-2.5 rounded-2xl border border-border/60">
                {!is_file && beds > 0 ? (
                  <div className="flex items-center gap-1.5 text-left">
                    <Bed strokeWidth={1.5} className="w-4 h-4 text-[#F5A623] dark:text-[#D4AF37] shrink-0" />
                    <span className="font-bold text-foreground">{beds}</span>
                    <span className="text-muted-foreground">{pluralize(beds, "Bed")}</span>
                  </div>
                ) : null}

                {!is_file && baths > 0 ? (
                  <div className="flex items-center gap-1.5 text-xs text-left">
                    <Bath strokeWidth={1.5} className="w-4 h-4 text-[#F5A623] dark:text-[#D4AF37] shrink-0" />
                    <span className="font-bold text-foreground">{baths}</span>
                    <span className="text-muted-foreground">{pluralize(baths, "Bath")}</span>
                  </div>
                ) : null}

                {area > 0 ? (
                  <div className="flex items-center gap-1.5 text-xs text-left">
                    <Maximize2 strokeWidth={1.5} className="w-4 h-4 text-[#F5A623] dark:text-[#D4AF37] shrink-0" />
                    <span className="font-bold text-foreground">{area}</span>
                    <span className="text-muted-foreground">{finalAreaUnit}</span>
                  </div>
                ) : null}
              </div>
            </div>
          ) : null}

          {!!is_file && (
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border">
              <Button
                variant="outline"
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border-[#F5A623]/40 dark:border-[#D4AF37]/40 hover:bg-[#F5A623]/10 dark:hover:bg-[#D4AF37]/10 text-foreground text-xs font-semibold transition-all"
                onClick={(e) => {
                  e.stopPropagation();
                  const phoneNumber = phoneProp || DEFAULT_PHONE_NUMBER;
                  window.location.href = `tel:${phoneNumber}`;
                }}
              >
                <FaPhone className="w-3.5 h-3.5 text-[#F5A623] dark:text-[#D4AF37] shrink-0" />
                <span>Call Now</span>
              </Button>
              <Button
                variant="outline"
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border-emerald-500/40 hover:bg-emerald-500/10 text-foreground text-xs font-semibold transition-all"
                onClick={(e) => {
                  e.stopPropagation();
                  const whatsappNumber = whatsappProp || DEFAULT_WHATSAPP_NUMBER;
                  const whatsappMessage = `Hello, I'm interested in the file: ${title}.`;
                  window.open(
                    `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`,
                    "_blank"
                  );
                }}
              >
                <FaWhatsapp className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>WhatsApp</span>
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function pluralize(count, noun) {
  return count === 1 ? noun : noun + "s";
}

export default function LinkedPropertyCard({ id, ...property }) {
  if (property.is_file) {
    return <PropertyCard {...property} />;
  }

  return (
    <PropertyCard {...property} />
  );
}
