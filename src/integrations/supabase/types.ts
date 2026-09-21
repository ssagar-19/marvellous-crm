export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      companies: {
        Row: {
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      company_invite_codes: {
        Row: {
          code_hash: string
          code_prefix: string
          company_id: string
          created_at: string
          created_by: string
          expires_at: string | null
          id: string
          max_uses: number
          revoked_at: string | null
          role: Database["public"]["Enums"]["company_role"]
          updated_at: string
          used_count: number
        }
        Insert: {
          code_hash: string
          code_prefix: string
          company_id: string
          created_at?: string
          created_by: string
          expires_at?: string | null
          id?: string
          max_uses?: number
          revoked_at?: string | null
          role?: Database["public"]["Enums"]["company_role"]
          updated_at?: string
          used_count?: number
        }
        Update: {
          code_hash?: string
          code_prefix?: string
          company_id?: string
          created_at?: string
          created_by?: string
          expires_at?: string | null
          id?: string
          max_uses?: number
          revoked_at?: string | null
          role?: Database["public"]["Enums"]["company_role"]
          updated_at?: string
          used_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "company_invite_codes_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      company_members: {
        Row: {
          company_id: string
          created_at: string
          id: string
          role: Database["public"]["Enums"]["company_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          company_id: string
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["company_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          company_id?: string
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["company_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_members_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      company_settings: {
        Row: {
          address: string | null
          company_id: string | null
          company_name: string
          created_at: string
          email: string | null
          id: string
          invoice_prefix: string
          logo_url: string | null
          next_invoice_number: number
          phone: string | null
          updated_at: string
          vat_number: string | null
          vat_rate: number
          website: string | null
        }
        Insert: {
          address?: string | null
          company_id?: string | null
          company_name: string
          created_at?: string
          email?: string | null
          id?: string
          invoice_prefix?: string
          logo_url?: string | null
          next_invoice_number?: number
          phone?: string | null
          updated_at?: string
          vat_number?: string | null
          vat_rate?: number
          website?: string | null
        }
        Update: {
          address?: string | null
          company_id?: string | null
          company_name?: string
          created_at?: string
          email?: string | null
          id?: string
          invoice_prefix?: string
          logo_url?: string | null
          next_invoice_number?: number
          phone?: string | null
          updated_at?: string
          vat_number?: string | null
          vat_rate?: number
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "company_settings_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      jobs: {
        Row: {
          address: string | null
          company_id: string | null
          created_at: string
          created_by: string | null
          customer_name: string | null
          engineer: string | null
          findings: string | null
          id: string
          invoice_number: string | null
          issue: string | null
          job_date: string | null
          job_number: string | null
          labour_cost: number
          materials_cost: number
          missing_info: string[]
          other_cost: number
          other_cost_description: string | null
          recommendations: string | null
          report: string | null
          status: string
          subtotal: number
          total: number
          transcript: string | null
          updated_at: string
          vat: number
          work_carried_out: string | null
        }
        Insert: {
          address?: string | null
          company_id?: string | null
          created_at?: string
          created_by?: string | null
          customer_name?: string | null
          engineer?: string | null
          findings?: string | null
          id?: string
          invoice_number?: string | null
          issue?: string | null
          job_date?: string | null
          job_number?: string | null
          labour_cost?: number
          materials_cost?: number
          missing_info?: string[]
          other_cost?: number
          other_cost_description?: string | null
          recommendations?: string | null
          report?: string | null
          status?: string
          subtotal?: number
          total?: number
          transcript?: string | null
          updated_at?: string
          vat?: number
          work_carried_out?: string | null
        }
        Update: {
          address?: string | null
          company_id?: string | null
          created_at?: string
          created_by?: string | null
          customer_name?: string | null
          engineer?: string | null
          findings?: string | null
          id?: string
          invoice_number?: string | null
          issue?: string | null
          job_date?: string | null
          job_number?: string | null
          labour_cost?: number
          materials_cost?: number
          missing_info?: string[]
          other_cost?: number
          other_cost_description?: string | null
          recommendations?: string | null
          report?: string | null
          status?: string
          subtotal?: number
          total?: number
          transcript?: string | null
          updated_at?: string
          vat?: number
          work_carried_out?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "jobs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      marvellous_business_settings: {
        Row: {
          address_line_1: string
          address_line_2: string | null
          business_name: string
          city: string
          created_at: string
          email: string
          id: number
          logo_url: string | null
          phone: string
          postcode: string
          updated_at: string
          vat_number: string | null
          website: string | null
        }
        Insert: {
          address_line_1?: string
          address_line_2?: string | null
          business_name?: string
          city?: string
          created_at?: string
          email?: string
          id?: number
          logo_url?: string | null
          phone?: string
          postcode?: string
          updated_at?: string
          vat_number?: string | null
          website?: string | null
        }
        Update: {
          address_line_1?: string
          address_line_2?: string | null
          business_name?: string
          city?: string
          created_at?: string
          email?: string
          id?: number
          logo_url?: string | null
          phone?: string
          postcode?: string
          updated_at?: string
          vat_number?: string | null
          website?: string | null
        }
        Relationships: []
      }
      marvellous_clients: {
        Row: {
          created_at: string
          email: string | null
          full_name: string
          id: string
          notes: string | null
          phone: string
          phone_digits: string | null
          postcode: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name: string
          id?: string
          notes?: string | null
          phone: string
          phone_digits?: string | null
          postcode?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          notes?: string | null
          phone?: string
          phone_digits?: string | null
          postcode?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      marvellous_invite_codes: {
        Row: {
          code: string
          created_at: string
          created_by: string | null
          expires_at: string | null
          id: string
          revoked_at: string | null
          role: Database["public"]["Enums"]["marvellous_app_role"]
          used_at: string | null
          used_by: string | null
        }
        Insert: {
          code: string
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          id?: string
          revoked_at?: string | null
          role: Database["public"]["Enums"]["marvellous_app_role"]
          used_at?: string | null
          used_by?: string | null
        }
        Update: {
          code?: string
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          id?: string
          revoked_at?: string | null
          role?: Database["public"]["Enums"]["marvellous_app_role"]
          used_at?: string | null
          used_by?: string | null
        }
        Relationships: []
      }
      marvellous_job_activity: {
        Row: {
          activity_type: string
          created_at: string
          description: string
          id: string
          job_id: string
          staff_name: string | null
        }
        Insert: {
          activity_type: string
          created_at?: string
          description: string
          id?: string
          job_id: string
          staff_name?: string | null
        }
        Update: {
          activity_type?: string
          created_at?: string
          description?: string
          id?: string
          job_id?: string
          staff_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "marvellous_job_activity_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "marvellous_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      marvellous_job_items: {
        Row: {
          created_at: string
          id: string
          item_description: string
          item_type: string
          job_id: string
          metal: string | null
          position: number
          service: string
          stone: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          item_description?: string
          item_type: string
          job_id: string
          metal?: string | null
          position?: number
          service: string
          stone?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          item_description?: string
          item_type?: string
          job_id?: string
          metal?: string | null
          position?: number
          service?: string
          stone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "marvellous_job_items_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "marvellous_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      marvellous_job_photos: {
        Row: {
          caption: string | null
          created_at: string
          id: string
          job_id: string
          public_url: string | null
          storage_path: string
        }
        Insert: {
          caption?: string | null
          created_at?: string
          id?: string
          job_id: string
          public_url?: string | null
          storage_path: string
        }
        Update: {
          caption?: string | null
          created_at?: string
          id?: string
          job_id?: string
          public_url?: string | null
          storage_path?: string
        }
        Relationships: [
          {
            foreignKeyName: "marvellous_job_photos_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "marvellous_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      marvellous_jobs: {
        Row: {
          accepted_by: string | null
          client_id: string
          completed_at: string | null
          created_at: string
          customer_notes: string | null
          deposit_amount: number | null
          id: string
          is_draft: boolean
          item_description: string
          item_type: string
          job_reference: string
          location: Database["public"]["Enums"]["marvellous_job_location"]
          metal: string | null
          priority: Database["public"]["Enums"]["marvellous_job_priority"]
          promised_completion_date: string | null
          quoted_price: number | null
          service: string
          status: Database["public"]["Enums"]["marvellous_job_status"]
          stone: string | null
          updated_at: string
        }
        Insert: {
          accepted_by?: string | null
          client_id: string
          completed_at?: string | null
          created_at?: string
          customer_notes?: string | null
          deposit_amount?: number | null
          id?: string
          is_draft?: boolean
          item_description: string
          item_type: string
          job_reference?: string
          location?: Database["public"]["Enums"]["marvellous_job_location"]
          metal?: string | null
          priority?: Database["public"]["Enums"]["marvellous_job_priority"]
          promised_completion_date?: string | null
          quoted_price?: number | null
          service: string
          status?: Database["public"]["Enums"]["marvellous_job_status"]
          stone?: string | null
          updated_at?: string
        }
        Update: {
          accepted_by?: string | null
          client_id?: string
          completed_at?: string | null
          created_at?: string
          customer_notes?: string | null
          deposit_amount?: number | null
          id?: string
          is_draft?: boolean
          item_description?: string
          item_type?: string
          job_reference?: string
          location?: Database["public"]["Enums"]["marvellous_job_location"]
          metal?: string | null
          priority?: Database["public"]["Enums"]["marvellous_job_priority"]
          promised_completion_date?: string | null
          quoted_price?: number | null
          service?: string
          status?: Database["public"]["Enums"]["marvellous_job_status"]
          stone?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "marvellous_jobs_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "marvellous_clients"
            referencedColumns: ["id"]
          },
        ]
      }
      marvellous_staff_profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name: string
          id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      marvellous_user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["marvellous_app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["marvellous_app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["marvellous_app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_own_company: { Args: { _name?: string }; Returns: string }
      has_company_role: {
        Args: {
          _company_id: string
          _role: Database["public"]["Enums"]["company_role"]
        }
        Returns: boolean
      }
      is_company_asset_path: { Args: { _name: string }; Returns: boolean }
      is_company_member: { Args: { _company_id: string }; Returns: boolean }
      redeem_company_invite_code: {
        Args: { _code: string }
        Returns: undefined
      }
    }
    Enums: {
      company_role: "owner_admin" | "engineer"
      marvellous_app_role: "admin" | "staff"
      marvellous_job_location: "FRONT_DESK" | "WORKSHOP"
      marvellous_job_priority: "NORMAL" | "HIGH" | "URGENT"
      marvellous_job_status:
        | "NEW"
        | "TO_QUOTE"
        | "AWAITING_WORKSHOP"
        | "RECEIVED"
        | "INSPECTION"
        | "AWAITING_APPROVAL"
        | "IN_PROGRESS"
        | "WAITING_FOR_PARTS"
        | "AWAITING_QC"
        | "RETURNED_TO_WORKSHOP"
        | "READY_FOR_COLLECTION"
        | "COLLECTED"
        | "COMPLETED"
        | "CUSTOMER_DECLINED"
        | "CANCELLED"
        | "ON_HOLD"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      company_role: ["owner_admin", "engineer"],
      marvellous_app_role: ["admin", "staff"],
      marvellous_job_location: ["FRONT_DESK", "WORKSHOP"],
      marvellous_job_priority: ["NORMAL", "HIGH", "URGENT"],
      marvellous_job_status: [
        "NEW",
        "TO_QUOTE",
        "AWAITING_WORKSHOP",
        "RECEIVED",
        "INSPECTION",
        "AWAITING_APPROVAL",
        "IN_PROGRESS",
        "WAITING_FOR_PARTS",
        "AWAITING_QC",
        "RETURNED_TO_WORKSHOP",
        "READY_FOR_COLLECTION",
        "COLLECTED",
        "COMPLETED",
        "CUSTOMER_DECLINED",
        "CANCELLED",
        "ON_HOLD",
      ],
    },
  },
} as const
