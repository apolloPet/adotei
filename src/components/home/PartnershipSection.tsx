
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Handshake, ArrowRight } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface PartnershipSectionProps {
  isVisible: boolean;
}

const PartnershipSection = ({ isVisible }: PartnershipSectionProps) => {
  return (
    <section id="partnership" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ 
            opacity: isVisible ? 1 : 0, 
            y: isVisible ? 0 : 20 
          }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 text-primary mb-4">
              <Handshake className="h-6 w-6" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              Faça Parte
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Empresas de tecnologia, clínicas veterinárias e outros parceiros - junte-se à nossa rede para impactar positivamente a vida dos animais.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 mb-10">
            <div className="bg-card rounded-xl p-6 shadow-sm">
              <h3 className="font-bold text-xl mb-2">Para Empresas Tech</h3>
              <p className="text-muted-foreground mb-4">
                Conecte sua solução tecnológica ao nosso ecossistema e alcance tutores e ONGs.
              </p>
              <Link to="/register-tech-partner">
                <Button variant="link" className="p-0 h-auto text-primary flex items-center gap-1">
                  Saiba mais
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
            
            <div className="bg-card rounded-xl p-6 shadow-sm">
              <h3 className="font-bold text-xl mb-2">Para Clínicas</h3>
              <p className="text-muted-foreground mb-4">
                Ofereça seus serviços veterinários e expandir sua base de clientes.
              </p>
              <Link to="/register-vet-partner">
                <Button variant="link" className="p-0 h-auto text-primary flex items-center gap-1">
                  Saiba mais
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
            
            <div className="bg-card rounded-xl p-6 shadow-sm">
              <h3 className="font-bold text-xl mb-2">Para ONGs</h3>
              <p className="text-muted-foreground mb-4">
                Cadastre sua ONG e utilize nossa plataforma para conectar animais a novos lares.
              </p>
              <Link to="/register-ngo-partner">
                <Button variant="link" className="p-0 h-auto text-primary flex items-center gap-1">
                  Saiba mais
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
          
          <div className="text-center">
            <Link to="/contact">
              <Button className="rounded-full px-8">
                Entre em contato
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default PartnershipSection;
