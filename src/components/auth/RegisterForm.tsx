import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { CheckCircle } from 'lucide-react';
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-sonner";
import { signUp } from '@/services/auth/authCore'; // Import directly from authCore
import { SignupData } from '@/services/auth/types';

const RegisterForm = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  
  const [street, setStreet] = useState('');
  const [number, setNumber] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [city, setCity] = useState('');
  const [cep, setCep] = useState('');
  const [state, setState] = useState('');
  
  const [housingType, setHousingType] = useState<'house' | 'apartment' | 'other'>('house');
  const [hasChildren, setHasChildren] = useState(false);
  const [childrenAges, setChildrenAges] = useState('');
  const [hadPetsBefore, setHadPetsBefore] = useState(false);
  const [hasAllergies, setHasAllergies] = useState(false);
  const [allergiesDescription, setAllergiesDescription] = useState('');
  const [workSchedule, setWorkSchedule] = useState('');
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};
    
    if (!email) {
      newErrors.email = 'O email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email inválido';
    }
    
    if (!password) {
      newErrors.password = 'A senha é obrigatória';
    } else if (password.length < 6) {
      newErrors.password = 'A senha deve ter pelo menos 6 caracteres';
    }
    
    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'As senhas não coincidem';
    }
    
    if (!name) {
      newErrors.name = 'O nome é obrigatório';
    }
    
    if (!phone) {
      newErrors.phone = 'O telefone é obrigatório';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const validateStep2 = () => {
    const newErrors: Record<string, string> = {};
    
    if (!street) {
      newErrors.street = 'O endereço é obrigatório';
    }
    
    if (!number) {
      newErrors.number = 'O número é obrigatório';
    }
    
    if (!neighborhood) {
      newErrors.neighborhood = 'O bairro é obrigatório';
    }
    
    if (!city) {
      newErrors.city = 'A cidade é obrigatória';
    }
    
    if (!cep) {
      newErrors.cep = 'O CEP é obrigatório';
    } else if (!/^\d{5}-?\d{3}$/.test(cep)) {
      newErrors.cep = 'CEP inválido. Use o formato 00000-000';
    }
    
    if (hasChildren && !childrenAges) {
      newErrors.childrenAges = 'Por favor, informe as idades das crianças';
    }
    
    if (hasAllergies && !allergiesDescription) {
      newErrors.allergiesDescription = 'Por favor, descreva as alergias';
    }
    
    if (!workSchedule) {
      newErrors.workSchedule = 'A rotina de trabalho é obrigatória';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const nextStep = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    }
  };
  
  const prevStep = () => {
    setStep(1);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (step === 1) {
      nextStep();
      return;
    }
    
    if (step === 2 && !validateStep2()) {
      return;
    }
    
    try {
      setIsLoading(true);
      setErrors({});
      
      // Format the full address correctly
      const fullAddress = `${street}${number ? `, ${number}` : ''}${neighborhood ? `, ${neighborhood}` : ''}`;
      
      const userData: SignupData = {
        email,
        password,
        firstName: name.split(' ')[0],
        lastName: name.split(' ').slice(1).join(' '),
        phone,
        address: {
          street: fullAddress,
          number,
          neighborhood,
          city,
          state,
          cep
        },
        housingType,
        hasChildren,
        childrenAges: hasChildren ? childrenAges : '',
        hadPetsBefore,
        hasAllergies,
        allergiesDescription: hasAllergies ? allergiesDescription : '',
        workSchedule
      };
      
      console.log('Registering user with data:', JSON.stringify(userData));
      
      const success = await signUp(userData);
      
      if (success) {
        toast.success("Conta criada com sucesso! Por favor, verifique seu email para confirmar o cadastro.", {
          duration: 5000
        });
        setStep(3);
      }
    } catch (error) {
      console.error("Registration error:", error);
      
      if (error instanceof Error) {
        if (error.message.includes('duplicate key')) {
          setErrors({
            email: 'Este email já está cadastrado. Por favor, tente outro email ou faça login.'
          });
          setStep(1);
        } else {
          toast.error(`Erro ao criar conta: ${error.message}`);
        }
      } else {
        toast.error("Erro desconhecido ao criar conta");
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {step === 1 && (
            <>
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white font-bold">1</div>
                  <h3 className="text-lg font-semibold">Informações de Conta</h3>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="seu.email@exemplo.com" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                    {errors.email && <p className="text-destructive text-sm">{errors.email}</p>}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="password">Senha</Label>
                      <Input 
                        id="password" 
                        type="password" 
                        placeholder="••••••••" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                      {errors.password && <p className="text-destructive text-sm">{errors.password}</p>}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirmar Senha</Label>
                      <Input 
                        id="confirm-password" 
                        type="password" 
                        placeholder="••••••••" 
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                      />
                      {errors.confirmPassword && <p className="text-destructive text-sm">{errors.confirmPassword}</p>}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome Completo</Label>
                    <Input 
                      id="name" 
                      type="text" 
                      placeholder="Seu nome completo" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                    {errors.name && <p className="text-destructive text-sm">{errors.name}</p>}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefone</Label>
                    <Input 
                      id="phone" 
                      type="tel" 
                      placeholder="(00) 00000-0000" 
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                    />
                    {errors.phone && <p className="text-destructive text-sm">{errors.phone}</p>}
                  </div>
                </div>
              </div>
              
              <Button type="button" onClick={nextStep} className="w-full" disabled={isLoading}>
                Próximo
              </Button>
            </>
          )}
          
          {step === 2 && (
            <>
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white font-bold">2</div>
                  <h3 className="text-lg font-semibold">Informações Residenciais</h3>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="street">Endereço</Label>
                    <Input 
                      id="street" 
                      type="text" 
                      placeholder="Rua/Avenida" 
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      required
                    />
                    {errors.street && <p className="text-destructive text-sm">{errors.street}</p>}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="number">Número</Label>
                      <Input 
                        id="number" 
                        type="text" 
                        placeholder="123" 
                        value={number}
                        onChange={(e) => setNumber(e.target.value)}
                        required
                      />
                      {errors.number && <p className="text-destructive text-sm">{errors.number}</p>}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="neighborhood">Bairro</Label>
                      <Input 
                        id="neighborhood" 
                        type="text" 
                        placeholder="Seu bairro" 
                        value={neighborhood}
                        onChange={(e) => setNeighborhood(e.target.value)}
                        required
                      />
                      {errors.neighborhood && <p className="text-destructive text-sm">{errors.neighborhood}</p>}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">Cidade</Label>
                      <Input 
                        id="city" 
                        type="text" 
                        placeholder="Sua cidade" 
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        required
                      />
                      {errors.city && <p className="text-destructive text-sm">{errors.city}</p>}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="state">Estado</Label>
                      <Input 
                        id="state" 
                        type="text" 
                        placeholder="UF" 
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        required
                      />
                      {errors.state && <p className="text-destructive text-sm">{errors.state}</p>}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="cep">CEP</Label>
                    <Input 
                      id="cep" 
                      type="text" 
                      placeholder="00000-000" 
                      value={cep}
                      onChange={(e) => setCep(e.target.value)}
                      required
                    />
                    {errors.cep && <p className="text-destructive text-sm">{errors.cep}</p>}
                  </div>
                </div>
              </div>
              
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white font-bold">3</div>
                  <h3 className="text-lg font-semibold">Informações Pessoais</h3>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="housing-type">Tipo de Residência</Label>
                    <Select 
                      value={housingType} 
                      onValueChange={(val) => setHousingType(val as 'house' | 'apartment' | 'other')}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo de residência" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="house">Casa</SelectItem>
                        <SelectItem value="apartment">Apartamento</SelectItem>
                        <SelectItem value="other">Outro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="has-children">Possui crianças em casa?</Label>
                      <Switch 
                        id="has-children" 
                        checked={hasChildren}
                        onCheckedChange={setHasChildren}
                      />
                    </div>
                    
                    {hasChildren && (
                      <div className="pt-2">
                        <Label htmlFor="children-ages">Idades das crianças</Label>
                        <Input 
                          id="children-ages" 
                          placeholder="Ex: 5, 8 e 12 anos" 
                          value={childrenAges}
                          onChange={(e) => setChildrenAges(e.target.value)}
                        />
                        {errors.childrenAges && <p className="text-destructive text-sm">{errors.childrenAges}</p>}
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="had-pets">Já teve animais de estimação?</Label>
                      <Switch 
                        id="had-pets" 
                        checked={hadPetsBefore}
                        onCheckedChange={setHadPetsBefore}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="has-allergies">Possui alergias relacionadas a animais?</Label>
                      <Switch 
                        id="has-allergies" 
                        checked={hasAllergies}
                        onCheckedChange={setHasAllergies}
                      />
                    </div>
                    
                    {hasAllergies && (
                      <div className="pt-2">
                        <Label htmlFor="allergies-description">Descreva as alergias</Label>
                        <Textarea 
                          id="allergies-description" 
                          placeholder="Descreva quais alergias você possui" 
                          value={allergiesDescription}
                          onChange={(e) => setAllergiesDescription(e.target.value)}
                        />
                        {errors.allergiesDescription && <p className="text-destructive text-sm">{errors.allergiesDescription}</p>}
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="work-schedule">Rotina de Trabalho</Label>
                    <Textarea 
                      id="work-schedule" 
                      placeholder="Descreva sua rotina diária de trabalho/estudos" 
                      value={workSchedule}
                      onChange={(e) => setWorkSchedule(e.target.value)}
                      required
                    />
                    {errors.workSchedule && <p className="text-destructive text-sm">{errors.workSchedule}</p>}
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
                <Button type="button" variant="outline" onClick={prevStep} className="w-full" disabled={isLoading}>
                  Voltar
                </Button>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Registrando...' : 'Cadastrar'}
                </Button>
              </div>
            </>
          )}
          
          {step === 3 && (
            <div className="flex flex-col items-center justify-center text-center space-y-4">
              <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                <CheckCircle className="h-8 w-8" />
              </div>
              <h2 className="text-2xl font-bold">Cadastro Realizado com Sucesso!</h2>
              <p className="text-muted-foreground">
                Enviamos um email de confirmação para você. Por favor, verifique sua caixa de entrada e confirme seu cadastro para começar a usar o PetMatch.
              </p>
              <Button onClick={() => navigate('/login')} className="mt-4">
                Ir para Login
              </Button>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
};

export default RegisterForm;
