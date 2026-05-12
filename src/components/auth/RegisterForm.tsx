import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckCircle } from 'lucide-react';
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-sonner";
import { signUp } from '@/services/auth/authCore';
import { SignupData } from '@/services/auth/types';

const TOTAL_STEPS = 4;

const RegisterForm = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // Step 1
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  // Step 2 - Residential
  const [street, setStreet] = useState('');
  const [number, setNumber] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [city, setCity] = useState('');
  const [cep, setCep] = useState('');
  const [state, setState] = useState('');
  const [usefulArea, setUsefulArea] = useState('');

  // Step 3 - Pet-friendly environment
  const [housingType, setHousingType] = useState<'house' | 'apartment' | 'other'>('house');
  const [externalAccess, setExternalAccess] = useState<string>('');
  const [escapeControl, setEscapeControl] = useState<string>('');
  const [proximityKm, setProximityKm] = useState('');

  // Step 4 - Lifestyle & commitment
  const [hasChildren, setHasChildren] = useState(false);
  const [childrenAges, setChildrenAges] = useState('');
  const [hadPetsBefore, setHadPetsBefore] = useState(false);
  const [hasAllergies, setHasAllergies] = useState(false);
  const [allergiesDescription, setAllergiesDescription] = useState('');
  const [hasOtherPets, setHasOtherPets] = useState(false);
  const [otherPetsDescription, setOtherPetsDescription] = useState('');
  const [otherPetsPhoto, setOtherPetsPhoto] = useState<File | null>(null);
  const [hoursAlone, setHoursAlone] = useState('');
  const [travelPlan, setTravelPlan] = useState('');
  const [workSchedule, setWorkSchedule] = useState('');
  const [commitFood, setCommitFood] = useState(false);
  const [commitVet, setCommitVet] = useState(false);
  const [commitEmergency, setCommitEmergency] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateStep1 = () => {
    const e: Record<string, string> = {};
    if (!email) e.email = 'O email é obrigatório';
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'Email inválido';
    if (!password) e.password = 'A senha é obrigatória';
    else if (password.length < 6) e.password = 'A senha deve ter pelo menos 6 caracteres';
    if (password !== confirmPassword) e.confirmPassword = 'As senhas não coincidem';
    if (!name) e.name = 'O nome é obrigatório';
    if (!phone) e.phone = 'O telefone é obrigatório';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep2 = () => {
    const e: Record<string, string> = {};
    if (!street) e.street = 'O endereço é obrigatório';
    if (!number) e.number = 'O número é obrigatório';
    if (!neighborhood) e.neighborhood = 'O bairro é obrigatório';
    if (!city) e.city = 'A cidade é obrigatória';
    if (!cep) e.cep = 'O CEP é obrigatório';
    else if (!/^\d{5}-?\d{3}$/.test(cep)) e.cep = 'CEP inválido. Use o formato 00000-000';
    if (!state) e.state = 'O estado é obrigatório';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep3 = () => {
    const e: Record<string, string> = {};
    if (!housingType) e.housingType = 'Selecione o tipo';
    if (!externalAccess) e.externalAccess = 'Selecione uma opção';
    if (!escapeControl) e.escapeControl = 'Selecione uma opção';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep4 = () => {
    const e: Record<string, string> = {};
    if (hasChildren && !childrenAges) e.childrenAges = 'Informe as idades das crianças';
    if (hasAllergies && !allergiesDescription) e.allergiesDescription = 'Descreva as alergias';
    if (hasOtherPets && !otherPetsDescription) e.otherPetsDescription = 'Descreva os outros animais';
    if (!hoursAlone) e.hoursAlone = 'Selecione um período';
    if (!travelPlan) e.travelPlan = 'Selecione um plano';
    if (!workSchedule) e.workSchedule = 'A rotina é obrigatória';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const nextStep = () => {
    let valid = false;
    if (step === 1) valid = validateStep1();
    else if (step === 2) valid = validateStep2();
    else if (step === 3) valid = validateStep3();
    if (valid) setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  };

  const prevStep = () => setStep((s) => Math.max(1, s - 1));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step < TOTAL_STEPS) {
      nextStep();
      return;
    }
    if (!validateStep4()) return;

    try {
      setIsLoading(true);
      setErrors({});

      const fullName = name.trim();
      const nameParts = fullName.split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

      const lifestyleNotes = [
        `Horas sozinho/dia: ${hoursAlone}`,
        `Plano viagens: ${travelPlan}`,
        hasOtherPets ? `Outros animais: ${otherPetsDescription}` : '',
        `Compromissos: ${[
          commitFood && 'alimentação premium',
          commitVet && 'vacinas/vet anual',
          commitEmergency && 'emergências',
        ].filter(Boolean).join(', ') || 'nenhum'}`,
        `Área útil: ${usefulArea}m²`,
        `Acesso externo: ${externalAccess}`,
        `Controle de fugas: ${escapeControl}`,
        `Proximidade parques/vet: ${proximityKm}km`,
        `Rotina: ${workSchedule}`,
      ].filter(Boolean).join(' | ');

      const userData: SignupData = {
        email,
        password,
        name: fullName,
        firstName,
        lastName,
        phone,
        address: street,
        city,
        state,
        zip: cep,
        housingType,
        hasChildren,
        childrenAges: hasChildren ? childrenAges : '',
        hadPetsBefore,
        hasAllergies,
        allergiesDescription: hasAllergies ? allergiesDescription : '',
        workSchedule: lifestyleNotes,
      };

      const success = await signUp(userData);
      if (success) {
        toast.success("Conta criada com sucesso! Verifique seu email para confirmar.", { duration: 5000 });
        setStep(5);
      }
    } catch (error) {
      console.error("Registration error:", error);
      if (error instanceof Error) {
        if (error.message.includes('duplicate key')) {
          setErrors({ email: 'Este email já está cadastrado.' });
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

  const StepHeader = ({ n, title }: { n: number; title: string }) => (
    <div className="flex items-center gap-2 mb-4">
      <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">{n}</div>
      <h3 className="text-lg font-semibold">{title}</h3>
    </div>
  );

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        {step <= TOTAL_STEPS && (
          <div className="mb-6">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
              <span>Passo {step} de {TOTAL_STEPS}</span>
              <span>{Math.round((step / TOTAL_STEPS) * 100)}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
              <div className="h-full bg-primary transition-all" style={{ width: `${(step / TOTAL_STEPS) * 100}%` }} />
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {step === 1 && (
            <>
              <StepHeader n={1} title="Informações de Conta" />
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="seu.email@exemplo.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                  {errors.email && <p className="text-destructive text-sm">{errors.email}</p>}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="password">Senha</Label>
                    <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    {errors.password && <p className="text-destructive text-sm">{errors.password}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirmar Senha</Label>
                    <Input id="confirm-password" type="password" placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                    {errors.confirmPassword && <p className="text-destructive text-sm">{errors.confirmPassword}</p>}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Nome Completo</Label>
                  <Input id="name" type="text" placeholder="Seu nome completo" value={name} onChange={(e) => setName(e.target.value)} required />
                  {errors.name && <p className="text-destructive text-sm">{errors.name}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input id="phone" type="tel" placeholder="(00) 00000-0000" value={phone} onChange={(e) => setPhone(e.target.value)} required />
                  {errors.phone && <p className="text-destructive text-sm">{errors.phone}</p>}
                </div>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <StepHeader n={2} title="Informações Residenciais" />
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="street">Endereço</Label>
                  <Input id="street" placeholder="Rua/Avenida" value={street} onChange={(e) => setStreet(e.target.value)} required />
                  {errors.street && <p className="text-destructive text-sm">{errors.street}</p>}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="number">Número</Label>
                    <Input id="number" placeholder="123" value={number} onChange={(e) => setNumber(e.target.value)} required />
                    {errors.number && <p className="text-destructive text-sm">{errors.number}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="neighborhood">Bairro</Label>
                    <Input id="neighborhood" placeholder="Seu bairro" value={neighborhood} onChange={(e) => setNeighborhood(e.target.value)} required />
                    {errors.neighborhood && <p className="text-destructive text-sm">{errors.neighborhood}</p>}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">Cidade</Label>
                    <Input id="city" placeholder="Sua cidade" value={city} onChange={(e) => setCity(e.target.value)} required />
                    {errors.city && <p className="text-destructive text-sm">{errors.city}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">Estado</Label>
                    <Input id="state" placeholder="UF" value={state} onChange={(e) => setState(e.target.value)} required />
                    {errors.state && <p className="text-destructive text-sm">{errors.state}</p>}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cep">CEP</Label>
                    <Input id="cep" placeholder="00000-000" value={cep} onChange={(e) => setCep(e.target.value)} required />
                    {errors.cep && <p className="text-destructive text-sm">{errors.cep}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="useful-area">Área útil da residência (m²)</Label>
                    <Input id="useful-area" type="number" placeholder="Sua área útil" value={usefulArea} onChange={(e) => setUsefulArea(e.target.value)} />
                  </div>
                </div>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <StepHeader n={3} title="Ambiente Pet-Friendly" />
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Tipo de Residência</Label>
                    <Select value={housingType} onValueChange={(v) => setHousingType(v as 'house' | 'apartment' | 'other')}>
                      <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="house">Casa</SelectItem>
                        <SelectItem value="apartment">Apartamento</SelectItem>
                        <SelectItem value="other">Outro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Acesso a área externa</Label>
                    <Select value={externalAccess} onValueChange={setExternalAccess}>
                      <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="walled-yard">Pátio cercado</SelectItem>
                        <SelectItem value="screened-balcony">Sacada telada</SelectItem>
                        <SelectItem value="open-yard">Pátio aberto</SelectItem>
                        <SelectItem value="none">Nenhum</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.externalAccess && <p className="text-destructive text-sm">{errors.externalAccess}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label>Controle de frestas e rotas de fuga</Label>
                    <Select value={escapeControl} onValueChange={setEscapeControl}>
                      <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="full">Totalmente protegido</SelectItem>
                        <SelectItem value="partial">Parcialmente protegido</SelectItem>
                        <SelectItem value="none">Sem proteção</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.escapeControl && <p className="text-destructive text-sm">{errors.escapeControl}</p>}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="proximity-km">Proximidade de parques/veterinários (km)</Label>
                  <Input id="proximity-km" placeholder="Ex: 2km" value={proximityKm} onChange={(e) => setProximityKm(e.target.value)} />
                </div>
              </div>
            </>
          )}

          {step === 4 && (
            <>
              <StepHeader n={4} title="Estilo de Vida e Compromisso" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="has-children">Possui crianças em casa?</Label>
                    <Switch id="has-children" checked={hasChildren} onCheckedChange={setHasChildren} />
                  </div>
                  {hasChildren && (
                    <Input placeholder="Idades (ex: 5, 8 e 12)" value={childrenAges} onChange={(e) => setChildrenAges(e.target.value)} />
                  )}
                  {errors.childrenAges && <p className="text-destructive text-sm">{errors.childrenAges}</p>}

                  <div className="flex items-center justify-between">
                    <Label htmlFor="had-pets">Já teve animais de estimação?</Label>
                    <Switch id="had-pets" checked={hadPetsBefore} onCheckedChange={setHadPetsBefore} />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="has-allergies">Possui alergias relacionadas a animais?</Label>
                    <Switch id="has-allergies" checked={hasAllergies} onCheckedChange={setHasAllergies} />
                  </div>
                  {hasAllergies && (
                    <Textarea placeholder="Descreva as alergias" value={allergiesDescription} onChange={(e) => setAllergiesDescription(e.target.value)} />
                  )}
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="has-other-pets">Presença de outros animais</Label>
                    <Switch id="has-other-pets" checked={hasOtherPets} onCheckedChange={setHasOtherPets} />
                  </div>
                  {hasOtherPets && (
                    <>
                      <Textarea placeholder="Descreva outros pets e sua interação (espécie/temperamento)" value={otherPetsDescription} onChange={(e) => setOtherPetsDescription(e.target.value)} />
                      <div className="space-y-1">
                        <Label htmlFor="other-pets-photo" className="text-xs text-muted-foreground">Foto (opcional)</Label>
                        <Input id="other-pets-photo" type="file" accept="image/*" onChange={(e) => setOtherPetsPhoto(e.target.files?.[0] || null)} />
                      </div>
                      {errors.otherPetsDescription && <p className="text-destructive text-sm">{errors.otherPetsDescription}</p>}
                    </>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="space-y-2">
                  <Label>Tempo que o animal ficará sozinho (horas/dia)</Label>
                  <Select value={hoursAlone} onValueChange={setHoursAlone}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0-2">0 a 2 horas</SelectItem>
                      <SelectItem value="2-4">2 a 4 horas</SelectItem>
                      <SelectItem value="4-8">4 a 8 horas</SelectItem>
                      <SelectItem value="8+">Mais de 8 horas</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.hoursAlone && <p className="text-destructive text-sm">{errors.hoursAlone}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Plano para viagens/ausências</Label>
                  <Select value={travelPlan} onValueChange={setTravelPlan}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pet-sitter">Pet sitter</SelectItem>
                      <SelectItem value="pet-hotel">Hotel pet</SelectItem>
                      <SelectItem value="family-friends">Família/Amigos</SelectItem>
                      <SelectItem value="other">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.travelPlan && <p className="text-destructive text-sm">{errors.travelPlan}</p>}
                </div>
              </div>

              <div className="space-y-2 mt-4">
                <Label htmlFor="work-schedule">Rotina de Trabalho e Cuidado</Label>
                <Textarea
                  id="work-schedule"
                  placeholder="Descreva sua rotina diária de trabalho/estudos e tempo para passeios/cuidados"
                  value={workSchedule}
                  onChange={(e) => setWorkSchedule(e.target.value)}
                  required
                />
                {errors.workSchedule && <p className="text-destructive text-sm">{errors.workSchedule}</p>}
              </div>

              <div className="mt-4 rounded-md border p-4 space-y-3">
                <h4 className="font-semibold">Compromisso Financeiro e de Saúde</h4>
                <p className="text-sm text-muted-foreground">Confirme estar ciente dos custos contínuos:</p>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <Checkbox checked={commitFood} onCheckedChange={(v) => setCommitFood(!!v)} />
                    <span className="text-sm">Custo com alimentação premium</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <Checkbox checked={commitVet} onCheckedChange={(v) => setCommitVet(!!v)} />
                    <span className="text-sm">Custo com vacinas e veterinário anual</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <Checkbox checked={commitEmergency} onCheckedChange={(v) => setCommitEmergency(!!v)} />
                    <span className="text-sm">Fundo para emergências médicas</span>
                  </label>
                </div>
              </div>
            </>
          )}

          {step <= TOTAL_STEPS && (
            <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2 pt-2">
              {step > 1 && (
                <Button type="button" variant="outline" onClick={prevStep} className="w-full" disabled={isLoading}>
                  Voltar
                </Button>
              )}
              {step < TOTAL_STEPS ? (
                <Button type="button" onClick={nextStep} className="w-full" disabled={isLoading}>
                  Próximo
                </Button>
              ) : (
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Registrando...' : 'Cadastrar'}
                </Button>
              )}
            </div>
          )}

          {step === 5 && (
            <div className="flex flex-col items-center justify-center text-center space-y-4">
              <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                <CheckCircle className="h-8 w-8" />
              </div>
              <h2 className="text-2xl font-bold">Cadastro Realizado com Sucesso!</h2>
              <p className="text-muted-foreground">
                Enviamos um email de confirmação. Verifique sua caixa de entrada para começar a usar o PetMatch.
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
