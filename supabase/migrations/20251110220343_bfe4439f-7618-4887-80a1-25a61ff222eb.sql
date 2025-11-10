-- Adicionar campo used_transactions na tabela profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS used_transactions INTEGER NOT NULL DEFAULT 0;

-- Criar função RPC para incrementar o contador de transações usadas
CREATE OR REPLACE FUNCTION public.increment_used_transactions(user_id_param uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.profiles
  SET used_transactions = used_transactions + 1
  WHERE id = user_id_param;
END;
$$;

-- Atualizar contador para usuários existentes (baseado no count atual)
UPDATE public.profiles p
SET used_transactions = (
  SELECT COUNT(*) 
  FROM public.transactions t 
  WHERE t.user_id = p.id
)
WHERE used_transactions = 0;