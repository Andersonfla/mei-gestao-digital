-- Criar tabela para mensagens de contato público
CREATE TABLE public.mensagens_contato (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome_completo TEXT NOT NULL,
  email_contato TEXT NOT NULL,
  assunto TEXT NOT NULL,
  mensagem TEXT NOT NULL,
  data_recebimento TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'resolvido')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.mensagens_contato ENABLE ROW LEVEL SECURITY;

-- Qualquer pessoa pode inserir mensagens (formulário público)
CREATE POLICY "Qualquer um pode inserir mensagens de contato"
ON public.mensagens_contato
FOR INSERT
WITH CHECK (true);

-- Apenas admins podem visualizar mensagens
CREATE POLICY "Admins podem visualizar mensagens de contato"
ON public.mensagens_contato
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Apenas admins podem atualizar mensagens
CREATE POLICY "Admins podem atualizar mensagens de contato"
ON public.mensagens_contato
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Criar trigger para atualizar updated_at
CREATE TRIGGER update_mensagens_contato_updated_at
BEFORE UPDATE ON public.mensagens_contato
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();