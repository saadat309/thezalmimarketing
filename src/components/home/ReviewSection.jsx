import React, { useRef, useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Star, Quote, ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Counter } from "@/components/global/Counter";

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
  }, []);

  useEffect(() => {
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
      className={`absolute z-30 hidden transform -translate-y-1/2 top-1/2 md:inline-flex rounded-full bg-slate-900 border-[#D4AF37]/35 text-[#D4AF37] hover:bg-[#D4AF37] hover:text-slate-950 transition-all shadow-xl h-11 w-11 items-center justify-center ${className}`}
    >
      {children}
    </Button>
  );

  if (!reviews || reviews.length === 0) return null;

  return (
    <section className="w-full text-white py-16 md:py-24 relative overflow-hidden">
      {/* Background Stock Image with Cinematic Gradient Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-65 scale-105" 
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80')" }} 
      />
      <div className="absolute inset-0 bg-gradient-to-tr from-slate-950/90 via-slate-950/70 to-slate-950/40" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#D4AF37]/15 rounded-full blur-[140px] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left — heading + stats */}
          <div className="lg:col-span-6 flex flex-col items-start text-left order-1">
            <div className="inline-block mb-4">
              <Badge variant="outline" className="px-4 py-1.5 text-xs font-semibold tracking-wider text-[#D4AF37] uppercase border border-[#D4AF37]/40 rounded-full bg-[#D4AF37]/10 backdrop-blur-md shadow-sm">
                Testimonials
              </Badge>
            </div>
            <h2 className="mb-6 text-3xl font-extrabold sm:text-4xl lg:text-5xl font-display text-white tracking-tight">
              What our clients <span className="gold-text-gradient">are saying?</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6 p-6 rounded-3xl bg-slate-900/90 border border-[#D4AF37]/30 backdrop-blur-xl shadow-2xl w-full">
              <div className="text-left">
                <div className="text-3xl font-bold text-[#D4AF37] font-display"><Counter value="5,000+" /></div>
                <div className="text-sm text-slate-300 font-light mt-1">Satisfied Clients</div>
              </div>

              <div className="text-left sm:pl-6 sm:border-l sm:border-white/15">
                <div className="text-3xl font-bold text-[#D4AF37] font-display"><Counter value="4.9/5" /></div>
                <div className="text-sm text-slate-300 font-light mt-1">Overall Rating</div>
                <div className="flex gap-1 mt-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-[#D4AF37] fill-current" />
                  ))}
                </div>
              </div>
            </div>

            <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-light max-w-xl text-left">
              Real feedback from discerning clients who trusted The Zalmi Marketing for property acquisitions, verified plot files, and elite investment advisory.
            </p>
          </div>

          {/* Right — one-slide carousel */}
          <div className="lg:col-span-6 relative flex items-center justify-center order-2">
            <div className="relative flex flex-col items-center w-full py-6 px-2 sm:px-8">
              <ArrowButton onClick={prev} ariaLabel="Previous review" className="-left-2 md:-left-6"><ChevronLeft className="w-5 h-5" /></ArrowButton>
              <ArrowButton onClick={next} ariaLabel="Next review" className="-right-2 md:-right-6"><ChevronRight className="w-5 h-5" /></ArrowButton>

              {/* Slide track */}
              <div className="w-full overflow-hidden">
                <div
                  ref={containerRef}
                  className="flex items-center h-full transition-transform duration-500 ease-out"
                  style={{ transform: `translateX(-${index * 100}%)` }}
                >
                  {reviews.map((r) => (
                    <div key={r.id} className="w-full px-2 shrink-0">
                      <div className="max-w-xl p-6 sm:p-8 mx-auto border border-[#D4AF37]/35 rounded-3xl bg-slate-900/95 backdrop-blur-2xl shadow-2xl text-left">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <Avatar className="border border-[#D4AF37]/40 h-12 w-12 shrink-0">
                              <AvatarImage src={r.avatar} alt={r.name} />
                              <AvatarFallback className="bg-[#D4AF37]/15 text-[#D4AF37] font-bold">{r.name ? r.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase() : "?"}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="text-base font-bold text-white font-display">{r.name}</div>
                              <div className="text-xs text-[#D4AF37] font-medium mt-0.5">{r.role}</div>
                            </div>
                          </div>

                          <Quote className="w-7 h-7 text-[#D4AF37]/50 fill-current shrink-0" />
                        </div>

                        <p className="mt-6 text-sm sm:text-base leading-relaxed text-slate-200 font-light text-left">
                          "{r.text}"
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mobile controls */}
              <div className="flex items-center w-full gap-4 mt-6 md:hidden">
                <Button onClick={prev} variant="outline" className="flex-1 bg-slate-900 border-[#D4AF37]/35 text-[#D4AF37] hover:bg-[#D4AF37] hover:text-slate-950 py-3 rounded-xl font-semibold">
                  <ChevronLeft className="w-4 h-4 mr-2" /> Previous
                </Button>
                <Button onClick={next} variant="outline" className="flex-1 bg-slate-900 border-[#D4AF37]/35 text-[#D4AF37] hover:bg-[#D4AF37] hover:text-slate-950 py-3 rounded-xl font-semibold">
                  Next <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>

              {/* Slide indicators / dots */}
              <div className="flex items-center justify-center gap-2 mt-6">
                {reviews.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setIndex(i)}
                    aria-label={`Go to slide ${i + 1}`}
                    className={`h-2 rounded-full transition-all duration-300 ${index === i ? 'w-8 bg-[#D4AF37]' : 'w-2 bg-slate-700 hover:bg-slate-500'}`}
                  />
                ))}
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
