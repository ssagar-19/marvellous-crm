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
      clients: {
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
      invite_codes: {
        Row: {
          code: string
          created_at: string
          created_by: string | null
          expires_at: string | null
          id: string
          revoked_at: string | null
          role: Database["public"]["Enums"]["app_role"]
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
          role: Database["public"]["Enums"]["app_role"]
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
          role?: Database["public"]["Enums"]["app_role"]
          used_at?: string | null
          used_by?: string | null
        }
        Relationships: []
      }
      job_activity: {
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
            foreignKeyName: "job_activity_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      job_items: {
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
            foreignKeyName: "job_items_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      job_photos: {
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
            foreignKeyName: "job_photos_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      jobs: {
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
          location: Database["public"]["Enums"]["job_location"]
          metal: string | null
          priority: Database["public"]["Enums"]["job_priority"]
          promised_completion_date: string | null
          quoted_price: number | null
          service: string
          status: Database["public"]["Enums"]["job_status"]
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
          location?: Database["public"]["Enums"]["job_location"]
          metal?: string | null
          priority?: Database["public"]["Enums"]["job_priority"]
          promised_completion_date?: string | null
          quoted_price?: number | null
          service: string
          status?: Database["public"]["Enums"]["job_status"]
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
          location?: Database["public"]["Enums"]["job_location"]
          metal?: string | null
          priority?: Database["public"]["Enums"]["job_priority"]
          promised_completion_date?: string | null
          quoted_price?: number | null
          service?: string
          status?: Database["public"]["Enums"]["job_status"]
          stone?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "jobs_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_profiles: {
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
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
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
      app_role: "admin" | "management" | "workshop_staff"
      job_location:
        | "FRONT_DESK"
        | "WORKSHOP"
        | "BENCH_1"
        | "BENCH_2"
        | "BENCH_3"
        | "QC"
      job_priority: "LOW" | "NORMAL" | "HIGH" | "URGENT"
      job_status:
        | "NEW"
        | "AWAITING_WORKSHOP"
        | "RECEIVED"
        | "INSPECTION"
        | "AWAITING_APPROVAL"
        | "IN_PROGRESS"
        | "AWAITING_QC"
        | "READY_FOR_COLLECTION"
        | "COLLECTED"
        | "COMPLETED"
        | "WAITING_FOR_PARTS"
        | "CUSTOMER_DECLINED"
        | "CANCELLED"
        | "RETURNED_TO_WORKSHOP"
        | "ON_HOLD"
        | "TO_QUOTE"
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
      app_role: ["admin", "management", "workshop_staff"],
      job_location: [
        "FRONT_DESK",
        "WORKSHOP",
        "BENCH_1",
        "BENCH_2",
        "BENCH_3",
        "QC",
      ],
      job_priority: ["LOW", "NORMAL", "HIGH", "URGENT"],
      job_status: [
        "NEW",
        "AWAITING_WORKSHOP",
        "RECEIVED",
        "INSPECTION",
        "AWAITING_APPROVAL",
        "IN_PROGRESS",
        "AWAITING_QC",
        "READY_FOR_COLLECTION",
        "COLLECTED",
        "COMPLETED",
        "WAITING_FOR_PARTS",
        "CUSTOMER_DECLINED",
        "CANCELLED",
        "RETURNED_TO_WORKSHOP",
        "ON_HOLD",
        "TO_QUOTE",
      ],
    },
  },
} as const
