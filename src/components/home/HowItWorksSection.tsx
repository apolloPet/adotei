import { motion } from 'framer-motion';
import { Sparkles, Check, PawPrint, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

interface HowItWorksSectionProps {
  isVisible: boolean;
}

const CREAM = '#F4EFEA';
const PURPLE = '#3F3D91';
const NAVY = '#281F56';
const MINT = '#00EA7C';
const LILAC = '#E6E3FA';

/* Decorative paw print scattered in background */
const PawMark = ({
  className,
  size = 28,
  rotate = 0,
  opacity = 0.18,
}: {
  className?: string;
  size?: number;
  rotate?: number;
  opacity?: number;
}) => (
  <PawPrint
    className={className}
    style={{
      width: size,
      height: size,
      transform: `rotate(${rotate}deg)`,
      color: NAVY,
      opacity,
    }}
    strokeWidth={1.6}
  />
);

const HowItWorksSection = ({ isVisible }: HowItWorksSectionProps) => {
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
          {/* Background paw prints */}
          <PawMark className="absolute top-10 left-8" size={36} rotate={-20} />
          <PawMark className="absolute top-32 left-20" size={22} rotate={15} opacity={0.12} />
          <PawMark className="absolute bottom-16 left-12" size={30} rotate={40} />
          <PawMark className="absolute bottom-32 left-1/3" size={20} rotate={-10} opacity={0.12} />
          <PawMark className="absolute top-20 right-12" size={32} rotate={25} />
          <PawMark className="absolute bottom-20 right-20" size={26} rotate={-30} opacity={0.14} />
          <PawMark className="absolute bottom-40 right-1/3" size={22} rotate={10} opacity={0.12} />

          <div className="relative px-6 md:px-14 pt-16 pb-28 md:pb-36">
            {/* Header */}
            <div className="text-center max-w-3xl mx-auto mb-14 relative">
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
                className="text-4xl md:text-6xl font-bold tracking-tight mb-5 leading-[1.05] relative inline-block"
                style={{ color: PURPLE }}
              >
                do swipe ao pra sempre
                {/* Little paw flourish on title */}
                <motion.span
                  className="absolute -top-2 right-[18%] md:right-[22%]"
                  animate={{ rotate: [0, -8, 8, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <PawPrint className="w-7 h-7 md:w-9 md:h-9" style={{ color: MINT }} strokeWidth={2.4} />
                </motion.span>
              </h2>
              <p className="text-lg leading-relaxed" style={{ color: PURPLE }}>
                Um caminho leve, transparente e moderno entre você e seu próximo melhor amigo.
              </p>
            </div>

            {/* Cards with connection flow */}
            <div className="relative max-w-4xl mx-auto">
              {/* Connection flow between cards (desktop only) */}
              <div className="hidden sm:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none">
                <svg width="120" height="60" viewBox="0 0 120 60" fill="none">
                  <defs>
                    <linearGradient id="flowGrad" x1="0" y1="0" x2="120" y2="0">
                      <stop offset="0%" stopColor={PURPLE} stopOpacity="0" />
                      <stop offset="50%" stopColor={MINT} stopOpacity="1" />
                      <stop offset="100%" stopColor={PURPLE} stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <motion.path
                    d="M 5 30 Q 60 -10 115 30"
                    stroke="url(#flowGrad)"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    fill="none"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1.4, delay: 0.4 }}
                  />
                </svg>
                {/* Flowing particles */}
                {[0, 0.6, 1.2].map((delay, i) => (
                  <motion.span
                    key={i}
                    className="absolute top-1/2 left-0 w-2 h-2 rounded-full"
                    style={{ backgroundColor: MINT, boxShadow: `0 0 10px ${MINT}` }}
                    animate={{
                      x: [0, 60, 120],
                      y: [0, -22, 0],
                      opacity: [0, 1, 0],
                      scale: [0.5, 1, 0.5],
                    }}
                    transition={{
                      duration: 1.8,
                      repeat: Infinity,
                      delay,
                      ease: 'easeInOut',
                    }}
                  />
                ))}
              </div>

              <div className="grid sm:grid-cols-2 gap-6 md:gap-10">
                {/* STEP 01 */}
                <motion.div
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 0.5 }}
                  className="relative"
                >
                  <Link to="/how-it-works" className="block group">
                    <motion.div
                      whileHover={{ y: -6 }}
                      transition={{ type: 'spring', stiffness: 280 }}
                      className="relative rounded-[1.75rem] p-7 md:p-8 h-full flex flex-col items-center text-center overflow-hidden"
                      style={{
                        background: `linear-gradient(160deg, #FFFFFF 0%, ${LILAC} 100%)`,
                        border: `1.5px solid ${NAVY}`,
                        boxShadow: `0 10px 30px -12px ${NAVY}30, 0 4px 0 ${NAVY}10`,
                      }}
                    >
                      {/* Soft glow */}
                      <div
                        className="absolute -top-16 -right-16 w-48 h-48 rounded-full blur-3xl opacity-50"
                        style={{ background: `radial-gradient(circle, ${MINT}40, transparent 70%)` }}
                      />

                      <span
                        className="relative text-xs font-mono tracking-[0.2em] mb-5"
                        style={{ color: PURPLE }}
                      >
                        PASSO 01
                      </span>

                      {/* Animated avatar ring */}
                      <div className="relative h-28 w-28 mb-6">
                        {/* Rotating dashed ring */}
                        <motion.svg
                          className="absolute inset-0"
                          viewBox="0 0 100 100"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
                        >
                          <circle
                            cx="50"
                            cy="50"
                            r="46"
                            fill="none"
                            stroke={PURPLE}
                            strokeWidth="2"
                            strokeDasharray="6 8"
                            opacity="0.5"
                          />
                        </motion.svg>
                        {/* Progress arc */}
                        <svg className="absolute inset-0" viewBox="0 0 100 100">
                          <motion.circle
                            cx="50"
                            cy="50"
                            r="40"
                            fill="none"
                            stroke={MINT}
                            strokeWidth="4"
                            strokeLinecap="round"
                            strokeDasharray="251"
                            initial={{ strokeDashoffset: 251 }}
                            whileInView={{ strokeDashoffset: 75 }}
                            viewport={{ once: true }}
                            transition={{ duration: 1.4, delay: 0.3 }}
                            transform="rotate(-90 50 50)"
                          />
                        </svg>
                        {/* Inner avatar */}
                        <div
                          className="absolute inset-3 rounded-full flex items-center justify-center overflow-hidden"
                          style={{
                            background: `linear-gradient(135deg, ${LILAC}, #FFFFFF)`,
                            border: `1.5px solid ${NAVY}`,
                          }}
                        >
                          {/* Friendly profile illustration */}
                          <svg viewBox="0 0 64 64" className="w-full h-full">
                            {/* head */}
                            <circle cx="32" cy="26" r="11" fill="#F4C9A5" stroke={NAVY} strokeWidth="1.5" />
                            {/* hair */}
                            <path
                              d="M 21 22 Q 22 13 32 13 Q 42 13 43 22 Q 40 19 32 19 Q 24 19 21 22 Z"
                              fill={NAVY}
                            />
                            {/* smile */}
                            <path
                              d="M 28 29 Q 32 32 36 29"
                              stroke={NAVY}
                              strokeWidth="1.4"
                              fill="none"
                              strokeLinecap="round"
                            />
                            {/* eyes */}
                            <circle cx="28" cy="25" r="1.2" fill={NAVY} />
                            <circle cx="36" cy="25" r="1.2" fill={NAVY} />
                            {/* shoulders/shirt */}
                            <path
                              d="M 14 58 Q 14 42 32 42 Q 50 42 50 58 Z"
                              fill={MINT}
                              stroke={NAVY}
                              strokeWidth="1.5"
                            />
                          </svg>
                        </div>
                        {/* Tiny paw badge */}
                        <motion.div
                          className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: NAVY }}
                          animate={{ scale: [1, 1.1, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          <PawPrint className="w-4 h-4" style={{ color: MINT }} strokeWidth={2.5} />
                        </motion.div>
                      </div>

                      <span
                        className="relative text-xs font-medium mb-3 px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: `${MINT}40`, color: NAVY }}
                      >
                        menos de 2 min
                      </span>

                      <h3 className="relative text-xl font-bold mb-3" style={{ color: PURPLE }}>
                        crie seu perfil
                      </h3>
                      <p
                        className="relative text-sm leading-relaxed mb-5"
                        style={{ color: `${PURPLE}cc` }}
                      >
                        Conte sobre você, sua rotina e o tipo de companheiro ideal.
                      </p>

                      <div className="relative flex flex-wrap justify-center gap-2 mt-auto">
                        {['rotina', 'espaço', 'experiência'].map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full"
                            style={{ backgroundColor: `${MINT}30`, color: '#00A862' }}
                          >
                            {tag}
                            <Check className="h-3 w-3" strokeWidth={3} />
                          </span>
                        ))}
                      </div>
                    </motion.div>
                  </Link>
                </motion.div>

                {/* STEP 02 */}
                <motion.div
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 0.5, delay: 0.15 }}
                  className="relative"
                >
                  <Link to="/how-it-works" className="block group">
                    <motion.div
                      whileHover={{ y: -6 }}
                      transition={{ type: 'spring', stiffness: 280 }}
                      className="relative rounded-[1.75rem] p-7 md:p-8 h-full flex flex-col items-center text-center overflow-hidden"
                      style={{
                        background: `linear-gradient(160deg, #FFFFFF 0%, ${LILAC} 100%)`,
                        border: `1.5px solid ${NAVY}`,
                        boxShadow: `0 10px 30px -12px ${NAVY}30, 0 4px 0 ${NAVY}10`,
                      }}
                    >
                      <div
                        className="absolute -top-16 -left-16 w-48 h-48 rounded-full blur-3xl opacity-50"
                        style={{ background: `radial-gradient(circle, ${PURPLE}40, transparent 70%)` }}
                      />

                      <span
                        className="relative text-xs font-mono tracking-[0.2em] mb-5"
                        style={{ color: PURPLE }}
                      >
                        PASSO 02
                      </span>

                      {/* Match icon with sparkles */}
                      <div className="relative h-28 w-28 mb-6 flex items-center justify-center">
                        {/* Floating paw sparkles */}
                        {[
                          { x: -38, y: -10, d: 0, s: 14 },
                          { x: 36, y: -18, d: 0.3, s: 16 },
                          { x: 40, y: 22, d: 0.6, s: 12 },
                          { x: -36, y: 26, d: 0.9, s: 14 },
                          { x: 0, y: -42, d: 0.45, s: 10 },
                        ].map((p, i) => (
                          <motion.div
                            key={i}
                            className="absolute"
                            style={{ left: '50%', top: '50%' }}
                            animate={{
                              x: [p.x - 4, p.x + 4, p.x - 4],
                              y: [p.y - 4, p.y + 4, p.y - 4],
                              opacity: [0.3, 1, 0.3],
                              scale: [0.8, 1.1, 0.8],
                            }}
                            transition={{
                              duration: 2.4,
                              repeat: Infinity,
                              delay: p.d,
                              ease: 'easeInOut',
                            }}
                          >
                            <PawPrint
                              style={{ width: p.s, height: p.s, color: MINT }}
                              strokeWidth={2.4}
                              fill={MINT}
                              fillOpacity={0.3}
                            />
                          </motion.div>
                        ))}

                        {/* Center glowing match square */}
                        <motion.div
                          className="relative w-20 h-20 rounded-2xl flex items-center justify-center"
                          style={{
                            background: `linear-gradient(135deg, ${PURPLE}, ${NAVY})`,
                            border: `1.5px solid ${NAVY}`,
                            boxShadow: `0 0 30px ${PURPLE}60`,
                          }}
                          animate={{
                            boxShadow: [
                              `0 0 20px ${PURPLE}40`,
                              `0 0 40px ${MINT}80`,
                              `0 0 20px ${PURPLE}40`,
                            ],
                          }}
                          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
                        >
                          <div className="relative">
                            <PawPrint className="w-9 h-9" style={{ color: '#FFFFFF' }} strokeWidth={2.2} />
                            <motion.div
                              className="absolute -top-1 -right-2"
                              animate={{ scale: [1, 1.3, 1] }}
                              transition={{ duration: 1.6, repeat: Infinity }}
                            >
                              <Heart className="w-3.5 h-3.5" style={{ color: MINT }} fill={MINT} />
                            </motion.div>
                          </div>
                        </motion.div>

                        {/* Sparkle accents */}
                        <motion.div
                          className="absolute -top-2 -right-2"
                          animate={{ rotate: 360, scale: [1, 1.2, 1] }}
                          transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                        >
                          <Sparkles className="w-5 h-5" style={{ color: MINT }} strokeWidth={2.4} />
                        </motion.div>
                        <motion.div
                          className="absolute -bottom-1 -left-2"
                          animate={{ rotate: -360, scale: [1, 1.2, 1] }}
                          transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
                        >
                          <Sparkles className="w-4 h-4" style={{ color: PURPLE }} strokeWidth={2.4} />
                        </motion.div>
                      </div>

                      <span
                        className="relative text-xs font-medium mb-3 px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: `${PURPLE}20`, color: PURPLE }}
                      >
                        match inteligente
                      </span>

                      <h3 className="relative text-xl font-bold mb-3" style={{ color: PURPLE }}>
                        encontre pets compatíveis
                      </h3>
                      <p
                        className="relative text-sm leading-relaxed mb-5"
                        style={{ color: `${PURPLE}cc` }}
                      >
                        Nosso algoritmo cruza seu perfil com centenas de animais resgatados.
                      </p>

                      <div className="relative flex flex-wrap justify-center gap-2 mt-auto">
                        <span
                          className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full"
                          style={{ backgroundColor: `${MINT}30`, color: '#00A862' }}
                        >
                          compatibilidade real
                          <Check className="h-3 w-3" strokeWidth={3} />
                        </span>
                      </div>
                    </motion.div>
                  </Link>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
