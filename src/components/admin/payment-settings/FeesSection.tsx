
import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { formatCurrency } from "@/lib/utils";

interface FeesProps {
  adoptionFee: number;
  ngoPercentage: number;
  platformPercentage: number;
}

interface FeesSectionProps {
  initialFees: FeesProps;
  onFeesChange: (fees: FeesProps) => void;
}

const FeesSection = ({ initialFees, onFeesChange }: FeesSectionProps) => {
  const [adoptionFee, setAdoptionFee] = useState(initialFees.adoptionFee);
  const [ngoPercentage, setNgoPercentage] = useState(initialFees.ngoPercentage);
  const [platformPercentage, setPlatformPercentage] = useState(initialFees.platformPercentage);

  // Update parent component when values change
  useEffect(() => {
    onFeesChange({
      adoptionFee,
      ngoPercentage,
      platformPercentage
    });
  }, [adoptionFee, ngoPercentage, platformPercentage, onFeesChange]);

  // Handle adoption fee change
  const handleAdoptionFeeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value) && value >= 0) {
      setAdoptionFee(value);
    }
  };

  // Handle NGO percentage change
  const handleNgoPercentageChange = (values: number[]) => {
    const value = values[0];
    setNgoPercentage(value);
    setPlatformPercentage(100 - value);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Taxas e Valores</h3>
      
      <div className="space-y-2">
        <Label htmlFor="adoptionFee">Taxa de Adoção</Label>
        <div className="flex items-center gap-2">
          <Input
            id="adoptionFee"
            type="number"
            value={adoptionFee}
            onChange={handleAdoptionFeeChange}
            min={0}
            className="max-w-[180px]"
          />
          <span className="text-sm text-muted-foreground">
            {formatCurrency(adoptionFee)}
          </span>
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label>Distribuição da Taxa</Label>
          <span className="text-sm text-muted-foreground">
            ONG: {ngoPercentage}% | Plataforma: {platformPercentage}%
          </span>
        </div>
        <Slider
          value={[ngoPercentage]}
          onValueChange={handleNgoPercentageChange}
          min={0}
          max={100}
          step={1}
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>ONG: {formatCurrency((adoptionFee * ngoPercentage) / 100)}</span>
          <span>Plataforma: {formatCurrency((adoptionFee * platformPercentage) / 100)}</span>
        </div>
      </div>
    </div>
  );
};

export default FeesSection;
