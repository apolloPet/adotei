import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Heart, MessageCircle, PawPrint, Search, ShieldCheck, User } from 'lucide-react';

const HowItWorks = () => {
  const steps = [
    {
      icon: <User className="h-10 w-10 text-primary" />,
      title: "Crie sua conta",
      description: "Cadastre-se gratuitamente na plataforma, fornecendo informações sobre você e seu estilo de vida."
    },
    {
      icon: <Search className="h-10 w-10 text-primary" />,
      title: "Encontre um pet",
      description: "Navegue pelos perfis dos animais disponíveis ou use filtros para encontrar o pet perfeito para você."
    },
    {
      icon: <Heart className="h-10 w-10 text-primary" />,
      title: "Demonstre interesse",
      description: "Quando encontrar um animal que goste, solicite um 'match' para demonstrar seu interesse em adotá-lo."
    },
    {
      icon: <ShieldCheck className="h-10 w-10 text-primary" />,
      title: "Avaliação da ONG",
      description: "A ONG responsável pelo animal avaliará seu perfil para garantir que você é um bom match para o pet."
    },
    {
      icon: <MessageCircle className="h-10 w-10 text-primary" />,
      title: "Conheça o pet",
      description: "Após a aprovação inicial, você será convidado para conhecer o animal pessoalmente no abrigo."
    },
    {
      icon: <PawPrint className="h-10 w-10 text-primary" />,
      title: "Adoção finalizada",
      description: "Se tudo der certo, você assinará um termo de adoção responsável e levará seu novo amigo para casa!"
    }
  ];

  const faqs = [
    {
      question: "Há algum custo para adotar um animal pelo PetMatch?",
      answer: "O PetMatch é uma plataforma gratuita. No entanto, algumas ONGs podem solicitar uma taxa de adoção para cobrir custos com vacinas, castração e cuidados veterinários."
    },
    {
      question: "Como sei se um pet é adequado para mim?",
      answer: "Consideramos vários fatores como seu estilo de vida, espaço em casa, tempo disponível e experiência prévia com animais. Nossa plataforma sugere pets que combinam com seu perfil."
    },
    {
      question: "O que acontece se a adoção não der certo?",
      answer: "As ONGs parceiras oferecem suporte pós-adoção. Se surgir algum problema, entre em contato imediatamente. Em casos extremos onde a adaptação não é possível, o animal pode retornar à ONG."
    },
    {
      question: "Posso adotar se moro em apartamento?",
      answer: "Sim! Muitos pets se adaptam perfeitamente a apartamentos. O importante é que o animal receba atenção, exercícios adequados e um ambiente seguro."
    },
    {
      question: "Como funciona o processo de aprovação?",
      answer: "As ONGs avaliam fatores como condições de moradia, rotina familiar, experiência com animais e compromisso com a adoção responsável. O objetivo é garantir o bem-estar do animal a longo prazo."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 pt-32 pb-16">
        <Card className="max-w-4xl mx-auto mb-10">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold">Como Funciona</CardTitle>
            <CardDescription>Entenda o processo de adoção passo a passo</CardDescription>
          </CardHeader>
          
          <CardContent>
            <div className="grid md:grid-cols-2 gap-8">
              {steps.map((step, index) => (
                <div key={index} className="flex gap-4 items-start">
                  <div className="p-3 rounded-full bg-primary/10 flex-shrink-0">
                    {step.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">
                      <span className="text-primary mr-2">{index + 1}.</span> 
                      {step.title}
                    </h3>
                    <p className="text-muted-foreground">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card className="max-w-4xl mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold">Perguntas Frequentes</CardTitle>
            <CardDescription>Tire suas dúvidas sobre o processo de adoção</CardDescription>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-6">
              {faqs.map((faq, index) => (
                <div key={index} className="rounded-lg border p-4 hover:bg-secondary/50 transition-colors">
                  <h3 className="text-lg font-bold mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default HowItWorks;
