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
      categories: {
        Row: {
          id: string
          name: string
          type: string
          user_id: string | null
        }
        Insert: {
          id?: string
          name: string
          type: string
          user_id?: string | null
        }
        Update: {
          id?: string
          name?: string
          type?: string
          user_id?: string | null
        }
        Relationships: []
      }
      financial_goals: {
        Row: {
          category: string | null
          completed: boolean
          created_at: string
          current_amount: number
          end_date: string | null
          id: string
          start_date: string
          target_amount: number
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string | null
          completed?: boolean
          created_at?: string
          current_amount?: number
          end_date?: string | null
          id?: string
          start_date?: string
          target_amount: number
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string | null
          completed?: boolean
          created_at?: string
          current_amount?: number
          end_date?: string | null
          id?: string
          start_date?: string
          target_amount?: number
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      plan_limits: {
        Row: {
          limit_reached: boolean
          month: number
          transactions: number
          user_id: string
          year: number
        }
        Insert: {
          limit_reached?: boolean
          month: number
          transactions?: number
          user_id: string
          year: number
        }
        Update: {
          limit_reached?: boolean
          month?: number
          transactions?: number
          user_id?: string
          year?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          contagem_de_transações: number | null
          created_at: string | null
          email: string | null
          id: string
          name: string | null
          plan: string | null
          transaction_count: number | null
          updated_at: string | null
        }
        Insert: {
          contagem_de_transações?: number | null
          created_at?: string | null
          email?: string | null
          id: string
          name?: string | null
          plan?: string | null
          transaction_count?: number | null
          updated_at?: string | null
        }
        Update: {
          contagem_de_transações?: number | null
          created_at?: string | null
          email?: string | null
          id?: string
          name?: string | null
          plan?: string | null
          transaction_count?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      recurring_transactions: {
        Row: {
          active: boolean
          category: string
          created_at: string
          description: string | null
          end_date: string | null
          frequency: string
          id: string
          next_date: string
          start_date: string
          type: string
          updated_at: string
          user_id: string
          value: number
        }
        Insert: {
          active?: boolean
          category: string
          created_at?: string
          description?: string | null
          end_date?: string | null
          frequency: string
          id?: string
          next_date: string
          start_date: string
          type: string
          updated_at?: string
          user_id: string
          value: number
        }
        Update: {
          active?: boolean
          category?: string
          created_at?: string
          description?: string | null
          end_date?: string | null
          frequency?: string
          id?: string
          next_date?: string
          start_date?: string
          type?: string
          updated_at?: string
          user_id?: string
          value?: number
        }
        Relationships: []
      }
      tasks: {
        Row: {
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          priority: string | null
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string | null
          status?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string | null
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          category: string
          created_at: string
          date: string
          description: string | null
          id: string
          type: string
          user_id: string
          value: number
        }
        Insert: {
          category: string
          created_at?: string
          date: string
          description?: string | null
          id?: string
          type: string
          user_id: string
          value: number
        }
        Update: {
          category?: string
          created_at?: string
          date?: string
          description?: string | null
          id?: string
          type?: string
          user_id?: string
          value?: number
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
    Enums: {},
  },
} as const
