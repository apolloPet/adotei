import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-sonner';

export interface AdminUser {
  id: string;
  email: string;
  role: string;
  permissions: {
    manageAnimals: boolean;
    approveAdoptions: boolean;
    manageSettings: boolean;
    manageAdmins: boolean;
  };
}

export const createAdminUser = async (
  email: string, 
  password: string, 
  name: string,
  permissions: {
    manageAnimals: boolean;
    approveAdoptions: boolean;
    manageSettings: boolean;
    manageAdmins: boolean;
  }
): Promise<boolean> => {
  try {
    // Create the user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name, isAdmin: true }
    });

    if (authError) {
      console.error('Error creating admin user:', authError);
      throw new Error(authError.message);
    }

    // If user created successfully, assign admin role
    if (authData.user) {
      // Use a type assertion to ensure TypeScript recognizes the permissions object
      const roleData = {
        user_id: authData.user.id,
        role: 'admin',
        permissions
      };

      const { error: roleError } = await supabase
        .from('user_roles')
        .insert(roleData);

      if (roleError) {
        console.error('Error assigning admin role:', roleError);
        throw new Error(roleError.message);
      }

      return true;
    }

    return false;
  } catch (error) {
    console.error('Error in createAdminUser:', error);
    throw error;
  }
};

export const getAdminUsers = async (): Promise<AdminUser[]> => {
  try {
    // Get users with admin role
    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('*')
      .eq('role', 'admin');

    if (roleError) {
      console.error('Error fetching admin roles:', roleError);
      throw new Error(roleError.message);
    }

    // If we have admin roles, get user details
    if (roleData && roleData.length > 0) {
      const adminUsers: AdminUser[] = [];
      
      for (const role of roleData) {
        // Get user details
        const { data: userData, error: userError } = await supabase.auth.admin.getUserById(role.user_id);
        
        if (userError) {
          console.error('Error fetching user details:', userError);
          continue;
        }

        if (userData.user) {
          // Ensure permissions is a valid object using type assertion
          const typedRole = role as unknown as { 
            permissions?: AdminUser['permissions'], 
            user_id: string, 
            role: string 
          };
          
          const permissions = typedRole.permissions || {
            manageAnimals: true,
            approveAdoptions: true,
            manageSettings: false,
            manageAdmins: false
          };

          adminUsers.push({
            id: userData.user.id,
            email: userData.user.email || '',
            role: role.role,
            permissions
          });
        }
      }

      return adminUsers;
    }

    return [];
  } catch (error) {
    console.error('Error in getAdminUsers:', error);
    throw error;
  }
};

export const updateAdminPermissions = async (
  userId: string,
  permissions: {
    manageAnimals: boolean;
    approveAdoptions: boolean;
    manageSettings: boolean;
    manageAdmins: boolean;
  }
): Promise<boolean> => {
  try {
    // We need to use a more general type assertion here to avoid TypeScript errors
    // Since we're updating a JSONB column that TypeScript doesn't know about in the type definition
    const updateObj: Record<string, any> = { permissions };

    const { error } = await supabase
      .from('user_roles')
      .update(updateObj)
      .eq('user_id', userId)
      .eq('role', 'admin');

    if (error) {
      console.error('Error updating admin permissions:', error);
      throw new Error(error.message);
    }

    return true;
  } catch (error) {
    console.error('Error in updateAdminPermissions:', error);
    throw error;
  }
};

export const removeAdminRole = async (userId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('user_roles')
      .delete()
      .eq('user_id', userId)
      .eq('role', 'admin');

    if (error) {
      console.error('Error removing admin role:', error);
      throw new Error(error.message);
    }

    return true;
  } catch (error) {
    console.error('Error in removeAdminRole:', error);
    throw error;
  }
};

export const getSystemParameters = async (category?: string): Promise<any[]> => {
  try {
    let query = supabase
      .from('system_parameters')
      .select('*');
    
    if (category) {
      query = query.eq('category', category);
    }
    
    const { data, error } = await query;

    if (error) {
      console.error('Error fetching system parameters:', error);
      throw new Error(error.message);
    }

    return data || [];
  } catch (error) {
    console.error('Error in getSystemParameters:', error);
    throw error;
  }
};

export const updateSystemParameter = async (
  id: string,
  value: any,
  description?: string
): Promise<boolean> => {
  try {
    const updates: any = { value };
    if (description !== undefined) {
      updates.description = description;
    }
    
    const { error } = await supabase
      .from('system_parameters')
      .update(updates)
      .eq('id', id);

    if (error) {
      console.error('Error updating system parameter:', error);
      throw new Error(error.message);
    }

    return true;
  } catch (error) {
    console.error('Error in updateSystemParameter:', error);
    throw error;
  }
};

export const createSystemParameter = async (
  category: string,
  key: string,
  value: any,
  description?: string
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('system_parameters')
      .insert({
        category,
        key,
        value,
        description
      });

    if (error) {
      console.error('Error creating system parameter:', error);
      throw new Error(error.message);
    }

    return true;
  } catch (error) {
    console.error('Error in createSystemParameter:', error);
    throw error;
  }
};
