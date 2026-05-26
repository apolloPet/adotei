import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  PawPrint,
  Heart,
  X,
  Bookmark,
  Syringe,
  Scissors,
  Star,
  Sparkles,
  Clock,
  MapPin,
  ClipboardCheck,
  Home,
  ShieldCheck,
  FileSignature,
} from "lucide-react";

const STORAGE_KEY = "adotei.onboarding.completed.v1";

const OnboardingTour = () => {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    try {
      const done = localStorage.getItem(STORAGE_KEY);
      if (!done) setOpen(true);
    } catch {
      setOpen(true);
    }
  }, []);

  const finish = () => {
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* ignore */
    }
    setOpen(false);
  };

  const steps = [
    {
      title: "Bem-vindo ao Adotei",
      description: "Conectamos você ao seu novo melhor amigo de forma responsável.",
      content: (
        <div className="space-y-3 text-sm">
          <div className="flex items-start gap-3">
            <div className="rounded-full bg-primary/10 p-2">
              <PawPrint className="h-5 w-5 text-primary" />
            </div>
            <p>
              Aqui você descobre animais disponíveis para adoção, conhece suas histórias e demonstra interesse
              em quem combina com seu estilo de vida.
            </p>
          </div>
          <p className="text-muted-foreground">
            Em poucos passos vamos te explicar como funciona e o que significa cada informação no card do animal.
          </p>
        </div>
      ),
    },
    {
      title: "Etapas da adoção",
      description: "Veja o caminho até levar seu novo amigo para casa.",
      content: (
        <ol className="space-y-3 text-sm">
          {[
            { icon: Heart, t: "Demonstre interesse", d: "Deslize para a direita ou toque no coração no animal que combinou com você." },
            { icon: ClipboardCheck, t: "Análise da ONG", d: "A ONG analisa seu perfil para garantir uma adoção segura e compatível." },
            { icon: Home, t: "Visita e entrevista", d: "Conheça o animal pessoalmente e converse com a equipe responsável." },
            { icon: FileSignature, t: "Termo de adoção", d: "Assinatura do contrato e orientações para os primeiros dias." },
            { icon: ShieldCheck, t: "Acompanhamento", d: "A ONG faz follow-ups para garantir o bem-estar do animal." },
          ].map(({ icon: Icon, t, d }, i) => (
            <li key={i} className="flex items-start gap-3">
              <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                {i + 1}
              </div>
              <div>
                <div className="flex items-center gap-2 font-medium">
                  <Icon className="h-4 w-4 text-primary" />
                  {t}
                </div>
                <p className="text-muted-foreground">{d}</p>
              </div>
            </li>
          ))}
        </ol>
      ),
    },
    {
      title: "Entendendo o card do animal",
      description: "O que cada ícone e abreviação significa.",
      content: (
        <div className="space-y-4 text-sm">
          <div>
            <p className="mb-2 font-medium">Indicadores no topo</p>
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-primary px-2.5 py-1 text-xs font-semibold text-primary-foreground">
                  <Sparkles className="h-3.5 w-3.5" /> 85%
                </span>
                <span className="text-muted-foreground">Compatibilidade com seu perfil</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 text-xs">
                  <Clock className="h-3.5 w-3.5" /> 120d
                </span>
                <span className="text-muted-foreground">Dias aguardando adoção</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 text-xs">
                  <MapPin className="h-3.5 w-3.5" /> Localização
                </span>
                <span className="text-muted-foreground">Cidade/estado do animal</span>
              </li>
            </ul>
          </div>

          <div>
            <p className="mb-2 font-medium">Abreviações</p>
            <div className="grid grid-cols-2 gap-2 text-muted-foreground">
              <div><b className="text-foreground">P / M / G</b> — Porte (pequeno, médio, grande)</div>
              <div><b className="text-foreground">♂ / ♀</b> — Macho / Fêmea</div>
              <div><b className="text-foreground">3a</b> — Idade em anos</div>
              <div><b className="text-foreground">120d</b> — Dias no abrigo</div>
            </div>
          </div>

          <div>
            <p className="mb-2 font-medium">Ícones de saúde e perfil</p>
            <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <li className="flex items-center gap-2"><Syringe className="h-4 w-4 text-primary" /> Vacinado</li>
              <li className="flex items-center gap-2"><Scissors className="h-4 w-4" /> Castrado</li>
              <li className="flex items-center gap-2"><Star className="h-4 w-4 text-accent" /> Necessidades especiais</li>
              <li className="flex items-center gap-2"><Heart className="h-4 w-4 text-primary" /> Traço de personalidade</li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      title: "Como interagir",
      description: "Gestos e botões para navegar pelos animais.",
      content: (
        <div className="space-y-3 text-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-primary/10 p-2"><Heart className="h-5 w-5 text-primary" /></div>
            <div><b>Deslize para a direita</b> ou toque no coração — demonstrar interesse na adoção.</div>
          </div>
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-muted p-2"><X className="h-5 w-5" /></div>
            <div><b>Deslize para a esquerda</b> — passar para o próximo animal.</div>
          </div>
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-accent/20 p-2"><Bookmark className="h-5 w-5 text-accent" /></div>
            <div><b>Salvar</b> — guardar o animal para decidir depois.</div>
          </div>
          <p className="rounded-md bg-muted/50 p-3 text-xs text-muted-foreground">
            ⚠️ Adoção é responsável e definitiva. Avalie tempo, espaço, orçamento e o compromisso de longo prazo
            antes de demonstrar interesse.
          </p>
        </div>
      ),
    },
  ];

  const current = steps[step];
  const isLast = step === steps.length - 1;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && finish()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{current.title}</DialogTitle>
          <DialogDescription>{current.description}</DialogDescription>
        </DialogHeader>

        <div className="py-2">{current.content}</div>

        <div className="flex items-center justify-center gap-1.5 py-2">
          {steps.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full transition-all ${
                i === step ? "w-6 bg-primary" : "w-1.5 bg-muted"
              }`}
            />
          ))}
        </div>

        <div className="flex items-center justify-between gap-2">
          <Button variant="ghost" size="sm" onClick={finish}>
            Pular
          </Button>
          <div className="flex gap-2">
            {step > 0 && (
              <Button variant="outline" size="sm" onClick={() => setStep((s) => s - 1)}>
                Voltar
              </Button>
            )}
            {isLast ? (
              <Button size="sm" onClick={finish}>Começar</Button>
            ) : (
              <Button size="sm" onClick={() => setStep((s) => s + 1)}>Próximo</Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OnboardingTour;
