import { motion } from 'framer-motion';
import { UserPlus, Sparkles, Heart, MessageCircle, PawPrint, Check } from 'lucide-react';

interface HowItWorksSectionProps {
  isVisible: boolean;
}

const HowItWorksSection = ({ isVisible }: HowItWorksSectionProps) => {
  const steps = [
    {
      icon: UserPlus,
      number: '01',
      title: 'Crie seu perfil',
      description: 'Conte sobre você, sua rotina e o tipo de companheiro ideal. Leva menos de 2 minutos.',
      accent: 'rotina, espaço, experiência',
    },
    {
      icon: Sparkles,
      number: '02',
      title: 'Encontre pets compatíveis',
      description: 'Nosso algoritmo cruza seu perfil com centenas de animais resgatados.',
      accent: 'compatibilidade real',
    },
    {
      icon: Heart,
      number: '03',
      title: 'Dê match',
      description: 'Deslize, curta e demonstre interesse. A ONG é avisada na hora.',
      accent: 'swipe leve, decisão consciente',
    },
    {
      icon: MessageCircle,
      number: '04',
      title: 'Converse com a ONG',
      description: 'A ONG entra em contato e organiza uma visita pra você conhecer o pet.',
      accent: 'sem burocracia',
    },
    {
      icon: PawPrint,
      number: '05',
      title: 'Transforme uma vida',
      description: 'Levando seu novo amigo pra casa, você muda a história dele — e a sua.',
      accent: 'pra sempre 🐾',
    },
  ];

  return (
    <section id="howItWorks" className="py-24 bg-secondary">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 rounded-full bg-primary/10 text-primary text-sm font-medium border border-primary/20">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            onboarding em 5 passos
          </span>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-5 leading-[1.1]">
            do swipe ao <span className="text-primary">pra sempre</span>
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Um caminho leve, transparente e moderno entre você e seu próximo melhor amigo.
          </p>
        </motion.div>

        <div className="relative max-w-4xl mx-auto">
          <div
            aria-hidden
            className="absolute left-8 md:left-1/2 top-2 bottom-2 w-px bg-gradient-to-b from-primary/40 via-primary/20 to-transparent md:-translate-x-px"
          />

          <div className="space-y-12 md:space-y-20">
            {steps.map((step, i) => {
              const Icon = step.icon;
              const isLeft = i % 2 === 0;
              return (
                <motion.div
                  key={step.number}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-80px' }}
                  transition={{ duration: 0.5, delay: 0.05 * i }}
                  className="relative grid md:grid-cols-2 gap-6 md:gap-12 items-center"
                >
                  <div
                    className={`pl-20 md:pl-0 ${
                      isLeft ? 'md:text-right md:pr-8' : 'md:pl-8 md:order-2'
                    }`}
                  >
                    <span className="text-xs font-mono text-primary/70 tracking-widest">
                      PASSO {step.number}
                    </span>
                    <h3 className="text-2xl md:text-3xl font-bold mt-2 mb-3 leading-tight">
                      {step.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed mb-3">
                      {step.description}
                    </p>
                    <span
                      className={`inline-flex items-center gap-1.5 text-xs font-medium text-primary/80 ${
                        isLeft ? 'md:flex-row-reverse' : ''
                      }`}
                    >
                      <Check className="h-3.5 w-3.5" />
                      {step.accent}
                    </span>
                  </div>

                  <div className="absolute left-0 md:left-1/2 top-0 md:-translate-x-1/2">
                    <motion.div
                      whileHover={{ scale: 1.08, rotate: 4 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                      className="relative"
                    >
                      <div className="h-16 w-16 rounded-2xl bg-card border border-border shadow-lg flex items-center justify-center">
                        <Icon className="h-7 w-7 text-primary" />
                      </div>
                      <motion.span
                        animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                        transition={{ duration: 2.4, repeat: Infinity, delay: i * 0.3 }}
                        className="absolute inset-0 rounded-2xl bg-primary/20 -z-10"
                      />
                    </motion.div>
                  </div>

                  <div className={`hidden md:block ${isLeft ? '' : 'md:order-1'}`} />
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
