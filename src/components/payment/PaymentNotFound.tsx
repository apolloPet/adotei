
import { Button } from "@/components/ui/button";
import { Info } from "lucide-react";
import { useNavigate } from "react-router-dom";

const PaymentNotFound = () => {
  const navigate = useNavigate();
  
  return (
    <div className="container mx-auto p-4 flex flex-col items-center justify-center min-h-[50vh]">
      <Info className="h-12 w-12 text-destructive mb-4" />
      <h2 className="text-2xl font-bold mb-2">Adoção não encontrada</h2>
      <p className="text-muted-foreground mb-6">Os detalhes desta adoção não foram encontrados.</p>
      <Button onClick={() => navigate(-1)}>Voltar</Button>
    </div>
  );
};

export default PaymentNotFound;
