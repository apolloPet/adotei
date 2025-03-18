import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import SessionManagement from '@/components/auth/SessionManagement';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getProfile, updateProfile, resendVerificationEmail } from '@/services/authService';
import { UserProfile } from '@/types/user';
import { toast } from '@/hooks/use-sonner';
import { ArrowLeft, User, LogOut, Shield, MailCheck } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

const Profile = () => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, isLoading, navigate]);

  useEffect(() => {
    const loadProfile = async () => {
      if (isAuthenticated && user) {
        const userProfile = await getProfile();
        setProfile(userProfile);
      }
    };

    loadProfile();
  }, [isAuthenticated, user]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setProfile((prev) => {
      if (!prev) return prev;
      return { ...prev, [name]: value };
    });
  };

  const handleSwitchChange = (name: string, checked: boolean) => {
    setProfile((prev) => {
      if (!prev) return prev;
      return { ...prev, [name]: checked };
    });
  };

  const handleHousingTypeChange = (value: string) => {
    setProfile((prev) => {
      if (!prev) return prev;
      return { ...prev, housingType: value };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    setIsUpdating(true);
    try {
      const success = await updateProfile(profile);
      if (success) {
        toast.success('Perfil atualizado com sucesso!');
      }
    } catch (error) {
      toast.error('Erro ao atualizar perfil');
      console.error(error);
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading || !profile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="animate-pulse">Carregando perfil...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center">
        <Button
          variant="ghost"
          size="sm"
          className="mr-4"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <h1 className="text-2xl font-bold">Meu Perfil</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center mb-6">
                <Avatar className="h-24 w-24 mb-4">
                  <AvatarImage src={profile.avatarUrl || ''} />
                  <AvatarFallback>
                    {profile.firstName?.charAt(0) || user?.email?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <h2 className="text-xl font-semibold">
                  {profile.firstName} {profile.lastName}
                </h2>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>

              <nav className="space-y-1">
                <Button
                  variant={activeTab === 'personal' ? 'default' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => setActiveTab('personal')}
                >
                  <User className="h-4 w-4 mr-2" />
                  Informações Pessoais
                </Button>
                <Button
                  variant={activeTab === 'sessions' ? 'default' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => setActiveTab('sessions')}
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Sessões & Segurança
                </Button>
                <Button
                  variant={activeTab === 'verification' ? 'default' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => setActiveTab('verification')}
                >
                  <MailCheck className="h-4 w-4 mr-2" />
                  Verificação
                </Button>
              </nav>

              <div className="pt-6 mt-6 border-t">
                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={() => {
                    navigate('/logout');
                  }}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sair
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-3">
          {activeTab === 'personal' && (
            <form onSubmit={handleSubmit}>
              <Card>
                <CardHeader>
                  <CardTitle>Informações Pessoais</CardTitle>
                  <CardDescription>
                    Atualize seus dados pessoais e preferências
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">Nome</Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        value={profile.firstName || ''}
                        onChange={handleInputChange}
                        placeholder="Seu nome"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Sobrenome</Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        value={profile.lastName || ''}
                        onChange={handleInputChange}
                        placeholder="Seu sobrenome"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefone</Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={profile.phone || ''}
                      onChange={handleInputChange}
                      placeholder="(00) 00000-0000"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Endereço</Label>
                    <Input
                      id="address"
                      name="address"
                      value={profile.address || ''}
                      onChange={handleInputChange}
                      placeholder="Rua, número, complemento"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">Cidade</Label>
                      <Input
                        id="city"
                        name="city"
                        value={profile.city || ''}
                        onChange={handleInputChange}
                        placeholder="Sua cidade"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">Estado</Label>
                      <Input
                        id="state"
                        name="state"
                        value={profile.state || ''}
                        onChange={handleInputChange}
                        placeholder="Seu estado"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="zip">CEP</Label>
                      <Input
                        id="zip"
                        name="zip"
                        value={profile.zip || ''}
                        onChange={handleInputChange}
                        placeholder="00000-000"
                      />
                    </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t">
                    <h3 className="text-lg font-medium">Informações para Adoção</h3>

                    <div className="space-y-2">
                      <Label htmlFor="housingType">Tipo de Moradia</Label>
                      <RadioGroup
                        value={profile.housingType || 'apartment'}
                        onValueChange={handleHousingTypeChange}
                        className="flex flex-col space-y-1"
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
                          <RadioGroupItem value="other" id="other" />
                          <Label htmlFor="other">Outro</Label>
                        </div>
                      </RadioGroup>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="hasChildren"
                        checked={profile.hasChildren || false}
                        onCheckedChange={(checked) =>
                          handleSwitchChange('hasChildren', checked)
                        }
                      />
                      <Label htmlFor="hasChildren" className="cursor-pointer">
                        Tem crianças em casa
                      </Label>
                    </div>

                    {profile.hasChildren && (
                      <div className="space-y-2 pl-8">
                        <Label htmlFor="childrenAges">Idades das crianças</Label>
                        <Input
                          id="childrenAges"
                          name="childrenAges"
                          value={profile.childrenAges || ''}
                          onChange={handleInputChange}
                          placeholder="Ex: 3, 7, 12 anos"
                        />
                      </div>
                    )}

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="hadPetsBefore"
                        checked={profile.hadPetsBefore || false}
                        onCheckedChange={(checked) =>
                          handleSwitchChange('hadPetsBefore', checked)
                        }
                      />
                      <Label htmlFor="hadPetsBefore" className="cursor-pointer">
                        Já teve animais de estimação antes
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="hasAllergies"
                        checked={profile.hasAllergies || false}
                        onCheckedChange={(checked) =>
                          handleSwitchChange('hasAllergies', checked)
                        }
                      />
                      <Label htmlFor="hasAllergies" className="cursor-pointer">
                        Tem alergias a animais
                      </Label>
                    </div>

                    {profile.hasAllergies && (
                      <div className="space-y-2 pl-8">
                        <Label htmlFor="allergiesDescription">
                          Descreva suas alergias
                        </Label>
                        <Textarea
                          id="allergiesDescription"
                          name="allergiesDescription"
                          value={profile.allergiesDescription || ''}
                          onChange={handleInputChange}
                          placeholder="Descreva suas alergias a animais"
                        />
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="workSchedule">Horário de Trabalho</Label>
                      <Input
                        id="workSchedule"
                        name="workSchedule"
                        value={profile.workSchedule || ''}
                        onChange={handleInputChange}
                        placeholder="Ex: Segunda a Sexta, 8h às 18h"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <Button type="submit" disabled={isUpdating}>
                      {isUpdating ? 'Salvando...' : 'Salvar Alterações'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </form>
          )}

          {activeTab === 'sessions' && <SessionManagement />}

          {activeTab === 'verification' && (
            <Card>
              <CardHeader>
                <CardTitle>Verificação e Segurança</CardTitle>
                <CardDescription>
                  Gerenciar verificação de email e configurações de segurança da conta
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium">Email Verificado</h3>
                      <p className="text-sm text-muted-foreground">
                        {user?.email}
                      </p>
                    </div>
                    <div>
                      {user?.email_confirmed_at ? (
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                          Verificado
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                          Não verificado
                        </Badge>
                      )}
                    </div>
                  </div>

                  {!user?.email_confirmed_at && (
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        if (user?.email) {
                          resendVerificationEmail(user.email);
                        }
                      }}
                    >
                      <MailCheck className="h-4 w-4 mr-2" />
                      Reenviar Email de Verificação
                    </Button>
                  )}
                </div>

                <div className="pt-4 border-t">
                  <h3 className="text-lg font-medium mb-4">Alterar Senha</h3>
                  <Button 
                    variant="outline"
                    onClick={() => navigate('/reset-password')}
                  >
                    Redefinir Senha
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
