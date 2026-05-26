
import { Label } from "@/components/ui/label";
import { Upload, X, AlertCircle, Image as ImageIcon } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export interface AnimalImagesProps {
  images: File[];
  previewImages: string[]; 
  onChange: (images: File[], previews: string[]) => void;
  error?: string;
  isUploading?: boolean;
}

const AnimalImages = ({ 
  images, 
  previewImages, 
  onChange,
  error,
  isUploading = false
}: AnimalImagesProps) => {
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      const maxSelection = 2 - images.length;
      
      // Validate file size and type
      const validFiles = selectedFiles.filter(file => {
        // Check file size (max 5MB)
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
          alert(`O arquivo ${file.name} é muito grande. O tamanho máximo é 5MB.`);
          return false;
        }
        
        // Check file type (only images)
        if (!file.type.startsWith('image/')) {
          alert(`O arquivo ${file.name} não é uma imagem válida.`);
          return false;
        }
        
        return true;
      }).slice(0, maxSelection);
      
      if (validFiles.length === 0) return;
      
      const newImagePreviews = validFiles.map(file => URL.createObjectURL(file));
      
      onChange([...images, ...validFiles], [...previewImages, ...newImagePreviews]);
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
  
  const setAsPrimary = (index: number) => {
    if (index === 0) return; // Already primary
    
    // Move selected image to the first position
    const updatedImages = [...images];
    const updatedPreviews = [...previewImages];
    
    // Save the selected image
    const selectedImage = updatedImages[index];
    const selectedPreview = updatedPreviews[index];
    
    // Remove from current position
    updatedImages.splice(index, 1);
    updatedPreviews.splice(index, 1);
    
    // Insert at the beginning
    updatedImages.unshift(selectedImage);
    updatedPreviews.unshift(selectedPreview);
    
    onChange(updatedImages, updatedPreviews);
  };
  
  return (
    <div className="space-y-4">
      <Label className="flex items-center">
        Fotos do Animal*
        {(previewImages.length === 0 || error) && (
          <AlertCircle className="h-4 w-4 ml-2 text-destructive" />
        )}
      </Label>
      
      {(previewImages.length === 0 || error) && (
        <Alert variant="destructive" className="mb-2">
          <AlertDescription>
            {error || "É necessário adicionar pelo menos uma foto do animal"}
          </AlertDescription>
        </Alert>
      )}
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {previewImages.map((url, index) => (
          <div key={index} className="relative aspect-square bg-muted rounded-md overflow-hidden group">
            <img 
              src={url} 
              alt={`Preview ${index}`} 
              className="w-full h-full object-cover"
            />
            {index === 0 && (
              <div className="absolute top-2 left-2 bg-primary text-white px-2 py-1 text-xs rounded-full">
                Principal
              </div>
            )}
            <div className="absolute top-2 right-2 flex space-x-1">
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="bg-black/50 text-white rounded-full p-1 hover:bg-black/70"
                aria-label="Remover imagem"
                disabled={isUploading}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            {index > 0 && (
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <button
                  type="button"
                  onClick={() => setAsPrimary(index)}
                  className="bg-primary text-white rounded-md px-3 py-1 text-sm"
                  disabled={isUploading}
                >
                  Definir como principal
                </button>
              </div>
            )}
          </div>
        ))}
        
        {previewImages.length < 2 && (
          <label className={`aspect-square border-2 border-dashed rounded-md border-input flex flex-col items-center justify-center ${isUploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-muted/50'}`}>
            {isUploading ? (
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-2"></div>
                <span className="text-sm text-muted-foreground">Enviando...</span>
              </div>
            ) : (
              <>
                <Upload className="h-8 w-8 mb-2 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Upload</span>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  disabled={isUploading}
                />
              </>
            )}
          </label>
        )}
      </div>
      
      {previewImages.length === 0 && !isUploading && (
        <div className="mt-2 p-4 border border-dashed border-muted-foreground rounded-md flex flex-col items-center justify-center">
          <ImageIcon className="h-12 w-12 text-muted-foreground mb-2" />
          <p className="text-sm text-center text-muted-foreground">
            Nenhuma imagem selecionada. Adicione pelo menos uma foto do animal.
          </p>
        </div>
      )}
      
      <div className="space-y-1">
        <p className="text-sm text-muted-foreground">
          Adicione no maximo 2 fotos. A primeira será a foto principal.
        </p>
        <p className="text-xs text-muted-foreground">
          Formatos aceitos: JPG, PNG, GIF. Tamanho máximo: 5MB por arquivo.
        </p>
        <p className="text-xs text-muted-foreground italic">
          Dica: Use fotos com boa iluminação e que mostrem bem o animal.
        </p>
      </div>
    </div>
  );
};

export default AnimalImages;
