
import { Heart } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-sonner";
import AdoptionTermsPDF from "@/components/adoption/AdoptionTermsPDF";
import { useState } from "react";

interface PetAdoptionProcessProps {
  id: string;
  adoptionProcess: string;
}

const PetAdoptionProcess = ({ id, adoptionProcess }: PetAdoptionProcessProps) => {
  const [showPDF, setShowPDF] = useState(false);
  
  const handleLikeClick = () => {
    toast.success("Você demonstrou interesse neste pet!", {
      description: "A ONG será notificada e entrará em contato."
    });
    
    console.log(`Liked pet with ID: ${id}`);
    setShowPDF(true);
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Processo de Adoção</CardTitle>
      </CardHeader>
      <CardContent>
        <p>{adoptionProcess}</p>
        
        {showPDF && (
          <div className="mt-4 p-4 border rounded bg-muted/30">
            <p className="mb-2 text-sm">Baixe o termo de responsabilidade para adoção:</p>
            <AdoptionTermsPDF 
              petName={`Pet #${id}`}
              adopterName="Usuário"
              adopterDocument="000.000.000-00"
              adopterAddress="Endereço do adotante"
              followUpPeriod={90}
              adoptionDate={new Date()}
              petType="animal de estimação"
              contractText="Eu, adotante, me comprometo a cuidar do animal adotado, fornecendo abrigo, alimentação adequada, cuidados veterinários e carinho."
            />
          </div>
        )}
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
