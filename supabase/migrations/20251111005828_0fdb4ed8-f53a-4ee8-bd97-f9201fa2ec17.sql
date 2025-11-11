-- Remover a view insegura admin_users_view
DROP VIEW IF EXISTS public.admin_users_view CASCADE;

-- Criar uma view segura sem SECURITY DEFINER
CREATE VIEW public.admin_users_view AS
SELECT 
  u.id,
  u.email,
  ur.role,
  u.created_at
FROM auth.users u
LEFT JOIN public.user_roles ur ON ur.user_id = u.id;

-- Garantir que apenas admins possam acessar a view
-- (views herdam RLS das tabelas base, mas podemos adicionar grant explícito)
GRANT SELECT ON public.admin_users_view TO authenticated;

-- Adicionar RLS na view
ALTER VIEW public.admin_users_view SET (security_invoker = true);