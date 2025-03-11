
import { Link, useLocation } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';

interface DesktopNavProps {
  isAdmin: boolean;
}

const DesktopNav = ({ isAdmin }: DesktopNavProps) => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
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
        to="/petmatch" 
        className={`font-medium hover:text-primary transition-colors ${isActive('/petmatch') ? 'text-primary' : ''}`}
      >
        PetMatch
      </Link>
      <Link 
        to="/institution" 
        className={`font-medium hover:text-primary transition-colors ${isActive('/institution') ? 'text-primary' : ''}`}
      >
        ONG Parceira
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
