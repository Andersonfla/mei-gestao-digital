-- Políticas RLS para admins gerenciarem usuários na tabela profiles

-- Permitir que admins atualizem qualquer perfil
CREATE POLICY "Admins podem atualizar qualquer perfil"
ON public.profiles
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Permitir que admins excluam qualquer perfil
CREATE POLICY "Admins podem deletar qualquer perfil"
ON public.profiles
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Adicionar coluna de status para suspensão de contas (se não existir)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'profiles' 
                 AND column_name = 'status') THEN
    ALTER TABLE public.profiles 
    ADD COLUMN status text NOT NULL DEFAULT 'active';
  END IF;
END $$;