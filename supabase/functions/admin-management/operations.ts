
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.36.0";

export type AdminPermissions = {
  manageAnimals: boolean;
  approveAdoptions: boolean;
  manageSettings: boolean;
  manageAdmins: boolean;
};

// Handle creating a new admin user
export async function createAdmin(
  supabase: ReturnType<typeof createClient>, 
  email: string, 
  password: string, 
  name: string, 
  permissions: AdminPermissions
) {
  try {
    console.log(`Criando administrador: ${email}, permissions:`, permissions);
    
    // Step 1: Create user in Supabase Auth
    const { data: userData, error: userError } = await supabase.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true,
      user_metadata: { name: name, isAdmin: true }
    });
    
    if (userError) {
      console.error('Erro ao criar usuário:', userError);
      return {
        success: false,
        message: userError.message,
        code: userError.code || "USER_CREATION_FAILED"
      };
    }
    
    if (!userData.user) {
      return {
        success: false,
        message: "Erro ao criar usuário. Nenhum usuário retornado.",
        code: "USER_CREATION_FAILED"
      };
    }
    
    console.log(`Usuário criado com ID: ${userData.user.id}`);
    
    // Step 2: Assign admin role to user
    const roleInsertData = {
      user_id: userData.user.id,
      role: 'admin',
      permissions: permissions || {
        manageAnimals: true,
        approveAdoptions: true,
        manageSettings: false,
        manageAdmins: false
      }
    };
    
    console.log('Atribuindo papel de administrador com dados:', roleInsertData);
    
    const { error: roleInsertError } = await supabase
      .from('user_roles')
      .insert(roleInsertData);
    
    if (roleInsertError) {
      console.error('Erro ao atribuir papel de administrador:', roleInsertError);
      
      // Attempt to clean up the created user since role assignment failed
      try {
        await supabase.auth.admin.deleteUser(userData.user.id);
        console.log(`Usuário removido após falha na atribuição de papel: ${userData.user.id}`);
      } catch (cleanupError) {
        console.error('Erro ao remover usuário após falha:', cleanupError);
      }
      
      return {
        success: false,
        message: roleInsertError.message,
        code: roleInsertError.code || "ROLE_ASSIGNMENT_FAILED"
      };
    }
    
    // Return successful response with created admin data
    return {
      success: true,
      message: "Administrador criado com sucesso",
      data: {
        id: userData.user.id,
        email: userData.user.email,
        role: 'admin',
        created_at: userData.user.created_at,
        permissions: roleInsertData.permissions
      }
    };
  } catch (error) {
    console.error('Erro não tratado ao criar administrador:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Erro interno ao criar administrador",
      code: "INTERNAL_SERVER_ERROR"
    };
  }
}

// Grant super admin access to the main admin
export async function grantSuperAdmin(supabase: ReturnType<typeof createClient>, email: string) {
  console.log('Processando solicitação para conceder super admin a ' + email);
  
  // Fetch the admin@petmatch.com user
  const { data: adminUserData, error: adminUserError } = await supabase.auth.admin.listUsers();
  
  if (adminUserError) {
    console.error('Erro ao buscar usuários:', adminUserError);
    return {
      success: false,
      message: 'Erro ao buscar informações do usuário admin'
    };
  }
  
  const adminUser = adminUserData.users.find(u => u.email === email);
  
  if (!adminUser) {
    console.error('Admin principal não encontrado na base de dados');
    return {
      success: false,
      message: 'Admin principal não encontrado'
    };
  }
  
  // Check if there's already a record for the admin
  const { data: existingRole, error: existingRoleError } = await supabase
    .from('user_roles')
    .select('*')
    .eq('user_id', adminUser.id)
    .eq('role', 'admin')
    .maybeSingle();
  
  if (existingRoleError && existingRoleError.code !== 'PGRST116') {
    console.error('Erro ao verificar registro de admin existente:', existingRoleError);
  }
  
  if (existingRole) {
    // Update existing admin permissions
    const { error: updateError } = await supabase
      .from('user_roles')
      .update({
        permissions: {
          manageAnimals: true,
          approveAdoptions: true,
          manageSettings: true,
          manageAdmins: true
        }
      })
      .eq('id', existingRole.id);
    
    if (updateError) {
      console.error('Erro ao atualizar permissões do admin principal:', updateError);
      return {
        success: false,
        message: 'Erro ao atualizar permissões do admin principal'
      };
    }
  } else {
    // Create new admin record with all permissions
    const { error: insertError } = await supabase
      .from('user_roles')
      .insert({
        user_id: adminUser.id,
        role: 'admin',
        permissions: {
          manageAnimals: true,
          approveAdoptions: true,
          manageSettings: true,
          manageAdmins: true
        }
      });
    
    if (insertError) {
      console.error('Erro ao criar registro de admin para o admin principal:', insertError);
      return {
        success: false,
        message: 'Erro ao criar registro de admin para o admin principal'
      };
    }
  }
  
  // Update user metadata
  const { error: updateUserError } = await supabase.auth.admin.updateUserById(
    adminUser.id,
    {
      user_metadata: { isAdmin: true, name: 'Admin Principal' }
    }
  );
  
  if (updateUserError) {
    console.error('Erro ao atualizar metadados do admin principal:', updateUserError);
  }
  
  return {
    success: true,
    message: 'Permissões do admin principal atualizadas com sucesso'
  };
}

// Fetch all admin users
export async function getAdminUsers(supabase: ReturnType<typeof createClient>) {
  // Get admin users
  const { data: roleData, error: roleError } = await supabase
    .from('user_roles')
    .select('*')
    .eq('role', 'admin');
  
  if (roleError) {
    console.error('Erro ao buscar papéis de administrador:', roleError);
    return {
      success: false,
      message: roleError.message,
      code: roleError.code || "FETCH_FAILED"
    };
  }
  
  // Get user details for each admin
  const adminUsers = await Promise.all(
    roleData.map(async (role) => {
      const { data: userData, error: userError } = await supabase.auth.admin.getUserById(role.user_id);
      
      if (userError || !userData.user) {
        console.error(`Erro ao buscar dados do usuário ${role.user_id}:`, userError);
        return null;
      }
      
      return {
        id: userData.user.id,
        email: userData.user.email,
        role: role.role,
        created_at: userData.user.created_at,
        permissions: role.permissions || {
          manageAnimals: true,
          approveAdoptions: true,
          manageSettings: false,
          manageAdmins: false
        }
      };
    })
  );
  
  // Filter out any null values from admins who couldn't be found
  const validAdmins = adminUsers.filter(Boolean);
  console.log('Administradores recuperados:', validAdmins);
  
  return {
    success: true,
    message: "Administradores recuperados com sucesso",
    data: validAdmins
  };
}

// Update admin permissions
export async function updateAdminPermissions(
  supabase: ReturnType<typeof createClient>, 
  userId: string, 
  permissions: AdminPermissions, 
  currentUserId: string | null
) {
  // Prevent self-modification
  if (currentUserId && userId === currentUserId) {
    return {
      success: false,
      message: "Não é possível modificar suas próprias permissões.",
      code: "SELF_MODIFICATION_DENIED"
    };
  }
  
  const { error: updateError } = await supabase
    .from('user_roles')
    .update({ permissions: permissions })
    .eq('user_id', userId)
    .eq('role', 'admin');
  
  if (updateError) {
    return {
      success: false,
      message: updateError.message,
      code: updateError.code || "UPDATE_FAILED"
    };
  }
  
  return {
    success: true,
    message: "Permissões atualizadas com sucesso"
  };
}

// Remove admin role
export async function removeAdminRole(
  supabase: ReturnType<typeof createClient>, 
  userId: string, 
  currentUserId: string | null
) {
  // Prevent self-deletion
  if (currentUserId && userId === currentUserId) {
    return {
      success: false,
      message: "Não é possível remover seu próprio acesso administrativo.",
      code: "SELF_REMOVAL_DENIED"
    };
  }
  
  const { error: deleteError } = await supabase
    .from('user_roles')
    .delete()
    .eq('user_id', userId)
    .eq('role', 'admin');
  
  if (deleteError) {
    return {
      success: false,
      message: deleteError.message,
      code: deleteError.code || "DELETE_FAILED"
    };
  }
  
  return {
    success: true,
    message: "Administrador removido com sucesso"
  };
}
