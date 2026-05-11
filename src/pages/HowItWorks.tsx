import { motion } from 'framer-motion';
import { UserPlus, Sparkles, Heart, MessageCircle, PawPrint, ArrowRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const HowItWorks = () => {
  const navigate = useNavigate();

  const steps = [
    {
      icon: UserPlus,
      number: '01',
      title: 'Crie seu perfil',
      description: 'Conte sobre você, seu estilo de vida e o tipo de companheiro que está procurando. Leva menos de 2 minutos.',
      accent: 'rotina, espaço, experiência',
    },
    {
      icon: Sparkles,
      number: '02',
      title: 'Encontre pets compatíveis',
      description: 'Nosso algoritmo cruza seu perfil com centenas de animais resgatados e mostra os matches mais prováveis para você.',
      accent: 'compatibilidade real, não só fofura',
    },
    {
      icon: Heart,
      number: '03',
      title: 'Dê match',
      description: 'Deslize, curta e demonstre interesse. Quando há match, a ONG é avisada na hora.',
      accent: 'swipe leve, decisão consciente',
    },
    {
      icon: MessageCircle,
      number: '04',
      title: 'Converse com a ONG',
      description: 'A ONG entra em contato, tira dúvidas e organiza uma visita ou videochamada para você conhecer o pet.',
      accent: 'sem burocracia, com cuidado',
    },
    {
      icon: PawPrint,
      number: '05',
      title: 'Transforme uma vida',
      description: 'Levando seu novo amigo pra casa, você muda a história dele — e a sua. Suporte pós-adoção incluído.',
      accent: 'pra sempre 🐾',
    },
  ];

  const faqs = [
    {
      question: 'Há algum custo para adotar pelo PetMatch?',
      answer: 'A plataforma é 100% gratuita para adotantes. Algumas ONGs cobram uma taxa simbólica para cobrir vacinas e castração.',
    },
    {
      question: 'Como sei se um pet combina comigo?',
      answer: 'Cruzamos seu estilo de vida (rotina, espaço, tempo, experiência) com o perfil de cada animal. Você vê uma % de compatibilidade em cada match.',
    },
    {
      question: 'Posso adotar morando em apartamento?',
      answer: 'Sim. Muitos pets se adaptam super bem a apartamentos — o filtro já considera isso na compatibilidade.',
    },
    {
      question: 'E se a adaptação não der certo?',
      answer: 'Oferecemos suporte pós-adoção junto com a ONG parceira. Em casos raros, o pet pode retornar com segurança.',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 pt-32 pb-20">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto text-center mb-20"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 rounded-full bg-primary/10 text-primary text-sm font-medium border border-primary/20">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            onboarding em 5 passos
          </span>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 leading-[1.05]">
            do swipe ao <span className="text-primary">pra sempre</span>
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Um caminho leve, transparente e moderno entre você e seu próximo melhor amigo.
          </p>
        </motion.div>

        {/* Timeline */}
        <div className="relative max-w-4xl mx-auto mb-24">
          {/* vertical line */}
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
                  className={`relative grid md:grid-cols-2 gap-6 md:gap-12 items-center ${
                    isLeft ? '' : 'md:[&>*:first-child]:order-2'
                  }`}
                >
                  {/* Card */}
                  <div className={`pl-20 md:pl-0 ${isLeft ? 'md:text-right md:pr-8' : 'md:pl-8'}`}>
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

                  {/* Icon node */}
                  <div
                    className={`absolute left-0 md:left-1/2 top-0 md:-translate-x-1/2 ${
                      isLeft ? 'md:order-1' : ''
                    }`}
                  >
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

                  {/* Spacer for symmetry on desktop */}
                  <div className="hidden md:block" />
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* FAQ */}
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-3">perguntas frequentes</h2>
            <p className="text-muted-foreground">tudo o que você precisa saber antes de começar</p>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="rounded-2xl border border-border bg-card p-6 hover:border-primary/40 transition-colors"
              >
                <h3 className="text-lg font-semibold mb-2">{faq.question}</h3>
                <p className="text-muted-foreground leading-relaxed">{faq.answer}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default HowItWorks;
