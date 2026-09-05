-- Category-aware learning, quiz and exam gates.

CREATE TABLE IF NOT EXISTS public.category_learning_requirements (
  category text NOT NULL,
  lesson_id text NOT NULL REFERENCES public.course_lessons(lesson_id) ON DELETE CASCADE,
  PRIMARY KEY (category, lesson_id)
);

ALTER TABLE public.category_learning_requirements ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.category_learning_requirements FROM anon, authenticated;

INSERT INTO public.category_learning_requirements (category, lesson_id)
SELECT category, lesson_id
FROM unnest(ARRAY['AM','A1','A2','A','B1','B','BE','C','D','T']) AS categories(category)
CROSS JOIN public.course_lessons
WHERE active
ON CONFLICT DO NOTHING;

CREATE TABLE IF NOT EXISTS public.category_quiz_requirements (
  category text PRIMARY KEY,
  code_quiz_type text NOT NULL
);

ALTER TABLE public.category_quiz_requirements ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.category_quiz_requirements FROM anon, authenticated;

INSERT INTO public.category_quiz_requirements (category, code_quiz_type)
VALUES
  ('AM', 'moto'), ('A1', 'moto'), ('A2', 'moto'), ('A', 'moto'),
  ('B1', 'voiture'), ('B', 'voiture'), ('BE', 'voiture'),
  ('C', 'poids-lourd'), ('D', 'transport-commun'), ('T', 'agricole')
ON CONFLICT (category) DO UPDATE SET code_quiz_type = EXCLUDED.code_quiz_type;

CREATE OR REPLACE FUNCTION public.theory_completion_status(
  p_expected_lesson_count integer DEFAULT 27
)
RETURNS TABLE (complete boolean, completed_count bigint, required_count bigint)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
  learner_category text;
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'Authentication required' USING ERRCODE = '42501';
  END IF;

  SELECT category INTO learner_category FROM public.profiles WHERE id = uid;
  IF learner_category IS NULL OR NOT EXISTS (
    SELECT 1 FROM public.category_quiz_requirements WHERE category = learner_category
  ) THEN
    RETURN QUERY SELECT false, 0::bigint, 0::bigint;
    RETURN;
  END IF;

  RETURN QUERY
  SELECT
    count(tp.lesson_id) = count(req.lesson_id),
    count(tp.lesson_id),
    count(req.lesson_id)
  FROM public.category_learning_requirements AS req
  LEFT JOIN public.theorie_progress AS tp
    ON tp.user_id = uid AND tp.lesson_id = req.lesson_id
  WHERE req.category = learner_category;
END;
$$;

CREATE OR REPLACE FUNCTION public.learning_gate_status()
RETURNS TABLE (
  theory_complete boolean,
  panels_mastered boolean,
  code_quiz_passed boolean,
  panel_quiz_passed boolean,
  exam_unlocked boolean,
  code_attempts integer,
  panel_attempts integer
)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
  learner_category text;
  required_quiz text;
  theory_done boolean;
  code_passed boolean;
  panel_passed boolean;
  code_count integer;
  panel_count integer;
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'Authentication required' USING ERRCODE = '42501';
  END IF;

  SELECT category INTO learner_category FROM public.profiles WHERE id = uid;
  SELECT code_quiz_type INTO required_quiz
  FROM public.category_quiz_requirements WHERE category = learner_category;

  SELECT complete INTO theory_done FROM public.theory_completion_status();

  SELECT count(*) INTO code_count FROM public.quiz_attempts
  WHERE user_id = uid AND quiz_type = required_quiz;
  SELECT count(*) INTO panel_count FROM public.quiz_attempts
  WHERE user_id = uid AND quiz_type = 'panneaux';

  SELECT EXISTS (
    SELECT 1 FROM public.quiz_attempts
    WHERE user_id = uid AND quiz_type = required_quiz
      AND total > 0 AND score * 100 >= total * 80
  ) INTO code_passed;

  SELECT EXISTS (
    SELECT 1 FROM public.quiz_attempts
    WHERE user_id = uid AND quiz_type = 'panneaux'
      AND total > 0 AND score * 100 >= total * 80
  ) INTO panel_passed;

  RETURN QUERY SELECT
    COALESCE(theory_done, false),
    COALESCE(panel_passed, false),
    COALESCE(code_passed, false),
    COALESCE(panel_passed, false),
    COALESCE(theory_done, false) AND COALESCE(code_passed, false)
      AND COALESCE(panel_passed, false),
    COALESCE(code_count, 0),
    COALESCE(panel_count, 0);
END;
$$;

REVOKE ALL ON FUNCTION public.theory_completion_status(integer) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.learning_gate_status() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.theory_completion_status(integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.learning_gate_status() TO authenticated;

CREATE OR REPLACE FUNCTION public.submit_quiz_attempt(
  p_quiz_type text,
  p_answers jsonb
)
RETURNS TABLE (attempt_id uuid, score integer, total integer)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
  learner_category text;
  required_quiz text;
  total_count integer;
  correct_count integer;
  attempt_count integer;
  new_id uuid;
BEGIN
  IF uid IS NULL OR NOT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = uid AND account_status = 'approved'
  ) THEN
    RAISE EXCEPTION 'Approved account required' USING ERRCODE = '42501';
  END IF;

  SELECT category INTO learner_category FROM public.profiles WHERE id = uid;
  SELECT code_quiz_type INTO required_quiz
  FROM public.category_quiz_requirements WHERE category = learner_category;

  IF p_quiz_type <> 'panneaux' AND p_quiz_type <> required_quiz THEN
    RAISE EXCEPTION 'Quiz incompatible with learner category' USING ERRCODE = '22023';
  END IF;

  SELECT count(*) INTO attempt_count FROM public.quiz_attempts
  WHERE user_id = uid AND quiz_type = p_quiz_type;
  IF attempt_count >= 3 THEN
    RAISE EXCEPTION 'Maximum de trois tentatives atteint' USING ERRCODE = '22023';
  END IF;

  IF jsonb_typeof(p_answers) <> 'array' THEN
    RAISE EXCEPTION 'Answers must be an array' USING ERRCODE = '22023';
  END IF;
  SELECT count(*) INTO total_count FROM public.quiz_questions
  WHERE quiz_type = p_quiz_type AND active;
  IF jsonb_array_length(p_answers) <> total_count OR total_count = 0 THEN
    RAISE EXCEPTION 'Invalid answer count' USING ERRCODE = '22023';
  END IF;

  SELECT count(*) INTO correct_count
  FROM (SELECT position, correct_index FROM public.quiz_questions
        WHERE quiz_type = p_quiz_type AND active) AS q
  JOIN LATERAL jsonb_array_elements_text(p_answers) WITH ORDINALITY AS a(value, position)
    ON q.position = a.position - 1
  WHERE a.value ~ '^[0-9]+$' AND q.correct_index = a.value::integer;

  INSERT INTO public.quiz_attempts (user_id, quiz_type, score, total)
  VALUES (uid, p_quiz_type, correct_count, total_count)
  RETURNING id INTO new_id;
  RETURN QUERY SELECT new_id, correct_count, total_count;
END;
$$;

REVOKE ALL ON FUNCTION public.submit_quiz_attempt(text, jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.submit_quiz_attempt(text, jsonb) TO authenticated;

-- The exam remains a distinct assessment and is unlocked only after both
-- category-specific code and panel quizzes reach 80%.
CREATE OR REPLACE FUNCTION public.submit_exam_attempt(
  p_category text,
  p_answers jsonb
)
RETURNS TABLE (attempt_id uuid, score integer, total integer, passed boolean)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
  profile_category text;
  new_id uuid;
  answer_count integer;
  correct_count integer;
BEGIN
  SELECT category INTO profile_category FROM public.profiles
  WHERE id = auth.uid() AND account_status = 'approved';
  IF profile_category IS NULL OR profile_category <> p_category THEN
    RAISE EXCEPTION 'Exam category must match learner profile' USING ERRCODE = '42501';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.learning_gate_status() WHERE exam_unlocked) THEN
    RAISE EXCEPTION 'Required course and quizzes are not passed' USING ERRCODE = '42501';
  END IF;
  IF jsonb_typeof(p_answers) <> 'object' OR jsonb_object_length(p_answers) <> 20 THEN
    RAISE EXCEPTION 'Exactly 20 answers are required' USING ERRCODE = '22023';
  END IF;

  WITH submitted AS (
    SELECT key AS question_id, (value #>> '{}')::integer AS selected_index
    FROM jsonb_each(p_answers)
  )
  SELECT count(*) INTO answer_count
  FROM submitted AS s
  JOIN public.exam_questions AS q ON q.id::text = s.question_id
  WHERE q.active AND EXISTS (
    SELECT 1 FROM public.exam_question_categories AS qc
    JOIN public.exam_categories AS c ON c.id = qc.category_id
    WHERE qc.question_id = q.id AND c.active AND c.code = p_category
  );
  IF answer_count <> 20 THEN
    RAISE EXCEPTION 'Invalid or out-of-category exam questions' USING ERRCODE = '22023';
  END IF;

  WITH submitted AS (
    SELECT key AS question_id, (value #>> '{}')::integer AS selected_index
    FROM jsonb_each(p_answers)
  )
  SELECT count(*) INTO correct_count
  FROM submitted AS s
  JOIN public.exam_questions AS q ON q.id::text = s.question_id
  WHERE q.active AND q.correct_index = s.selected_index;

  INSERT INTO public.exam_attempts (user_id, category, score, total, passed)
  VALUES (uid, p_category, correct_count, 20, correct_count * 100 >= 1600)
  RETURNING id INTO new_id;
  RETURN QUERY SELECT new_id, correct_count, 20, correct_count * 100 >= 1600;
END;
$$;

REVOKE ALL ON FUNCTION public.submit_exam_attempt(text, jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.submit_exam_attempt(text, jsonb) TO authenticated;
