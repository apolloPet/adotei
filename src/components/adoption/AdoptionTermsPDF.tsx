
import React from 'react';
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface AdoptionTermsPDFProps {
  petName: string;
  petType: string;
  adopterName: string;
  adopterDocument: string;
  adopterAddress: string;
  followUpPeriod: number;
  adoptionDate: Date;
  contractText: string;
}

const AdoptionTermsPDF = ({
  petName,
  petType = "animal",
  adopterName,
  adopterDocument = "",
  adopterAddress = "",
  followUpPeriod = 90,
  adoptionDate = new Date(),
  contractText = ""
}: AdoptionTermsPDFProps) => {
  
  const generatePDF = () => {
    // In a real implementation, you would use a library like jspdf or pdfmake
    // For this example, we'll create a text blob and download it
    const formattedDate = format(adoptionDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
    
    const defaultContractText = `Eu, ${adopterName}, inscrito(a) sob o documento ${adopterDocument}, residente em ${adopterAddress}, me comprometo a cuidar do animal ${petName} adotado, fornecendo abrigo, alimentação adequada, cuidados veterinários e carinho. Concordo em permitir visitas de acompanhamento pelo período de ${followUpPeriod} dias estabelecido e em não abandonar ou maltratar o animal sob quaisquer circunstâncias. Entendo que o animal é um ser senciente e merece respeito e amor.`;
    
    const fullText = contractText || defaultContractText;
    
    const pdfContent = `
TERMO DE RESPONSABILIDADE E COMPROMISSO DE ADOÇÃO

Data: ${formattedDate}

DADOS DO ADOTANTE:
Nome completo: ${adopterName}
Documento: ${adopterDocument}
Endereço: ${adopterAddress}

DADOS DO ANIMAL:
Nome: ${petName}
Tipo: ${petType}

TERMOS DE ADOÇÃO:
${fullText}

VISITAS DE ACOMPANHAMENTO:
O adotante concorda com visitas periódicas da equipe da ONG durante os próximos ${followUpPeriod} dias para verificação do bem-estar do animal.

DECLARAÇÃO DE COMPROMISSO:
Declaro estar ciente das responsabilidades assumidas neste termo e me comprometo a cumpri-las integralmente, zelando pelo bem-estar do animal adotado.


_________________________________________________
Assinatura do Adotante

_________________________________________________
Assinatura do Representante da ONG
`;

    const blob = new Blob([pdfContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Termo_de_Adocao_${petName}_${format(adoptionDate, 'dd-MM-yyyy')}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <Button 
      onClick={generatePDF} 
      variant="outline" 
      className="flex items-center gap-2"
    >
      <FileText className="h-4 w-4" />
      Baixar Termo de Responsabilidade
    </Button>
  );
};

export default AdoptionTermsPDF;
