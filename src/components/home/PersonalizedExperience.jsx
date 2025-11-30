import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MoveRight } from "lucide-react";
import SmartImage from "@/components/global/SmartImage";

export default function PersonalizedExperience({ cards }) {
  return (
    <section className="py-4 md:py-8 lg:py-12">
      <div className="container">
        <div className="grid gap-6 lg:grid-cols-2 lg:gap-12">
          {cards.map((card, index) => (
            <Card
              key={index}
              className={`flex flex-col-reverse items-center gap-4 p-6 rounded-lg ${card.backgroundColor} lg:flex-row lg:items-center lg:p-10 lg:gap-8 lg:min-h-68`}
            >
              <div className="flex flex-col flex-1 h-full justify-between text-center">
                <h3 className="text-xl font-bold">{card.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {card.description}
                </p>
                <Button variant="default" className="mt-2" asChild>
                  <a href={card.buttonLink}>
                    {card.buttonText} <MoveRight className="w-4 h-4 ml-2" />
                  </a>
                </Button>
              </div>
              <div className="w-32 h-32 text-muted-foreground lg:ml-auto shrink-0">
                <SmartImage
                  loading="lazy"
                  thumb="/lahore-city-pic.webp"
                  src={card.imagePath}
                  alt={card.title}
                  ratio={1 / 1}
                />
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
