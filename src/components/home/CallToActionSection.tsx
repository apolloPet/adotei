
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { useAuth } from '@/hooks/auth';
import { useNavigate } from 'react-router-dom';

interface CallToActionSectionProps {
  isVisible: boolean;
}

const CallToActionSection = ({ isVisible }: CallToActionSectionProps) => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const handleButtonClick = (path: string) => {
    if (isAuthenticated) {
      navigate(path);
    } else {
      navigate('/register');
    }
  };

  return (
    <section id="callToAction" className="py-20 bg-primary">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ 
            opacity: isVisible ? 1 : 0, 
            y: isVisible ? 0 : 20 
          }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto text-center text-white"
        >
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-6">
            Encontre seu companheiro perfeito hoje
          </h2>
          <p className="text-white/80 text-lg mb-8">
            Há milhares de animais esperando por um lar. Comece a navegar ou crie seu perfil para iniciar a jornada de adoção.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button 
              size="lg" 
              variant="secondary" 
              className="rounded-full px-8 py-6 text-primary text-base"
              onClick={() => navigate('/register')}
            >
              Criar uma conta
            </Button>
            
            <Button 
              size="lg" 
              variant="outline" 
              className="rounded-full px-8 py-6 text-white border-white/30 hover:bg-white/10 text-base"
              onClick={() => handleButtonClick('/browse')}
            >
              Explorar pets
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CallToActionSection;
