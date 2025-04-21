
import { supabase } from '@/lib/supabase';

export const ensureMainAdminAccess = async (): Promise<boolean> => {
  try {
    // Check if this is the main admin account
    const isMainAdmin = localStorage.getItem("userEmail") === "admin@petmatch.com";
    
    if (isMainAdmin) {
      console.log('Ensuring main admin access for admin@petmatch.com');
      
      // Get the current session
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      // Setup headers for the function call
      let headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      
      // Add appropriate headers based on authentication state
      if (sessionData?.session?.access_token) {
        headers['Authorization'] = `Bearer ${sessionData.session.access_token}`;
      } else {
        // For demo admin, use special headers
        headers['X-Admin-Override'] = 'true';
        headers['X-Admin-Email'] = 'admin@petmatch.com';
      }
      
      // Call the admin management function to ensure the main admin has full access
      const { data, error } = await supabase.functions.invoke('admin-management', {
        method: 'POST',
        body: JSON.stringify({
          grantSuperAdmin: true,
          email: 'admin@petmatch.com'
        }),
        headers
      });
      
      if (error) {
        console.error('Error ensuring main admin access:', error);
        return false;
      }
      
      console.log('Main admin access ensured successfully:', data);
      return true;
    }
    
    // Not the main admin, so nothing to do
    return false;
  } catch (error) {
    console.error('Error in ensureMainAdminAccess:', error);
    return false;
  }
};
