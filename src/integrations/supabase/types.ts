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
      consultas: {
        Row: {
          data_consulta: string | null
          data_hora: string
          especialidade: string | null
          hora_consulta: string | null
          id: string
          observacoes: string | null
          paciente_id: string | null
          patient_id: string | null
          profile_id: string | null
          status: string | null
          tipo_consulta: string | null
        }
        Insert: {
          data_consulta?: string | null
          data_hora: string
          especialidade?: string | null
          hora_consulta?: string | null
          id?: string
          observacoes?: string | null
          paciente_id?: string | null
          patient_id?: string | null
          profile_id?: string | null
          status?: string | null
          tipo_consulta?: string | null
        }
        Update: {
          data_consulta?: string | null
          data_hora?: string
          especialidade?: string | null
          hora_consulta?: string | null
          id?: string
          observacoes?: string | null
          paciente_id?: string | null
          patient_id?: string | null
          profile_id?: string | null
          status?: string | null
          tipo_consulta?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "consultas_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consultas_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consultas_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      fila_espera: {
        Row: {
          data_chamada: string | null
          data_entrada: string | null
          especialidade: string
          id: string
          motivo: string | null
          paciente_id: string | null
          prioridade: string | null
          status: string | null
        }
        Insert: {
          data_chamada?: string | null
          data_entrada?: string | null
          especialidade: string
          id?: string
          motivo?: string | null
          paciente_id?: string | null
          prioridade?: string | null
          status?: string | null
        }
        Update: {
          data_chamada?: string | null
          data_entrada?: string | null
          especialidade?: string
          id?: string
          motivo?: string | null
          paciente_id?: string | null
          prioridade?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fila_espera_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      pacientes: {
        Row: {
          criado_em: string | null
          email: string | null
          id: string
          nome: string
          profile_id: string | null
          telefone: string | null
        }
        Insert: {
          criado_em?: string | null
          email?: string | null
          id?: string
          nome: string
          profile_id?: string | null
          telefone?: string | null
        }
        Update: {
          criado_em?: string | null
          email?: string | null
          id?: string
          nome?: string
          profile_id?: string | null
          telefone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pacientes_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      patients: {
        Row: {
          data_nascimento: string | null
          email: string | null
          id: string
          nome: string
          profile_id: string | null
          telefone: string | null
        }
        Insert: {
          data_nascimento?: string | null
          email?: string | null
          id?: string
          nome: string
          profile_id?: string | null
          telefone?: string | null
        }
        Update: {
          data_nascimento?: string | null
          email?: string | null
          id?: string
          nome?: string
          profile_id?: string | null
          telefone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "patients_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          atualizado_em: string | null
          data_criacao: string | null
          data_nascimento: string | null
          email: string | null
          foto_url: string | null
          id: string
          nome: string | null
          telefone: string | null
        }
        Insert: {
          atualizado_em?: string | null
          data_criacao?: string | null
          data_nascimento?: string | null
          email?: string | null
          foto_url?: string | null
          id: string
          nome?: string | null
          telefone?: string | null
        }
        Update: {
          atualizado_em?: string | null
          data_criacao?: string | null
          data_nascimento?: string | null
          email?: string | null
          foto_url?: string | null
          id?: string
          nome?: string | null
          telefone?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      order_items: {
        Row: {
          created_at: string | null
          id: string | null
          order_id: string | null
          price: number | null
          product_id: string | null
          quantity: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string | null
          order_id?: string | null
          price?: number | null
          product_id?: string | null
          quantity?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string | null
          order_id?: string | null
          price?: number | null
          product_id?: string | null
          quantity?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      painel_consultas_completo: {
        Row: {
          consulta_id: string | null
          data_consulta: string | null
          email_paciente: string | null
          hora_consulta: string | null
          nome_paciente: string | null
          telefone_paciente: string | null
          tipo_consulta: string | null
        }
        Relationships: []
      }
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
