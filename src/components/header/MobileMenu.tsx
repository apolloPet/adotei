
import { Link } from "react-router-dom";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import MobileMenuToggle from "./MobileMenuToggle";
import { 
  ShieldAlert, 
  Heart, 
  PawPrint, 
  Building2, 
  User, 
  LogIn, 
  Mail,
  LogOut 
} from 'lucide-react';
import { Button } from "../ui/button";
import { useNavigate } from "react-router-dom";

interface MobileMenuProps {
  isAdmin: boolean;
  isLoggedIn: boolean;
  onLogin?: () => void;
  onLogout: () => void;
  isOpen?: boolean;
  onClose?: () => void;
  onClick?: () => void;
}

const MobileMenu = ({ 
  isAdmin, 
  isLoggedIn, 
  onLogin, 
  onLogout,
  isOpen,
  onClose,
  onClick
}: MobileMenuProps) => {
  const navigate = useNavigate();

  const handleLogin = () => {
    // Always navigate to login page instead of using callback
    navigate('/login');
    onClose?.();
  };

  const handleLogout = () => {
    // Clear login state in localStorage
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("isAdmin");
    localStorage.removeItem("userEmail");
    
    // Dispatch events to notify all components about auth state change
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new Event('authStateChanged'));
    
    onLogout();
    onClose?.();
  };

  return (
    <Sheet open={isOpen} onOpenChange={open => !open && onClose?.()}>
      <SheetTrigger asChild>
        <MobileMenuToggle onClick={onClick} />
      </SheetTrigger>
      <SheetContent side="right" className="flex flex-col justify-between">
        <div className="pt-6">
          <nav className="flex flex-col items-start space-y-4">
            {isLoggedIn && (
              <Link 
                to="/browse" 
                className="flex items-center font-medium text-lg hover:text-primary transition-colors"
                onClick={onClose}
              >
                <Heart className="h-4 w-4 mr-2" />
                Encontrar Pets
              </Link>
            )}
            <Link 
              to="/how-it-works" 
              className="flex items-center font-medium text-lg hover:text-primary transition-colors"
              onClick={onClose}
            >
              <PawPrint className="h-4 w-4 mr-2" />
              Como Funciona
            </Link>
            <Link 
              to="/petmatch" 
              className="flex items-center font-medium text-lg hover:text-primary transition-colors"
              onClick={onClose}
            >
              <Building2 className="h-4 w-4 mr-2" />
              PetMatch
            </Link>
            <Link 
              to="/institution" 
              className="flex items-center font-medium text-lg hover:text-primary transition-colors"
              onClick={onClose}
            >
              <User className="h-4 w-4 mr-2" />
              ONG Parceira
            </Link>
            <Link 
              to="/contact" 
              className="flex items-center font-medium text-lg hover:text-primary transition-colors"
              onClick={onClose}
            >
              <Mail className="h-4 w-4 mr-2" />
              Contato
            </Link>
            {isAdmin && (
              <Link 
                to="/admin" 
                className="flex items-center font-medium text-lg text-primary transition-colors"
                onClick={onClose}
              >
                <ShieldAlert className="h-4 w-4 mr-2" />
                Admin
              </Link>
            )}
          </nav>
        </div>
        
        <div className="pb-8">
          {isLoggedIn ? (
            <Button 
              onClick={handleLogout}
              className="w-full flex items-center justify-center"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          ) : (
            <Button 
              onClick={handleLogin}
              className="w-full flex items-center justify-center"
            >
              <LogIn className="h-4 w-4 mr-2" />
              Entrar
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileMenu;
