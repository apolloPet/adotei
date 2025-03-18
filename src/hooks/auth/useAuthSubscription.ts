
import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { getProfile } from '@/services/auth/profileService';

export function useAuthSubscription({
  setUser,
  setSession, 
  setProfile,
  setIsAdmin
}) {
  useEffect(() => {
    // Performance: configuração aprimorada para eventos de autenticação
    console.log('Configurando assinatura para eventos de autenticação');
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      console.log('Evento de autenticação detectado:', event);
      
      // Performance: atualizar estado da sessão imediatamente
      setSession(newSession);
      
      if (newSession?.user) {
        // Performance: definir o usuário imediatamente
        setUser(newSession.user);
        
        // Verificar status de admin
        const userEmail = newSession.user.email;
        if (userEmail) {
          const isAdminUser = userEmail.includes('@ong') || 
                          userEmail.includes('@admin') || 
                          userEmail === 'admin@petmatch.com';
          
          console.log('Atualização de estado - verificação de permissões:', { 
            email: userEmail, 
            isAdmin: isAdminUser 
          });
          
          setIsAdmin(isAdminUser);
          
          // Atualizar localStorage
          localStorage.setItem("isLoggedIn", "true");
          localStorage.setItem("isAdmin", isAdminUser.toString());
          localStorage.setItem("userEmail", userEmail);
        } else {
          setIsAdmin(false);
        }
        
        // Performance: buscar perfil do usuário em segundo plano
        setTimeout(async () => {
          try {
            const userProfile = await getProfile();
            if (userProfile) {
              setProfile(userProfile);
            }
          } catch (error) {
            console.error('Erro ao buscar perfil em segundo plano:', error);
          }
        }, 100);
        
      } else {
        // Sessão encerrada
        setUser(null);
        setProfile(null);
        setIsAdmin(false);
        
        // Limpar localStorage ao fazer logout
        if (event === 'SIGNED_OUT') {
          localStorage.removeItem("isLoggedIn");
          localStorage.removeItem("isAdmin");
          localStorage.removeItem("userEmail");
        }
      }
    });

    // Performance: limpeza apropriada na desmontagem do componente
    return () => {
      console.log('Cancelando assinatura de eventos de autenticação');
      subscription.unsubscribe();
    };
  }, [setUser, setSession, setProfile, setIsAdmin]);
}
