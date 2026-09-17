import React from "react";
import MapCard from "@/components/global/MapCard";

export default function AIMapResults({ maps }) {
  if (!maps || maps.length === 0) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-3">
      {maps.map((mapItem, idx) => {
        const mappedMap = {
          id: mapItem.id || idx,
          title: mapItem.title || "Society Map",
          image: mapItem.map_pic || mapItem.image,
          thumb: mapItem.map_thumb || mapItem.thumb || mapItem.map_pic,
          pdfPath: mapItem.pdf || mapItem.pdfPath || "#",
          description: mapItem.description || `${mapItem.society_name || ''} ${mapItem.phase_name || ''} Master Plan Map`,
          badges: [
            { label: mapItem.society_name || "Society", variant: "default" },
            ...(mapItem.phase_name ? [{ label: mapItem.phase_name, variant: "secondary" }] : [])
          ]
        };
        return <MapCard key={mappedMap.id} {...mappedMap} />;
      })}
    </div>
  );
}
