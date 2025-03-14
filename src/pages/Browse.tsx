import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, RefreshCw } from 'lucide-react';
import Header from "@/components/Header";
import PetCard from "@/components/PetCard";
import { Pet } from "@/components/pet/types";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";

// Mock data for demonstration
const MOCK_PETS: Pet[] = [
  {
    id: "1",
    name: "Luna",
    images: [
      "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?ixlib=rb-1.2.1&auto=format&fit=crop&w=1027&q=80",
      "https://images.unsplash.com/photo-1573865526739-10659fec78a5?ixlib=rb-1.2.1&auto=format&fit=crop&w=1015&q=80"
    ],
    age: "2 anos",
    gender: "female",
    size: "small",
    breed: "Vira-lata",
    species: "cat",
    description: "Luna é uma gatinha carinhosa e brincalhona que adora se aconchegar no colo. Ela foi resgatada das ruas e está ansiosa para encontrar uma família que a ame para sempre.",
    location: "São Paulo, SP",
    shelter: "Abrigo Amigos dos Animais",
    traits: ["Carinhosa", "Brincalhona", "Sociável", "Independente"]
  },
  {
    id: "2",
    name: "Max",
    images: [
      "https://images.unsplash.com/photo-1543466835-00a7907e9de1?ixlib=rb-1.2.1&auto=format&fit=crop&w=1074&q=80",
      "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1169&q=80"
    ],
    age: "3 anos",
    gender: "male",
    size: "medium",
    breed: "Labrador",
    species: "dog",
    description: "Max é um labrador cheio de energia e muito amigável. Ele adora correr, brincar com bolas e é ótimo com crianças. Será um companheiro leal para toda a família.",
    location: "Rio de Janeiro, RJ",
    shelter: "Patinhas Carentes",
    traits: ["Energético", "Amigável", "Leal", "Brincalhão"]
  },
  {
    id: "3",
    name: "Bella",
    images: [
      "https://images.unsplash.com/photo-1574144113084-b6f450cc5e0b?ixlib=rb-1.2.1&auto=format&fit=crop&w=764&q=80",
      "https://images.unsplash.com/photo-1543466835-00a7907e9de1?ixlib=rb-1.2.1&auto=format&fit=crop&w=1074&q=80"
    ],
    age: "1 ano",
    gender: "female",
    size: "small",
    breed: "Vira-lata",
    species: "cat",
    description: "Bella é uma gatinha tímida, mas muito afetuosa quando se sente segura. Ela adora lugares quietos e ama brincar com bolinhas. Será uma companheira tranquila.",
    location: "Curitiba, PR",
    shelter: "Gatinhos Felizes",
    traits: ["Tímida", "Afetuosa", "Tranquila", "Curiosa"]
  },
  {
    id: "4",
    name: "Thor",
    images: [
      "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1169&q=80",
      "https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?ixlib=rb-1.2.1&auto=format&fit=crop&w=1170&q=80"
    ],
    age: "4 anos",
    gender: "male",
    size: "large",
    breed: "Pastor Alemão",
    species: "dog",
    description: "Thor é um pastor alemão nobre e inteligente. Ele é extremamente leal, aprende comandos rapidamente e adoraria uma família ativa. Excelente como cão de guarda.",
    location: "Belo Horizonte, MG",
    shelter: "Anjos de Patas",
    traits: ["Inteligente", "Protetor", "Leal", "Treinável"]
  },
  {
    id: "5",
    name: "Nina",
    images: [
      "https://images.unsplash.com/photo-1548802673-380ab8ebc7b7?ixlib=rb-1.2.1&auto=format&fit=crop&w=1035&q=80",
      "https://images.unsplash.com/photo-1573865526739-10659fec78a5?ixlib=rb-1.2.1&auto=format&fit=crop&w=1015&q=80"
    ],
    age: "2 anos",
    gender: "female",
    size: "medium",
    breed: "Border Collie",
    species: "dog",
    description: "Nina é uma border collie extremamente inteligente e energética. Ela adora aprender truques novos e precisa de atividades mentais e físicas. Perfeita para uma família ativa.",
    location: "Porto Alegre, RS",
    shelter: "Cães Felizes",
    traits: ["Inteligente", "Energética", "Ágil", "Brincalhona"]
  },
  {
    id: "6",
    name: "Simba",
    images: [
      "https://images.unsplash.com/photo-1533738363-b7f9aef128ce?ixlib=rb-1.2.1&auto=format&fit=crop&w=1035&q=80",
      "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?ixlib=rb-1.2.1&auto=format&fit=crop&w=1027&q=80"
    ],
    age: "3 anos",
    gender: "male",
    size: "medium",
    breed: "Persa",
    species: "cat",
    description: "Simba é um gato persa majestoso com uma personalidade calma e afetuosa. Ele adora relaxar no sofá e receber carinho. Um companheiro perfeito para momentos tranquilos.",
    location: "Brasília, DF",
    shelter: "Bigodes Felizes",
    traits: ["Calmo", "Afetuoso", "Preguiçoso", "Elegante"]
  },
];

const Browse = () => {
  const [currentPetIndex, setCurrentPetIndex] = useState(0);
  const [pets, setPets] = useState<Pet[]>(MOCK_PETS);
  const [filters, setFilters] = useState({
    species: 'all',
    gender: 'all',
    size: 'all',
    ageRange: [0, 15],
  });
  const [isLoading, setIsLoading] = useState(false);
  
  const currentPet = pets[currentPetIndex];

  const handleSwipe = (direction: 'left' | 'right', petId: string) => {
    console.log(`Swiped ${direction} on pet ${petId}`);
    
    // In a real app, you would send this data to your backend
    if (direction === 'right') {
      // This is a match (like)
      console.log('Match!', petId);
    }
    
    // Move to the next pet
    if (currentPetIndex < pets.length - 1) {
      setTimeout(() => {
        setCurrentPetIndex(currentPetIndex + 1);
      }, 300);
    } else {
      // No more pets to show
      console.log('No more pets to show');
    }
  };

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const applyFilters = () => {
    setIsLoading(true);
    
    // In a real app, you would fetch filtered data from your backend
    // For now, we'll simulate filtering on the client side
    setTimeout(() => {
      const filtered = MOCK_PETS.filter(pet => {
        if (filters.species !== 'all' && pet.species !== filters.species) {
          return false;
        }
        
        if (filters.gender !== 'all' && pet.gender !== filters.gender) {
          return false;
        }
        
        if (filters.size !== 'all' && pet.size !== filters.size) {
          return false;
        }
        
        const age = parseInt(pet.age.split(' ')[0]);
        if (age < filters.ageRange[0] || age > filters.ageRange[1]) {
          return false;
        }
        
        return true;
      });
      
      setPets(filtered);
      setCurrentPetIndex(0);
      setIsLoading(false);
    }, 1000);
  };

  const resetFilters = () => {
    setFilters({
      species: 'all',
      gender: 'all',
      size: 'all',
      ageRange: [0, 15],
    });
    
    setPets(MOCK_PETS);
    setCurrentPetIndex(0);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 pt-32 pb-20">
        <div className="max-w-md mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold">Encontre seu Match</h1>
            
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="rounded-full h-10 w-10 p-0">
                  <Filter className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Filtros</SheetTitle>
                  <SheetDescription>
                    Personalize sua busca para encontrar o pet ideal
                  </SheetDescription>
                </SheetHeader>
                
                <div className="py-6 space-y-6">
                  <div className="space-y-3">
                    <Label className="text-base">Tipo de Animal</Label>
                    <RadioGroup 
                      value={filters.species} 
                      onValueChange={value => handleFilterChange('species', value)}
                      className="flex flex-col space-y-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="all" id="all-species" />
                        <Label htmlFor="all-species">Todos</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="dog" id="dog" />
                        <Label htmlFor="dog">Cachorro</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="cat" id="cat" />
                        <Label htmlFor="cat">Gato</Label>
                      </div>
                    </RadioGroup>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-3">
                    <Label className="text-base">Gênero</Label>
                    <RadioGroup 
                      value={filters.gender} 
                      onValueChange={value => handleFilterChange('gender', value)}
                      className="flex flex-col space-y-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="all" id="all-gender" />
                        <Label htmlFor="all-gender">Todos</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="male" id="male" />
                        <Label htmlFor="male">Macho</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="female" id="female" />
                        <Label htmlFor="female">Fêmea</Label>
                      </div>
                    </RadioGroup>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-3">
                    <Label className="text-base">Porte</Label>
                    <RadioGroup 
                      value={filters.size} 
                      onValueChange={value => handleFilterChange('size', value)}
                      className="flex flex-col space-y-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="all" id="all-size" />
                        <Label htmlFor="all-size">Todos</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="small" id="small" />
                        <Label htmlFor="small">Pequeno</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="medium" id="medium" />
                        <Label htmlFor="medium">Médio</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="large" id="large" />
                        <Label htmlFor="large">Grande</Label>
                      </div>
                    </RadioGroup>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <Label className="text-base">Idade (anos)</Label>
                      <span className="text-sm text-muted-foreground">
                        {filters.ageRange[0]} - {filters.ageRange[1]}
                      </span>
                    </div>
                    <Slider
                      defaultValue={filters.ageRange}
                      min={0}
                      max={15}
                      step={1}
                      onValueChange={value => handleFilterChange('ageRange', value)}
                      className="py-4"
                    />
                  </div>
                </div>
                
                <div className="flex flex-col gap-3 mt-6">
                  <Button onClick={applyFilters}>
                    {isLoading ? (
                      <span className="flex items-center">
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Aplicando...
                      </span>
                    ) : (
                      'Aplicar Filtros'
                    )}
                  </Button>
                  <Button variant="outline" onClick={resetFilters}>
                    Limpar Filtros
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
          
          {pets.length === 0 ? (
            <div className="text-center py-16">
              <h2 className="text-xl font-semibold mb-2">Nenhum pet encontrado</h2>
              <p className="text-muted-foreground mb-6">
                Tente ajustar seus filtros para ver mais opções.
              </p>
              <Button onClick={resetFilters}>
                Limpar Filtros
              </Button>
            </div>
          ) : currentPetIndex >= pets.length ? (
            <div className="text-center py-16">
              <h2 className="text-xl font-semibold mb-2">Não há mais pets para mostrar</h2>
              <p className="text-muted-foreground mb-6">
                Você viu todos os pets disponíveis com esses filtros.
              </p>
              <Button onClick={resetFilters}>
                Recomeçar
              </Button>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={currentPet.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <PetCard pet={currentPet} onSwipe={handleSwipe} />
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </main>
    </div>
  );
};

export default Browse;
