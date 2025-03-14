
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

// Mock data for the pet details
const mockPets = [
  {
    id: "1",
    name: "Luna",
    type: "Gato",
    breed: "Siamês",
    age: "2 anos",
    gender: "Fêmea",
    size: "Médio",
    description: "Luna é uma gata siamesa muito dócil e carinhosa. Adora brincar com bolinhas e dormir no colo. Já está castrada e com todas as vacinas em dia.",
    images: [
      "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1027&q=80",
      "https://images.unsplash.com/photo-1573865526739-10659fec78a5?ixlib=rb-1.2.1&auto=format&fit=crop&w=830&q=80",
      "https://images.unsplash.com/photo-1513360371669-4adf3dd7dff8?ixlib=rb-1.2.1&auto=format&fit=crop&w=1170&q=80"
    ],
    location: "ONG Amigos dos Animais - São Paulo, SP",
    distance: "5 km",
    characteristics: ["Dócil", "Castrada", "Vacinada", "Indoor"],
    medicalInfo: "Castrada e vacinada. Testada negativo para FIV e FeLV.",
    requirements: ["Tela nas janelas", "Ambiente calmo", "Sem outros gatos"],
    adoptionProcess: "Entrevista, visita ao lar e assinatura de termo de adoção responsável."
  },
  {
    id: "2",
    name: "Max",
    type: "Cachorro",
    breed: "Labrador",
    age: "3 anos",
    gender: "Macho",
    size: "Grande",
    description: "Max é um labrador muito brincalhão e amoroso. Adora correr e brincar ao ar livre. Já está castrado e com todas as vacinas em dia.",
    images: [
      "https://images.unsplash.com/photo-1543466835-00a7907e9de1?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1074&q=80",
      "https://images.unsplash.com/photo-1587300003388-59208cc962cb?ixlib=rb-1.2.1&auto=format&fit=crop&w=1170&q=80",
      "https://images.unsplash.com/photo-1598133894008-61f7fdb8cc3a?ixlib=rb-1.2.1&auto=format&fit=crop&w=776&q=80"
    ],
    location: "ONG Patinhas Carentes - São Paulo, SP",
    distance: "12 km",
    characteristics: ["Brincalhão", "Castrado", "Vacinado", "Adora crianças"],
    medicalInfo: "Castrado e vacinado. Tratado para vermes recentemente.",
    requirements: ["Espaço para brincar", "Passeios diários", "Lar sem gatos"],
    adoptionProcess: "Entrevista, visita ao lar e assinatura de termo de adoção responsável. Taxa de adoção de R$100 para cobrir custos médicos."
  }
];

const PetDetails = () => {
  const { id } = useParams();
  const [pet, setPet] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Simulating API call to get pet details
    setTimeout(() => {
      const foundPet = mockPets.find(pet => pet.id === id);
      if (foundPet) {
        setPet(foundPet);
      }
      setLoading(false);
    }, 500);
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
            type={pet.type}
            breed={pet.breed}
            age={pet.age}
          />
          
          <PetDescription 
            description={pet.description}
            location={pet.location}
            distance={pet.distance}
          />
          
          <PetCharacteristics characteristics={pet.characteristics} />
          
          <PetMedicalInfo medicalInfo={pet.medicalInfo} />
          
          <PetRequirements requirements={pet.requirements} />
          
          <PetAdoptionProcess 
            id={pet.id}
            adoptionProcess={pet.adoptionProcess}
          />
        </div>
      </div>
    </div>
  );
};

export default PetDetails;
