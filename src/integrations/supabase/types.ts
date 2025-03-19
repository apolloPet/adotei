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
      adoption_follow_ups: {
        Row: {
          adoption_id: string | null
          created_at: string | null
          created_by: string | null
          follow_up_date: string
          id: string
          notes: string | null
          status: string
          updated_at: string | null
        }
        Insert: {
          adoption_id?: string | null
          created_at?: string | null
          created_by?: string | null
          follow_up_date: string
          id?: string
          notes?: string | null
          status: string
          updated_at?: string | null
        }
        Update: {
          adoption_id?: string | null
          created_at?: string | null
          created_by?: string | null
          follow_up_date?: string
          id?: string
          notes?: string | null
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "adoption_follow_ups_adoption_id_fkey"
            columns: ["adoption_id"]
            isOneToOne: false
            referencedRelation: "adoptions"
            referencedColumns: ["id"]
          },
        ]
      }
      adoptions: {
        Row: {
          adoption_fee_paid: boolean | null
          approved_by: string | null
          contract_signed: boolean | null
          created_at: string
          current_stage: string
          follow_up_status: string | null
          home_inspection_date: string | null
          id: string
          last_follow_up_date: string | null
          next_follow_up_date: string | null
          notes: string | null
          pet_id: string
          rejection_reason: string | null
          responsible_id: string | null
          scheduled_visit_date: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          adoption_fee_paid?: boolean | null
          approved_by?: string | null
          contract_signed?: boolean | null
          created_at?: string
          current_stage: string
          follow_up_status?: string | null
          home_inspection_date?: string | null
          id?: string
          last_follow_up_date?: string | null
          next_follow_up_date?: string | null
          notes?: string | null
          pet_id: string
          rejection_reason?: string | null
          responsible_id?: string | null
          scheduled_visit_date?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          adoption_fee_paid?: boolean | null
          approved_by?: string | null
          contract_signed?: boolean | null
          created_at?: string
          current_stage?: string
          follow_up_status?: string | null
          home_inspection_date?: string | null
          id?: string
          last_follow_up_date?: string | null
          next_follow_up_date?: string | null
          notes?: string | null
          pet_id?: string
          rejection_reason?: string | null
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
      animal_adoption_requirements: {
        Row: {
          created_at: string | null
          id: string
          importance: string | null
          pet_id: string
          requirement: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          importance?: string | null
          pet_id: string
          requirement: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          importance?: string | null
          pet_id?: string
          requirement?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "animal_adoption_requirements_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
        ]
      }
      animal_health_records: {
        Row: {
          allergies: string[] | null
          created_at: string | null
          id: string
          last_vet_visit: string | null
          medical_conditions: string[] | null
          medications: string[] | null
          pet_id: string
          sterilized: boolean | null
          updated_at: string | null
          vaccination_status: string | null
        }
        Insert: {
          allergies?: string[] | null
          created_at?: string | null
          id?: string
          last_vet_visit?: string | null
          medical_conditions?: string[] | null
          medications?: string[] | null
          pet_id: string
          sterilized?: boolean | null
          updated_at?: string | null
          vaccination_status?: string | null
        }
        Update: {
          allergies?: string[] | null
          created_at?: string | null
          id?: string
          last_vet_visit?: string | null
          medical_conditions?: string[] | null
          medications?: string[] | null
          pet_id?: string
          sterilized?: boolean | null
          updated_at?: string | null
          vaccination_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "animal_health_records_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
        ]
      }
      cost_parameters: {
        Row: {
          category: string
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          updated_at: string | null
          value: number
        }
        Insert: {
          category: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string | null
          value: number
        }
        Update: {
          category?: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string | null
          value?: number
        }
        Relationships: []
      }
      cost_simulations: {
        Row: {
          age_months: number | null
          animal_size: string
          animal_type: string
          created_at: string | null
          estimated_lifetime_cost: number | null
          estimated_monthly_cost: number
          estimated_yearly_cost: number
          food_type: string | null
          health_conditions: string[] | null
          id: string
          results_json: Json | null
          special_care_needs: string[] | null
          user_id: string | null
        }
        Insert: {
          age_months?: number | null
          animal_size: string
          animal_type: string
          created_at?: string | null
          estimated_lifetime_cost?: number | null
          estimated_monthly_cost: number
          estimated_yearly_cost: number
          food_type?: string | null
          health_conditions?: string[] | null
          id?: string
          results_json?: Json | null
          special_care_needs?: string[] | null
          user_id?: string | null
        }
        Update: {
          age_months?: number | null
          animal_size?: string
          animal_type?: string
          created_at?: string | null
          estimated_lifetime_cost?: number | null
          estimated_monthly_cost?: number
          estimated_yearly_cost?: number
          food_type?: string | null
          health_conditions?: string[] | null
          id?: string
          results_json?: Json | null
          special_care_needs?: string[] | null
          user_id?: string | null
        }
        Relationships: []
      }
      partnership_metrics: {
        Row: {
          created_at: string | null
          id: string
          metric_type: string
          partnership_id: string
          period_end: string
          period_start: string
          updated_at: string | null
          value: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          metric_type: string
          partnership_id: string
          period_end: string
          period_start: string
          updated_at?: string | null
          value: number
        }
        Update: {
          created_at?: string | null
          id?: string
          metric_type?: string
          partnership_id?: string
          period_end?: string
          period_start?: string
          updated_at?: string | null
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "partnership_metrics_partnership_id_fkey"
            columns: ["partnership_id"]
            isOneToOne: false
            referencedRelation: "partnerships"
            referencedColumns: ["id"]
          },
        ]
      }
      partnerships: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          company_name: string
          company_size: string | null
          company_website: string | null
          contact_name: string
          created_at: string | null
          email: string
          id: string
          notes: string | null
          partnership_type: string
          phone: string
          status: string
          updated_at: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          company_name: string
          company_size?: string | null
          company_website?: string | null
          contact_name: string
          created_at?: string | null
          email: string
          id?: string
          notes?: string | null
          partnership_type: string
          phone: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          company_name?: string
          company_size?: string | null
          company_website?: string | null
          contact_name?: string
          created_at?: string | null
          email?: string
          id?: string
          notes?: string | null
          partnership_type?: string
          phone?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: []
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
      profiles: {
        Row: {
          address: string | null
          allergies_description: string | null
          avatar_url: string | null
          children_ages: string | null
          city: string | null
          created_at: string | null
          first_name: string | null
          had_pets_before: boolean | null
          has_allergies: boolean | null
          has_children: boolean | null
          housing_type: string | null
          id: string
          last_name: string | null
          phone: string | null
          state: string | null
          updated_at: string | null
          work_schedule: string | null
          zip: string | null
        }
        Insert: {
          address?: string | null
          allergies_description?: string | null
          avatar_url?: string | null
          children_ages?: string | null
          city?: string | null
          created_at?: string | null
          first_name?: string | null
          had_pets_before?: boolean | null
          has_allergies?: boolean | null
          has_children?: boolean | null
          housing_type?: string | null
          id: string
          last_name?: string | null
          phone?: string | null
          state?: string | null
          updated_at?: string | null
          work_schedule?: string | null
          zip?: string | null
        }
        Update: {
          address?: string | null
          allergies_description?: string | null
          avatar_url?: string | null
          children_ages?: string | null
          city?: string | null
          created_at?: string | null
          first_name?: string | null
          had_pets_before?: boolean | null
          has_allergies?: boolean | null
          has_children?: boolean | null
          housing_type?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          state?: string | null
          updated_at?: string | null
          work_schedule?: string | null
          zip?: string | null
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
      supplier_ratings: {
        Row: {
          comment: string | null
          created_at: string | null
          id: string
          rating: number
          supplier_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string | null
          id?: string
          rating: number
          supplier_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string | null
          id?: string
          rating?: number
          supplier_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "supplier_ratings_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      suppliers: {
        Row: {
          address: string | null
          contact_person: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          email: string
          id: string
          name: string
          notes: string | null
          phone: string
          type: string
          updated_at: string | null
          website: string | null
        }
        Insert: {
          address?: string | null
          contact_person?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          email: string
          id?: string
          name: string
          notes?: string | null
          phone: string
          type: string
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          address?: string | null
          contact_person?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          email?: string
          id?: string
          name?: string
          notes?: string | null
          phone?: string
          type?: string
          updated_at?: string | null
          website?: string | null
        }
        Relationships: []
      }
      system_parameters: {
        Row: {
          category: string
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          category: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          key: string
          updated_at?: string
          value: Json
        }
        Update: {
          category?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      user_metrics: {
        Row: {
          active_users: number
          completed_adoptions: number
          created_at: string | null
          date: string
          id: string
          new_users: number
          pending_adoptions: number
          rejected_adoptions: number
          total_users: number
          updated_at: string | null
        }
        Insert: {
          active_users: number
          completed_adoptions: number
          created_at?: string | null
          date: string
          id?: string
          new_users: number
          pending_adoptions: number
          rejected_adoptions: number
          total_users: number
          updated_at?: string | null
        }
        Update: {
          active_users?: number
          completed_adoptions?: number
          created_at?: string | null
          date?: string
          id?: string
          new_users?: number
          pending_adoptions?: number
          rejected_adoptions?: number
          total_users?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          permissions: Json | null
          role: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          permissions?: Json | null
          role: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          permissions?: Json | null
          role?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
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
      calculate_daily_user_metrics: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      is_admin: {
        Args: {
          uid: string
        }
        Returns: boolean
      }
      user_has_role: {
        Args: {
          user_id: string
          role_name: string
        }
        Returns: boolean
      }
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
