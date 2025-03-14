
import { useState } from 'react';

interface PetImageGalleryProps {
  images: string[];
  petName: string;
}

const PetImageGallery = ({ images, petName }: PetImageGalleryProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const nextImage = () => {
    setCurrentImageIndex(prevIndex => 
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };
  
  const prevImage = () => {
    setCurrentImageIndex(prevIndex => 
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };
  
  return (
    <div className="relative rounded-lg overflow-hidden aspect-square bg-muted">
      <img
        src={images[currentImageIndex]}
        alt={`Foto de ${petName}`}
        className="w-full h-full object-cover"
      />
      
      {images.length > 1 && (
        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
          {images.map((_, index) => (
            <button
              key={index}
              className={`w-2 h-2 rounded-full ${
                index === currentImageIndex ? "bg-white" : "bg-white/50"
              }`}
              onClick={() => setCurrentImageIndex(index)}
            />
          ))}
        </div>
      )}
      
      {images.length > 1 && (
        <>
          <button
            onClick={prevImage}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/30 flex items-center justify-center text-white hover:bg-black/50"
          >
            &lt;
          </button>
          <button
            onClick={nextImage}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/30 flex items-center justify-center text-white hover:bg-black/50"
          >
            &gt;
          </button>
        </>
      )}
    </div>
  );
};

export default PetImageGallery;
