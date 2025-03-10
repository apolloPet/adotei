
import { motion } from 'framer-motion';
import { PawPrint, Heart, MessageCircle } from 'lucide-react';

interface HowItWorksSectionProps {
  isVisible: boolean;
}

const HowItWorksSection = ({ isVisible }: HowItWorksSectionProps) => {
  const steps = [
    {
      icon: <PawPrint className="h-10 w-10 text-primary" />,
      title: "Crie seu perfil",
      description: "Forneça informações sobre você, seu estilo de vida e preferências para encontrarmos o pet ideal."
    },
    {
      icon: <Heart className="h-10 w-10 text-primary" />,
      title: "Encontre um match",
      description: "Navegue por perfis de pets, deslize para a direita quando encontrar um que você ame."
    },
    {
      icon: <MessageCircle className="h-10 w-10 text-primary" />,
      title: "Contato da ONG",
      description: "Quando houver match, a ONG analisará seu perfil e entrará em contato para os próximos passos."
    }
  ];

  return (
    <section id="howItWorks" className="py-20 bg-secondary">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block bg-primary/10 text-primary font-medium rounded-full px-4 py-1.5 text-sm mb-4">
              Como funciona
            </span>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-6">
              Três passos simples para encontrar seu novo amigo
            </h2>
            <p className="text-lg text-muted-foreground">
              Nosso processo é desenhado para facilitar conexões significativas entre você e seu futuro pet.
            </p>
          </motion.div>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ 
                opacity: isVisible ? 1 : 0, 
                y: isVisible ? 0 : 20 
              }}
              transition={{ duration: 0.6, delay: 0.1 * (index + 1) }}
              className="bg-white dark:bg-card rounded-xl p-6 shadow-sm"
            >
              <div className="flex flex-col items-center text-center">
                <div className="p-3 rounded-full bg-primary/10 mb-4">
                  {step.icon}
                </div>
                <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
