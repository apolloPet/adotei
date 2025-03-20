
import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-sonner";
import { AnimalFormData } from "./types";

interface AnimalHealthInfoProps {
  formData: AnimalFormData;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleTutorSelect: (value: string) => void;
}

interface Tutor {
  id: string;
  name: string;
  role: string;
  phone: string;
  email: string;
  notes?: string;
}

const AnimalHealthInfo = ({ 
  formData, 
  handleInputChange,
  handleTutorSelect
}: AnimalHealthInfoProps) => {
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [showNewTutorForm, setShowNewTutorForm] = useState(false);
  const [newTutor, setNewTutor] = useState<Omit<Tutor, 'id'>>({
    name: '',
    role: '',
    phone: '',
    email: '',
    notes: ''
  });

  useEffect(() => {
    // Mock data for tutors - would be replaced with API call
    const fetchTutors = async () => {
      // Simulating API call
      const mockTutors = [
        { id: "1", name: "Maria Silva", role: "Veterinária", phone: "(11) 98765-4321", email: "maria@exemplo.com" },
        { id: "2", name: "João Oliveira", role: "Cuidador", phone: "(11) 91234-5678", email: "joao@exemplo.com" },
        { id: "3", name: "Ana Santos", role: "Coordenadora", phone: "(11) 99876-5432", email: "ana@exemplo.com" }
      ];
      setTutors(mockTutors);
    };
    
    fetchTutors();
  }, []);

  const handleNewTutorChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setNewTutor({
      ...newTutor,
      [e.target.name]: e.target.value
    });
  };

  const handleSaveTutor = () => {
    // Validação básica
    if (!newTutor.name || !newTutor.role || !newTutor.phone || !newTutor.email) {
      toast.error("Por favor, preencha todos os campos obrigatórios do tutor.");
      return;
    }
    
    // Simular criação de novo tutor e atualização da lista
    const newTutorWithId = { ...newTutor, id: `temp-${Date.now()}` };
    setTutors([...tutors, newTutorWithId]);
    
    // Selecionar o novo tutor
    handleTutorSelect(newTutorWithId.id);
    
    // Resetar o form e esconder
    setNewTutor({ name: '', role: '', phone: '', email: '', notes: '' });
    setShowNewTutorForm(false);
    
    toast.success("Novo tutor adicionado com sucesso!");
  };

  return (
    <div className="space-y-6">
      {/* Removed the medicalInfo Textarea that was causing the error */}
      
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Informações do Tutor Responsável (Uso Interno)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <Label htmlFor="tutorSelect">Selecione um Tutor Responsável</Label>
            <Button 
              type="button" 
              variant="outline" 
              size="sm"
              onClick={() => setShowNewTutorForm(!showNewTutorForm)}
            >
              {showNewTutorForm ? "Cancelar" : "Novo Tutor"}
            </Button>
          </div>
          
          <Select 
            value={formData.responsibleId} 
            onValueChange={handleTutorSelect}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione um tutor responsável" />
            </SelectTrigger>
            <SelectContent>
              {tutors.map(tutor => (
                <SelectItem key={tutor.id} value={tutor.id}>
                  {tutor.name} - {tutor.role}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {showNewTutorForm && (
            <div className="mt-4 p-4 border rounded-md space-y-4">
              <h3 className="font-medium">Cadastrar Novo Tutor</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tutorName">Nome do Tutor*</Label>
                  <Input 
                    id="tutorName" 
                    name="name" 
                    value={newTutor.name} 
                    onChange={handleNewTutorChange} 
                    placeholder="Nome completo" 
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tutorRole">Função*</Label>
                  <Input 
                    id="tutorRole" 
                    name="role" 
                    value={newTutor.role} 
                    onChange={handleNewTutorChange} 
                    placeholder="Ex: Veterinário, Cuidador" 
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tutorPhone">Telefone*</Label>
                  <Input 
                    id="tutorPhone" 
                    name="phone" 
                    value={newTutor.phone} 
                    onChange={handleNewTutorChange} 
                    placeholder="(00) 00000-0000" 
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tutorEmail">Email*</Label>
                  <Input 
                    id="tutorEmail" 
                    name="email" 
                    value={newTutor.email} 
                    onChange={handleNewTutorChange} 
                    placeholder="email@exemplo.com" 
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="tutorNotes">Observações</Label>
                <Textarea 
                  id="tutorNotes" 
                  name="notes" 
                  value={newTutor.notes} 
                  onChange={handleNewTutorChange} 
                  placeholder="Informações adicionais sobre o tutor"
                  rows={2}
                />
              </div>
              
              <Button 
                type="button" 
                onClick={handleSaveTutor}
                className="w-full"
              >
                Salvar Tutor
              </Button>
            </div>
          )}
          
          {formData.responsibleId && !showNewTutorForm && (
            <div className="mt-4 space-y-4">
              {tutors.filter(t => t.id === formData.responsibleId).map(tutor => (
                <div key={tutor.id} className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="caretakerName">Nome do Tutor</Label>
                    <Input 
                      id="caretakerName" 
                      name="caretakerName" 
                      value={formData.caretaker?.name || tutor.name} 
                      onChange={handleInputChange} 
                      readOnly
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="caretakerRole">Função</Label>
                    <Input 
                      id="caretakerRole" 
                      name="caretakerRole" 
                      value={formData.caretaker?.role || tutor.role} 
                      onChange={handleInputChange} 
                      readOnly
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="caretakerPhone">Telefone</Label>
                    <Input 
                      id="caretakerPhone" 
                      name="caretakerPhone" 
                      value={formData.caretaker?.phone || tutor.phone} 
                      onChange={handleInputChange} 
                      readOnly
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="caretakerEmail">Email</Label>
                    <Input 
                      id="caretakerEmail" 
                      name="caretakerEmail" 
                      value={formData.caretaker?.email || tutor.email} 
                      onChange={handleInputChange} 
                      readOnly
                    />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="caretakerNotes">Observações</Label>
                    <Textarea 
                      id="caretakerNotes" 
                      name="caretakerNotes" 
                      value={formData.caretaker?.notes || tutor.notes || ''} 
                      onChange={handleInputChange} 
                      rows={2}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AnimalHealthInfo;
