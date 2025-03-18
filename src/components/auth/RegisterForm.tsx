
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-sonner";
import { signUp, SignupData } from "@/services/authService";

interface RegistrationStep {
  title: string;
  description: string;
}

const RegisterForm = () => {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState<SignupData>({
    email: '',
    password: '',
    name: '',
    phone: '',
    address: {
      street: '',
      number: '',
      neighborhood: '',
      city: '',
      cep: '',
    },
    housingType: 'apartment',
    hasChildren: false,
    childrenAges: '',
    hadPetsBefore: false,
    hasAllergies: false,
    allergiesDescription: '',
    workSchedule: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingCep, setIsLoadingCep] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const navigate = useNavigate();

  const steps: RegistrationStep[] = [
    {
      title: "Informações da Conta",
      description: "Crie seu login e senha"
    },
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
    setFormData(prev => {
      // Handle nested address fields
      if (field.startsWith('address.')) {
        const addressField = field.split('.')[1];
        return {
          ...prev,
          address: {
            ...prev.address,
            [addressField]: value
          }
        };
      }
      // Handle regular fields
      return {
        ...prev,
        [field]: value
      };
    });
  };

  const handleCepLookup = async () => {
    const cep = formData.address.cep.replace(/\D/g, '');
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
      
      updateFormData('address.street', data.logradouro || '');
      updateFormData('address.neighborhood', data.bairro || '');
      updateFormData('address.city', data.localidade || '');
      updateFormData('address.state', data.uf || '');
      
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
      // Validate account info
      if (!formData.email || !formData.password) {
        toast.error("Por favor preencha todos os campos obrigatórios");
        return;
      }
      
      // Simple email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        toast.error("Por favor digite um e-mail válido");
        return;
      }
      
      // Password strength validation
      if (formData.password.length < 6) {
        toast.error("A senha deve ter pelo menos 6 caracteres");
        return;
      }
    }
    
    if (step === 1) {
      // Validate personal info
      if (!formData.name || !formData.phone) {
        toast.error("Por favor preencha todos os campos obrigatórios");
        return;
      }
    }
    
    if (step === 2) {
      // Validate address
      if (!formData.address.cep || !formData.address.street || !formData.address.number || 
          !formData.address.neighborhood || !formData.address.city) {
        toast.error("Por favor preencha todos os campos de endereço");
        return;
      }
    }
    
    if (step === steps.length - 1) {
      if (!acceptTerms) {
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

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      
      const success = await signUp(formData);
      
      if (success) {
        toast.success("Cadastro realizado com sucesso!", {
          description: "Verifique seu e-mail para confirmar sua conta."
        });
        
        // Navigate to login page after successful registration
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      }
    } catch (error: any) {
      console.error("Registration error:", error);
      toast.error("Erro ao fazer cadastro", {
        description: error.message || "Por favor, tente novamente."
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-2xl font-bold">{steps[step].title}</h2>
        <p className="text-gray-500">{steps[step].description}</p>
      </div>
      
      {/* Step indicator */}
      <div className="px-6 py-4 bg-gray-50">
        <div className="flex justify-between mb-2">
          {steps.map((_, index) => (
            <div 
              key={index}
              className={`w-full h-1.5 rounded-full ${index === step ? 'bg-primary' : index < step ? 'bg-primary/50' : 'bg-gray-200'} ${index < steps.length - 1 ? 'mr-1' : ''}`}
            />
          ))}
        </div>
      </div>
      
      <div className="p-6">
        {step === 0 && (
          <div className="space-y-4 animate-fade-in">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="seu.email@exemplo.com" 
                value={formData.email}
                onChange={(e) => updateFormData('email', e.target.value)}
                disabled={isLoading}
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
                disabled={isLoading}
              />
              <p className="text-xs text-gray-500">
                A senha deve ter pelo menos 6 caracteres.
              </p>
            </div>
          </div>
        )}
        
        {step === 1 && (
          <div className="space-y-4 animate-fade-in">
            <div className="space-y-2">
              <Label htmlFor="name">Nome completo</Label>
              <Input 
                id="name" 
                placeholder="Seu nome completo" 
                value={formData.name}
                onChange={(e) => updateFormData('name', e.target.value)}
                disabled={isLoading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone (WhatsApp)</Label>
              <Input 
                id="phone" 
                placeholder="(00) 00000-0000" 
                value={formData.phone}
                onChange={(e) => updateFormData('phone', e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>
        )}
        
        {step === 2 && (
          <div className="space-y-4 animate-fade-in">
            <div className="space-y-2">
              <Label htmlFor="cep">CEP</Label>
              <div className="flex space-x-2">
                <Input 
                  id="cep" 
                  placeholder="00000-000" 
                  value={formData.address.cep}
                  onChange={(e) => updateFormData('address.cep', e.target.value)}
                  className="flex-1"
                  disabled={isLoading}
                />
                <Button 
                  variant="secondary" 
                  onClick={handleCepLookup}
                  disabled={isLoadingCep || isLoading}
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
                value={formData.address.street}
                onChange={(e) => updateFormData('address.street', e.target.value)}
                disabled={isLoading}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="number">Número</Label>
                <Input 
                  id="number" 
                  placeholder="123" 
                  value={formData.address.number}
                  onChange={(e) => updateFormData('address.number', e.target.value)}
                  disabled={isLoading}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="neighborhood">Bairro</Label>
                <Input 
                  id="neighborhood" 
                  placeholder="Nome do bairro" 
                  value={formData.address.neighborhood}
                  onChange={(e) => updateFormData('address.neighborhood', e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="city">Cidade</Label>
              <Input 
                id="city" 
                placeholder="Nome da cidade" 
                value={formData.address.city}
                onChange={(e) => updateFormData('address.city', e.target.value)}
                disabled={isLoading}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Tipo de moradia</Label>
              <RadioGroup 
                value={formData.housingType} 
                onValueChange={(value) => updateFormData('housingType', value)}
                className="flex flex-col space-y-2"
                disabled={isLoading}
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
                  disabled={isLoading}
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
                    disabled={isLoading}
                  />
                </div>
              )}
            </div>
          </div>
        )}
        
        {step === 3 && (
          <div className="space-y-4 animate-fade-in">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="had-pets-before">Já teve animais de estimação?</Label>
                <Switch 
                  id="had-pets-before" 
                  checked={formData.hadPetsBefore}
                  onCheckedChange={(checked) => updateFormData('hadPetsBefore', checked)}
                  disabled={isLoading}
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
                  disabled={isLoading}
                />
              </div>
              
              {formData.hasAllergies && (
                <div className="pt-2 animate-fade-in">
                  <Label htmlFor="allergies-description">Descreva suas alergias</Label>
                  <Input 
                    id="allergies-description" 
                    placeholder="Tipo de alergia, sintomas, etc." 
                    value={formData.allergiesDescription || ''}
                    onChange={(e) => updateFormData('allergiesDescription', e.target.value)}
                    disabled={isLoading}
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
                disabled={isLoading}
              />
            </div>
          </div>
        )}
        
        {step === 4 && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h3 className="text-lg font-medium">Resumo das informações</h3>
              <p className="text-sm text-muted-foreground mt-1">Verifique se todos os dados estão corretos</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium">Informações da Conta</h4>
                <div className="text-sm mt-1 space-y-1">
                  <p><span className="text-muted-foreground">Email:</span> {formData.email}</p>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h4 className="text-sm font-medium">Informações Pessoais</h4>
                <div className="text-sm mt-1 space-y-1">
                  <p><span className="text-muted-foreground">Nome:</span> {formData.name}</p>
                  <p><span className="text-muted-foreground">Telefone:</span> {formData.phone}</p>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h4 className="text-sm font-medium">Moradia</h4>
                <div className="text-sm mt-1 space-y-1">
                  <p>
                    <span className="text-muted-foreground">Endereço:</span> 
                    {formData.address.street}, {formData.address.number} - {formData.address.neighborhood}, {formData.address.city} (CEP: {formData.address.cep})
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
                checked={acceptTerms}
                onCheckedChange={(checked) => setAcceptTerms(checked === true)}
                disabled={isLoading}
              />
              <Label htmlFor="terms" className="text-sm leading-tight">
                Concordo com os <a href="#" className="text-primary hover:underline">Termos de Uso</a> e 
                confirmo que todas as informações fornecidas são verdadeiras.
              </Label>
            </div>
          </div>
        )}
      </div>
      
      <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-between">
        <Button
          variant="outline"
          onClick={handlePrevStep}
          disabled={step === 0 || isLoading}
        >
          Voltar
        </Button>
        
        <Button 
          onClick={handleNextStep}
          disabled={isLoading}
        >
          {isLoading 
            ? 'Carregando...' 
            : step === steps.length - 1 
              ? 'Finalizar Cadastro' 
              : 'Continuar'}
        </Button>
      </div>
    </div>
  );
};

export default RegisterForm;
