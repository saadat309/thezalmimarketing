import React, { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "motion/react";

export default function VerticalTilesPreloader({
  onComplete,
  minTileWidth = 48,
  animationDuration = 0.6,
  animationDelay = 0.6,
  stagger = 0.04,
  children,
}) {
  const [tiles, setTiles] = useState([]);
  const containerRef = useRef(null);
  const [isCompleted, setIsCompleted] = useState(false);

  const calculateTiles = useCallback(() => {
    if (containerRef.current) {
      const { offsetWidth: width } = containerRef.current;
      const tileCount = Math.max(4, Math.floor(width / minTileWidth));
      const tileWidth = width / tileCount + 1;

      const newTiles = Array.from({ length: tileCount }, (_, index) => ({
        id: index,
        width: tileWidth,
        order: Math.abs(index - Math.floor((tileCount - 1) / 2)),
      }));

      setTiles(newTiles);
    }
  }, [minTileWidth]);

  useEffect(() => {
    calculateTiles();
    const resizeObserver = new ResizeObserver(calculateTiles);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }
    return () => resizeObserver.disconnect();
  }, [calculateTiles]);

  // Handle completion timeout
  useEffect(() => {
    if (tiles.length === 0) return;
    const maxOrder = Math.max(...tiles.map((t) => t.order));
    const totalDuration = (animationDelay + maxOrder * stagger + animationDuration) * 1000;
    
    const timer = setTimeout(() => {
      setIsCompleted(true);
      if (onComplete) onComplete();
    }, totalDuration + 100);

    return () => clearTimeout(timer);
  }, [tiles, animationDelay, stagger, animationDuration, onComplete]);

  return (
    <div ref={containerRef} className={`relative w-full min-h-screen ${isCompleted ? "overflow-visible" : "overflow-hidden"}`}>
      {/* Underlying website content */}
      <div className={`w-full transition-opacity duration-700 ${isCompleted ? "opacity-100" : "opacity-95"}`}>
        {children}
      </div>

      {!isCompleted && (
        <div className="fixed inset-0 z-[9999] overflow-hidden pointer-events-none">
          {/* Center Loader Branding */}
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-background/40 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col items-center space-y-4 pointer-events-auto"
            >
              <img
                src="/Zalmi Marketing Logo White.webp"
                alt="The Zalmi Marketing"
                className="w-44 h-auto dark:block hidden drop-shadow-2xl"
              />
              <img
                src="/Zalmi Marketing Logo Black.webp"
                alt="The Zalmi Marketing"
                className="w-44 h-auto dark:hidden block drop-shadow-2xl"
              />
              <div className="flex items-center space-x-3 bg-card/80 dark:bg-card/90 px-4 py-2 rounded-full border border-amber-500/30 shadow-lg backdrop-blur-md">
                <div className="w-4 h-4 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
                <span className="text-xs font-semibold tracking-wider text-amber-600 dark:text-amber-400 uppercase">
                  Revealing Luxury Real Estate...
                </span>
              </div>
            </motion.div>
          </div>

          {/* Vertical Tiles Reveal Animation */}
          <div className="absolute inset-0 flex z-30 pointer-events-none">
            {tiles.map((tile) => (
              <motion.div
                key={tile.id}
                className="bg-slate-900 dark:bg-[#0A0F1D] border-r border-amber-500/15 shadow-2xl"
                style={{
                  width: tile.width,
                  position: "absolute",
                  left: `${(tile.id * 100) / tiles.length}%`,
                  top: 0,
                  height: "100%",
                }}
                initial={{ y: 0 }}
                animate={{ y: "100%" }}
                transition={{
                  duration: animationDuration,
                  delay: animationDelay + tile.order * stagger,
                  ease: [0.45, 0, 0.55, 1],
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
