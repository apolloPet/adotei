
import { AdminUser } from "@/services/adminUserService";

export interface NewAdminState {
  name: string;
  email: string;
  password: string;
  passwordConfirm: string;
  permissions: {
    manageAnimals: boolean;
    approveAdoptions: boolean;
    manageSettings: boolean;
    manageAdmins: boolean;
    manageUsers: boolean;
  };
}

export interface FormErrors {
  name: string;
  email: string;
  password: string;
  passwordConfirm: string;
}

export interface AdminTableProps {
  admins: AdminUser[];
  isLoading: boolean;
  onRemove: (id: string, email: string) => void;
  onUpdatePermissions: (id: string, permissions: AdminUser['permissions']) => void;
  formatDate: (dateString: string) => string;
}
