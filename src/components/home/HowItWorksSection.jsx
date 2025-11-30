import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router"; // Assuming Link is used for the button
import { Search, Lightbulb, Handshake } from "lucide-react"; // Example icons

// Map icon names to actual LucideIcon components
const iconComponents = {
  Search: Search,
  Lightbulb: Lightbulb,
  Handshake: Handshake,
};

/**
 * @typedef {Object} HowItWorksItem
 * @property {keyof typeof iconComponents} icon - The name of the Lucide icon to display.
 * @property {string} title - The title for the card.
 * @property {string} description - The description for the card.
 */

/**
 * @typedef {Object} HowItWorksSectionProps
 * @property {string} heading - The main heading for the section.
 * @property {string} subheading - The subheading for the section.
 * @property {HowItWorksItem[]} items - An array of items to display as cards.
 * @property {string} buttonText - The text for the call-to-action button.
 * @property {string} buttonLink - The link for the call-to-action button.
 * @property {string} [className] - Optional additional CSS classes for the section.
 */

/**
 * Renders a "How It Works" section with a heading, subheading, cards, and a call-to-action button.
 * @param {HowItWorksSectionProps} props - The props for the component.
 */
export default function HowItWorksSection({
  heading,
  subheading,
  items,
  buttonText,
  buttonLink,
  className,
}) {
  return (
    <section className={`py-8 md:py-12 lg:py-16 ${className || ""}`}>
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-4xl font-extrabold text-primary sm:text-5xl md:text-6xl">
          {heading}
        </h2>
        <p className="mt-4 text-xl text-muted-foreground max-w-2xl mx-auto">
          {subheading}
        </p>

        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3 lg:gap-8">
          {items.map((item, index) => {
            const IconComponent = iconComponents[item.icon];
            return (
              <Card
                key={index}
                className="flex flex-col items-center p-6 text-center shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-lg"
              >
                <CardHeader className="flex justify-center w-full pb-4">
                  {IconComponent && (
                    <IconComponent className="h-16 w-16 text-primary" />
                  )}
                </CardHeader>
                <CardContent className="flex flex-col items-center gap-2">
                  <CardTitle className="text-2xl font-bold">
                    {item.title}
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    {item.description}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {buttonText && buttonLink && (
          <div className="mt-10">
            <Button asChild size="lg">
              <Link to={buttonLink}>{buttonText}</Link>
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
