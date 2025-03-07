
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Heart, Share2, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-sonner';

// Mock data for a single pet
const mockPet = {
  id: '1',
  name: 'Luna',
  images: [
    'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?ixlib=rb-1.2.1&auto=format&fit=crop&w=1027&q=80',
    'https://images.unsplash.com/photo-1573865526739-10659fec78a5?ixlib=rb-1.2.1&auto=format&fit=crop&w=1015&q=80',
    'https://images.unsplash.com/photo-1511044568932-338cba0ad803?ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80',
  ],
  age: '2 anos',
  gender: 'female',
  size: 'medium',
  breed: 'Siamês',
  species: 'cat',
  description: 'Luna é uma gata dócil e brincalhona que adora receber carinho. Ela é sociável com pessoas e outros animais. Prefere ambientes mais calmos e gosta de se aquecer ao sol.',
  location: 'São Paulo, SP',
  shelter: 'Abrigo Amigos dos Gatos',
  traits: ['Dócil', 'Brincalhona', 'Sociável', 'Castrada', 'Vacinada'],
  healthInfo: 'Castrada, vacinada e com check-up veterinário recente.',
  adoptionRequirements: 'Apartamento telado, comprometimento com castração e visita prévia ao abrigo.',
};

const PetDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [pet, setPet] = useState(mockPet);
  
  // In a real app, this would fetch data from an API
  useEffect(() => {
    // Fetch pet details by ID
    console.log(`Fetching details for pet ID: ${id}`);
    // For now, we'll use mock data
  }, [id]);

  const handleLike = () => {
    toast(`Você deu match com ${pet.name}! 💖`, {
      description: "A ONG será notificada do seu interesse.",
    });
  };

  const handleShare = () => {
    // In a real app, this would open a share dialog
    navigator.clipboard.writeText(window.location.href);
    toast("Link copiado!", { description: "Agora você pode compartilhar este pet." });
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % pet.images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + pet.images.length) % pet.images.length);
  };

  return (
    <div className="container mx-auto max-w-4xl pb-16">
      {/* Back button and actions */}
      <div className="flex items-center justify-between py-4">
        <Link to="/browse" className="flex items-center text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-5 w-5 mr-1" />
          <span>Voltar</span>
        </Link>
        
        <div className="flex space-x-2">
          <Button variant="outline" size="icon" onClick={handleShare}>
            <Share2 className="h-5 w-5" />
          </Button>
          <Button variant="outline" size="icon" className="text-pet-pink" onClick={handleLike}>
            <Heart className="h-5 w-5 fill-pet-pink" />
          </Button>
        </div>
      </div>
      
      {/* Pet images */}
      <div className="relative aspect-[4/3] rounded-2xl overflow-hidden mb-6">
        <img 
          src={pet.images[currentImageIndex]} 
          alt={pet.name} 
          className="w-full h-full object-cover"
        />
        
        {/* Image navigation */}
        <button 
          onClick={prevImage}
          className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white w-10 h-10 rounded-full flex items-center justify-center"
          aria-label="Previous image"
        >
          &lt;
        </button>
        <button 
          onClick={nextImage}
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white w-10 h-10 rounded-full flex items-center justify-center"
          aria-label="Next image"
        >
          &gt;
        </button>
        
        {/* Image indicators */}
        <div className="absolute bottom-3 left-0 right-0 flex justify-center space-x-1">
          {pet.images.map((_, index) => (
            <div 
              key={index}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentImageIndex ? 'bg-white w-6' : 'bg-white/50'
              }`}
              onClick={() => setCurrentImageIndex(index)}
            />
          ))}
        </div>
      </div>
      
      {/* Pet details */}
      <div className="space-y-6">
        <div>
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">{pet.name}</h1>
            <Badge className={`${
              pet.species === 'dog' ? 'bg-pet-blue' : 'bg-pet-pink'
            } text-white border-none px-3 py-1`}>
              {pet.species === 'dog' ? 'Cachorro' : 'Gato'}
            </Badge>
          </div>
          
          <div className="flex items-center mt-1 text-muted-foreground">
            <MapPin className="h-4 w-4 mr-1" />
            <span>{pet.location}</span>
          </div>
          
          <div className="flex flex-wrap gap-2 mt-4">
            <Badge variant="outline">{pet.age}</Badge>
            <Badge variant="outline">{pet.gender === 'male' ? 'Macho' : 'Fêmea'}</Badge>
            <Badge variant="outline">
              {pet.size === 'small' ? 'Pequeno' : pet.size === 'medium' ? 'Médio' : 'Grande'}
            </Badge>
            <Badge variant="outline">{pet.breed}</Badge>
          </div>
        </div>
        
        <Separator />
        
        <Tabs defaultValue="about">
          <TabsList className="grid grid-cols-3 mb-6">
            <TabsTrigger value="about">Sobre</TabsTrigger>
            <TabsTrigger value="health">Saúde</TabsTrigger>
            <TabsTrigger value="requirements">Requisitos</TabsTrigger>
          </TabsList>
          
          <TabsContent value="about" className="space-y-4">
            <div>
              <h3 className="text-lg font-medium mb-2">Sobre {pet.name}</h3>
              <p className="text-muted-foreground">{pet.description}</p>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">Características</h3>
              <div className="flex flex-wrap gap-2">
                {pet.traits.map((trait, index) => (
                  <Badge key={index} variant="secondary">{trait}</Badge>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">Abrigo</h3>
              <p className="text-muted-foreground">{pet.shelter}</p>
            </div>
          </TabsContent>
          
          <TabsContent value="health" className="space-y-4">
            <div>
              <h3 className="text-lg font-medium mb-2">Informações de Saúde</h3>
              <p className="text-muted-foreground">{pet.healthInfo}</p>
            </div>
          </TabsContent>
          
          <TabsContent value="requirements" className="space-y-4">
            <div>
              <h3 className="text-lg font-medium mb-2">Requisitos para Adoção</h3>
              <p className="text-muted-foreground">{pet.adoptionRequirements}</p>
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="pt-4">
          <Button className="w-full" size="lg" onClick={handleLike}>
            <Heart className="h-5 w-5 mr-2" />
            Quero adotar {pet.name}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PetDetails;
