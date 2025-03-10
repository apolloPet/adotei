
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";

interface CallToActionSectionProps {
  isVisible: boolean;
}

const CallToActionSection = ({ isVisible }: CallToActionSectionProps) => {
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
            <Link to="/register">
              <Button size="lg" variant="secondary" className="rounded-full px-8 py-6 text-primary text-base">
                Criar uma conta
              </Button>
            </Link>
            
            <Link to="/browse">
              <Button size="lg" variant="outline" className="rounded-full px-8 py-6 text-white border-white/30 hover:bg-white/10 text-base">
                Explorar pets
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CallToActionSection;
