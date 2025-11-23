-- Adicionar campo canceled_at para rastrear cancelamentos de plano
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS canceled_at timestamp with time zone DEFAULT NULL;

COMMENT ON COLUMN public.profiles.canceled_at IS 'Data em que o usuário cancelou o plano. O acesso continua ativo até subscription_end.';