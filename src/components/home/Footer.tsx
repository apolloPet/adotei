
import { Link } from "react-router-dom";
import { Mail, Instagram, Globe, Phone } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-background border-t border-border py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <h3 className="font-bold text-xl">Adotei</h3>
            <p className="text-muted-foreground text-sm">Conectando corações e patinhas desde 2023.</p>
            <div className="flex items-center space-x-4">
              <a href="https://instagram.com/adotei_brasil" className="text-muted-foreground hover:text-primary transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="mailto:contato@adotei.com.br" className="text-muted-foreground hover:text-primary transition-colors">
                <Mail className="h-5 w-5" />
              </a>
              <a href="https://www.adotei.com.br" className="text-muted-foreground hover:text-primary transition-colors">
                <Globe className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="font-bold">Navegação</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-muted-foreground hover:text-primary transition-colors">
                  Página Inicial
                </Link>
              </li>
              <li>
                <Link to="/browse" className="text-muted-foreground hover:text-primary transition-colors">
                  Encontrar Pets
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="text-muted-foreground hover:text-primary transition-colors">
                  Como Funciona
                </Link>
              </li>
              <li>
                <Link to="/petmatch" className="text-muted-foreground hover:text-primary transition-colors">
                  PetMatch
                </Link>
              </li>
              <li>
                <Link to="/institution" className="text-muted-foreground hover:text-primary transition-colors">
                  ONG Parceira
                </Link>
              </li>
            </ul>
          </div>
          
          <div className="space-y-4">
            <h3 className="font-bold">Adote com Responsabilidade</h3>
            <ul className="space-y-2">
              <li className="text-muted-foreground">
                Adotar um animal é um compromisso para toda a vida do pet.
              </li>
              <li className="text-muted-foreground">
                Entenda suas responsabilidades antes de adotar.
              </li>
              <li className="text-muted-foreground">
                Todos os animais são entrevistados e acompanhados.
              </li>
            </ul>
          </div>
          
          <div className="space-y-4">
            <h3 className="font-bold">Contato</h3>
            <ul className="space-y-3">
              <li className="flex items-center text-muted-foreground">
                <Mail className="h-4 w-4 mr-2 text-primary" />
                contato@adotei.com.br
              </li>
              <li className="flex items-center text-muted-foreground">
                <Instagram className="h-4 w-4 mr-2 text-primary" />
                @adotei_brasil
              </li>
              <li className="flex items-center text-muted-foreground">
                <Globe className="h-4 w-4 mr-2 text-primary" />
                www.adotei.com.br
              </li>
              <li className="flex items-center text-muted-foreground">
                <Phone className="h-4 w-4 mr-2 text-primary" />
                (11) 99999-9999
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-border mt-8 pt-8 text-center text-muted-foreground text-sm">
          <p>© {new Date().getFullYear()} Adotei. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
