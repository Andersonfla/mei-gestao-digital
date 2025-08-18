-- Corrigir funções do banco de dados para incluir search_path (segurança)

-- Atualizar função can_add_transaction
CREATE OR REPLACE FUNCTION public.can_add_transaction(user_id_param uuid, transaction_date date DEFAULT CURRENT_DATE)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
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
$function$;

-- Atualizar função update_plan_limits_on_transaction
CREATE OR REPLACE FUNCTION public.update_plan_limits_on_transaction()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
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
$function$;

-- Atualizar função handle_new_user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$function$;

-- Atualizar função update_transaction_count
CREATE OR REPLACE FUNCTION public.update_transaction_count()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.profiles
    SET transaction_count = transaction_count + 1
    WHERE id = NEW.user_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.profiles
    SET transaction_count = transaction_count - 1
    WHERE id = OLD.user_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$function$;