-- Enforce exam size, approval, and strict category membership server-side.

CREATE OR REPLACE VIEW public.exam_questions_safe AS
SELECT q.id, q.prompt, q.choices, q.skill_id, q.difficulty, q.active, q.created_at, q.updated_at
FROM public.exam_questions AS q
WHERE q.active
  AND EXISTS (
    SELECT 1
    FROM public.profiles AS p
    WHERE p.id = auth.uid()
      AND p.account_status = 'approved'
  );

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
  answer_count integer;
  correct_count integer;
  new_attempt_id uuid;
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'Authentication required' USING ERRCODE = '42501';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = uid AND account_status = 'approved'
  ) THEN
    RAISE EXCEPTION 'Approved account required' USING ERRCODE = '42501';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.theory_completion_status() AS completion
    WHERE completion.complete
  ) THEN
    RAISE EXCEPTION 'Theory course is not complete' USING ERRCODE = '42501';
  END IF;

  IF jsonb_typeof(p_answers) <> 'object'
     OR jsonb_object_length(p_answers) <> 20 THEN
    RAISE EXCEPTION 'Exactly 20 answers are required' USING ERRCODE = '22023';
  END IF;

  WITH submitted AS (
    SELECT key AS question_id, value #>> '{}' AS selected_index
    FROM jsonb_each(p_answers)
  )
  SELECT count(*) INTO answer_count
  FROM submitted AS s
  JOIN public.exam_questions AS q ON q.id::text = s.question_id
  WHERE q.active
    AND s.selected_index ~ '^-?[0-9]+$'
    AND EXISTS (
      SELECT 1
      FROM public.exam_question_categories AS qc
      JOIN public.exam_categories AS c ON c.id = qc.category_id
      WHERE qc.question_id = q.id
        AND c.active
        AND (c.code = p_category OR c.id::text = p_category)
    );

  IF answer_count <> 20 THEN
    RAISE EXCEPTION 'Invalid, inactive, or out-of-category question' USING ERRCODE = '22023';
  END IF;

  WITH submitted AS (
    SELECT key AS question_id, (value #>> '{}')::integer AS selected_index
    FROM jsonb_each(p_answers)
  )
  SELECT count(*) INTO correct_count
  FROM submitted AS s
  JOIN public.exam_questions AS q ON q.id::text = s.question_id
  WHERE q.active
    AND q.correct_index = s.selected_index
    AND EXISTS (
      SELECT 1
      FROM public.exam_question_categories AS qc
      JOIN public.exam_categories AS c ON c.id = qc.category_id
      WHERE qc.question_id = q.id
        AND c.active
        AND (c.code = p_category OR c.id::text = p_category)
    );

  INSERT INTO public.exam_attempts (user_id, category, score, total, passed)
  VALUES (uid, p_category, correct_count, 20, correct_count * 100 >= 1600)
  RETURNING id INTO new_attempt_id;

  RETURN QUERY SELECT new_attempt_id, correct_count, 20, correct_count * 100 >= 1600;
END;
$$;

REVOKE ALL ON FUNCTION public.submit_exam_attempt(text, jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.submit_exam_attempt(text, jsonb) TO authenticated;
