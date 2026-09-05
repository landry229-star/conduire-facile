export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
    // Allows to automatically instantiate createClient with right options
    // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
    __InternalSupabase: {
        PostgrestVersion: "14.5";
    };
    public: {
        Tables: {
            driving_hours: {
                Row: {
                    created_at: string;
                    duration_minutes: number;
                    id: string;
                    moniteur_id: string | null;
                    notes: string | null;
                    session_date: string;
                    skills: string[] | null;
                    user_id: string;
                };
                Insert: {
                    created_at?: string;
                    duration_minutes: number;
                    id?: string;
                    moniteur_id?: string | null;
                    notes?: string | null;
                    session_date: string;
                    skills?: string[] | null;
                    user_id: string;
                };
                Update: {
                    created_at?: string;
                    duration_minutes?: number;
                    id?: string;
                    moniteur_id?: string | null;
                    notes?: string | null;
                    session_date?: string;
                    skills?: string[] | null;
                    user_id?: string;
                };
                Relationships: [];
            };
            exam_attempts: {
                Row: {
                    category: string | null;
                    certificate_number: string | null;
                    created_at: string;
                    id: string;
                    passed: boolean;
                    score: number;
                    skills_breakdown: Json | null;
                    total: number;
                    user_id: string;
                };
                Insert: {
                    category?: string | null;
                    certificate_number?: string | null;
                    created_at?: string;
                    id?: string;
                    passed: boolean;
                    score: number;
                    skills_breakdown?: Json | null;
                    total: number;
                    user_id: string;
                };
                Update: {
                    category?: string | null;
                    certificate_number?: string | null;
                    created_at?: string;
                    id?: string;
                    passed?: boolean;
                    score?: number;
                    skills_breakdown?: Json | null;
                    total?: number;
                    user_id?: string;
                };
                Relationships: [];
            };
            exam_categories: {
                Row: {
                    active: boolean;
                    code: string;
                    created_at: string;
                    description: string | null;
                    id: string;
                    label: string;
                    updated_at: string;
                };
                Insert: {
                    active?: boolean;
                    code: string;
                    created_at?: string;
                    description?: string | null;
                    id?: string;
                    label: string;
                    updated_at?: string;
                };
                Update: {
                    active?: boolean;
                    code?: string;
                    created_at?: string;
                    description?: string | null;
                    id?: string;
                    label?: string;
                    updated_at?: string;
                };
                Relationships: [];
            };
            exam_question_categories: {
                Row: {
                    category_id: string;
                    question_id: string;
                };
                Insert: {
                    category_id: string;
                    question_id: string;
                };
                Update: {
                    category_id?: string;
                    question_id?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: "exam_question_categories_category_id_fkey";
                        columns: ["category_id"];
                        isOneToOne: false;
                        referencedRelation: "exam_categories";
                        referencedColumns: ["id"];
                    },
                    {
                        foreignKeyName: "exam_question_categories_question_id_fkey";
                        columns: ["question_id"];
                        isOneToOne: false;
                        referencedRelation: "exam_questions";
                        referencedColumns: ["id"];
                    },
                ];
            };
            exam_questions: {
                Row: {
                    active: boolean;
                    choices: Json;
                    correct_index: number;
                    created_at: string;
                    created_by: string | null;
                    difficulty: string;
                    explanation: string | null;
                    id: string;
                    prompt: string;
                    skill_id: string | null;
                    updated_at: string;
                };
                Insert: {
                    active?: boolean;
                    choices?: Json;
                    correct_index?: number;
                    created_at?: string;
                    created_by?: string | null;
                    difficulty?: string;
                    explanation?: string | null;
                    id?: string;
                    prompt: string;
                    skill_id?: string | null;
                    updated_at?: string;
                };
                Update: {
                    active?: boolean;
                    choices?: Json;
                    correct_index?: number;
                    created_at?: string;
                    created_by?: string | null;
                    difficulty?: string;
                    explanation?: string | null;
                    id?: string;
                    prompt?: string;
                    skill_id?: string | null;
                    updated_at?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: "exam_questions_skill_id_fkey";
                        columns: ["skill_id"];
                        isOneToOne: false;
                        referencedRelation: "exam_skills";
                        referencedColumns: ["id"];
                    },
                ];
            };
            exam_skills: {
                Row: {
                    category_id: string;
                    code: string;
                    created_at: string;
                    description: string | null;
                    id: string;
                    label: string;
                    position: number;
                    updated_at: string;
                };
                Insert: {
                    category_id: string;
                    code: string;
                    created_at?: string;
                    description?: string | null;
                    id?: string;
                    label: string;
                    position?: number;
                    updated_at?: string;
                };
                Update: {
                    category_id?: string;
                    code?: string;
                    created_at?: string;
                    description?: string | null;
                    id?: string;
                    label?: string;
                    position?: number;
                    updated_at?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: "exam_skills_category_id_fkey";
                        columns: ["category_id"];
                        isOneToOne: false;
                        referencedRelation: "exam_categories";
                        referencedColumns: ["id"];
                    },
                ];
            };
            payment_installments: {
                Row: {
                    amount_fcfa: number;
                    created_at: string;
                    id: string;
                    label: string;
                    method: string | null;
                    paid: boolean;
                    paid_at: string | null;
                    user_id: string;
                };
                Insert: {
                    amount_fcfa: number;
                    created_at?: string;
                    id?: string;
                    label: string;
                    method?: string | null;
                    paid?: boolean;
                    paid_at?: string | null;
                    user_id: string;
                };
                Update: {
                    amount_fcfa?: number;
                    created_at?: string;
                    id?: string;
                    label?: string;
                    method?: string | null;
                    paid?: boolean;
                    paid_at?: string | null;
                    user_id?: string;
                };
                Relationships: [];
            };
            profiles: {
                Row: {
                    account_status: string;
                    approved_at: string | null;
                    approval_notes: string | null;
                    avatar_url: string | null;
                    category: string | null;
                    created_at: string;
                    full_name: string | null;
                    id: string;
                    phone: string | null;
                    updated_at: string;
                };
                Insert: {
                    account_status?: string;
                    approved_at?: string | null;
                    approval_notes?: string | null;
                    avatar_url?: string | null;
                    category?: string | null;
                    created_at?: string;
                    full_name?: string | null;
                    id: string;
                    phone?: string | null;
                    updated_at?: string;
                };
                Update: {
                    account_status?: string;
                    approved_at?: string | null;
                    approval_notes?: string | null;
                    avatar_url?: string | null;
                    category?: string | null;
                    created_at?: string;
                    full_name?: string | null;
                    id?: string;
                    phone?: string | null;
                    updated_at?: string;
                };
                Relationships: [];
            };
            quiz_attempts: {
                Row: {
                    created_at: string;
                    id: string;
                    quiz_type: string;
                    score: number;
                    total: number;
                    user_id: string;
                };
                Insert: {
                    created_at?: string;
                    id?: string;
                    quiz_type: string;
                    score: number;
                    total: number;
                    user_id: string;
                };
                Update: {
                    created_at?: string;
                    id?: string;
                    quiz_type?: string;
                    score?: number;
                    total?: number;
                    user_id?: string;
                };
                Relationships: [];
            };
            theorie_progress: {
                Row: {
                    completed_at: string;
                    id: string;
                    lesson_id: string;
                    user_id: string;
                };
                Insert: {
                    completed_at?: string;
                    id?: string;
                    lesson_id: string;
                    user_id: string;
                };
                Update: {
                    completed_at?: string;
                    id?: string;
                    lesson_id?: string;
                    user_id?: string;
                };
                Relationships: [];
            };
            user_roles: {
                Row: {
                    id: string;
                    role: Database["public"]["Enums"]["app_role"];
                    user_id: string;
                };
                Insert: {
                    id?: string;
                    role: Database["public"]["Enums"]["app_role"];
                    user_id: string;
                };
                Update: {
                    id?: string;
                    role?: Database["public"]["Enums"]["app_role"];
                    user_id?: string;
                };
                Relationships: [];
            };
        };
        Views: {
            exam_questions_safe: {
                Row: {
                    active: boolean;
                    choices: Json;
                    created_at: string;
                    difficulty: string;
                    id: string;
                    prompt: string;
                    skill_id: string | null;
                    updated_at: string;
                };
            };
        };
        Functions: {
            has_role: {
                Args: {
                    _role: Database["public"]["Enums"]["app_role"];
                    _user_id: string;
                };
                Returns: boolean;
            };
            theory_completion_status: {
                Args: {
                    p_expected_lesson_count?: number;
                };
                Returns: {
                    complete: boolean;
                    completed_count: number;
                    required_count: number;
                }[];
            };
            submit_exam_attempt: {
                Args: {
                    p_answers: Json;
                    p_category: string;
                };
                Returns: {
                    attempt_id: string;
                    passed: boolean;
                    score: number;
                    total: number;
                }[];
            };
            submit_quiz_attempt: {
                Args: {
                    p_answers: Json;
                    p_quiz_type: string;
                };
                Returns: {
                    attempt_id: string;
                    score: number;
                    total: number;
                }[];
            };
            learning_gate_status: {
                Args: Record<PropertyKey, never>;
                Returns: {
                    theory_complete: boolean;
                    panels_mastered: boolean;
                    code_quiz_passed: boolean;
                    panel_quiz_passed: boolean;
                    exam_unlocked: boolean;
                    code_attempts: number;
                    panel_attempts: number;
                }[];
            };
        };
        Enums: {
            app_role: "admin" | "moniteur" | "eleve";
        };
        CompositeTypes: {
            [_ in never]: never;
        };
    };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
    DefaultSchemaTableNameOrOptions extends
        | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
        | { schema: keyof DatabaseWithoutInternals },
    TableName extends (DefaultSchemaTableNameOrOptions extends {
        schema: keyof DatabaseWithoutInternals;
    }
        ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
              DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
        : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
}
    ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
          DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
          Row: infer R;
      }
        ? R
        : never
    : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
            DefaultSchema["Views"])
      ? (DefaultSchema["Tables"] &
            DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
            Row: infer R;
        }
          ? R
          : never
      : never;

export type TablesInsert<
    DefaultSchemaTableNameOrOptions extends
        keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
    TableName extends (DefaultSchemaTableNameOrOptions extends {
        schema: keyof DatabaseWithoutInternals;
    }
        ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
        : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
}
    ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
          Insert: infer I;
      }
        ? I
        : never
    : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
      ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
            Insert: infer I;
        }
          ? I
          : never
      : never;

export type TablesUpdate<
    DefaultSchemaTableNameOrOptions extends
        keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
    TableName extends (DefaultSchemaTableNameOrOptions extends {
        schema: keyof DatabaseWithoutInternals;
    }
        ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
        : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
}
    ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
          Update: infer U;
      }
        ? U
        : never
    : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
      ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
            Update: infer U;
        }
          ? U
          : never
      : never;

export type Enums<
    DefaultSchemaEnumNameOrOptions extends
        keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
    EnumName extends (DefaultSchemaEnumNameOrOptions extends {
        schema: keyof DatabaseWithoutInternals;
    }
        ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
        : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
}
    ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
    : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
      ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
      : never;

export type CompositeTypes<
    PublicCompositeTypeNameOrOptions extends
        keyof DefaultSchema["CompositeTypes"] | { schema: keyof DatabaseWithoutInternals },
    CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
        schema: keyof DatabaseWithoutInternals;
    }
        ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
        : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
}
    ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
    : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
      ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
      : never;

export const Constants = {
    public: {
        Enums: {
            app_role: ["admin", "moniteur", "eleve"],
        },
    },
} as const;
