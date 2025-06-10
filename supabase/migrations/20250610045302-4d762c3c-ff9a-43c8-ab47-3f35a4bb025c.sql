
-- Primeiro, vamos limpar e recriar a tabela plan_limits com a estrutura correta
DROP TABLE IF EXISTS public.plan_limits CASCADE;

CREATE TABLE public.plan_limits (
  user_id uuid NOT NULL,
  month integer NOT NULL,
  year integer NOT NULL,
  transactions integer NOT NULL DEFAULT 0,
  limit_reached boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (user_id, month, year)
);

-- Habilitar RLS
ALTER TABLE public.plan_limits ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para plan_limits
CREATE POLICY "Users can view their own plan limits" 
  ON public.plan_limits 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own plan limits" 
  ON public.plan_limits 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own plan limits" 
  ON public.plan_limits 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Habilitar RLS nas outras tabelas importantes
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para transactions
DROP POLICY IF EXISTS "Users can view their own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can insert their own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can update their own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can delete their own transactions" ON public.transactions;

CREATE POLICY "Users can view their own transactions" 
  ON public.transactions 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own transactions" 
  ON public.transactions 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own transactions" 
  ON public.transactions 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own transactions" 
  ON public.transactions 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Políticas RLS para profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

CREATE POLICY "Users can view their own profile" 
  ON public.profiles 
  FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
  ON public.profiles 
  FOR UPDATE 
  USING (auth.uid() = id);

-- Função para atualizar automaticamente os limites quando uma transação é inserida
CREATE OR REPLACE FUNCTION public.update_plan_limits_on_transaction()
RETURNS TRIGGER AS $$
DECLARE
  current_month INTEGER;
  current_year INTEGER;
  transaction_count INTEGER;
  user_plan TEXT;
  transaction_limit INTEGER;
BEGIN
  -- Extrair mês e ano da data da transação
  current_month := EXTRACT(MONTH FROM NEW.date);
  current_year := EXTRACT(YEAR FROM NEW.date);
  
  -- Buscar o plano do usuário
  SELECT plan INTO user_plan FROM public.profiles WHERE id = NEW.user_id;
  
  -- Definir limite baseado no plano
  IF user_plan = 'premium' THEN
    transaction_limit := 999999;
  ELSE
    transaction_limit := 20;
  END IF;
  
  -- Contar transações do usuário no mês/ano
  SELECT COUNT(*) INTO transaction_count
  FROM public.transactions 
  WHERE user_id = NEW.user_id 
    AND EXTRACT(MONTH FROM date) = current_month 
    AND EXTRACT(YEAR FROM date) = current_year;
  
  -- Inserir ou atualizar o registro de limites
  INSERT INTO public.plan_limits (user_id, month, year, transactions, limit_reached)
  VALUES (
    NEW.user_id,
    current_month,
    current_year,
    transaction_count,
    transaction_count >= transaction_limit
  )
  ON CONFLICT (user_id, month, year)
  DO UPDATE SET
    transactions = transaction_count,
    limit_reached = transaction_count >= transaction_limit,
    updated_at = now();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para executar a função após inserir transação
DROP TRIGGER IF EXISTS trigger_update_plan_limits ON public.transactions;
CREATE TRIGGER trigger_update_plan_limits
  AFTER INSERT ON public.transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_plan_limits_on_transaction();

-- Função para verificar se o usuário pode adicionar mais transações
CREATE OR REPLACE FUNCTION public.can_add_transaction(user_id_param UUID, transaction_date DATE DEFAULT CURRENT_DATE)
RETURNS BOOLEAN AS $$
DECLARE
  current_month INTEGER;
  current_year INTEGER;
  transaction_count INTEGER;
  user_plan TEXT;
  transaction_limit INTEGER;
BEGIN
  -- Extrair mês e ano
  current_month := EXTRACT(MONTH FROM transaction_date);
  current_year := EXTRACT(YEAR FROM transaction_date);
  
  -- Buscar o plano do usuário
  SELECT plan INTO user_plan FROM public.profiles WHERE id = user_id_param;
  
  -- Se não encontrou o usuário, retornar false
  IF user_plan IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Usuários premium não têm limite
  IF user_plan = 'premium' THEN
    RETURN TRUE;
  END IF;
  
  -- Para usuários free, verificar limite
  transaction_limit := 20;
  
  -- Contar transações do mês atual
  SELECT COUNT(*) INTO transaction_count
  FROM public.transactions 
  WHERE user_id = user_id_param 
    AND EXTRACT(MONTH FROM date) = current_month 
    AND EXTRACT(YEAR FROM date) = current_year;
  
  -- Retornar se pode adicionar mais transações
  RETURN transaction_count < transaction_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
