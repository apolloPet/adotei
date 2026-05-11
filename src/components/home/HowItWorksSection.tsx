import { motion } from 'framer-motion';
import { UserPlus, Sparkles, Check, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface HowItWorksSectionProps {
  isVisible: boolean;
}

const CREAM = '#F4EFEA';
const PURPLE = '#3F3D91';
const NAVY = '#281F56';
const MINT = '#00EA7C';

// Subtle geometric texture pattern (triangles + lines) using navy outlines
const geoPattern = `data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'>
    <g fill='none' stroke='${NAVY}' stroke-width='1.2' opacity='0.18'>
      <path d='M10 60 L25 35 L40 60 Z'/>
      <path d='M45 20 L65 20 L55 40 Z'/>
      <path d='M55 65 L70 55 L70 75 Z'/>
      <path d='M5 15 L20 5'/>
      <path d='M60 5 L75 12'/>
    </g>
  </svg>`
)}`;

// Bolder geometric pattern for the bottom mint strip
const stripPattern = `data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' width='90' height='90' viewBox='0 0 90 90'>
    <g fill='none' stroke='${NAVY}' stroke-width='2'>
      <path d='M5 75 L25 40 L45 75 Z'/>
      <path d='M50 70 L70 45 L85 75 Z'/>
      <path d='M30 25 L50 10 L55 35 Z'/>
      <path d='M0 50 L20 50'/>
      <path d='M65 18 L85 18'/>
    </g>
  </svg>`
)}`;

const HowItWorksSection = ({ isVisible }: HowItWorksSectionProps) => {
  const cards = [
    {
      step: 'PASSO 01',
      icon: UserPlus,
      iconShape: 'circle' as const,
      title: 'Crie seu perfil',
      description:
        'Conte sobre você, sua rotina e o tipo de companheiro ideal. Leva menos de 2 minutos.',
      tag: 'rotina, espaço, experiência',
    },
    {
      step: 'PASSO 02',
      icon: Sparkles,
      iconShape: 'square' as const,
      title: 'Encontre pets compatíveis',
      description:
        'Nosso algoritmo cruza seu perfil com centenas de animais resgatados.',
      tag: 'compatibilidade real',
    },
  ];

  return (
    <section id="howItWorks" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
          transition={{ duration: 0.6 }}
          className="relative max-w-6xl mx-auto rounded-[2rem] overflow-hidden border"
          style={{ backgroundColor: CREAM, borderColor: `${NAVY}20` }}
        >
          {/* Subtle geometric texture across the panel */}
          <div
            aria-hidden
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: `url("${geoPattern}")`,
              backgroundRepeat: 'repeat',
            }}
          />

          <div className="relative px-6 md:px-14 pt-16 pb-28 md:pb-36">
            {/* Header */}
            <div className="text-center max-w-3xl mx-auto mb-14">
              <span
                className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 rounded-full text-sm font-medium"
                style={{ backgroundColor: MINT, color: NAVY }}
              >
                <span className="relative flex h-2 w-2">
                  <span
                    className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                    style={{ backgroundColor: NAVY }}
                  />
                  <span
                    className="relative inline-flex rounded-full h-2 w-2"
                    style={{ backgroundColor: NAVY }}
                  />
                </span>
                onboarding em 5 passos
              </span>
              <h2
                className="text-4xl md:text-6xl font-bold tracking-tight mb-5 leading-[1.05]"
                style={{ color: PURPLE }}
              >
                do swipe ao pra sempre
              </h2>
              <p className="text-lg leading-relaxed" style={{ color: PURPLE }}>
                Um caminho leve, transparente e moderno entre você e seu próximo melhor amigo.
              </p>
            </div>

            {/* Cards */}
            <div className="grid sm:grid-cols-2 gap-6 md:gap-8 max-w-4xl mx-auto">
              {cards.map((c, i) => {
                const Icon = c.icon;
                return (
                  <motion.div
                    key={c.step}
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-60px' }}
                    transition={{ duration: 0.5, delay: 0.1 * i }}
                  >
                    <Link to="/how-it-works" className="block group">
                      <motion.div
                        whileHover={{ y: -4 }}
                        transition={{ type: 'spring', stiffness: 280 }}
                        className="relative rounded-2xl p-7 md:p-8 h-full flex flex-col items-center text-center transition-shadow"
                        style={{
                          backgroundColor: CREAM,
                          border: `1.5px solid ${NAVY}`,
                          boxShadow: `0 4px 0 ${NAVY}10`,
                        }}
                      >
                        <span
                          className="text-xs font-mono tracking-[0.2em] mb-5"
                          style={{ color: PURPLE }}
                        >
                          {c.step}
                        </span>

                        {/* Icon frame with geometric texture */}
                        <div
                          className={`relative h-24 w-24 mb-6 flex items-center justify-center overflow-hidden ${
                            c.iconShape === 'circle' ? 'rounded-full' : 'rounded-2xl'
                          }`}
                          style={{
                            backgroundColor: CREAM,
                            border: `1.5px solid ${NAVY}`,
                          }}
                        >
                          <div
                            aria-hidden
                            className="absolute inset-0 opacity-60"
                            style={{
                              backgroundImage: `url("${geoPattern}")`,
                              backgroundSize: '60px 60px',
                            }}
                          />
                          <Icon
                            className="relative h-10 w-10"
                            style={{ color: PURPLE }}
                            strokeWidth={2.2}
                          />
                        </div>

                        <h3
                          className="text-xl font-bold mb-3"
                          style={{ color: PURPLE }}
                        >
                          {c.title}
                        </h3>
                        <p
                          className="text-sm leading-relaxed mb-5"
                          style={{ color: `${PURPLE}cc` }}
                        >
                          {c.description}
                        </p>

                        <span
                          className="inline-flex items-center gap-1.5 text-sm font-semibold mt-auto"
                          style={{ color: '#00C67A' }}
                        >
                          {c.tag}
                          <Check className="h-4 w-4" strokeWidth={3} />
                        </span>

                        <span
                          className="mt-5 inline-flex items-center gap-1 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity"
                          style={{ color: PURPLE }}
                        >
                          ver fluxo completo <ArrowRight className="h-3 w-3" />
                        </span>
                      </motion.div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Bottom geometric mint strip */}
          <div
            className="absolute bottom-0 left-0 right-0 h-16 md:h-20"
            style={{ backgroundColor: MINT }}
          >
            <div
              aria-hidden
              className="absolute inset-0"
              style={{
                backgroundImage: `url("${stripPattern}")`,
                backgroundRepeat: 'repeat',
                backgroundSize: '90px 90px',
              }}
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
