
import { Link } from 'react-router-dom';
import { PawPrint } from 'lucide-react';

const Logo = () => {
  return (
    <Link to="/" className="flex items-center space-x-2 transition-transform hover:scale-105">
      <PawPrint className="h-8 w-8 text-primary" />
      <span className="font-bold text-xl tracking-tight">PetMatch</span>
    </Link>
  );
};

export default Logo;
