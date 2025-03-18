
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from "lucide-react";
import PetImageGallery from "@/components/pet-details/PetImageGallery";
import PetHeader from "@/components/pet-details/PetHeader";
import PetDescription from "@/components/pet-details/PetDescription";
import PetCharacteristics from "@/components/pet-details/PetCharacteristics";
import PetMedicalInfo from "@/components/pet-details/PetMedicalInfo";
import PetRequirements from "@/components/pet-details/PetRequirements";
import PetAdoptionProcess from "@/components/pet-details/PetAdoptionProcess";
import PetNotFound from "@/components/pet-details/PetNotFound";
import PetLoading from "@/components/pet-details/PetLoading";
import { fetchPetById } from '@/services/petService';
import { Pet } from '@/components/pet/types';

const PetDetails = () => {
  const { id } = useParams();
  const [pet, setPet] = useState<Pet | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const loadPet = async () => {
      if (id) {
        try {
          const petData = await fetchPetById(id);
          setPet(petData);
        } catch (error) {
          console.error('Error fetching pet:', error);
        } finally {
          setLoading(false);
        }
      }
    };
    
    loadPet();
  }, [id]);
  
  if (loading) {
    return <PetLoading />;
  }
  
  if (!pet) {
    return <PetNotFound />;
  }
  
  return (
    <div className="container mx-auto p-4 pb-16">
      <div className="mb-4">
        <Link to="/browse" className="inline-flex items-center text-primary hover:underline">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Voltar para a busca
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Image gallery */}
        <PetImageGallery 
          images={pet.images} 
          petName={pet.name} 
        />
        
        {/* Pet details */}
        <div>
          <PetHeader 
            id={pet.id}
            name={pet.name}
            type={pet.species === 'dog' ? 'Cachorro' : pet.species === 'cat' ? 'Gato' : 'Outro'}
            breed={pet.breed}
            age={pet.age}
          />
          
          <PetDescription 
            description={pet.description}
            location={pet.location}
            distance="Distância não disponível"
          />
          
          <PetCharacteristics characteristics={pet.traits || []} />
          
          <PetMedicalInfo medicalInfo={pet.specialNeeds ? "Necessidades especiais" : "Sem necessidades especiais"} />
          
          <PetRequirements requirements={["Ambiente adequado", "Carinho e atenção", "Compromisso com o bem-estar animal"]} />
          
          <PetAdoptionProcess 
            id={pet.id}
            adoptionProcess="Entre em contato para iniciar o processo de adoção"
          />
        </div>
      </div>
    </div>
  );
};

export default PetDetails;
