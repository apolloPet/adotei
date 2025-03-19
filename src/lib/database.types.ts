export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      pets: {
        Row: {
          id: string
          name: string
          species: 'dog' | 'cat' | 'other'
          breed: string
          age: number
          age_unit: 'days' | 'months' | 'years'
          gender: 'male' | 'female'
          size: 'small' | 'medium' | 'large'
          weight: number
          description: string
          location: string
          shelter_id: string
          shelter_time: string
          created_at: string
          updated_at: string
          traits: string[]
          medical_info?: string
          special_needs: boolean
          health_issues: boolean
        }
        Insert: {
          id?: string
          name: string
          species: 'dog' | 'cat' | 'other'
          breed: string
          age: number
          age_unit: 'days' | 'months' | 'years'
          gender: 'male' | 'female'
          size: 'small' | 'medium' | 'large'
          weight: number
          description: string
          location: string
          shelter_id: string
          shelter_time?: string
          created_at?: string
          updated_at?: string
          traits?: string[]
          medical_info?: string
          special_needs?: boolean
          health_issues?: boolean
        }
        Update: {
          id?: string
          name?: string
          species?: 'dog' | 'cat' | 'other'
          breed?: string
          age?: number
          age_unit?: 'days' | 'months' | 'years'
          gender?: 'male' | 'female'
          size?: 'small' | 'medium' | 'large'
          weight?: number
          description?: string
          location?: string
          shelter_id?: string
          shelter_time?: string
          created_at?: string
          updated_at?: string
          traits?: string[]
          medical_info?: string
          special_needs?: boolean
          health_issues?: boolean
        }
      }
      pet_images: {
        Row: {
          id: string
          pet_id: string
          url: string
          created_at: string
          is_primary: boolean
        }
        Insert: {
          id?: string
          pet_id: string
          url: string
          created_at?: string
          is_primary?: boolean
        }
        Update: {
          id?: string
          pet_id?: string
          url?: string
          created_at?: string
          is_primary?: boolean
        }
      }
      shelters: {
        Row: {
          id: string
          name: string
          email: string
          phone: string
          address: string
          city: string
          state: string
          zip: string
          created_at: string
          updated_at: string
          logo_url?: string
          description?: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          phone: string
          address: string
          city: string
          state: string
          zip: string
          created_at?: string
          updated_at?: string
          logo_url?: string
          description?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          phone?: string
          address?: string
          city?: string
          state?: string
          zip?: string
          created_at?: string
          updated_at?: string
          logo_url?: string
          description?: string
        }
      }
      users: {
        Row: {
          id: string
          auth_id: string
          name: string
          email: string
          phone: string
          address: string
          city: string
          state: string
          zip: string
          housing_type: 'apartment' | 'house' | 'other'
          has_children: boolean
          children_ages?: string
          had_pets_before: boolean
          has_allergies: boolean
          allergies_description?: string
          work_schedule: string
          created_at: string
          updated_at: string
          avatar_url?: string
        }
        Insert: {
          id?: string
          auth_id: string
          name: string
          email: string
          phone: string
          address: string
          city: string
          state: string
          zip: string
          housing_type: 'apartment' | 'house' | 'other'
          has_children: boolean
          children_ages?: string
          had_pets_before: boolean
          has_allergies: boolean
          allergies_description?: string
          work_schedule: string
          created_at?: string
          updated_at?: string
          avatar_url?: string
        }
        Update: {
          id?: string
          auth_id?: string
          name?: string
          email?: string
          phone?: string
          address?: string
          city?: string
          state?: string
          zip?: string
          housing_type?: 'apartment' | 'house' | 'other'
          has_children?: boolean
          children_ages?: string
          had_pets_before?: boolean
          has_allergies?: boolean
          allergies_description?: string
          work_schedule?: string
          created_at?: string
          updated_at?: string
          avatar_url?: string
        }
      }
      adoptions: {
        Row: {
          id: string
          pet_id: string
          user_id: string
          current_stage: string
          notes: string
          created_at: string
          updated_at: string
          scheduled_visit_date?: string
          home_inspection_date?: string
          contract_signed: boolean
          adoption_fee_paid: boolean
        }
        Insert: {
          id?: string
          pet_id: string
          user_id: string
          current_stage: string
          notes?: string
          created_at?: string
          updated_at?: string
          scheduled_visit_date?: string
          home_inspection_date?: string
          contract_signed?: boolean
          adoption_fee_paid?: boolean
        }
        Update: {
          id?: string
          pet_id?: string
          user_id?: string
          current_stage?: string
          notes?: string
          created_at?: string
          updated_at?: string
          scheduled_visit_date?: string
          home_inspection_date?: string
          contract_signed?: boolean
          adoption_fee_paid?: boolean
        }
      }
      pet_matches: {
        Row: {
          id: string
          pet_id: string
          user_id: string
          created_at: string
          match_type: 'liked' | 'disliked'
        }
        Insert: {
          id?: string
          pet_id: string
          user_id: string
          created_at?: string
          match_type: 'liked' | 'disliked'
        }
        Update: {
          id?: string
          pet_id?: string
          user_id?: string
          created_at?: string
          match_type?: 'liked' | 'disliked'
        }
      }
      staff: {
        Row: {
          id: string
          shelter_id: string
          name: string
          email: string
          phone: string
          role: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          shelter_id: string
          name: string
          email: string
          phone: string
          role: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          shelter_id?: string
          name?: string
          email?: string
          phone?: string
          role?: string
          created_at?: string
          updated_at?: string
        }
      }
      user_roles: {
        Row: {
          id: string
          user_id: string
          role: string
          created_at: string
          updated_at: string
          permissions?: {
            manageAnimals?: boolean
            approveAdoptions?: boolean
            manageSettings?: boolean
            manageAdmins?: boolean
          }
        }
        Insert: {
          id?: string
          user_id: string
          role: string
          created_at?: string
          updated_at?: string
          permissions?: {
            manageAnimals?: boolean
            approveAdoptions?: boolean
            manageSettings?: boolean
            manageAdmins?: boolean
          }
        }
        Update: {
          id?: string
          user_id?: string
          role?: string
          created_at?: string
          updated_at?: string
          permissions?: {
            manageAnimals?: boolean
            approveAdoptions?: boolean
            manageSettings?: boolean
            manageAdmins?: boolean
          }
        }
      }
      system_parameters: {
        Row: {
          id: string
          category: string
          key: string
          value: Json
          description?: string
          created_at: string
          updated_at: string
          created_by?: string
        }
        Insert: {
          id?: string
          category: string
          key: string
          value: Json
          description?: string
          created_at?: string
          updated_at?: string
          created_by?: string
        }
        Update: {
          id?: string
          category?: string
          key?: string
          value?: Json
          description?: string
          created_at?: string
          updated_at?: string
          created_by?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
