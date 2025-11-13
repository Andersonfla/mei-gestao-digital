-- Função para excluir usuário completamente (profiles, user_roles e auth.users)
create or replace function public.delete_user_completely(target_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Verifica se quem está chamando é admin
  if not public.has_role(auth.uid(), 'admin'::app_role) then
    raise exception 'Apenas administradores podem excluir usuários';
  end if;

  -- Remove transações do usuário
  delete from public.transactions where user_id = target_user_id;
  
  -- Remove dados de limites
  delete from public.plan_limits where user_id = target_user_id;
  
  -- Remove tarefas
  delete from public.tasks where user_id = target_user_id;
  
  -- Remove metas financeiras
  delete from public.financial_goals where user_id = target_user_id;
  
  -- Remove transações recorrentes
  delete from public.recurring_transactions where user_id = target_user_id;
  
  -- Remove categorias personalizadas
  delete from public.categories where user_id = target_user_id;
  
  -- Remove roles do usuário
  delete from public.user_roles where user_id = target_user_id;
  
  -- Remove o perfil
  delete from public.profiles where id = target_user_id;
  
  -- Remove o usuário do Supabase Auth
  delete from auth.users where id = target_user_id;
end;
$$;

-- Garantir permissões corretas
revoke all on function public.delete_user_completely(uuid) from public;
grant execute on function public.delete_user_completely(uuid) to authenticated;