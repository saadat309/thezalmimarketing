import React, { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { Calculator, X, ArrowRight } from "lucide-react";
/* eslint-disable no-unused-vars */
import { motion, AnimatePresence } from "framer-motion";
/* eslint-enable no-unused-vars */

export default function CalculatorMobileCta() {
  const [isVisible, setIsVisible] = useState(false);
  const [isClosed, setIsClosed] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const heroHeight = window.innerHeight * 0.85;
      if (window.scrollY > heroHeight && !isClosed) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [isClosed]);

  if (isClosed) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="fixed bottom-40 left-4 sm:left-6 z-30 lg:hidden pointer-events-auto max-w-[220px] sm:max-w-[240px]"
        >
          <div className="relative rounded-2xl bg-card/95 dark:bg-slate-900/95 backdrop-blur-xl border border-[#F5A623]/40 dark:border-[#D4AF37]/40 shadow-[0_10px_30px_rgba(245,166,35,0.3)] p-3 text-left">
            {/* Close Button */}
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsClosed(true);
                setIsVisible(false);
              }}
              aria-label="Close calculator prompt"
              className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-slate-900 dark:bg-slate-800 text-white border border-[#F5A623]/50 flex items-center justify-center hover:scale-110 transition-transform shadow-md z-10"
            >
              <X className="w-3.5 h-3.5" />
            </button>

            <Link
              to="/calculator"
              className="flex items-center gap-3 group"
            >
              <div className="p-2.5 rounded-xl bg-[#F5A623]/20 dark:bg-[#D4AF37]/20 text-[#F5A623] dark:text-[#D4AF37] border border-[#F5A623]/30 shrink-0 group-hover:scale-105 transition-transform">
                <Calculator className="w-5 h-5" />
              </div>

              <div className="flex flex-col min-w-0 pr-2">
                <span className="text-[10px] font-semibold tracking-wider uppercase text-[#F5A623] dark:text-[#D4AF37]">
                  New Tool
                </span>
                <span className="text-xs sm:text-sm font-bold text-foreground leading-snug truncate group-hover:text-[#F5A623] dark:group-hover:text-[#D4AF37] transition-colors">
                  Calculate DHA Fees
                </span>
              </div>

              <ArrowRight className="w-4 h-4 text-muted-foreground ml-auto shrink-0 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
