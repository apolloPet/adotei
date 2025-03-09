
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Header from "@/components/Header";

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 pt-32 pb-16">
        <Card className="max-w-4xl mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold">Sobre Nós</CardTitle>
            <CardDescription>Conheça a história e missão do PetMatch</CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <section>
              <h2 className="text-2xl font-bold text-primary mb-3">Nossa Missão</h2>
              <p className="text-muted-foreground leading-relaxed">
                O PetMatch nasceu da paixão por conectar animais abandonados a lares amorosos. 
                Nossa missão é reduzir o número de animais em abrigos, facilitando o processo 
                de adoção e garantindo que cada pet encontre uma família que o ame e cuide dele adequadamente.
              </p>
            </section>
            
            <section>
              <h2 className="text-2xl font-bold text-primary mb-3">Quem Somos</h2>
              <p className="text-muted-foreground leading-relaxed">
                Somos uma equipe de amantes de animais, desenvolvedores e voluntários dedicados 
                a fazer a diferença na vida dos animais abandonados. Trabalhamos em parceria com 
                abrigos e ONGs de proteção animal em todo o Brasil, criando uma plataforma que 
                facilita o encontro entre adotantes e pets que precisam de um lar.
              </p>
            </section>
            
            <section>
              <h2 className="text-2xl font-bold text-primary mb-3">Nossa História</h2>
              <p className="text-muted-foreground leading-relaxed">
                O PetMatch surgiu em 2023, quando percebemos que muitos abrigos tinham dificuldade 
                em divulgar seus animais disponíveis para adoção. Decidimos criar uma plataforma 
                moderna e intuitiva que pudesse conectar esses animais a pessoas interessadas em adotar, 
                usando a tecnologia para facilitar esse encontro. Desde então, já ajudamos centenas 
                de pets a encontrarem seus lares para sempre.
              </p>
            </section>
            
            <section>
              <h2 className="text-2xl font-bold text-primary mb-3">Nossos Valores</h2>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li><span className="font-semibold">Bem-estar animal</span>: Priorizamos sempre o que é melhor para os animais.</li>
                <li><span className="font-semibold">Adoção responsável</span>: Promovemos a adoção consciente e responsável.</li>
                <li><span className="font-semibold">Transparência</span>: Somos claros em nossos processos e comunicação.</li>
                <li><span className="font-semibold">Inclusão</span>: Acreditamos que todos merecem a chance de conhecer o amor de um pet.</li>
                <li><span className="font-semibold">Comunidade</span>: Construímos uma rede de apoio entre adotantes, abrigos e voluntários.</li>
              </ul>
            </section>
            
            <section>
              <h2 className="text-2xl font-bold text-primary mb-3">Junte-se a Nós</h2>
              <p className="text-muted-foreground leading-relaxed">
                Se você compartilha da nossa paixão por ajudar animais, considere se voluntariar em um 
                abrigo parceiro, adotar um pet ou compartilhar nossa plataforma com seus amigos e familiares. 
                Cada pequena ação faz diferença na vida desses animais.
              </p>
            </section>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default About;
