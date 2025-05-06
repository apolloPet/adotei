
// Interface for payment data
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

// Interface for adoption details
export interface AdoptionDetails {
  id: string;
  petName: string;
  petImage?: string;
  shelter?: string;
  fee: number;
  status: string;
  userName: string;
}

// Interface for admin settings
export interface AdminSettings {
  adoptionFee: number;
  ngoPercentage: number;
  platformPercentage: number;
  pixKey: string;
  bankData: any;
  contractText: string;
  followUpPeriod: number;
}
