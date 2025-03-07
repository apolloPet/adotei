
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, ArrowLeft, MapPin, Calendar, Activity, AlertCircle } from "lucide-react";
import { toast } from "@/hooks/use-sonner";

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
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
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
  
  const handleLikeClick = () => {
    toast.success("Você demonstrou interesse neste pet!", {
      description: "A ONG será notificada e entrará em contato."
    });
    
    console.log(`Liked pet with ID: ${id}`);
  };
  
  if (loading) {
    return (
      <div className="container mx-auto p-4 flex justify-center items-center min-h-[50vh]">
        <p className="text-lg">Carregando detalhes do pet...</p>
      </div>
    );
  }
  
  if (!pet) {
    return (
      <div className="container mx-auto p-4 flex flex-col items-center justify-center min-h-[50vh]">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h2 className="text-2xl font-bold mb-2">Pet não encontrado</h2>
        <p className="text-muted-foreground mb-6">O pet que você está procurando não existe ou foi removido.</p>
        <Link to="/browse">
          <Button>Ver outros pets disponíveis</Button>
        </Link>
      </div>
    );
  }
  
  const nextImage = () => {
    setCurrentImageIndex(prevIndex => 
      prevIndex === pet.images.length - 1 ? 0 : prevIndex + 1
    );
  };
  
  const prevImage = () => {
    setCurrentImageIndex(prevIndex => 
      prevIndex === 0 ? pet.images.length - 1 : prevIndex - 1
    );
  };
  
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
        <div className="relative rounded-lg overflow-hidden aspect-square bg-muted">
          <img
            src={pet.images[currentImageIndex]}
            alt={`Foto de ${pet.name}`}
            className="w-full h-full object-cover"
          />
          
          {pet.images.length > 1 && (
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
              {pet.images.map((_, index) => (
                <button
                  key={index}
                  className={`w-2 h-2 rounded-full ${
                    index === currentImageIndex ? "bg-white" : "bg-white/50"
                  }`}
                  onClick={() => setCurrentImageIndex(index)}
                />
              ))}
            </div>
          )}
          
          {pet.images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/30 flex items-center justify-center text-white hover:bg-black/50"
              >
                &lt;
              </button>
              <button
                onClick={nextImage}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/30 flex items-center justify-center text-white hover:bg-black/50"
              >
                &gt;
              </button>
            </>
          )}
        </div>
        
        {/* Pet details */}
        <div>
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold">{pet.name}</h1>
              <div className="flex items-center mt-1 text-muted-foreground">
                <Badge variant="outline" className="mr-2">{pet.type}</Badge>
                <span className="mr-2">•</span>
                <span>{pet.breed}</span>
                <span className="mx-2">•</span>
                <span>{pet.age}</span>
              </div>
            </div>
            
            <Button onClick={handleLikeClick} size="icon" className="h-10 w-10 rounded-full">
              <Heart className="h-5 w-5" />
            </Button>
          </div>
          
          <Card className="mb-6">
            <CardContent className="pt-6">
              <p className="mb-4">{pet.description}</p>
              
              <div className="flex items-center text-sm text-muted-foreground mb-2">
                <MapPin className="h-4 w-4 mr-2" />
                <span>{pet.location}</span>
                <span className="mx-2">•</span>
                <span>{pet.distance}</span>
              </div>
            </CardContent>
          </Card>
          
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Características</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {pet.characteristics.map((trait: string, index: number) => (
                  <Badge key={index} variant="secondary">{trait}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Informações Médicas</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{pet.medicalInfo}</p>
            </CardContent>
          </Card>
          
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Requisitos para Adoção</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-5 space-y-1">
                {pet.requirements.map((req: string, index: number) => (
                  <li key={index}>{req}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Processo de Adoção</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{pet.adoptionProcess}</p>
            </CardContent>
            <CardFooter>
              <Button onClick={handleLikeClick} className="w-full">
                <Heart className="h-5 w-5 mr-2" />
                Quero Adotar
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PetDetails;
