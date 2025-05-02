
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-sonner";
import { supabase } from '@/lib/supabase';
import { Loader2, Save } from 'lucide-react';

type ContentSection = 'header' | 'home' | 'howItWorks' | 'petMatch' | 'institution' | 'contact';

interface ContentItem {
  id: string;
  title: string;
  content: string;
  section: ContentSection;
}

const defaultContent: Record<ContentSection, ContentItem[]> = {
  header: [
    { id: 'header-1', title: 'Encontrar Pets', content: 'Explore nossa seleção de animais disponíveis para adoção.', section: 'header' },
    { id: 'header-2', title: 'Como Funciona', content: 'Conheça nosso processo de adoção e como funciona o PetMatch.', section: 'header' },
    { id: 'header-3', title: 'PetMatch', content: 'Informações sobre nossa plataforma de adoção.', section: 'header' },
    { id: 'header-4', title: 'ONG Parceira', content: 'Conheça a ONG parceira e seu trabalho.', section: 'header' },
    { id: 'header-5', title: 'Contato', content: 'Entre em contato conosco para mais informações.', section: 'header' }
  ],
  home: [
    { id: 'home-1', title: 'Encontre seu amigo perfeito', content: 'Conectamos animais que precisam de um lar com pessoas que procuram um novo amigo.', section: 'home' },
    { id: 'home-2', title: 'Como funciona', content: 'Navegar, escolher, adotar. Simples assim!', section: 'home' }
  ],
  howItWorks: [
    { id: 'how-1', title: 'Passo 1', content: 'Cadastre-se em nossa plataforma.', section: 'howItWorks' },
    { id: 'how-2', title: 'Passo 2', content: 'Explore os animais disponíveis para adoção.', section: 'howItWorks' },
    { id: 'how-3', title: 'Passo 3', content: 'Agende uma visita para conhecer o animal.', section: 'howItWorks' },
    { id: 'how-4', title: 'Passo 4', content: 'Finalize o processo de adoção.', section: 'howItWorks' }
  ],
  petMatch: [
    { id: 'pet-1', title: 'Sobre o PetMatch', content: 'PetMatch é uma plataforma que conecta pessoas a animais disponíveis para adoção.', section: 'petMatch' },
    { id: 'pet-2', title: 'Nossa Missão', content: 'Reduzir o número de animais abandonados e promover a adoção responsável.', section: 'petMatch' }
  ],
  institution: [
    { id: 'inst-1', title: 'Quem Somos', content: 'Somos uma organização dedicada ao bem-estar animal.', section: 'institution' },
    { id: 'inst-2', title: 'Nossa História', content: 'Fundada em 2015, nossa instituição já ajudou mais de 2.000 animais a encontrarem novos lares.', section: 'institution' },
    { id: 'inst-3', title: 'Programas', content: 'Castração solidária, educação nas escolas, apadrinhamento e mais.', section: 'institution' }
  ],
  contact: [
    { id: 'contact-1', title: 'Endereço', content: 'Avenida Principal, 123, São Paulo, SP', section: 'contact' },
    { id: 'contact-2', title: 'Email', content: 'contato@petmatch.com', section: 'contact' },
    { id: 'contact-3', title: 'Telefone', content: '(11) 1234-5678', section: 'contact' }
  ]
};

const WebsiteContentManager = () => {
  const [activeSection, setActiveSection] = useState<ContentSection>('header');
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadContent = async () => {
      setIsLoading(true);
      try {
        // Fetch content from database
        const { data, error } = await supabase
          .from('website_content')
          .select('*')
          .eq('section', activeSection);
          
        if (error) throw error;
        
        if (data && data.length > 0) {
          setContentItems(data as ContentItem[]);
        } else {
          // Use default content if no data exists
          setContentItems(defaultContent[activeSection]);
        }
      } catch (error) {
        console.error('Error loading content:', error);
        toast.error('Erro ao carregar conteúdo do site');
        setContentItems(defaultContent[activeSection]);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadContent();
  }, [activeSection]);

  const handleContentChange = (index: number, field: 'title' | 'content', value: string) => {
    const updatedItems = [...contentItems];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    setContentItems(updatedItems);
  };

  const handleSaveContent = async () => {
    setIsSaving(true);
    try {
      // For each content item, upsert to database
      for (const item of contentItems) {
        const { error } = await supabase
          .from('website_content')
          .upsert({
            id: item.id,
            title: item.title,
            content: item.content,
            section: item.section
          }, { onConflict: 'id' });
          
        if (error) throw error;
      }
      
      toast.success('Conteúdo salvo com sucesso!');
    } catch (error) {
      console.error('Error saving content:', error);
      toast.error('Erro ao salvar conteúdo');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Gerenciamento de Conteúdo do Site</CardTitle>
        <CardDescription>
          Edite o conteúdo exibido nas diferentes seções do site
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Tabs 
          value={activeSection} 
          onValueChange={(value) => setActiveSection(value as ContentSection)}
          className="w-full"
        >
          <TabsList className="w-full mb-6 overflow-x-auto flex flex-nowrap whitespace-nowrap">
            <TabsTrigger value="header">Cabeçalho</TabsTrigger>
            <TabsTrigger value="home">Página Inicial</TabsTrigger>
            <TabsTrigger value="howItWorks">Como Funciona</TabsTrigger>
            <TabsTrigger value="petMatch">PetMatch</TabsTrigger>
            <TabsTrigger value="institution">ONG Parceira</TabsTrigger>
            <TabsTrigger value="contact">Contato</TabsTrigger>
          </TabsList>
          
          {Object.keys(defaultContent).map((section) => (
            <TabsContent key={section} value={section} className="space-y-4">
              {isLoading ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <>
                  {contentItems.map((item, index) => (
                    <div key={item.id} className="p-4 border rounded-md">
                      <div className="mb-4">
                        <Label htmlFor={`title-${index}`}>Título</Label>
                        <Input 
                          id={`title-${index}`}
                          value={item.title} 
                          onChange={(e) => handleContentChange(index, 'title', e.target.value)}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor={`content-${index}`}>Conteúdo</Label>
                        <Textarea 
                          id={`content-${index}`}
                          value={item.content} 
                          onChange={(e) => handleContentChange(index, 'content', e.target.value)}
                          rows={4}
                        />
                      </div>
                    </div>
                  ))}
                  
                  <Button 
                    onClick={handleSaveContent} 
                    className="mt-4 w-full sm:w-auto"
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Salvar Alterações
                      </>
                    )}
                  </Button>
                </>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default WebsiteContentManager;
