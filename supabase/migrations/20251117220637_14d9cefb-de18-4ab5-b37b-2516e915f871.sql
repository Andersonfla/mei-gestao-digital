-- Fix user_roles policies to enable safe admin revoke/promote and avoid recursive SELECT
-- 1) Drop the recursive SELECT policy if it exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'user_roles' 
      AND policyname = 'Admins podem ver todos os usuários'
  ) THEN
    DROP POLICY "Admins podem ver todos os usuários" ON public.user_roles;
  END IF;
END $$;

-- 2) Create a safe SELECT policy for admins using has_role()
CREATE POLICY "Admins can view all user roles"
ON public.user_roles
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- 3) Ensure admins can INSERT roles (promotion) from the client
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'user_roles' 
      AND policyname = 'Admins can insert user roles'
  ) THEN
    CREATE POLICY "Admins can insert user roles"
    ON public.user_roles
    FOR INSERT
    WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));
  END IF;
END $$;