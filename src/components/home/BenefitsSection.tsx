
import { motion } from 'framer-motion';
import { Heart, Shield, PawPrint } from 'lucide-react';

interface BenefitsSectionProps {
  isVisible: boolean;
}

const BenefitsSection = ({ isVisible }: BenefitsSectionProps) => {
  const benefits = [
    {
      icon: <Heart className="h-6 w-6 text-primary" />,
      title: "Salve uma vida",
      description: "Ao adotar, você oferece uma segunda chance a um animal que precisa de um lar."
    },
    {
      icon: <Shield className="h-6 w-6 text-primary" />,
      title: "Animais verificados",
      description: "Todos os pets são cuidados por ONGs parceiras, vacinados e avaliados por veterinários."
    },
    {
      icon: <PawPrint className="h-6 w-6 text-primary" />,
      title: "Companhia para a vida",
      description: "Ganhe um amigo leal que trará alegria, amor e companheirismo todos os dias."
    }
  ];

  return (
    <section id="benefits" className="py-20">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ 
              opacity: isVisible ? 1 : 0, 
              x: isVisible ? 0 : -20 
            }}
            transition={{ duration: 0.6 }}
            className="order-2 md:order-1"
          >
            <div className="relative">
              <div className="absolute -right-4 -top-4 w-32 h-32 bg-primary/10 rounded-full -z-10"></div>
              <img 
                src="https://images.unsplash.com/photo-1573865526739-10659fec78a5?ixlib=rb-1.2.1&auto=format&fit=crop&w=1015&q=80" 
                alt="Pessoa abraçando cachorro" 
                className="rounded-xl shadow-lg w-full"
              />
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ 
              opacity: isVisible ? 1 : 0, 
              x: isVisible ? 0 : 20 
            }}
            transition={{ duration: 0.6 }}
            className="order-1 md:order-2"
          >
            <span className="inline-block bg-primary/10 text-primary font-medium rounded-full px-4 py-1.5 text-sm mb-4">
              Por que adotar?
            </span>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-6">
              Transforme vidas com a adoção
            </h2>
            
            <div className="space-y-6">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex gap-4">
                  <div className="p-2 bg-primary/10 rounded-full h-10 w-10 flex items-center justify-center flex-shrink-0">
                    {benefit.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">{benefit.title}</h3>
                    <p className="text-muted-foreground">{benefit.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;
