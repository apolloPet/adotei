
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-sonner";
import { useAuth } from '@/hooks/use-auth';
import { updateProfile } from '@/services/authService';
import { UserProfile } from '@/types/user';
import { Loader2, Camera } from 'lucide-react';

const Profile = () => {
  const { user, profile, isLoading: isAuthLoading, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState<Partial<UserProfile>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      navigate('/login');
    }
    
    if (profile) {
      setFormData({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        phone: profile.phone || '',
        address: profile.address || '',
        city: profile.city || '',
        state: profile.state || '',
        zip: profile.zip || '',
        housingType: profile.housingType || 'apartment',
        hasChildren: profile.hasChildren || false,
        childrenAges: profile.childrenAges || '',
        hadPetsBefore: profile.hadPetsBefore || false,
        hasAllergies: profile.hasAllergies || false,
        allergiesDescription: profile.allergiesDescription || '',
        workSchedule: profile.workSchedule || ''
      });
    }
  }, [profile, isAuthLoading, isAuthenticated, navigate]);
  
  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      
      const success = await updateProfile(formData);
      
      if (success) {
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Profile update error:", error);
      toast.error("Erro ao atualizar perfil. Por favor, tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };
  
  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Meu Perfil</h1>
          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)}>
              Editar Perfil
            </Button>
          ) : (
            <div className="flex space-x-2">
              <Button variant="outline" onClick={() => setIsEditing(false)} disabled={isLoading}>
                Cancelar
              </Button>
              <Button onClick={handleSubmit} disabled={isLoading}>
                {isLoading ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </div>
          )}
        </div>
        
        <div className="p-6">
          <div className="flex items-center space-x-4 mb-8">
            <div className="relative">
              <Avatar className="h-20 w-20">
                <AvatarImage src={profile?.avatarUrl || ''} />
                <AvatarFallback className="text-lg">
                  {profile?.firstName?.[0]}{profile?.lastName?.[0] || ''}
                </AvatarFallback>
              </Avatar>
              {isEditing && (
                <Button size="icon" variant="secondary" className="absolute bottom-0 right-0 h-6 w-6 rounded-full">
                  <Camera className="h-3 w-3" />
                </Button>
              )}
            </div>
            <div>
              <h2 className="text-xl font-semibold">
                {profile?.firstName} {profile?.lastName}
              </h2>
              <p className="text-gray-500">{user?.email}</p>
            </div>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-4">Informações Pessoais</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Nome</Label>
                    <Input 
                      id="firstName" 
                      value={formData.firstName || ''}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      disabled={!isEditing || isLoading}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Sobrenome</Label>
                    <Input 
                      id="lastName" 
                      value={formData.lastName || ''}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      disabled={!isEditing || isLoading}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefone</Label>
                    <Input 
                      id="phone" 
                      value={formData.phone || ''}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      disabled={!isEditing || isLoading}
                    />
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="text-lg font-medium mb-4">Endereço</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="address">Endereço</Label>
                    <Input 
                      id="address" 
                      value={formData.address || ''}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      disabled={!isEditing || isLoading}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="city">Cidade</Label>
                    <Input 
                      id="city" 
                      value={formData.city || ''}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      disabled={!isEditing || isLoading}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="state">Estado</Label>
                    <Input 
                      id="state" 
                      value={formData.state || ''}
                      onChange={(e) => handleInputChange('state', e.target.value)}
                      disabled={!isEditing || isLoading}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="zip">CEP</Label>
                    <Input 
                      id="zip" 
                      value={formData.zip || ''}
                      onChange={(e) => handleInputChange('zip', e.target.value)}
                      disabled={!isEditing || isLoading}
                    />
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="text-lg font-medium mb-4">Moradia e Experiência</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Tipo de moradia</Label>
                    <RadioGroup 
                      value={formData.housingType || 'apartment'} 
                      onValueChange={(value) => handleInputChange('housingType', value)}
                      className="flex flex-col space-y-2"
                      disabled={!isEditing || isLoading}
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
                        checked={formData.hasChildren || false}
                        onCheckedChange={(checked) => handleInputChange('hasChildren', checked)}
                        disabled={!isEditing || isLoading}
                      />
                    </div>
                    
                    {formData.hasChildren && (
                      <div className="pt-2 animate-fade-in">
                        <Label htmlFor="children-ages">Idades das crianças</Label>
                        <Input 
                          id="children-ages" 
                          placeholder="Ex: 5, 8, 12 anos" 
                          value={formData.childrenAges || ''}
                          onChange={(e) => handleInputChange('childrenAges', e.target.value)}
                          disabled={!isEditing || isLoading}
                        />
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="had-pets-before">Já teve animais de estimação</Label>
                      <Switch 
                        id="had-pets-before" 
                        checked={formData.hadPetsBefore || false}
                        onCheckedChange={(checked) => handleInputChange('hadPetsBefore', checked)}
                        disabled={!isEditing || isLoading}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="has-allergies">Possui alergias relacionadas a animais</Label>
                      <Switch 
                        id="has-allergies" 
                        checked={formData.hasAllergies || false}
                        onCheckedChange={(checked) => handleInputChange('hasAllergies', checked)}
                        disabled={!isEditing || isLoading}
                      />
                    </div>
                    
                    {formData.hasAllergies && (
                      <div className="pt-2 animate-fade-in">
                        <Label htmlFor="allergies-description">Descreva suas alergias</Label>
                        <Input 
                          id="allergies-description" 
                          placeholder="Tipo de alergia, sintomas, etc." 
                          value={formData.allergiesDescription || ''}
                          onChange={(e) => handleInputChange('allergiesDescription', e.target.value)}
                          disabled={!isEditing || isLoading}
                        />
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="work-schedule">Rotina de trabalho</Label>
                    <Input 
                      id="work-schedule" 
                      placeholder="Ex: Home office, 8h-18h fora de casa, etc." 
                      value={formData.workSchedule || ''}
                      onChange={(e) => handleInputChange('workSchedule', e.target.value)}
                      disabled={!isEditing || isLoading}
                    />
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
