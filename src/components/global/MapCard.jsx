import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import SmartImage from "@/components/global/SmartImage";
import { FileDown, Expand } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function MapCard({ title, image, thumb, pdfPath, description, badges, isLoading }) {
  if (isLoading) {
    return (
      <Card className="group px-0 py-0 border border-border bg-card rounded-3xl p-1 shadow-xl">
        <CardContent className="flex flex-col items-start w-full gap-2 px-0">
          <Skeleton className="w-full aspect-[16/10] rounded-t-2xl bg-muted" />
          <div className="flex flex-col items-center w-full p-4 gap-2">
            <Skeleton className="h-6 w-3/4 bg-muted" />
            <Skeleton className="h-4 w-full bg-muted" />
            <Skeleton className="h-4 w-1/2 bg-muted" />
            <Skeleton className="h-9 w-28 self-end mt-2 bg-muted" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const mapBadges = badges || [{ label: "Master Plan", variant: "default" }];

  return (
    <Card className="group px-0 py-0 border border-border bg-card rounded-3xl p-0 h-full flex flex-col shadow-xl transition-all duration-500 hover:border-[#F5A623]/60 dark:hover:border-[#D4AF37]/60 hover:shadow-[0_20px_50px_rgba(245,166,35,0.15)] dark:hover:shadow-[0_20px_50px_rgba(212,175,55,0.15)] hover:-translate-y-1.5">
      <CardContent className="flex flex-col items-start w-full gap-0 px-0 flex-1">
        <div className="w-full p-3">
          <div className="relative overflow-hidden rounded-2xl aspect-[16/10] bg-muted">
            {image || thumb ? (
              <SmartImage
                src={image || thumb}
                thumb={thumb}
                alt={title}
                ratio={16 / 10}
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full bg-muted rounded-2xl flex items-center justify-center text-sm text-muted-foreground">
                No thumbnail
              </div>
            )}

            {/* Cinematic Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-slate-950/20 pointer-events-none opacity-80 group-hover:opacity-90 transition-opacity" />

            {/* Badges Container */}
            <div className="absolute top-3 left-3 z-10 flex flex-wrap gap-2">
              {mapBadges.map((badge, index) => {
                const labelLower = badge.label?.toLowerCase() || "";
                const isHot = labelLower.includes("hot") || labelLower.includes("featured");
                const isNew = labelLower.includes("new") || labelLower.includes("latest");

                let badgeClass = "text-xs font-bold px-3.5 py-1 rounded-full shadow-lg border-0";
                if (isHot) {
                  badgeClass += " bg-gradient-to-r from-red-600 via-rose-500 to-orange-500 text-white animate-pulse shadow-red-500/50 border border-red-400/40";
                } else if (isNew) {
                  badgeClass += " bg-gradient-to-r from-emerald-600 via-green-500 to-teal-500 text-white animate-pulse shadow-emerald-500/50 border border-emerald-400/40";
                } else {
                  badgeClass += " backdrop-blur-md bg-slate-950/80 border border-[#F5A623]/30 dark:border-[#D4AF37]/30 text-[#F5A623] dark:text-[#D4AF37]";
                }

                return (
                  <Badge key={index} className={badgeClass}>
                    {badge.label}
                  </Badge>
                );
              })}
            </div>

            {/* Hover overlay for larger screens */}
            <a
              href={`${pdfPath}#navpanes=0&view=FitV`}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute inset-0 flex flex-col items-center justify-center hidden transition-all duration-300 backdrop-blur-sm bg-slate-950/50 opacity-0 group-hover:opacity-100 md:flex z-20"
            >
              <div className="p-3.5 rounded-full bg-[#F5A623] dark:bg-[#D4AF37] text-slate-950 shadow-xl mb-3 transform translate-y-2 group-hover:translate-y-0 transition-transform font-bold">
                <Expand strokeWidth={2} size={24} />
              </div>
              <span className="text-white font-semibold text-sm tracking-wide bg-slate-950/80 px-4 py-1.5 rounded-full border border-[#F5A623]/30 dark:border-[#D4AF37]/30">Open Master Map</span>
            </a>

            {/* Top-right icon for small screens */}
            <a
              href={`${pdfPath}#navpanes=0&view=FitV`}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute top-3 right-3 md:hidden z-25"
            >
              <Button variant="secondary" className="h-8 px-3.5 gap-1.5 text-xs backdrop-blur-md bg-slate-950/80 border border-[#F5A623]/30 dark:border-[#D4AF37]/30 text-white rounded-full font-medium" size="sm">
                <Expand size={14} className="text-[#F5A623] dark:text-[#D4AF37]" />
                Open
              </Button>
            </a>
          </div>
        </div>

        <div className="flex flex-col items-start w-full px-5 pt-1 pb-5 flex-1">
          <h2 className="text-base font-bold text-foreground group-hover:text-[#F5A623] dark:group-hover:text-[#D4AF37] transition-colors line-clamp-1 font-display">{title}</h2>

          <p className="mt-2 mb-4 text-sm text-muted-foreground line-clamp-2 font-light leading-relaxed">
            {description}
          </p>

          <div className="mt-auto w-full pt-3 border-t border-border flex items-center justify-between">
            <span className="text-xs text-muted-foreground font-mono">PDF Document</span>
            <a href={pdfPath} download>
              <Button variant="default" size="sm" className="h-9 px-4 gap-1.5 bg-[#F5A623] dark:bg-[#D4AF37] hover:bg-[#F5A623]/90 dark:hover:bg-[#D4AF37]/90 text-slate-950 font-bold rounded-xl shadow-lg transition-all">
                <FileDown size={14} /> Download
              </Button>
            </a>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
