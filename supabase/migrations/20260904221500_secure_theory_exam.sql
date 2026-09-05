-- Keep answer keys server-side and make exam eligibility authoritative.

CREATE TABLE IF NOT EXISTS public.course_lessons (
  lesson_id text PRIMARY KEY,
  active boolean NOT NULL DEFAULT true
);

INSERT INTO public.course_lessons (lesson_id)
VALUES
  ('m1l1'), ('m1l2'), ('m1l3'), ('m1l4'), ('m1l5'),
  ('m2l1'), ('m2l2'), ('m2l3'), ('m2l4'), ('m2l5'), ('m2l6'),
  ('m3l1'), ('m3l2'), ('m3l3'), ('m3l4'), ('m3l5'), ('m3l6'), ('m3l7'), ('m3l8'),
  ('m4l1'), ('m4l2'), ('m4l3'), ('m4l4'),
  ('m5l1'), ('m5l2'), ('m5l3'), ('m5l4')
ON CONFLICT (lesson_id) DO NOTHING;

ALTER TABLE public.course_lessons ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.course_lessons FROM anon, authenticated;

-- Learners receive only the fields needed to render an exam.  The base table
-- is intentionally no longer readable through the client API.
CREATE OR REPLACE VIEW public.exam_questions_safe AS
SELECT id, prompt, choices, skill_id, difficulty, active, created_at, updated_at
FROM public.exam_questions
WHERE active = true;

REVOKE ALL ON public.exam_questions FROM authenticated;
GRANT SELECT ON public.exam_questions_safe TO authenticated;
GRANT SELECT ON public.exam_questions TO authenticated;

DROP POLICY IF EXISTS "Authenticated can read questions" ON public.exam_questions;
CREATE POLICY "Staff can read question keys"
  ON public.exam_questions FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moniteur'));
DROP POLICY IF EXISTS "Examen propriétaire" ON public.exam_attempts;
REVOKE INSERT, UPDATE, DELETE ON public.exam_attempts FROM authenticated;

CREATE POLICY "Exam attempts are readable by owner"
  ON public.exam_attempts FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- A catalog table, when present, is authoritative.  Until one is introduced,
-- the existing application catalog contains 25 lessons.
CREATE OR REPLACE FUNCTION public.theory_completion_status(
  p_expected_lesson_count integer DEFAULT 27
)
RETURNS TABLE (
  complete boolean,
  completed_count bigint,
  required_count bigint
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  required_lessons bigint;
  completed_lessons bigint;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required' USING ERRCODE = '42501';
  END IF;

  IF to_regclass('public.course_lessons') IS NOT NULL THEN
    EXECUTE 'SELECT count(*) FROM public.course_lessons WHERE active' INTO required_lessons;
  ELSE
    required_lessons := COALESCE(p_expected_lesson_count, 27);
  END IF;

  SELECT count(DISTINCT tp.lesson_id)
    INTO completed_lessons
    FROM public.theorie_progress AS tp
   WHERE tp.user_id = auth.uid()
     AND EXISTS (
       SELECT 1
       FROM public.course_lessons AS cl
       WHERE cl.lesson_id = tp.lesson_id
         AND cl.active
     );

  RETURN QUERY SELECT
    completed_lessons >= required_lessons AND required_lessons > 0,
    completed_lessons,
    required_lessons;
END;
$$;

GRANT EXECUTE ON FUNCTION public.theory_completion_status(integer) TO authenticated;

-- The payload is an object whose keys are question UUIDs and values are the
-- selected choice indexes.  Correct answers never leave this function.
CREATE OR REPLACE FUNCTION public.submit_exam_attempt(
  p_category text,
  p_answers jsonb
)
RETURNS TABLE (
  attempt_id uuid,
  score integer,
  total integer,
  passed boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
  approved boolean;
  theory_complete boolean;
  answer_count integer;
  correct_count integer;
  new_attempt_id uuid;
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'Authentication required' USING ERRCODE = '42501';
  END IF;

  SELECT p.account_status = 'approved'
    INTO approved
    FROM public.profiles AS p
   WHERE p.id = uid;
  IF COALESCE(approved, false) = false THEN
    RAISE EXCEPTION 'Approved account required' USING ERRCODE = '42501';
  END IF;

  SELECT t.complete INTO theory_complete
    FROM public.theory_completion_status() AS t;
  IF NOT COALESCE(theory_complete, false) THEN
    RAISE EXCEPTION 'Theory course is not complete' USING ERRCODE = '42501';
  END IF;

  IF jsonb_typeof(p_answers) <> 'object' OR p_answers = '{}'::jsonb THEN
    RAISE EXCEPTION 'Answers must be a non-empty JSON object' USING ERRCODE = '22023';
  END IF;

  WITH submitted AS (
    SELECT key AS question_id, value #>> '{}' AS selected_index
    FROM jsonb_each(p_answers)
  )
  SELECT count(*) INTO answer_count
  FROM submitted AS s
  JOIN public.exam_questions AS q ON q.id::text = s.question_id
  WHERE q.active
    AND s.selected_index ~ '^[0-9]+$'
    AND (p_category IS NULL OR EXISTS (
      SELECT 1
      FROM public.exam_question_categories AS qc
      JOIN public.exam_categories AS c ON c.id = qc.category_id
      WHERE qc.question_id = q.id
        AND (c.code = p_category OR c.id::text = p_category)
    ));

  IF answer_count <> jsonb_object_length(p_answers) THEN
    RAISE EXCEPTION 'Invalid, inactive, or out-of-category question' USING ERRCODE = '22023';
  END IF;

  WITH submitted AS (
    SELECT key AS question_id, (value #>> '{}')::integer AS selected_index
    FROM jsonb_each(p_answers)
  )
  SELECT count(*) INTO correct_count
  FROM submitted AS s
  JOIN public.exam_questions AS q ON q.id::text = s.question_id
  WHERE q.active AND q.correct_index = s.selected_index
    AND (p_category IS NULL OR EXISTS (
      SELECT 1
      FROM public.exam_question_categories AS qc
      JOIN public.exam_categories AS c ON c.id = qc.category_id
      WHERE qc.question_id = q.id
        AND (c.code = p_category OR c.id::text = p_category)
    ));

  INSERT INTO public.exam_attempts (user_id, category, score, total, passed)
  VALUES (uid, p_category, correct_count, answer_count,
          correct_count * 100 >= answer_count * 80)
  RETURNING id INTO new_attempt_id;

  RETURN QUERY
  SELECT new_attempt_id, correct_count, answer_count,
         correct_count * 100 >= answer_count * 80;
END;
$$;

REVOKE ALL ON FUNCTION public.submit_exam_attempt(text, jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.submit_exam_attempt(text, jsonb) TO authenticated;

-- Approval changes are auditable and cannot be forged by a learner changing
-- their own profile row.
CREATE TABLE IF NOT EXISTS public.approval_audit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  changed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  old_status text,
  new_status text NOT NULL,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.approval_audit ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.approval_audit FROM authenticated;
GRANT SELECT ON public.approval_audit TO authenticated;
CREATE POLICY "Admins read approval audit"
  ON public.approval_audit FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Utilisateur peut créer son profil" ON public.profiles;
CREATE POLICY "Utilisateur peut créer un profil en attente"
  ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id AND COALESCE(account_status, 'pending') = 'pending');

CREATE OR REPLACE FUNCTION public.prevent_self_approval()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF (OLD.account_status, OLD.approved_at, OLD.approval_notes)
     IS DISTINCT FROM (NEW.account_status, NEW.approved_at, NEW.approval_notes)
     AND NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Only an admin can change approval fields' USING ERRCODE = '42501';
  END IF;
  RETURN NEW;
END;
$$;

-- Never trust user metadata supplied during sign-up for approval.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone, account_status, approved_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NEW.phone,
    'pending',
    NULL
  );
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'eleve')
  ON CONFLICT (user_id, role) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS prevent_self_approval_trigger ON public.profiles;
CREATE TRIGGER prevent_self_approval_trigger
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.prevent_self_approval();

CREATE OR REPLACE FUNCTION public.audit_profile_approval()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF (OLD.account_status, OLD.approved_at, OLD.approval_notes)
     IS DISTINCT FROM (NEW.account_status, NEW.approved_at, NEW.approval_notes) THEN
    INSERT INTO public.approval_audit
      (user_id, changed_by, old_status, new_status, notes)
    VALUES
      (NEW.id, auth.uid(), OLD.account_status, NEW.account_status, NEW.approval_notes);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS audit_profile_approval_trigger ON public.profiles;
CREATE TRIGGER audit_profile_approval_trigger
  AFTER UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.audit_profile_approval();
