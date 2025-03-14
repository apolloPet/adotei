
import { ClipboardCheck } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface PetRequirementsProps {
  requirements: string[];
  userProfile?: {
    housingType: string;
    hasChildren: boolean;
    hadPetsBefore: boolean;
    workSchedule: string;
  };
}

const PetRequirements = ({ requirements, userProfile }: PetRequirementsProps) => {
  // Function to check if a requirement is compatible with user profile
  const getCompatibility = (requirement: string) => {
    if (!userProfile) return null;
    
    // This is a simplified example - in a real app, you'd have more sophisticated matching logic
    const lowerReq = requirement.toLowerCase();
    
    if (lowerReq.includes('sem outros animais') && userProfile.hadPetsBefore) {
      return { compatible: false, reason: 'Você já possui outros animais' };
    }
    
    if (lowerReq.includes('ambiente calmo') && userProfile.hasChildren) {
      return { compatible: false, reason: 'Presença de crianças pode deixar o ambiente agitado' };
    }
    
    if (lowerReq.includes('passeios diários') && userProfile.workSchedule.includes('integral')) {
      return { compatible: false, reason: 'Seu horário de trabalho pode dificultar passeios diários' };
    }
    
    if (lowerReq.includes('tela nas janelas') && userProfile.housingType === 'house') {
      return { compatible: true, reason: 'Compatível com sua casa' };
    }
    
    return { compatible: true, reason: 'Compatível com seu perfil' };
  };

  return (
    <Card className="mb-6 border-l-4 border-l-[#9b87f5]">
      <CardHeader className="flex flex-row items-center gap-2">
        <ClipboardCheck className="h-5 w-5 text-[#9b87f5]" />
        <CardTitle className="text-lg">Requisitos para Adoção</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {requirements.map((req: string, index: number) => {
            const compatibility = userProfile ? getCompatibility(req) : null;
            
            return (
              <li key={index} className="flex items-start">
                <span className="mr-2">•</span>
                <div>
                  <span>{req}</span>
                  
                  {compatibility && (
                    <div className={`text-sm mt-1 ${compatibility.compatible ? 'text-green-600' : 'text-amber-600'}`}>
                      {compatibility.reason}
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
};

export default PetRequirements;
