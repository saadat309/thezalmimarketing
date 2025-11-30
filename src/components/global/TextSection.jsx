import React from "react";
import { Card, CardContent } from "@/components/ui/card";

/**
 * TextOnlySection
 * Reusable section for rich text content. Lightweight, shadcn-ish styling using Tailwind.
 * Props:
 *  - title: string
 *  - subtitle: string (optional)
 *  - content: string | ReactNode | Array<string|ReactNode> (if array, each item becomes a card)
 *  - align: 'left' | 'center' | 'right' (default 'left') — only affects title/subtitle
 *  - maxWidth: tailwind max-w-* class (default 'max-w-4xl')
 *  - columns: 1 | 2 (default 1) — controls responsive grid; 2 => 2 columns on md and up
 */
export default function TextSection({
  title,
  subtitle,
  content,
  align = "left",
  maxWidth = "max-w-5xl",
  columns = 1,
  variant = "light", // New variant prop
}) {
  const alignClass =
    align === "center" ? "items-center text-center" : align === "right" ? "items-end text-right" : "items-start text-left";

  const isArray = Array.isArray(content);
  const gridClass = columns === 2 ? "grid grid-cols-1 md:grid-cols-2 gap-6" : "grid grid-cols-1";

  // Conditional classes for dark variant
  const sectionBgClass = variant === "dark" ? "bg-primary" : "";
  const titleTextColorClass = variant === "dark" ? "text-primary-foreground" : "text-primary";
  const subtitleTextColorClass = variant === "dark" ? "text-muted" : "text-muted-foreground";
  const cardBorderColorClass = variant === "dark" ? "border-l-[color:var(--vanilla-cream-dark)]" : "border-l-primary";


  return (
    <section className={`w-full py-12 ${sectionBgClass}`}>
      <div className={`mx-auto px-4 ${maxWidth} flex flex-col gap-4 ${alignClass}`}>
        {title && <h2 className={`text-2xl font-semibold md:text-3xl ${titleTextColorClass}`}>{title}</h2>}
        {/* Updated subtitle text color */}
        {subtitle && <p className={`text-md max-w-prose ${subtitleTextColorClass}`}>{subtitle}</p>}

        {/* If content is an array, render cards in a responsive grid (1 or 2 columns). If single, render one card */}
        {isArray ? (
          <div className={gridClass}>
            {content.map((c, i) => (
              <Card key={i} className={`w-full py-3 border-t-0 border-b-0 border-l-4 border-r-0 rounded-sm shadow-sm bg-card ${cardBorderColorClass}`}>
                <CardContent className="px-3 text-sm leading-relaxed text-left text-card-foreground">
                  {typeof c === "string" ? <p>{c}</p> : c}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className={`w-full py-3 border-t-0 border-b-0 border-l-4 border-r-0 rounded-sm shadow-sm bg-card ${cardBorderColorClass}`}>
            <CardContent className="p-6 text-sm leading-relaxed text-left text-card-foreground">
              {typeof content === "string" ? <p>{content}</p> : content}
            </CardContent>
          </Card>
        )}
      </div>
    </section>
  );
}