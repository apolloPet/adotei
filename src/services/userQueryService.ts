
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-sonner';
import { dbUserToUser } from '@/utils/dbConverters';
import type { User } from '@/components/admin/users/types';

// Define a simpler FilterType to avoid excessive type inference
type SimpleFilter = string | boolean | string[] | null | undefined;

// Query users from the database
export const queryUsers = async (filters?: Record<string, SimpleFilter>): Promise<User[]> => {
  try {
    console.log('Fetching users with filters:', filters);
    
    // Build the query with filters if provided
    let query = supabase.from('users').select('*');
    
    // Apply filters one by one if provided
    if (filters && typeof filters === 'object') {
      // Process each filter separately to avoid deep type recursion issues
      for (const key in filters) {
        if (Object.prototype.hasOwnProperty.call(filters, key)) {
          const value = filters[key];
          // Skip undefined or null values
          if (value === undefined || value === null) {
            continue;
          }
          
          // Special handling for array values (OR conditions)
          if (Array.isArray(value) && value.length > 0) {
            query = query.in(key, value);
          } 
          // Special handling for boolean values
          else if (typeof value === 'boolean') {
            query = query.eq(key, value);
          } 
          // String search - use ilike for partial matches
          else if (typeof value === 'string' && value.trim() !== '') {
            query = query.ilike(key, `%${value}%`);
          }
        }
      }
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching users:', error);
      toast.error('Erro ao buscar usuários');
      throw error;
    }
    
    console.log(`Fetched ${data?.length || 0} users from database`);
    
    // If no data returned, return empty array
    if (!data || data.length === 0) {
      console.log('No users found matching the criteria');
      return [];
    }
    
    // Convert database user format to application user format
    const mappedUsers = data.map(dbUserToUser);
    
    console.log('Users successfully mapped:', mappedUsers.length);
    return mappedUsers;
  } catch (error) {
    console.error('Error in queryUsers function:', error);
    toast.error('Falha ao buscar usuários');
    return [];
  }
};

// Get a single user by ID
export const getUserById = async (id: string): Promise<User | null> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        // No rows found - this is not a server error
        console.log(`No user found with ID: ${id}`);
        return null;
      }
      
      console.error('Error fetching user:', error);
      toast.error('Erro ao buscar usuário');
      throw error;
    }
    
    if (!data) {
      console.log(`No user found with ID: ${id}`);
      return null;
    }
    
    return dbUserToUser(data);
  } catch (error) {
    console.error('Error in getUserById function:', error);
    return null;
  }
};

// Search users by name, email, or phone
export const searchUsers = async (searchTerm: string): Promise<User[]> => {
  try {
    if (!searchTerm || searchTerm.trim() === '') {
      return [];
    }
    
    const term = `%${searchTerm.trim()}%`;
    
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .or(`name.ilike.${term},email.ilike.${term},phone.ilike.${term}`);
    
    if (error) {
      console.error('Error searching users:', error);
      toast.error('Erro ao buscar usuários');
      throw error;
    }
    
    console.log(`Found ${data?.length || 0} users matching search: "${searchTerm}"`);
    
    if (!data || data.length === 0) {
      return [];
    }
    
    return data.map(dbUserToUser);
  } catch (error) {
    console.error('Error in searchUsers function:', error);
    return [];
  }
};

// Get users with specific characteristics (for matching)
export const getUsersByCharacteristics = async (characteristics: Record<string, SimpleFilter>): Promise<User[]> => {
  try {
    console.log('Fetching users with characteristics:', characteristics);
    
    let query = supabase
      .from('users')
      .select('*');
    
    // Apply each characteristic as a filter
    if (characteristics && typeof characteristics === 'object') {
      for (const key in characteristics) {
        if (Object.prototype.hasOwnProperty.call(characteristics, key)) {
          const value = characteristics[key];
          if (value !== undefined && value !== null) {
            if (typeof value === 'boolean') {
              query = query.eq(key, value);
            } else if (Array.isArray(value) && value.length > 0) {
              query = query.in(key, value);
            }
          }
        }
      }
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching users by characteristics:', error);
      throw error;
    }
    
    console.log(`Found ${data?.length || 0} users matching characteristics`);
    
    if (!data || data.length === 0) {
      return [];
    }
    
    return data.map(dbUserToUser);
  } catch (error) {
    console.error('Error in getUsersByCharacteristics function:', error);
    return [];
  }
};
