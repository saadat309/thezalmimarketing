import React, { useRef, useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Star, Quote, ChevronLeft, ChevronRight } from "lucide-react";

export default function ReviewsSection({ reviews = [] }) {
  const [index, setIndex] = useState(0);
  const slidesCount = reviews.length;
  const containerRef = useRef(null);

  useEffect(() => {
    function handleKey(e) {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // clamp index
    if (index < 0) setIndex(0);
    if (index >= slidesCount) setIndex(slidesCount - 1);
  }, [index, slidesCount]);

  const prev = () => setIndex((i) => Math.max(0, i - 1));
  const next = () => setIndex((i) => Math.min(slidesCount - 1, i + 1));

  const ArrowButton = ({ onClick, children, ariaLabel, className }) => (
    <Button
      onClick={onClick}
      aria-label={ariaLabel}
      variant="outline"
      size="icon"
      className={`absolute z-30 hidden transform -translate-y-1/2 top-1/2 md:inline-flex rounded-full ${className}`}
    >
      {children}
    </Button>
  );

  if (!reviews || reviews.length === 0) return null;

  return (
    <section className="w-full text-white bg-primary py-14">
      <div className="grid items-center max-w-6xl grid-cols-1 gap-8 px-4 mx-auto md:px-8 md:grid-cols-2">
        {/* Left — heading + stats */}
        <div className="flex flex-col items-start order-1 md:order-1">
          <h2 className="mb-6 text-2xl font-semibold md:text-3xl">What our customers are saying?</h2>

          <div className="flex items-center gap-6 mb-6">
            <div>
              <div className="text-3xl font-bold">10k+</div>
              <div className="text-sm">Happy People</div>
            </div>

            <div className="pl-6 border-l border-border">
              <div className="text-3xl font-bold">4.88</div>
              <div className="text-sm">Overall rating</div>
              <div className="flex gap-1 mt-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                ))}
              </div>
            </div>
          </div>

          <p className="max-w-xl text-sm">Real feedback from customers who used our services for property searches, comparisons and loan estimation — concise, honest and verified.</p>
        </div>

        {/* Right — one-slide carousel */}
        <div className="relative flex items-center order-2 md:order-2 min-h-[220px]">
          <div className="relative flex flex-col items-center w-full py-6">
            <ArrowButton onClick={prev} ariaLabel="Previous review" className="-left-6"><ChevronLeft className="w-4 h-4" /></ArrowButton>
            <ArrowButton onClick={next} ariaLabel="Next review" className="-right-6"><ChevronRight className="w-4 h-4" /></ArrowButton>

            {/* Slide track */}
            <div className="w-full overflow-hidden">
              <div
                ref={containerRef}
                className="flex items-center h-full transition-transform duration-500"
                style={{ transform: `translateX(-${index * 100}%)` }}
              >
                {reviews.map((r) => (
                  <div key={r.id} className="w-full px-2 shrink-0 md:px-4">
                    <div className="max-w-xl p-6 mx-auto border rounded-lg bg-card">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={r.avatar} alt={r.name} />
                            <AvatarFallback>{r.name ? r.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase() : "?"}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="text-sm font-medium text-muted-foreground">{r.name}</div>
                            <div className="text-xs text-muted-foreground">{r.role}</div>
                          </div>
                        </div>

                        <Quote className="w-5 h-5 text-yellow-400 fill-current" />
                      </div>

                      <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{r.text}</p>

                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Fraction pagination + mobile controls */}
            <div className="flex items-center w-full gap-1 mt-4">
              <div className="flex justify-center w-full md:w-auto">
                <Button onClick={prev} variant="outline" className="px-3 py-1 text-sm md:hidden"><ChevronLeft className="w-4 h-4" /></Button>
              </div>

              <div className="flex justify-center w-full md:w-auto">
                <Button onClick={next} variant="outline" className="px-3 py-1 text-sm md:hidden"><ChevronRight className="w-4 h-4" /></Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}