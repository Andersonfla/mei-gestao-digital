-- Habilitar extensões necessárias para cron jobs
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Garantir que o schema extensions existe
GRANT USAGE ON SCHEMA extensions TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA extensions TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA extensions TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA extensions TO postgres, anon, authenticated, service_role;

-- Configurar cron job para processar transações recorrentes diariamente às 00:05 (UTC)
SELECT cron.schedule(
  'process-recurring-transactions-daily',
  '5 0 * * *', -- Às 00:05 todos os dias
  $$
  SELECT
    net.http_post(
        url:='https://ucnajqoapngtearuafkv.supabase.co/functions/v1/process-recurring-transactions',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVjbmFqcW9hcG5ndGVhcnVhZmt2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDczNDE5NDMsImV4cCI6MjA2MjkxNzk0M30.RItktoPxnmNDb7icRk_G7HthZtZ6XgbgNS9SIuEAfuc"}'::jsonb,
        body:=concat('{"time": "', now(), '"}')::jsonb
    ) as request_id;
  $$
);