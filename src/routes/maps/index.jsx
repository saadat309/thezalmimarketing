import { createFileRoute } from "@tanstack/react-router";
import { GlobalHero } from "@/components/global/GlobalHero";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import SmartImage from "@/components/global/SmartImage";
import MapCard from "@/components/global/MapCard";
import { FileDown, Expand } from "lucide-react";

export const Route = createFileRoute("/maps/")({
  component: RouteComponent,
});

const mapsData = [
  {
    title: "Phase 8 Map",
    thumb: "/maps/thumbs/PHASE_8_Map.webp",
    pdfPath: "/maps/PHASE_8_Map.pdf",
    description: "Description and metadata about this map.",
  },
  {
    title: "Phase 8 Map",
    thumb: "/maps/thumbs/PHASE_8_Map.webp",
    pdfPath: "/maps/PHASE_8_Map.pdf",
    description: "Description and metadata about this map.",
  },
  {
    title: "Phase 8 Map",
    thumb: "/maps/thumbs/PHASE_8_Map.webp",
    pdfPath: "/maps/PHASE_8_Map.pdf",
    description: "Description and metadata about this map.",
  },
  {
    title: "Phase 8 Map",
    thumb: "/maps/thumbs/PHASE_8_Map.webp",
    pdfPath: "/maps/PHASE_8_Map.pdf",
    description:
      "Description and metadata about this map. Description and Description and",
  },
];

function RouteComponent() {
  return (
    <div>
      <GlobalHero>
        <h1 className="px-4 py-4 mx-auto text-4xl text-center rounded bg-muted w-fit">
          All Maps
        </h1>
      </GlobalHero>
      <div className="flex flex-row flex-wrap justify-center gap-4 px-6 py-4">
        {mapsData.map((item, index) => (
          <MapCard key={index} {...item} />
        ))}
      </div>
    </div>
  );
}
