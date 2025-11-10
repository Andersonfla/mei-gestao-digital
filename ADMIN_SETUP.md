# Configuração do Painel Administrativo

## Como adicionar o role de Admin

Para que o usuário `meifinancas@gmail.com` tenha acesso ao Painel Admin, você precisa adicionar o role `admin` manualmente via SQL Editor do Supabase.

### Passos:

1. **Acesse o SQL Editor do Supabase**
   - Abra seu projeto no Supabase Dashboard
   - Vá em: `SQL Editor` no menu lateral
   - Clique em `New Query`

2. **Execute o seguinte SQL:**

```sql
-- Adicionar role de admin ao usuário meifinancas@gmail.com
DO $$
DECLARE
  admin_user_id uuid;
BEGIN
  -- Buscar o user_id do usuário com email meifinancas@gmail.com
  SELECT au.id INTO admin_user_id 
  FROM auth.users au
  WHERE au.email = 'meifinancas@gmail.com'
  LIMIT 1;
  
  -- Se o usuário existir, adicionar o role admin
  IF admin_user_id IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (admin_user_id, 'admin'::app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
    
    RAISE NOTICE 'Role admin adicionado com sucesso ao usuário %', admin_user_id;
  ELSE
    RAISE NOTICE 'Usuário com email meifinancas@gmail.com não encontrado. Certifique-se de que o usuário está cadastrado.';
  END IF;
END $$;
```

3. **Clique em RUN** para executar o SQL

4. **Verifique o resultado:**
   - Se o usuário existir, você verá a mensagem: "Role admin adicionado com sucesso ao usuário [UUID]"
   - Se o usuário não existir, você verá: "Usuário com email meifinancas@gmail.com não encontrado"

5. **Faça login com o email meifinancas@gmail.com**
   - Após fazer login, você verá um botão "Painel Admin" na sidebar
   - Clique nele para acessar o Painel Administrativo

## Funcionalidades do Painel Admin

### 1. Dashboard Geral
- Total de usuários cadastrados
- Usuários por plano (Free vs Premium)
- Total de lançamentos
- Estatísticas financeiras

### 2. Gestão de Usuários
- Listar todos os usuários
- Buscar usuários por email ou nome
- Alterar plano de usuário (Free ↔ Premium)
- Excluir usuários

### 3. Gestão de Lançamentos
- Visualizar todos os lançamentos
- Filtrar por usuário, categoria ou descrição
- Excluir lançamentos

### 4. Logs de Auditoria
- Registro de todas as ações administrativas
- Histórico de alterações de planos
- Histórico de exclusões

## Segurança

- ✅ Acesso restrito apenas a usuários com role `admin` no banco de dados
- ✅ Verificação server-side usando Row Level Security (RLS)
- ✅ Todas as ações são registradas na tabela `admin_logs`
- ✅ Proteção contra acesso não autorizado com redirecionamento automático

## URLs

- **Painel Admin**: `/admin`
- **Dashboard Principal**: `/dashboard`

## Observações Importantes

1. **Primeiro Login**: O usuário precisa estar cadastrado e ter feito login pelo menos uma vez antes de adicionar o role admin.

2. **Múltiplos Admins**: Para adicionar mais administradores, execute o mesmo SQL substituindo o email:
   ```sql
   WHERE au.email = 'outro-admin@email.com'
   ```

3. **Remoção de Admin**: Para remover o acesso admin de um usuário:
   ```sql
   DELETE FROM public.user_roles 
   WHERE user_id = (
     SELECT id FROM auth.users WHERE email = 'meifinancas@gmail.com'
   ) 
   AND role = 'admin'::app_role;
   ```

4. **Verificar Admins Atuais**: Para listar todos os administradores:
   ```sql
   SELECT au.email, ur.role, ur.created_at
   FROM public.user_roles ur
   JOIN auth.users au ON au.id = ur.user_id
   WHERE ur.role = 'admin'::app_role;
   ```
