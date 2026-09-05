-- Quiz correction is still client-side until the server question bank is seeded.
-- Prevent client-computed scores from becoming official records in the meantime.
REVOKE INSERT, UPDATE, DELETE ON public.quiz_attempts FROM authenticated;
DROP POLICY IF EXISTS "Quiz propriétaire" ON public.quiz_attempts;
DROP POLICY IF EXISTS "Quiz propriétaire crée une tentative" ON public.quiz_attempts;
