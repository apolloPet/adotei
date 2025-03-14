
import { AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const PetNotFound = () => {
  return (
    <div className="container mx-auto p-4 flex flex-col items-center justify-center min-h-[50vh]">
      <AlertCircle className="h-12 w-12 text-destructive mb-4" />
      <h2 className="text-2xl font-bold mb-2">Pet não encontrado</h2>
      <p className="text-muted-foreground mb-6">O pet que você está procurando não existe ou foi removido.</p>
      <Link to="/browse">
        <Button>Ver outros pets disponíveis</Button>
      </Link>
    </div>
  );
};

export default PetNotFound;
