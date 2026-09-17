import React from "react";
import PropertyCard from "@/components/global/PropertyCard";

export default function AIFileResults({ files }) {
  if (!files || files.length === 0) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-3">
      {files.map((file, idx) => {
        const mappedFile = {
          id: file.id || idx,
          title: file.title || "Plot File",
          price: file.price || file.price_amount,
          currency: "Rs",
          area: file.area,
          areaUnit: file.unit || "Marla",
          city: file.city || file.city_name,
          societyName: file.society || file.society_name,
          phase: file.phase || file.phase_name,
          file_type: file.file_type || "Affidavit",
          is_file: true,
        };
        return <PropertyCard key={mappedFile.id} {...mappedFile} />;
      })}
    </div>
  );
}
