import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import SmartImage from "@/components/global/SmartImage";
import { FileDown, Expand } from "lucide-react";

export default function MapCard({ title, thumb, pdfPath, description }) {
  return (
    <Card className="group px-0 py-0 border-0 min-w-[200px] max-w-[280px] bg-muted p-1">
      <CardContent className="flex flex-col items-start w-full gap-2 px-0">
        <div className="w-full">
          <div className="relative overflow-hidden rounded-t-lg">
            {thumb ? (
              <SmartImage
                src={thumb}
                alt={title}
                ratio={16 / 9}
                className="w-full min-h-[180px] object-cover overflow-hidden"
              />
            ) : (
              <div className="w-full min-h-[180px] bg-gray-100 rounded flex items-center justify-center text-sm text-muted-foreground">
                No thumbnail
              </div>
            )}
            {/* Hover icon for larger screens */}
            <a
              href={`${pdfPath}#navpanes=0&view=FitV`}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute inset-0 flex-col items-center justify-center hidden transition-opacity duration-300 bg-opacity-50 opacity-0 bg-white/40 md:flex group-hover:opacity-100"
            >
              <Expand className="text-primary" strokeWidth={1.5} size={32} />
              <span className="mt-2 text-primary">open Map</span>
            </a>

            {/* Top-right icon for small screens */}
            <a
              href={`${pdfPath}#navpanes=0&view=FitV`}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute top-2 right-2 md:hidden"
            >
              <Button variant="secondary" className="flex gap-1" size="sm">
                <Expand size={16} />
                open Map
              </Button>
            </a>
          </div>
        </div>

        <div className="flex flex-col items-center w-full p-2 justify-evenly">
          <h2 className="text-lg font-semibold">{title}</h2>

          <p className="mb-3 text-sm text-muted-foreground">
            {description}
          </p>

          <a href={pdfPath} download className="flex self-end mt-2">
            <Button variant="default" size="sm">
              <FileDown size={14} /> Download
            </Button>
          </a>
        </div>
      </CardContent>
    </Card>
  );
}