export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      adoptions: {
        Row: {
          adoption_fee_paid: boolean | null
          contract_signed: boolean | null
          created_at: string
          current_stage: string
          home_inspection_date: string | null
          id: string
          notes: string | null
          pet_id: string
          responsible_id: string | null
          scheduled_visit_date: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          adoption_fee_paid?: boolean | null
          contract_signed?: boolean | null
          created_at?: string
          current_stage: string
          home_inspection_date?: string | null
          id?: string
          notes?: string | null
          pet_id: string
          responsible_id?: string | null
          scheduled_visit_date?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          adoption_fee_paid?: boolean | null
          contract_signed?: boolean | null
          created_at?: string
          current_stage?: string
          home_inspection_date?: string | null
          id?: string
          notes?: string | null
          pet_id?: string
          responsible_id?: string | null
          scheduled_visit_date?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "adoptions_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "adoptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      pet_images: {
        Row: {
          created_at: string
          id: string
          is_primary: boolean | null
          pet_id: string
          url: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_primary?: boolean | null
          pet_id: string
          url: string
        }
        Update: {
          created_at?: string
          id?: string
          is_primary?: boolean | null
          pet_id?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "pet_images_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
        ]
      }
      pet_matches: {
        Row: {
          created_at: string
          id: string
          match_type: string
          pet_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          match_type: string
          pet_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          match_type?: string
          pet_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pet_matches_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pet_matches_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      pets: {
        Row: {
          age: number
          age_unit: string
          breed: string
          created_at: string
          description: string
          gender: string
          health_issues: boolean | null
          id: string
          location: string
          medical_info: string | null
          name: string
          shelter_id: string
          shelter_time: string | null
          size: string
          special_needs: boolean | null
          species: string
          traits: string[] | null
          updated_at: string
          weight: number
        }
        Insert: {
          age: number
          age_unit: string
          breed: string
          created_at?: string
          description: string
          gender: string
          health_issues?: boolean | null
          id?: string
          location: string
          medical_info?: string | null
          name: string
          shelter_id: string
          shelter_time?: string | null
          size: string
          special_needs?: boolean | null
          species: string
          traits?: string[] | null
          updated_at?: string
          weight: number
        }
        Update: {
          age?: number
          age_unit?: string
          breed?: string
          created_at?: string
          description?: string
          gender?: string
          health_issues?: boolean | null
          id?: string
          location?: string
          medical_info?: string | null
          name?: string
          shelter_id?: string
          shelter_time?: string | null
          size?: string
          special_needs?: boolean | null
          species?: string
          traits?: string[] | null
          updated_at?: string
          weight?: number
        }
        Relationships: []
      }
      shelters: {
        Row: {
          address: string
          city: string
          created_at: string
          description: string | null
          email: string
          id: string
          logo_url: string | null
          name: string
          phone: string
          state: string
          updated_at: string
          zip: string
        }
        Insert: {
          address: string
          city: string
          created_at?: string
          description?: string | null
          email: string
          id?: string
          logo_url?: string | null
          name: string
          phone: string
          state: string
          updated_at?: string
          zip: string
        }
        Update: {
          address?: string
          city?: string
          created_at?: string
          description?: string | null
          email?: string
          id?: string
          logo_url?: string | null
          name?: string
          phone?: string
          state?: string
          updated_at?: string
          zip?: string
        }
        Relationships: []
      }
      staff: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string
          phone: string
          role: string
          shelter_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          name: string
          phone: string
          role: string
          shelter_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string
          phone?: string
          role?: string
          shelter_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "staff_shelter_id_fkey"
            columns: ["shelter_id"]
            isOneToOne: false
            referencedRelation: "shelters"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          address: string
          allergies_description: string | null
          auth_id: string
          avatar_url: string | null
          children_ages: string | null
          city: string
          created_at: string
          email: string
          had_pets_before: boolean
          has_allergies: boolean
          has_children: boolean
          housing_type: string
          id: string
          name: string
          phone: string
          state: string
          updated_at: string
          work_schedule: string
          zip: string
        }
        Insert: {
          address: string
          allergies_description?: string | null
          auth_id: string
          avatar_url?: string | null
          children_ages?: string | null
          city: string
          created_at?: string
          email: string
          had_pets_before: boolean
          has_allergies: boolean
          has_children: boolean
          housing_type: string
          id?: string
          name: string
          phone: string
          state: string
          updated_at?: string
          work_schedule: string
          zip: string
        }
        Update: {
          address?: string
          allergies_description?: string | null
          auth_id?: string
          avatar_url?: string | null
          children_ages?: string | null
          city?: string
          created_at?: string
          email?: string
          had_pets_before?: boolean
          has_allergies?: boolean
          has_children?: boolean
          housing_type?: string
          id?: string
          name?: string
          phone?: string
          state?: string
          updated_at?: string
          work_schedule?: string
          zip?: string
        }
        Relationships: []
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
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
