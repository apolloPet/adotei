export interface AdminUser {
  id: string;
  email: string;
  role: string;
  created_at?: string;
  permissions: {
    manageAnimals: boolean;
    approveAdoptions: boolean;
    manageSettings: boolean;
    manageAdmins: boolean;
    manageUsers: boolean;
  };
}
