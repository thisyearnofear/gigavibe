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
      achievements: {
        Row: {
          criteria: Json
          description: string
          icon: string
          id: string
          name: string
        }
        Insert: {
          criteria: Json
          description: string
          icon: string
          id?: string
          name: string
        }
        Update: {
          criteria?: Json
          description?: string
          icon?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      ai_model_configs: {
        Row: {
          cost_per_1k_tokens: number | null
          id: string
          is_enabled: boolean | null
          max_tokens: number | null
          model: Database["public"]["Enums"]["ai_model_type"]
          rate_limit_per_minute: number | null
          temperature: number | null
          updated_at: string | null
        }
        Insert: {
          cost_per_1k_tokens?: number | null
          id?: string
          is_enabled?: boolean | null
          max_tokens?: number | null
          model: Database["public"]["Enums"]["ai_model_type"]
          rate_limit_per_minute?: number | null
          temperature?: number | null
          updated_at?: string | null
        }
        Update: {
          cost_per_1k_tokens?: number | null
          id?: string
          is_enabled?: boolean | null
          max_tokens?: number | null
          model?: Database["public"]["Enums"]["ai_model_type"]
          rate_limit_per_minute?: number | null
          temperature?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      ai_usage: {
        Row: {
          completion_tokens: number | null
          error_message: string | null
          estimated_cost: number | null
          id: string
          model: Database["public"]["Enums"]["ai_model_type"]
          prompt_tokens: number | null
          request_time: string | null
          response_time_ms: number | null
          status: string | null
          total_tokens: number | null
          user_id: string | null
        }
        Insert: {
          completion_tokens?: number | null
          error_message?: string | null
          estimated_cost?: number | null
          id?: string
          model: Database["public"]["Enums"]["ai_model_type"]
          prompt_tokens?: number | null
          request_time?: string | null
          response_time_ms?: number | null
          status?: string | null
          total_tokens?: number | null
          user_id?: string | null
        }
        Update: {
          completion_tokens?: number | null
          error_message?: string | null
          estimated_cost?: number | null
          id?: string
          model?: Database["public"]["Enums"]["ai_model_type"]
          prompt_tokens?: number | null
          request_time?: string | null
          response_time_ms?: number | null
          status?: string | null
          total_tokens?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      exercises: {
        Row: {
          created_at: string
          created_by_ai: boolean | null
          description: string | null
          difficulty: Database["public"]["Enums"]["exercise_difficulty"]
          id: string
          name: string
          notes: Json
          type: Database["public"]["Enums"]["exercise_type"]
        }
        Insert: {
          created_at?: string
          created_by_ai?: boolean | null
          description?: string | null
          difficulty: Database["public"]["Enums"]["exercise_difficulty"]
          id?: string
          name: string
          notes: Json
          type: Database["public"]["Enums"]["exercise_type"]
        }
        Update: {
          created_at?: string
          created_by_ai?: boolean | null
          description?: string | null
          difficulty?: Database["public"]["Enums"]["exercise_difficulty"]
          id?: string
          name?: string
          notes?: Json
          type?: Database["public"]["Enums"]["exercise_type"]
        }
        Relationships: []
      }
      user_achievements: {
        Row: {
          achievement_id: string
          id: string
          unlocked_at: string
          user_id: string
        }
        Insert: {
          achievement_id: string
          id?: string
          unlocked_at?: string
          user_id: string
        }
        Update: {
          achievement_id?: string
          id?: string
          unlocked_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievements"
            referencedColumns: ["id"]
          },
        ]
      }
      user_exercise_sessions: {
        Row: {
          completed_at: string
          exercise_id: string
          id: string
          performance_data: Json | null
          score: number
          user_id: string
        }
        Insert: {
          completed_at?: string
          exercise_id: string
          id?: string
          performance_data?: Json | null
          score: number
          user_id: string
        }
        Update: {
          completed_at?: string
          exercise_id?: string
          id?: string
          performance_data?: Json | null
          score?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_exercise_sessions_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      ai_model_type: "openai" | "anthropic" | "gemini"
      exercise_difficulty: "beginner" | "intermediate" | "advanced"
      exercise_type: "scale" | "arpeggio" | "interval" | "vibrato"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      ai_model_type: ["openai", "anthropic", "gemini"],
      exercise_difficulty: ["beginner", "intermediate", "advanced"],
      exercise_type: ["scale", "arpeggio", "interval", "vibrato"],
    },
  },
} as const
