import { useState, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PetImageCarouselProps {
  images: string[];
  petName: string;
  onShowDetails: () => void;
  fillFrame?: boolean;
}

const PetImageCarousel = ({ images, petName, fillFrame = false }: PetImageCarouselProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageError, setImageError] = useState<Record<number, boolean>>({});
  const touchStartX = useRef<number | null>(null);

  const nextImage = () => setCurrentImageIndex((prev) => (prev + 1) % images.length);
  const prevImage = () => setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);

  const handleImageError = (index: number) => {
    setImageError((prev) => ({ ...prev, [index]: true }));
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 40) {
      dx < 0 ? nextImage() : prevImage();
    }
    touchStartX.current = null;
  };

  const currentImage = imageError[currentImageIndex]
    ? '/placeholder.svg'
    : images[currentImageIndex] || '/placeholder.svg';

  return (
    <div
      className="absolute inset-0 flex items-center justify-center select-none"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <img
        src={currentImage}
        alt={petName}
        className={
          fillFrame
            ? 'w-full h-full object-cover object-center'
            : 'max-w-full max-h-full w-auto h-auto object-contain object-center'
        }
        onError={() => handleImageError(currentImageIndex)}
        draggable={false}
      />

      {images.length > 1 && (
        <>
          <div className="absolute top-3 left-3 right-3 flex justify-center gap-1 z-10">
            {images.map((_, index) => (
              <div
                key={index}
                className={`h-1 rounded-full transition-all duration-300 flex-1 max-w-12 ${
                  index === currentImageIndex ? 'bg-white' : 'bg-white/40'
                }`}
                onClick={() => setCurrentImageIndex(index)}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); prevImage(); }}
            aria-label="Foto anterior"
            className="hidden sm:flex absolute left-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/80 hover:bg-white text-foreground backdrop-blur-sm shadow-md items-center justify-center transition-all opacity-90 hover:opacity-100 z-20"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); nextImage(); }}
            aria-label="Próxima foto"
            className="hidden sm:flex absolute right-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/80 hover:bg-white text-foreground backdrop-blur-sm shadow-md items-center justify-center transition-all opacity-90 hover:opacity-100 z-20"
          >
            <ChevronRight className="h-6 w-6" />
          </button>

          {/* Tap zones for mobile — larger areas, only top 70% to avoid info overlay */}
          <button
            type="button"
            aria-label="Foto anterior"
            onClick={(e) => { e.stopPropagation(); prevImage(); }}
            className="absolute top-0 left-0 h-[70%] w-2/5 z-10 bg-transparent"
          />
          <button
            type="button"
            aria-label="Próxima foto"
            onClick={(e) => { e.stopPropagation(); nextImage(); }}
            className="absolute top-0 right-0 h-[70%] w-2/5 z-10 bg-transparent"
          />
        </>
      )}
    </div>
  );
};

export default PetImageCarousel;
