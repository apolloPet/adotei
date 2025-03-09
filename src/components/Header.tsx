import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Menu, X, Heart, User, PawPrint, ShieldAlert, LogIn, LogOut, KeyRound, Settings } from 'lucide-react';
import { toast } from "@/hooks/use-sonner";

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    // Verifica status de admin no localStorage (apenas para demonstração)
    const checkAdminStatus = () => {
      const adminStatus = localStorage.getItem("isAdmin") === "true";
      setIsAdmin(adminStatus);
    };

    window.addEventListener('scroll', handleScroll);
    checkAdminStatus();
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [location.pathname]); // Re-verifica ao mudar de página

  const closeMenu = () => setIsMobileMenuOpen(false);

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    localStorage.removeItem("isAdmin");
    setIsAdmin(false);
    toast.success("Logout realizado com sucesso");
    navigate("/");
  };

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
          {isAdmin && (
            <Link 
              to="/admin" 
              className={`font-medium text-primary transition-colors flex items-center gap-1 ${isActive('/admin') ? 'underline' : ''}`}
            >
              <ShieldAlert className="h-4 w-4" />
              Admin
            </Link>
          )}
        </nav>

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
            
            {isAdmin && (
              <Link 
                to="/admin" 
                className="flex items-center space-x-2 px-4 py-3 rounded-lg bg-secondary/80 text-primary transition-colors"
                onClick={closeMenu}
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
                    onClick={handleLogout}
                  >
                    <LogOut className="h-5 w-5" />
                    Sair
                  </Button>
                  <Link to="/admin" onClick={closeMenu}>
                    <Button variant="default" className="w-full justify-start flex items-center gap-2">
                      <Settings className="h-5 w-5" />
                      Configurações
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={closeMenu}>
                    <Button variant="outline" className="w-full justify-start flex items-center gap-2">
                      <LogIn className="h-5 w-5" />
                      Entrar
                    </Button>
                  </Link>
                  <Link to="/admin-login" onClick={closeMenu}>
                    <Button variant="secondary" className="w-full justify-start flex items-center gap-2">
                      <KeyRound className="h-5 w-5" />
                      Acesso Administrativo
                    </Button>
                  </Link>
                  <Link to="/register" onClick={closeMenu}>
                    <Button variant="default" className="w-full justify-start">
                      Cadastrar
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
