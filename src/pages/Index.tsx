
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { ArrowRight, PawPrint, Heart, Shield, MessageCircle } from 'lucide-react';
import Header from "@/components/Header";

const Index = () => {
  // Intersection observer for animations
  const [isVisible, setIsVisible] = useState({
    howItWorks: false,
    benefits: false,
    callToAction: false,
  });

  useEffect(() => {
    const observerOptions = {
      threshold: 0.2,
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setIsVisible(prev => ({
            ...prev,
            [entry.target.id]: true
          }));
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);
    
    const sections = ['howItWorks', 'benefits', 'callToAction'];
    sections.forEach(section => {
      const element = document.getElementById(section);
      if (element) observer.observe(element);
    });

    return () => {
      sections.forEach(section => {
        const element = document.getElementById(section);
        if (element) observer.unobserve(element);
      });
    };
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-28">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
                Encontre seu <span className="text-primary">melhor amigo</span>
              </h1>
              
              <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Um app que conecta animais de abrigo a lares cheios de amor. Faça o match perfeito com seu novo companheiro de quatro patas.
              </p>
              
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link to="/register">
                  <Button size="lg" className="rounded-full px-8 py-6 text-base">
                    Comece a adotar
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                
                <Link to="/browse">
                  <Button variant="outline" size="lg" className="rounded-full px-8 py-6 text-base">
                    Explorar pets
                  </Button>
                </Link>
              </div>
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
      
      {/* How it works section */}
      <section id="howItWorks" className="py-20 bg-secondary">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: isVisible.howItWorks ? 1 : 0, y: isVisible.howItWorks ? 0 : 20 }}
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
            {[
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
            ].map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ 
                  opacity: isVisible.howItWorks ? 1 : 0, 
                  y: isVisible.howItWorks ? 0 : 20 
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
      
      {/* Benefits section */}
      <section id="benefits" className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ 
                opacity: isVisible.benefits ? 1 : 0, 
                x: isVisible.benefits ? 0 : -20 
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
                opacity: isVisible.benefits ? 1 : 0, 
                x: isVisible.benefits ? 0 : 20 
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
                {[
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
                ].map((benefit, index) => (
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
      
      {/* Call to action */}
      <section id="callToAction" className="py-20 bg-primary">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ 
              opacity: isVisible.callToAction ? 1 : 0, 
              y: isVisible.callToAction ? 0 : 20 
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
      
      {/* Footer */}
      <footer className="py-12 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <PawPrint className="h-6 w-6 text-primary" />
              <span className="font-bold text-lg">PetMatch</span>
            </div>
            
            <div className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} PetMatch. Todos os direitos reservados.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
