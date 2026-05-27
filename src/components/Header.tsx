
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from "@/hooks/use-sonner";
import Logo from './header/Logo';
import DesktopNav from './header/DesktopNav';
import DesktopAuthMenu from './header/DesktopAuthMenu';
import MobileMenu from './header/MobileMenu';
import { signOut } from '@/services/auth';
import { useAuth } from '@/hooks/auth';

interface HeaderProps {
  isAuthenticated?: boolean;
  isAdmin?: boolean;
  isVolunteer?: boolean;
  onLogin?: () => void;
  onLogout?: () => void;
}

const Header = ({ 
  isAuthenticated: propsIsAuthenticated,
  isAdmin: propsIsAdmin,
  isVolunteer: propsIsVolunteer,
  onLogin: propsOnLogin,
  onLogout: propsOnLogout
}: HeaderProps = {}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const auth = useAuth();
  const isLoggedIn = propsIsAuthenticated ?? auth.isAuthenticated;
  const isAdmin = propsIsAdmin ?? auth.isAdmin;
  const isVolunteer = propsIsVolunteer ?? auth.isVolunteer;

  // Fechar menu ao navegar para outra rota
  useEffect(() => {
    console.log("Rota alterada: fechando menu mobile");
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const closeMenu = () => {
    console.log("Fechando menu mobile manualmente");
    setIsMobileMenuOpen(false);
  };

  const handleLogout = async () => {
    // Adicionar logging para debug
    console.log("Header: Starting logout process");
    
    try {
      await signOut();
      
      // Atualizar estado visual local do menu mobile
      setIsMobileMenuOpen(false);
      
      // Executar callback se fornecido
      if (propsOnLogout) {
        propsOnLogout();
      } else {
        toast.success("Logout realizado com sucesso");
        // Redirecionar para a página inicial
        navigate("/", { replace: true });
      }
      
      // Recarregar a página para garantir que todos os estados sejam limpos
      // Comentado, mas pode ser habilitado se necessário
      // window.location.reload();
    } catch (error) {
      console.error("Header: Error during logout:", error);
      toast.error("Erro ao fazer logout. Tente novamente.");
    }
  };

  const handleLogin = () => {
    closeMenu();
    navigate("/login");
  };

  const toggleMobileMenu = () => {
    console.log("Alternando estado do menu mobile:", !isMobileMenuOpen);
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'py-3 bg-background/80 backdrop-blur-lg shadow-sm' : 'py-5 bg-transparent'
      }`}
    >
      <div className="container mx-auto px-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Logo />
        </div>
        <DesktopNav isAdmin={isAdmin} isVolunteer={isVolunteer} isLoggedIn={isLoggedIn} />
        <DesktopAuthMenu 
          isAdmin={isAdmin} 
          isVolunteer={isVolunteer}
          isLoggedIn={isLoggedIn}
          onLogin={handleLogin}
          onLogout={handleLogout}
        />
        <div className="md:hidden">
          <MobileMenu 
            isOpen={isMobileMenuOpen} 
            isAdmin={isAdmin}
            isVolunteer={isVolunteer}
            isLoggedIn={isLoggedIn} 
            onClose={closeMenu} 
            onLogin={handleLogin}
            onLogout={handleLogout}
            onClick={toggleMobileMenu}
          />
        </div>
      </div>
    </header>
  );
};

export default Header;
