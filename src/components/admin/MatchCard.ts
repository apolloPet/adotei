
export interface Match {
  id: string;
  petName: string;
  petImage: string;
  userName: string;
  userEmail: string;
  date: string;
  status: 'pending' | 'approved' | 'rejected';
}
