
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.36.0";

// Verify user authentication and check if they have admin privileges
export async function verifyAuth(req: Request, supabase: ReturnType<typeof createClient>) {
  // Check for admin override via special headers
  const adminOverride = req.headers.get('X-Admin-Override');
  const adminEmail = req.headers.get('X-Admin-Email');
  let isAuthorized = false;
  let userId = null;

  if (adminOverride === 'true' && adminEmail === 'admin@petmatch.com') {
    console.log('Acesso autorizado via override para admin principal');
    isAuthorized = true;
    
    // Try to get the user ID for the main admin
    try {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('auth_id')
        .eq('email', 'admin@petmatch.com')
        .maybeSingle();
      
      if (userData && !userError) {
        userId = userData.auth_id;
        console.log('ID do admin principal encontrado:', userId);
      } else {
        console.log('ID do admin principal não encontrado no banco, mas prosseguindo devido ao override');
      }
    } catch (error) {
      console.error('Erro ao buscar ID do admin principal:', error);
    }
  } else {
    // Normal verification via JWT token
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('Token de autenticação ausente ou inválido:', authHeader);
      return { isAuthorized: false, userId: null, error: "Não autorizado. Autenticação é necessária para acessar este recurso." };
    }

    // Extract the JWT
    const token = authHeader.substring(7);
    console.log('Token recebido (primeiros 10 caracteres):', token.substring(0, 10) + '...');
    
    // Verify the JWT and get user information
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError) {
      console.error('Erro na verificação do token:', authError);
      return { 
        isAuthorized: false, 
        userId: null, 
        error: "Token inválido ou sessão expirada. Por favor, faça login novamente." 
      };
    }
    
    if (!user) {
      console.error('Usuário não encontrado para o token fornecido');
      return { 
        isAuthorized: false,
        userId: null, 
        error: "Usuário não encontrado. Por favor, faça login novamente."
      };
    }

    console.log('Usuário autenticado:', user.email);
    userId = user.id;

    // Special check for main admin by email
    if (user.email === 'admin@petmatch.com') {
      console.log('Admin principal identificado por email');
      isAuthorized = true;
    } else {
      // Check if user is admin
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .maybeSingle();
        
      if (roleError) {
        console.error('Erro ao verificar papel do usuário:', roleError);
        return { 
          isAuthorized: false, 
          userId: null, 
          error: "Erro ao verificar permissões de administrador." 
        };
      }
        
      if (!roleData) {
        // Alternative check by email convention
        const isAdminByEmail = 
          user.email.includes('@admin') || 
          user.email.includes('@ong');
          
        if (!isAdminByEmail) {
          console.error('Usuário não tem papel de administrador:', user.email);
          return { 
            isAuthorized: false, 
            userId: null, 
            error: "Acesso negado. Apenas administradores podem gerenciar outros administradores." 
          };
        }
        
        console.log('Usuário autorizado por convenção de email:', user.email);
        isAuthorized = true;
      } else {
        console.log('Usuário tem papel de administrador com permissões:', roleData.permissions);
      
        // Check if user has permission to manage admins
        if (roleData.permissions?.manageAdmins) {
          isAuthorized = true;
        } else {
          return { 
            isAuthorized: false, 
            userId: null, 
            error: "Acesso negado. Você não tem permissão para gerenciar administradores." 
          };
        }
      }
    }
  }

  return { isAuthorized, userId, error: null };
}
