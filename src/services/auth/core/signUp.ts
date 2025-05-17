
import { supabase } from '@/lib/supabase';
import { SignupData } from '../types';
import { UserProfile } from '@/types/user';
import { createProfile as createProfileService } from '../profileService';

/**
 * Realiza o cadastro do usuário
 */
export const signUp = async (data: SignupData): Promise<boolean> => {
  try {
    console.log('Starting signup process with data:', data);
    
    // Register user with Supabase Authentication
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          name: data.name || '',
          first_name: data.firstName || '',
          last_name: data.lastName || ''
        }
      }
    });
    
    if (authError) {
      console.error('Auth error during signup:', authError);
      throw new Error(authError.message);
    }
    
    if (!authData.user) {
      console.error('No user returned from signup');
      throw new Error('Failed to create user account');
    }
    
    console.log('User created successfully:', authData.user.id);
    
    // Format profile data
    const profileData: Partial<UserProfile> = {
      userId: authData.user.id,
      email: data.email,
      firstName: data.firstName || '',
      lastName: data.lastName || '',
      phone: data.phone || '',
      // Pass address fields separately
      address: data.address || '',
      city: data.city || '',
      state: data.state || '',
      zip: data.zip || '',
      housingType: data.housingType || 'house',
      hasChildren: data.hasChildren,
      childrenAges: data.childrenAges || '',
      hadPetsBefore: data.hadPetsBefore,
      hasAllergies: data.hasAllergies,
      allergiesDescription: data.allergiesDescription || '',
      workSchedule: data.workSchedule || '',
    };
    
    // Create the user profile with all information
    console.log('Creating user profile with data:', profileData);
    const profileSuccess = await createProfileService(profileData);
    
    if (!profileSuccess) {
      console.error('Failed to create user profile');
      // We don't want to throw here, as the auth account was created successfully
      // The user can complete their profile later
    }
    
    console.log('Signup process completed successfully');
    return true;
  } catch (error) {
    console.error('Signup process failed:', error);
    throw error;
  }
};
