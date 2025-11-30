import React from 'react';
import ImageSlider from './ImageSlider';
import { X } from 'lucide-react';

export default function FullscreenImageViewer({ images, initialIndex, onClose }) {
  // Simple full-page overlay
  return (
    <div className="fixed inset-0 z-[9999] bg-black bg-opacity-90 flex items-center justify-center p-4">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white z-50 p-2 rounded-full bg-gray-800 bg-opacity-70 hover:bg-opacity-100 transition-colors"
        aria-label="Close fullscreen viewer"
      >
        <X className="w-6 h-6" />
      </button>

      <div className="relative flex-1">
        {/* Render ImageSlider within the fullscreen viewer */}
        <ImageSlider images={images} startIndex={initialIndex} disableThumbs={true} fullScreenMode={true} />
      </div>
    </div>
  );
}
