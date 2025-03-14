
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface PetMedicalInfoProps {
  medicalInfo: string;
}

const PetMedicalInfo = ({ medicalInfo }: PetMedicalInfoProps) => {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-lg">Informações Médicas</CardTitle>
      </CardHeader>
      <CardContent>
        <p>{medicalInfo}</p>
      </CardContent>
    </Card>
  );
};

export default PetMedicalInfo;
