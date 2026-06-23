
import { Heart, Badge } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge as UIBadge } from "@/components/ui/badge";

interface PetHeaderProps {
  id: string;
  name: string;
  type: string;
  breed: string;
  age: string;
}

const PetHeader = ({ id, name, type, breed, age }: PetHeaderProps) => {
  const handleLikeClick = () => {
    console.log(`Liked pet with ID: ${id}`);
  };
  
  return (
    <div className="flex justify-between items-start mb-4">
      <div>
        <h1 className="text-3xl font-bold">{name}</h1>
        <div className="flex items-center mt-1 text-muted-foreground">
          <UIBadge variant="outline" className="mr-2">{type}</UIBadge>
          <span className="mr-2">•</span>
          <span>{breed}</span>
          <span className="mx-2">•</span>
          <span>{age}</span>
        </div>
      </div>
      
      <Button onClick={handleLikeClick} size="icon" className="h-10 w-10 rounded-full">
        <Heart className="h-5 w-5" />
      </Button>
    </div>
  );
};

export default PetHeader;
