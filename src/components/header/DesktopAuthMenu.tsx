
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { LogIn, LogOut, KeyRound, Settings } from 'lucide-react';

interface DesktopAuthMenuProps {
  isAdmin: boolean;
  handleLogout: () => void;
}

const DesktopAuthMenu = ({ isAdmin, handleLogout }: DesktopAuthMenuProps) => {
  return (
    <div className="hidden md:flex items-center space-x-4">
      {isAdmin ? (
        <>
          <Button 
            variant="ghost" 
            size="sm" 
            className="rounded-full px-4 flex items-center gap-1" 
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            Sair
          </Button>
          <Link to="/admin">
            <Button 
              variant="default" 
              size="sm" 
              className="rounded-full px-4 flex items-center gap-1 bg-primary"
            >
              <Settings className="h-4 w-4" />
              Configurações
            </Button>
          </Link>
        </>
      ) : (
        <>
          <Link to="/login">
            <Button variant="ghost" size="sm" className="rounded-full px-4 flex items-center gap-1">
              <LogIn className="h-4 w-4" />
              Entrar
            </Button>
          </Link>
          <Link to="/admin-login">
            <Button variant="outline" size="sm" className="rounded-full px-4 flex items-center gap-1">
              <KeyRound className="h-4 w-4" />
              Acesso Admin
            </Button>
          </Link>
          <Link to="/register">
            <Button variant="default" size="sm" className="rounded-full px-4">
              Cadastrar
            </Button>
          </Link>
        </>
      )}
    </div>
  );
};

export default DesktopAuthMenu;
