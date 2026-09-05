-- Remove legacy email-based privilege escalation.
DROP TRIGGER IF EXISTS on_auth_user_created_grant_owner ON auth.users;
DROP FUNCTION IF EXISTS public.grant_admin_for_owner_email();

-- Staff can review learner profiles; only admins can approve accounts.
DROP POLICY IF EXISTS "Admin lit tous les profils" ON public.profiles;
CREATE POLICY "Staff lit tous les profils"
  ON public.profiles FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'moniteur')
  );

-- Enforce valid values at the database boundary too.
ALTER TABLE public.driving_hours
  ADD CONSTRAINT driving_hours_duration_valid
  CHECK (duration_minutes > 0 AND duration_minutes <= 480);

ALTER TABLE public.payment_installments
  ADD CONSTRAINT payment_installments_amount_valid
  CHECK (amount_fcfa > 0);

-- Learners must not write official attempts directly.
DROP POLICY IF EXISTS "Quiz propriétaire" ON public.quiz_attempts;
CREATE POLICY "Quiz propriétaire en lecture"
  ON public.quiz_attempts FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "Quiz propriétaire crée une tentative"
  ON public.quiz_attempts FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND score >= 0
    AND total > 0
    AND score <= total
  );

DROP POLICY IF EXISTS "Examen propriétaire" ON public.exam_attempts;
CREATE POLICY "Examen propriétaire en lecture"
  ON public.exam_attempts FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
