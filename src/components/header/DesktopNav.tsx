
import { Link, useLocation } from 'react-router-dom';
import { ShieldAlert, Heart, PawPrint, Building2, User, Mail } from 'lucide-react';

interface DesktopNavProps {
  isAdmin: boolean;
  isLoggedIn: boolean;
}

const DesktopNav = ({ isAdmin, isLoggedIn }: DesktopNavProps) => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="hidden md:flex items-center space-x-6">
      {isLoggedIn && (
        <Link 
          to="/browse" 
          className={`font-medium hover:text-primary transition-colors flex items-center gap-1 ${isActive('/browse') ? 'text-primary' : ''}`}
        >
          <Heart className="h-4 w-4" />
          Encontrar Pets
        </Link>
      )}
      <Link 
        to="/how-it-works" 
        className={`font-medium hover:text-primary transition-colors flex items-center gap-1 ${isActive('/how-it-works') ? 'text-primary' : ''}`}
      >
        <PawPrint className="h-4 w-4" />
        Como Funciona
      </Link>
      <Link 
        to="/petmatch" 
        className={`font-medium hover:text-primary transition-colors flex items-center gap-1 ${isActive('/petmatch') ? 'text-primary' : ''}`}
      >
        <Building2 className="h-4 w-4" />
        PetMatch
      </Link>
      <Link 
        to="/institution" 
        className={`font-medium hover:text-primary transition-colors flex items-center gap-1 ${isActive('/institution') ? 'text-primary' : ''}`}
      >
        <User className="h-4 w-4" />
        ONG Parceira
      </Link>
      <Link 
        to="/contact" 
        className={`font-medium hover:text-primary transition-colors flex items-center gap-1 ${isActive('/contact') ? 'text-primary' : ''}`}
      >
        <Mail className="h-4 w-4" />
        Contato
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
  );
};

export default DesktopNav;
