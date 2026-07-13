// Fire-and-forget helpers to sync progress to Lovable Cloud when signed in.
import { supabase } from "@/integrations/supabase/client";

export async function recordQuizAttempt(quiz_type: string, score: number, total: number) {
  const { data } = await supabase.auth.getUser();
  if (!data.user) return;
  await supabase.from("quiz_attempts").insert({ user_id: data.user.id, quiz_type, score, total });
}

export async function recordExamAttempt(
  category: string | null,
  score: number,
  total: number,
  passed: boolean,
  certificate_number: string | null,
  skills_breakdown?: Record<string, { correct: number; total: number }> | null,
) {
  const { data } = await supabase.auth.getUser();
  if (!data.user) return;
  await supabase.from("exam_attempts").insert({
    user_id: data.user.id,
    category,
    score,
    total,
    passed,
    certificate_number,
    skills_breakdown: skills_breakdown ?? null,
  });
}
