import React from 'react';
import Footer from "@/components/home/Footer";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  PawPrint,
  ShieldCheck,
  Target,
  Home,
  Network,
  Users,
  CheckSquare,
  Heart,
  HandHeart,
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
  PartyPopper,
} from 'lucide-react';

const StatCard = ({ icon: Icon, label, value }: { icon: any; label: string; value: string }) => (
  <div className="rounded-2xl border border-pet-primary/30 bg-white p-4 text-center shadow-sm">
    <Icon className="mx-auto mb-2 h-6 w-6 text-pet-secondary-light" strokeWidth={1.75} />
    <div className="text-sm font-semibold text-pet-secondary">{label}</div>
    <div className="mt-1 text-base font-bold text-pet-primary-dark">{value}</div>
  </div>
);

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <h2 className="mb-5 text-center text-2xl font-extrabold text-pet-primary-dark">{children}</h2>
);

const ColumnCard = ({ children }: { children: React.ReactNode }) => (
  <div className="rounded-3xl bg-white p-6 shadow-md ring-1 ring-pet-secondary/5">{children}</div>
);

const Institution = () => {
  return (
    <div className="min-h-screen bg-pet-neutral">
      <main className="container mx-auto px-4 pt-28 pb-16">
        {/* Top banner */}
        <div className="mx-auto mb-6 max-w-6xl rounded-3xl bg-white p-5 text-center shadow-md ring-1 ring-pet-secondary/5">
          <h1 className="text-2xl md:text-3xl font-extrabold text-pet-primary-dark">
            Ong Clube amigo dos animais
          </h1>
        </div>

        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 lg:grid-cols-3">
          {/* COLUMN 1 — Profile & Impact */}
          <ColumnCard>
            <SectionTitle>Perfil e Impacto</SectionTitle>

            {/* Logo placeholder */}
            <div className="mb-4 flex h-32 items-center justify-center rounded-2xl bg-pet-neutral">
              <div className="flex flex-col items-center text-pet-secondary/60">
                <PawPrint className="h-10 w-10" strokeWidth={1.5} />
                <span className="mt-1 text-xs font-medium">Logo da ONG</span>
              </div>
            </div>

            {/* Founder */}
            <div className="mb-6 flex items-center gap-3">
              <img
                src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=60"
                alt="Fundadora Ana Silva"
                className="h-14 w-14 rounded-full object-cover ring-2 ring-pet-primary/40"
              />
              <div>
                <div className="text-xs text-pet-secondary/70">Fundadora</div>
                <div className="font-bold text-pet-secondary">Ana Silva</div>
              </div>
            </div>

            <h3 className="mb-3 text-center text-lg font-extrabold text-pet-secondary">
              Melhores momentos
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <StatCard icon={Calendar} label="Fundada em:" value="2015" />
              <StatCard icon={PawPrint} label="Resgates:" value="+2.000 Vidas" />
              <StatCard icon={ShieldCheck} label="Fundação:" value="Sede Própria" />
              <StatCard icon={Target} label="Foco:" value="Adoção Responsável" />
            </div>

            <h3 className="mt-6 mb-3 text-center text-lg font-extrabold text-pet-secondary">
              Quem Somos
            </h3>
            <p className="text-center text-sm leading-relaxed text-pet-secondary/80">
              Somos uma ONG dedicada ao resgate e reabilitação de animais abandonados. Fundada em
              2015, já ajudamos mais de 2.000 animais a encontrarem um novo lar através da adoção
              responsável — transformando uma ação pontual em uma missão de vida.
            </p>
          </ColumnCard>

          {/* COLUMN 2 — History & Structure */}
          <ColumnCard>
            <SectionTitle>Nossa História & Estrutura</SectionTitle>

            <h3 className="mb-4 text-center text-lg font-extrabold text-pet-secondary">
              Nossa História
            </h3>

            {/* Timeline */}
            <div className="relative pl-6">
              <div className="absolute left-2 top-2 bottom-2 w-px bg-pet-primary/40" />
              <div className="relative">
                <span className="absolute -left-[18px] top-1.5 h-3 w-3 rounded-full bg-pet-primary ring-4 ring-pet-primary/20" />
                <div className="rounded-2xl bg-pet-neutral p-4">
                  <div className="mb-1 flex items-center justify-between">
                    <h4 className="font-bold text-pet-secondary">2015: Fundação</h4>
                    <PartyPopper className="h-4 w-4 text-pet-primary-dark" />
                  </div>
                  <p className="text-sm leading-relaxed text-pet-secondary/80">
                    Tudo começou quando Ana Silva resgatou um grupo de filhotes abandonados.
                    Mobilizou amigos e familiares para cuidar dos animais enquanto buscava
                    adotantes. O que era uma ação pontual virou uma missão de vida — e nasceu
                    nossa ONG.
                  </p>
                </div>
              </div>
            </div>

            <h3 className="mt-6 mb-4 text-center text-lg font-extrabold text-pet-secondary">
              Nossa Estrutura
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <StatCard icon={Home} label="Sede:" value="Abrigo Próprio (+100)" />
              <StatCard icon={Network} label="Rede:" value="+50 Lares Temp." />
              <StatCard icon={Users} label="Equipe:" value="15 Func. + 80 Vol." />
              <StatCard icon={CheckSquare} label="Atividades:" value="Feiras & Castração" />
            </div>
          </ColumnCard>

          {/* COLUMN 3 — Gallery & Connection */}
          <ColumnCard>
            <SectionTitle>Galeria e Conexão</SectionTitle>

            <figure className="mb-3">
              <img
                src="https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=600&auto=format&fit=crop&q=60"
                alt="Olhar de Gratidão"
                className="h-40 w-full rounded-2xl object-cover"
              />
              <figcaption className="mt-1 text-center text-xs font-medium text-pet-secondary/80">
                Olhar de Gratidão
              </figcaption>
            </figure>

            <figure className="mb-3">
              <img
                src="https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=600&auto=format&fit=crop&q=60"
                alt="Novos Amigos em Liberdade"
                className="h-32 w-full rounded-2xl object-cover"
              />
              <figcaption className="mt-1 text-center text-xs font-medium text-pet-secondary/80">
                Novos Amigos em Liberdade
              </figcaption>
            </figure>

            <div className="mb-4 grid grid-cols-2 gap-3">
              <figure>
                <img
                  src="https://images.unsplash.com/photo-1592194996308-7b43878e84a6?w=400&auto=format&fit=crop&q=60"
                  alt="Amor e Cuidado"
                  className="h-24 w-full rounded-2xl object-cover"
                />
                <figcaption className="mt-1 text-center text-xs font-medium text-pet-secondary/80">
                  Amor e Cuidado
                </figcaption>
              </figure>
              <figure>
                <img
                  src="https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&auto=format&fit=crop&q=60"
                  alt="Um Lar para Sempre"
                  className="h-24 w-full rounded-2xl object-cover"
                />
                <figcaption className="mt-1 text-center text-xs font-medium text-pet-secondary/80">
                  Um Lar para Sempre
                </figcaption>
              </figure>
            </div>

            {/* Social */}
            <h3 className="mb-1 text-center text-lg font-extrabold text-pet-secondary">
              Redes Sociais
            </h3>
            <p className="mb-3 text-center text-sm text-pet-secondary/70">
              Conecte-se: <span className="font-semibold">@AbrigoEsperanca</span>
            </p>
            <div className="mb-6 flex justify-center gap-3">
              {[
                { Icon: Instagram, href: 'https://instagram.com', label: 'Instagram' },
                { Icon: Facebook, href: 'https://facebook.com', label: 'Facebook' },
                { Icon: Twitter, href: 'https://twitter.com', label: 'Twitter' },
                { Icon: Linkedin, href: 'https://linkedin.com', label: 'LinkedIn' },
              ].map(({ Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex h-11 w-11 items-center justify-center rounded-xl bg-pet-secondary text-white transition hover:bg-pet-secondary-light"
                >
                  <Icon className="h-5 w-5" />
                </a>
              ))}
            </div>

            {/* CTAs */}
            <h3 className="mb-3 text-center text-lg font-extrabold text-pet-secondary">
              Botão de Ação
            </h3>
            <Button
              className="mb-2 h-12 w-full rounded-full bg-pet-primary text-pet-secondary font-bold text-base shadow-md hover:bg-pet-primary-dark hover:text-white"
            >
              <Heart className="mr-2 h-5 w-5" /> Apadrinhe um Animal
            </Button>
            <Button
              variant="outline"
              className="h-10 w-full rounded-full border-pet-secondary/30 text-pet-secondary hover:bg-pet-neutral"
            >
              <HandHeart className="mr-2 h-4 w-4" /> Faça uma Doação
            </Button>
          </ColumnCard>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Institution;
