import React from "react";
import PropertyCard from "@/components/global/PropertyCard";

export default function AIPropertyResults({ properties }) {
  if (!properties || properties.length === 0) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-3">
      {properties.map((prop, idx) => {
        const mappedProp = {
          id: prop.id || idx,
          title: prop.title || "Property Listing",
          price: prop.price || prop.price_amount,
          currency: "Rs",
          area: prop.area,
          areaUnit: prop.unit || "Marla",
          city: prop.city || prop.city_name,
          societyName: prop.society || prop.society_name,
          phase: prop.phase || prop.phase_name,
          property_type: prop.property_type || "Residential",
          image: prop.image || prop.media?.[0]?.path || null,
        };
        return <PropertyCard key={mappedProp.id} {...mappedProp} />;
      })}
    </div>
  );
}
