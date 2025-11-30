'use client';
import React, { useState } from 'react'; // Import useState
import { Maximize2, ChevronLeft, ChevronRight } from 'lucide-react'; // Import Maximize2, ChevronLeft, ChevronRight
import FullscreenImageViewer from './FullscreenImageViewer'; // Import FullscreenImageViewer
import {
  Carousel,
  Slider,
  SliderContainer,
  ThumbsSlider,
  SliderPrevButton, // Import SliderPrevButton
  SliderNextButton, // Import SliderNextButton
} from '@/components/ui/CursifyCarousel';
import SmartImage from '@/components/global/SmartImage'; // Import SmartImage
import { cn } from '@/lib/utils'; // Import cn

const DUMMY_IMAGES = [
  'https://images.unsplash.com/photo-1759395073808-17782f3d8d66?q=80&w=1471&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1759434192768-fe3facebd5f6?q=80&w=1471&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1758641008040-28cdd59ca8fb?q=80&w=687&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1618220649687-ba860f3176e7?q=80&w=1474&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1525310072745-f49212b5ac6d?q=80&w=765&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1603338936206-9f7bd3c61cf0?q=80&w=730&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1580411788548-eee17fc98883?q=80&w=687&auto=format&fit=crop',
];

function ImageSlider({ images = [], startIndex = 0, disableThumbs = false, fullScreenMode = false }) { // Add new props
  const OPTIONS = { loop: false, startIndex }; // Pass startIndex to Carousel options
  const slides = images.length > 0 ? images : DUMMY_IMAGES;

  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  const openViewer = (index) => {
    setCurrentSlideIndex(index);
    setIsViewerOpen(true);
  };

  const closeViewer = () => {
    setIsViewerOpen(false);
  };

  return (
    <>
      <div className={cn(fullScreenMode ? "w-full h-full overflow-hidden" : "w-full mx-auto")}> {/* Added overflow-hidden */}
        <Carousel options={OPTIONS} className={cn(fullScreenMode ? "relative h-full flex flex-col" : "relative")} startIndex={startIndex}> {/* Added h-full flex flex-col */}
          {fullScreenMode && ( // Render Prev/Next buttons only in fullscreen mode
            <>
              <SliderPrevButton className="absolute left-0 z-10 p-2 text-white transition-colors transform -translate-y-1/2 bg-gray-800 rounded-full bg-opacity-70 top-1/2 hover:bg-opacity-100">
                <ChevronLeft className="w-6 h-6" />
              </SliderPrevButton>
              <SliderNextButton className="absolute right-0 z-10 p-2 text-white transition-colors transform -translate-y-1/2 bg-gray-800 rounded-full bg-opacity-70 top-1/2 hover:bg-opacity-100">
                <ChevronRight className="w-6 h-6" />
              </SliderNextButton>
            </>
          )}
          <SliderContainer className={cn(fullScreenMode ? "gap-2 flex-1 min-h-0" : "gap-2")}> {/* Added flex-1 min-h-0 */}
            {slides.map((imgSrc, index) => (
              <Slider
                key={index}
                className={cn( // Use cn here
                  fullScreenMode && "w-full",
                  !fullScreenMode && "w-full"
                )}
                thumbnailSrc={imgSrc}
              >
                <div
                  className="relative w-full cursor-pointer group"
                  onClick={() => openViewer(index)}
                >
                  <SmartImage
                    src={imgSrc}
                    alt={`Property image ${index + 1}`}
                    width={1400}
                    height={800}
                    imgClassName={cn(fullScreenMode ? "object-contain w-full h-full rounded-lg" : "object-cover w-full h-full rounded-lg")}
                    ratio={16/9}
                  />
                  {!fullScreenMode && (
                    <div className="absolute inset-0 flex items-center justify-center transition-opacity bg-black rounded-lg opacity-0 bg-opacity-30 group-hover:opacity-70">
                      <Maximize2 className="w-12 h-12 text-white" />
                    </div>
                  )}
                </div>
              </Slider>
            ))}
          </SliderContainer>
          {!disableThumbs && (
            <ThumbsSlider
              className="px-1 pb-1 mt-1"
              thumbsClassName="basis-[15%] h-24"
            />
          )}
        </Carousel>
      </div>

      {isViewerOpen && (
        <FullscreenImageViewer
          images={slides}
          initialIndex={currentSlideIndex}
          onClose={closeViewer}
        />
      )}
    </>
  );
}
export default ImageSlider;

