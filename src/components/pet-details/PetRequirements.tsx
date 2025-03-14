
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface PetRequirementsProps {
  requirements: string[];
}

const PetRequirements = ({ requirements }: PetRequirementsProps) => {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-lg">Requisitos para Adoção</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="list-disc pl-5 space-y-1">
          {requirements.map((req: string, index: number) => (
            <li key={index}>{req}</li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};

export default PetRequirements;
