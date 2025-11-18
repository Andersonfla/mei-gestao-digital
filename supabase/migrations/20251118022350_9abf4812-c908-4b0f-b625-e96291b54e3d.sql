-- Criar policy restritiva para campo plan
-- CRÍTICO: Apenas o backend (via service role) pode alterar o campo 'plan'
-- Usuários podem atualizar outros campos do perfil, mas NÃO o plano

-- Remover policy antiga que permite atualização irrestrita
DROP POLICY IF EXISTS "Update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- Criar policy que permite atualização de APENAS campos seguros
-- Usuários NÃO podem alterar: plan, subscription_end, used_transactions, status, role
CREATE POLICY "Users can update safe profile fields"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (
  auth.uid() = id
  -- O plano, subscription_end e status NÃO podem ser alterados pelo usuário
  AND (
    (SELECT plan FROM public.profiles WHERE id = auth.uid()) = plan
    AND (SELECT subscription_end FROM public.profiles WHERE id = auth.uid()) IS NOT DISTINCT FROM subscription_end
    AND (SELECT used_transactions FROM public.profiles WHERE id = auth.uid()) = used_transactions
    AND (SELECT status FROM public.profiles WHERE id = auth.uid()) = status
    AND (SELECT role FROM public.profiles WHERE id = auth.uid()) IS NOT DISTINCT FROM role
  )
);