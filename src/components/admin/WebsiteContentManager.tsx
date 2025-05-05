
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Save } from 'lucide-react';
import { 
  ContentSection, 
  ContentItem,
  defaultContent,
  fetchSectionContent,
  saveContentItems 
} from '@/services/websiteContentService';

const WebsiteContentManager = () => {
  const [activeSection, setActiveSection] = useState<ContentSection>('header');
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadContent = async () => {
      setIsLoading(true);
      try {
        const data = await fetchSectionContent(activeSection);
        setContentItems(data);
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
      await saveContentItems(contentItems);
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
