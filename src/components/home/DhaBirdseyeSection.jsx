import React from 'react';
import { motion } from 'framer-motion';

export default function DhaBirdseyeSection({ children, className = "" }) {
  const imageUrl = '/dha birdeye view.webp';

  return (
    <section className={`relative w-full min-h-[750px] sm:min-h-[1000px] lg:min-h-[1350px] flex flex-col justify-start items-center pt-32 sm:pt-48 lg:pt-72 pb-24 px-1.5 sm:px-4 ${className}`}>
      {/* Background with birdseye view of DHA Society (shifted slightly right on mobile to fully show office building) */}
      <div
        className="absolute inset-0 bg-[62%_center] sm:bg-center bg-cover bg-no-repeat bg-fixed"
        style={{
          backgroundImage: `linear-gradient(180deg, rgba(10, 15, 29, 0.85) 0%, rgba(10, 15, 29, 0.6) 50%, rgba(10, 15, 29, 0.9) 100%), url('${imageUrl}')`,
          backgroundAttachment: 'fixed',
        }}
        aria-hidden="true"
      />

      {/* "ZALMI MARKETING" Watermark Text positioned absolutely across mobile & desktop to be partially hidden behind WhyChooseUsSection */}
      <div className="absolute top-20 sm:top-36 lg:top-60 left-0 right-0 z-0 w-full max-w-7xl mx-auto text-center px-2 pointer-events-none">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
          className="flex flex-col items-center justify-center w-full"
        >
          <div className="relative py-2 sm:py-4 px-1 w-full flex justify-center">
            <h2 
              className="uppercase text-center select-none leading-none sm:whitespace-nowrap tracking-[0.01em] sm:tracking-[0.05em]"
              style={{
                fontFamily: '"Impact", "Arial Black", sans-serif',
                fontSize: 'clamp(4.2rem, 14vw, 10.5rem)',
                lineHeight: 0.85,
                transform: 'scaleX(0.88) scaleY(1.3)',
                transformOrigin: 'center',
                color: 'rgba(255, 255, 255, 0.18)',
                WebkitTextFillColor: 'rgba(255, 255, 255, 0.18)',
                WebkitTextStroke: '2px rgba(255, 255, 255, 0.95)',
                filter: 'drop-shadow(0 4px 16px rgba(0, 0, 0, 0.9))',
              }}
            >
              <span className="block sm:inline">ZALMI</span>{' '}
              <span className="block sm:inline">MARKETING</span>
            </h2>
          </div>
        </motion.div>
      </div>

      {children && (
        <div className="relative z-10 w-full max-w-7xl mx-auto mt-24 sm:mt-32">
          {children}
        </div>
      )}
    </section>
  );
}
