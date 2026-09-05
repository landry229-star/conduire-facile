CREATE TABLE IF NOT EXISTS public.quiz_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_type text NOT NULL,
  prompt text NOT NULL,
  choices jsonb NOT NULL,
  correct_index integer NOT NULL,
  position integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (quiz_type, prompt)
);

ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.quiz_questions FROM anon, authenticated;
GRANT SELECT ON public.quiz_questions TO authenticated;

CREATE POLICY "Approved users read quiz questions"
  ON public.quiz_questions FOR SELECT TO authenticated
  USING (active AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND account_status = 'approved'
  ));

INSERT INTO public.quiz_questions (quiz_type, prompt, choices, correct_index)
VALUES
('moto', 'À partir de quel âge peut-on conduire un cyclomoteur (catégorie AM) au Bénin ?', '["12 ans","14 ans","16 ans","18 ans"]', 1),
('moto', 'Le port du casque pour le conducteur d''un deux-roues motorisé est :', '["Recommandé","Obligatoire","Optionnel de nuit","Au choix du passager"]', 1),
('moto', 'Avant de tourner à gauche en moto, vous devez :', '["Klaxonner deux fois","Tourner directement","Contrôler en tournant la tête puis signaler","Allumer les feux de détresse"]', 2),
('moto', 'En zone urbaine, la vitesse maximale autorisée est généralement :', '["30 km/h","50 km/h","70 km/h","90 km/h"]', 1),
('moto', 'Un Zémidjan transportant un passager doit :', '["Lui fournir un casque homologué","Refuser tout passager mineur","Rouler uniquement sur le trottoir","Doubler systématiquement par la droite"]', 0),
('voiture', 'Un panneau triangulaire à bord rouge signifie :', '["Obligation","Danger","Interdiction","Indication"]', 1),
('voiture', 'À un carrefour sans signalisation, la priorité est donnée :', '["Au véhicule le plus rapide","Au véhicule venant de la gauche","Au véhicule venant de la droite","Au plus gros véhicule"]', 2),
('voiture', 'La distance de sécurité minimale derrière un véhicule à 90 km/h correspond à :', '["1 seconde","2 secondes","5 mètres","10 mètres"]', 1),
('voiture', 'Le taux d''alcoolémie maximum autorisé au volant est généralement de :', '["0,2 g/L","0,5 g/L","0,8 g/L","1,0 g/L"]', 1),
('voiture', 'Une ligne blanche continue au sol signifie :', '["Dépassement autorisé","Interdiction de franchissement","Voie réservée aux bus","Zone de stationnement"]', 1),
('voiture', 'Le contrôle technique pour un véhicule particulier est exigé :', '["Jamais","Tous les mois","Périodiquement selon la réglementation","Uniquement après accident"]', 2),
('poids-lourd', 'Le temps de conduite continu maximum recommandé pour un chauffeur PL est :', '["2 h","4 h 30","6 h","8 h"]', 1),
('poids-lourd', 'Avant chaque départ, le chauffeur poids lourd doit vérifier :', '["Uniquement le carburant","Pneus, freins, éclairage, arrimage","Seulement les rétroviseurs","Rien si le camion vient de rouler"]', 1),
('poids-lourd', 'Un dépassement de charge maximale autorisée est :', '["Toléré jusqu''à 20 %","Interdit et sanctionné","Autorisé hors agglomération","Autorisé la nuit"]', 1),
('poids-lourd', 'En descente prolongée, on utilise principalement :', '["Le frein de service en continu","Le frein moteur / ralentisseur","Le frein à main","Le point mort"]', 1),
('poids-lourd', 'Le distance de freinage d''un PL chargé à 80 km/h est, par rapport à une voiture :', '["Identique","Plus courte","Beaucoup plus longue","Réduite par l''ABS"]', 2),
('transport-commun', 'Avant le départ avec des passagers, le conducteur doit :', '["Vérifier les issues de secours","Démarrer immédiatement","Laisser les portes ouvertes","Couper le moteur"]', 0),
('transport-commun', 'Le nombre de passagers transportés ne doit jamais dépasser :', '["Le double de la capacité","La capacité indiquée sur la carte grise","Ce que le chauffeur estime","10 personnes"]', 1),
('transport-commun', 'À un arrêt de bus, le conducteur doit :', '["S''arrêter au milieu de la chaussée","S''arrêter à l''emplacement réservé","Klaxonner pour faire monter","Reculer pour récupérer un passager"]', 1),
('transport-commun', 'Le temps de repos journalier d''un conducteur de bus est :', '["4 h","8 h","Au moins 11 h","24 h"]', 2),
('transport-commun', 'En cas de panne sur autoroute avec voyageurs, le conducteur doit :', '["Continuer doucement","Faire descendre les passagers en sécurité, baliser","Attendre dans le bus moteur allumé","Repartir en sens inverse"]', 1),
('agricole', 'Sur route, un tracteur doit circuler :', '["Au milieu de la chaussée","Le plus à droite possible","Sur la voie de gauche","Uniquement sur bas-côté"]', 1),
('agricole', 'Un tracteur transportant une remorque chargée doit :', '["Désactiver les feux","Vérifier l''arrimage et la signalisation arrière","Doubler les autres véhicules","Rouler à plus de 60 km/h"]', 1),
('agricole', 'Le gyrophare orange sur un engin agricole indique :', '["Véhicule prioritaire","Véhicule lent ou encombrant","Véhicule de police","Convoi militaire"]', 1),
('agricole', 'À la sortie d''un champ sur la route, le conducteur doit :', '["Foncer sans s''arrêter","Marquer un arrêt et nettoyer la chaussée si salie","Klaxonner et passer","Avancer en marche arrière"]', 1)
ON CONFLICT (quiz_type, prompt) DO NOTHING;

WITH ranked AS (
  SELECT id, row_number() OVER (PARTITION BY quiz_type ORDER BY ctid) - 1 AS position
  FROM public.quiz_questions
)
UPDATE public.quiz_questions AS q
SET position = ranked.position
FROM ranked
WHERE q.id = ranked.id;

CREATE OR REPLACE FUNCTION public.submit_quiz_attempt(
  p_quiz_type text,
  p_answers jsonb
)
RETURNS TABLE (attempt_id uuid, score integer, total integer)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
  total_count integer;
  correct_count integer;
  new_id uuid;
BEGIN
  IF uid IS NULL OR NOT EXISTS (
    SELECT 1 FROM profiles WHERE id = uid AND account_status = 'approved'
  ) THEN
    RAISE EXCEPTION 'Approved account required' USING ERRCODE = '42501';
  END IF;

  SELECT count(*) INTO total_count
  FROM quiz_questions WHERE quiz_type = p_quiz_type AND active;

  IF jsonb_typeof(p_answers) <> 'array'
     OR jsonb_array_length(p_answers) <> total_count THEN
    RAISE EXCEPTION 'Invalid answer count' USING ERRCODE = '22023';
  END IF;

  SELECT count(*) INTO correct_count
  FROM (
    SELECT position,
           correct_index
    FROM quiz_questions
    WHERE quiz_type = p_quiz_type AND active
  ) AS q
  JOIN LATERAL jsonb_array_elements_text(p_answers) WITH ORDINALITY AS a(value, position)
    ON q.position = a.position - 1
  WHERE a.value ~ '^[0-9]+$' AND q.correct_index = a.value::integer;

  INSERT INTO quiz_attempts (user_id, quiz_type, score, total)
  VALUES (uid, p_quiz_type, correct_count, total_count)
  RETURNING id INTO new_id;

  RETURN QUERY SELECT new_id, correct_count, total_count;
END;
$$;

REVOKE ALL ON FUNCTION public.submit_quiz_attempt(text, jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.submit_quiz_attempt(text, jsonb) TO authenticated;
