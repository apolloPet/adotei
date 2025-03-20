
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface HealthInfoProps {
  formData: {
    healthConditions: string[];
  };
  onToggleCondition: (field: string, value: string) => void;
}

const HealthInfo = ({ formData, onToggleCondition }: HealthInfoProps) => {
  const healthConditions = [
    { id: 'allergies', label: 'Alergias' },
    { id: 'arthritis', label: 'Artrite' },
    { id: 'dental', label: 'Problemas Dentários' },
    { id: 'diabetes', label: 'Diabetes' },
    { id: 'heart', label: 'Problemas Cardíacos' },
    { id: 'kidney', label: 'Problemas Renais' },
    { id: 'obesity', label: 'Obesidade' },
    { id: 'thyroid', label: 'Problemas de Tireoide' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-4">Condições de Saúde</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {healthConditions.map((condition) => (
            <div className="flex items-center space-x-2" key={condition.id}>
              <Checkbox
                id={condition.id}
                checked={formData.healthConditions.includes(condition.id)}
                onCheckedChange={() =>
                  onToggleCondition('healthConditions', condition.id)
                }
              />
              <Label htmlFor={condition.id}>{condition.label}</Label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HealthInfo;
