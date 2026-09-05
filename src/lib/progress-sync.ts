// Official attempts are persisted server-side only.
import { supabase } from "@/integrations/supabase/client";

export async function recordQuizAttempt(quiz_type: string, score: number, total: number) {
    const { data, error: userError } = await supabase.auth.getUser();
    if (userError || !data.user) throw userError ?? new Error("Session utilisateur introuvable");

    const { error } = await supabase.from("quiz_attempts").insert({
        user_id: data.user.id,
        quiz_type,
        score,
        total,
    });
    if (error) throw error;
}

export async function recordExamAttempt(
    category: string | null,
    score: number,
    total: number,
    passed: boolean,
    certificate_number: string | null,
    skills_breakdown?: Record<string, { correct: number; total: number }> | null,
) {
    const { data, error: userError } = await supabase.auth.getUser();
    if (userError || !data.user) throw userError ?? new Error("Session utilisateur introuvable");

    const { error } = await supabase.from("exam_attempts").insert({
        user_id: data.user.id,
        category,
        score,
        total,
        passed,
        certificate_number,
        skills_breakdown: skills_breakdown ?? null,
    });
    if (error) throw error;
}
