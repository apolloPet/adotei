
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-sonner";
import { signUp, SignupData } from "@/services/authService";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription
} from "@/components/ui/form";
import { Loader2 } from "lucide-react";

interface RegistrationStep {
  title: string;
  description: string;
}

// Esquema de validação para os dados do formulário
const accountSchema = z.object({
  email: z.string().email('Digite um email válido'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres')
});

const personalInfoSchema = z.object({
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  phone: z.string().min(10, 'Telefone deve ter pelo menos 10 dígitos')
});

const addressSchema = z.object({
  cep: z.string().min(8, 'CEP deve ter pelo menos 8 caracteres'),
  street: z.string().min(3, 'Rua é obrigatória'),
  number: z.string().min(1, 'Número é obrigatório'),
  neighborhood: z.string().min(2, 'Bairro é obrigatório'),
  city: z.string().min(2, 'Cidade é obrigatória'),
  housingType: z.enum(['apartment', 'house', 'other']),
  hasChildren: z.boolean(),
  childrenAges: z.string().optional()
});

const experienceSchema = z.object({
  hadPetsBefore: z.boolean(),
  hasAllergies: z.boolean(),
  allergiesDescription: z.string().optional(),
  workSchedule: z.string().min(3, 'Informe sua rotina de trabalho')
});

const RegisterForm = () => {
  const [step, setStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingCep, setIsLoadingCep] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const navigate = useNavigate();

  // Definir formulários para cada etapa
  const accountForm = useForm<z.infer<typeof accountSchema>>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  });

  const personalInfoForm = useForm<z.infer<typeof personalInfoSchema>>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: {
      name: '',
      phone: ''
    }
  });

  const addressForm = useForm<z.infer<typeof addressSchema>>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      cep: '',
      street: '',
      number: '',
      neighborhood: '',
      city: '',
      housingType: 'apartment',
      hasChildren: false,
      childrenAges: ''
    }
  });

  const experienceForm = useForm<z.infer<typeof experienceSchema>>({
    resolver: zodResolver(experienceSchema),
    defaultValues: {
      hadPetsBefore: false,
      hasAllergies: false,
      allergiesDescription: '',
      workSchedule: ''
    }
  });

  // Obter valores do formulário para cada etapa
  const getFormData = (): SignupData => {
    const accountData = accountForm.getValues();
    const personalData = personalInfoForm.getValues();
    const addressData = addressForm.getValues();
    const experienceData = experienceForm.getValues();

    return {
      email: accountData.email,
      password: accountData.password,
      name: personalData.name,
      phone: personalData.phone,
      address: {
        street: addressData.street,
        number: addressData.number,
        neighborhood: addressData.neighborhood,
        city: addressData.city,
        cep: addressData.cep,
      },
      housingType: addressData.housingType,
      hasChildren: addressData.hasChildren,
      childrenAges: addressData.childrenAges,
      hadPetsBefore: experienceData.hadPetsBefore,
      hasAllergies: experienceData.hasAllergies,
      allergiesDescription: experienceData.allergiesDescription,
      workSchedule: experienceData.workSchedule
    };
  };

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

  const handleCepLookup = async () => {
    const cep = addressForm.getValues('cep').replace(/\D/g, '');
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
      
      addressForm.setValue('street', data.logradouro || '', { shouldValidate: true });
      addressForm.setValue('neighborhood', data.bairro || '', { shouldValidate: true });
      addressForm.setValue('city', data.localidade || '', { shouldValidate: true });
      
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

  const handleNextStep = async () => {
    // Validar etapa atual
    try {
      if (step === 0) {
        const valid = await accountForm.trigger();
        if (!valid) return;
      }
      
      if (step === 1) {
        const valid = await personalInfoForm.trigger();
        if (!valid) return;
      }
      
      if (step === 2) {
        const valid = await addressForm.trigger();
        if (!valid) return;
      }
      
      if (step === 3) {
        const valid = await experienceForm.trigger();
        if (!valid) return;
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
    } catch (error) {
      console.error("Validation error:", error);
      toast.error("Erro ao validar formulário");
    }
  };

  const handlePrevStep = () => {
    setStep(prev => Math.max(0, prev - 1));
  };

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      
      const formData = getFormData();
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

  // Renderização condicional do formulário baseado na etapa atual
  const renderForm = () => {
    switch (step) {
      case 0:
        return (
          <Form {...accountForm}>
            <form className="space-y-4 animate-fade-in">
              <FormField
                control={accountForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="seu.email@exemplo.com" 
                        type="email" 
                        disabled={isLoading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={accountForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Senha</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Crie uma senha segura" 
                        type="password" 
                        disabled={isLoading}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      A senha deve ter pelo menos 6 caracteres.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        );
      
      case 1:
        return (
          <Form {...personalInfoForm}>
            <form className="space-y-4 animate-fade-in">
              <FormField
                control={personalInfoForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome completo</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Seu nome completo" 
                        disabled={isLoading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={personalInfoForm.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone (WhatsApp)</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="(00) 00000-0000" 
                        disabled={isLoading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        );
      
      case 2:
        return (
          <Form {...addressForm}>
            <form className="space-y-4 animate-fade-in">
              <FormField
                control={addressForm.control}
                name="cep"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CEP</FormLabel>
                    <div className="flex space-x-2">
                      <FormControl>
                        <Input 
                          placeholder="00000-000" 
                          disabled={isLoading}
                          className="flex-1"
                          {...field}
                        />
                      </FormControl>
                      <Button 
                        variant="secondary" 
                        onClick={handleCepLookup}
                        disabled={isLoadingCep || isLoading}
                        type="button"
                      >
                        {isLoadingCep ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Buscando...
                          </>
                        ) : "Buscar"}
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={addressForm.control}
                name="street"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rua</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Nome da rua" 
                        disabled={isLoading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={addressForm.control}
                  name="number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Número</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="123" 
                          disabled={isLoading}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={addressForm.control}
                  name="neighborhood"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bairro</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Nome do bairro" 
                          disabled={isLoading}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={addressForm.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cidade</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Nome da cidade" 
                        disabled={isLoading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={addressForm.control}
                name="housingType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de moradia</FormLabel>
                    <FormControl>
                      <RadioGroup 
                        className="flex flex-col space-y-2"
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={isLoading}
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="apartment" id="apartment" />
                          <FormLabel htmlFor="apartment" className="font-normal">Apartamento</FormLabel>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="house" id="house" />
                          <FormLabel htmlFor="house" className="font-normal">Casa</FormLabel>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="other" id="other-housing" />
                          <FormLabel htmlFor="other-housing" className="font-normal">Outro</FormLabel>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={addressForm.control}
                name="hasChildren"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel>Crianças em casa</FormLabel>
                      <FormControl>
                        <Switch 
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={isLoading}
                        />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {addressForm.watch('hasChildren') && (
                <FormField
                  control={addressForm.control}
                  name="childrenAges"
                  render={({ field }) => (
                    <FormItem className="pt-2 animate-fade-in">
                      <FormLabel>Idades das crianças</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Ex: 5, 8, 12 anos" 
                          disabled={isLoading}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </form>
          </Form>
        );
      
      case 3:
        return (
          <Form {...experienceForm}>
            <form className="space-y-4 animate-fade-in">
              <FormField
                control={experienceForm.control}
                name="hadPetsBefore"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel>Já teve animais de estimação?</FormLabel>
                      <FormControl>
                        <Switch 
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={isLoading}
                        />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={experienceForm.control}
                name="hasAllergies"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel>Possui alergias relacionadas a animais?</FormLabel>
                      <FormControl>
                        <Switch 
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={isLoading}
                        />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {experienceForm.watch('hasAllergies') && (
                <FormField
                  control={experienceForm.control}
                  name="allergiesDescription"
                  render={({ field }) => (
                    <FormItem className="pt-2 animate-fade-in">
                      <FormLabel>Descreva suas alergias</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Tipo de alergia, sintomas, etc." 
                          disabled={isLoading}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              
              <FormField
                control={experienceForm.control}
                name="workSchedule"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rotina de trabalho</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Ex: Home office, 8h-18h fora de casa, etc." 
                        disabled={isLoading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        );
      
      case 4:
        const formData = getFormData();
        return (
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
              <label htmlFor="terms" className="text-sm leading-tight cursor-pointer">
                Concordo com os <a href="#" className="text-primary hover:underline">Termos de Uso</a> e 
                confirmo que todas as informações fornecidas são verdadeiras.
              </label>
            </div>
          </div>
        );
      
      default:
        return null;
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
        {renderForm()}
      </div>
      
      <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-between">
        <Button
          variant="outline"
          onClick={handlePrevStep}
          disabled={step === 0 || isLoading}
          type="button"
        >
          Voltar
        </Button>
        
        <Button 
          onClick={handleNextStep}
          disabled={isLoading}
          type="button"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Carregando...
            </>
          ) : step === steps.length - 1 
              ? 'Finalizar Cadastro' 
              : 'Continuar'}
        </Button>
      </div>
    </div>
  );
};

export default RegisterForm;
