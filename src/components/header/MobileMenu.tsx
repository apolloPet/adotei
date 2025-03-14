
import { Link } from "react-router-dom";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { MobileMenuToggle } from "./MobileMenuToggle";
import { 
  ShieldAlert, 
  Heart, 
  PawPrint, 
  Building2, 
  User, 
  LogIn, 
  Mail 
} from 'lucide-react';
import { Button } from "../ui/button";

interface MobileMenuProps {
  isAdmin: boolean;
  isLoggedIn: boolean;
  onLogin: () => void;
  onLogout: () => void;
}

const MobileMenu = ({ 
  isAdmin, 
  isLoggedIn, 
  onLogin, 
  onLogout 
}: MobileMenuProps) => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <MobileMenuToggle />
      </SheetTrigger>
      <SheetContent side="right" className="flex flex-col justify-between">
        <div className="pt-6">
          <nav className="flex flex-col items-start space-y-4">
            {isLoggedIn && (
              <Link 
                to="/browse" 
                className="flex items-center font-medium text-lg hover:text-primary transition-colors"
              >
                <Heart className="h-4 w-4 mr-2" />
                Encontrar Pets
              </Link>
            )}
            <Link 
              to="/how-it-works" 
              className="flex items-center font-medium text-lg hover:text-primary transition-colors"
            >
              <PawPrint className="h-4 w-4 mr-2" />
              Como Funciona
            </Link>
            <Link 
              to="/petmatch" 
              className="flex items-center font-medium text-lg hover:text-primary transition-colors"
            >
              <Building2 className="h-4 w-4 mr-2" />
              PetMatch
            </Link>
            <Link 
              to="/institution" 
              className="flex items-center font-medium text-lg hover:text-primary transition-colors"
            >
              <User className="h-4 w-4 mr-2" />
              ONG Parceira
            </Link>
            <Link 
              to="/contact" 
              className="flex items-center font-medium text-lg hover:text-primary transition-colors"
            >
              <Mail className="h-4 w-4 mr-2" />
              Contato
            </Link>
            {isAdmin && (
              <Link 
                to="/admin" 
                className="flex items-center font-medium text-lg text-primary transition-colors"
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
              onClick={onLogout}
              className="w-full"
            >
              Sair
            </Button>
          ) : (
            <Button 
              onClick={onLogin}
              className="w-full"
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
