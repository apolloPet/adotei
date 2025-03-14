
import { Link, useNavigate } from 'react-router-dom';
import { LogIn, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from "@/hooks/use-sonner";

interface DesktopAuthMenuProps {
  isAdmin?: boolean;
  isLoggedIn?: boolean;
  onLogin?: () => void;
  onLogout?: () => void;
}

const DesktopAuthMenu = ({ 
  isLoggedIn = false, 
  onLogin, 
  onLogout 
}: DesktopAuthMenuProps) => {
  const navigate = useNavigate();

  const handleLogin = () => {
    if (onLogin) {
      onLogin();
    } else {
      navigate('/login');
    }
  };

  const handleLogout = () => {
    // Clear login state in localStorage
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("isAdmin");
    localStorage.removeItem("userEmail");
    
    // Dispatch a storage event to notify other components
    window.dispatchEvent(new Event('storage'));
    
    // Call the callback if provided
    if (onLogout) {
      onLogout();
    } else {
      toast.success("Logout realizado com sucesso");
      navigate('/');
    }
  };
  
  return (
    <div className="hidden md:flex items-center space-x-4">
      {isLoggedIn ? (
        <Button variant="outline" onClick={handleLogout} size="sm">
          <LogOut className="h-4 w-4 mr-2" />
          Sair
        </Button>
      ) : (
        <>
          <Button variant="outline" size="sm" asChild>
            <Link to="/register">Cadastrar</Link>
          </Button>
          <Button onClick={handleLogin} size="sm">
            <LogIn className="h-4 w-4 mr-2" />
            Entrar
          </Button>
        </>
      )}
    </div>
  );
};

export default DesktopAuthMenu;
