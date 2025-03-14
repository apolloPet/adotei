
import { Menu } from 'lucide-react';

interface MobileMenuToggleProps {
  isOpen?: boolean;
  onClick?: () => void;
}

const MobileMenuToggle = ({ isOpen, onClick }: MobileMenuToggleProps = {}) => {
  return (
    <button 
      className="md:hidden text-foreground"
      onClick={onClick}
      aria-label="Toggle mobile menu"
    >
      <Menu className="h-6 w-6" />
    </button>
  );
};

export default MobileMenuToggle;
