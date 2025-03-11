
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "@/components/Header";
import Footer from "@/components/home/Footer";
import { Building2, HandHeart, Users } from 'lucide-react';

const Institution = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 pt-32 pb-16">
        <Card className="max-w-4xl mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold">Nossa Instituição</CardTitle>
            <CardDescription>Conheça mais sobre a ONG e nossos parceiros</CardDescription>
          </CardHeader>
          
          <CardContent>
            <Tabs defaultValue="about" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="about" className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  <span>A ONG</span>
                </TabsTrigger>
                <TabsTrigger value="mission" className="flex items-center gap-2">
                  <HandHeart className="h-4 w-4" />
                  <span>Nossa Missão</span>
                </TabsTrigger>
                <TabsTrigger value="partners" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>Parceiros</span>
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="about" className="mt-6 space-y-6">
                <section>
                  <h2 className="text-2xl font-bold text-primary mb-3">Quem Somos</h2>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    Somos uma organização não governamental dedicada ao resgate e reabilitação 
                    de animais abandonados. Fundada em 2015, nossa instituição já ajudou mais 
                    de 2.000 animais a encontrarem novos lares através de adoção responsável.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                    <div className="rounded-lg overflow-hidden h-64 bg-muted">
                      <img 
                        src="https://images.unsplash.com/photo-1592194996308-7b43878e84a6?w=800&auto=format&fit=crop&q=60" 
                        alt="Voluntários da ONG" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="rounded-lg overflow-hidden h-64 bg-muted">
                      <img 
                        src="https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=800&auto=format&fit=crop&q=60" 
                        alt="Animais resgatados" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                </section>
                
                <section>
                  <h2 className="text-2xl font-bold text-primary mb-3">Nossa História</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Tudo começou quando nossa fundadora, Ana Silva, resgatou um grupo de filhotes 
                    abandonados em um terreno baldio. Sem ter para onde levá-los, ela mobilizou 
                    amigos e familiares para cuidar dos animais enquanto buscavam adotantes. 
                    O que era para ser uma ação pontual se transformou em uma missão de vida, 
                    e assim nasceu nossa ONG.
                  </p>
                </section>
                
                <section>
                  <h2 className="text-2xl font-bold text-primary mb-3">Nossa Estrutura</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Hoje contamos com um abrigo próprio com capacidade para acolher até 100 animais, 
                    uma rede de mais de 50 lares temporários e uma equipe de 15 funcionários e 
                    mais de 80 voluntários. Realizamos feiras de adoção mensais e trabalhamos 
                    constantemente em campanhas de castração e vacinação em comunidades carentes.
                  </p>
                </section>
              </TabsContent>
              
              <TabsContent value="mission" className="mt-6 space-y-6">
                <section>
                  <h2 className="text-2xl font-bold text-primary mb-3">O Que Fazemos</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Resgate</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">
                          Atuamos no resgate de animais em situação de abandono, maus-tratos 
                          ou risco, oferecendo atendimento veterinário imediato e reabilitação.
                        </p>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Reabilitação</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">
                          Oferecemos tratamento veterinário, alimentação adequada e socialização 
                          para preparar os animais para adoção.
                        </p>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Adoção Responsável</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">
                          Promovemos a adoção consciente, com acompanhamento pós-adoção 
                          para garantir o bem-estar dos animais em seus novos lares.
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </section>
                
                <section>
                  <h2 className="text-2xl font-bold text-primary mb-3">Programas Especiais</h2>
                  <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                    <li><span className="font-semibold">Castração Solidária</span>: Oferecemos castração a preço social para famílias de baixa renda.</li>
                    <li><span className="font-semibold">Educação nas Escolas</span>: Visitamos escolas para ensinar sobre guarda responsável e bem-estar animal.</li>
                    <li><span className="font-semibold">Adote um Idoso</span>: Programa especial para incentivar a adoção de animais seniores.</li>
                    <li><span className="font-semibold">Apadrinhamento</span>: Possibilidade de ajudar um animal específico enquanto ele aguarda adoção.</li>
                  </ul>
                </section>
                
                <section>
                  <h2 className="text-2xl font-bold text-primary mb-3">Impacto Social</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Além do impacto direto na vida dos animais, nosso trabalho gera transformação 
                    social nas comunidades onde atuamos. Através da educação e conscientização, 
                    buscamos criar uma cultura de respeito e responsabilidade para com os animais, 
                    reduzindo abandono e maus-tratos.
                  </p>
                </section>
              </TabsContent>
              
              <TabsContent value="partners" className="mt-6 space-y-6">
                <section>
                  <h2 className="text-2xl font-bold text-primary mb-3">Nossos Parceiros</h2>
                  <p className="text-muted-foreground leading-relaxed mb-6">
                    Nosso trabalho só é possível graças aos parceiros que acreditam em nossa causa 
                    e nos apoiam de diferentes formas. Conheça alguns deles:
                  </p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    <div className="flex flex-col items-center">
                      <div className="w-32 h-32 bg-muted rounded-lg flex items-center justify-center mb-4">
                        <span className="text-primary font-bold">Pet Clinic</span>
                      </div>
                      <h3 className="font-medium">Clínica Veterinária Pet Clinic</h3>
                      <p className="text-sm text-muted-foreground text-center mt-1">
                        Oferece desconto em consultas e cirurgias para nossos animais.
                      </p>
                    </div>
                    
                    <div className="flex flex-col items-center">
                      <div className="w-32 h-32 bg-muted rounded-lg flex items-center justify-center mb-4">
                        <span className="text-primary font-bold">PetFood</span>
                      </div>
                      <h3 className="font-medium">PetFood Brasil</h3>
                      <p className="text-sm text-muted-foreground text-center mt-1">
                        Doação mensal de ração para nosso abrigo.
                      </p>
                    </div>
                    
                    <div className="flex flex-col items-center">
                      <div className="w-32 h-32 bg-muted rounded-lg flex items-center justify-center mb-4">
                        <span className="text-primary font-bold">UniVet</span>
                      </div>
                      <h3 className="font-medium">Universidade UniVet</h3>
                      <p className="text-sm text-muted-foreground text-center mt-1">
                        Estudantes de veterinária realizam estágio voluntário em nosso abrigo.
                      </p>
                    </div>
                    
                    <div className="flex flex-col items-center">
                      <div className="w-32 h-32 bg-muted rounded-lg flex items-center justify-center mb-4">
                        <span className="text-primary font-bold">Pet Shop</span>
                      </div>
                      <h3 className="font-medium">Rede de Pet Shops Amigo Fiel</h3>
                      <p className="text-sm text-muted-foreground text-center mt-1">
                        Espaço para divulgação dos nossos animais e ponto de coleta de doações.
                      </p>
                    </div>
                    
                    <div className="flex flex-col items-center">
                      <div className="w-32 h-32 bg-muted rounded-lg flex items-center justify-center mb-4">
                        <span className="text-primary font-bold">Transportes</span>
                      </div>
                      <h3 className="font-medium">Transportadora Expressa</h3>
                      <p className="text-sm text-muted-foreground text-center mt-1">
                        Transporte gratuito de doações e animais entre cidades.
                      </p>
                    </div>
                    
                    <div className="flex flex-col items-center">
                      <div className="w-32 h-32 bg-muted rounded-lg flex items-center justify-center mb-4">
                        <span className="text-primary font-bold">Seu Logo</span>
                      </div>
                      <h3 className="font-medium">Torne-se um Parceiro</h3>
                      <p className="text-sm text-muted-foreground text-center mt-1">
                        Entre em contato para conhecer nossas oportunidades de parceria.
                      </p>
                    </div>
                  </div>
                </section>
                
                <section>
                  <h2 className="text-2xl font-bold text-primary mb-3">Como se Tornar um Parceiro</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Há diversas formas de apoiar nosso trabalho como empresa parceira. Você pode 
                    oferecer produtos ou serviços, disponibilizar espaço para divulgação, 
                    patrocinar eventos ou até mesmo adotar o apadrinhamento de um animal específico. 
                    Entre em contato conosco para conversarmos sobre a melhor forma de parceria 
                    para sua empresa.
                  </p>
                </section>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>
      
      <Footer />
    </div>
  );
};

export default Institution;
