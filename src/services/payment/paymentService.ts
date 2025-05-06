
import { supabase } from "@/lib/supabase";
import { toast } from '@/hooks/use-sonner';
import { Payment } from "./types";

// Process payment using the edge function
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

// Get payment history for user
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
