
import { supabase } from "@/lib/supabase";
import { getSystemParameters } from './systemParameterService';

// Mock data for the adoption details
export const mockAdoptions = [
  {
    id: "1",
    petName: "Luna",
    petImage: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?ixlib=rb-1.2.1&auto=format&fit=crop&w=1027&q=80",
    shelter: "ONG Amigos dos Animais",
    fee: 120,
    status: 'pending',
    userName: "Maria Silva"
  },
  {
    id: "2",
    petName: "Max",
    petImage: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?ixlib=rb-1.2.1&auto=format&fit=crop&w=1074&q=80",
    shelter: "ONG Patinhas Carentes",
    fee: 150,
    status: 'pending',
    userName: "João Pereira"
  },
];

// Function to get adoption by ID - em um ambiente real, isso buscaria do banco de dados
export const getAdoptionById = async (id: string) => {
  try {
    // Primeiro, tente obter da API real
    const { data, error } = await supabase
      .from('adoptions')
      .select(`
        id,
        current_stage,
        adoption_fee_paid,
        pets:pet_id (name),
        users:user_id (name)
      `)
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching adoption:', error);
      // Fallback para dados mockados
      return mockAdoptions.find(adoption => adoption.id === id) || null;
    }
    
    if (data) {
      return {
        id: data.id,
        petName: data.pets?.name || "Pet",
        status: data.current_stage,
        fee: await getAdoptionFee(),
        userName: data.users?.name || "Adotante"
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error in getAdoptionById:', error);
    // Fallback para dados mockados
    return mockAdoptions.find(adoption => adoption.id === id) || null;
  }
};

// Function to get admin settings
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

// In a real app, this would be an API call
export const processPayment = async (adoptionId: string): Promise<boolean> => {
  try {
    // Atualiza o status de pagamento no banco de dados
    const { error } = await supabase
      .from('adoptions')
      .update({ adoption_fee_paid: true })
      .eq('id', adoptionId);
    
    if (error) {
      console.error('Error updating adoption payment status:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in processPayment:', error);
    // Simula um sucesso em caso de falha para ambiente de desenvolvimento
    return true;
  }
};
