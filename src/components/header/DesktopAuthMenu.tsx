
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogIn, LogOut, ShieldAlert, User } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface DesktopAuthMenuProps {
  isAdmin?: boolean;
  isVolunteer?: boolean;
  isLoggedIn?: boolean;
  onLogin?: () => void;
  onLogout?: () => void;
}

const DesktopAuthMenu = ({ 
  isAdmin, 
  isVolunteer,
  isLoggedIn, 
  onLogin, 
  onLogout 
}: DesktopAuthMenuProps) => {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const navigate = useNavigate();

  const handleLogin = () => {
    if (onLogin) {
      onLogin();
    } else {
      navigate("/login");
    }
  };

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      
      // Chamar o callback de logout fornecido pelas props
      if (onLogout) {
        await onLogout();
      }
      
      // Redirecionar para a página inicial sem precisar de setTimeout
      navigate("/", { replace: true });
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const getUserInitial = () => {
    const userEmail = localStorage.getItem("userEmail");
    return userEmail ? userEmail.charAt(0).toUpperCase() : "U";
  };

  return (
    <div className="hidden md:flex items-center space-x-4">
      {isLoggedIn ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Avatar className="cursor-pointer hover:opacity-80 transition-opacity">
              <AvatarFallback className="bg-primary text-primary-foreground">
                {getUserInitial()}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate("/profile")}>
              <User className="mr-2 h-4 w-4" />
              Meu perfil
            </DropdownMenuItem>
            {(isAdmin || isVolunteer) && (
              <DropdownMenuItem onClick={() => navigate("/admin")} className="text-primary">
                <ShieldAlert className="mr-2 h-4 w-4" />
                {isVolunteer && !isAdmin ? 'Cadastro de Pets' : 'Admin'}
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              disabled={isLoggingOut}
            >
              <LogOut className="mr-2 h-4 w-4" />
              {isLoggingOut ? "Saindo..." : "Sair"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <Button onClick={handleLogin} variant="default" className="flex items-center">
          <LogIn className="mr-2 h-4 w-4" />
          Entrar
        </Button>
      )}
    </div>
  );
};

export default DesktopAuthMenu;
