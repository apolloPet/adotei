import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Footer from "@/components/home/Footer";
import { Building2, Mail, Instagram, Globe, Heart } from 'lucide-react';

const PetMatch = () => {
  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 pt-32 pb-16">
        <Card className="max-w-4xl mx-auto">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="flex items-center justify-center w-24 h-24 rounded-full bg-primary/10">
                <Building2 className="h-12 w-12 text-primary" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold">PetMatch</CardTitle>
            <CardDescription>Conectando corações e patinhas desde 2023</CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <section>
              <h2 className="text-2xl font-bold text-primary mb-3">Nossa Empresa</h2>
              <p className="text-muted-foreground leading-relaxed">
                A PetMatch é uma startup inovadora focada em criar soluções tecnológicas para 
                facilitar a adoção de animais em todo o Brasil. Fundada em 2023, nossa empresa 
                surgiu da paixão de um grupo de desenvolvedores e amantes de animais que 
                acreditam no poder da tecnologia para resolver problemas sociais.
              </p>
            </section>
            
            <section className="flex flex-col md:flex-row gap-6 items-center">
              <div className="w-full md:w-1/2 h-64 bg-muted rounded-lg overflow-hidden flex items-center justify-center">
                <img 
                  src="/lovable-uploads/4bfa2ce9-d3d8-41a2-b975-ee63a683739f.png" 
                  alt="Tech Animal Logo" 
                  className="w-4/5 h-auto object-contain"
                />
              </div>
              <div className="w-full md:w-1/2 space-y-4">
                <h2 className="text-2xl font-bold text-primary">Nossa Missão</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Acreditamos em um mundo onde nenhum animal será abandonado e todos terão 
                  a oportunidade de encontrar um lar amoroso. Nossa missão é conectar, através da tecnologia,
                  ONGs e protetores independentes com adotantes responsáveis.
                </p>
              </div>
            </section>
            
            <section>
              <h2 className="text-2xl font-bold text-primary mb-3">Nossos Valores</h2>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li><span className="font-semibold">Inovação</span>: Buscamos constantemente novas soluções para os desafios da causa animal.</li>
                <li><span className="font-semibold">Transparência</span>: Mantemos processos claros e comunicação aberta com todos os envolvidos.</li>
                <li><span className="font-semibold">Responsabilidade</span>: Promovemos a adoção consciente e o bem-estar animal em primeiro lugar.</li>
                <li><span className="font-semibold">Colaboração</span>: Trabalhamos em parceria com ONGs, clínicas veterinárias e voluntários.</li>
                <li><span className="font-semibold">Impacto social</span>: Medimos nosso sucesso pelo número de vidas animais transformadas.</li>
                <li><span className="font-semibold">Liderança</span>: Lideramos pelo exemplo e buscamos ser referência no setor.</li>
              </ul>
            </section>
            
            <section className="bg-primary/5 p-6 rounded-lg">
              <h2 className="text-2xl font-bold text-primary mb-3">Nosso Lema</h2>
              <div className="flex items-center gap-4">
                <Heart className="h-10 w-10 text-primary flex-shrink-0" />
                <p className="text-lg italic">
                  "Não lute apenas para ter grandes clientes. Trabalhe para conquistar bons e fiéis amigos."
                </p>
              </div>
            </section>
            
            <section>
              <h2 className="text-2xl font-bold text-primary mb-3">Nossa Equipe</h2>
              <p className="text-muted-foreground leading-relaxed">
                Somos uma equipe multidisciplinar de desenvolvedores, designers, especialistas em 
                experiência do usuário e profissionais apaixonados pela causa animal. Cada membro 
                da nossa equipe traz sua experiência única e compromisso com a missão de 
                revolucionar o processo de adoção de animais no Brasil.
              </p>
            </section>
            
            <section className="bg-primary/5 p-6 rounded-lg">
              <h2 className="text-2xl font-bold text-primary mb-3">Entre em Contato</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-primary" />
                  <span className="text-muted-foreground">contato@petmatch.com.br</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Instagram className="h-5 w-5 text-primary" />
                  <span className="text-muted-foreground">@petmatch_brasil</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Globe className="h-5 w-5 text-primary" />
                  <span className="text-muted-foreground">www.petmatch.com.br</span>
                </div>
              </div>
            </section>
          </CardContent>
        </Card>
      </main>
      
      <Footer />
    </div>
  );
};

export default PetMatch;
