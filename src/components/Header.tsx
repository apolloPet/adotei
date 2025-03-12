
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from "@/hooks/use-sonner";
import Logo from './header/Logo';
import DesktopNav from './header/DesktopNav';
import DesktopAuthMenu from './header/DesktopAuthMenu';
import MobileMenu from './header/MobileMenu';
import MobileMenuToggle from './header/MobileMenuToggle';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    // Verifica status de admin e login no localStorage (apenas para demonstração)
    const checkUserStatus = () => {
      const adminStatus = localStorage.getItem("isAdmin") === "true";
      const loginStatus = localStorage.getItem("isLoggedIn") === "true";
      setIsAdmin(adminStatus);
      setIsLoggedIn(loginStatus);
    };

    window.addEventListener('scroll', handleScroll);
    checkUserStatus();
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [location.pathname]); // Re-verifica ao mudar de página

  const closeMenu = () => setIsMobileMenuOpen(false);

  const handleLogout = () => {
    localStorage.removeItem("isAdmin");
    localStorage.removeItem("isLoggedIn");
    setIsAdmin(false);
    setIsLoggedIn(false);
    toast.success("Logout realizado com sucesso");
    navigate("/");
  };

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'py-3 bg-background/80 backdrop-blur-lg shadow-sm' : 'py-5 bg-transparent'
      }`}
    >
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Logo />
        <DesktopNav isAdmin={isAdmin} isLoggedIn={isLoggedIn} />
        <DesktopAuthMenu isAdmin={isAdmin} handleLogout={handleLogout} />
        <MobileMenuToggle isOpen={isMobileMenuOpen} onClick={toggleMobileMenu} />
      </div>

      {/* Mobile menu */}
      <MobileMenu 
        isOpen={isMobileMenuOpen} 
        isAdmin={isAdmin}
        isLoggedIn={isLoggedIn} 
        onClose={closeMenu} 
        onLogout={handleLogout}
      />
    </header>
  );
};

export default Header;
