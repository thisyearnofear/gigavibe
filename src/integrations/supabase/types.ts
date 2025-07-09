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
          id: string
          title: string
          description: string
          icon: string | null
          criteria: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          icon?: string | null
          criteria?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          icon?: string | null
          criteria?: Json | null
          created_at?: string
        }
        Relationships: []
      }
      exercises: {
        Row: {
          id: string
          title: string
          description: string | null
          category: string | null
          difficulty: number | null
          notes: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          category?: string | null
          difficulty?: number | null
          notes?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          category?: string | null
          difficulty?: number | null
          notes?: Json | null
          created_at?: string
        }
        Relationships: []
      }
      user_achievements: {
        Row: {
          id: string
          user_id: string
          achievement_id: string
          unlocked_at: string
        }
        Insert: {
          id?: string
          user_id: string
          achievement_id: string
          unlocked_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          achievement_id?: string
          unlocked_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_achievements_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievements"
            referencedColumns: ["id"]
          }
        ]
      }
      user_exercise_sessions: {
        Row: {
          id: string
          user_id: string
          exercise_id: string
          score: number | null
          duration: number | null
          notes: string | null
          completed_at: string
        }
        Insert: {
          id?: string
          user_id: string
          exercise_id: string
          score?: number | null
          duration?: number | null
          notes?: string | null
          completed_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          exercise_id?: string
          score?: number | null
          duration?: number | null
          notes?: string | null
          completed_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_exercise_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_exercise_sessions_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          }
        ]
      }
      users: {
        Row: {
          id: string
          wallet_address: string
          farcaster_fid: number | null
          display_name: string | null
          pfp_url: string | null
          bio: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          wallet_address: string
          farcaster_fid?: number | null
          display_name?: string | null
          pfp_url?: string | null
          bio?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          wallet_address?: string
          farcaster_fid?: number | null
          display_name?: string | null
          pfp_url?: string | null
          bio?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      performances: {
        Row: {
          id: string
          farcaster_cast_id: string
          user_id: string | null
          title: string | null
          content: string | null
          audio_url: string | null
          audio_duration: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          farcaster_cast_id: string
          user_id?: string | null
          title?: string | null
          content?: string | null
          audio_url?: string | null
          audio_duration?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          farcaster_cast_id?: string
          user_id?: string | null
          title?: string | null
          content?: string | null
          audio_url?: string | null
          audio_duration?: number | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "performances_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      performance_metrics: {
        Row: {
          id: string
          performance_id: string
          likes_count: number | null
          replies_count: number | null
          recasts_count: number | null
          views_count: number | null
          shares_count: number | null
          last_updated: string
        }
        Insert: {
          id?: string
          performance_id: string
          likes_count?: number | null
          replies_count?: number | null
          recasts_count?: number | null
          views_count?: number | null
          shares_count?: number | null
          last_updated?: string
        }
        Update: {
          id?: string
          performance_id?: string
          likes_count?: number | null
          replies_count?: number | null
          recasts_count?: number | null
          views_count?: number | null
          shares_count?: number | null
          last_updated?: string
        }
        Relationships: [
          {
            foreignKeyName: "performance_metrics_performance_id_fkey"
            columns: ["performance_id"]
            isOneToOne: false
            referencedRelation: "performances"
            referencedColumns: ["id"]
          }
        ]
      }
      performance_coins: {
        Row: {
          id: string
          performance_id: string
          coin_address: string
          total_supply: number | null
          initial_price: number | null
          current_price: number | null
          creator_allocation: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          performance_id: string
          coin_address: string
          total_supply?: number | null
          initial_price?: number | null
          current_price?: number | null
          creator_allocation?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          performance_id?: string
          coin_address?: string
          total_supply?: number | null
          initial_price?: number | null
          current_price?: number | null
          creator_allocation?: number | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "performance_coins_performance_id_fkey"
            columns: ["performance_id"]
            isOneToOne: false
            referencedRelation: "performances"
            referencedColumns: ["id"]
          }
        ]
      }
      viral_queue: {
        Row: {
          id: string
          performance_id: string
          detection_score: number
          status: string
          detected_at: string
          processed_at: string | null
          result_message: string | null
        }
        Insert: {
          id?: string
          performance_id: string
          detection_score: number
          status: string
          detected_at?: string
          processed_at?: string | null
          result_message?: string | null
        }
        Update: {
          id?: string
          performance_id?: string
          detection_score?: number
          status?: string
          detected_at?: string
          processed_at?: string | null
          result_message?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "viral_queue_performance_id_fkey"
            columns: ["performance_id"]
            isOneToOne: false
            referencedRelation: "performances"
            referencedColumns: ["id"]
          }
        ]
      }
      viral_thresholds: {
        Row: {
          id: string
          threshold_name: string
          threshold_value: number
          description: string | null
          updated_at: string
        }
        Insert: {
          id?: string
          threshold_name: string
          threshold_value: number
          description?: string | null
          updated_at?: string
        }
        Update: {
          id?: string
          threshold_name?: string
          threshold_value?: number
          description?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      analytics_events: {
        Row: {
          id: string
          event_type: string
          user_id: string | null
          performance_id: string | null
          event_data: Json | null
          client_timestamp: string | null
          server_timestamp: string
        }
        Insert: {
          id?: string
          event_type: string
          user_id?: string | null
          performance_id?: string | null
          event_data?: Json | null
          client_timestamp?: string | null
          server_timestamp?: string
        }
        Update: {
          id?: string
          event_type?: string
          user_id?: string | null
          performance_id?: string | null
          event_data?: Json | null
          client_timestamp?: string | null
          server_timestamp?: string
        }
        Relationships: [
          {
            foreignKeyName: "analytics_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analytics_events_performance_id_fkey"
            columns: ["performance_id"]
            isOneToOne: false
            referencedRelation: "performances"
            referencedColumns: ["id"]
          }
        ]
      }
      notification_preferences: {
        Row: {
          id: string
          user_id: string
          viral_notifications: boolean | null
          coin_price_notifications: boolean | null
          engagement_notifications: boolean | null
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          viral_notifications?: boolean | null
          coin_price_notifications?: boolean | null
          engagement_notifications?: boolean | null
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          viral_notifications?: boolean | null
          coin_price_notifications?: boolean | null
          engagement_notifications?: boolean | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          notification_type: string
          content: string
          read: boolean | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          notification_type: string
          content: string
          read?: boolean | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          notification_type?: string
          content?: string
          read?: boolean | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
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
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  TableName extends keyof DefaultSchema["Tables"] = keyof DefaultSchema["Tables"]
> = DefaultSchema["Tables"][TableName]["Row"]

export type TablesInsert<
  TableName extends keyof DefaultSchema["Tables"] = keyof DefaultSchema["Tables"]
> = DefaultSchema["Tables"][TableName]["Insert"]

export type TablesUpdate<
  TableName extends keyof DefaultSchema["Tables"] = keyof DefaultSchema["Tables"]
> = DefaultSchema["Tables"][TableName]["Update"]
