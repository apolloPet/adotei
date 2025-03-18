import { useEffect, useState } from 'react';
import { toast } from '@/hooks/use-sonner';
import { UserProfile } from '@/types/user';
import { getProfile, updateProfile } from '@/services/auth';

export default function Profile() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  
  useEffect(() => {
    async function loadData() {
      try {
        const fetchedProfile = await getProfile();
        if (fetchedProfile) {
          setProfile(fetchedProfile);
        }
      } catch (error) {
        console.error('Error loading profile:', error);
        toast.error('Erro ao carregar perfil');
      } finally {
        setLoading(false);
      }
    }
    
    loadData();
  }, []);
  
  async function updateProfileData() {
    if (!profile) return;
    
    try {
      const updatedProfile: Partial<UserProfile> = {
        firstName: profile.firstName,
        lastName: profile.lastName,
        avatarUrl: profile.avatarUrl,
        address: profile.address,
        city: profile.city,
        state: profile.state,
        zip: profile.zip,
        phone: profile.phone,
        // Add other fields as needed
      };
      
      const success = await updateProfile(updatedProfile);
      
      if (success) {
        toast.success('Perfil atualizado com sucesso!');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Erro ao atualizar perfil');
    }
  }
  
  if (loading) {
    return <div>Carregando...</div>;
  }
  
  if (!profile) {
    return <div>Perfil não encontrado</div>;
  }
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Seu Perfil</h1>
      
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Informações Pessoais</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome
            </label>
            <input
              type="text"
              className="w-full p-2 border rounded"
              value={profile.firstName || ''}
              onChange={(e) => setProfile({...profile, firstName: e.target.value})}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sobrenome
            </label>
            <input
              type="text"
              className="w-full p-2 border rounded"
              value={profile.lastName || ''}
              onChange={(e) => setProfile({...profile, lastName: e.target.value})}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Telefone
            </label>
            <input
              type="text"
              className="w-full p-2 border rounded"
              value={profile.phone || ''}
              onChange={(e) => setProfile({...profile, phone: e.target.value})}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              URL da Foto
            </label>
            <input
              type="text"
              className="w-full p-2 border rounded"
              value={profile.avatarUrl || ''}
              onChange={(e) => setProfile({...profile, avatarUrl: e.target.value})}
            />
          </div>
        </div>
        
        <h2 className="text-xl font-semibold mb-4">Endereço</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Endereço
            </label>
            <input
              type="text"
              className="w-full p-2 border rounded"
              value={profile.address || ''}
              onChange={(e) => setProfile({...profile, address: e.target.value})}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cidade
            </label>
            <input
              type="text"
              className="w-full p-2 border rounded"
              value={profile.city || ''}
              onChange={(e) => setProfile({...profile, city: e.target.value})}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estado
            </label>
            <input
              type="text"
              className="w-full p-2 border rounded"
              value={profile.state || ''}
              onChange={(e) => setProfile({...profile, state: e.target.value})}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              CEP
            </label>
            <input
              type="text"
              className="w-full p-2 border rounded"
              value={profile.zip || ''}
              onChange={(e) => setProfile({...profile, zip: e.target.value})}
            />
          </div>
        </div>
        
        <button
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          onClick={updateProfileData}
        >
          Salvar Alterações
        </button>
      </div>
    </div>
  );
}
