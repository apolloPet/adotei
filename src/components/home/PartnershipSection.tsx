import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Cpu, Plus, Home, PawPrint } from 'lucide-react';

interface PartnershipSectionProps {
  isVisible: boolean;
}

// Floating icon: outlined "container" shape (chip / medical cross / house) with a paw inside.
const FloatingPartnerIcon = ({ shape }: { shape: 'tech' | 'clinic' | 'ngo' }) => {
  return (
    <div className="relative inline-flex items-center justify-center mb-4 h-16 w-16">
      {/* soft glow */}
      <div className="absolute inset-2 rounded-full bg-primary/20 blur-2xl" />

      {shape === 'tech' && (
        <div className="relative h-14 w-14">
          {/* chip outline */}
          <div className="absolute inset-0 rounded-xl border-[2.5px] border-primary bg-primary/10" />
          {/* chip pins */}
          {[0, 1, 2].map((i) => (
            <div
              key={`t-${i}`}
              className="absolute -top-1.5 h-1.5 w-1 rounded-sm bg-primary"
              style={{ left: `${20 + i * 25}%` }}
            />
          ))}
          {[0, 1, 2].map((i) => (
            <div
              key={`b-${i}`}
              className="absolute -bottom-1.5 h-1.5 w-1 rounded-sm bg-primary"
              style={{ left: `${20 + i * 25}%` }}
            />
          ))}
          {[0, 1, 2].map((i) => (
            <div
              key={`l-${i}`}
              className="absolute -left-1.5 w-1.5 h-1 rounded-sm bg-primary"
              style={{ top: `${20 + i * 25}%` }}
            />
          ))}
          {[0, 1, 2].map((i) => (
            <div
              key={`r-${i}`}
              className="absolute -right-1.5 w-1.5 h-1 rounded-sm bg-primary"
              style={{ top: `${20 + i * 25}%` }}
            />
          ))}
          <PawPrint
            className="absolute inset-0 m-auto h-7 w-7 text-primary"
            strokeWidth={2.2}
          />
        </div>
      )}

      {shape === 'clinic' && (
        <div className="relative h-14 w-14">
          {/* medical cross built from two bars */}
          <div className="absolute left-1/2 top-0 -translate-x-1/2 h-14 w-5 rounded-md border-[2.5px] border-primary bg-primary/10" />
          <div className="absolute top-1/2 left-0 -translate-y-1/2 h-5 w-14 rounded-md border-[2.5px] border-primary bg-primary/10" />
          <PawPrint
            className="absolute inset-0 m-auto h-6 w-6 text-primary"
            strokeWidth={2.2}
          />
        </div>
      )}

      {shape === 'ngo' && (
        <div className="relative h-14 w-14">
          {/* house: triangle roof + body */}
          <svg viewBox="0 0 56 56" className="absolute inset-0 h-full w-full">
            <path
              d="M6 26 L28 6 L50 26 L50 50 L6 50 Z"
              fill="hsl(var(--primary) / 0.1)"
              stroke="hsl(var(--primary))"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
          </svg>
          <PawPrint
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-[35%] h-6 w-6 text-primary"
            strokeWidth={2.2}
          />
        </div>
      )}
    </div>
  );
};

const PartnershipSection = ({ isVisible }: PartnershipSectionProps) => {
  const cards = [
    {
      title: 'para empresas tech',
      desc: 'Conecte sua solução tecnológica ao nosso ecossistema e alcance tutores e ONGs.',
      to: '/register-tech-partner',
      shape: 'tech' as const,
    },
    {
      title: 'para clínicas',
      desc: 'Ofereça seus serviços veterinários e expanda sua base de clientes.',
      to: '/register-vet-partner',
      shape: 'clinic' as const,
    },
    {
      title: 'para ongs',
      desc: 'Cadastre sua ONG e utilize nossa plataforma para conectar animais a novos lares.',
      to: '/register-ngo-partner',
      shape: 'ngo' as const,
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
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 text-secondary">
              faça parte
            </h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
              Empresas de tecnologia, clínicas veterinárias e outros parceiros — junte-se à nossa rede
              para impactar positivamente a vida dos animais.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12 pt-10">
            {cards.map((card, i) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                whileHover={{ y: -6 }}
                className="relative bg-card rounded-3xl px-6 pt-14 pb-7 text-center shadow-md border border-border/60 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/15 hover:border-primary/40"
              >
                {/* Floating icon overlapping the top edge */}
                <div className="absolute -top-8 left-1/2 -translate-x-1/2">
                  <FloatingPartnerIcon shape={card.shape} />
                </div>

                <h3 className="font-bold text-xl mb-3 text-secondary">{card.title}</h3>
                <p className="text-muted-foreground mb-6 text-sm leading-relaxed">
                  {card.desc}
                </p>
                <Link
                  to={card.to}
                  className="inline-flex items-center gap-1.5 rounded-full bg-primary text-primary-foreground px-5 py-2 text-sm font-semibold shadow-md shadow-primary/30 hover:bg-primary/90 hover:shadow-lg transition-all"
                >
                  Saiba mais
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </motion.div>
            ))}
          </div>

          <div className="text-center">
            <Link to="/contact">
              <motion.div
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                className="relative inline-block"
              >
                <span className="absolute inset-0 rounded-full bg-primary/50 blur-2xl animate-pulse" />
                <span className="relative inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-7 py-3 text-sm font-semibold shadow-lg shadow-primary/40 hover:bg-primary/90 transition-all">
                  Entre em contato
                  <ArrowRight className="h-4 w-4" />
                </span>
              </motion.div>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default PartnershipSection;
