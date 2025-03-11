
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Heart, User, PawPrint, ShieldAlert, LogIn, LogOut, KeyRound, Settings, Building2 } from 'lucide-react';

interface MobileMenuProps {
  isOpen: boolean;
  isAdmin: boolean;
  onClose: () => void;
  onLogout: () => void;
}

const MobileMenu = ({ isOpen, isAdmin, onClose, onLogout }: MobileMenuProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-40 bg-background animate-fade-in pt-20">
      <div className="container mx-auto px-4 py-8 flex flex-col space-y-6">
        <Link 
          to="/browse" 
          className="flex items-center space-x-2 px-4 py-3 rounded-lg hover:bg-secondary transition-colors"
          onClick={onClose}
        >
          <Heart className="h-5 w-5 text-primary" />
          <span className="font-medium">Encontrar Pets</span>
        </Link>
        <Link 
          to="/how-it-works" 
          className="flex items-center space-x-2 px-4 py-3 rounded-lg hover:bg-secondary transition-colors"
          onClick={onClose}
        >
          <PawPrint className="h-5 w-5 text-primary" />
          <span className="font-medium">Como Funciona</span>
        </Link>
        <Link 
          to="/petmatch" 
          className="flex items-center space-x-2 px-4 py-3 rounded-lg hover:bg-secondary transition-colors"
          onClick={onClose}
        >
          <Building2 className="h-5 w-5 text-primary" />
          <span className="font-medium">PetMatch</span>
        </Link>
        <Link 
          to="/institution" 
          className="flex items-center space-x-2 px-4 py-3 rounded-lg hover:bg-secondary transition-colors"
          onClick={onClose}
        >
          <User className="h-5 w-5 text-primary" />
          <span className="font-medium">ONG Parceira</span>
        </Link>
        
        {isAdmin && (
          <Link 
            to="/admin" 
            className="flex items-center space-x-2 px-4 py-3 rounded-lg bg-secondary/80 text-primary transition-colors"
            onClick={onClose}
          >
            <ShieldAlert className="h-5 w-5" />
            <span className="font-medium">Painel Admin</span>
          </Link>
        )}
        
        <div className="border-t border-border my-4"></div>
        
        <div className="flex flex-col space-y-3 px-4">
          {isAdmin ? (
            <>
              <Button 
                variant="outline" 
                className="w-full justify-start flex items-center gap-2" 
                onClick={onLogout}
              >
                <LogOut className="h-5 w-5" />
                Sair
              </Button>
              <Link to="/admin" onClick={onClose}>
                <Button variant="default" className="w-full justify-start flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Configurações
                </Button>
              </Link>
            </>
          ) : (
            <>
              <Link to="/login" onClick={onClose}>
                <Button variant="outline" className="w-full justify-start flex items-center gap-2">
                  <LogIn className="h-5 w-5" />
                  Entrar
                </Button>
              </Link>
              <Link to="/admin-login" onClick={onClose}>
                <Button variant="secondary" className="w-full justify-start flex items-center gap-2">
                  <KeyRound className="h-5 w-5" />
                  Acesso Administrativo
                </Button>
              </Link>
              <Link to="/register" onClick={onClose}>
                <Button variant="default" className="w-full justify-start">
                  Cadastrar
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MobileMenu;
