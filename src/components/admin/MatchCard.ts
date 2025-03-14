
export interface Match {
  id: string;
  petName: string;
  petImage: string;
  userName: string;
  userEmail: string;
  userPhone?: string;
  userImage?: string;
  userInfo?: {
    phone?: string;
    housingType?: string;
    hasChildren?: boolean;
    hadPetsBefore?: boolean;
    hasAllergies?: boolean;
  };
  matchDate?: string;
  date?: string;
  status: 'pending' | 'approved' | 'rejected';
  paymentStatus?: 'pending' | 'completed';
}
