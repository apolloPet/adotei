
import { getSystemParameters } from '../systemParameterService';
import { AdminSettings } from "./types";

// Function to get admin settings
export const getAdminSettings = async (): Promise<AdminSettings> => {
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
        
        // Load bank account info if available
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

// Function to get the configured adoption fee
export const getAdoptionFee = async (): Promise<number> => {
  try {
    const systemParams = await getSystemParameters('payment');
    
    if (systemParams && systemParams.length > 0) {
      const feeParam = systemParams.find(p => p.key === 'adoption_fee');
      if (feeParam && feeParam.value.enabled) {
        return feeParam.value.amount || 120;
      }
    }
    
    return 120; // Default value
  } catch (error) {
    console.error('Error in getAdoptionFee:', error);
    return 120; // Default value in case of error
  }
};
