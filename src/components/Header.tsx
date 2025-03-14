import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from "@/hooks/use-sonner";
import Logo from './header/Logo';
import DesktopNav from './header/DesktopNav';
import DesktopAuthMenu from './header/DesktopAuthMenu';
import MobileMenu from './header/MobileMenu';

interface HeaderProps {
  isAuthenticated?: boolean;
  isAdmin?: boolean;
  onLogin?: () => void;
  onLogout?: () => void;
}

const Header = ({ 
  isAuthenticated: propsIsAuthenticated,
  isAdmin: propsIsAdmin,
  onLogin: propsOnLogin,
  onLogout: propsOnLogout
}: HeaderProps = {}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(propsIsAdmin || false);
  const [isLoggedIn, setIsLoggedIn] = useState(propsIsAuthenticated || false);
  const location = useLocation();
  const navigate = useNavigate();

  // Update authentication state when props change
  useEffect(() => {
    if (propsIsAdmin !== undefined || propsIsAuthenticated !== undefined) {
      setIsAdmin(propsIsAdmin || false);
      setIsLoggedIn(propsIsAuthenticated || false);
    } else {
      const adminStatus = localStorage.getItem("isAdmin") === "true";
      const loginStatus = localStorage.getItem("isLoggedIn") === "true";
      setIsAdmin(adminStatus);
      setIsLoggedIn(loginStatus);
    }
  }, [propsIsAdmin, propsIsAuthenticated, location.pathname]);

  // Handle scroll events
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    
    // Clean up the event listener on component unmount
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const closeMenu = () => setIsMobileMenuOpen(false);

  // Garantir que o estado é atualizado quando o localStorage muda
  useEffect(() => {
    const checkLoginStatus = () => {
      const adminStatus = localStorage.getItem("isAdmin") === "true";
      const loginStatus = localStorage.getItem("isLoggedIn") === "true";
      setIsAdmin(adminStatus);
      setIsLoggedIn(loginStatus);
    };

    // Verificar ao montar o componente
    checkLoginStatus();

    // Verificar quando a rota muda
    return () => {
      checkLoginStatus();
    };
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem("isAdmin");
    localStorage.removeItem("isLoggedIn");
    setIsAdmin(false);
    setIsLoggedIn(false);
    setIsMobileMenuOpen(false);
    
    if (propsOnLogout) {
      propsOnLogout();
    } else {
      toast.success("Logout realizado com sucesso");
      navigate("/");
    }
  };

  const handleLogin = () => {
    setIsMobileMenuOpen(false);
    if (propsOnLogin) {
      propsOnLogin();
    } else {
      navigate("/login");
    }
  };

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

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
        <DesktopNav isAdmin={isAdmin} isLoggedIn={isLoggedIn} />
        <DesktopAuthMenu 
          isAdmin={isAdmin} 
          isLoggedIn={isLoggedIn}
          onLogin={handleLogin}
          onLogout={handleLogout}
        />
        <div className="md:hidden">
          <MobileMenu 
            isOpen={isMobileMenuOpen} 
            isAdmin={isAdmin}
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
