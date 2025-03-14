
import { Heart } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-sonner";

interface PetAdoptionProcessProps {
  id: string;
  adoptionProcess: string;
}

const PetAdoptionProcess = ({ id, adoptionProcess }: PetAdoptionProcessProps) => {
  const handleLikeClick = () => {
    toast.success("Você demonstrou interesse neste pet!", {
      description: "A ONG será notificada e entrará em contato."
    });
    
    console.log(`Liked pet with ID: ${id}`);
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Processo de Adoção</CardTitle>
      </CardHeader>
      <CardContent>
        <p>{adoptionProcess}</p>
      </CardContent>
      <CardFooter>
        <Button onClick={handleLikeClick} className="w-full">
          <Heart className="h-5 w-5 mr-2" />
          Quero Adotar
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PetAdoptionProcess;
