import { supabase } from "@/lib/supabase";
import { getSystemParameters } from './systemParameterService';
import { toast } from '@/hooks/use-sonner';

// Interface para pagamentos
export interface Payment {
  id: string;
  amount: number;
  payment_method: string;
  payment_status: string;
  payment_date: string;
  transaction_id?: string;
  created_at: string;
  user_id: string;
  adoption_id?: string;
}

// Interface para detalhes da adoção
export interface AdoptionDetails {
  id: string;
  petName: string;
  petImage?: string;
  shelter?: string;
  fee: number;
  status: string;
  userName: string;
}

// Função para obter adoção por ID
export const getAdoptionById = async (id: string): Promise<AdoptionDetails | null> => {
  try {
    // Tentar obter da API
    const { data, error } = await supabase
      .from('adoptions')
      .select(`
        id,
        current_stage,
        adoption_fee_paid,
        pets:pet_id (
          id,
          name
        ),
        users:user_id (name),
        animals:animal_id (
          id,
          nome
        )
      `)
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching adoption:', error);
      return null;
    }
    
    if (data) {
      // Verificar se usamos pet_id ou animal_id
      // Primeiro verificar se pets e animals são objetos válidos antes de acessar suas propriedades
      const hasAnimals = data.animals !== null && typeof data.animals === 'object';
      const petName = data.pets?.name || 
        (hasAnimals && 'nome' in data.animals! ? 
          data.animals!.nome : "Pet");
      
      let petImage = '';
      
      // Tentar buscar imagem do pet se tivermos um pet_id
      if (data.pets?.id) {
        const { data: imageData } = await supabase
          .from('pet_images')
          .select('url')
          .eq('pet_id', data.pets.id)
          .eq('is_primary', true)
          .maybeSingle();
        
        // Fix: Ensure imageData.url is a string before assigning it
        if (imageData && imageData.url && typeof imageData.url === 'string') {
          petImage = imageData.url;
        }
      }
      
      return {
        id: data.id,
        petName,
        petImage,
        status: data.current_stage,
        fee: await getAdoptionFee(),
        userName: data.users?.name || "Adotante"
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error in getAdoptionById:', error);
    return null;
  }
};

// Função para obter configurações administrativas
export const getAdminSettings = async () => {
  try {
    const systemParams = await getSystemParameters('payment');
    const settings = {
      adoptionFee: 120,
      ngoPercentage: 90,
      platformPercentage: 10,
      pixKey: "",
      bankData: null,
      contractText: "Eu, adotante, me comprometo a cuidar do animal adotado, fornecendo abrigo, alimentação adequada, cuidados veterinários e carinho. Concordo em permitir visitas de acompanhamento pelo período estabelecido e em não abandonar ou maltratar o animal sob quaisquer circunstâncias. Entendo que o animal é um ser senciente e merece respeito e amor.",
      followUpPeriod: 90
    };
    
    if (systemParams && systemParams.length > 0) {
      const feeParam = systemParams.find(p => p.key === 'adoption_fee');
      if (feeParam) {
        settings.adoptionFee = feeParam.value.amount || 120;
      }
      
      const paymentDetailsParam = systemParams.find(p => p.key === 'payment_details');
      if (paymentDetailsParam) {
        settings.pixKey = paymentDetailsParam.value.pixKey || "";
        
        // Carregar informações da conta bancária se disponível
        if (paymentDetailsParam.value.ongBankAccount) {
          settings.bankData = paymentDetailsParam.value.ongBankAccount;
        }
      }
      
      const contractDetailsParam = systemParams.find(p => p.key === 'contract_details');
      if (contractDetailsParam) {
        settings.contractText = contractDetailsParam.value.text || settings.contractText;
        settings.followUpPeriod = contractDetailsParam.value.followUpPeriod || 90;
      }
    }
    
    return settings;
  } catch (error) {
    console.error('Error in getAdminSettings:', error);
    return {
      adoptionFee: 120,
      ngoPercentage: 90,
      platformPercentage: 10,
      pixKey: "ong@example.com",
      contractText: "Eu, adotante, me comprometo a cuidar do animal adotado, fornecendo abrigo, alimentação adequada, cuidados veterinários e carinho. Concordo em permitir visitas de acompanhamento pelo período estabelecido e em não abandonar ou maltratar o animal sob quaisquer circunstâncias. Entendo que o animal é um ser senciente e merece respeito e amor.",
      followUpPeriod: 90
    };
  }
};

// Função para obter a taxa de adoção configurada
export const getAdoptionFee = async (): Promise<number> => {
  try {
    const systemParams = await getSystemParameters('payment');
    
    if (systemParams && systemParams.length > 0) {
      const feeParam = systemParams.find(p => p.key === 'adoption_fee');
      if (feeParam && feeParam.value.enabled) {
        return feeParam.value.amount || 120;
      }
    }
    
    return 120; // Valor padrão
  } catch (error) {
    console.error('Error in getAdoptionFee:', error);
    return 120; // Valor padrão em caso de erro
  }
};

// Processar pagamento usando a edge function
export const processPayment = async (
  adoptionId: string,
  amount: number = 120,
  paymentMethod: string = 'pix',
  paymentDetails: any = {}
): Promise<boolean> => {
  try {
    const { data, error } = await supabase.functions.invoke('payment-processing', {
      body: {
        method: 'processPayment',
        adoptionId,
        amount,
        paymentMethod,
        paymentDetails
      }
    });
    
    if (error) {
      console.error('Erro ao processar pagamento:', error);
      toast.error('Erro ao processar pagamento: ' + error.message);
      return false;
    }
    
    toast.success('Pagamento processado com sucesso!');
    return true;
  } catch (error) {
    console.error('Erro em processPayment:', error);
    toast.error('Erro ao processar pagamento');
    return false;
  }
};

// Obter histórico de pagamentos do usuário
export const getPaymentHistory = async (): Promise<Payment[]> => {
  try {
    const { data, error } = await supabase.functions.invoke('payment-processing', {
      body: {
        method: 'getPaymentHistory'
      }
    });
    
    if (error) {
      console.error('Erro ao buscar histórico de pagamentos:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Erro em getPaymentHistory:', error);
    return [];
  }
};
