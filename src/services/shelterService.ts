
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { toast } from '@/hooks/use-sonner';
import { DbShelter } from '@/utils/dbConverters';

export interface Shelter {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  logoUrl?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

// Convert database shelter to frontend shelter model
const dbShelterToShelter = (dbShelter: DbShelter): Shelter => {
  return {
    id: dbShelter.id,
    name: dbShelter.name,
    email: dbShelter.email,
    phone: dbShelter.phone,
    address: dbShelter.address,
    city: dbShelter.city,
    state: dbShelter.state,
    zip: dbShelter.zip,
    logoUrl: dbShelter.logo_url,
    description: dbShelter.description,
    createdAt: dbShelter.created_at,
    updatedAt: dbShelter.updated_at
  };
};

export const fetchShelters = async (): Promise<Shelter[]> => {
  try {
    if (!isSupabaseConfigured()) {
      toast.error('Erro: Configuração do Supabase incompleta');
      return [];
    }

    const { data, error } = await supabase
      .from('shelters')
      .select('*');
    
    if (error) throw error;
    
    return (data || []).map((dbShelter) => dbShelterToShelter(dbShelter as DbShelter));
  } catch (error) {
    console.error('Error fetching shelters:', error);
    return [];
  }
};

export const fetchShelterById = async (id: string): Promise<Shelter | null> => {
  try {
    if (!isSupabaseConfigured()) {
      toast.error('Erro: Configuração do Supabase incompleta');
      return null;
    }

    const { data, error } = await supabase
      .from('shelters')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    if (!data) return null;
    
    return dbShelterToShelter(data as DbShelter);
  } catch (error) {
    console.error('Error fetching shelter by ID:', error);
    return null;
  }
};

export const fetchShelterPets = async (shelterId: string): Promise<string[]> => {
  try {
    if (!isSupabaseConfigured()) {
      toast.error('Erro: Configuração do Supabase incompleta');
      return [];
    }

    const { data, error } = await supabase
      .from('pets')
      .select('id')
      .eq('shelter_id', shelterId);
    
    if (error) throw error;
    
    return (data || []).map(pet => pet.id);
  } catch (error) {
    console.error('Error fetching shelter pets:', error);
    return [];
  }
};

export const createShelter = async (shelter: Omit<Shelter, 'id' | 'createdAt' | 'updatedAt'>): Promise<Shelter | null> => {
  try {
    if (!isSupabaseConfigured()) {
      toast.error('Erro: Configuração do Supabase incompleta');
      return null;
    }

    const dbShelter = {
      name: shelter.name,
      email: shelter.email,
      phone: shelter.phone,
      address: shelter.address,
      city: shelter.city,
      state: shelter.state,
      zip: shelter.zip,
      logo_url: shelter.logoUrl,
      description: shelter.description
    };
    
    const { data, error } = await supabase
      .from('shelters')
      .insert(dbShelter)
      .select()
      .single();
    
    if (error) throw error;
    if (!data) throw new Error('Failed to create shelter');
    
    return dbShelterToShelter(data as DbShelter);
  } catch (error) {
    console.error('Error creating shelter:', error);
    return null;
  }
};

export const updateShelter = async (id: string, updates: Partial<Shelter>): Promise<Shelter | null> => {
  try {
    if (!isSupabaseConfigured()) {
      toast.error('Erro: Configuração do Supabase incompleta');
      return null;
    }

    const dbUpdates: any = {};
    
    if (updates.name) dbUpdates.name = updates.name;
    if (updates.email) dbUpdates.email = updates.email;
    if (updates.phone) dbUpdates.phone = updates.phone;
    if (updates.address) dbUpdates.address = updates.address;
    if (updates.city) dbUpdates.city = updates.city;
    if (updates.state) dbUpdates.state = updates.state;
    if (updates.zip) dbUpdates.zip = updates.zip;
    if (updates.logoUrl !== undefined) dbUpdates.logo_url = updates.logoUrl;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    
    const { data, error } = await supabase
      .from('shelters')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    if (!data) throw new Error('Failed to update shelter');
    
    return dbShelterToShelter(data as DbShelter);
  } catch (error) {
    console.error('Error updating shelter:', error);
    return null;
  }
};

export const deleteShelter = async (id: string): Promise<boolean> => {
  try {
    if (!isSupabaseConfigured()) {
      toast.error('Erro: Configuração do Supabase incompleta');
      return false;
    }

    const { error } = await supabase
      .from('shelters')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error deleting shelter:', error);
    return false;
  }
};
