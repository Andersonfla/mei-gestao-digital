-- Adicionar política RLS para admins verem todos os perfis
CREATE POLICY "Admins podem ver todos os perfis"
ON public.profiles
FOR SELECT
USING (
  public.has_role(auth.uid(), 'admin'::app_role)
);