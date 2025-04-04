
import { useEffect, useState } from 'react';
import { toast } from '@/hooks/use-sonner';
import { UserProfile } from '@/types/user';
import { getProfile, updateProfile } from '@/services/auth';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/hooks/auth";

export default function Profile() {
  const { user, fetchUserData } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  
  useEffect(() => {
    async function loadData() {
      if (!user) return;
      
      try {
        setLoading(true);
        console.log('Loading profile data...');
        const fetchedProfile = await getProfile();
        
        if (fetchedProfile) {
          console.log('Profile data loaded:', fetchedProfile);
          setProfile(fetchedProfile);
        } else {
          console.log('No profile found, creating a default one');
          setProfile({
            id: '',
            firstName: user.user_metadata?.firstName || '',
            lastName: user.user_metadata?.lastName || '',
            email: user.email || '',
            phone: '',
            address: '',
            city: '',
            state: '',
            zip: '',
            avatarUrl: '',
            housingType: 'house',
            hasChildren: false,
            childrenAges: '',
            hadPetsBefore: false,
            hasAllergies: false,
            allergiesDescription: '',
            workSchedule: ''
          });
        }
      } catch (error) {
        console.error('Error loading profile:', error);
        toast.error('Erro ao carregar perfil');
      } finally {
        setLoading(false);
      }
    }
    
    loadData();
  }, [user]);
  
  async function handleUpdateProfile() {
    if (!profile) return;
    
    try {
      setSaving(true);
      const success = await updateProfile(profile);
      
      if (success) {
        toast.success('Perfil atualizado com sucesso!');
        // Refresh auth state to get updated user data
        fetchUserData();
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Erro ao atualizar perfil');
    } finally {
      setSaving(false);
    }
  }
  
  if (!user) {
    return (
      <Card className="max-w-4xl mx-auto my-8">
        <CardHeader>
          <CardTitle>Perfil</CardTitle>
          <CardDescription>Você precisa estar logado para ver esta página</CardDescription>
        </CardHeader>
      </Card>
    );
  }
  
  if (loading) {
    return (
      <Card className="max-w-4xl mx-auto my-8">
        <CardHeader>
          <CardTitle>Perfil</CardTitle>
          <CardDescription>Carregando suas informações...</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center p-6">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }
  
  if (!profile) {
    return (
      <Card className="max-w-4xl mx-auto my-8">
        <CardHeader>
          <CardTitle>Perfil não encontrado</CardTitle>
          <CardDescription>Não foi possível carregar suas informações</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => window.location.reload()}>
            Tentar novamente
          </Button>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="container mx-auto p-4">
      <Card className="max-w-4xl mx-auto my-4">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Seu Perfil</CardTitle>
          <CardDescription>Mantenha suas informações atualizadas para facilitar o processo de adoção</CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Informações Pessoais</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Nome</Label>
                <Input
                  id="firstName"
                  value={profile.firstName || ''}
                  onChange={(e) => setProfile({...profile, firstName: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="lastName">Sobrenome</Label>
                <Input
                  id="lastName"
                  value={profile.lastName || ''}
                  onChange={(e) => setProfile({...profile, lastName: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={profile.email || ''}
                  disabled
                />
                <p className="text-xs text-muted-foreground">
                  Email não pode ser alterado
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  value={profile.phone || ''}
                  onChange={(e) => setProfile({...profile, phone: e.target.value})}
                  placeholder="(XX) XXXXX-XXXX"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="avatarUrl">URL da Foto de Perfil</Label>
                <Input
                  id="avatarUrl"
                  value={profile.avatarUrl || ''}
                  onChange={(e) => setProfile({...profile, avatarUrl: e.target.value})}
                  placeholder="https://..."
                />
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Endereço</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="address">Endereço</Label>
                <Input
                  id="address"
                  value={profile.address || ''}
                  onChange={(e) => setProfile({...profile, address: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="city">Cidade</Label>
                <Input
                  id="city"
                  value={profile.city || ''}
                  onChange={(e) => setProfile({...profile, city: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="state">Estado</Label>
                <Input
                  id="state"
                  value={profile.state || ''}
                  onChange={(e) => setProfile({...profile, state: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="zip">CEP</Label>
                <Input
                  id="zip"
                  value={profile.zip || ''}
                  onChange={(e) => setProfile({...profile, zip: e.target.value})}
                  placeholder="00000-000"
                />
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Informações para Adoção</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="housingType">Tipo de Moradia</Label>
                <Select
                  value={profile.housingType || 'house'}
                  onValueChange={(value) => setProfile({...profile, housingType: value})}
                >
                  <SelectTrigger id="housingType">
                    <SelectValue placeholder="Selecione o tipo de moradia" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="house">Casa</SelectItem>
                    <SelectItem value="apartment">Apartamento</SelectItem>
                    <SelectItem value="other">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="workSchedule">Horário de Trabalho</Label>
                <Input
                  id="workSchedule"
                  value={profile.workSchedule || ''}
                  onChange={(e) => setProfile({...profile, workSchedule: e.target.value})}
                  placeholder="Ex: Trabalho remoto, horário comercial, etc"
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="hasChildren">Tem Crianças</Label>
                  <Switch
                    id="hasChildren"
                    checked={profile.hasChildren || false}
                    onCheckedChange={(checked) => {
                      setProfile({...profile, hasChildren: checked})
                    }}
                  />
                </div>
                {profile.hasChildren && (
                  <Input
                    placeholder="Idades das crianças"
                    value={profile.childrenAges || ''}
                    onChange={(e) => setProfile({...profile, childrenAges: e.target.value})}
                    className="mt-2"
                  />
                )}
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="hadPetsBefore">Já teve pets antes</Label>
                  <Switch
                    id="hadPetsBefore"
                    checked={profile.hadPetsBefore || false}
                    onCheckedChange={(checked) => setProfile({...profile, hadPetsBefore: checked})}
                  />
                </div>
              </div>
              
              <div className="space-y-2 md:col-span-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="hasAllergies">Tem alergias relacionadas a animais</Label>
                  <Switch
                    id="hasAllergies"
                    checked={profile.hasAllergies || false}
                    onCheckedChange={(checked) => {
                      setProfile({...profile, hasAllergies: checked})
                      if (!checked) setProfile({...profile, hasAllergies: false, allergiesDescription: ''})
                    }}
                  />
                </div>
                {profile.hasAllergies && (
                  <Textarea
                    placeholder="Descreva as alergias"
                    value={profile.allergiesDescription || ''}
                    onChange={(e) => setProfile({...profile, allergiesDescription: e.target.value})}
                    className="mt-2"
                  />
                )}
              </div>
            </div>
          </div>
          
          <div className="pt-4 flex justify-end">
            <Button 
              onClick={handleUpdateProfile}
              disabled={saving}
            >
              {saving ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Salvando...
                </>
              ) : 'Salvar Alterações'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
