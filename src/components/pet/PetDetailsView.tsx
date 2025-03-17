
import React, { useState, useEffect } from 'react';
import { X, Heart, Info, MapPin, Clock, Paw, Calendar, Ruler, Weight, Star, DollarSign } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { PetInfo } from './types';

interface PetDetailsViewProps {
  pet: PetInfo;
  onClose: () => void;
}

const PetDetailsView = ({ pet, onClose }: PetDetailsViewProps) => {
  const [costEstimate, setCostEstimate] = useState<{
    monthlyTotal: number;
    yearlyTotal: number;
  } | null>(null);
  
  // Calculate cost estimate when pet details change
  useEffect(() => {
    // Basic calculation based on type, age, size
    const calculateCostEstimate = () => {
      let monthlyFood = 0;
      let monthlyMedical = 0;
      
      // Food cost based on size
      if (pet.size === 'small') {
        monthlyFood = pet.type === 'dog' ? 120 : 100;
      } else if (pet.size === 'medium') {
        monthlyFood = pet.type === 'dog' ? 220 : 150;
      } else {
        monthlyFood = pet.type === 'dog' ? 320 : 200;
      }
      
      // Medical costs based on age
      if (pet.age < 1) {
        monthlyMedical = 100; // Puppies/kittens need more care
      } else if (pet.age > 7) {
        monthlyMedical = 150; // Senior pets need more care
      } else {
        monthlyMedical = 80; // Adult pets
      }
      
      // Apply adjustments for special conditions
      if (pet.specialNeeds || pet.healthIssues) {
        monthlyMedical += 100;
      }
      
      const monthlyTotal = monthlyFood + monthlyMedical;
      const yearlyTotal = monthlyTotal * 12;
      
      setCostEstimate({ monthlyTotal, yearlyTotal });
    };
    
    calculateCostEstimate();
  }, [pet]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="absolute inset-0 bg-background z-10 overflow-y-auto"
    >
      <div className="p-4 h-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{pet.name}</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="flex items-center text-sm">
            <MapPin className="h-4 w-4 mr-1 text-primary" />
            <span>{pet.location}</span>
          </div>
          <div className="flex items-center text-sm">
            <Clock className="h-4 w-4 mr-1 text-primary" />
            <span>No abrigo há {pet.shelterTime}</span>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 mb-4">
          <Badge variant="secondary" className="flex items-center gap-1">
            <Paw className="h-3 w-3" />
            {pet.type}
          </Badge>
          <Badge variant="secondary" className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {pet.age} {pet.age === 1 ? 'ano' : 'anos'}
          </Badge>
          <Badge variant="secondary" className="flex items-center gap-1">
            <Ruler className="h-3 w-3" />
            {pet.size === 'small' ? 'Pequeno' : pet.size === 'medium' ? 'Médio' : 'Grande'}
          </Badge>
          <Badge variant="secondary" className="flex items-center gap-1">
            <Weight className="h-3 w-3" />
            {pet.weight} kg
          </Badge>
        </div>
        
        <Separator className="my-4" />
        
        <div className="mb-4">
          <h3 className="font-semibold mb-2 flex items-center">
            <Info className="h-4 w-4 mr-1 text-primary" />
            Sobre {pet.name}
          </h3>
          <p className="text-sm text-muted-foreground">{pet.description}</p>
        </div>
        
        {pet.personality && (
          <div className="mb-4">
            <h3 className="font-semibold mb-2 flex items-center">
              <Star className="h-4 w-4 mr-1 text-primary" />
              Personalidade
            </h3>
            <div className="flex flex-wrap gap-2">
              {pet.personality.map((trait, index) => (
                <Badge key={index} variant="outline">
                  {trait}
                </Badge>
              ))}
            </div>
          </div>
        )}
        
        {costEstimate && (
          <div className="mb-4 bg-primary/5 p-3 rounded-md">
            <h3 className="font-semibold mb-2 flex items-center">
              <DollarSign className="h-4 w-4 mr-1 text-primary" />
              Estimativa de Custos
            </h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-muted-foreground">Mensal:</span>
                <p className="font-medium">R$ {costEstimate.monthlyTotal.toFixed(2)}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Anual:</span>
                <p className="font-medium">R$ {costEstimate.yearlyTotal.toFixed(2)}</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              *Estimativa baseada no porte, idade e condição do animal. Valores reais podem variar.
            </p>
          </div>
        )}
        
        <div className="mt-auto pt-4">
          <Button className="w-full flex items-center justify-center" size="lg">
            <Heart className="h-5 w-5 mr-2" />
            Quero Adotar {pet.name}
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default PetDetailsView;
