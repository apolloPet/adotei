
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-sonner";

interface RegistrationStep {
  title: string;
  description: string;
}

const UserRegistration = () => {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    cep: '',
    street: '',
    number: '',
    neighborhood: '',
    city: '',
    address: '',
    housingType: 'apartment',
    hasChildren: false,
    childrenAges: '',
    hadPetsBefore: false,
    hasAllergies: false,
    allergiesDescription: '',
    workSchedule: '',
    acceptTerms: false,
  });
  const [isLoadingCep, setIsLoadingCep] = useState(false);

  const steps: RegistrationStep[] = [
    {
      title: "Informações Pessoais",
      description: "Preencha seus dados de contato"
    },
    {
      title: "Moradia",
      description: "Conte-nos sobre seu lar"
    },
    {
      title: "Experiência & Saúde",
      description: "Informações sobre sua experiência com animais e saúde"
    },
    {
      title: "Finalizar",
      description: "Revise suas informações"
    }
  ];

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCepLookup = async () => {
    const cep = formData.cep.replace(/\D/g, '');
    if (cep.length !== 8) {
      toast.error("CEP inválido", {
        description: "Por favor, digite um CEP válido com 8 números."
      });
      return;
    }

    setIsLoadingCep(true);
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await response.json();
      
      if (data.erro) {
        toast.error("CEP não encontrado", {
          description: "Não foi possível encontrar o endereço para este CEP."
        });
        return;
      }
      
      updateFormData('street', data.logradouro || '');
      updateFormData('neighborhood', data.bairro || '');
      updateFormData('city', data.localidade || '');
      
      toast.success("Endereço encontrado!", {
        description: "Os campos de endereço foram preenchidos automaticamente."
      });
    } catch (error) {
      toast.error("Erro ao buscar CEP", {
        description: "Houve um problema ao buscar o endereço. Tente novamente."
      });
    } finally {
      setIsLoadingCep(false);
    }
  };

  const handleNextStep = () => {
    if (step === 0) {
      // Validate personal info
      if (!formData.name || !formData.email || !formData.password || !formData.phone) {
        toast.error("Por favor preencha todos os campos obrigatórios");
        return;
      }
    }
    
    if (step === 1) {
      // Validate address
      if (!formData.cep || !formData.street || !formData.number || !formData.neighborhood || !formData.city) {
        toast.error("Por favor preencha todos os campos de endereço");
        return;
      }
    }
    
    if (step === steps.length - 1) {
      if (!formData.acceptTerms) {
        toast.error("Você precisa aceitar os termos e condições");
        return;
      }
      
      // Submit form
      handleSubmit();
      return;
    }
    
    setStep(prev => prev + 1);
  };

  const handlePrevStep = () => {
    setStep(prev => Math.max(0, prev - 1));
  };

  const handleSubmit = () => {
    // Here you would submit the data to your backend
    console.log("Form submitted", formData);
    
    toast.success("Cadastro realizado com sucesso!", {
      description: "Você já pode começar a encontrar seu novo amigo."
    });
    
    // In a real app, redirect to login or dashboard
    setTimeout(() => {
      window.location.href = "/browse";
    }, 2000);
  };

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">{steps[step].title}</CardTitle>
        <CardDescription>{steps[step].description}</CardDescription>
      </CardHeader>
      
      {/* Step indicator */}
      <div className="px-6">
        <div className="flex justify-between mb-2">
          {steps.map((_, index) => (
            <div 
              key={index}
              className={`w-full h-1 rounded-full ${index === step ? 'bg-primary' : index < step ? 'bg-primary/50' : 'bg-gray-200'} ${index < steps.length - 1 ? 'mr-1' : ''}`}
            />
          ))}
        </div>
      </div>
      
      <CardContent>
        {step === 0 && (
          <div className="space-y-4 animate-fade-in">
            <div className="space-y-2">
              <Label htmlFor="name">Nome completo</Label>
              <Input 
                id="name" 
                placeholder="Seu nome completo" 
                value={formData.name}
                onChange={(e) => updateFormData('name', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="seu.email@exemplo.com" 
                value={formData.email}
                onChange={(e) => updateFormData('email', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input 
                id="password" 
                type="password" 
                placeholder="Crie uma senha segura" 
                value={formData.password}
                onChange={(e) => updateFormData('password', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone (WhatsApp)</Label>
              <Input 
                id="phone" 
                placeholder="(00) 00000-0000" 
                value={formData.phone}
                onChange={(e) => updateFormData('phone', e.target.value)}
              />
            </div>
          </div>
        )}
        
        {step === 1 && (
          <div className="space-y-4 animate-fade-in">
            <div className="space-y-2">
              <Label htmlFor="cep">CEP</Label>
              <div className="flex space-x-2">
                <Input 
                  id="cep" 
                  placeholder="00000-000" 
                  value={formData.cep}
                  onChange={(e) => updateFormData('cep', e.target.value)}
                  className="flex-1"
                />
                <Button 
                  variant="secondary" 
                  onClick={handleCepLookup}
                  disabled={isLoadingCep}
                >
                  {isLoadingCep ? "Buscando..." : "Buscar"}
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="street">Rua</Label>
              <Input 
                id="street" 
                placeholder="Nome da rua" 
                value={formData.street}
                onChange={(e) => updateFormData('street', e.target.value)}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="number">Número</Label>
                <Input 
                  id="number" 
                  placeholder="123" 
                  value={formData.number}
                  onChange={(e) => updateFormData('number', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="neighborhood">Bairro</Label>
                <Input 
                  id="neighborhood" 
                  placeholder="Nome do bairro" 
                  value={formData.neighborhood}
                  onChange={(e) => updateFormData('neighborhood', e.target.value)}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="city">Cidade</Label>
              <Input 
                id="city" 
                placeholder="Nome da cidade" 
                value={formData.city}
                onChange={(e) => updateFormData('city', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Tipo de moradia</Label>
              <RadioGroup 
                value={formData.housingType} 
                onValueChange={(value) => updateFormData('housingType', value)}
                className="flex flex-col space-y-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="apartment" id="apartment" />
                  <Label htmlFor="apartment">Apartamento</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="house" id="house" />
                  <Label htmlFor="house">Casa</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="other" id="other-housing" />
                  <Label htmlFor="other-housing">Outro</Label>
                </div>
              </RadioGroup>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="has-children">Crianças em casa</Label>
                <Switch 
                  id="has-children" 
                  checked={formData.hasChildren}
                  onCheckedChange={(checked) => updateFormData('hasChildren', checked)}
                />
              </div>
              
              {formData.hasChildren && (
                <div className="pt-2 animate-fade-in">
                  <Label htmlFor="children-ages">Idades das crianças</Label>
                  <Input 
                    id="children-ages" 
                    placeholder="Ex: 5, 8, 12 anos" 
                    value={formData.childrenAges}
                    onChange={(e) => updateFormData('childrenAges', e.target.value)}
                  />
                </div>
              )}
            </div>
          </div>
        )}
        
        {step === 2 && (
          <div className="space-y-4 animate-fade-in">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="had-pets-before">Já teve animais de estimação?</Label>
                <Switch 
                  id="had-pets-before" 
                  checked={formData.hadPetsBefore}
                  onCheckedChange={(checked) => updateFormData('hadPetsBefore', checked)}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="has-allergies">Possui alergias relacionadas a animais?</Label>
                <Switch 
                  id="has-allergies" 
                  checked={formData.hasAllergies}
                  onCheckedChange={(checked) => updateFormData('hasAllergies', checked)}
                />
              </div>
              
              {formData.hasAllergies && (
                <div className="pt-2 animate-fade-in">
                  <Label htmlFor="allergies-description">Descreva suas alergias</Label>
                  <Input 
                    id="allergies-description" 
                    placeholder="Tipo de alergia, sintomas, etc." 
                    value={formData.allergiesDescription}
                    onChange={(e) => updateFormData('allergiesDescription', e.target.value)}
                  />
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="work-schedule">Rotina de trabalho</Label>
              <Input 
                id="work-schedule" 
                placeholder="Ex: Home office, 8h-18h fora de casa, etc." 
                value={formData.workSchedule}
                onChange={(e) => updateFormData('workSchedule', e.target.value)}
              />
            </div>
          </div>
        )}
        
        {step === 3 && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h3 className="text-lg font-medium">Resumo das informações</h3>
              <p className="text-sm text-muted-foreground mt-1">Verifique se todos os dados estão corretos</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium">Informações Pessoais</h4>
                <div className="text-sm mt-1 space-y-1">
                  <p><span className="text-muted-foreground">Nome:</span> {formData.name}</p>
                  <p><span className="text-muted-foreground">Email:</span> {formData.email}</p>
                  <p><span className="text-muted-foreground">Telefone:</span> {formData.phone}</p>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h4 className="text-sm font-medium">Moradia</h4>
                <div className="text-sm mt-1 space-y-1">
                  <p>
                    <span className="text-muted-foreground">Endereço:</span> 
                    {formData.street}, {formData.number} - {formData.neighborhood}, {formData.city} (CEP: {formData.cep})
                  </p>
                  <p>
                    <span className="text-muted-foreground">Tipo de moradia:</span> 
                    {formData.housingType === 'apartment' ? 'Apartamento' : 
                     formData.housingType === 'house' ? 'Casa' : 'Outro'}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Crianças:</span> 
                    {formData.hasChildren ? `Sim (${formData.childrenAges})` : 'Não'}
                  </p>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h4 className="text-sm font-medium">Experiência & Saúde</h4>
                <div className="text-sm mt-1 space-y-1">
                  <p>
                    <span className="text-muted-foreground">Experiência prévia com animais:</span> 
                    {formData.hadPetsBefore ? 'Sim' : 'Não'}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Alergias:</span> 
                    {formData.hasAllergies ? `Sim (${formData.allergiesDescription})` : 'Não'}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Rotina de trabalho:</span> 
                    {formData.workSchedule}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-start space-x-2 pt-4">
              <Checkbox 
                id="terms" 
                checked={formData.acceptTerms}
                onCheckedChange={(checked) => updateFormData('acceptTerms', checked === true)}
              />
              <Label htmlFor="terms" className="text-sm leading-tight">
                Concordo com os <a href="#" className="text-primary hover:underline">Termos de Uso</a> e 
                confirmo que todas as informações fornecidas são verdadeiras.
              </Label>
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          onClick={handlePrevStep}
          disabled={step === 0}
        >
          Voltar
        </Button>
        
        <Button onClick={handleNextStep}>
          {step === steps.length - 1 ? 'Finalizar Cadastro' : 'Continuar'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default UserRegistration;
