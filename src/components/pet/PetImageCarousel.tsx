
import { useState } from 'react';

interface PetImageCarouselProps {
  images: string[];
  petName: string;
  onShowDetails: () => void;
}

const PetImageCarousel = ({ images, petName, onShowDetails }: PetImageCarouselProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageError, setImageError] = useState<Record<number, boolean>>({});

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleImageError = (index: number) => {
    setImageError(prev => ({...prev, [index]: true}));
  };

  // Get current image with fallback
  const currentImage = imageError[currentImageIndex] 
    ? '/placeholder.svg'
    : images[currentImageIndex] || '/placeholder.svg';

  return (
    <div className="relative w-full h-full">
      <img 
        src={currentImage} 
        alt={petName}
        className="w-full h-full object-cover"
        onError={() => handleImageError(currentImageIndex)}
      />
      
      {/* Image navigation dots */}
      {images.length > 1 && (
        <div className="absolute top-4 left-0 right-0 flex justify-center space-x-1">
          {images.map((_, index) => (
            <div 
              key={index}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentImageIndex ? 'bg-white w-6' : 'bg-white/50 w-2'
              }`}
              onClick={() => setCurrentImageIndex(index)}
            />
          ))}
        </div>
      )}
      
      {/* Image navigation areas */}
      <div className="absolute inset-y-0 left-0 w-1/3" onClick={(e) => { e.stopPropagation(); prevImage(); }} />
      <div className="absolute inset-y-0 right-0 w-1/3" onClick={(e) => { e.stopPropagation(); nextImage(); }} />
    </div>
  );
};

export default PetImageCarousel;
