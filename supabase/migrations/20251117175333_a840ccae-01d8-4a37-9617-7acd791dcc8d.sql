-- Criar tabela de carteiras (wallets) para usuários Premium Master
CREATE TABLE IF NOT EXISTS public.wallets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  icon text DEFAULT 'Wallet',
  color text DEFAULT '#2563EB',
  is_default boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Criar tabela de categorias personalizadas para Premium Master
CREATE TABLE IF NOT EXISTS public.custom_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  icon text DEFAULT 'Tag',
  color text DEFAULT '#2563EB',
  type text NOT NULL CHECK (type IN ('entrada', 'saida')),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Criar tabela de backups automáticos para Premium Master
CREATE TABLE IF NOT EXISTS public.backups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_url text,
  file_data jsonb,
  generated_at timestamp with time zone DEFAULT now()
);

-- Adicionar campo de PIN de segurança e payment_id aos profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS pin_code text,
ADD COLUMN IF NOT EXISTS payment_id text;

-- Adicionar wallet_id às transações
ALTER TABLE public.transactions
ADD COLUMN IF NOT EXISTS wallet_id uuid REFERENCES public.wallets(id) ON DELETE SET NULL;

-- Habilitar RLS nas novas tabelas
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.backups ENABLE ROW LEVEL SECURITY;

-- Políticas para wallets
CREATE POLICY "Usuários podem ver suas próprias carteiras"
ON public.wallets FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir suas próprias carteiras"
ON public.wallets FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar suas próprias carteiras"
ON public.wallets FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar suas próprias carteiras"
ON public.wallets FOR DELETE
USING (auth.uid() = user_id);

-- Políticas para custom_categories
CREATE POLICY "Usuários podem ver suas próprias categorias personalizadas"
ON public.custom_categories FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir suas próprias categorias"
ON public.custom_categories FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar suas próprias categorias"
ON public.custom_categories FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar suas próprias categorias"
ON public.custom_categories FOR DELETE
USING (auth.uid() = user_id);

-- Políticas para backups
CREATE POLICY "Usuários podem ver seus próprios backups"
ON public.backups FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Sistema pode inserir backups"
ON public.backups FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Criar função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION public.update_wallet_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.update_custom_category_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar triggers para atualizar updated_at
CREATE TRIGGER update_wallets_updated_at
BEFORE UPDATE ON public.wallets
FOR EACH ROW
EXECUTE FUNCTION public.update_wallet_updated_at();

CREATE TRIGGER update_custom_categories_updated_at
BEFORE UPDATE ON public.custom_categories
FOR EACH ROW
EXECUTE FUNCTION public.update_custom_category_updated_at();

-- Criar carteira padrão para usuários existentes
CREATE OR REPLACE FUNCTION public.create_default_wallet()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.wallets (user_id, name, is_default)
  VALUES (NEW.id, 'Principal', true);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER create_default_wallet_on_signup
AFTER INSERT ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.create_default_wallet();