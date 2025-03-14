
import { MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface PetDescriptionProps {
  description: string;
  location: string;
  distance: string;
}

const PetDescription = ({ description, location, distance }: PetDescriptionProps) => {
  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <p className="mb-4">{description}</p>
        
        <div className="flex items-center text-sm text-muted-foreground mb-2">
          <MapPin className="h-4 w-4 mr-2" />
          <span>{location}</span>
          <span className="mx-2">•</span>
          <span>{distance}</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default PetDescription;
