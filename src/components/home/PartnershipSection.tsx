import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Handshake, ArrowRight, Cpu, Stethoscope, Home, PawPrint } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface PartnershipSectionProps {
  isVisible: boolean;
}

const PartnerIcon = ({ children }: { children: React.ReactNode }) => (
  <div className="relative inline-flex items-center justify-center mb-5">
    <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
    <div className="relative h-16 w-16 rounded-2xl bg-gradient-to-br from-primary/15 to-accent/15 border border-primary/20 flex items-center justify-center">
      {children}
    </div>
  </div>
);

const PartnershipSection = ({ isVisible }: PartnershipSectionProps) => {
  const cards = [
    {
      title: 'para empresas tech',
      desc: 'Conecte sua solução tecnológica ao nosso ecossistema e alcance tutores e ONGs.',
      to: '/register-tech-partner',
      icon: (
        <div className="relative">
          <Cpu className="h-7 w-7 text-accent" strokeWidth={1.6} />
          <PawPrint className="h-4 w-4 text-primary absolute -bottom-1 -right-1.5" strokeWidth={2} />
        </div>
      ),
    },
    {
      title: 'para clínicas',
      desc: 'Ofereça seus serviços veterinários e expanda sua base de clientes.',
      to: '/register-vet-partner',
      icon: (
        <div className="relative">
          <Stethoscope className="h-7 w-7 text-accent" strokeWidth={1.6} />
          <PawPrint className="h-4 w-4 text-primary absolute -bottom-1 -right-1.5" strokeWidth={2} />
        </div>
      ),
    },
    {
      title: 'para ongs',
      desc: 'Cadastre sua ONG e utilize nossa plataforma para conectar animais a novos lares.',
      to: '/register-ngo-partner',
      icon: (
        <div className="relative">
          <Home className="h-7 w-7 text-accent" strokeWidth={1.6} />
          <PawPrint className="h-4 w-4 text-primary absolute -bottom-1 -right-1.5" strokeWidth={2} />
        </div>
      ),
    },
  ];

  return (
    <section id="partnership" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{
            opacity: isVisible ? 1 : 0,
            y: isVisible ? 0 : 20,
          }}
          transition={{ duration: 0.6 }}
          className="max-w-5xl mx-auto"
        >
          <div className="text-center mb-14">
            <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 text-primary mb-4">
              <Handshake className="h-6 w-6" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              faça parte
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Empresas de tecnologia, clínicas veterinárias e outros parceiros — junte-se à nossa rede para impactar positivamente a vida dos animais.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {cards.map((card, i) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                whileHover={{ y: -6 }}
                className="group relative bg-card rounded-3xl p-7 shadow-sm border border-border/60 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/10 hover:border-primary/40"
              >
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary/0 to-accent/0 group-hover:from-primary/5 group-hover:to-accent/5 transition-all duration-300 pointer-events-none" />
                <PartnerIcon>{card.icon}</PartnerIcon>
                <h3 className="font-bold text-xl mb-2">{card.title}</h3>
                <p className="text-muted-foreground mb-5 text-sm leading-relaxed">
                  {card.desc}
                </p>
                <Link to={card.to}>
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-full border-primary/30 text-accent hover:bg-primary/10 hover:border-primary/60 hover:text-accent transition-all"
                  >
                    Saiba mais
                    <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                  </Button>
                </Link>
              </motion.div>
            ))}
          </div>

          <div className="text-center">
            <Link to="/contact">
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className="relative inline-block"
              >
                <span className="absolute inset-0 rounded-full bg-primary/40 blur-xl animate-pulse" />
                <Button className="relative rounded-full px-8 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/30">
                  Entre em contato
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </motion.div>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default PartnershipSection;
