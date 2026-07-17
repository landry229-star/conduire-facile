
CREATE TABLE public.exam_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  label text NOT NULL,
  description text,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.exam_categories TO anon, authenticated;
GRANT ALL ON public.exam_categories TO service_role;
GRANT INSERT, UPDATE, DELETE ON public.exam_categories TO authenticated;
ALTER TABLE public.exam_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read categories" ON public.exam_categories FOR SELECT USING (true);
CREATE POLICY "staff manage categories insert" ON public.exam_categories FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'moniteur'));
CREATE POLICY "staff manage categories update" ON public.exam_categories FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'moniteur'));
CREATE POLICY "staff manage categories delete" ON public.exam_categories FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.exam_skills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid NOT NULL REFERENCES public.exam_categories(id) ON DELETE CASCADE,
  code text NOT NULL,
  label text NOT NULL,
  description text,
  position int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (category_id, code)
);
GRANT SELECT ON public.exam_skills TO anon, authenticated;
GRANT ALL ON public.exam_skills TO service_role;
GRANT INSERT, UPDATE, DELETE ON public.exam_skills TO authenticated;
ALTER TABLE public.exam_skills ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read skills" ON public.exam_skills FOR SELECT USING (true);
CREATE POLICY "staff insert skills" ON public.exam_skills FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'moniteur'));
CREATE POLICY "staff update skills" ON public.exam_skills FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'moniteur'));
CREATE POLICY "staff delete skills" ON public.exam_skills FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'moniteur'));

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER trg_exam_categories_updated BEFORE UPDATE ON public.exam_categories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_exam_skills_updated BEFORE UPDATE ON public.exam_skills
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed default categories & skills
INSERT INTO public.exam_categories (code, label, description) VALUES
  ('AM','Catégorie AM','Cyclomoteurs et quadricycles légers'),
  ('A1','Catégorie A1','Motos légères jusqu''à 125 cm³'),
  ('A','Catégorie A','Toutes motos'),
  ('B','Catégorie B','Voitures particulières'),
  ('BE','Catégorie BE','Voiture avec remorque lourde'),
  ('C','Catégorie C','Poids lourds'),
  ('D','Catégorie D','Transport de personnes'),
  ('T','Catégorie T','Véhicules agricoles')
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.exam_skills (category_id, code, label, position)
SELECT c.id, s.code, s.label, s.position FROM public.exam_categories c
CROSS JOIN (VALUES
  ('panneaux','Panneaux et signalisation',1),
  ('priorites','Priorités et intersections',2),
  ('vitesse','Vitesse et distances',3),
  ('securite','Sécurité et équipements',4),
  ('conduite','Conduite et manœuvres',5),
  ('usagers','Partage de la route',6),
  ('specifique','Règles spécifiques à la catégorie',7)
) AS s(code,label,position)
ON CONFLICT (category_id, code) DO NOTHING;
