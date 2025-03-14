
import { Heart, Stethoscope } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface PetMedicalInfoProps {
  medicalInfo: string;
}

const PetMedicalInfo = ({ medicalInfo }: PetMedicalInfoProps) => {
  return (
    <Card className="mb-6 border-l-4 border-l-pet-primary">
      <CardHeader className="flex flex-row items-center gap-2">
        <Stethoscope className="h-5 w-5 text-pet-primary" />
        <CardTitle className="text-lg">Informações Médicas</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-foreground/90">{medicalInfo}</p>
      </CardContent>
    </Card>
  );
};

export default PetMedicalInfo;
