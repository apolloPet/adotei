
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Menu, X, Heart, User, PawPrint } from 'lucide-react';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const closeMenu = () => setIsMobileMenuOpen(false);

  const isActive = (path: string) => location.pathname === path;

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'py-3 bg-background/80 backdrop-blur-lg shadow-sm' : 'py-5 bg-transparent'
      }`}
    >
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-2 transition-transform hover:scale-105">
          <PawPrint className="h-8 w-8 text-primary" />
          <span className="font-bold text-xl tracking-tight">PetMatch</span>
        </Link>

        <nav className="hidden md:flex items-center space-x-8">
          <Link 
            to="/browse" 
            className={`font-medium hover:text-primary transition-colors ${isActive('/browse') ? 'text-primary' : ''}`}
          >
            Encontrar Pets
          </Link>
          <Link 
            to="/how-it-works" 
            className={`font-medium hover:text-primary transition-colors ${isActive('/how-it-works') ? 'text-primary' : ''}`}
          >
            Como Funciona
          </Link>
          <Link 
            to="/about" 
            className={`font-medium hover:text-primary transition-colors ${isActive('/about') ? 'text-primary' : ''}`}
          >
            Sobre Nós
          </Link>
        </nav>

        <div className="hidden md:flex items-center space-x-4">
          <Link to="/login">
            <Button variant="ghost" size="sm" className="rounded-full px-4">
              Entrar
            </Button>
          </Link>
          <Link to="/register">
            <Button variant="default" size="sm" className="rounded-full px-4">
              Cadastrar
            </Button>
          </Link>
        </div>

        <button 
          className="md:hidden text-foreground"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label={isMobileMenuOpen ? "Fechar menu" : "Abrir menu"}
        >
          {isMobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-background animate-fade-in pt-20">
          <div className="container mx-auto px-4 py-8 flex flex-col space-y-6">
            <Link 
              to="/browse" 
              className="flex items-center space-x-2 px-4 py-3 rounded-lg hover:bg-secondary transition-colors"
              onClick={closeMenu}
            >
              <Heart className="h-5 w-5 text-primary" />
              <span className="font-medium">Encontrar Pets</span>
            </Link>
            <Link 
              to="/how-it-works" 
              className="flex items-center space-x-2 px-4 py-3 rounded-lg hover:bg-secondary transition-colors"
              onClick={closeMenu}
            >
              <PawPrint className="h-5 w-5 text-primary" />
              <span className="font-medium">Como Funciona</span>
            </Link>
            <Link 
              to="/about" 
              className="flex items-center space-x-2 px-4 py-3 rounded-lg hover:bg-secondary transition-colors"
              onClick={closeMenu}
            >
              <User className="h-5 w-5 text-primary" />
              <span className="font-medium">Sobre Nós</span>
            </Link>
            
            <div className="border-t border-border my-4"></div>
            
            <div className="flex flex-col space-y-3 px-4">
              <Link to="/login" onClick={closeMenu}>
                <Button variant="outline" className="w-full justify-start">
                  Entrar
                </Button>
              </Link>
              <Link to="/register" onClick={closeMenu}>
                <Button variant="default" className="w-full justify-start">
                  Cadastrar
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
