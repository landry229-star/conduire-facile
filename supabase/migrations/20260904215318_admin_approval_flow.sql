-- Admin approval / account status
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS account_status TEXT NOT NULL DEFAULT 'pending'
  CHECK (account_status IN ('pending', 'approved', 'rejected'));

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS approval_notes TEXT;

UPDATE public.profiles
SET account_status = 'pending'
WHERE account_status IS NULL;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    full_name,
    phone,
    account_status,
    approved_at,
    approval_notes
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NEW.phone,
    COALESCE(LOWER(COALESCE(NEW.raw_user_meta_data->>'account_status', NEW.raw_user_meta_data->>'status', 'pending')), 'pending'),
    CASE
      WHEN LOWER(COALESCE(NEW.raw_user_meta_data->>'account_status', NEW.raw_user_meta_data->>'status', 'pending')) = 'approved' THEN now()
      ELSE NULL
    END,
    NULL
  );

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'eleve')
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE POLICY "Admin met à jour tous les profils" ON public.profiles
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
