
import { motion } from 'framer-motion';
import { ArrowRight, Heart, Sparkles } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useAuth } from '@/hooks/auth';
import { useNavigate } from 'react-router-dom';
import heroPets from '@/assets/hero-pets.jpg';

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
                encontrar meu match
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              
              <Button 
                variant="outline" 
                size="lg" 
                className="rounded-full px-8 py-6 text-base font-semibold border-2 border-pet-secondary text-pet-secondary bg-white/80 backdrop-blur-sm hover:bg-pet-secondary hover:text-white hover:border-pet-secondary hover:scale-[1.02] hover:shadow-lg hover:shadow-pet-secondary/30 transition-all"
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
        <div className="relative rounded-3xl overflow-hidden shadow-2xl">
          <img 
            src={heroPets}
            alt="Cão e gato resgatados olhando para a câmera"
            width={1920}
            height={1080}
            className="w-full h-auto object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-secondary/40 via-transparent to-transparent"></div>

          <motion.div
            initial={{ opacity: 0, x: -20, y: 20 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="hidden sm:flex absolute bottom-6 left-6 items-center gap-3 bg-card/95 backdrop-blur-md rounded-2xl pl-3 pr-5 py-3 shadow-xl border border-border/50"
          >
            <div className="relative">
              <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                <Heart className="h-5 w-5 text-primary fill-primary" />
              </div>
              <motion.span
                animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }}
                transition={{ duration: 1.8, repeat: Infinity }}
                className="absolute inset-0 rounded-full bg-primary/30"
              />
            </div>
            <div className="text-left">
              <p className="text-xs text-muted-foreground leading-tight">novo match</p>
              <p className="text-sm font-semibold leading-tight">Bidu + Marina 🎉</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20, y: -10 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ duration: 0.6, delay: 1 }}
            className="hidden sm:flex absolute top-6 right-6 items-center gap-2 bg-secondary text-secondary-foreground rounded-full px-4 py-2 shadow-xl"
          >
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold">92% compatível</span>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
