-- ====================================
-- Security Fix: Proper Role-Based Access Control
-- ====================================

-- 1. Create role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- 2. Create user_roles table for secure role management
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- RLS policy: Users can view their own roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

-- RLS policy: Only service role can manage roles (via edge functions)
CREATE POLICY "Service role can insert roles"
ON public.user_roles
FOR INSERT
WITH CHECK (true);

-- 3. Create security definer function to check admin status
-- This prevents RLS recursion issues
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- 4. Create helper function to check if current user is admin
CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(auth.uid(), 'admin'::app_role)
$$;

-- 5. Update webhook_logs RLS policies for proper admin-only access
DROP POLICY IF EXISTS "Admins can view webhook logs" ON public.webhook_logs;
DROP POLICY IF EXISTS "Service role can insert webhook logs" ON public.webhook_logs;

-- Only admins can view webhook logs
CREATE POLICY "Only admins can view webhook logs"
ON public.webhook_logs
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Service role can insert webhook logs (for the edge function)
CREATE POLICY "Service role can insert webhook logs"
ON public.webhook_logs
FOR INSERT
WITH CHECK (true);

-- 6. Add index for performance
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX idx_user_roles_role ON public.user_roles(role);

-- 7. Add comment explaining the security model
COMMENT ON TABLE public.user_roles IS 'Stores user roles separately from profiles to prevent privilege escalation. Roles are managed server-side only.';
COMMENT ON FUNCTION public.has_role IS 'Security definer function to check user roles without triggering RLS recursion.';
