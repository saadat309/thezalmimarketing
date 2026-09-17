import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { Search, Lightbulb, Handshake } from "lucide-react";

const iconComponents = {
  Search: Search,
  Lightbulb: Lightbulb,
  Handshake: Handshake,
};

export default function HowItWorksSection({
  heading,
  subheading,
  items,
  buttonText,
  buttonLink,
  className,
}) {
  const total = items?.length || 0;
  if (total === 0) return null;

  return (
    <section
      className={`py-16 sm:py-20 md:py-28 relative bg-transparent ${className || ""}`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* Left Column: Sticky Section Header & Context */}
          <div className="lg:col-span-5 lg:sticky lg:top-28 text-left space-y-6">
            <div className="inline-block">
              <span className="px-4 py-1.5 text-xs font-medium tracking-wider text-[#F5A623] dark:text-[#D4AF37] uppercase border border-[#F5A623]/30 dark:border-[#D4AF37]/30 rounded-full bg-[#F5A623]/10 dark:bg-[#D4AF37]/10 shadow-sm">
                Seamless Process
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight font-display text-foreground leading-tight">
              {heading}
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed font-light">
              {subheading}
            </p>

            {buttonText && buttonLink && (
              <div className="pt-4">
                <Button
                  asChild
                  size="lg"
                  className="bg-[#F5A623] dark:bg-[#D4AF37] hover:bg-[#F5A623]/90 dark:hover:bg-[#D4AF37]/90 text-slate-950 font-bold px-8 py-6 rounded-full shadow-lg hover:shadow-[0_0_30px_rgba(245,166,35,0.5)] transition-all duration-300 text-base"
                >
                  <Link to={buttonLink}>{buttonText}</Link>
                </Button>
              </div>
            )}
          </div>

          {/* Right Column: Stacked Cards Deck with Sticky Peek Stacking */}
          <div className="lg:col-span-7 flex flex-col pb-32">
            <div className="flex w-full flex-col relative pb-20">
              {items.map((item, index) => {
                const IconComponent = iconComponents[item.icon];
                const cardIndex = index + 1;
                const stickyTop = 130 + index * 50;

                return (
                  <div
                    key={index}
                    className="sticky w-full transition-all duration-300 mb-6 last:mb-0"
                    style={{
                      top: `${stickyTop}px`,
                      zIndex: cardIndex,
                    }}
                  >
                    <Card className="relative flex flex-col items-start p-6 sm:p-8 text-left bg-card/95 backdrop-blur-md border border-border/80 rounded-3xl shadow-2xl hover:border-[#F5A623]/60 dark:hover:border-[#D4AF37]/60 hover:shadow-[0_20px_50px_rgba(245,166,35,0.2)] transition-all duration-500 group w-full">
                      <div className="absolute top-6 right-6 text-xs font-bold text-[#F5A623] dark:text-[#D4AF37] border border-[#F5A623]/30 dark:border-[#D4AF37]/30 rounded-full w-9 h-9 flex items-center justify-center bg-[#F5A623]/10 dark:bg-[#D4AF37]/10 shadow-inner">
                        0{cardIndex}
                      </div>
                      <CardHeader className="p-0 pb-4">
                        {IconComponent && (
                          <div className="p-3.5 rounded-2xl bg-[#F5A623]/10 dark:bg-[#D4AF37]/10 text-[#F5A623] dark:text-[#D4AF37] group-hover:scale-110 group-hover:bg-[#F5A623] dark:group-hover:bg-[#D4AF37] group-hover:!text-slate-950 dark:group-hover:!text-slate-950 transition-all duration-300 shadow-inner inline-flex">
                            <IconComponent className="h-8 w-8" />
                          </div>
                        )}
                      </CardHeader>
                      <CardContent className="p-0 flex flex-col items-start gap-2">
                        <CardTitle className="text-xl sm:text-2xl font-bold font-display text-foreground group-hover:text-[#F5A623] dark:group-hover:text-[#D4AF37] transition-colors">
                          {item.title}
                        </CardTitle>
                        <CardDescription className="text-muted-foreground text-sm sm:text-base leading-relaxed font-light text-left">
                          {item.description}
                        </CardDescription>
                      </CardContent>
                    </Card>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
