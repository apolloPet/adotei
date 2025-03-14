
import { Menu } from 'lucide-react';
import React from 'react';

interface MobileMenuToggleProps {
  isOpen?: boolean;
  onClick?: () => void;
}

const MobileMenuToggle = React.forwardRef<HTMLButtonElement, MobileMenuToggleProps>(
  ({ isOpen, onClick }: MobileMenuToggleProps, ref) => {
    return (
      <button 
        ref={ref}
        className="md:hidden text-foreground"
        onClick={onClick}
        aria-label="Toggle mobile menu"
      >
        <Menu className="h-6 w-6" />
      </button>
    );
  }
);

MobileMenuToggle.displayName = "MobileMenuToggle";

export default MobileMenuToggle;
