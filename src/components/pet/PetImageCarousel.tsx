import { useState, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PetImageCarouselProps {
  images: string[];
  petName: string;
  onShowDetails: () => void;
}

const PetImageCarousel = ({ images, petName }: PetImageCarouselProps) => {
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
      className="relative w-full h-full select-none"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <img
        src={currentImage}
        alt={petName}
        className="w-full h-full object-cover"
        onError={() => handleImageError(currentImageIndex)}
        draggable={false}
      />

      {images.length > 1 && (
        <>
          <div className="absolute top-3 left-0 right-0 flex justify-center gap-1 z-10">
            {images.map((_, index) => (
              <div
                key={index}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  index === currentImageIndex ? 'bg-white w-6' : 'bg-white/50 w-2'
                }`}
                onClick={() => setCurrentImageIndex(index)}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); prevImage(); }}
            aria-label="Foto anterior"
            className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/70 hover:bg-white text-foreground backdrop-blur-sm shadow-md flex items-center justify-center transition-all opacity-80 hover:opacity-100 z-10"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); nextImage(); }}
            aria-label="Próxima foto"
            className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/70 hover:bg-white text-foreground backdrop-blur-sm shadow-md flex items-center justify-center transition-all opacity-80 hover:opacity-100 z-10"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          {/* Tap zones for mobile (behind buttons) */}
          <div className="absolute inset-y-0 left-0 w-1/3" onClick={(e) => { e.stopPropagation(); prevImage(); }} />
          <div className="absolute inset-y-0 right-0 w-1/3" onClick={(e) => { e.stopPropagation(); nextImage(); }} />
        </>
      )}
    </div>
  );
};

export default PetImageCarousel;
