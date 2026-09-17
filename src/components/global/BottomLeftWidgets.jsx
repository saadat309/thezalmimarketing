import React, { useState, useEffect, useRef } from "react";
import { ArrowUp } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";

export default function BottomLeftWidgets() {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  
  const draggingRef = useRef(false);
  const startPosRef = useRef({ x: 0, y: 0 });
  const hasMovedRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      setScrollProgress(Math.min(100, Math.max(0, progress)));

      // Visible after 100vh
      if (scrollTop > window.innerHeight * 0.8) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handlePointerDown = (e) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    draggingRef.current = true;
    hasMovedRef.current = false;
    startPosRef.current = { x: e.clientX - position.x, y: e.clientY - position.y };
    e.target.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e) => {
    if (!draggingRef.current) return;
    const newX = e.clientX - startPosRef.current.x;
    const newY = e.clientY - startPosRef.current.y;
    if (Math.hypot(newX - position.x, newY - position.y) > 3) {
      hasMovedRef.current = true;
    }
    setPosition({ x: newX, y: newY });
  };

  const handlePointerUp = (e) => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    try {
      e.target.releasePointerCapture(e.pointerId);
    } catch {}
  };

  const scrollToTop = () => {
    if (hasMovedRef.current) return;
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const whatsappNumber = "923218446496";
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent("Hi, I want to know about your real estate services.")}`;

  // Radius for progress ring (20 for 48px viewBox)
  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (scrollProgress / 100) * circumference;

  return (
    <div 
      className="fixed bottom-6 left-6 z-40 flex flex-col items-center gap-3 touch-none select-none cursor-grab active:cursor-grabbing"
      style={{ transform: `translate(${position.x}px, ${position.y}px)` }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      {/* Move to Top with Progress Circle (Appears after 100vh) */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="relative group flex items-center justify-center w-12 h-12 rounded-full bg-slate-950/90 dark:bg-slate-900/90 backdrop-blur-xl border border-[#F5A623]/40 dark:border-[#D4AF37]/40 shadow-[0_10px_25px_rgba(245,166,35,0.25)] hover:scale-110 active:scale-95 transition-all duration-300 animate-in fade-in slide-in-from-bottom-3"
          aria-label="Scroll to top"
        >
          {/* SVG Progress Ring */}
          <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none" viewBox="0 0 48 48">
            <circle
              cx="24"
              cy="24"
              r={radius}
              className="stroke-muted/40"
              strokeWidth="2.5"
              fill="transparent"
            />
            <circle
              cx="24"
              cy="24"
              r={radius}
              className="stroke-[#F5A623] dark:stroke-[#D4AF37] transition-all duration-150"
              strokeWidth="3"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
            />
          </svg>

          <ArrowUp className="w-6 h-6 text-[#F5A623] dark:text-[#D4AF37] group-hover:-translate-y-0.5 transition-transform z-10" />
        </button>
      )}

      {/* WhatsApp Widget - Always Visible & Untouched */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => {
          if (hasMovedRef.current) {
            e.preventDefault();
          }
        }}
        className="group relative flex items-center justify-center w-12 h-12 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_10px_25px_rgba(16,185,129,0.4)] hover:scale-110 active:scale-95 transition-all duration-300"
        aria-label="Chat on WhatsApp"
      >
        <span className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-25 group-hover:opacity-45" />
        <FaWhatsapp className="w-7 h-7 z-10 group-hover:rotate-12 transition-transform" />
        
        {/* Tooltip */}
        <span className="absolute left-14 bg-slate-950/90 text-white text-xs px-2.5 py-1 rounded-xl shadow-xl border border-emerald-500/30 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none font-medium">
          Chat on WhatsApp
        </span>
      </a>
    </div>
  );
}
