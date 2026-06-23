
import { Heart } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-sonner";
import AdoptionTermsPDF from "@/components/adoption/AdoptionTermsPDF";
import { useState } from "react";
import { useAuth } from "@/hooks/auth";
import { recordPetMatch } from "@/services/adoptionService";

interface PetAdoptionProcessProps {
  id: string;
  adoptionProcess: string;
}

const PetAdoptionProcess = ({ id, adoptionProcess }: PetAdoptionProcessProps) => {
  const [showPDF, setShowPDF] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user, isAdmin, isAuthenticated } = useAuth();
  
  const handleLikeClick = async () => {
    try {
      setIsSubmitting(true);
      
      // Se não estiver autenticado, mostrar aviso
      if (!isAuthenticated) {
        toast.error("Você precisa estar logado para demonstrar interesse", {
          description: "Faça login para continuar com o processo de adoção."
        });
        return;
      }
      
      // Registrar interesse mesmo para usuários admin
      const userId = user?.id || localStorage.getItem("userEmail") || "admin@petmatch.com";
      console.log("Tentando registrar interesse na adoção:", { petId: id, userId });

      const success = await recordPetMatch(id, userId, 'liked');

      if (success) {
        console.log(`Liked pet with ID: ${id}`);
        setShowPDF(true);
      }
    } catch (error) {
      console.error("Erro ao demonstrar interesse:", error);
      toast.error("Ocorreu um erro ao registrar seu interesse", {
        description: "Por favor, tente novamente mais tarde."
      });
    } finally {
      setIsSubmitting(false);
    }
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
              ngoBankDetails="PIX: 00.000.000/0001-00 (CNPJ)"
              adoptionFee={100}
            />
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleLikeClick} 
          className="w-full"
          disabled={isSubmitting}
        >
          <Heart className="h-5 w-5 mr-2" />
          Quero Adotar
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PetAdoptionProcess;
