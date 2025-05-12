
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/auth';
import { toast } from '@/hooks/use-sonner';
import { Loader2, ShieldAlert } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';

interface AdminProtectedRouteProps {
  children?: React.ReactNode;
}

const AdminProtectedRoute: React.FC<AdminProtectedRouteProps> = ({ 
  children 
}) => {
  const { user, isAdmin, isLoading, isAuthenticated } = useAuth();
  const [isVerifying, setIsVerifying] = useState(true);
  const [isVerified, setIsVerified] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const navigate = useNavigate();
  
  useEffect(() => {
    // Flag to prevent multiple operations if the component unmounts
    let isMounted = true;
    
    const verifyAdmin = async () => {
      try {
        // Check localStorage first (highest priority)
        const localStorageAdmin = localStorage.getItem("isAdmin") === "true";
        
        if (localStorageAdmin) {
          console.log('AdminProtectedRoute: Access confirmed via localStorage');
          if (isMounted) {
            setIsVerified(true);
            setIsVerifying(false);
          }
          return;
        }
        
        // If auth state is still loading, wait
        if (isLoading) {
          console.log('AdminProtectedRoute: Auth state still loading, waiting...');
          return;
        }

        // If user is not authenticated, redirect to login
        if (!isAuthenticated) {
          console.log('AdminProtectedRoute: User not authenticated, redirecting');
          if (isMounted) {
            setVerificationError("You need to be authenticated to access this page");
            setIsVerifying(false);
            navigate('/admin-login', { replace: true });
          }
          return;
        }
        
        // If already confirmed as admin via global state
        if (isAdmin) {
          console.log('AdminProtectedRoute: Access confirmed via global state');
          if (isMounted) {
            setIsVerified(true);
            setIsVerifying(false);
          }
          return;
        }
        
        // If we get here and the user exists, verify via email or database
        if (user) {
          console.log('AdminProtectedRoute: Verifying permissions by email or database');
          
          // Email verification (for compatibility)
          const adminEmails = ['admin@petmatch.com'];
          const adminDomains = ['@admin', '@ong'];
          
          const isAdminEmail = adminEmails.includes(user.email || '') || 
                            adminDomains.some(domain => (user.email || '').includes(domain));
          
          if (isAdminEmail) {
            console.log('AdminProtectedRoute: Admin email detected');
            localStorage.setItem("isAdmin", "true");
            if (isMounted) {
              setIsVerified(true);
              setIsVerifying(false);
            }
            return;
          }
          
          // Check the user_roles table
          try {
            console.log('AdminProtectedRoute: Checking admin role in user_roles table');
            
            const { data: roleData, error: roleError } = await supabase
              .from('user_roles')
              .select('*')
              .eq('user_id', user.id)
              .eq('role', 'admin')
              .maybeSingle();
              
            if (roleData) {
              console.log('AdminProtectedRoute: User found in user_roles table');
              localStorage.setItem("isAdmin", "true");
              if (isMounted) {
                setIsVerified(true);
                setIsVerifying(false);
              }
              return;
            }
          } catch (roleError) {
            console.error('Error checking role:', roleError);
          }
        }
        
        // If we reach here, not an admin - redirect after a timeout
        if (isMounted) {
          console.log('AdminProtectedRoute: Access denied, redirecting');
          setVerificationError("You do not have permission to access this page");
          setIsVerifying(false);
          navigate('/admin-login', { replace: true });
        }
        
      } catch (error) {
        console.error("Error verifying admin status:", error);
        if (isMounted) {
          setVerificationError("Error verifying permissions");
          setIsVerifying(false);
          navigate('/admin-login', { replace: true });
        }
      } finally {
        // End verification after timeout to prevent hanging
        if (isMounted) {
          setIsVerifying(false);
        }
      }
    };

    // Start verification and set up timer to ensure it doesn't get stuck
    verifyAdmin();
    
    // Safety timer to not get stuck in verification
    const timeoutId = setTimeout(() => {
      if (isMounted && isVerifying) {
        console.log('AdminProtectedRoute: Verification timeout exceeded');
        setIsVerifying(false);
        setVerificationError("Verification timeout exceeded");
        navigate('/admin-login', { replace: true });
      }
    }, 3000); // Maximum time of 3 seconds to verify
    
    // Cleanup to prevent operations on unmounted component
    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [isLoading, user, isAdmin, isAuthenticated, navigate]);
  
  if (isVerified) {
    return <>{children}</>;
  }
  
  // Show loader while verifying
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="flex flex-col items-center gap-4 p-8 border rounded-lg shadow-sm">
        {isVerifying ? (
          <>
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Verificando acesso administrativo...</p>
          </>
        ) : verificationError ? (
          <div className="flex flex-col items-center gap-4">
            <ShieldAlert className="h-12 w-12 text-red-500" />
            <div className="text-center">
              <h3 className="text-lg font-medium text-red-500">Acesso Restrito</h3>
              <p className="text-muted-foreground mt-2">{verificationError}</p>
            </div>
            <Button 
              onClick={() => navigate('/admin-login')}
              variant="default"
              className="mt-2"
            >
              Ir para Login Administrativo
            </Button>
          </div>
        ) : (
          <div className="text-center">
            <p className="text-muted-foreground">Redirecionando...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminProtectedRoute;
