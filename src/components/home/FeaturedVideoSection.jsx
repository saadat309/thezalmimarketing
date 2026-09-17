import React from "react";
import { VideoPlayer } from "@/components/global/VideoPlayer";

export default function FeaturedVideoSection({ heading, subheading, video }) {
  if (!video) return null;

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 space-y-8">
      {/* Header */}
      <div className="flex flex-col items-center text-center max-w-3xl mx-auto space-y-3 px-2">
        <h2 className="text-3xl sm:text-4xl font-extrabold font-display tracking-tight text-foreground">
          {heading || <span>Experience Luxury in <span className="gold-text-gradient">Motion & Detail</span></span>}
        </h2>
        <p className="text-sm sm:text-base text-muted-foreground font-sans leading-relaxed font-light">
          {subheading || "Take an immersive virtual drone tour of our elite DHA villas, commercial hubs, and premium plot file developments."}
        </p>
      </div>

      {/* Video Frame */}
      <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-[#F5A623]/30 dark:border-[#D4AF37]/30 max-w-5xl mx-auto bg-card">
        <VideoPlayer video={video} />
      </div>
    </div>
  );
}
