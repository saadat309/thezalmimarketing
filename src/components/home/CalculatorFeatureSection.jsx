import React from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Calculator, ShieldCheck, FileText, ArrowRight, CheckCircle2 } from "lucide-react";

export default function CalculatorFeatureSection({
  badge,
  heading,
  description,
  points,
  buttonText,
  buttonLink,
  disclaimer,
  className,
}) {
  return (
    <section
      aria-labelledby="calculator-feature-heading"
      className={`w-full py-16 sm:py-24 relative bg-transparent ${className || ""}`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Column: Copy & Action */}
          <div className="lg:col-span-6 text-left space-y-6">
            <div className="inline-block">
              <span className="px-4 py-1.5 text-xs font-medium tracking-wider text-[#F5A623] dark:text-[#D4AF37] uppercase border border-[#F5A623]/30 dark:border-[#D4AF37]/30 rounded-full bg-[#F5A623]/10 dark:bg-[#D4AF37]/10 shadow-sm inline-flex items-center gap-1.5">
                <Calculator className="w-3.5 h-3.5" />
                {badge || "New Zalmi Tool"}
              </span>
            </div>

            <h2
              id="calculator-feature-heading"
              className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight font-display text-foreground leading-tight"
            >
              {heading}
            </h2>

            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed font-light">
              {description}
            </p>

            {points && points.length > 0 && (
              <ul className="space-y-3 pt-2">
                {points.map((point, index) => (
                  <li key={index} className="flex items-start gap-3 text-sm sm:text-base text-foreground/90 font-medium">
                    <span className="p-1 rounded-full bg-[#F5A623]/15 dark:bg-[#D4AF37]/15 text-[#F5A623] dark:text-[#D4AF37] shrink-0 mt-0.5">
                      <CheckCircle2 className="w-4 h-4" />
                    </span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            )}

            {buttonText && buttonLink && (
              <div className="pt-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <Button
                  asChild
                  size="lg"
                  className="bg-[#F5A623] dark:bg-[#D4AF37] hover:bg-[#F5A623]/90 dark:hover:bg-[#D4AF37]/90 text-slate-950 font-bold px-8 py-6 rounded-full shadow-lg hover:shadow-[0_0_30px_rgba(245,166,35,0.5)] transition-all duration-300 text-base group"
                >
                  <Link to={buttonLink} className="flex items-center gap-2">
                    <span>{buttonText}</span>
                    <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </Link>
                </Button>
              </div>
            )}

            {disclaimer && (
              <p className="text-xs text-muted-foreground/80 italic pt-2">
                {disclaimer}
              </p>
            )}
          </div>

          {/* Right Column: Visual Frame & Lazy Image */}
          <div className="lg:col-span-6 relative">
            <div className="relative mx-auto max-w-lg lg:max-w-none">
              {/* Decorative Gold Glow Frame */}
              <div className="absolute -inset-2 bg-gradient-to-r from-[#F5A623]/30 to-[#D4AF37]/30 rounded-3xl blur-xl opacity-70 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 pointer-events-none" />
              
              <div className="relative rounded-3xl overflow-hidden border border-[#F5A623]/40 dark:border-[#D4AF37]/40 bg-card/80 backdrop-blur-md shadow-2xl p-2 sm:p-3">
                <div className="relative aspect-[4/3] sm:aspect-[16/10] w-full overflow-hidden rounded-2xl bg-muted">
                  <img
                    src="https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=2000&q=80"
                    alt="Zalmi Property Valuation and Transfer Fee Calculator Preview"
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-700 hover:scale-105 motion-reduce:transform-none"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/20 to-transparent flex flex-col justify-end p-6 text-left">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="p-2 rounded-xl bg-[#F5A623]/20 backdrop-blur-md text-[#F5A623] dark:text-[#D4AF37] border border-[#F5A623]/40">
                        <FileText className="w-5 h-5" />
                      </span>
                      <span className="text-xs font-semibold tracking-wider text-[#F5A623] dark:text-[#D4AF37] uppercase bg-black/40 px-3 py-1 rounded-full backdrop-blur-md">
                        DHA & Tax Breakdown
                      </span>
                    </div>
                    <p className="text-white text-sm sm:text-base font-semibold drop-shadow-md">
                      Instant calculation for DHA Lahore, Multan & prime plots.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
