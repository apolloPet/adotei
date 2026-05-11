import { motion } from 'framer-motion';
import { UserRound, PawPrint, Dog } from 'lucide-react';
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

  // SVG paw pattern (low opacity)
  const pawPattern = `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 120 120'>
      <g fill='white' fill-opacity='0.06'>
        <path d='M30 40c4 0 7 4 7 9s-3 9-7 9-7-4-7-9 3-9 7-9zm20-10c4 0 7 4 7 9s-3 9-7 9-7-4-7-9 3-9 7-9zm20 0c4 0 7 4 7 9s-3 9-7 9-7-4-7-9 3-9 7-9zm20 10c4 0 7 4 7 9s-3 9-7 9-7-4-7-9 3-9 7-9zm-30 18c10 0 18 9 18 18 0 6-5 9-10 9-3 0-5-2-8-2s-5 2-8 2c-5 0-10-3-10-9 0-9 8-18 18-18z'/>
        <path d='M85 88c2 0 4 2 4 5s-2 5-4 5-4-2-4-5 2-5 4-5zm10-6c2 0 4 2 4 5s-2 5-4 5-4-2-4-5 2-5 4-5zm10 6c2 0 4 2 4 5s-2 5-4 5-4-2-4-5 2-5 4-5zm-15 10c5 0 9 5 9 9 0 3-2 5-5 5-2 0-3-1-4-1s-2 1-4 1c-3 0-5-2-5-5 0-4 4-9 9-9z'/>
      </g>
    </svg>`
  )}`;

  return (
    <section
      id="callToAction"
      className="relative py-24 overflow-hidden"
      style={{ backgroundColor: '#3F3D91', backgroundImage: `url("${pawPattern}")`, backgroundRepeat: 'repeat' }}
    >
      {/* Swipe card decoration */}
      <div className="hidden md:block absolute top-1/2 -translate-y-1/2 right-8 lg:right-16 pointer-events-none">
        <div className="relative w-44 h-56">
          {/* Back card */}
          <motion.div
            initial={{ rotate: -8, opacity: 0 }}
            animate={{ rotate: -10, opacity: isVisible ? 0.7 : 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="absolute inset-0 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-sm"
          />
          {/* Front card */}
          <motion.div
            initial={{ rotate: 0, y: 10, opacity: 0 }}
            animate={{ rotate: 4, y: 0, opacity: isVisible ? 1 : 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="absolute inset-0 rounded-2xl bg-white/15 border border-white/30 backdrop-blur-md overflow-hidden"
          >
            {/* sweep line */}
            <motion.div
              initial={{ y: '-100%' }}
              animate={{ y: '120%' }}
              transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut', repeatDelay: 1 }}
              className="absolute inset-x-0 h-12 bg-gradient-to-b from-transparent via-white/20 to-transparent"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <PawPrint className="h-16 w-16 text-white/40" strokeWidth={1.4} />
            </div>
            {/* corner reactions */}
            <div className="absolute bottom-3 left-3 h-8 w-8 rounded-full bg-primary/90 ring-2 ring-white/40 flex items-center justify-center shadow-lg">
              <PawPrint className="h-4 w-4 text-secondary" strokeWidth={2.4} />
            </div>
            <div className="absolute bottom-3 right-3 h-8 w-8 rounded-full bg-accent ring-2 ring-white/40 flex items-center justify-center shadow-lg">
              <PawPrint className="h-4 w-4 text-white rotate-12" strokeWidth={2.4} />
            </div>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{
            opacity: isVisible ? 1 : 0,
            y: isVisible ? 0 : 20,
          }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl md:max-w-2xl md:mx-0 mx-auto text-center md:text-left text-white"
        >
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-6">
            encontre seu companheiro perfeito hoje
          </h2>
          <p className="text-white/85 text-lg mb-8">
            Há milhares de animais esperando por um lar. Comece a navegar ou crie seu perfil para iniciar a jornada de adoção.
          </p>

          <div className="flex flex-col sm:flex-row md:justify-start justify-center gap-4">
            <Button
              size="lg"
              className="rounded-full px-8 py-6 bg-secondary hover:bg-secondary/90 text-white text-base shadow-lg shadow-black/20"
              onClick={() => navigate('/register')}
            >
              <UserRound className="mr-2 h-5 w-5" />
              <PawPrint className="mr-2 h-4 w-4 -ml-1 opacity-80" />
              criar minha conta
            </Button>

            <Button
              size="lg"
              className="rounded-full px-8 py-6 bg-white hover:bg-white/95 text-accent text-base shadow-lg shadow-black/10"
              onClick={() => handleButtonClick('/browse')}
            >
              <Dog className="mr-2 h-5 w-5" />
              ver animais disponíveis
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CallToActionSection;
