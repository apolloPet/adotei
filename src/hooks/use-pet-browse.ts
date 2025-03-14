
import { useState, useEffect } from 'react';
import { Pet } from "@/components/pet/types";

// Mock data - moved from Browse.tsx
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

interface FilterOptions {
  species: string;
  gender: string;
  size: string;
  ageRange: number[];
}

export const usePetBrowse = () => {
  const [pets, setPets] = useState<Pet[]>(MOCK_PETS);
  const [filters, setFilters] = useState<FilterOptions>({
    species: 'all',
    gender: 'all',
    size: 'all',
    ageRange: [0, 15],
  });
  const [isLoading, setIsLoading] = useState(false);

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
  };

  const handleSwipe = (direction: 'left' | 'right', petId: string) => {
    console.log(`Swiped ${direction} on pet ${petId}`);
    
    // In a real app, you would send this data to your backend
    if (direction === 'right') {
      // This is a match (like)
      console.log('Match!', petId);
    }
  };

  return {
    pets,
    filters,
    isLoading,
    handleFilterChange,
    applyFilters,
    resetFilters,
    handleSwipe
  };
};
