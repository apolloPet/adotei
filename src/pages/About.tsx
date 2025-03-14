import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Footer from "@/components/home/Footer";
import { PawPrint } from 'lucide-react';

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 pt-32 pb-16">
        <Card className="max-w-4xl mx-auto">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="flex items-center justify-center w-24 h-24 rounded-full bg-primary/10">
                <PawPrint className="h-12 w-12 text-primary" />
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
            
            <section>
              <h2 className="text-2xl font-bold text-primary mb-3">Nossa Visão</h2>
              <p className="text-muted-foreground leading-relaxed">
                Acreditamos em um mundo onde nenhum animal será abandonado e todos terão 
                a oportunidade de encontrar um lar amoroso. Nossa visão é ser a principal 
                plataforma de adoção responsável no Brasil, criando pontes entre ONGs, 
                protetores independentes e adotantes responsáveis.
              </p>
            </section>
            
            <section>
              <h2 className="text-2xl font-bold text-primary mb-3">Nossos Valores</h2>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li><span className="font-semibold">Inovação</span>: Buscamos constantemente novas soluções para os desafios da causa animal.</li>
                <li><span className="font-semibold">Transparência</span>: Mantemos processos claros e comunicação aberta com todos os envolvidos.</li>
                <li><span className="font-semibold">Responsabilidade</span>: Promovemos a adoção consciente e o bem-estar animal em primeiro lugar.</li>
                <li><span className="font-semibold">Colaboração</span>: Trabalhamos em parceria com ONGs, clínicas veterinárias e voluntários.</li>
                <li><span className="font-semibold">Impacto social</span>: Medimos nosso sucesso pelo número de vidas animais transformadas.</li>
              </ul>
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
            
            <section>
              <h2 className="text-2xl font-bold text-primary mb-3">Entre em Contato</h2>
              <p className="text-muted-foreground leading-relaxed">
                Estamos sempre abertos a parcerias, sugestões e feedbacks. Se você tem uma ONG, 
                é um protetor independente ou simplesmente quer saber mais sobre nosso trabalho, 
                entre em contato conosco através dos contatos no rodapé desta página.
              </p>
            </section>
          </CardContent>
        </Card>
      </main>
      
      <Footer />
    </div>
  );
};

export default About;
