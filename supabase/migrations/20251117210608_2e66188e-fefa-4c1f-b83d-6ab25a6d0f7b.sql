-- Criar tabela de conversas de suporte
CREATE TABLE public.support_conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_message_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de mensagens de suporte
CREATE TABLE public.support_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES public.support_conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  sent_by_admin BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.support_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_messages ENABLE ROW LEVEL SECURITY;

-- Políticas para support_conversations
-- Usuários podem ver suas próprias conversas
CREATE POLICY "Users can view their own conversations"
ON public.support_conversations FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Usuários podem criar suas próprias conversas
CREATE POLICY "Users can create their own conversations"
ON public.support_conversations FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Admins podem ver todas as conversas
CREATE POLICY "Admins can view all conversations"
ON public.support_conversations FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Admins podem atualizar conversas
CREATE POLICY "Admins can update conversations"
ON public.support_conversations FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Políticas para support_messages
-- Usuários podem ver mensagens de suas conversas
CREATE POLICY "Users can view messages in their conversations"
ON public.support_messages FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.support_conversations
    WHERE id = conversation_id AND user_id = auth.uid()
  )
);

-- Usuários podem criar mensagens em suas conversas
CREATE POLICY "Users can create messages in their conversations"
ON public.support_messages FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.support_conversations
    WHERE id = conversation_id AND user_id = auth.uid()
  ) AND sent_by_admin = false
);

-- Admins podem ver todas as mensagens
CREATE POLICY "Admins can view all messages"
ON public.support_messages FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Admins podem criar mensagens
CREATE POLICY "Admins can create messages"
ON public.support_messages FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role) AND sent_by_admin = true);

-- Trigger para atualizar updated_at e last_message_at
CREATE OR REPLACE FUNCTION update_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.support_conversations
  SET 
    updated_at = now(),
    last_message_at = now()
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_message_created
  AFTER INSERT ON public.support_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_timestamp();

-- Índices para performance
CREATE INDEX idx_support_conversations_user_id ON public.support_conversations(user_id);
CREATE INDEX idx_support_conversations_status ON public.support_conversations(status);
CREATE INDEX idx_support_messages_conversation_id ON public.support_messages(conversation_id);
CREATE INDEX idx_support_messages_created_at ON public.support_messages(created_at);