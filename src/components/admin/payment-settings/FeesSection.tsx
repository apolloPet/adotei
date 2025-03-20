
import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

interface FeesProps {
  adoptionFee: number;
  enableAdoptionFee: boolean;
}

interface FeesSectionProps {
  initialFees: FeesProps;
  onFeesChange: (fees: FeesProps) => void;
}

const FeesSection = ({ initialFees, onFeesChange }: FeesSectionProps) => {
  const [adoptionFee, setAdoptionFee] = useState(initialFees.adoptionFee);
  const [enableAdoptionFee, setEnableAdoptionFee] = useState(initialFees.enableAdoptionFee);

  // Update parent component when values change
  useEffect(() => {
    onFeesChange({
      adoptionFee,
      enableAdoptionFee
    });
  }, [adoptionFee, enableAdoptionFee, onFeesChange]);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Taxas de Adoção</h3>
      
      <div className="flex items-center space-x-2">
        <Switch
          id="enableFee"
          checked={enableAdoptionFee}
          onCheckedChange={setEnableAdoptionFee}
        />
        <Label htmlFor="enableFee">Cobrar Taxa de Adoção</Label>
      </div>
      
      {enableAdoptionFee && (
        <div className="space-y-2">
          <Label htmlFor="adoptionFee">Valor da Taxa de Adoção (R$)</Label>
          <Input
            id="adoptionFee"
            type="number"
            min="0"
            step="5"
            value={adoptionFee}
            onChange={(e) => setAdoptionFee(Number(e.target.value))}
            placeholder="0.00"
          />
          <p className="text-sm text-muted-foreground">
            Esta taxa será cobrada durante o processo de adoção para ajudar a cobrir custos operacionais.
          </p>
        </div>
      )}
    </div>
  );
};

export default FeesSection;
