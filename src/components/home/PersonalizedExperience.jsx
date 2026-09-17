import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MoveRight } from "lucide-react";
import SmartImage from "@/components/global/SmartImage";
import { Link } from "@tanstack/react-router";

export default function PersonalizedExperience({ cards }) {
  if (!cards || cards.length === 0) return null;

  return (
    <section className="py-12 md:py-20 w-full">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-2 text-left">
          {cards.map((card, index) => (
            <Card
              key={index}
              className="flex flex-col sm:flex-row items-center gap-6 p-6 sm:p-8 lg:p-10 rounded-3xl bg-card border border-[#F5A623]/20 dark:border-[#D4AF37]/20 shadow-xl group hover:border-[#F5A623]/50 dark:hover:border-[#D4AF37]/50 hover:shadow-[0_0_30px_rgba(245,166,35,0.15)] dark:hover:shadow-[0_0_30px_rgba(212,175,55,0.15)] transition-all duration-500"
            >
              <div className="flex flex-col justify-between flex-1 h-full text-left gap-4 order-2 sm:order-1 w-full">
                <h3 className="text-xl sm:text-2xl font-bold font-display text-foreground text-left">{card.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed text-left font-light">
                  {card.description}
                </p>
                <div>
                  <Button variant="default" className="bg-[#F5A623] dark:bg-[#D4AF37] hover:bg-[#F5A623]/90 dark:hover:bg-[#D4AF37]/90 text-slate-950 font-semibold px-6 py-5 rounded-full shadow-md transition-all duration-300 w-full sm:w-auto" asChild>
                    <Link to={card.buttonLink}>
                      {card.buttonText} <MoveRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                </div>
              </div>
              <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-2xl overflow-hidden shadow-lg shrink-0 border border-[#F5A623]/20 dark:border-[#D4AF37]/20 group-hover:scale-105 transition-transform duration-500 order-1 sm:order-2">
                <SmartImage
                  loading="lazy"
                  thumb="/lahore-city-pic.webp"
                  src={card.imagePath}
                  alt={card.title}
                  ratio={1 / 1}
                  className="object-cover w-full h-full"
                />
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
