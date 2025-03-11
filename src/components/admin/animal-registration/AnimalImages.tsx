
import { Label } from "@/components/ui/label";
import { Upload, X } from "lucide-react";

interface AnimalImagesProps {
  images: File[];
  imagePreviewUrls: string[];
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  removeImage: (index: number) => void;
}

const AnimalImages = ({ 
  images, 
  imagePreviewUrls, 
  handleImageUpload, 
  removeImage 
}: AnimalImagesProps) => {
  return (
    <div className="space-y-4">
      <Label>Fotos do Animal*</Label>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {imagePreviewUrls.map((url, index) => (
          <div key={index} className="relative aspect-square bg-muted rounded-md overflow-hidden">
            <img 
              src={url} 
              alt={`Preview ${index}`} 
              className="w-full h-full object-cover"
            />
            <button
              type="button"
              onClick={() => removeImage(index)}
              className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1 hover:bg-black/70"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
        
        {imagePreviewUrls.length < 5 && (
          <label className="aspect-square border-2 border-dashed rounded-md border-input flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50">
            <Upload className="h-8 w-8 mb-2 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Upload</span>
            <input
              type="file"
              className="hidden"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
            />
          </label>
        )}
      </div>
      <p className="text-sm text-muted-foreground">
        Adicione até 5 fotos. A primeira será a foto principal.
      </p>
    </div>
  );
};

export default AnimalImages;
