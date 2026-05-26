
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from "@/hooks/use-sonner";
import Logo from './header/Logo';
import DesktopNav from './header/DesktopNav';
import DesktopAuthMenu from './header/DesktopAuthMenu';
import MobileMenu from './header/MobileMenu';
import { signOut } from '@/services/auth';

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
  const [isAdmin, setIsAdmin] = useState(propsIsAdmin || false);
  const [isVolunteer, setIsVolunteer] = useState(propsIsVolunteer || false);
  const [isLoggedIn, setIsLoggedIn] = useState(propsIsAuthenticated || false);
  const location = useLocation();
  const navigate = useNavigate();

  // Fechar menu ao navegar para outra rota
  useEffect(() => {
    console.log("Rota alterada: fechando menu mobile");
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const checkLoginStatus = () => {
      const loginStatus = localStorage.getItem("isLoggedIn") === "true";
      const adminStatus = localStorage.getItem("isAdmin") === "true";
      let volunteerStatus = false;
      try {
        const authUser = localStorage.getItem("authUser");
        if (authUser) {
          const parsed = JSON.parse(authUser) as { userType?: string; roles?: string[] };
          volunteerStatus = parsed.userType === "VOLUNTARIO" || Boolean(parsed.roles?.includes("VOLUNTARIO"));
        }
      } catch {
        volunteerStatus = false;
      }
      
      console.log("Header: Auth state updated:", { loginStatus, adminStatus, volunteerStatus });
      
      setIsLoggedIn(loginStatus);
      setIsAdmin(adminStatus);
      setIsVolunteer(volunteerStatus);
    };
    
    checkLoginStatus();
    
    if (propsIsAuthenticated !== undefined) {
      setIsLoggedIn(propsIsAuthenticated);
    }
    
    if (propsIsAdmin !== undefined) {
      setIsAdmin(propsIsAdmin);
    }
    if (propsIsVolunteer !== undefined) {
      setIsVolunteer(propsIsVolunteer);
    }

    window.addEventListener('storage', checkLoginStatus);
    window.addEventListener('authStateChanged', checkLoginStatus);
    
    return () => {
      window.removeEventListener('storage', checkLoginStatus);
      window.removeEventListener('authStateChanged', checkLoginStatus);
    };
  }, [propsIsAuthenticated, propsIsAdmin, propsIsVolunteer, location.pathname]);

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
      
      // Verificar se localStorage ainda tem algum dado após logout
      console.log("Header: After signOut, checking localStorage:", {
        isLoggedIn: localStorage.getItem("isLoggedIn"),
        isAdmin: localStorage.getItem("isAdmin"),
        userEmail: localStorage.getItem("userEmail")
      });
      
      // Forçar limpeza adicional do localStorage
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("isAdmin");
      localStorage.removeItem("userEmail");
      
      // Atualizar estado do componente
      setIsAdmin(false);
      setIsLoggedIn(false);
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
