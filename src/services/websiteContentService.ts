
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-sonner';

export type ContentSection = 'header' | 'home' | 'howItWorks' | 'petMatch' | 'institution' | 'contact';

export interface ContentItem {
  id: string;
  title: string;
  content: string;
  section: ContentSection;
}

export type WebsiteContent = {
  id: string;
  title: string;
  content: string;
  section: string;
  created_at?: string;
  updated_at?: string;
}

// Default content for each section if none exists in database
export const defaultContent: Record<ContentSection, ContentItem[]> = {
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

/**
 * Fetches content for a specific section
 * @param section The section to fetch content for
 * @returns ContentItem[] array of content items
 */
export const fetchSectionContent = async (section: ContentSection): Promise<ContentItem[]> => {
  try {
    // First attempt to use direct database query (faster, doesn't require edge function)
    const { data, error } = await supabase
      .from('website_content')
      .select('*')
      .eq('section', section) as { data: WebsiteContent[] | null; error: Error | null };
      
    if (error) throw error;
    
    if (data && data.length > 0) {
      // Transform database records to ContentItem type
      const transformedData: ContentItem[] = data.map(item => ({
        id: item.id,
        title: item.title,
        content: item.content,
        section: item.section as ContentSection
      }));
      return transformedData;
    }

    // If no content in database, return default content
    return defaultContent[section];
  } catch (error) {
    console.error('Error loading content:', error);
    toast.error('Erro ao carregar conteúdo do site');
    // Fallback to default content on error
    return defaultContent[section];
  }
};

/**
 * Saves content items to the database
 * @param contentItems Array of content items to save
 */
export const saveContentItems = async (contentItems: ContentItem[]): Promise<boolean> => {
  try {
    // First attempt to use direct database operation (more efficient)
    for (const item of contentItems) {
      const { error } = await supabase
        .from('website_content')
        .upsert({
          id: item.id,
          title: item.title,
          content: item.content,
          section: item.section
        }) as { error: Error | null };
        
      if (error) throw error;
    }
    
    toast.success('Conteúdo salvo com sucesso!');
    return true;
  } catch (error) {
    console.error('Error saving content:', error);
    toast.error('Erro ao salvar conteúdo');
    return false;
  }
};
