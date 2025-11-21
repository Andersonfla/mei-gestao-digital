-- Adicionar campos de avaliação à tabela support_conversations
ALTER TABLE public.support_conversations
ADD COLUMN rating INTEGER CHECK (rating >= 1 AND rating <= 5),
ADD COLUMN rating_comment TEXT,
ADD COLUMN rated_at TIMESTAMP WITH TIME ZONE;

-- Adicionar comentário nas colunas
COMMENT ON COLUMN public.support_conversations.rating IS 'Avaliação do atendimento (1-5 estrelas)';
COMMENT ON COLUMN public.support_conversations.rating_comment IS 'Comentário opcional do usuário sobre o atendimento';
COMMENT ON COLUMN public.support_conversations.rated_at IS 'Data e hora em que a avaliação foi feita';

-- Permitir que usuários atualizem apenas os campos de avaliação em suas próprias conversas
CREATE POLICY "Users can rate their own conversations"
ON public.support_conversations
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id AND status = 'closed')
WITH CHECK (auth.uid() = user_id);