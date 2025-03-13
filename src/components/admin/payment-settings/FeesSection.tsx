
import { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DollarSign } from "lucide-react";
import { PaymentSettingsType } from '../AdminTabs';

interface FeesSectionProps {
  initialFees: {
    adoptionFee: number;
    ngoPercentage: number;
    platformPercentage: number;
  };
  onFeesChange: (fees: {
    adoptionFee: number;
    ngoPercentage: number;
    platformPercentage: number;
  }) => void;
}

const FeesSection = ({ initialFees, onFeesChange }: FeesSectionProps) => {
  const [adoptionFee, setAdoptionFee] = useState(initialFees.adoptionFee.toString());
  const [ngoPercentage, setNgoPercentage] = useState(initialFees.ngoPercentage.toString());
  const [platformPercentage, setPlatformPercentage] = useState(initialFees.platformPercentage.toString());

  useEffect(() => {
    onFeesChange({
      adoptionFee: parseFloat(adoptionFee) || 0,
      ngoPercentage: parseFloat(ngoPercentage) || 0,
      platformPercentage: parseFloat(platformPercentage) || 0
    });
  }, [adoptionFee, ngoPercentage, platformPercentage, onFeesChange]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="space-y-2">
        <Label htmlFor="adoptionFee">Taxa de Adoção Base (R$)</Label>
        <div className="flex">
          <span className="inline-flex items-center px-3 border border-r-0 border-input rounded-l-md bg-muted text-muted-foreground">R$</span>
          <Input
            id="adoptionFee"
            type="number"
            min="0"
            step="0.01"
            value={adoptionFee}
            onChange={(e) => setAdoptionFee(e.target.value)}
            className="rounded-l-none"
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="ngoPercentage">Porcentagem para ONG (%)</Label>
        <div className="flex">
          <Input
            id="ngoPercentage"
            type="number"
            min="0"
            max="100"
            step="1"
            value={ngoPercentage}
            onChange={(e) => {
              setNgoPercentage(e.target.value);
              // Auto-calculate platform percentage
              const newNgoPercent = parseFloat(e.target.value) || 0;
              setPlatformPercentage((100 - newNgoPercent).toString());
            }}
          />
          <span className="inline-flex items-center px-3 border border-l-0 border-input rounded-r-md bg-muted text-muted-foreground">%</span>
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="platformPercentage">Porcentagem para Plataforma (%)</Label>
        <div className="flex">
          <Input
            id="platformPercentage"
            type="number"
            min="0"
            max="100"
            step="1"
            value={platformPercentage}
            onChange={(e) => {
              setPlatformPercentage(e.target.value);
              // Auto-calculate NGO percentage
              const newPlatformPercent = parseFloat(e.target.value) || 0;
              setNgoPercentage((100 - newPlatformPercent).toString());
            }}
          />
          <span className="inline-flex items-center px-3 border border-l-0 border-input rounded-r-md bg-muted text-muted-foreground">%</span>
        </div>
      </div>
    </div>
  );
};

export default FeesSection;
