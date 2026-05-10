
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useAuth } from '@/hooks/auth';
import { useNavigate } from 'react-router-dom';

const HeroSection = () => {
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
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-28">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 rounded-full bg-primary/10 text-primary text-sm font-medium border border-primary/20"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              novos pets toda semana
            </motion.span>

            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-[1.05]">
              um swipe pode <br className="hidden sm:block" />
              <span className="text-primary">mudar uma vida</span> 🐾
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
              Conectamos animais resgatados a famílias reais através de uma experiência leve, moderna e cheia de afeto. Menos abandono. Mais encontros.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
              <Button 
                size="lg" 
                className="rounded-full px-8 py-6 text-base shadow-lg shadow-primary/30 hover:shadow-primary/50 hover:scale-[1.02] transition-all"
                onClick={() => handleButtonClick('/browse')}
              >
                começar a dar match
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              
              <Button 
                variant="ghost" 
                size="lg" 
                className="rounded-full px-8 py-6 text-base hover:bg-secondary/5"
                onClick={() => handleButtonClick('/browse')}
              >
                explorar pets
              </Button>
            </div>

            <p className="mt-6 text-sm text-muted-foreground/80">
              +1.200 adoções realizadas · 100% gratuito para adotantes
            </p>
          </motion.div>
        </div>
      </div>
      
      {/* Hero image */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="mt-16 max-w-5xl mx-auto px-4"
      >
        <div className="relative rounded-2xl overflow-hidden shadow-2xl">
          <img 
            src="https://images.unsplash.com/photo-1543466835-00a7907e9de1?ixlib=rb-1.2.1&auto=format&fit=crop&w=1516&q=80" 
            alt="Cão e gato juntos"
            className="w-full h-auto object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
        </div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
