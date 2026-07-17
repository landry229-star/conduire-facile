
CREATE TABLE public.exam_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt text NOT NULL,
  choices jsonb NOT NULL DEFAULT '[]'::jsonb,
  correct_index integer NOT NULL DEFAULT 0,
  explanation text,
  skill_id uuid REFERENCES public.exam_skills(id) ON DELETE SET NULL,
  difficulty text NOT NULL DEFAULT 'moyen',
  active boolean NOT NULL DEFAULT true,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.exam_questions TO authenticated;
GRANT ALL ON public.exam_questions TO service_role;

ALTER TABLE public.exam_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can read questions"
  ON public.exam_questions FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "Staff can insert questions"
  ON public.exam_questions FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'moniteur'));

CREATE POLICY "Staff can update questions"
  ON public.exam_questions FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'moniteur'));

CREATE POLICY "Staff can delete questions"
  ON public.exam_questions FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'moniteur'));

CREATE TRIGGER update_exam_questions_updated_at
  BEFORE UPDATE ON public.exam_questions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.exam_question_categories (
  question_id uuid NOT NULL REFERENCES public.exam_questions(id) ON DELETE CASCADE,
  category_id uuid NOT NULL REFERENCES public.exam_categories(id) ON DELETE CASCADE,
  PRIMARY KEY (question_id, category_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.exam_question_categories TO authenticated;
GRANT ALL ON public.exam_question_categories TO service_role;

ALTER TABLE public.exam_question_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can read q-cat links"
  ON public.exam_question_categories FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "Staff can insert q-cat links"
  ON public.exam_question_categories FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'moniteur'));

CREATE POLICY "Staff can delete q-cat links"
  ON public.exam_question_categories FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'moniteur'));

CREATE INDEX idx_exam_questions_skill ON public.exam_questions(skill_id);
CREATE INDEX idx_exam_qc_category ON public.exam_question_categories(category_id);
