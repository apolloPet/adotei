
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from "@/hooks/use-sonner";
import Logo from './header/Logo';
import DesktopNav from './header/DesktopNav';
import DesktopAuthMenu from './header/DesktopAuthMenu';
import MobileMenu from './header/MobileMenu';
import MobileMenuToggle from './header/MobileMenuToggle';

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

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    // Update from props when they change
    setIsAdmin(propsIsAdmin || false);
    setIsLoggedIn(propsIsAuthenticated || false);

    // Verify status from localStorage if not provided via props
    if (propsIsAdmin === undefined || propsIsAuthenticated === undefined) {
      const adminStatus = localStorage.getItem("isAdmin") === "true";
      const loginStatus = localStorage.getItem("isLoggedIn") === "true";
      setIsAdmin(adminStatus);
      setIsLoggedIn(loginStatus);
    }

    window.addEventListener('scroll', handleScroll);
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [location.pathname, propsIsAdmin, propsIsAuthenticated]);

  const closeMenu = () => setIsMobileMenuOpen(false);

  const handleLogout = () => {
    localStorage.removeItem("isAdmin");
    localStorage.removeItem("isLoggedIn");
    setIsAdmin(false);
    setIsLoggedIn(false);
    
    if (propsOnLogout) {
      propsOnLogout();
    } else {
      toast.success("Logout realizado com sucesso");
      navigate("/");
    }
  };

  const handleLogin = () => {
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
          <MobileMenuToggle onClick={toggleMobileMenu} />
        </div>
      </div>

      {/* Mobile menu */}
      <MobileMenu 
        isOpen={isMobileMenuOpen} 
        isAdmin={isAdmin}
        isLoggedIn={isLoggedIn} 
        onClose={closeMenu} 
        onLogin={handleLogin}
        onLogout={handleLogout}
      />
    </header>
  );
};

export default Header;
