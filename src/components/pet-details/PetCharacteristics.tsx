
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface PetCharacteristicsProps {
  characteristics: string[];
}

const PetCharacteristics = ({ characteristics }: PetCharacteristicsProps) => {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-lg">Características</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {characteristics.map((trait: string, index: number) => (
            <Badge key={index} variant="secondary">{trait}</Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default PetCharacteristics;
