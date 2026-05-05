import { AdoptionDetails } from './types';
import { getAdoptionFee } from './settingsService';

export const getAdoptionById = async (id: string): Promise<AdoptionDetails | null> => {
  return {
    id,
    petName: 'Luna',
    petImage: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=500&auto=format&fit=crop&q=60',
    shelter: 'Adopt Connection',
    fee: await getAdoptionFee(),
    status: 'interested',
    userName: localStorage.getItem('userEmail') || 'Adotante',
  };
};
