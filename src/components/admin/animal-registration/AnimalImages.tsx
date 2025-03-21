
import { Label } from "@/components/ui/label";
import { Upload, X } from "lucide-react";

export interface AnimalImagesProps {
  images: File[];
  previewImages: string[]; 
  onChange: (images: File[], previews: string[]) => void;
}

const AnimalImages = ({ 
  images, 
  previewImages, 
  onChange 
}: AnimalImagesProps) => {
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      const maxSelection = 5 - images.length;
      const newImages = selectedFiles.slice(0, maxSelection);
      
      const newImagePreviews = newImages.map(file => URL.createObjectURL(file));
      
      onChange([...images, ...newImages], [...previewImages, ...newImagePreviews]);
    }
  };

  const removeImage = (index: number) => {
    const updatedImages = [...images];
    const updatedPreviews = [...previewImages];
    
    // Remove image URL from memory to prevent memory leaks
    URL.revokeObjectURL(previewImages[index]);
    
    updatedImages.splice(index, 1);
    updatedPreviews.splice(index, 1);
    
    onChange(updatedImages, updatedPreviews);
  };
  
  return (
    <div className="space-y-4">
      <Label>Fotos do Animal*</Label>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {previewImages.map((url, index) => (
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
        
        {previewImages.length < 5 && (
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
