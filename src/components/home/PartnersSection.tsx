import { motion } from 'framer-motion';
import { Heart, Stethoscope, Cpu, Users, Sparkles } from 'lucide-react';

interface PartnersSectionProps {
  isVisible: boolean;
}

const PartnersSection = ({ isVisible }: PartnersSectionProps) => {
  const nodes = [
    {
      key: 'ngos',
      icon: Heart,
      title: 'ONGs & Abrigos',
      description: 'resgatam, cuidam e reabilitam',
      stat: '+120 parceiras',
      angle: 'top',
    },
    {
      key: 'vets',
      icon: Stethoscope,
      title: 'Clínicas veterinárias',
      description: 'saúde, vacinas e castração',
      stat: '+80 clínicas',
      angle: 'right',
    },
    {
      key: 'tech',
      icon: Cpu,
      title: 'Parceiros tech',
      description: 'pagamentos, dados e infra',
      stat: '8 integrações',
      angle: 'bottom',
    },
    {
      key: 'adopters',
      icon: Users,
      title: 'Adotantes',
      description: 'famílias reais, prontas pra amar',
      stat: '+1.200 ativas',
      angle: 'left',
    },
  ];

  return (
    <section id="partners" className="py-24 bg-background relative overflow-hidden">
      {/* soft background grid */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.03] [background-image:linear-gradient(to_right,hsl(var(--foreground))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--foreground))_1px,transparent_1px)] [background-size:48px_48px]"
      />

      <div className="container mx-auto px-4 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 rounded-full bg-primary/10 text-primary text-sm font-medium border border-primary/20">
            <Sparkles className="h-3.5 w-3.5" />
            nosso ecossistema
          </span>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-5 leading-[1.1]">
            uma rede que faz <span className="text-primary">a adoção acontecer</span>
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Conectamos ONGs, clínicas, parceiros de tecnologia e adotantes em uma única plataforma —
            cada peça torna a próxima adoção mais rápida, segura e humana.
          </p>
        </motion.div>

        {/* Ecosystem diagram */}
        <div className="relative max-w-5xl mx-auto">
          {/* Center hub */}
          <div className="relative h-[520px] md:h-[560px]">
            {/* connecting lines (desktop only) */}
            <svg
              aria-hidden
              className="hidden md:block absolute inset-0 w-full h-full pointer-events-none"
              viewBox="0 0 800 560"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.5" />
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.05" />
                </linearGradient>
              </defs>
              {[
                { x: 400, y: 70 },
                { x: 700, y: 280 },
                { x: 400, y: 490 },
                { x: 100, y: 280 },
              ].map((p, i) => (
                <motion.line
                  key={i}
                  x1="400"
                  y1="280"
                  x2={p.x}
                  y2={p.y}
                  stroke="url(#lineGrad)"
                  strokeWidth="1.5"
                  strokeDasharray="4 6"
                  initial={{ pathLength: 0, opacity: 0 }}
                  whileInView={{ pathLength: 1, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.2, delay: 0.2 + i * 0.15 }}
                />
              ))}
            </svg>

            {/* Center: PetMatch hub */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10"
            >
              <div className="relative">
                <motion.div
                  animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0, 0.4] }}
                  transition={{ duration: 2.5, repeat: Infinity }}
                  className="absolute inset-0 rounded-full bg-primary/30"
                />
                <motion.div
                  animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0, 0.3] }}
                  transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
                  className="absolute inset-0 rounded-full bg-primary/20"
                />
                <div className="relative h-28 w-28 md:h-32 md:w-32 rounded-full bg-gradient-to-br from-primary to-primary/70 shadow-2xl shadow-primary/40 flex items-center justify-center text-primary-foreground">
                  <div className="text-center">
                    <div className="text-2xl md:text-3xl font-bold leading-none">🐾</div>
                    <div className="text-[10px] md:text-xs font-semibold tracking-wider mt-1">
                      PETMATCH
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Nodes */}
            {nodes.map((node, i) => {
              const Icon = node.icon;
              const positions: Record<string, string> = {
                top: 'left-1/2 top-0 -translate-x-1/2',
                right: 'right-0 top-1/2 -translate-y-1/2',
                bottom: 'left-1/2 bottom-0 -translate-x-1/2',
                left: 'left-0 top-1/2 -translate-y-1/2',
              };
              return (
                <motion.div
                  key={node.key}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.4 + i * 0.12 }}
                  className={`absolute md:${positions[node.angle]} ${
                    i === 0
                      ? 'left-1/2 -translate-x-1/2 top-0'
                      : i === 1
                      ? 'right-0 top-[35%] md:top-1/2 md:-translate-y-1/2'
                      : i === 2
                      ? 'left-1/2 -translate-x-1/2 bottom-0'
                      : 'left-0 top-[35%] md:top-1/2 md:-translate-y-1/2'
                  } w-[160px] md:w-[200px]`}
                >
                  <motion.div
                    whileHover={{ y: -4, scale: 1.03 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                    className="bg-card border border-border rounded-2xl p-4 md:p-5 shadow-lg hover:shadow-xl hover:border-primary/40 transition-all"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-bold text-sm md:text-base leading-tight">
                          {node.title}
                        </h3>
                        <p className="text-[10px] md:text-xs text-primary/70 font-mono">
                          {node.stat}
                        </p>
                      </div>
                    </div>
                    <p className="text-xs md:text-sm text-muted-foreground leading-snug">
                      {node.description}
                    </p>
                  </motion.div>
                </motion.div>
              );
            })}
          </div>

          {/* Stats strip */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="mt-12 md:mt-16 grid grid-cols-2 md:grid-cols-4 gap-px bg-border rounded-2xl overflow-hidden border border-border"
          >
            {[
              { value: '1.200+', label: 'adoções realizadas' },
              { value: '120+', label: 'ONGs parceiras' },
              { value: '80+', label: 'clínicas conectadas' },
              { value: '24/7', label: 'plataforma ativa' },
            ].map((s, i) => (
              <div key={i} className="bg-card p-5 md:p-6 text-center">
                <div className="text-2xl md:text-3xl font-bold text-primary">{s.value}</div>
                <div className="text-xs md:text-sm text-muted-foreground mt-1">{s.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default PartnersSection;
